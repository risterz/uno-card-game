import { CardDefinition, CardValue } from '../../types/card';
import { CARD_CORNER_RADIUS, CARD_HEIGHT, CARD_VIEWBOX, CARD_WIDTH } from '../../utils/svg-card-generator';
import { HALLOWEEN_ARTWORKS, HALLOWEEN_PALETTES, HalloweenPalette } from './artwork';

/**
 * Generates corner badge SVG content for the Halloween theme.
 */
function renderHalloweenCornerBadge(value: CardValue, palette: HalloweenPalette): string {
  if (value === 'skip') {
    return `
      <g>
        <circle cx="0" cy="0" r="10" fill="none" stroke="#FFFFFF" stroke-width="3" />
        <line x1="-7" y1="-7" x2="7" y2="7" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
      </g>
    `;
  }

  if (value === 'reverse') {
    return `
      <g>
        <path d="M -8 1 C -8 -6, 4 -9, 8 -3" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" />
        <polygon points="5,-7 10,-3 9,-9" fill="#FFFFFF" />
        <path d="M 8 -1 C 8 6, -4 9, -8 3" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" />
        <polygon points="-5,7 -10,3 -9,9" fill="#FFFFFF" />
      </g>
    `;
  }

  if (value === 'draw2') {
    return `
      <g>
        <text x="0" y="0" text-anchor="middle" dominant-baseline="central"
              font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
              font-size="22" font-weight="900" fill="#FFFFFF"
              stroke="${palette.darkBg}" stroke-width="2" paint-order="stroke fill">+2</text>
      </g>
    `;
  }

  if (value === 'wild') {
    return `
      <g>
        <circle cx="0" cy="0" r="11" fill="#150824" stroke="${palette.frameGold}" stroke-width="1.5" />
        <path d="M 0 0 L -9 0 A 9 9 0 0 1 0 -9 Z" fill="#E11D48" />
        <path d="M 0 0 L 0 -9 A 9 9 0 0 1 9 0 Z" fill="#38BDF8" />
        <path d="M 0 0 L 9 0 A 9 9 0 0 1 0 9 Z" fill="#F59E0B" />
        <path d="M 0 0 L 0 9 A 9 9 0 0 1 -9 0 Z" fill="#10B981" />
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
              stroke="#000000" stroke-width="2.5" paint-order="stroke fill">+4</text>
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
            stroke="${palette.darkBg}" stroke-width="3" paint-order="stroke fill">${value}</text>
      ${is6or9 ? `<rect x="-10" y="14" width="20" height="3" rx="1.5" fill="#FFFFFF" stroke="${palette.darkBg}" stroke-width="1" />` : ''}
    </g>
  `;
}

/**
 * Generates dominant central numeral for number cards in Halloween styling.
 */
function renderDominantCenterNumeral(value: CardValue, palette: HalloweenPalette): string {
  if (value === 'skip' || value === 'reverse' || value === 'draw2' || value === 'wild' || value === 'wild_draw4') {
    return '';
  }

  const is6or9 = value === '6' || value === '9';
  return `
    <!-- Dominant Central Numeral -->
    <g filter="url(#drop-shadow-main)">
      <!-- Gothic drop-shadow & outline -->
      <text x="120" y="168" text-anchor="middle" dominant-baseline="central"
            font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
            font-size="94" font-weight="900" fill="#FFFFFF"
            stroke="${palette.darkBg}" stroke-width="9" paint-order="stroke fill" opacity="0.95">${value}</text>
      <text x="120" y="168" text-anchor="middle" dominant-baseline="central"
            font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
            font-size="94" font-weight="900" fill="#FFFFFF"
            stroke="${palette.frameGold}" stroke-width="2" paint-order="stroke fill">${value}</text>
      ${is6or9 ? `
        <rect x="86" y="220" width="68" height="8" rx="4" fill="${palette.darkBg}" stroke="${palette.frameGold}" stroke-width="1.8" />
        <rect x="88" y="221.5" width="64" height="5" rx="2.5" fill="#FFFFFF" />
      ` : ''}
    </g>
  `;
}

/**
 * Generates complete standalone SVG markup for a Halloween Collector's Deck card.
 */
export function generateHalloweenCardSvg(card: CardDefinition): string {
  const palette = HALLOWEEN_PALETTES[card.color];
  const artwork = HALLOWEEN_ARTWORKS[card.cardKey];
  const illustrationSvg = artwork
    ? artwork.renderIllustration(palette)
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CARD_VIEWBOX}" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" data-card-id="${card.id}" data-card-key="${card.cardKey}" data-theme="halloween">
  <defs>
    <!-- Card Body Dark Midnight Gradient -->
    <linearGradient id="card-grad-${card.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.secondary}" />
      <stop offset="45%" stop-color="${palette.darkBg}" />
      <stop offset="100%" stop-color="#070208" />
    </linearGradient>

    <!-- Blood Moon Gradient for Red -->
    <radialGradient id="blood-moon-grad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#FDA4AF" />
      <stop offset="30%" stop-color="#E11D48" />
      <stop offset="85%" stop-color="#881337" />
      <stop offset="100%" stop-color="#4C0519" />
    </radialGradient>

    <!-- Ruby Gem Gradient -->
    <linearGradient id="ruby-gem-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE4E6" />
      <stop offset="35%" stop-color="#FF4D6D" />
      <stop offset="80%" stop-color="#BA0D28" />
      <stop offset="100%" stop-color="#4C0519" />
    </linearGradient>

    <!-- Ghost Cyan Gradient for Blue -->
    <linearGradient id="ghost-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="40%" stop-color="#BAE6FD" />
      <stop offset="80%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0369A1" />
    </linearGradient>

    <linearGradient id="cyan-glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0369A1" />
    </linearGradient>

    <!-- Potion Vapor Gradient for Green -->
    <radialGradient id="potion-vapor-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ECFDF5" />
      <stop offset="35%" stop-color="#34D399" />
      <stop offset="75%" stop-color="#059669" />
      <stop offset="100%" stop-color="#064E3B" />
    </radialGradient>

    <!-- Harvest Moon Gradient for Yellow -->
    <radialGradient id="harvest-moon-grad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#FFFBEB" />
      <stop offset="30%" stop-color="#FEF08A" />
      <stop offset="70%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#9A3412" />
    </radialGradient>

    <!-- Glow & Shadow Filters -->
    <filter id="glow-soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="glow-strong" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="drop-shadow-main" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.85" />
    </filter>

    <filter id="drop-shadow-subtle" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.75" />
    </filter>

    <!-- Clip path for card corner rounding -->
    <clipPath id="hw-card-body-clip-${card.id}">
      <rect x="8" y="8" width="224" height="320" rx="14" ry="14" />
    </clipPath>
  </defs>

  <!-- 1. Physical Card Base (Gothic Obsidian Rim with Gold Trim) -->
  <rect x="1" y="1" width="238" height="334" rx="${CARD_CORNER_RADIUS}" ry="${CARD_CORNER_RADIUS}" fill="#0C0512" stroke="${palette.frameGold}" stroke-width="2.2" />

  <!-- 2. Inner Card Body with rich color fill -->
  <g clip-path="url(#hw-card-body-clip-${card.id})">
    <rect x="8" y="8" width="224" height="320" rx="14" ry="14" fill="url(#card-grad-${card.id})" />

    <!-- Gothic Ornamental Inner Filigree Frame -->
    <rect x="14" y="14" width="212" height="308" rx="10" ry="10" fill="none" stroke="${palette.frameGold}" stroke-width="1.4" opacity="0.85" />
    <rect x="17" y="17" width="206" height="302" rx="8" ry="8" fill="none" stroke="${palette.primary}" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.6" />

    <!-- Corner Spiderwebs -->
    <g transform="translate(16, 16)" opacity="0.35">
      <path d="M 0 0 L 26 0 M 0 0 L 22 14 M 0 0 L 14 22 M 0 0 L 0 26" stroke="#FFFFFF" stroke-width="0.7" />
      <path d="M 8 0 Q 6 5 0 8 M 16 0 Q 12 10 0 16 M 24 0 Q 18 16 0 24" fill="none" stroke="#FFFFFF" stroke-width="0.6" />
    </g>
    <g transform="translate(224, 16) scale(-1, 1)" opacity="0.35">
      <path d="M 0 0 L 26 0 M 0 0 L 22 14 M 0 0 L 14 22 M 0 0 L 0 26" stroke="#FFFFFF" stroke-width="0.7" />
      <path d="M 8 0 Q 6 5 0 8 M 16 0 Q 12 10 0 16 M 24 0 Q 18 16 0 24" fill="none" stroke="#FFFFFF" stroke-width="0.6" />
    </g>
    <g transform="translate(16, 320) scale(1, -1)" opacity="0.35">
      <path d="M 0 0 L 26 0 M 0 0 L 22 14 M 0 0 L 14 22 M 0 0 L 0 26" stroke="#FFFFFF" stroke-width="0.7" />
      <path d="M 8 0 Q 6 5 0 8 M 16 0 Q 12 10 0 16 M 24 0 Q 18 16 0 24" fill="none" stroke="#FFFFFF" stroke-width="0.6" />
    </g>
    <g transform="translate(224, 320) scale(-1, -1)" opacity="0.35">
      <path d="M 0 0 L 26 0 M 0 0 L 22 14 M 0 0 L 14 22 M 0 0 L 0 26" stroke="#FFFFFF" stroke-width="0.7" />
      <path d="M 8 0 Q 6 5 0 8 M 16 0 Q 12 10 0 16 M 24 0 Q 18 16 0 24" fill="none" stroke="#FFFFFF" stroke-width="0.6" />
    </g>

    <!-- 3. Central Gothic Arch/Vignette Backdrop -->
    <g filter="url(#drop-shadow-main)">
      <path d="M 45 240 L 45 130 C 45 65, 195 65, 195 130 L 195 240 Z" fill="#0C0412" stroke="${palette.primary}" stroke-width="2.5" opacity="0.8" />
      <path d="M 49 238 L 49 132 C 49 72, 191 72, 191 132 L 191 238 Z" fill="none" stroke="${palette.frameGold}" stroke-width="1.2" opacity="0.7" />
    </g>

    <!-- 4. Thematic Unique Artwork for This Specific Card -->
    ${illustrationSvg}

    <!-- 5. Dominant Central Numeral (for Number Cards) -->
    ${renderDominantCenterNumeral(card.value, palette)}

    <!-- 6. Top-Left Corner Symbol -->
    <g transform="translate(30, 36)" filter="url(#drop-shadow-subtle)">
      ${renderHalloweenCornerBadge(card.value, palette)}
    </g>

    <!-- 7. Bottom-Right Corner Symbol (180deg rotated) -->
    <g transform="translate(210, 300) rotate(180)" filter="url(#drop-shadow-subtle)">
      ${renderHalloweenCornerBadge(card.value, palette)}
    </g>
  </g>
</svg>`;
}

/**
 * Generates complete standalone SVG markup for the Halloween Card Back.
 */
export function generateHalloweenCardBackSvg(): string {
  const angles = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5];
  const rays = angles.map(deg => `<polygon points="0,-64 4,-50 -4,-50" transform="rotate(${deg})" fill="url(#hw-gold-grad)" />`).join('\n      ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CARD_VIEWBOX}" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" data-card-role="card-back" data-theme="halloween">
  <defs>
    <!-- Deep Obsidian Nether Void Gradient -->
    <linearGradient id="hw-back-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A0A2A" />
      <stop offset="35%" stop-color="#0E0517" />
      <stop offset="70%" stop-color="#14061A" />
      <stop offset="100%" stop-color="#06020A" />
    </linearGradient>

    <!-- Glowing Pumpkin Fire Gradient -->
    <radialGradient id="hw-back-fire" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFBEB" />
      <stop offset="30%" stop-color="#FEF08A" />
      <stop offset="65%" stop-color="#F59E0B" />
      <stop offset="90%" stop-color="#B45309" />
      <stop offset="100%" stop-color="#78350F" />
    </radialGradient>

    <!-- Antique Gold Gradient -->
    <linearGradient id="hw-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A" />
      <stop offset="50%" stop-color="#D4AF37" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>

    <!-- Shadow filters -->
    <filter id="hw-back-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.8" />
    </filter>

    <filter id="hw-glow-strong" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <clipPath id="hw-card-back-clip">
      <rect x="8" y="8" width="224" height="320" rx="14" ry="14" />
    </clipPath>
  </defs>

  <!-- 1. Physical Card Rim (Crisp Dark Obsidian with Antique Gold Edge) -->
  <rect x="1" y="1" width="238" height="334" rx="${CARD_CORNER_RADIUS}" ry="${CARD_CORNER_RADIUS}" fill="#0C0512" stroke="#D4AF37" stroke-width="2.2" />

  <!-- 2. Inner Card Surface with Clip -->
  <g clip-path="url(#hw-card-back-clip)">
    <!-- Dark Background -->
    <rect x="8" y="8" width="224" height="320" rx="14" ry="14" fill="url(#hw-back-bg)" />

    <!-- Gothic Ornamental Inner Border Frame -->
    <rect x="14" y="14" width="212" height="308" rx="10" ry="10" fill="none" stroke="url(#hw-gold-grad)" stroke-width="1.8" />
    <rect x="18" y="18" width="204" height="300" rx="8" ry="8" fill="none" stroke="#6B21A8" stroke-width="1" stroke-dasharray="4,3" opacity="0.7" />

    <!-- Four Corner Intricate Spiderwebs (Rotational & Mirror Symmetry) -->
    <!-- Top-Left Web -->
    <g transform="translate(18, 18)" opacity="0.45">
      <path d="M 0 0 L 32 0 M 0 0 L 28 16 M 0 0 L 16 28 M 0 0 L 0 32" stroke="#FFFFFF" stroke-width="0.8" />
      <path d="M 10 0 Q 8 6 0 10 M 20 0 Q 16 12 0 20 M 30 0 Q 24 18 0 30" fill="none" stroke="#FFFFFF" stroke-width="0.7" />
    </g>
    <!-- Top-Right Web -->
    <g transform="translate(222, 18) scale(-1, 1)" opacity="0.45">
      <path d="M 0 0 L 32 0 M 0 0 L 28 16 M 0 0 L 16 28 M 0 0 L 0 32" stroke="#FFFFFF" stroke-width="0.8" />
      <path d="M 10 0 Q 8 6 0 10 M 20 0 Q 16 12 0 20 M 30 0 Q 24 18 0 30" fill="none" stroke="#FFFFFF" stroke-width="0.7" />
    </g>
    <!-- Bottom-Left Web -->
    <g transform="translate(18, 318) scale(1, -1)" opacity="0.45">
      <path d="M 0 0 L 32 0 M 0 0 L 28 16 M 0 0 L 16 28 M 0 0 L 0 32" stroke="#FFFFFF" stroke-width="0.8" />
      <path d="M 10 0 Q 8 6 0 10 M 20 0 Q 16 12 0 20 M 30 0 Q 24 18 0 30" fill="none" stroke="#FFFFFF" stroke-width="0.7" />
    </g>
    <!-- Bottom-Right Web -->
    <g transform="translate(222, 318) scale(-1, -1)" opacity="0.45">
      <path d="M 0 0 L 32 0 M 0 0 L 28 16 M 0 0 L 16 28 M 0 0 L 0 32" stroke="#FFFFFF" stroke-width="0.8" />
      <path d="M 10 0 Q 8 6 0 10 M 20 0 Q 16 12 0 20 M 30 0 Q 24 18 0 30" fill="none" stroke="#FFFFFF" stroke-width="0.7" />
    </g>

    <!-- Symmetrical Moons in Top and Bottom Hemispheres -->
    <!-- Top Crescent Moon -->
    <g transform="translate(120, 52)">
      <circle cx="0" cy="0" r="14" fill="#FDE68A" filter="url(#hw-glow-strong)" />
      <circle cx="4" cy="-3" r="12" fill="#14061A" />
      <polygon points="-24,0 -21,2 -20,6 -19,2 -16,0 -19,-2 -20,-6 -21,-2" fill="#FDE68A" />
      <polygon points="24,0 21,2 20,6 19,2 16,0 19,-2 20,-6 21,-2" fill="#FDE68A" />
    </g>
    <!-- Bottom Crescent Moon (180 deg Rotated Symmetry) -->
    <g transform="translate(120, 284) rotate(180)">
      <circle cx="0" cy="0" r="14" fill="#FDE68A" filter="url(#hw-glow-strong)" />
      <circle cx="4" cy="-3" r="12" fill="#14061A" />
      <polygon points="-24,0 -21,2 -20,6 -19,2 -16,0 -19,-2 -20,-6 -21,-2" fill="#FDE68A" />
      <polygon points="24,0 21,2 20,6 19,2 16,0 19,-2 20,-6 21,-2" fill="#FDE68A" />
    </g>

    <!-- Symmetrical Bats (Top and Bottom) -->
    <g transform="translate(120, 84) scale(0.9)">
      <path d="M 0 -2 C 6 -10, 16 -10, 28 -4 C 24 4, 16 8, 12 14 C 8 6, 4 4, 0 8 C -4 4, -8 6, -12 14 C -16 8, -24 4, -28 -4 C -16 -10, -6 -10, 0 -2 Z" fill="#F59E0B" />
      <circle cx="-2" cy="-4" r="1.2" fill="#FFFFFF" />
      <circle cx="2" cy="-4" r="1.2" fill="#FFFFFF" />
    </g>
    <g transform="translate(120, 252) rotate(180) scale(0.9)">
      <path d="M 0 -2 C 6 -10, 16 -10, 28 -4 C 24 4, 16 8, 12 14 C 8 6, 4 4, 0 8 C -4 4, -8 6, -12 14 C -16 8, -24 4, -28 -4 C -16 -10, -6 -10, 0 -2 Z" fill="#F59E0B" />
      <circle cx="-2" cy="-4" r="1.2" fill="#FFFFFF" />
      <circle cx="2" cy="-4" r="1.2" fill="#FFFFFF" />
    </g>

    <!-- 3. Central Symmetrical Emblem: Symmetrical Pumpkin Skull / Medallion -->
    <g transform="translate(120, 168)" filter="url(#hw-back-shadow)">
      <!-- Outer Gothic Starburst Rays (16 Points Symmetrical) -->
      ${rays}

      <!-- Outer Stepped Gold Bezel Rings -->
      <circle cx="0" cy="0" r="54" fill="#12051E" stroke="url(#hw-gold-grad)" stroke-width="3.5" />
      <circle cx="0" cy="0" r="48" fill="none" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="3,3" />
      <circle cx="0" cy="0" r="44" fill="url(#hw-back-fire)" filter="url(#hw-glow-strong)" opacity="0.9" />

      <!-- Symmetrical Jack-o'-Lantern Emblem -->
      <!-- Center Pumpkin Rib Base -->
      <ellipse cx="0" cy="0" rx="36" ry="34" fill="#D97706" stroke="#451A03" stroke-width="2.5" />
      <ellipse cx="-16" cy="0" rx="14" ry="30" fill="#B45309" stroke="#451A03" stroke-width="1.8" />
      <ellipse cx="16" cy="0" rx="14" ry="30" fill="#B45309" stroke="#451A03" stroke-width="1.8" />
      <ellipse cx="0" cy="0" rx="16" ry="32" fill="#EA580C" stroke="#78350F" stroke-width="1.8" />

      <!-- Symmetrical Carved Eyes (Diamond / Triangle) -->
      <polygon points="-12,-10 -6,-18 -4,-8" fill="#FEF08A" filter="url(#hw-glow-strong)" />
      <polygon points="12,-10 6,-18 4,-8" fill="#FEF08A" filter="url(#hw-glow-strong)" />
      <polygon points="0,-6 -3,0 3,0" fill="#FEF08A" />

      <!-- Symmetrical Jagged Grinning Mouth -->
      <path d="M -16 10 L -11 16 L -6 11 L 0 17 L 6 11 L 11 16 L 16 10 L 11 13 L 6 9 L 0 14 L -6 9 L -11 13 Z" fill="#FEF08A" filter="url(#hw-glow-strong)" />

      <!-- Center Star Gem Core -->
      <polygon points="0,-3 2,0 0,3 -2,0" fill="#FFFFFF" />

      <!-- Symmetrical Gothic Gold Accents Left & Right -->
      <path d="M -48 0 C -42 -14, -36 -12, -36 0 C -36 12, -42 14, -48 0 Z" fill="url(#hw-gold-grad)" />
      <path d="M 48 0 C 42 -14, 36 -12, 36 0 C 36 12, 42 14, 48 0 Z" fill="url(#hw-gold-grad)" />
    </g>
  </g>
</svg>`;
}
