import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CardDefinition } from '../types/card';
import { generateCardBackSvg as generateClassicCardBackSvg, generateCardSvg as generateClassicCardSvg } from '../utils/svg-card-generator';
import { generateHalloweenCardBackSvg, generateHalloweenCardSvg } from './halloween/halloween-generator';

export type CardThemeId = 'classic' | 'halloween';

export interface CardTheme {
  id: CardThemeId;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  previewColor: string;
  previewCardKey: string;
  generateCardSvg: (card: CardDefinition) => string;
  generateCardBackSvg: () => string;
}

export const CARD_THEMES: Record<CardThemeId, CardTheme> = {
  classic: {
    id: 'classic',
    name: 'Classic Deck',
    tagline: 'Standard Tournament UNO Style',
    description: 'Crisp vector primary colors, clean modern typography, and the tournament standard UNO design.',
    badge: 'Standard 108',
    previewColor: '#E61938',
    previewCardKey: 'red-7',
    generateCardSvg: generateClassicCardSvg,
    generateCardBackSvg: generateClassicCardBackSvg,
  },
  halloween: {
    id: 'halloween',
    name: "Halloween Collector's Deck",
    tagline: '54 Unique Spooky Handcrafted Illustrations',
    description: 'Premium gothic collectible card skin. Handcrafted vector artwork for every single card design: vampires, spectral phantoms, witches, and pumpkin harvest magic.',
    badge: 'Collector Edition',
    previewColor: '#881337',
    previewCardKey: 'red-1',
    generateCardSvg: generateHalloweenCardSvg,
    generateCardBackSvg: generateHalloweenCardBackSvg,
  },
};

export const AVAILABLE_THEMES: CardTheme[] = Object.values(CARD_THEMES);

export function getCardTheme(id: CardThemeId): CardTheme {
  return CARD_THEMES[id] || CARD_THEMES.classic;
}

interface CardThemeContextType {
  currentTheme: CardThemeId;
  themeConfig: CardTheme;
  setTheme: (theme: CardThemeId) => void;
  availableThemes: CardTheme[];
}

const CardThemeContext = createContext<CardThemeContextType>({
  currentTheme: 'classic',
  themeConfig: CARD_THEMES.classic,
  setTheme: () => {},
  availableThemes: AVAILABLE_THEMES,
});

const STORAGE_KEY = 'uno_selected_card_theme';

export const CardThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentThemeState] = useState<CardThemeId>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'classic' || saved === 'halloween') {
          return saved;
        }
      } catch {
        // Fallback on storage errors
      }
    }
    return 'classic';
  });

  const setTheme = (theme: CardThemeId) => {
    setCurrentThemeState(theme);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        // Ignore storage errors
      }
    }
  };

  const themeConfig = getCardTheme(currentTheme);

  return (
    <CardThemeContext.Provider value={{ currentTheme, themeConfig, setTheme, availableThemes: AVAILABLE_THEMES }}>
      {children}
    </CardThemeContext.Provider>
  );
};

export function useCardTheme() {
  return useContext(CardThemeContext);
}
