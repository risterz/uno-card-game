import crypto from 'crypto';
import { CardColor, CardDefinition } from '../src/types/card';
import { GameSettings, GameState } from '../src/engine/types';
import {
  createInitialGameState,
  playCard,
  drawCard,
  passTurn,
  declareUno,
  catchUno,
} from '../src/engine/game-state';
import { isCardPlayable } from '../src/engine/rules';
import {
  LobbyPlayer,
  PlayerPrivateView,
  PublicGameState,
  RoomStatus,
  ActionNotificationPayload,
} from '../src/types/multiplayer';

const CODE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[crypto.randomInt(0, CODE_CHARS.length)];
  }
  return code;
}

export function generateSessionToken(): string {
  return crypto.randomUUID();
}

export interface ServerPlayer {
  id: string;
  name: string;
  avatar: string;
  sessionToken: string;
  socketId: string | null;
  isHost: boolean;
  isConnected: boolean;
  isReady: boolean;
}

export interface GameRoom {
  code: string;
  hostId: string;
  status: RoomStatus;
  createdAt: number;
  lastActivity: number;
  players: ServerPlayer[];
  gameState: GameState | null;
}

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();
  private tokenToRoom: Map<string, { roomCode: string; playerId: string }> = new Map();

  /**
   * Create a new room with host player.
   */
  public createRoom(hostName: string, avatar?: string, socketId?: string): {
    room: GameRoom;
    player: ServerPlayer;
    token: string;
  } {
    let code = generateRoomCode();
    while (this.rooms.has(code)) {
      code = generateRoomCode();
    }

    const playerId = `p-${crypto.randomBytes(4).toString('hex')}`;
    const token = generateSessionToken();
    const defaultAvatars = ['👑', '🦊', '🐼', '🐯'];

    const hostPlayer: ServerPlayer = {
      id: playerId,
      name: hostName.trim().slice(0, 20) || 'Player 1',
      avatar: avatar || defaultAvatars[0],
      sessionToken: token,
      socketId: socketId || null,
      isHost: true,
      isConnected: true,
      isReady: true,
    };

    const room: GameRoom = {
      code,
      hostId: playerId,
      status: 'lobby',
      createdAt: Date.now(),
      lastActivity: Date.now(),
      players: [hostPlayer],
      gameState: null,
    };

    this.rooms.set(code, room);
    this.tokenToRoom.set(token, { roomCode: code, playerId });

    return { room, player: hostPlayer, token };
  }

  /**
   * Join an existing room by code.
   */
  public joinRoom(
    roomCode: string,
    playerName: string,
    avatar?: string,
    socketId?: string
  ): {
    room: GameRoom;
    player: ServerPlayer;
    token: string;
  } {
    const code = roomCode.toUpperCase().trim();
    const room = this.rooms.get(code);

    if (!room) {
      throw new Error('Room not found. Check the room code.');
    }

    if (room.status !== 'lobby') {
      throw new Error('Game already in progress in this room.');
    }

    if (room.players.length >= 4) {
      throw new Error('Room is full (maximum 4 players).');
    }

    const playerId = `p-${crypto.randomBytes(4).toString('hex')}`;
    const token = generateSessionToken();
    const defaultAvatars = ['👑', '🦊', '🐼', '🐯'];

    const newPlayer: ServerPlayer = {
      id: playerId,
      name: playerName.trim().slice(0, 20) || `Player ${room.players.length + 1}`,
      avatar: avatar || defaultAvatars[room.players.length % defaultAvatars.length],
      sessionToken: token,
      socketId: socketId || null,
      isHost: false,
      isConnected: true,
      isReady: false,
    };

    room.players.push(newPlayer);
    room.lastActivity = Date.now();
    this.tokenToRoom.set(token, { roomCode: code, playerId });

    return { room, player: newPlayer, token };
  }

  /**
   * Reconnect existing player using session token.
   */
  public reconnect(
    roomCode: string,
    sessionToken: string,
    socketId: string
  ): {
    room: GameRoom;
    player: ServerPlayer;
  } {
    const code = roomCode.toUpperCase().trim();
    const room = this.rooms.get(code);
    if (!room) {
      throw new Error('Room not found.');
    }

    const player = room.players.find(p => p.sessionToken === sessionToken);
    if (!player) {
      throw new Error('Invalid session token for this room.');
    }

    player.socketId = socketId;
    player.isConnected = true;
    room.lastActivity = Date.now();

    return { room, player };
  }

  /**
   * Mark player disconnected.
   */
  public handleDisconnect(socketId: string): {
    room: GameRoom;
    player: ServerPlayer;
  } | null {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player) {
        player.isConnected = false;
        player.socketId = null;
        room.lastActivity = Date.now();
        return { room, player };
      }
    }
    return null;
  }

  public getRoom(roomCode: string): GameRoom | undefined {
    return this.rooms.get(roomCode.toUpperCase().trim());
  }

  public getPlayerBySocket(socketId: string): { room: GameRoom; player: ServerPlayer } | null {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player) return { room, player };
    }
    return null;
  }

  /**
   * Toggle player ready status in lobby.
   */
  public toggleReady(roomCode: string, playerId: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'lobby') return false;
    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;
    player.isReady = !player.isReady;
    room.lastActivity = Date.now();
    return player.isReady;
  }

  /**
   * Start a multiplayer match (host only, 2-4 players).
   */
  public startGame(roomCode: string, hostPlayerId: string): GameRoom {
    const room = this.getRoom(roomCode);
    if (!room) throw new Error('Room not found.');
    if (room.hostId !== hostPlayerId) throw new Error('Only the host can start the game.');
    if (room.status !== 'lobby') throw new Error('Game already started.');
    if (room.players.length < 2) throw new Error('Need at least 2 players to start.');
    if (room.players.length > 4) throw new Error('Maximum 4 players allowed.');

    const settings: GameSettings = {
      playerCount: room.players.length,
      gameMode: 'pass_and_play',
      aiDifficulty: 'medium',
    };

    // Use authoritative game-state engine
    const initialGameState = createInitialGameState(settings);

    // Map server players into game engine player identities
    initialGameState.players = room.players.map((sp, idx) => ({
      id: sp.id,
      name: sp.name,
      avatar: sp.avatar,
      isAI: false,
      hand: initialGameState.players[idx].hand,
      unoDeclared: false,
    }));

    initialGameState.lastActionMessage = `Turn: ${initialGameState.players[0].name}`;
    room.gameState = initialGameState;
    room.status = 'playing';
    room.lastActivity = Date.now();

    return room;
  }

  /**
   * Authoritative move: Play Card.
   */
  public playCard(
    roomCode: string,
    playerId: string,
    cardId: string,
    chosenColor?: CardColor
  ): {
    notification?: ActionNotificationPayload;
    winner?: { id: string; name: string; avatar: string; score: number };
  } {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState) throw new Error('Active game not found.');
    if (room.status !== 'playing') throw new Error('Game is not in playing state.');

    const gs = room.gameState;
    const activePlayer = gs.players[gs.currentPlayerIndex];
    if (activePlayer.id !== playerId) {
      throw new Error("Not your turn!");
    }

    const card = activePlayer.hand.find(c => c.id === cardId);
    if (!card && gs.status !== 'awaiting_color_choice') {
      throw new Error("Card not found in your hand.");
    }

    const topDiscard = gs.discardPile[gs.discardPile.length - 1];
    if (card && !isCardPlayable(card, topDiscard, gs.activeColor) && gs.status !== 'awaiting_color_choice') {
      throw new Error("Illegal card play: card does not match active color or value.");
    }

    const victimIndex =
      (gs.currentPlayerIndex + gs.direction * 1 + gs.players.length) % gs.players.length;
    const victim = gs.players[victimIndex];

    let notification: ActionNotificationPayload | undefined;
    const playedCard = card || gs.pendingCard;

    if (playedCard) {
      if (playedCard.value === 'skip') {
        notification = { type: 'skip', sourcePlayerName: activePlayer.name, targetPlayerName: victim.name };
      } else if (playedCard.value === 'reverse') {
        notification = { type: 'reverse', sourcePlayerName: activePlayer.name };
      } else if (playedCard.value === 'draw2') {
        notification = { type: 'draw2', sourcePlayerName: activePlayer.name, targetPlayerName: victim.name };
      } else if (playedCard.value === 'wild' && chosenColor) {
        notification = { type: 'wild', sourcePlayerName: activePlayer.name, chosenColor };
      } else if (playedCard.value === 'wild_draw4' && chosenColor) {
        notification = { type: 'wild_draw4', sourcePlayerName: activePlayer.name, targetPlayerName: victim.name, chosenColor };
      }
    }

    // Apply authoritative state transition
    room.gameState = playCard(gs, playerId, cardId, chosenColor);
    room.lastActivity = Date.now();

    if (room.gameState.status === 'game_over' && room.gameState.winner) {
      room.status = 'game_over';
      const w = room.gameState.winner;
      return {
        notification,
        winner: { id: w.id, name: w.name, avatar: w.avatar, score: 50 },
      };
    }

    return { notification };
  }

  /**
   * Authoritative move: Choose Wild Color.
   */
  public chooseColor(
    roomCode: string,
    playerId: string,
    color: CardColor
  ): {
    notification?: ActionNotificationPayload;
    winner?: { id: string; name: string; avatar: string; score: number };
  } {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState) throw new Error('Active game not found.');
    const gs = room.gameState;

    if (gs.status !== 'awaiting_color_choice' || !gs.pendingCard) {
      throw new Error('Game is not awaiting color choice.');
    }

    const activePlayer = gs.players[gs.currentPlayerIndex];
    if (activePlayer.id !== playerId) {
      throw new Error('Not your turn to choose color.');
    }

    const validColors: CardColor[] = ['red', 'blue', 'green', 'yellow'];
    if (!validColors.includes(color)) {
      throw new Error('Invalid color choice.');
    }

    return this.playCard(roomCode, playerId, gs.pendingCard.id, color);
  }

  /**
   * Authoritative move: Draw Card.
   */
  public drawCard(roomCode: string, playerId: string): void {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState) throw new Error('Active game not found.');
    if (room.status !== 'playing') throw new Error('Game is not in playing state.');

    const gs = room.gameState;
    const activePlayer = gs.players[gs.currentPlayerIndex];
    if (activePlayer.id !== playerId) {
      throw new Error("Not your turn!");
    }

    room.gameState = drawCard(gs, playerId);
    room.lastActivity = Date.now();
  }

  /**
   * Authoritative move: Pass Turn (after drawn unplayed card).
   */
  public passTurn(roomCode: string, playerId: string): void {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState) throw new Error('Active game not found.');

    const gs = room.gameState;
    if (gs.status !== 'drawn_card_decision') {
      throw new Error('Cannot pass turn at this time.');
    }

    const activePlayer = gs.players[gs.currentPlayerIndex];
    if (activePlayer.id !== playerId) {
      throw new Error("Not your turn!");
    }

    room.gameState = passTurn(gs, playerId);
    room.lastActivity = Date.now();
  }

  /**
   * Authoritative move: Declare UNO.
   */
  public declareUno(roomCode: string, playerId: string): { notification: ActionNotificationPayload } {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState) throw new Error('Active game not found.');

    const gs = room.gameState;
    const player = gs.players.find(p => p.id === playerId);
    if (!player) throw new Error('Player not in game.');

    if (player.hand.length > 2) {
      throw new Error('Cannot shout UNO with more than 2 cards.');
    }

    room.gameState = declareUno(gs, playerId);
    room.lastActivity = Date.now();

    return {
      notification: { type: 'uno', sourcePlayerName: player.name },
    };
  }

  /**
   * Authoritative move: Catch UNO.
   */
  public catchUno(
    roomCode: string,
    catcherId: string,
    targetPlayerId: string
  ): { notification: ActionNotificationPayload } {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState) throw new Error('Active game not found.');

    const gs = room.gameState;
    const target = gs.players.find(p => p.id === targetPlayerId);
    if (!target) throw new Error('Target player not found.');

    if (target.hand.length !== 1 || target.unoDeclared) {
      throw new Error('Target cannot be caught: either does not have 1 card or already declared UNO.');
    }

    const catcher = gs.players.find(p => p.id === catcherId);
    room.gameState = catchUno(gs, catcherId, targetPlayerId);
    room.lastActivity = Date.now();

    return {
      notification: {
        type: 'caught_uno',
        sourcePlayerName: catcher?.name,
        targetPlayerName: target.name,
      },
    };
  }

  /**
   * Request Rematch (restart game with same players).
   */
  public requestRematch(roomCode: string, playerId: string): GameRoom {
    const room = this.getRoom(roomCode);
    if (!room) throw new Error('Room not found.');
    if (room.status !== 'game_over') throw new Error('Game is not over.');

    return this.startGame(roomCode, playerId);
  }

  /**
   * Leave room.
   */
  public leaveRoom(roomCode: string, playerId: string): { roomDestroyed: boolean; newHostId?: string } {
    const room = this.getRoom(roomCode);
    if (!room) return { roomDestroyed: true };

    room.players = room.players.filter(p => p.id !== playerId);
    if (room.players.length === 0) {
      this.rooms.delete(room.code);
      return { roomDestroyed: true };
    }

    // Pass host if host left
    if (room.hostId === playerId) {
      room.players[0].isHost = true;
      room.hostId = room.players[0].id;
    }

    // If game was playing and now fewer than 2 players, set back to lobby
    if (room.status === 'playing' && room.players.length < 2) {
      room.status = 'lobby';
      room.gameState = null;
    }

    return { roomDestroyed: false, newHostId: room.hostId };
  }

  /**
   * Build sanitized public game state (ZERO opponent cards leaked).
   */
  public getPublicState(room: GameRoom): PublicGameState {
    const lobbyPlayers: LobbyPlayer[] = room.players.map(sp => {
      const pInGame = room.gameState?.players.find(p => p.id === sp.id);
      return {
        id: sp.id,
        name: sp.name,
        avatar: sp.avatar,
        isHost: sp.isHost,
        isConnected: sp.isConnected,
        isReady: sp.isReady,
        cardCount: pInGame ? pInGame.hand.length : 0,
        unoDeclared: pInGame ? pInGame.unoDeclared : false,
      };
    });

    const gs = room.gameState;
    const topDiscard = gs && gs.discardPile.length > 0 ? gs.discardPile[gs.discardPile.length - 1] : null;

    return {
      roomCode: room.code,
      hostId: room.hostId,
      status: room.status,
      players: lobbyPlayers,
      currentPlayerIndex: gs ? gs.currentPlayerIndex : 0,
      direction: gs ? gs.direction : 1,
      activeColor: gs ? gs.activeColor : 'red',
      topDiscard,
      discardPileCount: gs ? gs.discardPile.length : 0,
      drawPileCount: gs ? gs.drawPile.length : 0,
      gameStatus: gs ? gs.status : 'idle',
      pendingCard: gs ? gs.pendingCard : null,
      winner: gs && gs.winner ? { id: gs.winner.id, name: gs.winner.name, avatar: gs.winner.avatar, score: 50 } : null,
      lastActionMessage: gs ? gs.lastActionMessage : 'Waiting in lobby...',
      logs: gs ? gs.logs : [],
      turnCount: gs ? gs.turnCount : 0,
    };
  }

  /**
   * Build private view for a specific player (their cards ONLY).
   */
  public getPrivateView(room: GameRoom, playerId: string): PlayerPrivateView {
    const sp = room.players.find(p => p.id === playerId);
    if (!sp) throw new Error('Player not in room.');

    const pInGame = room.gameState?.players.find(p => p.id === playerId);
    const myHand: CardDefinition[] = pInGame ? pInGame.hand : [];

    // Drawn card decision only exposed if this player is the active player
    const isCurrent = room.gameState && room.gameState.players[room.gameState.currentPlayerIndex]?.id === playerId;
    const drawnCard = isCurrent && room.gameState?.status === 'drawn_card_decision' ? room.gameState.drawnCard : null;

    return {
      myPlayerId: playerId,
      sessionToken: sp.sessionToken,
      myHand,
      drawnCard,
      publicState: this.getPublicState(room),
    };
  }
}
