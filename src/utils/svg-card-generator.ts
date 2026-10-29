import { CardColor, CardDefinition, CardValue } from '../types/card';

export interface CardColorPalette {
  primary: string;
  gradientStart: string;
  gradientEnd: string;
  darkAccent: string;
  lightAccent: string;
  textStroke: string;
}

export const COLOR_PALETTES: Record<CardColor, CardColorPalette> = {
  red: {
    primary: '#E61938',
    gradientStart: '#FF3358',
    gradientEnd: '#BA0D28',
    darkAccent: '#7D0014',
    lightAccent: '#FFE3E8',
    textStroke: '#6E0010',
  },
  blue: {
    primary: '#0066E5',
    gradientStart: '#1E88FF',
    gradientEnd: '#0047B8',
    darkAccent: '#002B73',
    lightAccent: '#E0EEFF',
    textStroke: '#002361',
  },
  green: {
    primary: '#00A852',
    gradientStart: '#10C865',
    gradientEnd: '#00853E',
    darkAccent: '#005224',
    lightAccent: '#E2F8EC',
    textStroke: '#00471F',
  },
  yellow: {
    primary: '#F5A600',
    gradientStart: '#FFBF1A',
    gradientEnd: '#D98200',
    darkAccent: '#8A4F00',
    lightAccent: '#FFF5DC',
    textStroke: '#7A4300',
  },
  wild: {
    primary: '#1E1B2E',
    gradientStart: '#2F2B48',
    gradientEnd: '#13111F',
    darkAccent: '#0A0812',
    lightAccent: '#FFFFFF',
    textStroke: '#000000',
  },
};

/**
 * Standard card canvas dimensions
 */
export const CARD_WIDTH = 240;
export const CARD_HEIGHT = 336;
export const CARD_CORNER_RADIUS = 18;
export const CARD_VIEWBOX = `0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`;

/**
 * Generates an SVG path for the Skip symbol.
 */
function renderSkipSymbol(size: 'center' | 'corner', color: string): string {
  if (size === 'corner') {
    return `
      <g>
        <circle cx="0" cy="0" r="10" fill="none" stroke="${color}" stroke-width="3.2" />
        <line x1="-7" y1="-7" x2="7" y2="7" stroke="${color}" stroke-width="3.2" stroke-linecap="round" />
      </g>
    `;
  }

  // Center symbol: bold, polished prohibition symbol with inner depth
  return `
    <g filter="url(#drop-shadow-main)">
      <circle cx="120" cy="168" r="48" fill="none" stroke="${color}" stroke-width="14" />
      <line x1="86" y1="134" x2="154" y2="202" stroke="${color}" stroke-width="14" stroke-linecap="round" />
      <!-- Subtle interior bevel -->
      <circle cx="120" cy="168" r="41" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.4" />
    </g>
  `;
}

/**
 * Generates an SVG path for the Reverse symbol.
 */
function renderReverseSymbol(size: 'center' | 'corner', color: string): string {
  if (size === 'corner') {
    return `
      <g>
        <!-- Top curved arrow -->
        <path d="M -8 1 C -8 -6, 4 -9, 8 -3" fill="none" stroke="${color}" stroke-width="2.8" stroke-linecap="round" />
        <polygon points="5,-7 10,-3 9,-9" fill="${color}" />
        <!-- Bottom curved arrow -->
        <path d="M 8 -1 C 8 6, -4 9, -8 3" fill="none" stroke="${color}" stroke-width="2.8" stroke-linecap="round" />
        <polygon points="-5,7 -10,3 -9,9" fill="${color}" />
      </g>
    `;
  }

  // Center symbol: two large swooping aerodynamic arrows in a dynamic loop
  return `
    <g filter="url(#drop-shadow-main)">
      <!-- Top looping track & arrow pointing right-down -->
      <path d="M 78 174 C 74 136, 126 120, 154 142" 
            fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" />
      <polygon points="144,124 168,146 142,160" fill="${color}" />
      <polygon points="144,124 168,146 142,160" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.5" />

      <!-- Bottom looping track & arrow pointing left-up -->
      <path d="M 162 162 C 166 200, 114 216, 86 194" 
            fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" />
      <polygon points="96,212 72,190 98,176" fill="${color}" />
      <polygon points="96,212 72,190 98,176" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.5" />
    </g>
  `;
}

