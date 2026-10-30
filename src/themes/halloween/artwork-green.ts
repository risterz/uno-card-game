import { HalloweenCardArtwork } from './artwork';

export const GREEN_ARTWORKS: Record<string, HalloweenCardArtwork> = {
  'green-0': {
    cardKey: 'green-0',
    title: 'Ancient Weeping Treant',
    subtitle: 'The Cursed Bog Willow',
    lore: 'Rooted in the eternal swamp, the gnarled willow tree watches centuries pass through hollow eyes of glowing emerald.',
    renderIllustration: (p) => `
      <g id="art-green-0">
        <!-- Swamp Bog Backdrop -->
        <ellipse cx="120" cy="190" rx="55" ry="25" fill="#031008" stroke="${p.secondary}" stroke-width="1.5" />
        
        <!-- Twisted Willow Trunk & Roots -->
        <g transform="translate(120, 160)">
          <!-- Roots entering water -->
          <path d="M -30 45 Q -15 30, -10 15 Q 0 25, 10 15 Q 15 30, 30 45" stroke="#041F10" stroke-width="4" fill="none" />
          <!-- Hollow Trunk -->
          <path d="M -22 30 C -26 0, -18 -20, 0 -35 C 18 -20, 26 0, 22 30 Z" fill="#082816" stroke="${p.primary}" stroke-width="2" />
          <!-- Hollow Knothole Face -->
          <ellipse cx="0" cy="0" rx="9" ry="14" fill="#020A05" />
          <!-- Glowing Spirit Eyes -->
          <circle cx="-4" cy="-3" r="2.2" fill="${p.primary}" filter="url(#glow-soft)" />
          <circle cx="4" cy="-3" r="2.2" fill="${p.primary}" filter="url(#glow-soft)" />

          <!-- Hanging Moss Strands -->
          <path d="M -18 -20 Q -24 0, -22 25" stroke="${p.lightGlow}" stroke-width="1.5" fill="none" opacity="0.7" />
          <path d="M 18 -20 Q 24 0, 22 25" stroke="${p.lightGlow}" stroke-width="1.5" fill="none" opacity="0.7" />
          <path d="M -8 -30 Q -12 -10, -10 10" stroke="${p.lightGlow}" stroke-width="1.2" fill="none" opacity="0.6" />
          <path d="M 8 -30 Q 12 -10, 10 10" stroke="${p.lightGlow}" stroke-width="1.2" fill="none" opacity="0.6" />
        </g>

        <!-- Swamp Spores / Fireflies -->
        <circle cx="85" cy="135" r="2.5" fill="#A7F3D0" filter="url(#glow-soft)" />
        <circle cx="155" cy="140" r="2.5" fill="#A7F3D0" filter="url(#glow-soft)" />
        <circle cx="120" cy="105" r="3" fill="#A7F3D0" filter="url(#glow-soft)" />
      </g>
    `,
  },

  'green-1': {
    cardKey: 'green-1',
    title: "Witch's Grimoire & Hat",
    subtitle: 'Tome of the Covens',
    lore: 'Bound in toadskin and stamped with silver runes, the grimoire rests beneath the master witch’s brim.',
    renderIllustration: (p) => `
      <g id="art-green-1">
        <!-- Open Leather-Bound Grimoire -->
        <g transform="translate(120, 185)">
          <!-- Grimoire Cover & Pages -->
          <path d="M -42 15 Q -22 8, 0 12 Q 22 8, 42 15 L 40 30 Q 20 22, 0 25 Q -20 22, -40 30 Z" fill="#1C3823" stroke="${p.frameGold}" stroke-width="2" />
          <!-- Glowing Parchment Leaves -->
          <path d="M -40 12 Q -20 5, 0 8 Q 20 5, 40 12 L 38 25 Q 18 18, 0 20 Q -18 18, -38 25 Z" fill="#D1FAE5" opacity="0.9" />
          <!-- Runic Text Lines -->
          <line x1="-32" y1="13" x2="-8" y2="10" stroke="${p.primary}" stroke-width="1.5" stroke-dasharray="2,2" />
          <line x1="-30" y1="18" x2="-10" y2="15" stroke="${p.primary}" stroke-width="1.5" stroke-dasharray="2,2" />
          <line x1="8" y1="10" x2="32" y2="13" stroke="${p.primary}" stroke-width="1.5" stroke-dasharray="2,2" />
          <line x1="10" y1="15" x2="30" y2="18" stroke="${p.primary}" stroke-width="1.5" stroke-dasharray="2,2" />
        </g>

        <!-- Pointed Witch's Hat -->
        <g transform="translate(120, 150)">
          <!-- Hat Brim -->
          <ellipse cx="0" cy="10" rx="38" ry="12" fill="#03140A" stroke="${p.primary}" stroke-width="2" />
          <!-- Hat Band & Buckle -->
          <path d="M -20 6 Q 0 8, 20 6 L 18 -2 Q 0 0, -18 -2 Z" fill="${p.secondary}" />
          <rect x="-6" y="-2" width="12" height="10" rx="2" fill="none" stroke="${p.frameGold}" stroke-width="2" />
          <!-- Crooked Hat Cone -->
          <path d="M -22 6 Q -14 -20, 8 -40 Q 2 -20, 18 6 Z" fill="#051C0E" stroke="${p.primary}" stroke-width="2" />
          <!-- Crooked Tip -->
          <polygon points="8,-40 18,-46 10,-36" fill="#051C0E" stroke="${p.primary}" stroke-width="1.5" />
        </g>
      </g>
    `,
  },

  'green-2': {
    cardKey: 'green-2',
    title: 'Two Venomous Briars',
    subtitle: 'The Entwined Thorns',
    lore: 'Two venom-soaked brambles coil together, their wicked spines dripping caustic green ichor.',
    renderIllustration: (p) => `
      <g id="art-green-2">
        <!-- Central Emerald Crystal Core -->
        <polygon points="120,130 135,165 120,200 105,165" fill="#065F46" stroke="${p.primary}" stroke-width="2" />
        <polygon points="120,140 130,165 120,190 110,165" fill="${p.lightGlow}" opacity="0.6" filter="url(#glow-soft)" />

        <!-- Briar Vine 1 (Left Spiraling) -->
        <g>
          <path d="M 85 220 Q 95 180, 115 160 Q 135 140, 120 115" stroke="${p.primary}" stroke-width="3.5" fill="none" />
          <!-- Thorns -->
          <polygon points="90,195 82,192 90,188" fill="#10B981" />
          <polygon points="102,172 96,164 105,167" fill="#10B981" />
          <polygon points="124,146 132,142 126,140" fill="#10B981" />
          <!-- Dripping Venom -->
          <circle cx="82" cy="196" r="2" fill="#A7F3D0" filter="url(#glow-soft)" />
        </g>

        <!-- Briar Vine 2 (Right Spiraling) -->
        <g>
          <path d="M 155 220 Q 145 180, 125 160 Q 105 140, 120 115" stroke="${p.secondary}" stroke-width="3.5" fill="none" />
          <!-- Thorns -->
          <polygon points="150,195 158,192 150,188" fill="#065F46" />
          <polygon points="138,172 144,164 135,167" fill="#065F46" />
          <polygon points="116,146 108,142 114,140" fill="#065F46" />
          <!-- Dripping Venom -->
          <circle cx="158" cy="196" r="2" fill="#A7F3D0" filter="url(#glow-soft)" />
        </g>
      </g>
    `,
  },

  'green-3': {
    cardKey: 'green-3',
    title: 'Three Potion Flasks',
    subtitle: 'The Alchemist Rack',
    lore: 'Three volatile concoctions stew in hand-blown glass, bubbling with emerald vapors of transmutation.',
    renderIllustration: (p) => `
      <g id="art-green-3">
        <!-- Wooden/Iron Alchemy Rack -->
        <rect x="70" y="195" width="100" height="12" rx="2" fill="#0F2418" stroke="${p.frameGold}" stroke-width="1.5" />
        <rect x="74" y="207" width="8" height="20" fill="#08140D" />
        <rect x="158" y="207" width="8" height="20" fill="#08140D" />

        <!-- Flask 1 (Left, Round Alembic) -->
        <g transform="translate(86, 175)">
          <!-- Neck & Cork -->
          <rect x="-3" y="-22" width="6" height="10" fill="#051C0E" stroke="${p.primary}" stroke-width="1" />
          <rect x="-4" y="-26" width="8" height="5" fill="${p.frameGold}" />
          <!-- Round Body -->
          <circle cx="0" cy="-4" r="14" fill="#064E3B" stroke="${p.primary}" stroke-width="1.8" />
          <circle cx="0" cy="-2" r="10" fill="${p.lightGlow}" opacity="0.7" filter="url(#glow-soft)" />
          <!-- Bubbles -->
          <circle cx="-4" cy="-5" r="2" fill="#FFFFFF" />
          <circle cx="3" cy="-1" r="1.5" fill="#FFFFFF" />
        </g>

        <!-- Flask 2 (Center, Conical Erlenmeyer) -->
        <g transform="translate(120, 168)">
          <!-- Neck & Cork -->
          <rect x="-4" y="-30" width="8" height="14" fill="#051C0E" stroke="${p.primary}" stroke-width="1" />
          <rect x="-5" y="-35" width="10" height="6" fill="${p.frameGold}" />
          <!-- Cone Body -->
          <polygon points="-16,14 16,14 4,-16 -4,-16" fill="#065F46" stroke="${p.primary}" stroke-width="2" />
          <polygon points="-12,11 12,11 3,-8 -3,-8" fill="${p.lightGlow}" opacity="0.8" filter="url(#glow-soft)" />
          <!-- Rising Vapor -->
          <path d="M 0 -38 Q -6 -48, 2 -55" stroke="${p.lightGlow}" stroke-width="2" fill="none" filter="url(#glow-soft)" />
        </g>

        <!-- Flask 3 (Right, Elongated Droplet) -->
        <g transform="translate(154, 175)">
          <rect x="-3" y="-24" width="6" height="12" fill="#051C0E" stroke="${p.primary}" stroke-width="1" />
          <rect x="-4" y="-28" width="8" height="5" fill="${p.frameGold}" />
          <ellipse cx="0" cy="-4" rx="10" ry="15" fill="#044227" stroke="${p.primary}" stroke-width="1.8" />
          <ellipse cx="0" cy="-2" rx="7" ry="11" fill="${p.lightGlow}" opacity="0.7" filter="url(#glow-soft)" />
          <circle cx="-2" cy="-4" r="2" fill="#FFFFFF" />
        </g>
      </g>
    `,
  },

  'green-4': {
    cardKey: 'green-4',
    title: 'The Bubbling Cauldron',
    subtitle: 'Four Skull Vapors',
    lore: 'Brewed under the waning crescent, the witch’s iron pot unleashes four screaming vapor skulls.',
    renderIllustration: (p) => `
      <g id="art-green-4">
        <!-- Burning Embers beneath Cauldron -->
        <g transform="translate(120, 215)">
          <ellipse cx="0" cy="5" rx="30" ry="6" fill="#030C07" />
          <circle cx="-14" cy="2" r="3" fill="#F59E0B" filter="url(#glow-soft)" />
          <circle cx="0" cy="0" r="4" fill="#EF4444" filter="url(#glow-soft)" />
          <circle cx="14" cy="3" r="3" fill="#F59E0B" filter="url(#glow-soft)" />
        </g>

        <!-- Iron Cauldron Body & Legs -->
        <g transform="translate(120, 182)">
          <!-- Three Tripod Legs -->
          <line x1="-24" y1="15" x2="-32" y2="35" stroke="#061F12" stroke-width="4" stroke-linecap="round" />
          <line x1="24" y1="15" x2="32" y2="35" stroke="#061F12" stroke-width="4" stroke-linecap="round" />
          <line x1="0" y1="20" x2="0" y2="36" stroke="#061F12" stroke-width="4" stroke-linecap="round" />
          <!-- Belly -->
          <circle cx="0" cy="5" r="28" fill="#072214" stroke="${p.primary}" stroke-width="2.5" />
          <!-- Cauldron Rim -->
          <ellipse cx="0" cy="-14" rx="28" ry="8" fill="#03120A" stroke="${p.primary}" stroke-width="2" />
          <!-- Glowing Emerald Brew -->
          <ellipse cx="0" cy="-14" rx="24" ry="6" fill="${p.lightGlow}" filter="url(#glow-soft)" />
          <circle cx="-8" cy="-14" r="3" fill="#FFFFFF" />
          <circle cx="6" cy="-15" r="2.5" fill="#FFFFFF" />
        </g>

        <!-- Four Emerald Vapor Wisps (Mini Skulls) Rising -->
        ${[
          { x: 92, y: 135, s: 0.7 },
          { x: 108, y: 110, s: 0.8 },
          { x: 132, y: 110, s: 0.8 },
          { x: 148, y: 135, s: 0.7 },
        ].map(v => `
          <g transform="translate(${v.x}, ${v.y}) scale(${v.s})" filter="url(#glow-soft)">
            <ellipse cx="0" cy="0" rx="9" ry="8" fill="${p.accent}" opacity="0.8" />
            <rect x="-4" y="6" width="8" height="6" rx="2" fill="${p.accent}" opacity="0.8" />
            <circle cx="-3" cy="0" r="1.8" fill="#064E3B" />
            <circle cx="3" cy="0" r="1.8" fill="#064E3B" />
          </g>
        `).join('')}
      </g>
    `,
  },

  'green-5': {
    cardKey: 'green-5',
    title: 'Five Enchanted Toadstools',
    subtitle: 'The Bioluminescent Cluster',
    lore: 'Sprouting from ancient cursed mulch, five glowing spotted toadstools exhale spore clouds of pure witchcraft.',
    renderIllustration: (p) => `
      <g id="art-green-5">
        <!-- Mossy Forest Floor Mound -->
        <ellipse cx="120" cy="215" rx="55" ry="16" fill="#031208" stroke="${p.secondary}" stroke-width="1.5" />

        <!-- 5 Toadstools in Natural Cluster -->
        <!-- Toadstool 1 (Left Far, Small) -->
        <g transform="translate(85, 192)">
          <path d="M 0 16 L 0 0" stroke="#D1FAE5" stroke-width="4" stroke-linecap="round" />
          <path d="M -12 2 C -12 -12, 12 -12, 12 2 Z" fill="#059669" stroke="${p.frameGold}" stroke-width="1.2" />
          <circle cx="-4" cy="-3" r="1.5" fill="#FFFFFF" />
          <circle cx="4" cy="-4" r="1.5" fill="#FFFFFF" />
        </g>

        <!-- Toadstool 2 (Center Left, Medium) -->
        <g transform="translate(104, 180)">
          <path d="M 0 28 L 0 0" stroke="#D1FAE5" stroke-width="5" stroke-linecap="round" />
          <path d="M -16 2 C -16 -16, 16 -16, 16 2 Z" fill="${p.primary}" stroke="${p.frameGold}" stroke-width="1.5" />
          <circle cx="-6" cy="-4" r="2" fill="#FFFFFF" />
          <circle cx="5" cy="-6" r="2.2" fill="#FFFFFF" />
          <circle cx="0" cy="-11" r="1.8" fill="#FFFFFF" />
        </g>

        <!-- Toadstool 3 (Center, Tall King Mushroom) -->
        <g transform="translate(122, 165)">
          <path d="M 0 42 L 0 0" stroke="#ECFDF5" stroke-width="6.5" stroke-linecap="round" />
          <path d="M -22 4 C -22 -22, 22 -22, 22 4 Z" fill="#10B981" stroke="${p.frameGold}" stroke-width="2" filter="url(#glow-soft)" />
          <circle cx="-10" cy="-6" r="2.8" fill="#FFFFFF" />
          <circle cx="8" cy="-8" r="3" fill="#FFFFFF" />
          <circle cx="-1" cy="-15" r="2.5" fill="#FFFFFF" />
          <circle cx="12" cy="0" r="1.8" fill="#FFFFFF" />
        </g>

        <!-- Toadstool 4 (Center Right, Medium) -->
        <g transform="translate(140, 182)">
          <path d="M 0 26 L 0 0" stroke="#D1FAE5" stroke-width="5" stroke-linecap="round" />
          <path d="M -15 2 C -15 -14, 15 -14, 15 2 Z" fill="${p.primary}" stroke="${p.frameGold}" stroke-width="1.5" />
          <circle cx="-5" cy="-4" r="2" fill="#FFFFFF" />
          <circle cx="6" cy="-5" r="2" fill="#FFFFFF" />
        </g>

        <!-- Toadstool 5 (Right Far, Small) -->
        <g transform="translate(156, 194)">
          <path d="M 0 14 L 0 0" stroke="#D1FAE5" stroke-width="3.5" stroke-linecap="round" />
          <path d="M -11 2 C -11 -10, 11 -10, 11 2 Z" fill="#059669" stroke="${p.frameGold}" stroke-width="1.2" />
          <circle cx="0" cy="-3" r="1.5" fill="#FFFFFF" />
        </g>

        <!-- Glowing Spores Floating -->
        <circle cx="95" cy="145" r="2" fill="#A7F3D0" filter="url(#glow-soft)" />
        <circle cx="145" cy="140" r="2" fill="#A7F3D0" filter="url(#glow-soft)" />
      </g>
    `,
  },

  'green-6': {
    cardKey: 'green-6',
    title: 'Raven & Crystal Ball',
    subtitle: 'The Scrying Familiar',
    lore: 'Perched upon antique brass claws, the witch’s familiar peer into the six swirling mists of prophecy.',
    renderIllustration: (p) => `
      <g id="art-green-6">
        <!-- Ornate Brass Tripod Stand -->
        <g transform="translate(120, 195)">
          <path d="M -24 15 Q -16 -5, 0 -12 Q 16 -5, 24 15" stroke="${p.frameGold}" stroke-width="3" fill="none" />
          <circle cx="0" cy="15" r="5" fill="${p.frameGold}" />
        </g>

        <!-- Glowing Emerald Scrying Orb -->
        <g transform="translate(120, 170)">
          <!-- Core Glass Sphere -->
          <circle cx="0" cy="0" r="28" fill="#042F1A" stroke="${p.primary}" stroke-width="2.5" />
          <!-- Swirling Inner Magic -->
          <circle cx="0" cy="0" r="22" fill="url(#potion-vapor-grad)" filter="url(#glow-soft)" opacity="0.8" />
          <path d="M -14 -6 Q 0 12, 14 -4" stroke="#FFFFFF" stroke-width="2" fill="none" opacity="0.6" />
          <!-- Sphere Glass Highlight -->
          <ellipse cx="-10" cy="-10" rx="8" ry="4" transform="rotate(-30 -10 -10)" fill="#FFFFFF" opacity="0.7" />
        </g>

        <!-- Familiar Raven Perched on Sphere -->
        <g transform="translate(120, 132)">
          <!-- Claws gripping sphere -->
          <polygon points="-6,10 -3,14 0,10" fill="${p.frameGold}" />
          <!-- Raven Body -->
          <path d="M 0 10 C -12 10, -18 -8, -10 -18 C -4 -26, 8 -24, 12 -12 C 16 2, 10 10, 0 10 Z" fill="#020B06" stroke="${p.primary}" stroke-width="1.8" />
          <!-- Folded Wing -->
          <path d="M -6 6 C -14 4, -16 -10, -8 -16" stroke="${p.secondary}" stroke-width="2" fill="none" />
          <!-- Head & Beak -->
          <circle cx="8" cy="-18" r="8" fill="#020B06" stroke="${p.primary}" stroke-width="1.5" />
          <polygon points="14,-20 25,-16 14,-14" fill="${p.frameGold}" stroke="#78350F" stroke-width="1" />
          <!-- Intelligent Glowing Green Eye -->
          <circle cx="10" cy="-18" r="1.8" fill="#34D399" filter="url(#glow-soft)" />
        </g>
      </g>
    `,
  },

  'green-7': {
    cardKey: 'green-7',
    title: 'Swamp Mandrake Root',
    subtitle: 'Seven Runic Shoots',
    lore: 'Plucked from sacred soil at new moon, the mandrake screams with magical potency through seven leafy branches.',
    renderIllustration: (p) => `
      <g id="art-green-7">
        <!-- Mandrake Earthen Clay Pot -->
        <polygon points="90,185 150,185 142,225 98,225" fill="#1C1408" stroke="${p.frameGold}" stroke-width="2" />
        <rect x="86" y="178" width="68" height="10" rx="3" fill="#2E200C" stroke="${p.frameGold}" stroke-width="1.5" />

        <!-- Gnarled Mandrake Root Body -->
        <g transform="translate(120, 165)">
          <path d="M -16 15 C -20 0, -10 -12, 0 -18 C 10 -12, 20 0, 16 15 C 8 22, -8 22, -16 15 Z" fill="#2D210E" stroke="${p.primary}" stroke-width="2" />
          <!-- Mandrake Screaming Face -->
          <circle cx="-5" cy="-4" r="2.2" fill="#10B981" filter="url(#glow-soft)" />
          <circle cx="5" cy="-4" r="2.2" fill="#10B981" filter="url(#glow-soft)" />
          <ellipse cx="0" cy="5" rx="4" ry="6" fill="#080502" />
        </g>

        <!-- Seven Radiant Runic Mandrake Leaves Sprouting -->
        ${[
          { deg: -60, x: -28, y: -20 },
          { deg: -40, x: -20, y: -32 },
          { deg: -20, x: -10, y: -40 },
          { deg: 0, x: 0, y: -45 },
          { deg: 20, x: 10, y: -40 },
          { deg: 40, x: 20, y: -32 },
          { deg: 60, x: 28, y: -20 },
        ].map(l => `
          <g transform="translate(120, 146)">
            <path d="M 0 0 Q ${l.x * 0.5} ${l.y * 0.5}, ${l.x} ${l.y}" stroke="${p.secondary}" stroke-width="2.5" fill="none" />
            <ellipse cx="${l.x}" cy="${l.y}" rx="7" ry="12" transform="rotate(${l.deg} ${l.x} ${l.y})" fill="${p.primary}" stroke="${p.frameGold}" stroke-width="1.2" filter="url(#glow-soft)" />
            <line x1="${l.x}" y1="${l.y - 6}" x2="${l.x}" y2="${l.y + 6}" transform="rotate(${l.deg} ${l.x} ${l.y})" stroke="#FFFFFF" stroke-width="1" />
          </g>
        `).join('')}
      </g>
    `,
  },

  'green-8': {
    cardKey: 'green-8',
    title: "Witch's Hex Altar",
    subtitle: 'Eight Creeping Vines',
    lore: 'Eight cursed briar vines bind the ancient stone altar where the grand hex was first spoken.',
    renderIllustration: (p) => `
      <g id="art-green-8">
        <!-- Stone Altar Table -->
        <g transform="translate(120, 185)">
          <rect x="-44" y="-10" width="88" height="18" rx="3" fill="#0A2416" stroke="${p.frameGold}" stroke-width="2" />
          <polygon points="-36,8 36,8 30,35 -30,35" fill="#06180E" stroke="${p.primary}" stroke-width="2" />
          <!-- Runic Engraving on Altar -->
          <path d="M -22 -1 L -12 -1 M 12 -1 L 22 -1" stroke="${p.lightGlow}" stroke-width="2" />
          <circle cx="0" cy="-1" r="4" fill="${p.lightGlow}" filter="url(#glow-soft)" />
        </g>

        <!-- 8 Creeping Cursed Vines wrapping around Altar -->
        ${[
          'M 72 220 Q 80 185, 90 175',
          'M 84 220 Q 94 195, 102 175',
          'M 100 220 Q 106 190, 114 175',
          'M 116 220 Q 118 190, 122 175',
          'M 128 220 Q 124 190, 126 175',
          'M 140 220 Q 134 195, 138 175',
          'M 152 220 Q 146 190, 148 175',
          'M 166 220 Q 158 185, 150 175',
        ].map(d => `
          <path d="${d}" stroke="${p.primary}" stroke-width="2.5" fill="none" />
        `).join('')}

        <!-- Ritual Candles on Altar -->
        <g transform="translate(90, 168)">
          <rect x="-3" y="0" width="6" height="12" fill="#ECFDF5" />
          <path d="M 0 -1 C -2 -5, 0 -9, 0 -11 C 0 -9, 2 -5, 0 -1 Z" fill="${p.lightGlow}" filter="url(#glow-soft)" />
        </g>
        <g transform="translate(150, 168)">
          <rect x="-3" y="0" width="6" height="12" fill="#ECFDF5" />
          <path d="M 0 -1 C -2 -5, 0 -9, 0 -11 C 0 -9, 2 -5, 0 -1 Z" fill="${p.lightGlow}" filter="url(#glow-soft)" />
        </g>
      </g>
    `,
  },

  'green-9': {
    cardKey: 'green-9',
    title: 'Midnight Broomstick Flight',
    subtitle: 'Across the Emerald Moon',
    lore: 'Slicing through clouds of toxic aurora, the high witch rides her crooked broom beneath the full emerald moon.',
    renderIllustration: (p) => `
      <g id="art-green-9">
        <!-- Giant Glowing Toxic Emerald Full Moon -->
        <circle cx="120" cy="155" r="48" fill="url(#potion-vapor-grad)" filter="url(#glow-soft)" />
        <circle cx="100" cy="140" r="10" fill="#065F46" opacity="0.3" />
        <circle cx="138" cy="165" r="14" fill="#065F46" opacity="0.25" />

        <!-- Witch on Broomstick Silhouette Crossing Moon -->
        <g transform="translate(120, 155)">
          <!-- Broom Stick -->
          <line x1="-48" y1="20" x2="48" y2="-16" stroke="${p.frameGold}" stroke-width="3" stroke-linecap="round" />
          <!-- Broom Straw Bristles & Binding -->
          <polygon points="-48,20 -64,28 -56,36 -42,24" fill="#B45309" stroke="${p.frameGold}" stroke-width="1" />
          <line x1="-46" y1="18" x2="-42" y2="25" stroke="#FFFFFF" stroke-width="1.5" />

          <!-- Witch Silhouette Body & Cloak -->
          <path d="M 0 0 C -12 4, -26 18, -32 24 C -22 14, -10 6, 4 4 Z" fill="#020B05" />
          <!-- Witch Torso & Leg -->
          <ellipse cx="6" cy="2" rx="8" ry="12" fill="#020B05" />
          <!-- Witch Head & Crooked Pointed Hat -->
          <circle cx="10" cy="-10" r="7" fill="#020B05" />
          <polygon points="6,-14 24,-30 14,-14" fill="#020B05" stroke="${p.primary}" stroke-width="1" />
          <ellipse cx="10" cy="-12" rx="14" ry="4" fill="#020B05" />

          <!-- Sparkles / Stardust trailing broom -->
          <circle cx="-35" cy="15" r="2" fill="#FFFFFF" filter="url(#glow-soft)" />
          <circle cx="-25" cy="8" r="1.5" fill="#A7F3D0" />
          <circle cx="-15" cy="2" r="2" fill="#FFFFFF" filter="url(#glow-soft)" />
        </g>
      </g>
    `,
  },

  'green-skip': {
    cardKey: 'green-skip',
    title: 'Briar Thorn Hex Ward',
    subtitle: 'The Intertwined Brambles',
    lore: 'A dense barrier of hexed briars and venomous thorns binds the path, barring passage until the spell unravels.',
    renderIllustration: (p) => `
      <g id="art-green-skip">
        <!-- Runic Green Ward Circle -->
        <circle cx="120" cy="165" r="54" fill="#03140A" stroke="${p.secondary}" stroke-width="2" stroke-dasharray="4,4" />

        <!-- Prominent Themed SKIP Prohibition Symbol -->
        <g transform="translate(120, 165)" filter="url(#glow-strong)">
          <!-- Outer Thorn Ring -->
          <circle cx="0" cy="0" r="46" fill="#062414" stroke="${p.primary}" stroke-width="9" />
          <circle cx="0" cy="0" r="46" fill="none" stroke="${p.frameGold}" stroke-width="2" />
          <!-- Heavy Spiked Diagonal Briar Bar -->
          <line x1="-32" y1="-32" x2="32" y2="32" stroke="${p.primary}" stroke-width="9" stroke-linecap="round" />
          <line x1="-32" y1="-32" x2="32" y2="32" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />

          <!-- Intertwined Briar Spines on Bar -->
          <polygon points="-16,-10 -24,-14 -18,-18" fill="${p.frameGold}" />
          <polygon points="16,10 24,14 18,18" fill="${p.frameGold}" />
          <!-- Central Hex Seal -->
          <polygon points="0,-12 11,0 0,12 -11,0" fill="#10B981" stroke="#FFFFFF" stroke-width="1.5" />
        </g>
      </g>
    `,
  },

  'green-reverse': {
    cardKey: 'green-reverse',
    title: 'Twin Serpent Spiral',
    subtitle: 'The Runic Ouroboros',
    lore: 'Two horned emerald serpents coil in reverse motion, shedding the timeline like old venomous scales.',
    renderIllustration: (p) => `
      <g id="art-green-reverse">
        <!-- Magic Runic Circle -->
        <circle cx="120" cy="165" r="50" fill="none" stroke="${p.secondary}" stroke-width="2" stroke-dasharray="4,4" opacity="0.7" />

        <!-- Top Looping Arrow & Horned Serpent (Clockwise) -->
        <g filter="url(#glow-strong)">
          <path d="M 78 168 C 76 126, 126 112, 154 136" fill="none" stroke="${p.primary}" stroke-width="10" stroke-linecap="round" />
          <path d="M 78 168 C 76 126, 126 112, 154 136" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
          <polygon points="144,118 168,140 140,154" fill="${p.primary}" stroke="#FFFFFF" stroke-width="2" />
          <!-- Serpent Horn on Arrowhead -->
          <polygon points="164,136 174,130 166,142" fill="${p.frameGold}" />
        </g>

        <!-- Bottom Looping Arrow & Horned Serpent (Counter-Clockwise) -->
        <g filter="url(#glow-strong)">
          <path d="M 162 162 C 164 204, 114 218, 86 194" fill="none" stroke="${p.primary}" stroke-width="10" stroke-linecap="round" />
          <path d="M 162 162 C 164 204, 114 218, 86 194" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
          <polygon points="96,212 72,190 100,176" fill="${p.primary}" stroke="#FFFFFF" stroke-width="2" />
          <!-- Serpent Horn on Arrowhead -->
          <polygon points="76,194 66,200 74,188" fill="${p.frameGold}" />
        </g>

        <!-- Central Emerald Eye -->
        <circle cx="120" cy="165" r="8" fill="#34D399" filter="url(#glow-soft)" />
        <ellipse cx="120" cy="165" rx="2" ry="6" fill="#04140B" />
      </g>
    `,
  },

  'green-draw2': {
    cardKey: 'green-draw2',
    title: 'Twin Alchemical Draughts',
    subtitle: 'Vapors of the Cauldron (+2)',
    lore: 'Two bubbling venom flasks emit swirling smoke trails that form two spellbound cards and double the curse.',
    renderIllustration: (p) => `
      <g id="art-green-draw2">
        <!-- Emerald Radiance Vapor -->
        <ellipse cx="120" cy="165" rx="52" ry="46" fill="url(#potion-vapor-grad)" opacity="0.6" filter="url(#glow-soft)" />

        <!-- Two Witchcraft Cards -->
        <!-- Card 1 (Left tilted) -->
        <g transform="translate(100, 150) rotate(-14)">
          <rect x="-24" y="-36" width="48" height="72" rx="6" fill="#072214" stroke="${p.frameGold}" stroke-width="3" />
          <rect x="-18" y="-30" width="36" height="60" rx="4" fill="${p.primary}" opacity="0.8" />
          <circle cx="0" cy="0" r="10" fill="#34D399" opacity="0.7" />
        </g>

        <!-- Card 2 (Right tilted) -->
        <g transform="translate(140, 158) rotate(12)">
          <rect x="-24" y="-36" width="48" height="72" rx="6" fill="#072214" stroke="${p.frameGold}" stroke-width="3" />
          <rect x="-18" y="-30" width="36" height="60" rx="4" fill="${p.primary}" opacity="0.9" />
          <!-- Witch Cauldron on card face -->
          <circle cx="0" cy="-4" r="8" fill="#03120A" />
          <circle cx="0" cy="-4" r="5" fill="#10B981" />
        </g>

        <!-- Two Glass Potion Vials in Foreground -->
        <g transform="translate(85, 175) rotate(-20)">
          <rect x="-4" y="-12" width="8" height="24" rx="4" fill="#A7F3D0" stroke="${p.primary}" stroke-width="1.5" />
          <rect x="-5" y="-15" width="10" height="4" fill="${p.frameGold}" />
        </g>
        <g transform="translate(155, 175) rotate(20)">
          <rect x="-4" y="-12" width="8" height="24" rx="4" fill="#A7F3D0" stroke="${p.primary}" stroke-width="1.5" />
          <rect x="-5" y="-15" width="10" height="4" fill="${p.frameGold}" />
        </g>

        <!-- Bold Gothic +2 Banner -->
        <g transform="translate(120, 185)" filter="url(#glow-strong)">
          <rect x="-44" y="-20" width="88" height="40" rx="20" fill="#04160C" stroke="${p.primary}" stroke-width="3.5" />
          <text x="0" y="2" text-anchor="middle" dominant-baseline="central"
                font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
                font-size="34" font-weight="900" fill="#FFFFFF"
                stroke="${p.primary}" stroke-width="1.5" paint-order="stroke fill">+2</text>
        </g>
      </g>
    `,
  },
};
