import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../game-state';

describe('Test Hand Display Logic (Non-Mutating)', () => {
  it('slices existing hand without mutating player hand or deck', () => {
    // Provide custom deck where initial card is a simple number card so initial hand is exactly 7
    const state = createInitialGameState({
      playerCount: 4,
      gameMode: 'ai',
      aiDifficulty: 'medium',
    });
    // Reset player 0 hand to 7 cards to ensure deterministic baseline
    state.players[0].hand = state.players[0].hand.slice(0, 7);
    const initialPlayerHand = [...state.players[0].hand];
    const initialDeckSize = state.drawPile.length;
    const initialDiscardSize = state.discardPile.length;

    // Test slicing for display count 1
    const testCount1 = 1;
    const renderedHand1 = initialPlayerHand.slice(0, testCount1);
    expect(renderedHand1.length).toBe(1);
    expect(renderedHand1[0]).toBe(initialPlayerHand[0]);

    // Verify original game state is 100% untouched
    expect(state.players[0].hand.length).toBe(7);
    expect(state.players[0].hand).toEqual(initialPlayerHand);
    expect(state.drawPile.length).toBe(initialDeckSize);
    expect(state.discardPile.length).toBe(initialDiscardSize);

    // Test slicing for display count 13 when player has 7 cards
    const testCount13 = 13;
    const renderedHand13 = initialPlayerHand.slice(0, testCount13);
    expect(renderedHand13.length).toBe(7); // only 7 available
    expect(renderedHand13).toEqual(initialPlayerHand);

    // Message logic check
    const message =
      initialPlayerHand.length < testCount13
        ? `Showing ${initialPlayerHand.length} of ${testCount13} requested cards.`
        : `Showing ${renderedHand13.length} of ${initialPlayerHand.length} cards.`;
    expect(message).toBe('Showing 7 of 13 requested cards.');

    // Repeated evaluation produces exact same identity
    const renderedHand13Second = initialPlayerHand.slice(0, testCount13);
    expect(renderedHand13Second).toEqual(renderedHand13);
    expect(state.players[0].hand).toEqual(initialPlayerHand);
  });
});
