import { CardColor, CardDefinition } from '../types/card';
import { getCardScore } from '../data/deck';
import { HouseRules } from './types';

/**
 * Validates if a card can be legally played onto the current discard pile.
 * 
 * Rules:
 * 1. Stacking: If pendingDrawCount > 0, only matching stacking draw cards can be played (+2 on +2, +4 on +4).
 * 2. Wild cards ('wild', 'wild_draw4') can always be played when not locked by a +2 stack.
 * 3. Color matches active color.
 * 4. Face value matches top discard face value.
 */
export function isCardPlayable(
  card: CardDefinition,
  topDiscard: CardDefinition | null,
  activeColor: CardColor,
  pendingDrawCount = 0
): boolean {
  // If top card is null (should not happen in normal play), any card is playable
  if (!topDiscard) return true;

  // Stacking rule: when pendingDrawCount > 0, player can ONLY stack draw cards
  if (pendingDrawCount > 0) {
    if (topDiscard.value === 'draw2') {
      return card.value === 'draw2' || card.value === 'wild_draw4';
    }
    if (topDiscard.value === 'wild_draw4') {
      return card.value === 'wild_draw4';
    }
    return false;
  }

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
  activeColor: CardColor,
  pendingDrawCount = 0
): CardDefinition[] {
  return hand.filter(card => isCardPlayable(card, topDiscard, activeColor, pendingDrawCount));
}

/**
 * Checks if a card qualifies for a Jump-In (exact identical color and value out of turn).
 */
export function canJumpIn(
  card: CardDefinition,
  topDiscard: CardDefinition | null,
  houseRules?: HouseRules
): boolean {
  if (!houseRules?.enableJumpIn || !topDiscard) return false;
  // Wild cards cannot be jumped in as per standard UNO jump-in rules
  if (card.color === 'wild' || topDiscard.color === 'wild') return false;
  return card.color === topDiscard.color && card.value === topDiscard.value;
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
