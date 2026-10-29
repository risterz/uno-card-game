import { CardColor, CardDefinition } from '../types/card';
import { getCardScore } from '../data/deck';

/**
 * Validates if a card can be legally played onto the current discard pile.
 * 
 * Rules:
 * 1. Wild cards ('wild', 'wild_draw4') can always be played.
 * 2. Color matches the currently active color (which may be set by a previous Wild).
 * 3. Face value matches the top discard card's face value (e.g. '7' matches '7', 'skip' matches 'skip').
 */
export function isCardPlayable(
  card: CardDefinition,
  topDiscard: CardDefinition | null,
  activeColor: CardColor
): boolean {
  // If top card is null (should not happen in normal play), any card is playable
  if (!topDiscard) return true;

  // Wild cards are universally playable
  if (card.color === 'wild' || card.value === 'wild' || card.value === 'wild_draw4') {
    return true;
  }

  // Matching active color
  if (card.color === activeColor) {
    return true;
  }

  // Matching face value (numbers, skip, reverse, draw2)
  if (card.value === topDiscard.value) {
    return true;
  }

  return false;
}

/**
 * Returns all playable cards from a player's hand.
 */
export function getPlayableCards(
  hand: CardDefinition[],
  topDiscard: CardDefinition | null,
  activeColor: CardColor
): CardDefinition[] {
  return hand.filter(card => isCardPlayable(card, topDiscard, activeColor));
}

/**
 * Computes the next player index taking into account direction and step size.
 */
export function getNextPlayerIndex(
  currentIndex: number,
  direction: 1 | -1,
  playerCount: number,
  step = 1
): number {
  const delta = direction * step;
  const next = (currentIndex + delta) % playerCount;
  const normalized = next >= 0 ? next : next + playerCount;
  return normalized === 0 ? 0 : normalized;
}

/**
 * Computes round/match score for the winner based on remaining cards in opponents' hands.
 */
export function calculateRoundScore(losingHands: CardDefinition[][]): number {
  let score = 0;
  for (const hand of losingHands) {
    for (const card of hand) {
      score += getCardScore(card.value);
    }
  }
  return score;
}