/**
 * Generates an SVG path for the Draw Two (+2) symbol.
 */
function renderDraw2Symbol(size: 'center' | 'corner', color: string): string {
  if (size === 'corner') {
    return `
      <g>
        <text x="0" y="0" text-anchor="middle" dominant-baseline="central"
              font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
              font-size="22" font-weight="900" fill="${color}"
              stroke="#FFFFFF" stroke-width="1.5" paint-order="stroke fill">+2</text>
      </g>
    `;
  }

  // Center symbol: two stacked cards with a prominent "+2" badge
  return `
    <g filter="url(#drop-shadow-main)">
      <!-- Back card -->
      <g transform="translate(102, 150) rotate(-14)">
        <rect x="-24" y="-36" width="48" height="72" rx="6" fill="#FFFFFF" stroke="${color}" stroke-width="5" />
        <rect x="-18" y="-30" width="36" height="60" rx="4" fill="${color}" fill-opacity="0.2" />
      </g>
      <!-- Front card -->
      <g transform="translate(132, 160) rotate(10)">
        <rect x="-24" y="-36" width="48" height="72" rx="6" fill="#FFFFFF" stroke="${color}" stroke-width="5" />
        <rect x="-18" y="-30" width="36" height="60" rx="4" fill="${color}" fill-opacity="0.85" />
      </g>
      <!-- Central bold +2 emblem -->
      <g transform="translate(120, 172)">
        <text x="0" y="0" text-anchor="middle" dominant-baseline="central"
              font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
              font-size="64" font-weight="900" fill="#FFFFFF"
              stroke="${color}" stroke-width="8" paint-order="stroke fill"
              filter="url(#drop-shadow-subtle)">+2</text>
        <text x="0" y="0" text-anchor="middle" dominant-baseline="central"
              font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
              font-size="64" font-weight="900" fill="${color}">+2</text>
      </g>
    </g>
  `;
}

/**
 * Generates an SVG path for the Wild 4-quadrant emblem.
 */
function renderWildCenterSymbol(): string {
  // 4 circular segments (Red top-left, Blue top-right, Yellow bottom-right, Green bottom-left)
  return `
    <g filter="url(#drop-shadow-main)">
      <g transform="translate(120, 168)">
        <!-- Outer protective ring -->
        <circle cx="0" cy="0" r="54" fill="#FFFFFF" stroke="#1E1B2E" stroke-width="4" />
        
        <!-- Red quadrant: top-left (-180 to -90 deg) -->
        <path d="M 0 0 L -48 0 A 48 48 0 0 1 0 -48 Z" fill="#E61938" />
        
        <!-- Blue quadrant: top-right (-90 to 0 deg) -->
        <path d="M 0 0 L 0 -48 A 48 48 0 0 1 48 0 Z" fill="#0066E5" />
        
        <!-- Yellow quadrant: bottom-right (0 to 90 deg) -->
        <path d="M 0 0 L 48 0 A 48 48 0 0 1 0 48 Z" fill="#F5A600" />
        
        <!-- Green quadrant: bottom-left (90 to 180 deg) -->
        <path d="M 0 0 L 0 48 A 48 48 0 0 1 -48 0 Z" fill="#00A852" />

        <!-- Crisp cross divider -->
        <line x1="-50" y1="0" x2="50" y2="0" stroke="#FFFFFF" stroke-width="4" />
        <line x1="0" y1="-50" x2="0" y2="50" stroke="#FFFFFF" stroke-width="4" />

        <!-- Inner Core Star / Diamond Jewel -->
        <circle cx="0" cy="0" r="16" fill="#1E1B2E" stroke="#FFFFFF" stroke-width="3" />
        <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#FFFFFF" />

        <!-- Bold decorative badge text "WILD" arched banner -->
        <g transform="translate(0, 58)">
          <rect x="-38" y="-12" width="76" height="24" rx="12" fill="#1E1B2E" stroke="#FFFFFF" stroke-width="2.5" />
          <text x="0" y="1" text-anchor="middle" dominant-baseline="central"
                font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
                font-size="14" font-weight="900" fill="#FFFFFF" letter-spacing="2">WILD</text>
        </g>
      </g>
    </g>
  `;
}

