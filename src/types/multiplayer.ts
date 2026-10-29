import { CardColor, CardDefinition } from './card';
import { GameStatus, LogEntry } from '../engine/types';

export type RoomStatus = 'lobby' | 'playing' | 'game_over';

export interface LobbyPlayer {
  id: string; // unique player ID (e.g., p1, p2 or uuid)
  name: string;
  avatar: string;
  isHost: boolean;
  isConnected: boolean;
  isReady: boolean;
  cardCount: number;
  unoDeclared: boolean;
}

export interface PublicGameState {
  roomCode: string;
  hostId: string;
  status: RoomStatus;
  players: LobbyPlayer[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  activeColor: CardColor;
  topDiscard: CardDefinition | null;
  discardPileCount: number;
  drawPileCount: number;
  gameStatus: GameStatus; // 'playing' | 'awaiting_color_choice' | 'drawn_card_decision' | 'game_over'
  pendingCard: CardDefinition | null;
  winner: { id: string; name: string; avatar: string; score: number } | null;
  lastActionMessage: string;
  logs: LogEntry[];
  turnCount: number;
}

export interface PlayerPrivateView {
  myPlayerId: string;
  sessionToken: string;
  myHand: CardDefinition[];
  drawnCard: CardDefinition | null; // Only populated for the current player during drawn_card_decision
  publicState: PublicGameState;
}

export interface ActionNotificationPayload {
  type: 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild_draw4' | 'uno' | 'caught_uno';
  sourcePlayerName?: string;
  targetPlayerName?: string;
  chosenColor?: CardColor;
}

export interface CreateRoomRequest {
  playerName: string;
  avatar?: string;
}

export interface JoinRoomRequest {
  roomCode: string;
  playerName: string;
  avatar?: string;
}

export interface ReconnectSessionRequest {
  roomCode: string;
  sessionToken: string;
}

export interface PlayCardRequest {
  cardId: string;
  chosenColor?: CardColor;
}

export interface ChooseColorRequest {
  color: CardColor;
}

export interface CatchUnoRequest {
  targetPlayerId: string;
}
