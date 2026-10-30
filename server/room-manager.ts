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
export const ONLINE_TURN_TIMEOUT_SECONDS = 20;

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

export interface ServerSpectator {
  id: string;
  name: string;
  avatar: string;
  sessionToken: string;
  socketId: string | null;
  isConnected: boolean;
}

export const ALLOWED_EMOTES = ['😂', '🔥', '💀', 'GG', '🎉', '👍', '😱', '👋', '💩', '❤️', '👏', '👀'];

export function isValidEmote(emote: string): boolean {
  return typeof emote === 'string' && ALLOWED_EMOTES.includes(emote.trim());
}

export interface GameRoom {
  code: string;
  hostId: string;
  status: RoomStatus;
  createdAt: number;
  lastActivity: number;
  players: ServerPlayer[];
  spectators: ServerSpectator[];
  gameState: GameState | null;
  turnExpiresAt: number | null;
  turnTimer: NodeJS.Timeout | null;
}

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();
  private tokenToRoom: Map<string, { roomCode: string; playerId: string }> = new Map();
  private onTurnTimeoutCallback: ((room: GameRoom) => void) | null = null;

  public setOnTurnTimeoutCallback(cb: (room: GameRoom) => void): void {
    this.onTurnTimeoutCallback = cb;
  }

  public resetTurnTimer(room: GameRoom): void {
    this.clearTurnTimer(room);
    if (room.status !== 'playing' || !room.gameState || room.gameState.status === 'game_over') {
      room.turnExpiresAt = null;
      return;
    }

    room.turnExpiresAt = Date.now() + ONLINE_TURN_TIMEOUT_SECONDS * 1000;
    room.turnTimer = setTimeout(() => {
      this.handleTurnTimeout(room.code);
    }, ONLINE_TURN_TIMEOUT_SECONDS * 1000);
  }

  public clearTurnTimer(room: GameRoom): void {
    if (room.turnTimer) {
      clearTimeout(room.turnTimer);
      room.turnTimer = null;
    }
    room.turnExpiresAt = null;
  }

  public handleTurnTimeout(roomCode: string): void {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState || room.status !== 'playing') {
      return;
    }

    const gs = room.gameState;
    const activePlayer = gs.players[gs.currentPlayerIndex];
    if (!activePlayer) return;

    if (gs.status === 'awaiting_color_choice') {
      const counts: Record<CardColor, number> = { red: 0, blue: 0, green: 0, yellow: 0, wild: 0 };
      for (const c of activePlayer.hand) {
        if (c.color !== 'wild') counts[c.color]++;
      }
      const colors: CardColor[] = ['red', 'blue', 'green', 'yellow'];
      let bestColor: CardColor = 'red';
      let max = -1;
      for (const col of colors) {
        if (counts[col] > max) {
          max = counts[col];
          bestColor = col;
        }
      }
      try {
        this.chooseColor(roomCode, activePlayer.id, bestColor);
      } catch {
        // Fallback
      }
    } else if (gs.status === 'drawn_card_decision') {
      try {
        this.passTurn(roomCode, activePlayer.id);
      } catch {
        // Fallback
      }
    } else if (gs.status === 'playing') {
      try {
        this.drawCard(roomCode, activePlayer.id);
        if (room.gameState.status === 'drawn_card_decision') {
          this.passTurn(roomCode, activePlayer.id);
        }
      } catch {
        // Fallback
      }
    }

    if (room.gameState) {
      room.gameState.lastActionMessage = `⏰ ${activePlayer.name}'s round timed out!`;
    }

    if (this.onTurnTimeoutCallback) {
      this.onTurnTimeoutCallback(room);
    }
  }

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
      spectators: [],
      gameState: null,
      turnExpiresAt: null,
      turnTimer: null,
    };

    this.rooms.set(code, room);
    this.tokenToRoom.set(token, { roomCode: code, playerId });

    return { room, player: hostPlayer, token };
  }

  /**
   * Join an existing room by code (as player or spectator).
   */
  public joinRoom(
    roomCode: string,
    playerName: string,
    avatar?: string,
    socketId?: string,
    isSpectator?: boolean
  ): {
    room: GameRoom;
    player: ServerPlayer | ServerSpectator;
    token: string;
    isSpectator?: boolean;
  } {
    const code = roomCode.toUpperCase().trim();
    const room = this.rooms.get(code);

    if (!room) {
      throw new Error('Room not found. Check the room code.');
    }

    if (!room.spectators) {
      room.spectators = [];
    }

    // Spectators can join at ANY stage without player limits
    if (isSpectator) {
      const spectatorId = `spec-${crypto.randomBytes(4).toString('hex')}`;
      const token = generateSessionToken();
      const spectator: ServerSpectator = {
        id: spectatorId,
        name: playerName.trim().slice(0, 20) || `Spectator ${room.spectators.length + 1}`,
        avatar: avatar || '👁️',
        sessionToken: token,
        socketId: socketId || null,
        isConnected: true,
      };

      room.spectators.push(spectator);
      this.tokenToRoom.set(token, { roomCode: code, playerId: spectatorId });
      room.lastActivity = Date.now();

      return { room, player: spectator, token, isSpectator: true };
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
   * Reconnect existing player or spectator using session token.
   */
  public reconnect(
    roomCode: string,
    sessionToken: string,
    socketId: string
  ): {
    room: GameRoom;
    player: ServerPlayer | ServerSpectator;
    isSpectator?: boolean;
  } {
    const code = roomCode.toUpperCase().trim();
    const room = this.rooms.get(code);
    if (!room) {
      throw new Error('Room not found.');
    }

    const player = room.players.find(p => p.sessionToken === sessionToken);
    if (player) {
      player.socketId = socketId;
      player.isConnected = true;
      room.lastActivity = Date.now();
      return { room, player, isSpectator: false };
    }

    const spectator = (room.spectators || []).find(s => s.sessionToken === sessionToken);
    if (spectator) {
      spectator.socketId = socketId;
      spectator.isConnected = true;
      room.lastActivity = Date.now();
      return { room, player: spectator, isSpectator: true };
    }

    throw new Error('Invalid session token for this room.');
  }

  /**
   * Mark player or spectator disconnected.
   */
  public handleDisconnect(socketId: string): {
    room: GameRoom;
    player: ServerPlayer | ServerSpectator;
    isSpectator?: boolean;
  } | null {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player) {
        player.isConnected = false;
        player.socketId = null;
        room.lastActivity = Date.now();
        return { room, player, isSpectator: false };
      }
      const spectator = (room.spectators || []).find(s => s.socketId === socketId);
      if (spectator) {
        spectator.isConnected = false;
        spectator.socketId = null;
        room.lastActivity = Date.now();
        return { room, player: spectator, isSpectator: true };
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
    this.resetTurnTimer(room);

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
      this.clearTurnTimer(room);
      const w = room.gameState.winner;
      return {
        notification,
        winner: { id: w.id, name: w.name, avatar: w.avatar, score: 50 },
      };
    }

    this.resetTurnTimer(room);
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
    this.resetTurnTimer(room);
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
    this.resetTurnTimer(room);
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

    // Check if a spectator is leaving
    if (room.spectators && room.spectators.some(s => s.id === playerId)) {
      room.spectators = room.spectators.filter(s => s.id !== playerId);
      return { roomDestroyed: false, newHostId: room.hostId };
    }

    room.players = room.players.filter(p => p.id !== playerId);
    if (room.players.length === 0) {
      this.clearTurnTimer(room);
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
      this.clearTurnTimer(room);
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
    const activeSpectators = (room.spectators || []).filter(s => s.isConnected).length;

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
      turnTimeoutSeconds: ONLINE_TURN_TIMEOUT_SECONDS,
      turnExpiresAt: room.status === 'playing' ? room.turnExpiresAt : null,
      serverTime: Date.now(),
      spectatorCount: activeSpectators,
    };
  }

  /**
   * Build private view for a specific player or spectator (their cards ONLY).
   */
  public getPrivateView(room: GameRoom, playerId: string): PlayerPrivateView {
    // Check if spectator
    const spectator = (room.spectators || []).find(s => s.id === playerId);
    if (spectator) {
      return {
        myPlayerId: spectator.id,
        sessionToken: spectator.sessionToken,
        myHand: [],
        drawnCard: null,
        publicState: this.getPublicState(room),
        isSpectator: true,
      };
    }

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
      isSpectator: false,
    };
  }
}