/**
 * Generates an SVG path for the Wild Draw Four symbol.
 */
function renderWildDraw4CenterSymbol(): string {
  return `
    <g filter="url(#drop-shadow-main)">
      <!-- 4 miniature fanned cards representing the 4 colors -->
      <g transform="translate(120, 148)">
        <!-- Red Card (far left) -->
        <g transform="translate(-40, 6) rotate(-24)">
          <rect x="-18" y="-28" width="36" height="56" rx="5" fill="#FFFFFF" stroke="#E61938" stroke-width="4" />
          <rect x="-14" y="-24" width="28" height="48" rx="3" fill="#E61938" />
        </g>
        
        <!-- Blue Card (mid left) -->
        <g transform="translate(-14, -6) rotate(-8)">
          <rect x="-18" y="-28" width="36" height="56" rx="5" fill="#FFFFFF" stroke="#0066E5" stroke-width="4" />
          <rect x="-14" y="-24" width="28" height="48" rx="3" fill="#0066E5" />
        </g>

        <!-- Green Card (mid right) -->
        <g transform="translate(14, -6) rotate(8)">
          <rect x="-18" y="-28" width="36" height="56" rx="5" fill="#FFFFFF" stroke="#00A852" stroke-width="4" />
          <rect x="-14" y="-24" width="28" height="48" rx="3" fill="#00A852" />
        </g>

        <!-- Yellow Card (far right) -->
        <g transform="translate(40, 6) rotate(24)">
          <rect x="-18" y="-28" width="36" height="56" rx="5" fill="#FFFFFF" stroke="#F5A600" stroke-width="4" />
          <rect x="-14" y="-24" width="28" height="48" rx="3" fill="#F5A600" />
        </g>
      </g>

      <!-- Prominent Foreground +4 Emblem -->
      <g transform="translate(120, 192)">
        <rect x="-48" y="-22" width="96" height="44" rx="22" fill="#1E1B2E" stroke="#FFFFFF" stroke-width="4" />
        <text x="0" y="2" text-anchor="middle" dominant-baseline="central"
              font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
              font-size="38" font-weight="900" fill="#FFFFFF"
              stroke="#000000" stroke-width="1" paint-order="stroke fill">+4</text>
      </g>
    </g>
  `;
}

/**
 * Generates corner badge SVG content based on card value and color.
 */
