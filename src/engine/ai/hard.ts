import { CardColor, CardDefinition } from '../../types/card';
import { GameState, Player } from '../types';
import { getPlayableCards } from '../rules';
import { playCard } from '../game-state';
import { AIMove, AIStrategy, LegalAction } from './types';
import {
  HARD_WEIGHTS,
  COLORS,
  evaluateState,
  getUnseenCardCounts,
  countCardsByColor,
} from './evaluation';

export class HardAIStrategy implements AIStrategy {
  difficulty: 'hard' = 'hard';

  /**
   * Search budget limit in milliseconds (prevents browser freezing, typically runs in < 8ms).
   */
  private timeBudgetMs = 35;

  constructor(timeBudgetMs = 35) {
    this.timeBudgetMs = timeBudgetMs;
  }

  chooseAction(state: GameState, aiPlayerId: string, rng = Math.random): AIMove {
    const startTime = Date.now();
    const ai = state.players.find(p => p.id === aiPlayerId);
    if (!ai || !ai.isAI) return { type: 'draw' };

    // 1. Drawn card decision phase
    if (state.status === 'drawn_card_decision' && state.drawnCard) {
      const isWild = state.drawnCard.color === 'wild';
      const chosenColor = isWild ? this.predictBestWildColor(state, ai, state.drawnCard) : undefined;
      return {
        type: 'play',
        cardId: state.drawnCard.id,
        chosenColor,
        reasoning: 'Hard AI: Played drawn card with predictive color choice',
      };
    }

    const topDiscard = state.discardPile[state.discardPile.length - 1];
    const playable = getPlayableCards(ai.hand, topDiscard, state.activeColor, state.pendingDrawCount);

    // If no legal card, must draw
    if (playable.length === 0) {
      return { type: 'draw', reasoning: 'Hard AI: No playable cards, drawing' };
    }

    // UNO declaration: Hard AI has 100% precision (never forgets UNO)
    const shouldDeclareUno = ai.hand.length === 2;

    // Generate all legal candidate actions
    const candidateActions: LegalAction[] = [];
    const hasNonWildPlayable = playable.some(c => c.color !== 'wild');

    for (const card of playable) {
      if (card.color === 'wild') {
        // Hard AI strategically evaluates all 4 color choices for Wild cards
        for (const color of COLORS) {
          candidateActions.push({ type: 'play', card, chosenColor: color });
        }
      } else {
        candidateActions.push({ type: 'play', card });
      }
    }

    // Unseen card distribution for opponent matching probability estimation
    const unseenInfo = getUnseenCardCounts(ai.hand, state.discardPile);

    let bestAction: LegalAction = candidateActions[0];
    let bestScore = -Infinity;

    for (const action of candidateActions) {
      // Check time budget to guard execution in heavy environments
      if (Date.now() - startTime > this.timeBudgetMs) {
        break;
      }

      const card = action.card!;
      const simState = playCard(state, aiPlayerId, card.id, action.chosenColor, rng);

      // Immediate win condition
      if (simState.status === 'game_over' && simState.winner?.id === aiPlayerId) {
        return {
          type: 'play',
          cardId: card.id,
          chosenColor: action.chosenColor,
          shouldDeclareUno,
          reasoning: `Hard AI: Immediate winning move with ${card.name}`,
        };
      }

      // Base heuristic evaluation of resulting state
      let score = evaluateState(simState, aiPlayerId, HARD_WEIGHTS);

      // Bounded Lookahead Simulation: Evaluate next player's status
      const nextPlayer = simState.players[simState.currentPlayerIndex];

      if (nextPlayer.id === aiPlayerId) {
        // Player got another turn (e.g. Reverse in 2-player or Skip)
        score += 180;
      } else {
        const nextHandCount = nextPlayer.hand.length;

        // Threat: Opponent with 1 card remaining
        if (nextHandCount === 1) {
          // Model probability that next player can match this color/value based on unseen pool
          const matchingUnseen =
            (unseenInfo.colorCounts[simState.activeColor] || 0) +
            unseenInfo.colorCounts.wild;
          const matchProbability =
            unseenInfo.totalUnseen > 0
              ? matchingUnseen / unseenInfo.totalUnseen
              : 0.25;

          // Strongly penalize leaves where dangerous opponent has high probability of matching and winning
          score -= matchProbability * 800;

          // Reward moves that skipped or forced cards onto the dangerous opponent
          if (card.value === 'wild_draw4' || card.value === 'draw2') {
            score += 350;
          } else if (card.value === 'skip') {
            score += 300;
          } else if (card.value === 'reverse' && state.players.length >= 3) {
            score += 280; // Reverses away from dangerous opponent
          }
        }
      }

      // Wild card preservation policy
      if (card.color === 'wild' && hasNonWildPlayable) {
        const anyOpponentNearWin = state.players.some(p => p.id !== aiPlayerId && p.hand.length <= 2);
        // Only conserve wild if no immediate danger of opponent winning
        if (!anyOpponentNearWin) {
          score -= HARD_WEIGHTS.wildPlayConservationPenalty;
        }
      }

      // Subsequent Turn Self-Playability Bonus
      // How easily can the AI play on its next turn with this resulting color?
      const remainingHand = ai.hand.filter(c => c.id !== card.id);
      const remainingColorCounts = countCardsByColor(remainingHand);
      const matchingCardsInHand = remainingColorCounts[simState.activeColor] || 0;
      score += matchingCardsInHand * 25;

      // Deterministic tie-breaking (by card score, ID)
      if (score > bestScore + 0.001) {
        bestScore = score;
        bestAction = action;
      } else if (Math.abs(score - bestScore) <= 0.001) {
        // Tie-breaker: prefer higher score card to dump points, or deterministic ID comparison
        if (card.score > (bestAction.card?.score || 0)) {
          bestScore = score;
          bestAction = action;
        } else if (card.id < (bestAction.card?.id || '')) {
          bestScore = score;
          bestAction = action;
        }
      }
    }

    return {
      type: 'play',
      cardId: bestAction.card!.id,
      chosenColor: bestAction.chosenColor,
      shouldDeclareUno,
      reasoning: `Hard AI: Bounded lookahead selected ${bestAction.card!.name}${bestAction.chosenColor ? ` -> ${bestAction.chosenColor}` : ''} (score: ${Math.round(bestScore)})`,
    };
  }

