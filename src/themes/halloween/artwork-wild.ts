import { HalloweenCardArtwork } from './artwork';

export const WILD_ARTWORKS: Record<string, HalloweenCardArtwork> = {
  wild: {
    cardKey: 'wild',
    title: 'The Haunted Grimoire',
    subtitle: 'The Four Elemental Flames',
    lore: 'Four ancient Halloween flames — Vampire Crimson, Midnight Haunt, Witchcraft Emerald, and Pumpkin Gold — dance around the spellbook.',
    renderIllustration: (p) => `
      <g id="art-wild">
        <!-- Nether Astral Ring & Runic Circle -->
        <circle cx="120" cy="165" r="54" fill="#0D0716" stroke="${p.primary}" stroke-width="2.5" />
        <circle cx="120" cy="165" r="48" fill="none" stroke="${p.frameGold}" stroke-width="1.2" stroke-dasharray="3,3" />

        <!-- Floating Ancient Open Spellbook -->
        <g transform="translate(120, 162)">
          <!-- Grimoire Leather Cover -->
          <path d="M -32 10 Q -16 5, 0 8 Q 16 5, 32 10 L 30 24 Q 15 18, 0 20 Q -15 18, -30 24 Z" fill="#2E104D" stroke="${p.frameGold}" stroke-width="1.8" />
          <!-- Parchment Pages -->
          <path d="M -30 7 Q -15 2, 0 5 Q 15 2, 30 7 L 28 20 Q 14 14, 0 16 Q -14 14, -28 20 Z" fill="#F3E8FF" />
          <!-- Eye of the Abyss in Grimoire Center -->
          <circle cx="0" cy="8" r="4.5" fill="#581C87" />
          <polygon points="0,5 2,8 0,11 -2,8" fill="#FCD34D" />
        </g>

        <!-- The Four Elemental Halloween Flames -->
        <!-- 1. Vampire Crimson Flame (Top-Left) -->
        <g transform="translate(86, 130)" filter="url(#glow-strong)">
          <path d="M 0 0 C -10 -6, -6 -18, 0 -24 C 6 -18, 10 -6, 0 0 Z" fill="#E11D48" />
          <circle cx="0" cy="-6" r="3" fill="#FDA4AF" />
        </g>

        <!-- 2. Midnight Spectral Blue Flame (Top-Right) -->
        <g transform="translate(154, 130)" filter="url(#glow-strong)">
          <path d="M 0 0 C -10 -6, -6 -18, 0 -24 C 6 -18, 10 -6, 0 0 Z" fill="#38BDF8" />
          <circle cx="0" cy="-6" r="3" fill="#BAE6FD" />
        </g>

        <!-- 3. Pumpkin Gold Flame (Bottom-Right) -->
        <g transform="translate(154, 192)" filter="url(#glow-strong)">
          <path d="M 0 0 C -10 -6, -6 -18, 0 -24 C 6 -18, 10 -6, 0 0 Z" fill="#F59E0B" />
          <circle cx="0" cy="-6" r="3" fill="#FEF08A" />
        </g>

        <!-- 4. Witchcraft Emerald Flame (Bottom-Left) -->
        <g transform="translate(86, 192)" filter="url(#glow-strong)">
          <path d="M 0 0 C -10 -6, -6 -18, 0 -24 C 6 -18, 10 -6, 0 0 Z" fill="#10B981" />
          <circle cx="0" cy="-6" r="3" fill="#A7F3D0" />
        </g>

        <!-- Prominent Gothic "WILD" Banner -->
        <g transform="translate(120, 208)" filter="url(#glow-strong)">
          <rect x="-42" y="-14" width="84" height="28" rx="14" fill="#150824" stroke="${p.frameGold}" stroke-width="2.5" />
          <text x="0" y="1" text-anchor="middle" dominant-baseline="central"
                font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
                font-size="16" font-weight="900" fill="#FFFFFF"
                letter-spacing="3">WILD</text>
        </g>
      </g>
    `,
  },

  wild_draw4: {
    cardKey: 'wild_draw4',
    title: 'Dark Grimoire Arcana',
    subtitle: 'Spectral Firestorm (+4)',
    lore: 'The supreme dark relic unleashes four searing projectiles of mystical fire, sealing the ultimate draw four penalty.',
    renderIllustration: (p) => `
      <g id="art-wild-draw4">
        <!-- Cosmic Astral Dark Core -->
        <circle cx="120" cy="155" r="56" fill="#0E051A" stroke="${p.primary}" stroke-width="3" />
        <circle cx="120" cy="155" r="48" fill="none" stroke="${p.frameGold}" stroke-width="1.5" stroke-dasharray="4,4" />

        <!-- Four Floating Mini Cards in Arch (Red, Blue, Green, Yellow) -->
        <g transform="translate(120, 140)">
          <!-- Red Card (Far Left) -->
          <g transform="translate(-42, 4) rotate(-24)">
            <rect x="-14" y="-22" width="28" height="44" rx="4" fill="#1A0307" stroke="#E11D48" stroke-width="3" />
            <rect x="-10" y="-18" width="20" height="36" rx="2" fill="#E11D48" />
          </g>

          <!-- Blue Card (Mid Left) -->
          <g transform="translate(-14, -6) rotate(-8)">
            <rect x="-14" y="-22" width="28" height="44" rx="4" fill="#050D1E" stroke="#38BDF8" stroke-width="3" />
            <rect x="-10" y="-18" width="20" height="36" rx="2" fill="#38BDF8" />
          </g>

          <!-- Green Card (Mid Right) -->
          <g transform="translate(14, -6) rotate(8)">
            <rect x="-14" y="-22" width="28" height="44" rx="4" fill="#04140B" stroke="#10B981" stroke-width="3" />
            <rect x="-10" y="-18" width="20" height="36" rx="2" fill="#10B981" />
          </g>

          <!-- Yellow Card (Far Right) -->
          <g transform="translate(42, 4) rotate(24)">
            <rect x="-14" y="-22" width="28" height="44" rx="4" fill="#1C0D02" stroke="#F59E0B" stroke-width="3" />
            <rect x="-10" y="-18" width="20" height="36" rx="2" fill="#F59E0B" />
          </g>
        </g>

        <!-- Four Fireball Projectiles trailing out -->
        <circle cx="70" cy="116" r="4.5" fill="#E11D48" filter="url(#glow-strong)" />
        <circle cx="106" cy="100" r="4.5" fill="#38BDF8" filter="url(#glow-strong)" />
        <circle cx="134" cy="100" r="4.5" fill="#10B981" filter="url(#glow-strong)" />
        <circle cx="170" cy="116" r="4.5" fill="#F59E0B" filter="url(#glow-strong)" />

        <!-- Bold Gothic +4 Central Emblem -->
        <g transform="translate(120, 188)" filter="url(#glow-strong)">
          <!-- Ornate Relic Base -->
          <rect x="-48" y="-22" width="96" height="44" rx="22" fill="#18072B" stroke="${p.frameGold}" stroke-width="3.5" />
          <text x="0" y="2" text-anchor="middle" dominant-baseline="central"
                font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
                font-size="40" font-weight="900" fill="#FFFFFF"
                stroke="${p.primary}" stroke-width="2" paint-order="stroke fill">+4</text>
        </g>
      </g>
    `,
  },
};
