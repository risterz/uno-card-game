import { describe, it, expect } from 'vitest';
import { CardDefinition, CardColor } from '../../types/card';
import { GameState, Player, AIDifficulty } from '../types';
import { isCardPlayable } from '../rules';
import { createInitialGameState } from '../game-state';
import {
  computeAIMove,
  computeEasyMove,
  computeMediumMove,
  computeHardMove,
  getBestColorForHand,
} from '../ai';

function createMockCard(
  color: CardColor,
  value: any,
  id = `${color}-${value}-${Math.random().toString(36).substr(2, 5)}`
): CardDefinition {
  return {
    id,
    cardKey: `${color}-${value}`,
    color,
    type: color === 'wild' ? 'wild' : (['skip', 'reverse', 'draw2'].includes(value) ? 'action' : 'number'),
    value,
    name: `${color} ${value}`,
    score: color === 'wild' ? 50 : (['skip', 'reverse', 'draw2'].includes(value) ? 20 : parseInt(value, 10) || 0),
    instanceIndex: 1,
  };
}

function createScenarioState(options: {
  aiDifficulty?: AIDifficulty;
  aiHand: CardDefinition[];
  topDiscard: CardDefinition;
  activeColor: CardColor;
  opponentHandLengths?: number[];
  playerCount?: number;
  direction?: 1 | -1;
}): GameState {
  const playerCount = options.playerCount || 4;
  const oppCounts = options.opponentHandLengths || [7, 7, 7];

  const players: Player[] = [
    {
      id: 'p1-ai',
      name: 'Bot Alpha',
      isAI: true,
      hand: [...options.aiHand],
      unoDeclared: false,
      avatar: '🤖',
    },
  ];

  for (let i = 1; i < playerCount; i++) {
    const count = oppCounts[i - 1] ?? 7;
    const dummyHand: CardDefinition[] = Array.from({ length: count }, (_, idx) =>
      createMockCard('yellow', '5', `opp-${i}-card-${idx}`)
    );
    players.push({
      id: `p${i + 1}`,
      name: `Player ${i + 1}`,
      isAI: false,
      hand: dummyHand,
      unoDeclared: false,
      avatar: '🦊',
    });
  }

  return {
    players,
    currentPlayerIndex: 0,
    direction: options.direction || 1,
    drawPile: [createMockCard('red', '1', 'deck-1'), createMockCard('blue', '2', 'deck-2')],
    discardPile: [options.topDiscard],
    activeColor: options.activeColor,
    status: 'playing',
    winner: null,
    pendingCard: null,
    drawnCard: null,
    pendingDrawCount: 0,
    pendingSevenSwapPlayerId: null,
    lastActionMessage: 'Test scenario',
    logs: [],
    settings: {
      playerCount,
      gameMode: 'ai',
      aiDifficulty: options.aiDifficulty || 'medium',
    },
    turnCount: 5,
  };
}

