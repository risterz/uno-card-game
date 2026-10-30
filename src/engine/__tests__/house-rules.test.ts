import { describe, it, expect } from 'vitest';
import { createInitialGameState, playCard, drawCard, swapHands, jumpInCard } from '../game-state';
import { CardDefinition, CardColor, CardValue } from '../../types/card';
import { GameSettings } from '../types';

function mockCard(color: CardColor, value: CardValue, id = `c-${color}-${value}`): CardDefinition {
  return {
    id,
    color,
    value,
    type: value === 'draw2' || value === 'skip' || value === 'reverse'
      ? 'action'
      : (color === 'wild' ? 'wild' : 'number'),
    name: `${color} ${value}`,
    score: 5,
    cardKey: `${color}-${value}`,
    instanceIndex: 1,
  };
}

describe('Gameplay & House Rules Suite', () => {
  const houseRulesSettings: GameSettings = {
    playerCount: 4,
    gameMode: 'pass_and_play',
    aiDifficulty: 'medium',
    houseRules: {
      enableStacking: true,
      enableSevenZero: true,
      enableJumpIn: true,
    },
  };

  describe('1. Card Stacking (+2 and +4 Accumulation)', () => {
    it('stacks +2 on +2 and accumulates pending penalty', () => {
      const state = createInitialGameState(houseRulesSettings);

      const draw2Red = mockCard('red', 'draw2', 'd2-r');
      const draw2Blue = mockCard('blue', 'draw2', 'd2-b');

      state.discardPile = [mockCard('red', '5', 'base-r')];
      state.activeColor = 'red';
      state.currentPlayerIndex = 0;
      state.players[0].hand = [draw2Red, mockCard('green', '1', 'dummy-1')];
      state.players[1].hand = [draw2Blue, mockCard('green', '2', 'dummy-2')];

      // Player 0 plays Red Draw 2
      const s1 = playCard(state, state.players[0].id, draw2Red.id);
      expect(s1.pendingDrawCount).toBe(2);
      expect(s1.currentPlayerIndex).toBe(1); // Next player gets chance to stack

      // Player 1 stacks Blue Draw 2
      const s2 = playCard(s1, s1.players[1].id, draw2Blue.id);
      expect(s2.pendingDrawCount).toBe(4);
      expect(s2.currentPlayerIndex).toBe(2); // Next player's turn

      // Player 2 has no draw cards, so they draw the stacked penalty
      const initialHandLen = s2.players[2].hand.length;
      const s3 = drawCard(s2, s2.players[2].id);
      expect(s3.players[2].hand.length).toBe(initialHandLen + 4);
      expect(s3.pendingDrawCount).toBe(0); // Reset
      expect(s3.currentPlayerIndex).toBe(3); // Turn advanced, Player 2 forfeited
    });
  });

  describe('2. 7-0 Rule (7 Swaps Hands, 0 Rotates Hands)', () => {
    it('7-Swap: pauses game state for human player and swaps hands with chosen opponent', () => {
      const state = createInitialGameState(houseRulesSettings);
      const sevenCard = mockCard('red', '7', 'seven-r');

      state.discardPile = [mockCard('red', '3', 'base-r')];
      state.activeColor = 'red';
      state.currentPlayerIndex = 0;
      state.players[0].hand = [sevenCard, mockCard('blue', '1', 'c1')];
      state.players[2].hand = [
        mockCard('yellow', '9', 'c2'),
        mockCard('yellow', '8', 'c3'),
        mockCard('yellow', '7', 'c4'),
      ];

      // Player 0 plays 7
      const s1 = playCard(state, state.players[0].id, sevenCard.id);
      expect(s1.status).toBe('awaiting_seven_swap');
      expect(s1.pendingSevenSwapPlayerId).toBe(state.players[0].id);

      // Player 0 chooses to swap with Player 2
      const s2 = swapHands(s1, state.players[0].id, state.players[2].id);
      expect(s2.status).toBe('playing');
      expect(s2.players[0].hand.length).toBe(3); // Gained Player 2's 3 cards
      expect(s2.players[2].hand.length).toBe(1); // Got Player 0's remaining 1 card
      expect(s2.currentPlayerIndex).toBe(1); // Turn advanced
    });

    it('0-Rotate: rotates all players hands in current turn direction', () => {
      const state = createInitialGameState(houseRulesSettings);
      const zeroCard = mockCard('red', '0', 'zero-r');

      state.discardPile = [mockCard('red', '2', 'base-r')];
      state.activeColor = 'red';
      state.currentPlayerIndex = 0;
      state.direction = 1; // Clockwise

      state.players[0].hand = [zeroCard, mockCard('blue', '5', 'keep')];
      state.players[1].hand = [mockCard('blue', '1', 'h1')];
      state.players[2].hand = [mockCard('green', '2', 'h2')];
      state.players[3].hand = [mockCard('yellow', '3', 'h3')];

      // Player 0 plays 0
      const s1 = playCard(state, state.players[0].id, zeroCard.id);

      expect(s1.players[1].hand[0].id).toBe('keep'); // Received from Player 0
      expect(s1.players[2].hand[0].id).toBe('h1');   // Received from Player 1
      expect(s1.players[3].hand[0].id).toBe('h2');   // Received from Player 2
      expect(s1.players[0].hand[0].id).toBe('h3');   // Received from Player 3
    });
  });

  describe('3. Jump-In Rule (Exact matching card out of turn)', () => {
    it('allows a player to jump in out of turn when holding identical card', () => {
      const state = createInitialGameState(houseRulesSettings);

      // Top discard is Blue 4
      state.discardPile = [mockCard('blue', '4', 'top-b4')];
      state.activeColor = 'blue';
      state.currentPlayerIndex = 0; // It is currently Player 0's turn

      // Player 2 holds an identical Blue 4
      const matchingBlue4 = mockCard('blue', '4', 'jump-b4');
      state.players[2].hand = [matchingBlue4, mockCard('red', '1', 'other')];

      // Player 2 JUMPS IN out of turn!
      const s1 = jumpInCard(state, state.players[2].id, matchingBlue4.id);

      expect(s1.discardPile[s1.discardPile.length - 1].id).toBe('jump-b4');
      expect(s1.players[2].hand.length).toBe(1);
      // Turn hijacked by Player 2, and advances to Player 3 (in clockwise)
      expect(s1.currentPlayerIndex).toBe(3);
    });

    it('rejects jump-in for cards that do not match both color and value', () => {
      const state = createInitialGameState(houseRulesSettings);
      state.discardPile = [mockCard('blue', '4', 'top-b4')];
      state.activeColor = 'blue';
      state.currentPlayerIndex = 0;

      // Player 2 holds Red 4 (same value, different color -> invalid jump-in)
      const red4 = mockCard('red', '4', 'red-4');
      state.players[2].hand = [red4];

      const s1 = jumpInCard(state, state.players[2].id, red4.id);
      expect(s1).toBe(state); // Unchanged
    });
  });
});