function renderCornerBadge(value: CardValue, color: CardColor): string {
  const palette = COLOR_PALETTES[color];

  if (value === 'skip') {
    return renderSkipSymbol('corner', '#FFFFFF');
  }

  if (value === 'reverse') {
    return renderReverseSymbol('corner', '#FFFFFF');
  }

  if (value === 'draw2') {
    return renderDraw2Symbol('corner', '#FFFFFF');
  }

  if (value === 'wild') {
    return `
      <g>
        <circle cx="0" cy="0" r="11" fill="#FFFFFF" stroke="#1E1B2E" stroke-width="1.5" />
        <path d="M 0 0 L -9 0 A 9 9 0 0 1 0 -9 Z" fill="#E61938" />
        <path d="M 0 0 L 0 -9 A 9 9 0 0 1 9 0 Z" fill="#0066E5" />
        <path d="M 0 0 L 9 0 A 9 9 0 0 1 0 9 Z" fill="#F5A600" />
        <path d="M 0 0 L 0 9 A 9 9 0 0 1 -9 0 Z" fill="#00A852" />
        <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
      </g>
    `;
  }

  if (value === 'wild_draw4') {
    return `
      <g>
        <text x="0" y="0" text-anchor="middle" dominant-baseline="central"
              font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
              font-size="22" font-weight="900" fill="#FFFFFF"
              stroke="#000000" stroke-width="2" paint-order="stroke fill">+4</text>
      </g>
    `;
  }

  // Number corner label (0-9)
  const is6or9 = value === '6' || value === '9';
  return `
    <g>
      <text x="0" y="0" text-anchor="middle" dominant-baseline="central"
            font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
            font-size="30" font-weight="900" fill="#FFFFFF"
            stroke="${palette.darkAccent}" stroke-width="2" paint-order="stroke fill">${value}</text>
      ${is6or9 ? `<rect x="-10" y="14" width="20" height="3" rx="1.5" fill="#FFFFFF" stroke="${palette.darkAccent}" stroke-width="1" />` : ''}
    </g>
  `;
}

/**
 * Generates center artwork SVG content based on card value and color.
 */
function renderCenterArtwork(value: CardValue, color: CardColor): string {
  const palette = COLOR_PALETTES[color];

  if (value === 'skip') {
    return renderSkipSymbol('center', palette.primary);
  }

  if (value === 'reverse') {
    return renderReverseSymbol('center', palette.primary);
  }

  if (value === 'draw2') {
    return renderDraw2Symbol('center', palette.primary);
  }

  if (value === 'wild') {
    return renderWildCenterSymbol();
  }

  if (value === 'wild_draw4') {
    return renderWildDraw4CenterSymbol();
  }

  // Large central numeral (0-9)
  const is6or9 = value === '6' || value === '9';
  return `
    <g filter="url(#drop-shadow-main)">
      <text x="120" y="168" text-anchor="middle" dominant-baseline="central"
            font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
            font-size="104" font-weight="900" fill="${palette.primary}"
            stroke="#FFFFFF" stroke-width="6" paint-order="stroke fill">${value}</text>
      <text x="120" y="168" text-anchor="middle" dominant-baseline="central"
            font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
            font-size="104" font-weight="900" fill="${palette.primary}">${value}</text>
      ${is6or9 ? `
        <rect x="88" y="222" width="64" height="8" rx="4" fill="#FFFFFF" stroke="${palette.primary}" stroke-width="2" />
        <rect x="90" y="223.5" width="60" height="5" rx="2.5" fill="${palette.primary}" />
      ` : ''}
    </g>
  `;
}

/**
 * Generates complete standalone SVG markup for a Card.
 */
