import { describe, it, expect } from 'vitest';
import { CardDefinition, CardColor } from '../../types/card';
import { FULL_DECK } from '../../data/deck';
import { isCardPlayable, getNextPlayerIndex } from '../rules';
import { createInitialGameState, playCard, drawCard, catchUno, cancelColorChoice } from '../game-state';
import { computeAIMove, getBestColorForHand } from '../ai';

// Helper mock card builder
function createMockCard(color: 'red' | 'blue' | 'green' | 'yellow' | 'wild', value: any, id = `${color}-${value}`): CardDefinition {
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

describe('Rules Engine: isCardPlayable', () => {
  const topRed7 = createMockCard('red', '7');

  it('allows playing same color card', () => {
    const red3 = createMockCard('red', '3');
    expect(isCardPlayable(red3, topRed7, 'red')).toBe(true);
  });

  it('allows playing same value card with different color', () => {
    const blue7 = createMockCard('blue', '7');
    expect(isCardPlayable(blue7, topRed7, 'red')).toBe(true);
  });

  it('allows playing wild card anytime', () => {
    const wild = createMockCard('wild', 'wild');
    expect(isCardPlayable(wild, topRed7, 'red')).toBe(true);

    const wildDraw4 = createMockCard('wild', 'wild_draw4');
    expect(isCardPlayable(wildDraw4, topRed7, 'red')).toBe(true);
  });

  it('rejects card with mismatched color and value', () => {
    const green2 = createMockCard('green', '2');
    expect(isCardPlayable(green2, topRed7, 'red')).toBe(false);
  });

  it('honors activeColor set by wild card', () => {
    // Top card on discard is wild, but active color chosen was green
    const topWild = createMockCard('wild', 'wild');
    const green5 = createMockCard('green', '5');
    const red5 = createMockCard('red', '5');

    expect(isCardPlayable(green5, topWild, 'green')).toBe(true);
    expect(isCardPlayable(red5, topWild, 'green')).toBe(false);
  });
});

describe('Turn Order & Player Index Navigation', () => {
  it('moves clockwise correctly and wraps around', () => {
    expect(getNextPlayerIndex(0, 1, 4)).toBe(1);
    expect(getNextPlayerIndex(3, 1, 4)).toBe(0);
  });

  it('moves counter-clockwise correctly and wraps around', () => {
    expect(getNextPlayerIndex(1, -1, 4)).toBe(0);
    expect(getNextPlayerIndex(0, -1, 4)).toBe(3);
  });

  it('skips a player with step=2', () => {
    expect(getNextPlayerIndex(0, 1, 4, 2)).toBe(2);
    expect(getNextPlayerIndex(3, 1, 4, 2)).toBe(1);
  });
});

describe('Game State & Action Cards', () => {
  it('initializes game state with 4 players and 7 cards each', () => {
    // Arrange deck with number cards for initial deal and discard
    const sortedDeck = [...FULL_DECK].sort((a, b) => {
      const aNum = typeof a.value === 'number' || (!['wild_draw4', 'draw2', 'skip', 'reverse'].includes(a.value));
      const bNum = typeof b.value === 'number' || (!['wild_draw4', 'draw2', 'skip', 'reverse'].includes(b.value));
      return aNum && !bNum ? -1 : 1;
    });

    const state = createInitialGameState(
      {
        playerCount: 4,
        gameMode: 'ai',
        aiDifficulty: 'medium',
      },
      sortedDeck,
      () => 0.5
    );

    expect(state.players).toHaveLength(4);
    for (const player of state.players) {
      expect(player.hand).toHaveLength(7);
    }
    expect(state.discardPile).toHaveLength(1);
    expect(state.discardPile[0].value).not.toBe('wild_draw4');
    expect(state.drawPile.length).toBe(108 - (4 * 7 + 1));
  });

  it('handles Skip card effect by skipping next player', () => {
    const p1Card = createMockCard('red', 'skip', 'r-skip-test');
    const topCard = createMockCard('red', '3', 'r-3-top');

    const state = createInitialGameState({ playerCount: 4, gameMode: 'ai', aiDifficulty: 'medium' });
    state.discardPile = [topCard];
    state.activeColor = 'red';
    state.currentPlayerIndex = 0;
    state.players[0].hand = [p1Card, createMockCard('red', '9')];

    const nextState = playCard(state, state.players[0].id, p1Card.id);
    // Skips player 1, moves to player 2
    expect(nextState.currentPlayerIndex).toBe(2);
    expect(nextState.discardPile[nextState.discardPile.length - 1].id).toBe('r-skip-test');
  });

  it('handles Reverse card in 3+ players by flipping direction', () => {
    const p1Reverse = createMockCard('blue', 'reverse', 'b-rev');
    const topCard = createMockCard('blue', '5', 'b-5');

    const state = createInitialGameState({ playerCount: 4, gameMode: 'ai', aiDifficulty: 'medium' });
    state.discardPile = [topCard];
    state.activeColor = 'blue';
    state.direction = 1;
    state.currentPlayerIndex = 0;
    state.players[0].hand = [p1Reverse, createMockCard('blue', '1')];

    const nextState = playCard(state, state.players[0].id, p1Reverse.id);
    expect(nextState.direction).toBe(-1);
    // In counter-clockwise direction, from player 0 step 1 moves to player 3
    expect(nextState.currentPlayerIndex).toBe(3);
  });

  it('handles Reverse card in 2-player game by acting as Skip', () => {
    const p1Reverse = createMockCard('blue', 'reverse', 'b-rev-2p');
    const topCard = createMockCard('blue', '5', 'b-5-2p');

    const state = createInitialGameState({ playerCount: 2, gameMode: 'ai', aiDifficulty: 'medium' });
    state.discardPile = [topCard];
    state.activeColor = 'blue';
    state.currentPlayerIndex = 0;
    state.players[0].hand = [p1Reverse, createMockCard('blue', '1')];

    const nextState = playCard(state, state.players[0].id, p1Reverse.id);
    // Acts as skip, so player 0 goes again
    expect(nextState.currentPlayerIndex).toBe(0);
  });

  it('handles Draw Two: victim draws 2 cards and is skipped', () => {
    const p1Draw2 = createMockCard('green', 'draw2', 'g-draw2');
    const topCard = createMockCard('green', '1', 'g-1');

    const state = createInitialGameState({ playerCount: 4, gameMode: 'ai', aiDifficulty: 'medium' });
    state.discardPile = [topCard];
    state.activeColor = 'green';
    state.currentPlayerIndex = 0;
    state.players[0].hand = [p1Draw2, createMockCard('green', '9')];
    const victimInitialHandCount = state.players[1].hand.length;

    const nextState = playCard(state, state.players[0].id, p1Draw2.id);
    // Player 1 drew 2 cards
    expect(nextState.players[1].hand.length).toBe(victimInitialHandCount + 2);
    // Player 1 skipped, turn goes to Player 2
    expect(nextState.currentPlayerIndex).toBe(2);
  });

  it('handles Wild card color choice and turn advance for all four colors from awaiting_color_choice', () => {
    const colors: CardColor[] = ['red', 'blue', 'green', 'yellow'];

    for (const chosenColor of colors) {
      const wildCard = createMockCard('wild', 'wild', `wild-test-${chosenColor}`);
      const topCard = createMockCard('yellow', '5', `y-5-${chosenColor}`);

      const state = createInitialGameState({ playerCount: 4, gameMode: 'ai', aiDifficulty: 'medium' });
      state.discardPile = [topCard];
      state.activeColor = 'yellow';
      state.direction = 1;
      state.currentPlayerIndex = 0;
      state.players[0].hand = [wildCard, createMockCard('red', '1')];

      // 1. First action: player plays wild without color -> enters awaiting_color_choice
      const promptState = playCard(state, state.players[0].id, wildCard.id);
      expect(promptState.status).toBe('awaiting_color_choice');
      expect(promptState.pendingCard?.id).toBe(wildCard.id);
      // Hand still contains the card during choice
      expect(promptState.players[0].hand).toHaveLength(2);

      // 2. Player selects color: modal closes, color applied, card discarded, turn advanced
      const nextState = playCard(promptState, promptState.players[0].id, wildCard.id, chosenColor);
      expect(nextState.status).toBe('playing');
      expect(nextState.pendingCard).toBeNull();
      expect(nextState.activeColor).toBe(chosenColor);
      expect(nextState.players[0].hand).toHaveLength(1);
      expect(nextState.players[0].hand.find(c => c.id === wildCard.id)).toBeUndefined();
      expect(nextState.discardPile[nextState.discardPile.length - 1].id).toBe(wildCard.id);
      expect(nextState.currentPlayerIndex).toBe(1);

      // 3. Double-click protection / idempotence: second call on played state does not advance turn or discard twice
      const duplicateClickState = playCard(nextState, promptState.players[0].id, wildCard.id, chosenColor);
      expect(duplicateClickState).toBe(nextState);
      expect(duplicateClickState.currentPlayerIndex).toBe(1);
      expect(duplicateClickState.players[0].hand).toHaveLength(1);
    }
  });

  it('handles Wild Draw Four from awaiting_color_choice with 4-card penalty and skip', () => {
    const wild4 = createMockCard('wild', 'wild_draw4', 'w-draw4');
    const topCard = createMockCard('red', '5', 'r-5');

    const state = createInitialGameState({ playerCount: 4, gameMode: 'ai', aiDifficulty: 'medium' });
    state.discardPile = [topCard];
    state.activeColor = 'red';
    state.currentPlayerIndex = 0;
    state.players[0].hand = [wild4, createMockCard('blue', '1')];
    const victimHandCount = state.players[1].hand.length;

    // 1. Enter awaiting_color_choice
    const promptState = playCard(state, state.players[0].id, wild4.id);
    expect(promptState.status).toBe('awaiting_color_choice');
    expect(promptState.pendingCard?.id).toBe(wild4.id);

    // 2. Select green
    const nextState = playCard(promptState, promptState.players[0].id, wild4.id, 'green');
    expect(nextState.status).toBe('playing');
    expect(nextState.pendingCard).toBeNull();
    expect(nextState.activeColor).toBe('green');
    expect(nextState.players[0].hand).toHaveLength(1);
    expect(nextState.discardPile[nextState.discardPile.length - 1].id).toBe(wild4.id);
    expect(nextState.players[1].hand.length).toBe(victimHandCount + 4);
    expect(nextState.currentPlayerIndex).toBe(2); // Skipped player 1
  });

  it('cancelling color choice restores playable state without modifying hands or discard pile', () => {
    const wildCard = createMockCard('wild', 'wild', 'wild-cancel-test');
    const topCard = createMockCard('blue', '7', 'b-7');

    const state = createInitialGameState({ playerCount: 4, gameMode: 'ai', aiDifficulty: 'medium' });
    state.discardPile = [topCard];
    state.activeColor = 'blue';
    state.currentPlayerIndex = 0;
    state.players[0].hand = [wildCard, createMockCard('red', '1')];

    // Trigger awaiting_color_choice
    const promptState = playCard(state, state.players[0].id, wildCard.id);
    expect(promptState.status).toBe('awaiting_color_choice');

    // Cancel color choice
    const cancelledState = cancelColorChoice(promptState);
    expect(cancelledState.status).toBe('playing');
    expect(cancelledState.pendingCard).toBeNull();
    expect(cancelledState.players[0].hand).toHaveLength(2);
    expect(cancelledState.discardPile).toHaveLength(1);
    expect(cancelledState.activeColor).toBe('blue');
    expect(cancelledState.currentPlayerIndex).toBe(0);
  });
});

describe('Draw Pile Recycling & Edge Cases', () => {
  it('recycles discard pile when draw pile runs out', () => {
    const state = createInitialGameState({ playerCount: 2, gameMode: 'ai', aiDifficulty: 'medium' });
    state.drawPile = []; // Empty draw pile
    state.discardPile = [
      createMockCard('red', '1'),
      createMockCard('blue', '2'),
      createMockCard('green', '3'),
      createMockCard('yellow', '9', 'top-discard') // Top card must remain
    ];
    state.activeColor = 'yellow';
    state.currentPlayerIndex = 0;

    const nextState = drawCard(state, state.players[0].id);
    // Draw pile recycled 3 cards minus 1 drawn card = 2 cards remaining in draw pile
    expect(nextState.discardPile).toHaveLength(1);
    expect(nextState.discardPile[0].id).toBe('top-discard');
    expect(nextState.drawPile.length).toBe(2);
  });
});

describe('UNO Declaration, Penalties, and Winning', () => {
  it('penalizes player with 2 cards when caught forgetting UNO', () => {
    const state = createInitialGameState({ playerCount: 2, gameMode: 'ai', aiDifficulty: 'medium' });
    state.players[1].hand = [createMockCard('red', '5')]; // Only 1 card
    state.players[1].unoDeclared = false;

    const caughtState = catchUno(state, state.players[0].id, state.players[1].id);
    expect(caughtState.players[1].hand).toHaveLength(3); // 1 + 2 penalty = 3
    expect(caughtState.players[1].unoDeclared).toBe(true);
  });

  it('protects player from penalty if UNO was declared', () => {
    const state = createInitialGameState({ playerCount: 2, gameMode: 'ai', aiDifficulty: 'medium' });
    state.players[1].hand = [createMockCard('red', '5')];
    state.players[1].unoDeclared = true;

    const caughtState = catchUno(state, state.players[0].id, state.players[1].id);
    expect(caughtState.players[1].hand).toHaveLength(1); // Unchanged
  });

  it('triggers game_over when player plays last card', () => {
    const lastCard = createMockCard('blue', '3', 'last-c');
    const topCard = createMockCard('blue', '9', 'top-c');

    const state = createInitialGameState({ playerCount: 2, gameMode: 'ai', aiDifficulty: 'medium' });
    state.discardPile = [topCard];
    state.activeColor = 'blue';
    state.currentPlayerIndex = 0;
    state.players[0].hand = [lastCard]; // Only 1 card left

    const finalState = playCard(state, state.players[0].id, lastCard.id);
    expect(finalState.status).toBe('game_over');
    expect(finalState.winner?.id).toBe(state.players[0].id);
    expect(finalState.players[0].hand).toHaveLength(0);
  });
});

describe('AI Decision Engine', () => {
  it('selects legal move and best color for wild', () => {
    const hand = [
      createMockCard('green', '1'),
      createMockCard('green', '5'),
      createMockCard('red', '2'),
      createMockCard('wild', 'wild', 'ai-wild'),
    ];
    expect(getBestColorForHand(hand)).toBe('green');

    const state = createInitialGameState({ playerCount: 2, gameMode: 'ai', aiDifficulty: 'hard' });
    state.discardPile = [createMockCard('yellow', '9')];
    state.activeColor = 'yellow';
    state.currentPlayerIndex = 1;
    state.players[1].hand = [createMockCard('wild', 'wild', 'ai-wild')];

    const move = computeAIMove(state);
    expect(move.type).toBe('play');
    expect(move.cardId).toBe('ai-wild');
    expect(move.chosenColor).toBeDefined();
  });
});
