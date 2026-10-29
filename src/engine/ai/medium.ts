import { GameState, Player } from '../types';
import { getPlayableCards, getNextPlayerIndex } from '../rules';
import { playCard } from '../game-state';
import { AIMove, AIStrategy, LegalAction } from './types';
import { MEDIUM_WEIGHTS, evaluateState, getBestColorForHand } from './evaluation';

export class MediumAIStrategy implements AIStrategy {
  difficulty: 'medium' = 'medium';

  chooseAction(state: GameState, aiPlayerId: string, rng = Math.random): AIMove {
    const ai = state.players.find(p => p.id === aiPlayerId);
    if (!ai || !ai.isAI) return { type: 'draw' };

    // 1. Drawn card decision phase
    if (state.status === 'drawn_card_decision' && state.drawnCard) {
      const isWild = state.drawnCard.color === 'wild';
      const chosenColor = isWild ? getBestColorForHand(ai.hand) : undefined;
      return {
        type: 'play',
        cardId: state.drawnCard.id,
        chosenColor,
        reasoning: 'Medium AI: Played drawn card',
      };
    }

    const topDiscard = state.discardPile[state.discardPile.length - 1];
    const playable = getPlayableCards(ai.hand, topDiscard, state.activeColor);

    // If no legal card, must draw
    if (playable.length === 0) {
      return { type: 'draw', reasoning: 'Medium AI: No playable cards, drawing' };
    }

    // UNO declaration: 88% reliable
    const shouldDeclareUno = ai.hand.length === 2 && rng() > 0.12;

    // Generate candidate actions
    const candidateActions: LegalAction[] = [];
    const hasNonWildPlayable = playable.some(c => c.color !== 'wild');

    for (const card of playable) {
      if (card.color === 'wild') {
        // Medium AI picks best color for hand when playing wild
        const bestColor = getBestColorForHand(ai.hand);
        candidateActions.push({ type: 'play', card, chosenColor: bestColor });
      } else {
        candidateActions.push({ type: 'play', card });
      }
    }

    // Check if next player is dangerous (<= 2 cards)
    const nextPlayerIndex = getNextPlayerIndex(state.currentPlayerIndex, state.direction, state.players.length, 1);
    const nextPlayer = state.players[nextPlayerIndex];
    const nextPlayerDangerous = nextPlayer.hand.length <= 2;

    // Evaluate each candidate action
    let bestAction: LegalAction = candidateActions[0];
    let bestScore = -Infinity;

    for (const action of candidateActions) {
      const card = action.card!;
      // Simulate state after playing this card
      const simulatedState = playCard(state, aiPlayerId, card.id, action.chosenColor, rng);
      let score = evaluateState(simulatedState, aiPlayerId, MEDIUM_WEIGHTS);

      // Heuristic adjustment 1: Wild card conservation
      // If AI has valid non-wild cards, penalize burning a Wild card
      if (card.color === 'wild' && hasNonWildPlayable) {
        score -= MEDIUM_WEIGHTS.wildPlayConservationPenalty;
      }

      // Heuristic adjustment 2: Disruption against dangerous opponent
      if (nextPlayerDangerous) {
        if (card.value === 'draw2' || card.value === 'wild_draw4') {
          score += 120; // High priority to force dangerous opponent to draw cards
        } else if (card.value === 'skip') {
          score += 90; // High priority to skip dangerous opponent
        } else if (card.value === 'reverse') {
          if (state.players.length === 2) {
            score += 90; // In 2-player, reverse acts as a skip
          } else {
            score += 100; // In 3+ players, reverses direction away from dangerous opponent
          }
        }
      }

      // Heuristic adjustment 3: Color suit drainage
      // Prefer cards that match our largest color count
      if (card.color === state.activeColor) {
        score += 15;
      }

      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    }

    return {
      type: 'play',
      cardId: bestAction.card!.id,
      chosenColor: bestAction.chosenColor,
      shouldDeclareUno,
      reasoning: `Medium AI: Evaluated tactical score ${Math.round(bestScore)} for ${bestAction.card!.name}`,
    };
  }

  shouldCatchUno(state: GameState, aiPlayerId: string, rng = Math.random): Player | null {
    // Medium AI catches missed UNO shouts 65% of the time
    if (rng() > 0.65) return null;

    for (const player of state.players) {
      if (player.id !== aiPlayerId && player.hand.length === 1 && !player.unoDeclared) {
        return player;
      }
    }
    return null;
  }
}
