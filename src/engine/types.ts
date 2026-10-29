import { CardColor, CardDefinition } from '../types/card';

export type GameMode = 'ai' | 'pass_and_play';
export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface Player {
  id: string;
  name: string;
  isAI: boolean;
  hand: CardDefinition[];
  unoDeclared: boolean;
  avatar: string;
}

export type GameStatus =
  | 'idle'
  | 'playing'
  | 'awaiting_color_choice'
  | 'drawn_card_decision'
  | 'game_over';

export interface LogEntry {
  id: string;
  timestamp: number;
  text: string;
  type: 'play' | 'draw' | 'action' | 'uno' | 'system' | 'win';
  color?: CardColor;
}

export interface GameSettings {
  playerCount: number; // 2 to 4
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  direction: 1 | -1; // 1 = clockwise, -1 = counter-clockwise
  drawPile: CardDefinition[];
  discardPile: CardDefinition[];
  activeColor: CardColor; // Active color for matching (especially after Wild)
  status: GameStatus;
  winner: Player | null;
  pendingCard: CardDefinition | null; // Card played that requires color choice
  drawnCard: CardDefinition | null; // Card drawn in drawn_card_decision phase
  lastActionMessage: string;
  logs: LogEntry[];
  settings: GameSettings;
  turnCount: number;
}
