import { CardColor, CardDefinition } from '../types/card';
import { FULL_DECK } from '../data/deck';
import { GameSettings, GameState, LogEntry, Player } from './types';
import { getNextPlayerIndex, isCardPlayable, calculateRoundScore } from './rules';

/**
 * Modern Fisher-Yates shuffle with optional RNG function.
 */
export function shuffleCards(cards: CardDefinition[], rng = Math.random): CardDefinition[] {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

const AVATARS = ['👑', '🤖', '🦊', '🐼', '🐯', '🚀'];

/**
 * Generates unique log ID.
 */
let logCounter = 0;
function createLog(text: string, type: LogEntry['type'], color?: CardColor): LogEntry {
  return {
    id: `log-${Date.now()}-${++logCounter}`,
    timestamp: Date.now(),
    text,
    type,
    color,
  };
}

/**
 * Creates initial game state.
 */
export function createInitialGameState(
  settings: GameSettings,
  customDeck?: CardDefinition[],
  rng = Math.random
): GameState {
  const playerCount = Math.max(2, Math.min(5, settings.playerCount));
  const players: Player[] = [];

  for (let i = 0; i < playerCount; i++) {
    const isHuman = settings.gameMode === 'pass_and_play' || i === 0;
    const name = isHuman
      ? (settings.gameMode === 'pass_and_play' ? `Player ${i + 1}` : 'You')
      : `Bot ${['Nova', 'Orion', 'Luna', 'Sol'][i - 1] || `${i + 1}`}`;

    players.push({
      id: `p${i + 1}`,
      name,
      isAI: !isHuman,
      hand: [],
      unoDeclared: false,
      avatar: AVATARS[i % AVATARS.length],
    });
  }

  // Shuffle deck
  let deck = shuffleCards(customDeck || FULL_DECK, rng);

  // Deal 7 cards to each player
  for (const player of players) {
    player.hand = deck.splice(0, 7);
  }

  // Draw initial card for discard pile.
  // Standard rule: initial card cannot be Wild Draw Four (shuffle back if drawn)
  let initialCardIndex = deck.findIndex(c => c.value !== 'wild_draw4');
  if (initialCardIndex === -1) initialCardIndex = 0;
  const initialCard = deck.splice(initialCardIndex, 1)[0];

  const discardPile = [initialCard];
  let activeColor: CardColor = initialCard.color === 'wild' ? 'red' : initialCard.color;
  let currentPlayerIndex = 0;
  let direction: 1 | -1 = 1;
  const initialLogs: LogEntry[] = [
    createLog(`Game started with ${playerCount} players. Top card is ${initialCard.name}.`, 'system', activeColor),
  ];

  // Apply initial card effects as per official rules
  if (initialCard.value === 'skip') {
    initialLogs.push(createLog(`${players[0].name} is skipped by initial Skip card!`, 'action'));
    currentPlayerIndex = getNextPlayerIndex(0, direction, playerCount, 1);
  } else if (initialCard.value === 'reverse') {
    direction = -1;
    initialLogs.push(createLog(`Direction reversed by initial Reverse card!`, 'action'));
    if (playerCount === 2) {
      // In 2 player, reverse acts as skip
      currentPlayerIndex = 1;
    }
  } else if (initialCard.value === 'draw2') {
    const victim = players[0];
    const drawn = deck.splice(0, 2);
    victim.hand.push(...drawn);
    initialLogs.push(createLog(`${victim.name} draws 2 and is skipped by initial Draw Two!`, 'action'));
    currentPlayerIndex = getNextPlayerIndex(0, direction, playerCount, 1);
  } else if (initialCard.value === 'wild') {
    initialLogs.push(createLog(`Initial card is Wild! Starting color is ${activeColor}.`, 'action', activeColor));
  }

  return {
    players,
    currentPlayerIndex,
    direction,
    drawPile: deck,
    discardPile,
    activeColor,
    status: 'playing',
    winner: null,
    pendingCard: null,
    drawnCard: null,
    lastActionMessage: `Turn: ${players[currentPlayerIndex].name}`,
    logs: initialLogs,
    settings,
    turnCount: 1,
  };
}

/**
 * Ensures draw pile has enough cards by recycling the discard pile.
 */
function ensureDrawPileCards(state: GameState, countNeeded: number, rng = Math.random): void {
  if (state.drawPile.length >= countNeeded) return;

  if (state.discardPile.length <= 1) {
    // Cannot recycle: all cards are in hands or top discard
    return;
  }

  // Keep top card on discard pile, shuffle the rest into draw pile
  const topDiscard = state.discardPile[state.discardPile.length - 1];
  const reusableCards = state.discardPile.slice(0, state.discardPile.length - 1);
  
  state.discardPile = [topDiscard];
  const recycled = shuffleCards(reusableCards, rng);
  state.drawPile.push(...recycled);
  
  state.logs.push(createLog(`Draw pile replenished by shuffling ${recycled.length} cards from discard pile.`, 'system'));
}

/**
 * Player plays a card from hand.
 */
export function playCard(
  prevState: GameState,
  playerId: string,
  cardId: string,
  chosenColor?: CardColor,
  rng = Math.random
): GameState {
  if (
    prevState.status !== 'playing' &&
    prevState.status !== 'drawn_card_decision' &&
    prevState.status !== 'awaiting_color_choice'
  ) {
    return prevState;
  }

  const currentPlayer = prevState.players[prevState.currentPlayerIndex];
  if (currentPlayer.id !== playerId) {
    return prevState;
  }

  const targetCardId = (prevState.status === 'awaiting_color_choice' && prevState.pendingCard)
    ? prevState.pendingCard.id
    : cardId;
  const cardIndex = currentPlayer.hand.findIndex(c => c.id === targetCardId);
  if (cardIndex === -1) {
    return prevState;
  }

  const card = currentPlayer.hand[cardIndex];
  const topDiscard = prevState.discardPile[prevState.discardPile.length - 1];

  // Verify playability
  if (!isCardPlayable(card, topDiscard, prevState.activeColor)) {
    return prevState;
  }

  // Handle wild color selection prompt
  const isWild = card.color === 'wild' || card.value === 'wild' || card.value === 'wild_draw4';
  if (isWild && !chosenColor) {
    return {
      ...prevState,
      status: 'awaiting_color_choice',
      pendingCard: card,
      lastActionMessage: `${currentPlayer.name} played ${card.name}. Choose a color.`,
    };
  }

  // Deep clone players and piles for immutability
  const state: GameState = {
    ...prevState,
    players: prevState.players.map(p => ({
      ...p,
      hand: [...p.hand],
    })),
    drawPile: [...prevState.drawPile],
    discardPile: [...prevState.discardPile],
    logs: [...prevState.logs],
    pendingCard: null,
    drawnCard: null,
  };

  const activePlayer = state.players[state.currentPlayerIndex];
  // Remove card from hand
  activePlayer.hand.splice(cardIndex, 1);
  state.discardPile.push(card);

  // Determine effective color
  const effectiveColor: CardColor = isWild ? (chosenColor || 'red') : card.color;
  state.activeColor = effectiveColor;

  // Log play action
  const colorText = isWild ? ` (color changed to ${effectiveColor.toUpperCase()})` : '';
  state.logs.push(createLog(`${activePlayer.name} played ${card.name}${colorText}`, 'play', effectiveColor));

  // Check Win Condition
  if (activePlayer.hand.length === 0) {
    state.status = 'game_over';
    state.winner = activePlayer;
    const losingHands = state.players.filter(p => p.id !== activePlayer.id).map(p => p.hand);
    const score = calculateRoundScore(losingHands);
    state.lastActionMessage = `🎉 ${activePlayer.name} wins the game! Total score: ${score} points!`;
    state.logs.push(createLog(`🎉 ${activePlayer.name} won the game with ${score} points!`, 'win'));
    return state;
  }

  // Check UNO safety
  if (activePlayer.hand.length === 1) {
    if (activePlayer.unoDeclared) {
      state.logs.push(createLog(`🔔 ${activePlayer.name} has ONE card remaining (UNO safe)!`, 'uno'));
    } else {
      state.logs.push(createLog(`⚠️ ${activePlayer.name} has ONE card remaining but did NOT call UNO!`, 'uno'));
    }
  } else {
    // Reset UNO declaration when hand size changes
    activePlayer.unoDeclared = false;
  }

  // Apply Action Effects & Advance Turn
  const playerCount = state.players.length;
  let step = 1;

  if (card.value === 'skip') {
    step = 2;
    const skippedPlayerIndex = getNextPlayerIndex(state.currentPlayerIndex, state.direction, playerCount, 1);
    const skippedPlayer = state.players[skippedPlayerIndex];
    state.logs.push(createLog(`⏭️ ${skippedPlayer.name} was skipped!`, 'action'));
  } else if (card.value === 'reverse') {
    if (playerCount === 2) {
      // In 2-player UNO, Reverse acts as a Skip
      step = 2;
      const otherPlayerIndex = (state.currentPlayerIndex + 1) % 2;
      state.logs.push(createLog(`🔄 Reverse in 2-player game acts as Skip! ${state.players[otherPlayerIndex].name} is skipped.`, 'action'));
    } else {
      state.direction = state.direction === 1 ? -1 : 1;
      state.logs.push(createLog(`🔄 Direction reversed to ${state.direction === 1 ? 'clockwise' : 'counter-clockwise'}!`, 'action'));
      step = 1;
    }
  } else if (card.value === 'draw2') {
    step = 2;
    const victimIndex = getNextPlayerIndex(state.currentPlayerIndex, state.direction, playerCount, 1);
    const victim = state.players[victimIndex];
    ensureDrawPileCards(state, 2, rng);
    const drawn = state.drawPile.splice(0, Math.min(2, state.drawPile.length));
    victim.hand.push(...drawn);
    victim.unoDeclared = false;
    state.logs.push(createLog(`💥 ${victim.name} drew 2 cards and was skipped!`, 'action'));
  } else if (card.value === 'wild_draw4') {
    step = 2;
    const victimIndex = getNextPlayerIndex(state.currentPlayerIndex, state.direction, playerCount, 1);
    const victim = state.players[victimIndex];
    ensureDrawPileCards(state, 4, rng);
    const drawn = state.drawPile.splice(0, Math.min(4, state.drawPile.length));
    victim.hand.push(...drawn);
    victim.unoDeclared = false;
    state.logs.push(createLog(`⚡ ${victim.name} drew 4 cards and was skipped!`, 'action'));
  }

  // Advance to next active player
  state.currentPlayerIndex = getNextPlayerIndex(state.currentPlayerIndex, state.direction, playerCount, step);
  state.status = 'playing';
  state.turnCount++;
  state.lastActionMessage = `Turn: ${state.players[state.currentPlayerIndex].name}`;

  return state;
}

/**
 * Player draws a card from the draw pile.
 */
export function drawCard(prevState: GameState, playerId: string, rng = Math.random): GameState {
  if (prevState.status !== 'playing') {
    return prevState;
  }

  const currentPlayer = prevState.players[prevState.currentPlayerIndex];
  if (currentPlayer.id !== playerId) {
    return prevState;
  }

  const state: GameState = {
    ...prevState,
    players: prevState.players.map(p => ({
      ...p,
      hand: [...p.hand],
    })),
    drawPile: [...prevState.drawPile],
    discardPile: [...prevState.discardPile],
    logs: [...prevState.logs],
  };

  ensureDrawPileCards(state, 1, rng);

  if (state.drawPile.length === 0) {
    // Draw pile exhausted and no cards can be recycled
    state.logs.push(createLog(`Draw pile is completely empty. ${currentPlayer.name} passes turn.`, 'system'));
    state.currentPlayerIndex = getNextPlayerIndex(state.currentPlayerIndex, state.direction, state.players.length, 1);
    state.turnCount++;
    return state;
  }

  const drawn = state.drawPile.shift()!;
  const activePlayer = state.players[state.currentPlayerIndex];
  activePlayer.hand.push(drawn);
  activePlayer.unoDeclared = false;

  const topDiscard = state.discardPile[state.discardPile.length - 1];
  const canPlayDrawn = isCardPlayable(drawn, topDiscard, state.activeColor);

  state.logs.push(createLog(`${activePlayer.name} drew a card.`, 'draw'));

  if (canPlayDrawn) {
    // Official rule option: player can immediately play the drawn card or pass
    state.status = 'drawn_card_decision';
    state.drawnCard = drawn;
    state.lastActionMessage = `${activePlayer.name} drew ${drawn.name}. Play it or Pass?`;
    return state;
  }

  // Not playable: turn passes to next player
  state.currentPlayerIndex = getNextPlayerIndex(state.currentPlayerIndex, state.direction, state.players.length, 1);
  state.status = 'playing';
  state.turnCount++;
  state.lastActionMessage = `Turn: ${state.players[state.currentPlayerIndex].name}`;
  return state;
}

/**
 * Player passes their turn after drawing an unplayed card.
 */
export function passTurn(prevState: GameState, playerId: string): GameState {
  if (prevState.status !== 'drawn_card_decision') {
    return prevState;
  }

  const currentPlayer = prevState.players[prevState.currentPlayerIndex];
  if (currentPlayer.id !== playerId) {
    return prevState;
  }

  const nextIndex = getNextPlayerIndex(prevState.currentPlayerIndex, prevState.direction, prevState.players.length, 1);

  return {
    ...prevState,
    currentPlayerIndex: nextIndex,
    status: 'playing',
    drawnCard: null,
    turnCount: prevState.turnCount + 1,
    lastActionMessage: `Turn: ${prevState.players[nextIndex].name}`,
    logs: [
      ...prevState.logs,
      createLog(`${currentPlayer.name} passed turn.`, 'action'),
    ],
  };
}

/**
 * Cancels pending color choice and restores playable game state without making changes.
 */
export function cancelColorChoice(prevState: GameState): GameState {
  if (prevState.status !== 'awaiting_color_choice') {
    return prevState;
  }
  return {
    ...prevState,
    status: prevState.drawnCard ? 'drawn_card_decision' : 'playing',
    pendingCard: null,
    lastActionMessage: `Turn: ${prevState.players[prevState.currentPlayerIndex].name}`,
  };
}

/**
 * Player declares UNO!
 */
export function declareUno(prevState: GameState, playerId: string): GameState {
  const player = prevState.players.find(p => p.id === playerId);
  if (!player) return prevState;

  // Can declare UNO if hand has 1 or 2 cards
  if (player.hand.length > 2) {
    return prevState;
  }

  const updatedPlayers = prevState.players.map(p =>
    p.id === playerId ? { ...p, unoDeclared: true } : p
  );

  return {
    ...prevState,
    players: updatedPlayers,
    logs: [
      ...prevState.logs,
      createLog(`📢 ${player.name} loudly shouted UNO! 🃏`, 'uno'),
    ],
  };
}

/**
 * Catch a player who has 1 card but forgot to declare UNO.
 * Victim draws 2 penalty cards.
 */
export function catchUno(prevState: GameState, catcherId: string, targetId: string, rng = Math.random): GameState {
  const catcher = prevState.players.find(p => p.id === catcherId);
  const target = prevState.players.find(p => p.id === targetId);

  if (!catcher || !target) return prevState;

  // Must have exactly 1 card and NOT have declared UNO
  if (target.hand.length !== 1 || target.unoDeclared) {
    return prevState;
  }

  const state: GameState = {
    ...prevState,
    players: prevState.players.map(p => ({
      ...p,
      hand: [...p.hand],
    })),
    drawPile: [...prevState.drawPile],
    discardPile: [...prevState.discardPile],
    logs: [...prevState.logs],
  };

  ensureDrawPileCards(state, 2, rng);
  const targetInState = state.players.find(p => p.id === targetId)!;
  const penaltyCards = state.drawPile.splice(0, Math.min(2, state.drawPile.length));
  targetInState.hand.push(...penaltyCards);
  targetInState.unoDeclared = true; // Mark as resolved so not penalized multiple times

  state.logs.push(
    createLog(
      `🚨 ${catcher.name} CAUGHT ${target.name} for forgetting UNO! ${target.name} draws 2 penalty cards!`,
      'uno'
    )
  );

  return state;
}
