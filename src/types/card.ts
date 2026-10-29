export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';

export type CardType = 'number' | 'action' | 'wild';

export type CardValue =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'skip'
  | 'reverse'
  | 'draw2'
  | 'wild'
  | 'wild_draw4';

export interface CardDefinition {
  id: string;             // Unique identifier, e.g. "red-7-1", "blue-skip-2", "wild-1"
  cardKey: string;        // Asset/template key, e.g. "red-7", "blue-skip", "wild"
  color: CardColor;       // Card color family
  type: CardType;         // Card category
  value: CardValue;       // Card face value
  name: string;           // Formatted name, e.g. "Red 7", "Blue Skip", "Wild Draw Four"
  score: number;          // Standard game points value (0-9: face, action: 20, wild: 50)
  instanceIndex: number;  // 1 or 2 for duplicates, 1-4 for wild duplicates
}

export type CardSize = 'sm' | 'md' | 'lg' | 'xl' | 'responsive' | 'hand';

export interface DeckStatistics {
  totalCards: number;
  byColor: Record<CardColor, number>;
  byType: Record<CardType, number>;
  byValue: Record<CardValue, number>;
  uniqueCardKeys: number;
}
