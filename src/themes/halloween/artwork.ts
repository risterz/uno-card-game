/**
 * Halloween Collector's Deck — Unique Illustration System
 * Handcrafted vector artwork for all 54 unique card templates.
 */

export interface HalloweenCardArtwork {
  cardKey: string;
  title: string;
  subtitle: string;
  lore: string;
  renderIllustration: (palette: HalloweenPalette) => string;
}

export interface HalloweenPalette {
  primary: string;
  secondary: string;
  accent: string;
  darkBg: string;
  lightGlow: string;
  frameGold: string;
  borderStroke: string;
}

export const HALLOWEEN_PALETTES: Record<'red' | 'blue' | 'green' | 'yellow' | 'wild', HalloweenPalette> = {
  red: {
    primary: '#E11D48',      // Vampire Crimson
    secondary: '#881337',    // Blood Wine
    accent: '#FDA4AF',       // Rose highlight
    darkBg: '#1B0409',       // Obsidian Crypt
    lightGlow: '#FF4D6D',     // Eerie Blood Glow
    frameGold: '#D4AF37',    // Antique Gold
    borderStroke: '#4C0519',
  },
  blue: {
    primary: '#38BDF8',      // Spectral Cyan
    secondary: '#0369A1',    // Midnight Cobalt
    accent: '#BAE6FD',       // Ghostly White-Cyan
    darkBg: '#050D1E',       // Abyssal Midnight
    lightGlow: '#00F0FF',     // Will-o'-Wisp Glow
    frameGold: '#A5B4FC',    // Spectral Silver
    borderStroke: '#0C2D57',
  },
  green: {
    primary: '#10B981',      // Toxic Emerald
    secondary: '#065F46',    // Witch Moss
    accent: '#A7F3D0',       // Glowing Spore
    darkBg: '#04140B',       // Cursed Bog
    lightGlow: '#34D399',     // Potion Vapor Glow
    frameGold: '#C5A059',    // Antique Witch Gold
    borderStroke: '#064E3B',
  },
  yellow: {
    primary: '#F59E0B',      // Pumpkin Gold
    secondary: '#B45309',    // Harvest Russet
    accent: '#FDE68A',       // Candlelight Amber
    darkBg: '#1C0D02',       // Haunted Cornfield
    lightGlow: '#FBBF24',     // Jack-o'-Lantern Glow
    frameGold: '#EAB308',    // Gilded Harvest
    borderStroke: '#78350F',
  },
  wild: {
    primary: '#A855F7',      // Nether Amethyst
    secondary: '#581C87',    // Abyssal Void
    accent: '#F3E8FF',       // Astral Prism
    darkBg: '#0D0714',       // Cosmic Void
    lightGlow: '#C084FC',     // Arcane Aura
    frameGold: '#F59E0B',    // Alchemical Gold
    borderStroke: '#3B0764',
  },
};

// Reusable SVG utility snippets for gothic detail
export const SVG_SNIPPETS = {
  spiderweb: (x: number, y: number, scale = 1, opacity = 0.35) => `
    <g transform="translate(${x}, ${y}) scale(${scale})" opacity="${opacity}">
      <path d="M 0 0 L 30 0 M 0 0 L 26 15 M 0 0 L 15 26 M 0 0 L 0 30" stroke="#FFFFFF" stroke-width="0.8" />
      <path d="M 8 0 Q 7 4 0 8 M 16 0 Q 14 8 0 16 M 24 0 Q 21 12 0 24" fill="none" stroke="#FFFFFF" stroke-width="0.7" />
    </g>
  `,
  batSilhouette: (cx: number, cy: number, scale = 1, fill = '#1A080C') => `
    <g transform="translate(${cx}, ${cy}) scale(${scale})">
      <path d="M 0 -2 C 3 -6, 8 -6, 14 -3 C 12 2, 8 4, 6 7 C 4 3, 2 2, 0 4 C -2 2, -4 3, -6 7 C -8 4, -12 2, -14 -3 C -8 -6, -3 -6, 0 -2 Z" fill="${fill}" />
      <circle cx="-1" cy="-3" r="0.7" fill="#FF4D6D" />
      <circle cx="1" cy="-3" r="0.7" fill="#FF4D6D" />
    </g>
  `,
  star: (cx: number, cy: number, r = 3, fill = '#FFFFFF', opacity = 0.8) => `
    <polygon points="${cx},${cy - r} ${cx + r * 0.3},${cy - r * 0.3} ${cx + r},${cy} ${cx + r * 0.3},${cy + r * 0.3} ${cx},${cy + r} ${cx - r * 0.3},${cy + r * 0.3} ${cx - r},${cy} ${cx - r * 0.3},${cy - r * 0.3}" fill="${fill}" opacity="${opacity}" />
  `,
};

import { RED_ARTWORKS } from './artwork-red';
import { BLUE_ARTWORKS } from './artwork-blue';
import { GREEN_ARTWORKS } from './artwork-green';
import { YELLOW_ARTWORKS } from './artwork-yellow';
import { WILD_ARTWORKS } from './artwork-wild';

export const HALLOWEEN_ARTWORKS: Record<string, HalloweenCardArtwork> = {
  ...RED_ARTWORKS,
  ...BLUE_ARTWORKS,
  ...GREEN_ARTWORKS,
  ...YELLOW_ARTWORKS,
  ...WILD_ARTWORKS,
};
