import { HalloweenCardArtwork, SVG_SNIPPETS } from './artwork';

export const BLUE_ARTWORKS: Record<string, HalloweenCardArtwork> = {
  'blue-0': {
    cardKey: 'blue-0',
    title: 'Abyssal Lake Spirit',
    subtitle: 'Spectral Waters of Silence',
    lore: 'From the deepest chill of the drowned graveyard lake, the spirit of zero stirs ripples across the surface of the void.',
    renderIllustration: (p) => `
      <g id="art-blue-0">
        <!-- Ethereal Lake Waters Backdrop -->
        <ellipse cx="120" cy="180" rx="60" ry="32" fill="#0A1835" stroke="${p.primary}" stroke-width="1.5" />
        <!-- Concentric Ripples -->
        <ellipse cx="120" cy="180" rx="46" ry="24" fill="none" stroke="${p.lightGlow}" stroke-width="1.2" opacity="0.6" />
        <ellipse cx="120" cy="180" rx="28" ry="14" fill="none" stroke="${p.lightGlow}" stroke-width="1.2" opacity="0.8" />

        <!-- Ethereal Water Spirit Silhouette -->
        <g transform="translate(120, 145)" filter="url(#glow-strong)">
          <!-- Flowing Ghost Spirit Body -->
          <path d="M 0 -28 C 12 -28, 20 -15, 18 5 C 16 25, 24 35, 16 48 C 6 42, 0 45, -8 48 C -14 38, -16 22, -18 5 C -20 -15, -12 -28, 0 -28 Z" fill="url(#ghost-cyan-grad)" opacity="0.85" />
          <!-- Flowing Spirit Hair/Veil -->
          <path d="M -16 -10 Q -32 5, -24 30 M 16 -10 Q 32 5, 24 30" stroke="${p.accent}" stroke-width="2" fill="none" />
          <!-- Glowing Spirit Face -->
          <circle cx="-5" cy="-8" r="2.2" fill="#FFFFFF" />
          <circle cx="5" cy="-8" r="2.2" fill="#FFFFFF" />
          <ellipse cx="0" cy="2" rx="3" ry="5" fill="#051026" />
        </g>

        <!-- Eerie Graveyard Reeds in Mist -->
        <path d="M 70 200 Q 66 160, 62 140 M 74 205 Q 72 170, 76 145" stroke="${p.frameGold}" stroke-width="1.8" />
        <path d="M 170 200 Q 174 160, 178 140 M 166 205 Q 168 170, 164 145" stroke="${p.frameGold}" stroke-width="1.8" />
      </g>
    `,
  },

  'blue-1': {
    cardKey: 'blue-1',
    title: 'Moonlit Gravestone',
    subtitle: 'The Solitary Cross',
    lore: 'A single ancient Celtic cross stands vigil over forgotten bones, guided by the lonely spark of a will-o-wisp.',
    renderIllustration: (p) => `
      <g id="art-blue-1">
        <!-- Pale Crescent Moon -->
        <g transform="translate(155, 120)">
          <circle cx="0" cy="0" r="24" fill="${p.accent}" filter="url(#glow-soft)" />
          <circle cx="8" cy="-6" r="20" fill="#050D1E" />
        </g>

        <!-- Cemetery Mound & Celtic Cross Gravestone -->
        <path d="M 65 225 Q 120 205, 175 225 L 175 230 L 65 230 Z" fill="#09142B" />

        <g transform="translate(112, 175)">
          <!-- Cross Base -->
          <rect x="-18" y="24" width="36" height="15" rx="3" fill="#142448" stroke="${p.primary}" stroke-width="1.5" />
          <rect x="-14" y="10" width="28" height="15" fill="#182C58" stroke="${p.primary}" stroke-width="1.5" />
          <!-- Vertical Post -->
          <rect x="-7" y="-45" width="14" height="60" fill="#1E376E" stroke="${p.frameGold}" stroke-width="1.5" />
          <!-- Horizontal Crossbar -->
          <rect x="-24" y="-30" width="48" height="14" fill="#1E376E" stroke="${p.frameGold}" stroke-width="1.5" />
          <!-- Celtic Halo Ring -->
          <circle cx="0" cy="-23" r="16" fill="none" stroke="${p.frameGold}" stroke-width="2.5" />
          <!-- Runic Inscriptions on Cross -->
          <line x1="0" y1="-40" x2="0" y2="5" stroke="${p.primary}" stroke-width="1.2" stroke-dasharray="2,2" />
        </g>

        <!-- Dancing Will-o'-the-Wisp -->
        <g transform="translate(148, 160)" filter="url(#glow-strong)">
          <circle cx="0" cy="0" r="7" fill="${p.lightGlow}" />
          <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
          <!-- Wisp Tail -->
          <path d="M 0 6 Q -8 16, 2 24" stroke="${p.lightGlow}" stroke-width="2" fill="none" />
        </g>
      </g>
    `,
  },

  'blue-2': {
    cardKey: 'blue-2',
    title: 'Two Spectral Cats',
    subtitle: 'Sentinels of the Mausoleum',
    lore: 'Twin feline phantoms watch the cemetery gates, their glowing sapphire eyes piercing the veil of midnight.',
    renderIllustration: (p) => `
      <g id="art-blue-2">
        <!-- Stone Mausoleum Plinth -->
        <rect x="70" y="195" width="100" height="30" rx="4" fill="#0A1835" stroke="${p.primary}" stroke-width="2" />
        <line x1="75" y1="205" x2="165" y2="205" stroke="${p.frameGold}" stroke-width="1.2" />

        <!-- Distant Midnight Stars -->
        ${SVG_SNIPPETS.star(80, 110, 2.5, '#BAE6FD', 0.8)}
        ${SVG_SNIPPETS.star(160, 115, 2.5, '#BAE6FD', 0.8)}
        ${SVG_SNIPPETS.star(120, 95, 3, '#FFFFFF', 0.9)}

        <!-- Left Spectral Cat -->
        <g transform="translate(95, 175)">
          <!-- Body -->
          <path d="M 0 20 C -12 20, -18 5, -12 -10 C -8 -18, 0 -18, 5 -10 C 10 5, 8 20, 0 20 Z" fill="#030A17" stroke="${p.primary}" stroke-width="1.5" />
          <!-- Head & Ears -->
          <circle cx="-3" cy="-18" r="9" fill="#030A17" stroke="${p.primary}" stroke-width="1.5" />
          <polygon points="-10,-24 -12,-32 -4,-26" fill="${p.primary}" />
          <polygon points="4,-24 6,-32 -2,-26" fill="${p.primary}" />
          <!-- Glowing Eyes -->
          <circle cx="-6" cy="-18" r="1.8" fill="#38BDF8" filter="url(#glow-soft)" />
          <circle cx="0" cy="-18" r="1.8" fill="#38BDF8" filter="url(#glow-soft)" />
          <!-- Tail -->
          <path d="M -10 16 Q -22 18, -20 0" stroke="${p.lightGlow}" stroke-width="2.2" fill="none" />
        </g>

        <!-- Right Spectral Cat (Mirrored) -->
        <g transform="translate(145, 175)">
          <!-- Body -->
          <path d="M 0 20 C 12 20, 18 5, 12 -10 C 8 -18, 0 -18, -5 -10 C -10 5, -8 20, 0 20 Z" fill="#030A17" stroke="${p.primary}" stroke-width="1.5" />
          <!-- Head & Ears -->
          <circle cx="3" cy="-18" r="9" fill="#030A17" stroke="${p.primary}" stroke-width="1.5" />
          <polygon points="10,-24 12,-32 4,-26" fill="${p.primary}" />
          <polygon points="-4,-24 -6,-32 2,-26" fill="${p.primary}" />
          <!-- Glowing Eyes -->
          <circle cx="6" cy="-18" r="1.8" fill="#38BDF8" filter="url(#glow-soft)" />
          <circle cx="0" cy="-18" r="1.8" fill="#38BDF8" filter="url(#glow-soft)" />
          <!-- Tail -->
          <path d="M 10 16 Q 22 18, 20 0" stroke="${p.lightGlow}" stroke-width="2.2" fill="none" />
        </g>
      </g>
    `,
  },

  'blue-3': {
    cardKey: 'blue-3',
    title: 'Three Floating Skulls',
    subtitle: 'The Spectral Triumvirate',
    lore: 'Three phantom skulls hover in triangular alignment, breathing cold blue hellfire into the midnight gale.',
    renderIllustration: (p) => `
      <g id="art-blue-3">
        <!-- Midnight Mist Aura -->
        <circle cx="120" cy="160" r="48" fill="#0B1E42" opacity="0.6" filter="url(#glow-soft)" />

        <!-- Skull 1 (Top Center) -->
        <g transform="translate(120, 130)" filter="url(#glow-soft)">
          <!-- Blue Ghost Flame Backdrop -->
          <path d="M 0 -22 C -12 -10, -10 14, 0 20 C 10 14, 12 -10, 0 -22 Z" fill="${p.lightGlow}" opacity="0.5" />
          <!-- Cranium -->
          <ellipse cx="0" cy="-2" rx="13" ry="11" fill="#E0F2FE" stroke="#0369A1" stroke-width="1.5" />
          <!-- Jaw -->
          <rect x="-6" y="7" width="12" height="8" rx="2" fill="#E0F2FE" stroke="#0369A1" stroke-width="1.5" />
          <!-- Eye Sockets -->
          <circle cx="-5" cy="-2" r="3" fill="#050D1E" />
          <circle cx="5" cy="-2" r="3" fill="#050D1E" />
          <circle cx="-5" cy="-2" r="1.2" fill="#00F0FF" />
          <circle cx="5" cy="-2" r="1.2" fill="#00F0FF" />
          <polygon points="-2,3 0,1 2,3" fill="#050D1E" />
        </g>

        <!-- Skull 2 (Bottom Left) -->
        <g transform="translate(88, 178)" filter="url(#glow-soft)">
          <path d="M 0 -18 C -10 -8, -8 10, 0 16 C 8 10, 10 -8, 0 -18 Z" fill="${p.lightGlow}" opacity="0.4" />
          <ellipse cx="0" cy="-2" rx="11" ry="9" fill="#BAE6FD" stroke="#0369A1" stroke-width="1.5" />
          <rect x="-5" y="6" width="10" height="6" rx="2" fill="#BAE6FD" stroke="#0369A1" stroke-width="1.5" />
          <circle cx="-4" cy="-2" r="2.5" fill="#050D1E" />
          <circle cx="4" cy="-2" r="2.5" fill="#050D1E" />
          <circle cx="-4" cy="-2" r="1" fill="#00F0FF" />
          <circle cx="4" cy="-2" r="1" fill="#00F0FF" />
        </g>

        <!-- Skull 3 (Bottom Right) -->
        <g transform="translate(152, 178)" filter="url(#glow-soft)">
          <path d="M 0 -18 C -10 -8, -8 10, 0 16 C 8 10, 10 -8, 0 -18 Z" fill="${p.lightGlow}" opacity="0.4" />
          <ellipse cx="0" cy="-2" rx="11" ry="9" fill="#BAE6FD" stroke="#0369A1" stroke-width="1.5" />
          <rect x="-5" y="6" width="10" height="6" rx="2" fill="#BAE6FD" stroke="#0369A1" stroke-width="1.5" />
          <circle cx="-4" cy="-2" r="2.5" fill="#050D1E" />
          <circle cx="4" cy="-2" r="2.5" fill="#050D1E" />
          <circle cx="-4" cy="-2" r="1" fill="#00F0FF" />
          <circle cx="4" cy="-2" r="1" fill="#00F0FF" />
        </g>

        <!-- Connecting Ghost Flame Leylines -->
        <path d="M 120 142 L 88 170 L 152 170 Z" fill="none" stroke="${p.lightGlow}" stroke-width="1.2" stroke-dasharray="3,3" opacity="0.7" />
      </g>
    `,
  },

  'blue-4': {
    cardKey: 'blue-4',
    title: 'Four Dancing Ghosts',
    subtitle: 'The Graveyard Fountain Waltz',
    lore: 'Four playful specters waltz in a never-ending ring around the mossy gargoyle fountain of St. Jude.',
    renderIllustration: (p) => `
      <g id="art-blue-4">
        <!-- Stone Cemetery Fountain -->
        <g transform="translate(120, 175)">
          <ellipse cx="0" cy="25" rx="36" ry="10" fill="#08142C" stroke="${p.primary}" stroke-width="2" />
          <rect x="-8" y="0" width="16" height="25" fill="#12254C" stroke="${p.frameGold}" stroke-width="1.5" />
          <ellipse cx="0" cy="0" rx="20" ry="7" fill="#0E1D3D" stroke="${p.primary}" stroke-width="1.5" />
          <circle cx="0" cy="-10" r="5" fill="${p.lightGlow}" filter="url(#glow-soft)" />
        </g>

        <!-- Four Floating Wispy Ghosts in Ring -->
        <!-- Ghost 1 (Top) -->
        <g transform="translate(120, 118)" filter="url(#glow-soft)">
          <path d="M 0 -12 C 8 -12, 10 -4, 8 6 C 6 14, 0 16, -6 14 C -10 10, -8 -12, 0 -12 Z" fill="#E0F2FE" opacity="0.85" />
          <circle cx="-2" cy="-6" r="1.5" fill="#0369A1" />
          <circle cx="2" cy="-6" r="1.5" fill="#0369A1" />
        </g>

        <!-- Ghost 2 (Right) -->
        <g transform="translate(155, 150)" filter="url(#glow-soft)">
          <path d="M 12 0 C 12 8, 4 10, -6 8 C -14 6, -16 0, -14 -6 C -10 -10, 12 -8, 12 0 Z" fill="#BAE6FD" opacity="0.85" />
          <circle cx="4" cy="-2" r="1.5" fill="#0369A1" />
          <circle cx="4" cy="2" r="1.5" fill="#0369A1" />
        </g>

        <!-- Ghost 3 (Bottom) -->
        <g transform="translate(120, 185)" filter="url(#glow-soft)">
          <path d="M 0 12 C -8 12, -10 4, -8 -6 C -6 -14, 0 -16, 6 -14 C 10 -10, 8 12, 0 12 Z" fill="#E0F2FE" opacity="0.85" />
          <circle cx="-2" cy="4" r="1.5" fill="#0369A1" />
          <circle cx="2" cy="4" r="1.5" fill="#0369A1" />
        </g>

        <!-- Ghost 4 (Left) -->
        <g transform="translate(85, 150)" filter="url(#glow-soft)">
          <path d="M -12 0 C -12 -8, -4 -10, 6 -8 C 14 -6, 16 0, 14 6 C 10 10, -12 8, -12 0 Z" fill="#BAE6FD" opacity="0.85" />
          <circle cx="-4" cy="-2" r="1.5" fill="#0369A1" />
          <circle cx="-4" cy="2" r="1.5" fill="#0369A1" />
        </g>
      </g>
    `,
  },

  'blue-5': {
    cardKey: 'blue-5',
    title: 'Phantom Ghost Galleon',
    subtitle: 'The Ship of Drowned Souls',
    lore: 'With torn glowing rigging and ethereal blue hull, the phantom galleon sails eternal through the mist.',
    renderIllustration: (p) => `
      <g id="art-blue-5">
        <!-- Mist Waters & Ethereal Horizon -->
        <rect x="65" y="195" width="110" height="35" rx="6" fill="#061226" stroke="${p.secondary}" stroke-width="1.5" />
        <path d="M 65 205 Q 120 195, 175 205" stroke="${p.lightGlow}" stroke-width="1.5" fill="none" opacity="0.6" />

        <!-- Midnight Blue Crescent Moon -->
        <circle cx="150" cy="120" r="22" fill="#BAE6FD" opacity="0.7" filter="url(#glow-soft)" />
        <circle cx="156" cy="116" r="18" fill="#050D1E" />

        <!-- Ghost Galleon -->
        <g transform="translate(116, 165)" filter="url(#glow-soft)">
          <!-- Hull -->
          <path d="M -42 16 C -32 26, 30 26, 44 14 C 40 4, 32 0, 24 2 C 0 4, -30 2, -42 16 Z" fill="#0E244C" stroke="${p.primary}" stroke-width="2" />
          <!-- Glowing Portholes -->
          <circle cx="-22" cy="14" r="2" fill="${p.lightGlow}" />
          <circle cx="-6" cy="14" r="2" fill="${p.lightGlow}" />
          <circle cx="10" cy="14" r="2" fill="${p.lightGlow}" />
          <circle cx="26" cy="12" r="2" fill="${p.lightGlow}" />

          <!-- Main Mast & Tattered Sails -->
          <line x1="0" y1="2" x2="0" y2="-44" stroke="${p.frameGold}" stroke-width="2.5" />
          <path d="M -22 -12 Q 0 -6, 22 -12 L 18 -26 Q 0 -20, -18 -26 Z" fill="#BAE6FD" opacity="0.75" stroke="${p.lightGlow}" stroke-width="1" />
          <path d="M -16 -30 Q 0 -26, 16 -30 L 12 -40 Q 0 -36, -12 -40 Z" fill="#E0F2FE" opacity="0.8" stroke="${p.lightGlow}" stroke-width="1" />

          <!-- Fore Mast -->
          <line x1="-24" y1="4" x2="-24" y2="-32" stroke="${p.frameGold}" stroke-width="2" />
          <path d="M -36 -8 Q -24 -4, -12 -8 L -14 -22 Q -24 -18, -34 -22 Z" fill="#BAE6FD" opacity="0.65" />

          <!-- Rigging Lines -->
          <line x1="0" y1="-44" x2="-40" y2="10" stroke="${p.primary}" stroke-width="1" stroke-dasharray="2,2" />
          <line x1="0" y1="-44" x2="42" y2="10" stroke="${p.primary}" stroke-width="1" stroke-dasharray="2,2" />
        </g>
      </g>
    `,
  },

  'blue-6': {
    cardKey: 'blue-6',
    title: 'Soul Prison Lantern',
    subtitle: 'Six Captured Wisps',
    lore: 'Trapped behind beveled glass and cold iron, six wandering souls illuminate the foggy crossroads.',
    renderIllustration: (p) => `
      <g id="art-blue-6">
        <!-- Hanging Lantern Bracket -->
        <path d="M 65 105 L 120 105 L 120 125" stroke="${p.frameGold}" stroke-width="3" fill="none" stroke-linecap="round" />
        <circle cx="120" cy="125" r="4" fill="${p.secondary}" />

        <!-- Victorian Iron Lantern -->
        <g transform="translate(120, 170)">
          <!-- Lantern Cap & Finial -->
          <polygon points="0,-48 -28,-32 28,-32" fill="#091838" stroke="${p.primary}" stroke-width="2" />
          <circle cx="0" cy="-48" r="3.5" fill="${p.frameGold}" />
          <!-- Lantern Glass Chamber -->
          <rect x="-24" y="-32" width="48" height="54" rx="4" fill="#0A2248" stroke="${p.primary}" stroke-width="2.5" />
          <!-- Frosted Glass Core Glow -->
          <rect x="-20" y="-28" width="40" height="46" rx="2" fill="url(#cyan-glow-grad)" opacity="0.85" filter="url(#glow-soft)" />

          <!-- 6 Trapped Dancing Soul Wisps -->
          <circle cx="-10" cy="-18" r="3.5" fill="#FFFFFF" filter="url(#glow-strong)" />
          <circle cx="10" cy="-16" r="3" fill="#FFFFFF" filter="url(#glow-strong)" />
          <circle cx="-4" cy="-5" r="4" fill="#FFFFFF" filter="url(#glow-strong)" />
          <circle cx="11" cy="4" r="3.5" fill="#FFFFFF" filter="url(#glow-strong)" />
          <circle cx="-11" cy="9" r="3" fill="#FFFFFF" filter="url(#glow-strong)" />
          <circle cx="2" cy="13" r="3.5" fill="#FFFFFF" filter="url(#glow-strong)" />

          <!-- Iron Base & Spire -->
          <polygon points="-28,22 28,22 18,36 -18,36" fill="#091838" stroke="${p.primary}" stroke-width="2" />
          <polygon points="0,48 -5,36 5,36" fill="${p.frameGold}" />
        </g>
      </g>
    `,
  },

  'blue-7': {
    cardKey: 'blue-7',
    title: 'Midnight Cat & Seven Stars',
    subtitle: 'The Astral Watcher',
    lore: 'High upon the gnarled witch tree, a spectral black cat communes with the seven starry guardians of the North.',
    renderIllustration: (p) => `
      <g id="art-blue-7">
        <!-- Seven Glowing Cyan Stars (Constellation Pattern) -->
        ${SVG_SNIPPETS.star(75, 105, 3.5, '#00F0FF', 0.95)}
        ${SVG_SNIPPETS.star(95, 115, 3.2, '#00F0FF', 0.9)}
        ${SVG_SNIPPETS.star(120, 100, 4, '#FFFFFF', 1)}
        ${SVG_SNIPPETS.star(145, 108, 3.2, '#00F0FF', 0.9)}
        ${SVG_SNIPPETS.star(165, 122, 3.5, '#00F0FF', 0.95)}
        ${SVG_SNIPPETS.star(135, 135, 3, '#BAE6FD', 0.85)}
        ${SVG_SNIPPETS.star(110, 142, 3, '#BAE6FD', 0.85)}

        <!-- Constellation Lines -->
        <polyline points="75,105 95,115 120,100 145,108 165,122 135,135 110,142 95,115" stroke="${p.primary}" stroke-width="1" stroke-dasharray="2,3" fill="none" opacity="0.6" />

        <!-- Gnarled Dead Oak Branch -->
        <path d="M 65 210 Q 110 180, 175 195 L 175 220 Q 120 200, 65 225 Z" fill="#08142A" stroke="${p.secondary}" stroke-width="1.5" />
        <path d="M 120 188 Q 135 165, 155 170" stroke="${p.secondary}" stroke-width="2.5" fill="none" />

        <!-- Spectral Black Cat Silhouette Perched -->
        <g transform="translate(108, 172)">
          <!-- Arched Back Body -->
          <path d="M 0 15 C -8 15, -14 0, -8 -8 C -4 -16, 8 -16, 12 -4 C 14 6, 8 15, 0 15 Z" fill="#030814" stroke="${p.primary}" stroke-width="1.8" />
          <!-- Head & Pointed Ears -->
          <circle cx="12" cy="-12" r="8" fill="#030814" stroke="${p.primary}" stroke-width="1.5" />
          <polygon points="8,-18 10,-26 14,-20" fill="${p.primary}" />
          <polygon points="15,-18 18,-26 20,-18" fill="${p.primary}" />
          <!-- Glowing Eyes staring up at stars -->
          <circle cx="14" cy="-14" r="1.8" fill="#00F0FF" filter="url(#glow-soft)" />
          <circle cx="18" cy="-13" r="1.8" fill="#00F0FF" filter="url(#glow-soft)" />
          <!-- Curled Tail hanging down branch -->
          <path d="M -8 10 Q -18 20, -12 34" stroke="${p.lightGlow}" stroke-width="2.5" fill="none" />
        </g>
      </g>
    `,
  },

  'blue-8': {
    cardKey: 'blue-8',
    title: 'Eight Will-o-the-Wisps',
    subtitle: 'The Cemetery Swarm',
    lore: 'Eight shimmering phantom orbs guide unwary wanderers off the cobblestone path and into the haunted marshes.',
    renderIllustration: (p) => `
      <g id="art-blue-8">
        <!-- Wrought-Iron Cemetery Gates Silhouette -->
        <g stroke="${p.secondary}" stroke-width="2" fill="none">
          <line x1="75" y1="160" x2="75" y2="230" />
          <line x1="90" y1="150" x2="90" y2="230" />
          <line x1="105" y1="140" x2="105" y2="230" />
          <line x1="120" y1="130" x2="120" y2="230" />
          <line x1="135" y1="140" x2="135" y2="230" />
          <line x1="150" y1="150" x2="150" y2="230" />
          <line x1="165" y1="160" x2="165" y2="230" />
          <!-- Spire Points -->
          <path d="M 65 170 Q 120 120, 175 170" stroke="${p.frameGold}" stroke-width="2.5" />
        </g>

        <!-- Eight Glowing Ethereal Wisps Hovering in Arc -->
        ${[
          { cx: 78, cy: 135, r: 4.5 },
          { cx: 90, cy: 115, r: 5 },
          { cx: 106, cy: 100, r: 5.5 },
          { cx: 120, cy: 92, r: 6 },
          { cx: 134, cy: 100, r: 5.5 },
          { cx: 150, cy: 115, r: 5 },
          { cx: 162, cy: 135, r: 4.5 },
          { cx: 120, cy: 125, r: 5 },
        ].map(w => `
          <g filter="url(#glow-strong)">
            <circle cx="${w.cx}" cy="${w.cy}" r="${w.r}" fill="${p.lightGlow}" />
            <circle cx="${w.cx}" cy="${w.cy}" r="${w.r * 0.5}" fill="#FFFFFF" />
            <path d="M ${w.cx} ${w.cy + w.r} Q ${w.cx - 4} ${w.cy + w.r + 8}, ${w.cx + 2} ${w.cy + w.r + 14}" stroke="${p.lightGlow}" stroke-width="1.5" fill="none" />
          </g>
        `).join('')}
      </g>
    `,
  },

  'blue-9': {
    cardKey: 'blue-9',
    title: 'Haunted Clocktower',
    subtitle: 'The Stroke of Midnight',
    lore: 'When the hands meet at the witching hour, the bell chimes nine tolls and phantom souls breach the waking world.',
    renderIllustration: (p) => `
      <g id="art-blue-9">
        <!-- Gothic Clocktower Silhouette -->
        <g transform="translate(120, 165)">
          <!-- Tower Body -->
          <rect x="-30" y="-10" width="60" height="70" fill="#08142A" stroke="${p.primary}" stroke-width="2" />
          <!-- Tower Roof Spire -->
          <polygon points="-35,-10 0,-70 35,-10" fill="#040B18" stroke="${p.frameGold}" stroke-width="2" />
          <!-- Belfry Arches -->
          <rect x="-18" y="22" width="10" height="20" rx="5" fill="#00F0FF" opacity="0.6" filter="url(#glow-soft)" />
          <rect x="8" y="22" width="10" height="20" rx="5" fill="#00F0FF" opacity="0.6" filter="url(#glow-soft)" />

          <!-- Glowing Blue Clock Face -->
          <circle cx="0" cy="-10" r="24" fill="#0E244C" stroke="${p.frameGold}" stroke-width="3" />
          <circle cx="0" cy="-10" r="20" fill="none" stroke="${p.lightGlow}" stroke-width="1.5" />
          <!-- Hour Markers (Roman Numerals dots) -->
          ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => `
            <circle cx="0" cy="-26" r="1.2" transform="rotate(${deg} 0 -10)" fill="${p.frameGold}" />
          `).join('')}

          <!-- Hands pointing to 12:00 Midnight -->
          <line x1="0" y1="-10" x2="0" y2="-24" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
          <line x1="0" y1="-10" x2="0" y2="-20" stroke="#00F0FF" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="0" cy="-10" r="3" fill="${p.frameGold}" />

          <!-- Spectral Mist Waves rising from Spire -->
          <path d="M 0 -70 Q -20 -90, -10 -100" stroke="${p.lightGlow}" stroke-width="2" fill="none" opacity="0.7" filter="url(#glow-soft)" />
          <path d="M 0 -70 Q 20 -90, 10 -100" stroke="${p.lightGlow}" stroke-width="2" fill="none" opacity="0.7" filter="url(#glow-soft)" />
        </g>
      </g>
    `,
  },

  'blue-skip': {
    cardKey: 'blue-skip',
    title: 'Spectral Spirit Ward',
    subtitle: 'The Frostbound Shield',
    lore: 'An ancient phantom shield of frozen cyan energy repels all mortal advance, sealing the turn in crystalline ice.',
    renderIllustration: (p) => `
      <g id="art-blue-skip">
        <!-- Frost Runic Circle Backdrop -->
        <circle cx="120" cy="165" r="54" fill="#040C1E" stroke="${p.secondary}" stroke-width="2" stroke-dasharray="4,4" />

        <!-- Prominent Themed SKIP Prohibition Symbol -->
        <g transform="translate(120, 165)" filter="url(#glow-strong)">
          <!-- Outer Spectral Ring -->
          <circle cx="0" cy="0" r="46" fill="#081A38" stroke="${p.primary}" stroke-width="9" />
          <circle cx="0" cy="0" r="46" fill="none" stroke="${p.frameGold}" stroke-width="2" />
          <!-- Diagonal Prohibition Ice Bar -->
          <line x1="-32" y1="-32" x2="32" y2="32" stroke="${p.primary}" stroke-width="9" stroke-linecap="round" />
          <line x1="-32" y1="-32" x2="32" y2="32" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />

          <!-- Outstretched Ghostly Hands Repelling -->
          <path d="M -24 0 C -36 -10, -42 -2, -38 8 C -34 16, -26 12, -24 0 Z" fill="#BAE6FD" opacity="0.8" />
          <path d="M 24 0 C 36 10, 42 2, 38 -8 C 34 -16, 26 -12, 24 0 Z" fill="#BAE6FD" opacity="0.8" />
          <!-- Central Ice Gem -->
          <polygon points="0,-12 9,0 0,12 -9,0" fill="#FFFFFF" stroke="${p.secondary}" stroke-width="1.5" />
        </g>
      </g>
    `,
  },

  'blue-reverse': {
    cardKey: 'blue-reverse',
    title: 'Twin Spectral Wraiths',
    subtitle: 'The Midnight Whirlpool',
    lore: 'Two ethereal wraiths circle in a spectral vortex, reversing the current of time with chilly gusts.',
    renderIllustration: (p) => `
      <g id="art-blue-reverse">
        <!-- Spectral Whirlpool Ring -->
        <circle cx="120" cy="165" r="50" fill="none" stroke="${p.secondary}" stroke-width="2" stroke-dasharray="4,4" opacity="0.7" />

        <!-- Top Looping Arrow & Wraith (Clockwise) -->
        <g filter="url(#glow-strong)">
          <path d="M 78 168 C 76 126, 126 112, 154 136" fill="none" stroke="${p.primary}" stroke-width="10" stroke-linecap="round" />
          <path d="M 78 168 C 76 126, 126 112, 154 136" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
          <polygon points="144,118 168,140 140,154" fill="${p.primary}" stroke="#FFFFFF" stroke-width="2" />
          <!-- Wraith Head on Arrow -->
          <circle cx="152" cy="136" r="4" fill="#E0F2FE" />
          <circle cx="154" cy="135" r="1.2" fill="#0369A1" />
        </g>

        <!-- Bottom Looping Arrow & Wraith (Counter-Clockwise) -->
        <g filter="url(#glow-strong)">
          <path d="M 162 162 C 164 204, 114 218, 86 194" fill="none" stroke="${p.primary}" stroke-width="10" stroke-linecap="round" />
          <path d="M 162 162 C 164 204, 114 218, 86 194" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
          <polygon points="96,212 72,190 100,176" fill="${p.primary}" stroke="#FFFFFF" stroke-width="2" />
          <!-- Wraith Head on Arrow -->
          <circle cx="88" cy="194" r="4" fill="#E0F2FE" />
          <circle cx="86" cy="195" r="1.2" fill="#0369A1" />
        </g>

        <!-- Central Soul Core -->
        <circle cx="120" cy="165" r="8" fill="#00F0FF" filter="url(#glow-soft)" />
        <circle cx="120" cy="165" r="4" fill="#FFFFFF" />
      </g>
    `,
  },

  'blue-draw2': {
    cardKey: 'blue-draw2',
    title: 'Ghostly Offering',
    subtitle: 'Twin Spectral Hands (+2)',
    lore: 'From the swirling graveyard mist, two translucent phantom hands reach across the veil to deal two phantom cards.',
    renderIllustration: (p) => `
      <g id="art-blue-draw2">
        <!-- Cyan Radiance Mist -->
        <ellipse cx="120" cy="165" rx="52" ry="46" fill="url(#cyan-glow-grad)" opacity="0.6" filter="url(#glow-soft)" />

        <!-- Two Ghost Cards -->
        <!-- Card 1 (Left tilted) -->
        <g transform="translate(100, 150) rotate(-14)">
          <rect x="-24" y="-36" width="48" height="72" rx="6" fill="#081836" stroke="${p.frameGold}" stroke-width="3" />
          <rect x="-18" y="-30" width="36" height="60" rx="4" fill="${p.primary}" opacity="0.8" />
          <circle cx="0" cy="0" r="10" fill="#00F0FF" opacity="0.7" />
        </g>

        <!-- Card 2 (Right tilted) -->
        <g transform="translate(140, 158) rotate(12)">
          <rect x="-24" y="-36" width="48" height="72" rx="6" fill="#081836" stroke="${p.frameGold}" stroke-width="3" />
          <rect x="-18" y="-30" width="36" height="60" rx="4" fill="${p.primary}" opacity="0.9" />
          <!-- Spectral Skull on card face -->
          <circle cx="0" cy="-6" r="8" fill="#FFFFFF" />
          <circle cx="-3" cy="-6" r="2" fill="#050D1E" />
          <circle cx="3" cy="-6" r="2" fill="#050D1E" />
        </g>

        <!-- Twin Ghostly Hands Reaching -->
        <g filter="url(#glow-soft)" fill="#BAE6FD" opacity="0.85">
          <!-- Left Hand -->
          <path d="M 68 185 C 75 165, 86 160, 95 170 C 92 180, 84 195, 76 198 Z" />
          <!-- Right Hand -->
          <path d="M 172 185 C 165 165, 154 160, 145 170 C 148 180, 156 195, 164 198 Z" />
        </g>

        <!-- Bold Gothic +2 Banner -->
        <g transform="translate(120, 185)" filter="url(#glow-strong)">
          <rect x="-44" y="-20" width="88" height="40" rx="20" fill="#040D1E" stroke="${p.primary}" stroke-width="3.5" />
          <text x="0" y="2" text-anchor="middle" dominant-baseline="central"
                font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
                font-size="34" font-weight="900" fill="#FFFFFF"
                stroke="${p.primary}" stroke-width="1.5" paint-order="stroke fill">+2</text>
        </g>
      </g>
    `,
  },
};
