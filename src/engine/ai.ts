import { GameState, Player, AIDifficulty } from './types';
import { AIMove, AIStrategy } from './ai/types';
import { EasyAIStrategy } from './ai/easy';
import { MediumAIStrategy } from './ai/medium';
import { HardAIStrategy } from './ai/hard';
import { getBestColorForHand } from './ai/evaluation';

export * from './ai/types';
export * from './ai/evaluation';
export * from './ai/easy';
export * from './ai/medium';
export * from './ai/hard';

export const easyAI = new EasyAIStrategy();
export const mediumAI = new MediumAIStrategy();
export const hardAI = new HardAIStrategy();

/**
 * Returns the appropriate AIStrategy instance for the given difficulty.
 */
export function getStrategy(difficulty: AIDifficulty): AIStrategy {
  switch (difficulty) {
    case 'easy':
      return easyAI;
    case 'hard':
      return hardAI;
    case 'medium':
    default:
      return mediumAI;
  }
}

/**
 * Computes the best move for the active AI player using their configured difficulty strategy.
 */
export function computeAIMove(state: GameState, rng = Math.random): AIMove {
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer || !currentPlayer.isAI) {
    return { type: 'draw' };
  }

  const strategy = getStrategy(state.settings.aiDifficulty);
  return strategy.chooseAction(state, currentPlayer.id, rng);
}

/**
 * Convenience runner for Easy AI move computation.
 */
export function computeEasyMove(state: GameState, aiPlayerId?: string, rng = Math.random): AIMove {
  const id = aiPlayerId || state.players[state.currentPlayerIndex]?.id || '';
  return easyAI.chooseAction(state, id, rng);
}

/**
 * Convenience runner for Medium AI move computation.
 */
export function computeMediumMove(state: GameState, aiPlayerId?: string, rng = Math.random): AIMove {
  const id = aiPlayerId || state.players[state.currentPlayerIndex]?.id || '';
  return mediumAI.chooseAction(state, id, rng);
}

/**
 * Convenience runner for Hard AI move computation.
 */
export function computeHardMove(state: GameState, aiPlayerId?: string, rng = Math.random): AIMove {
  const id = aiPlayerId || state.players[state.currentPlayerIndex]?.id || '';
  return hardAI.chooseAction(state, id, rng);
}

/**
 * Checks if the AI should catch any opponent who forgot to declare UNO based on difficulty.
 */
export function findOpponentToCatchUno(
  state: GameState,
  aiPlayerId: string,
  rng = Math.random
): Player | null {
  const ai = state.players.find(p => p.id === aiPlayerId);
  if (!ai || !ai.isAI) return null;

  const strategy = getStrategy(state.settings.aiDifficulty);
  return strategy.shouldCatchUno(state, aiPlayerId, rng);
}

export { getBestColorForHand };
