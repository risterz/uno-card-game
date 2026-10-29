import { CardColor, CardDefinition } from '../../types/card';
import { GameState, Player } from '../types';
import { getPlayableCards } from '../rules';
import { AIMove, AIStrategy } from './types';
import { COLORS, getBestColorForHand, countCardsByColor } from './evaluation';

export class EasyAIStrategy implements AIStrategy {
  difficulty: 'easy' = 'easy';

  /**
   * Configurable mistake probability: 35% chance to make a suboptimal legal move.
   */
  private mistakeRate = 0.35;

  constructor(mistakeRate = 0.35) {
    this.mistakeRate = mistakeRate;
  }

  chooseAction(state: GameState, aiPlayerId: string, rng = Math.random): AIMove {
    const ai = state.players.find(p => p.id === aiPlayerId);
    if (!ai || !ai.isAI) return { type: 'draw' };

    // 1. Drawn card decision phase
    if (state.status === 'drawn_card_decision' && state.drawnCard) {
      const isWild = state.drawnCard.color === 'wild';
      const chosenColor = isWild ? this.chooseWildColor(ai.hand, rng) : undefined;
      return {
        type: 'play',
        cardId: state.drawnCard.id,
        chosenColor,
        reasoning: 'Easy AI: Playing drawn card',
      };
    }

    const topDiscard = state.discardPile[state.discardPile.length - 1];
    const playable = getPlayableCards(ai.hand, topDiscard, state.activeColor);

    // If no legal card, must draw
    if (playable.length === 0) {
      return { type: 'draw', reasoning: 'Easy AI: No playable cards, drawing' };
    }

    // UNO declaration: Easy AI is casual, forgets 45% of the time
    const shouldDeclareUno = ai.hand.length === 2 && rng() > 0.45;

    // Separate matching-color non-wilds, other non-wilds, and wilds
    const matchingColorNonWilds = playable.filter(c => c.color === state.activeColor);
    const valueMatchNonWilds = playable.filter(c => c.color !== 'wild' && c.color !== state.activeColor);
    const wilds = playable.filter(c => c.color === 'wild');

    let selectedCard: CardDefinition;

    // Suboptimal move generation (Easy mistake)
    const isMistake = rng() < this.mistakeRate;

    if (isMistake && playable.length > 1) {
      // Mistake 1: Burn a Wild card when a valid non-wild card is already playable
      if (wilds.length > 0 && (matchingColorNonWilds.length > 0 || valueMatchNonWilds.length > 0)) {
        selectedCard = wilds[Math.floor(rng() * wilds.length)];
      } else {
        // Mistake 2: Randomly pick from any playable card
        selectedCard = playable[Math.floor(rng() * playable.length)];
      }
    } else {
      // Casual competent behavior: simple color match first, then value match, then wild
      if (matchingColorNonWilds.length > 0) {
        selectedCard = matchingColorNonWilds[0];
      } else if (valueMatchNonWilds.length > 0) {
        selectedCard = valueMatchNonWilds[0];
      } else {
        selectedCard = wilds[0];
      }
    }

    const isWild = selectedCard.color === 'wild';
    const chosenColor = isWild ? this.chooseWildColor(ai.hand, rng) : undefined;

    return {
      type: 'play',
      cardId: selectedCard.id,
      chosenColor,
      shouldDeclareUno,
      reasoning: `Easy AI: Played ${selectedCard.name}${isMistake ? ' (casual choice)' : ''}`,
    };
  }

  /**
   * Easy AI chooses a color: usually best color, but occasionally picks a secondary color from hand.
   */
  private chooseWildColor(hand: CardDefinition[], rng: () => number): CardColor {
    const counts = countCardsByColor(hand);
    const availableColors = COLORS.filter(c => counts[c] > 0);

    // If only one color or no non-wild cards, pick standard best
    if (availableColors.length <= 1) {
      return getBestColorForHand(hand);
    }

    // 25% chance of picking a random color currently in hand rather than strictly majority
    if (rng() < 0.25) {
      return availableColors[Math.floor(rng() * availableColors.length)];
    }

    return getBestColorForHand(hand);
  }

  shouldCatchUno(state: GameState, aiPlayerId: string, rng = Math.random): Player | null {
    // Easy AI rarely notices forgotten UNO shouts (20% reaction)
    if (rng() > 0.20) return null;

    for (const player of state.players) {
      if (player.id !== aiPlayerId && player.hand.length === 1 && !player.unoDeclared) {
        return player;
      }
    }
    return null;
  }
}
