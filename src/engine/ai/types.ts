import { CardColor, CardDefinition } from '../../types/card';
import { GameState, AIDifficulty, Player } from '../types';

export interface AIMove {
  type: 'play' | 'draw' | 'pass';
  cardId?: string;
  chosenColor?: CardColor;
  shouldDeclareUno?: boolean;
  reasoning?: string;
}

export interface LegalAction {
  type: 'play' | 'draw' | 'pass';
  card?: CardDefinition;
  chosenColor?: CardColor;
}

export interface AIEvaluationWeights {
  handSizeWeight: number;
  unoProximityBonus: number;
  colorConcentrationWeight: number;
  activeColorMatchWeight: number;
  actionCardHoldWeight: number;
  wildValueWeight: number;
  wildPlayConservationPenalty: number;
  nextPlayerThreatWeight: number;
  penaltyRiskWeight: number;
}

export interface AIStrategy {
  difficulty: AIDifficulty;
  chooseAction(state: GameState, aiPlayerId: string, rng?: () => number): AIMove;
  shouldCatchUno(state: GameState, aiPlayerId: string, rng?: () => number): Player | null;
}