export function generateCardSvg(card: CardDefinition): string {
  const palette = COLOR_PALETTES[card.color];
  const isWild = card.color === 'wild';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CARD_VIEWBOX}" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" data-card-id="${card.id}" data-card-key="${card.cardKey}">
  <defs>
    <!-- Card Body Gradient -->
    <linearGradient id="card-grad-${card.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.gradientStart}" />
      <stop offset="100%" stop-color="${palette.gradientEnd}" />
    </linearGradient>

    <!-- Subtle table drop shadow -->
    <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.3" />
    </filter>

    <!-- Main graphic drop shadow -->
    <filter id="drop-shadow-main" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.35" />
    </filter>

    <!-- Subtle element shadow -->
    <filter id="drop-shadow-subtle" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.25" />
    </filter>

    <!-- Clip path for card corner rounding -->
    <clipPath id="card-body-clip-${card.id}">
      <rect x="8" y="8" width="224" height="320" rx="14" ry="14" />
    </clipPath>
  </defs>

  <!-- 1. Physical Card Base (Crisp White Border) -->
  <rect x="1" y="1" width="238" height="334" rx="${CARD_CORNER_RADIUS}" ry="${CARD_CORNER_RADIUS}" fill="#FFFFFF" stroke="#E2E4E9" stroke-width="2" />

  <!-- 2. Inner Card Body with rich color fill -->
  <g clip-path="url(#card-body-clip-${card.id})">
    <rect x="8" y="8" width="224" height="320" rx="14" ry="14" fill="url(#card-grad-${card.id})" />

    <!-- Dynamic Energy Background Waves/Lines -->
    <g opacity="0.12">
      <path d="M 0 0 L 240 336 M -40 100 L 200 436 M 40 -100 L 280 236" stroke="#FFFFFF" stroke-width="32" stroke-linecap="round" />
      <circle cx="120" cy="168" r="140" fill="none" stroke="#FFFFFF" stroke-width="40" opacity="0.4" />
    </g>

    <!-- 3. Central Tilted Badge Oval -->
    <g filter="url(#drop-shadow-main)">
      <ellipse cx="120" cy="168" rx="84" ry="58"
               transform="rotate(-24 120 168)"
               fill="${isWild ? '#12111D' : '#FFFFFF'}"
               stroke="${isWild ? '#3A3654' : '#FFFFFF'}"
               stroke-width="5" />
      ${!isWild ? `
        <!-- Inner subtle outline in the tilted ellipse -->
        <ellipse cx="120" cy="168" rx="77" ry="51"
                 transform="rotate(-24 120 168)"
                 fill="none"
                 stroke="${palette.lightAccent}"
                 stroke-width="3" />
      ` : `
        <ellipse cx="120" cy="168" rx="77" ry="51"
                 transform="rotate(-24 120 168)"
                 fill="none"
                 stroke="#27233D"
                 stroke-width="3" />
      `}
    </g>

    <!-- 4. Central Large Symbol / Numeral -->
    ${renderCenterArtwork(card.value, card.color)}

    <!-- 5. Top-Left Corner Symbol -->
    <g transform="translate(30, 36)" filter="url(#drop-shadow-subtle)">
      ${renderCornerBadge(card.value, card.color)}
    </g>

    <!-- 6. Bottom-Right Corner Symbol (180deg rotated) -->
    <g transform="translate(210, 300) rotate(180)" filter="url(#drop-shadow-subtle)">
      ${renderCornerBadge(card.value, card.color)}
    </g>
  </g>
