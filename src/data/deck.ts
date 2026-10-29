import { CardColor, CardDefinition, CardType, CardValue, DeckStatistics } from '../types/card';

const STANDARD_COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow'];
const NUMBER_VALUES: CardValue[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ACTION_VALUES: CardValue[] = ['skip', 'reverse', 'draw2'];

function formatCardName(color: CardColor, value: CardValue): string {
  if (value === 'wild') return 'Wild';
  if (value === 'wild_draw4') return 'Wild Draw Four';

  const colorCap = color.charAt(0).toUpperCase() + color.slice(1);
  if (value === 'skip') return `${colorCap} Skip`;
  if (value === 'reverse') return `${colorCap} Reverse`;
  if (value === 'draw2') return `${colorCap} Draw Two`;
  return `${colorCap} ${value}`;
}

export function getCardScore(value: CardValue): number {
  if (value === 'wild' || value === 'wild_draw4') return 50;
  if (value === 'skip' || value === 'reverse' || value === 'draw2') return 20;
  return parseInt(value, 10);
}

/**
 * Builds the official 108-card deck deterministically.
 */
export function createStandardDeck(): CardDefinition[] {
  const cards: CardDefinition[] = [];

  // 1. Number cards (76 cards total)
  for (const color of STANDARD_COLORS) {
    // Exactly one 0 per color
    cards.push({
      id: `${color}-0-1`,
      cardKey: `${color}-0`,
      color,
      type: 'number',
      value: '0',
      name: formatCardName(color, '0'),
      score: 0,
      instanceIndex: 1,
    });

    // Exactly two of 1 through 9 per color
    for (const num of NUMBER_VALUES.slice(1)) {
      for (let instance = 1; instance <= 2; instance++) {
        cards.push({
          id: `${color}-${num}-${instance}`,
          cardKey: `${color}-${num}`,
          color,
          type: 'number',
          value: num,
          name: formatCardName(color, num),
          score: parseInt(num, 10),
          instanceIndex: instance,
        });
      }
    }
  }

  // 2. Colored action cards (24 cards total)
  for (const color of STANDARD_COLORS) {
    for (const action of ACTION_VALUES) {
      for (let instance = 1; instance <= 2; instance++) {
        cards.push({
          id: `${color}-${action}-${instance}`,
          cardKey: `${color}-${action}`,
          color,
          type: 'action',
          value: action,
          name: formatCardName(color, action),
          score: 20,
          instanceIndex: instance,
        });
      }
    }
  }

  // 3. Wild cards (8 cards total)
  for (let instance = 1; instance <= 4; instance++) {
    cards.push({
      id: `wild-${instance}`,
      cardKey: 'wild',
      color: 'wild',
      type: 'wild',
      value: 'wild',
      name: formatCardName('wild', 'wild'),
      score: 50,
      instanceIndex: instance,
    });
  }

  for (let instance = 1; instance <= 4; instance++) {
    cards.push({
      id: `wild_draw4-${instance}`,
      cardKey: 'wild_draw4',
      color: 'wild',
      type: 'wild',
      value: 'wild_draw4',
      name: formatCardName('wild', 'wild_draw4'),
      score: 50,
      instanceIndex: instance,
    });
  }

  return cards;
}

/**
 * Standard 108-card deck constant.
 */
export const FULL_DECK: CardDefinition[] = createStandardDeck();

/**
 * Get unique card keys (templates) needed for asset generation.
 * Total: 4 colors * (10 numbers + 3 actions) + 2 wilds = 4 * 13 + 2 = 54 unique card templates.
 */
export function getUniqueCardTemplates(): CardDefinition[] {
  const seen = new Set<string>();
  const templates: CardDefinition[] = [];

  for (const card of FULL_DECK) {
    if (!seen.has(card.cardKey)) {
      seen.add(card.cardKey);
      templates.push(card);
    }
  }

  return templates;
}

/**
 * Computes deck statistics for validation and UI dashboard.
 */
export function computeDeckStatistics(deck: CardDefinition[] = FULL_DECK): DeckStatistics {
  const byColor: Record<CardColor, number> = {
    red: 0,
    blue: 0,
    green: 0,
    yellow: 0,
    wild: 0,
  };

  const byType: Record<CardType, number> = {
    number: 0,
    action: 0,
    wild: 0,
  };

  const byValue: Record<CardValue, number> = {
    '0': 0, '1': 0, '2': 0, '3': 0, '4': 0,
    '5': 0, '6': 0, '7': 0, '8': 0, '9': 0,
    'skip': 0, 'reverse': 0, 'draw2': 0,
    'wild': 0, 'wild_draw4': 0,
  };

  const uniqueKeys = new Set<string>();

  for (const card of deck) {
    byColor[card.color]++;
    byType[card.type]++;
    byValue[card.value]++;
    uniqueKeys.add(card.cardKey);
  }

  return {
    totalCards: deck.length,
    byColor,
    byType,
    byValue,
    uniqueCardKeys: uniqueKeys.size,
  };
}