  /**
   * Evaluates the best color choice for a Wild card by considering both own hand
   * and unseen card probabilities.
   */
  private predictBestWildColor(state: GameState, ai: Player, card: CardDefinition): CardColor {
    const handCounts = countCardsByColor(ai.hand.filter(c => c.id !== card.id));
    const unseen = getUnseenCardCounts(ai.hand, state.discardPile);

    let bestColor: CardColor = 'red';
    let maxAdvantage = -Infinity;

    for (const color of COLORS) {
      // Advantage = our cards in this color * 10 - opponent likely cards in this color
      const ourCards = handCounts[color] || 0;
      const unseenInColor = unseen.colorCounts[color] || 0;
      const advantage = ourCards * 15 - (unseenInColor / Math.max(1, unseen.totalUnseen)) * 10;

      if (advantage > maxAdvantage) {
        maxAdvantage = advantage;
        bestColor = color;
      }
    }

    return bestColor;
  }

  shouldCatchUno(state: GameState, aiPlayerId: string, rng = Math.random): Player | null {
    // Hard AI has 95% catching precision (rarely misses a forgotten UNO)
    if (rng() > 0.95) return null;

    for (const player of state.players) {
      if (player.id !== aiPlayerId && player.hand.length === 1 && !player.unoDeclared) {
        return player;
      }
    }
    return null;
  }
}