</svg>`;
}

/**
 * Generates standalone SVG markup for the Card Back.
 */
export function generateCardBackSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CARD_VIEWBOX}" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" data-card-role="card-back">
  <defs>
    <!-- Card Back Deep Obsidian Gradient -->
    <linearGradient id="card-back-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#241E38" />
      <stop offset="50%" stop-color="#141120" />
      <stop offset="100%" stop-color="#0A0812" />
    </linearGradient>

    <!-- Radiant Inner Glow -->
    <linearGradient id="back-oval-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF3358" />
      <stop offset="35%" stop-color="#E61938" />
      <stop offset="70%" stop-color="#BA0D28" />
      <stop offset="100%" stop-color="#7D0014" />
    </linearGradient>

    <filter id="back-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.5" />
    </filter>

    <clipPath id="card-back-clip">
      <rect x="8" y="8" width="224" height="320" rx="14" ry="14" />
    </clipPath>
  </defs>

  <!-- Physical White Card Border -->
  <rect x="1" y="1" width="238" height="334" rx="${CARD_CORNER_RADIUS}" ry="${CARD_CORNER_RADIUS}" fill="#FFFFFF" stroke="#D0D3DB" stroke-width="2" />

  <!-- Inner Back Surface -->
  <g clip-path="url(#card-back-clip)">
    <rect x="8" y="8" width="224" height="320" rx="14" ry="14" fill="url(#card-back-bg)" />

    <!-- Energetic Concentric Rings Pattern -->
    <g opacity="0.16">
      <circle cx="120" cy="168" r="30" fill="none" stroke="#FFFFFF" stroke-width="2" />
      <circle cx="120" cy="168" r="60" fill="none" stroke="#FFFFFF" stroke-width="2" />
      <circle cx="120" cy="168" r="90" fill="none" stroke="#FFFFFF" stroke-width="2" />
      <circle cx="120" cy="168" r="120" fill="none" stroke="#FFFFFF" stroke-width="2" />
      <circle cx="120" cy="168" r="150" fill="none" stroke="#FFFFFF" stroke-width="2" />
      <!-- Diagonal Rays -->
      <line x1="0" y1="0" x2="240" y2="336" stroke="#FFFFFF" stroke-width="2" />
      <line x1="240" y1="0" x2="0" y2="336" stroke="#FFFFFF" stroke-width="2" />
      <line x1="120" y1="0" x2="120" y2="336" stroke="#FFFFFF" stroke-width="1.5" />
      <line x1="0" y1="168" x2="240" y2="168" stroke="#FFFFFF" stroke-width="1.5" />
    </g>

    <!-- 4 Corner Geometric Gem Accents -->
    <g opacity="0.75" fill="#FFFFFF">
      <!-- Top-left -->
      <polygon points="28,26 34,32 28,38 22,32" />
      <!-- Top-right -->
      <polygon points="212,26 218,32 212,38 206,32" />
      <!-- Bottom-left -->
      <polygon points="28,298 34,304 28,310 22,304" />
      <!-- Bottom-right -->
      <polygon points="212,298 218,304 212,310 206,304" />
    </g>

    <!-- Outer Tilted White Oval Rim -->
    <g filter="url(#back-shadow)">
      <ellipse cx="120" cy="168" rx="86" ry="58"
               transform="rotate(-24 120 168)"
               fill="#FFFFFF" />
      <!-- Inner Vibrant Oval Badge -->
      <ellipse cx="120" cy="168" rx="78" ry="50"
               transform="rotate(-24 120 168)"
               fill="url(#back-oval-grad)"
               stroke="#FFE3E8"
               stroke-width="3" />
    </g>

    <!-- Central Symmetrical Emblem (Fanned Card Star / Crest) -->
    <g transform="translate(120, 168)" filter="url(#back-shadow)">
      <!-- 4 Colored Card Leaves in Cross Formation -->
      <!-- Top (Red) -->
      <rect x="-8" y="-36" width="16" height="26" rx="3" fill="#E61938" stroke="#FFFFFF" stroke-width="1.5" />
      <!-- Right (Blue) -->
      <rect x="10" y="-8" width="26" height="16" rx="3" fill="#0066E5" stroke="#FFFFFF" stroke-width="1.5" />
      <!-- Bottom (Yellow) -->
      <rect x="-8" y="10" width="16" height="26" rx="3" fill="#F5A600" stroke="#FFFFFF" stroke-width="1.5" />
      <!-- Left (Green) -->
      <rect x="-36" y="-8" width="26" height="16" rx="3" fill="#00A852" stroke="#FFFFFF" stroke-width="1.5" />

      <!-- Center Star Gem -->
      <circle cx="0" cy="0" r="14" fill="#FFFFFF" stroke="#141120" stroke-width="2.5" />
      <polygon points="0,-10 3,-3 10,0 3,3 0,10 -3,3 -10,0 -3,-3" fill="#E61938" />

      <!-- Center Typography Banner "CARDS" -->
      <g transform="translate(0, 0)">
        <text x="0" y="32" text-anchor="middle" dominant-baseline="central"
              font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
              font-size="16" font-weight="900" fill="#FFFFFF"
              stroke="#0A0812" stroke-width="3" paint-order="stroke fill"
              letter-spacing="4">CARDS</text>
      </g>
    </g>
  </g>
</svg>`;
}