describe('UNO AI Difficulties — Comprehensive Strategy Verification', () => {
  // 1. Core requirement: All difficulties must select only legal actions
  it('1. ensures all difficulties (Easy, Medium, Hard) select only legal moves', () => {
    const topCard = createMockCard('blue', '4', 'top-blue-4');
    const hand = [
      createMockCard('red', '9', 'r-9'),
      createMockCard('blue', '7', 'b-7'),
      createMockCard('green', '4', 'g-4'),
      createMockCard('wild', 'wild', 'w-1'),
    ];

    const difficulties: AIDifficulty[] = ['easy', 'medium', 'hard'];

    for (const diff of difficulties) {
      const state = createScenarioState({
        aiDifficulty: diff,
        aiHand: hand,
        topDiscard: topCard,
        activeColor: 'blue',
      });

      const move = computeAIMove(state);
      expect(move.type).toBe('play');
      expect(move.cardId).toBeDefined();

      const playedCard = hand.find(c => c.id === move.cardId)!;
      expect(isCardPlayable(playedCard, topCard, 'blue')).toBe(true);
    }
  });

  it('1b. forces AI to draw when no legal move exists', () => {
    const topCard = createMockCard('red', '2', 'top-r-2');
    const unplayableHand = [
      createMockCard('blue', '7', 'b-7'),
      createMockCard('green', '9', 'g-9'),
      createMockCard('yellow', '5', 'y-5'),
    ];

    for (const diff of ['easy', 'medium', 'hard'] as AIDifficulty[]) {
      const state = createScenarioState({
        aiDifficulty: diff,
        aiHand: unplayableHand,
        topDiscard: topCard,
        activeColor: 'red',
      });

      const move = computeAIMove(state);
      expect(move.type).toBe('draw');
    }
  });

  // 2. Easy AI: Casual policy and occasional mistakes
  it('2. verifies Easy AI casual policy and mistakes', () => {
    const topCard = createMockCard('green', '3', 'top-g-3');
    const hand = [
      createMockCard('green', '7', 'g-7'),
      createMockCard('wild', 'wild', 'w-test'),
    ];

    // Seeded RNG producing mistake (< 0.35)
    const state = createScenarioState({
      aiDifficulty: 'easy',
      aiHand: hand,
      topDiscard: topCard,
      activeColor: 'green',
    });

    // Forced mistake (rng returns 0.1 -> mistakeRate triggers, burns Wild card)
    const mistakeMove = computeEasyMove(state, 'p1-ai', () => 0.1);
    expect(mistakeMove.cardId).toBe('w-test');

    // Casual competent move (rng returns 0.8 -> picks matching green 7)
    const normalMove = computeEasyMove(state, 'p1-ai', () => 0.8);
    expect(normalMove.cardId).toBe('g-7');

    // UNO declaration mistake: Easy forgets when rng < 0.45
    const twoCardHand = [createMockCard('green', '1'), createMockCard('green', '2')];
    const unoState = createScenarioState({ aiDifficulty: 'easy', aiHand: twoCardHand, topDiscard: topCard, activeColor: 'green' });
    const forgotUnoMove = computeEasyMove(unoState, 'p1-ai', () => 0.2);
    expect(forgotUnoMove.shouldDeclareUno).toBe(false);
  });

  // 3. Medium AI: Tactical moves, Wild conservation, and disruption
  it('3. verifies Medium AI conserves Wild cards when matching colors exist', () => {
    const topCard = createMockCard('red', '6', 'top-r-6');
    const hand = [
      createMockCard('red', '3', 'r-3'),
      createMockCard('red', '8', 'r-8'),
      createMockCard('wild', 'wild', 'w-save'),
    ];

    const state = createScenarioState({
      aiDifficulty: 'medium',
      aiHand: hand,
      topDiscard: topCard,
      activeColor: 'red',
      opponentHandLengths: [7, 7, 7],
    });

    const move = computeMediumMove(state);
    // Medium must save the wild card and play one of the red numbers
    expect(move.cardId).not.toBe('w-save');
    expect(['r-3', 'r-8']).toContain(move.cardId);
  });

  it('3b. verifies Medium AI attacks next player when dangerous (<= 2 cards)', () => {
    const topCard = createMockCard('blue', '5', 'top-b-5');
    const hand = [
      createMockCard('blue', '9', 'b-9'),
      createMockCard('blue', 'draw2', 'b-draw2'),
    ];

    // Next player has 1 card! Critical threat!
    const state = createScenarioState({
      aiDifficulty: 'medium',
      aiHand: hand,
      topDiscard: topCard,
      activeColor: 'blue',
      opponentHandLengths: [1, 7, 7],
    });

    const move = computeMediumMove(state);
    // Medium must prioritize Draw Two over normal Blue 9 to attack dangerous next player
    expect(move.cardId).toBe('b-draw2');
  });

  // 4. Hard AI: Strategic lookahead and turn-order reversal away from threats
  it('4. verifies Hard AI reverses direction away from imminent winner in 3+ players', () => {
    const topCard = createMockCard('yellow', '4', 'top-y-4');
    const hand = [
      createMockCard('yellow', '7', 'y-7'),
      createMockCard('yellow', 'reverse', 'y-rev'),
    ];

    // Player 2 (next player in clockwise direction) has 1 card!
    // Player 4 (previous player) has 6 cards.
    const state = createScenarioState({
      aiDifficulty: 'hard',
      aiHand: hand,
      topDiscard: topCard,
      activeColor: 'yellow',
      opponentHandLengths: [1, 7, 6], // Player 2 has 1 card
      playerCount: 4,
      direction: 1, // Clockwise
    });

    const move = computeHardMove(state);
    // Hard AI realizes playing Reverse sends the turn backwards to Player 4, denying Player 2!
    expect(move.cardId).toBe('y-rev');
  });

  it('4b. verifies Hard AI uses Reverse as Skip in 2-player games for extra turn', () => {
    const topCard = createMockCard('green', '2', 'top-g-2');
    const hand = [
      createMockCard('green', '8', 'g-8'),
      createMockCard('green', 'reverse', 'g-rev-2p'),
    ];

    const state = createScenarioState({
      aiDifficulty: 'hard',
      aiHand: hand,
      topDiscard: topCard,
      activeColor: 'green',
      opponentHandLengths: [5],
      playerCount: 2,
    });

    const move = computeHardMove(state);
    // In 2-player game, Reverse acts as a Skip, giving the AI an immediate extra turn!
    expect(move.cardId).toBe('g-rev-2p');
  });

  // 5. Hard AI: Evaluates future turns and color chains rather than naive matching
  it('5. verifies Hard AI prioritizes color with dominant chain for future turns', () => {
    const topCard = createMockCard('yellow', '5', 'top-y-5');
    // AI has Yellow 5 (matches value) and Red 5 (matches value)
    // Hand contains 3 other Red cards, but NO other Yellow cards!
    const hand = [
      createMockCard('yellow', '5', 'y-5'),
      createMockCard('red', '5', 'r-5'),
      createMockCard('red', '1', 'r-1'),
      createMockCard('red', '2', 'r-2'),
      createMockCard('red', '9', 'r-9'),
    ];

    const state = createScenarioState({
      aiDifficulty: 'hard',
      aiHand: hand,
      topDiscard: topCard,
      activeColor: 'yellow',
      opponentHandLengths: [6, 6, 6],
    });

    const move = computeHardMove(state);
    // Playing Red 5 changes active color to Red, setting up AI's dominant 3-card chain
    expect(move.cardId).toBe('r-5');
  });

  // 6. Wild card color selection uses AI hand and legal strategic considerations
  it('6. verifies Wild color selection picks majority suit from hand', () => {
    const hand = [
      createMockCard('blue', '1'),
      createMockCard('blue', '3'),
      createMockCard('blue', '8'),
      createMockCard('red', '4'),
      createMockCard('wild', 'wild', 'wild-card'),
    ];

    const chosen = getBestColorForHand(hand);
    expect(chosen).toBe('blue');

    const topCard = createMockCard('green', '5');
    const state = createScenarioState({
      aiDifficulty: 'hard',
      aiHand: [createMockCard('wild', 'wild', 'w-only'), createMockCard('blue', '1'), createMockCard('blue', '2')],
      topDiscard: topCard,
      activeColor: 'green',
    });

    const move = computeHardMove(state);
    expect(move.type).toBe('play');
    expect(move.chosenColor).toBe('blue');
  });

  // 7. Action cards account for turn order and opponent counts
  it('7. verifies Skip urgency increases when next player has 1 card vs 6 cards', () => {
    const topCard = createMockCard('red', '3');
    const hand = [createMockCard('red', '7', 'r-7'), createMockCard('red', 'skip', 'r-skip')];

    // Threat scenario: Next player has 1 card
    const dangerState = createScenarioState({
      aiDifficulty: 'hard',
      aiHand: hand,
      topDiscard: topCard,
      activeColor: 'red',
      opponentHandLengths: [1, 6, 6],
    });
    const dangerMove = computeHardMove(dangerState);
    expect(dangerMove.cardId).toBe('r-skip');

    // Safe scenario: Next player has 6 cards
    const safeState = createScenarioState({
      aiDifficulty: 'hard',
      aiHand: hand,
      topDiscard: topCard,
      activeColor: 'red',
      opponentHandLengths: [6, 6, 6],
    });
    const safeMove = computeHardMove(safeState);
    // In safe scenario, saving the skip or playing the number is viable
    expect(['r-7', 'r-skip']).toContain(safeMove.cardId);
  });

  // 8. Fairness: No strategy accesses hidden opponent cards
  it('8. proves AI decisions are identical regardless of hidden opponent card contents', () => {
    const topCard = createMockCard('blue', '6');
    const hand = [createMockCard('blue', '2'), createMockCard('green', '6')];

    // State A: Opponent has 3 red cards
    const stateA = createScenarioState({
      aiDifficulty: 'hard',
      aiHand: hand,
      topDiscard: topCard,
      activeColor: 'blue',
      opponentHandLengths: [3, 4, 5],
    });

    // State B: Same hand counts, but opponent hand array has completely different cards
    const stateB = createScenarioState({
      aiDifficulty: 'hard',
      aiHand: hand,
      topDiscard: topCard,
      activeColor: 'blue',
      opponentHandLengths: [3, 4, 5],
    });
    stateB.players[1].hand = [createMockCard('wild', 'wild_draw4'), createMockCard('blue', 'draw2'), createMockCard('red', 'skip')];

    const moveA = computeHardMove(stateA, 'p1-ai', () => 0.5);
    const moveB = computeHardMove(stateB, 'p1-ai', () => 0.5);

    // Moves must be identical: Hard AI only uses public hand.length, never hidden cards!
    expect(moveA.cardId).toBe(moveB.cardId);
    expect(moveA.type).toBe(moveB.type);
  });

  // 9. Search simulations do not mutate live game state
  it('9. guarantees that AI simulations never mutate the live game state', () => {
    const topCard = createMockCard('red', '4');
    const hand = [createMockCard('red', '7'), createMockCard('red', '9')];

    const state = createScenarioState({
      aiDifficulty: 'hard',
      aiHand: hand,
      topDiscard: topCard,
      activeColor: 'red',
    });

    const handCopyBefore = JSON.stringify(state.players[0].hand);
    const oppCopyBefore = JSON.stringify(state.players[1].hand);
    const discardBefore = JSON.stringify(state.discardPile);

    computeHardMove(state);

    expect(JSON.stringify(state.players[0].hand)).toBe(handCopyBefore);
    expect(JSON.stringify(state.players[1].hand)).toBe(oppCopyBefore);
    expect(JSON.stringify(state.discardPile)).toBe(discardBefore);
  });

  // 10. Computation budget: finishes within < 25ms per decision
  it('10. executes Hard AI decisions within the configured computation budget (< 25ms)', () => {
    const topCard = createMockCard('yellow', '5');
    const largeHand = [
      createMockCard('yellow', '1'),
      createMockCard('yellow', '7'),
      createMockCard('yellow', 'skip'),
      createMockCard('red', '5'),
      createMockCard('blue', '5'),
      createMockCard('wild', 'wild'),
      createMockCard('wild', 'wild_draw4'),
    ];

    const state = createScenarioState({
      aiDifficulty: 'hard',
      aiHand: largeHand,
      topDiscard: topCard,
      activeColor: 'yellow',
    });

    const start = performance.now();
    for (let i = 0; i < 10; i++) {
      computeHardMove(state);
    }
    const elapsedAvg = (performance.now() - start) / 10;

    // Average decision should be well under 25ms
    expect(elapsedAvg).toBeLessThan(25);
  });

  // 11. Difficulty selection persistence across match setup and restart
  it('11. verifies difficulty setting persists in state settings', () => {
    const initialEasy = createInitialGameState({ playerCount: 4, gameMode: 'ai', aiDifficulty: 'easy' });
    expect(initialEasy.settings.aiDifficulty).toBe('easy');

    const initialHard = createInitialGameState({ playerCount: 4, gameMode: 'ai', aiDifficulty: 'hard' });
    expect(initialHard.settings.aiDifficulty).toBe('hard');
  });

  // 12. Identical seeded test states produce reproducible decisions
  it('12. verifies deterministic reproducibility with controlled seeds', () => {
    const topCard = createMockCard('green', '8');
    const hand = [createMockCard('green', '3'), createMockCard('green', '7'), createMockCard('wild', 'wild')];

    const state = createScenarioState({
      aiDifficulty: 'hard',
      aiHand: hand,
      topDiscard: topCard,
      activeColor: 'green',
    });

    const run1 = computeHardMove(state, 'p1-ai', () => 0.42);
    const run2 = computeHardMove(state, 'p1-ai', () => 0.42);

    expect(run1.cardId).toBe(run2.cardId);
    expect(run1.chosenColor).toBe(run2.chosenColor);
  });
});
