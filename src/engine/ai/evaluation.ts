import { CardColor, CardDefinition } from '../../types/card';
import { GameState } from '../types';
import { getNextPlayerIndex } from '../rules';
import { getCardScore } from '../../data/deck';
import { AIEvaluationWeights } from './types';

export const COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow'];

export const MEDIUM_WEIGHTS: AIEvaluationWeights = {
  handSizeWeight: 30,
  unoProximityBonus: 75,
  colorConcentrationWeight: 18,
  activeColorMatchWeight: 22,
  actionCardHoldWeight: 12,
  wildValueWeight: 25,
  wildPlayConservationPenalty: 40,
  nextPlayerThreatWeight: 65,
  penaltyRiskWeight: 0.8,
};

export const HARD_WEIGHTS: AIEvaluationWeights = {
  handSizeWeight: 45,
  unoProximityBonus: 160,
  colorConcentrationWeight: 35,
  activeColorMatchWeight: 42,
  actionCardHoldWeight: 28,
  wildValueWeight: 50,
  wildPlayConservationPenalty: 75,
  nextPlayerThreatWeight: 150,
  penaltyRiskWeight: 2.5,
};

/**
 * Counts cards by color in a hand.
 */
export function countCardsByColor(hand: CardDefinition[]): Record<CardColor, number> {
  const counts: Record<CardColor, number> = {
    red: 0,
    blue: 0,
    green: 0,
    yellow: 0,
    wild: 0,
  };
  for (const card of hand) {
    counts[card.color]++;
  }
  return counts;
}

/**
 * Returns the best non-wild color for an AI's hand based on card frequency.
 */
export function getBestColorForHand(hand: CardDefinition[]): CardColor {
  const counts = countCardsByColor(hand);
  let bestColor: CardColor = 'red';
  let maxCount = -1;

  for (const color of COLORS) {
    if (counts[color] > maxCount) {
      maxCount = counts[color];
      bestColor = color;
    }
  }

  return bestColor;
}

/**
 * Evaluates a game state from the perspective of an AI player.
 * Uses only public information (own hand, discard pile, active color, opponent hand sizes).
 */
export function evaluateState(
  state: GameState,
  aiPlayerId: string,
  weights: AIEvaluationWeights
): number {
  const ai = state.players.find(p => p.id === aiPlayerId);
  if (!ai) return -10000;

  // 1. Terminal win / lose check
  if (state.status === 'game_over') {
    if (state.winner?.id === aiPlayerId) return 100000;
    return -100000;
  }

  let score = 0;

  // 2. Hand Size & Tempo (fewer cards is substantially better)
  const handSize = ai.hand.length;
  score += (10 - handSize) * weights.handSizeWeight;
  if (handSize === 1) {
    score += weights.unoProximityBonus;
  }

  // 3. Color Concentration & Dominance
  const counts = countCardsByColor(ai.hand);
  const nonWildTotal = handSize - counts.wild;
  const maxSuitCount = Math.max(counts.red, counts.blue, counts.green, counts.yellow);

  if (nonWildTotal > 0) {
    const concentrationRatio = maxSuitCount / nonWildTotal;
    score += concentrationRatio * weights.colorConcentrationWeight;
  }

  // 4. Active Color Match Potential
  const activeColorMatches = counts[state.activeColor] || 0;
  score += activeColorMatches * weights.activeColorMatchWeight;

  // 5. Action Cards Utility
  const actionCardCount = ai.hand.filter(c =>
    c.value === 'skip' || c.value === 'reverse' || c.value === 'draw2' || c.value === 'wild_draw4'
  ).length;
  score += actionCardCount * weights.actionCardHoldWeight;

  // 6. Wild Card Value
  score += counts.wild * weights.wildValueWeight;

  // 7. Opponent Threat Assessment (based strictly on publicly visible hand lengths)
  const opponents = state.players.filter(p => p.id !== aiPlayerId);
  if (opponents.length > 0) {
    const nextPlayerIndex = getNextPlayerIndex(state.currentPlayerIndex, state.direction, state.players.length, 1);
    const nextPlayer = state.players[nextPlayerIndex];

    if (nextPlayer.id !== aiPlayerId) {
      const nextHandLen = nextPlayer.hand.length;
      if (nextHandLen <= 2) {
        score -= (3 - nextHandLen) * weights.nextPlayerThreatWeight;
      }
      if (nextHandLen === 1) {
        score -= 150; // Critical danger of next player winning
      }
    }

    const minOppHand = Math.min(...opponents.map(o => o.hand.length));
    if (minOppHand <= 2) {
      // Penalty risk: holding high-point cards when an opponent is close to winning
      const totalPoints = ai.hand.reduce((sum, c) => sum + getCardScore(c.value), 0);
      score -= totalPoints * weights.penaltyRiskWeight;
    }
  }

  return score;
}

/**
 * Calculates unseen card distribution for Hard AI modeling.
 * Visible cards = AI hand + discard pile.
 * Never accesses opponents' hidden cards!
 */
export function getUnseenCardCounts(
  aiHand: CardDefinition[],
  discardPile: CardDefinition[]
): { totalUnseen: number; colorCounts: Record<CardColor, number> } {
  // Official UNO 108 deck color count: Red (25), Blue (25), Green (25), Yellow (25), Wild (8)
  const totalDeckCounts: Record<CardColor, number> = {
    red: 25,
    blue: 25,
    green: 25,
    yellow: 25,
    wild: 8,
  };

  const visibleCounts: Record<CardColor, number> = {
    red: 0,
    blue: 0,
    green: 0,
    yellow: 0,
    wild: 0,
  };

  for (const card of aiHand) {
    visibleCounts[card.color]++;
  }
  for (const card of discardPile) {
    visibleCounts[card.color]++;
  }

  const colorCounts: Record<CardColor, number> = {
    red: Math.max(0, totalDeckCounts.red - visibleCounts.red),
    blue: Math.max(0, totalDeckCounts.blue - visibleCounts.blue),
    green: Math.max(0, totalDeckCounts.green - visibleCounts.green),
    yellow: Math.max(0, totalDeckCounts.yellow - visibleCounts.yellow),
    wild: Math.max(0, totalDeckCounts.wild - visibleCounts.wild),
  };

  const totalUnseen = colorCounts.red + colorCounts.blue + colorCounts.green + colorCounts.yellow + colorCounts.wild;

  return { totalUnseen, colorCounts };
}
