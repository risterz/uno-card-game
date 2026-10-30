import { HalloweenCardArtwork } from './artwork';

export const YELLOW_ARTWORKS: Record<string, HalloweenCardArtwork> = {
  'yellow-0': {
    cardKey: 'yellow-0',
    title: 'Royal Pumpkin Carriage',
    subtitle: 'The Cinderella Nightmare',
    lore: 'Carved from an ancient enchanted pumpkin prize, the royal carriage speeds across the midnight autumn fields.',
    renderIllustration: (p) => `
      <g id="art-yellow-0">
        <!-- Harvest Midnight Field Backdrop -->
        <rect x="65" y="195" width="110" height="35" rx="4" fill="#140801" stroke="${p.secondary}" stroke-width="1.5" />
        
        <!-- Enchanted Pumpkin Carriage Body -->
        <g transform="translate(120, 165)">
          <!-- Pumpkin Lobes -->
          <ellipse cx="-16" cy="-2" rx="14" ry="24" fill="#B45309" stroke="${p.primary}" stroke-width="1.5" />
          <ellipse cx="16" cy="-2" rx="14" ry="24" fill="#B45309" stroke="${p.primary}" stroke-width="1.5" />
          <ellipse cx="0" cy="-2" rx="22" ry="26" fill="#D97706" stroke="${p.primary}" stroke-width="2" />
          <ellipse cx="0" cy="-2" rx="15" ry="22" fill="#F59E0B" filter="url(#glow-soft)" />

          <!-- Arched Carriage Window with Golden Candle Glow -->
          <rect x="-10" y="-12" width="20" height="20" rx="8" fill="#FFFBEB" filter="url(#glow-soft)" />
          <line x1="0" y1="-12" x2="0" y2="8" stroke="${p.secondary}" stroke-width="1.5" />
          <line x1="-10" y1="-2" x2="10" y2="-2" stroke="${p.secondary}" stroke-width="1.5" />

          <!-- Pumpkin Stem & Crown Roof -->
          <path d="M 0 -28 Q 6 -38, -4 -42" stroke="#047857" stroke-width="4" fill="none" stroke-linecap="round" />
          <polygon points="-8,-28 0,-34 8,-28" fill="${p.frameGold}" />

          <!-- Wrought-Iron Spoked Wheels -->
          <circle cx="-24" cy="22" r="14" fill="none" stroke="${p.frameGold}" stroke-width="2.5" />
          <circle cx="-24" cy="22" r="3" fill="${p.secondary}" />
          <line x1="-24" y1="8" x2="-24" y2="36" stroke="${p.frameGold}" stroke-width="1.2" />
          <line x1="-38" y1="22" x2="-10" y2="22" stroke="${p.frameGold}" stroke-width="1.2" />

          <circle cx="24" cy="22" r="14" fill="none" stroke="${p.frameGold}" stroke-width="2.5" />
          <circle cx="24" cy="22" r="3" fill="${p.secondary}" />
          <line x1="24" y1="8" x2="24" y2="36" stroke="${p.frameGold}" stroke-width="1.2" />
          <line x1="10" y1="22" x2="38" y2="22" stroke="${p.frameGold}" stroke-width="1.2" />
        </g>
      </g>
    `,
  },

  'yellow-1': {
    cardKey: 'yellow-1',
    title: 'The Great Jack-o-Lantern',
    subtitle: 'The Solitary Grin',
    lore: 'Carved with sacred triangle eyes and a jagged grin, the sovereign pumpkin keeps watch from the fence post.',
    renderIllustration: (p) => `
      <g id="art-yellow-1">
        <!-- Weathered Wooden Fence Post -->
        <polygon points="106,170 134,170 130,230 110,230" fill="#2E1605" stroke="${p.secondary}" stroke-width="2" />
        <line x1="114" y1="175" x2="114" y2="225" stroke="#451A03" stroke-width="1.5" />
        <line x1="126" y1="180" x2="126" y2="225" stroke="#451A03" stroke-width="1.5" />

        <!-- Master Carved Jack-o'-Lantern -->
        <g transform="translate(120, 150)">
          <!-- Outer Pumpkin Ribs -->
          <ellipse cx="-16" cy="0" rx="14" ry="24" fill="#9A3412" />
          <ellipse cx="16" cy="0" rx="14" ry="24" fill="#9A3412" />
          <ellipse cx="-8" cy="0" rx="18" ry="26" fill="#C2410C" />
          <ellipse cx="8" cy="0" rx="18" ry="26" fill="#C2410C" />
          <ellipse cx="0" cy="0" rx="20" ry="28" fill="#EA580C" stroke="${p.primary}" stroke-width="2" />

          <!-- Green Stem -->
          <path d="M 0 -28 Q 6 -36, 2 -40" stroke="#047857" stroke-width="4.5" fill="none" stroke-linecap="round" />

          <!-- Glowing Carved Face Features -->
          <!-- Triangular Eyes -->
          <polygon points="-14,-8 -6,-16 -4,-4" fill="#FEF08A" filter="url(#glow-soft)" />
          <polygon points="14,-8 6,-16 4,-4" fill="#FEF08A" filter="url(#glow-soft)" />
          <!-- Triangular Nose -->
          <polygon points="0,-4 -3,2 3,2" fill="#FEF08A" filter="url(#glow-soft)" />
          <!-- Jagged Menacing Grin -->
          <path d="M -16 10 L -12 16 L -8 11 L -4 17 L 0 11 L 4 17 L 8 11 L 12 16 L 16 10 L 12 13 L 8 9 L 4 14 L 0 9 L -4 14 L -8 9 L -12 13 Z" fill="#FEF08A" filter="url(#glow-strong)" />
        </g>
      </g>
    `,
  },

  'yellow-2': {
    cardKey: 'yellow-2',
    title: 'Two Harvest Lanterns',
    subtitle: 'The Flickering Beacons',
    lore: 'Twin brass lanterns flicker against the chill autumn dusk, guiding the harvest wagons safely home.',
    renderIllustration: (p) => `
      <g id="art-yellow-2">
        <!-- Autumn Corn Shocks in Background -->
        <path d="M 65 225 Q 90 190, 75 160 M 72 225 Q 95 195, 85 165" stroke="#78350F" stroke-width="2.5" />
        <path d="M 175 225 Q 150 190, 165 160 M 168 225 Q 145 195, 155 165" stroke="#78350F" stroke-width="2.5" />

        <!-- Left Harvest Lantern -->
        <g transform="translate(95, 168)">
          <!-- Handle & Loop -->
          <circle cx="0" cy="-28" r="6" fill="none" stroke="${p.frameGold}" stroke-width="2" />
          <polygon points="-12,-20 12,-20 8,-12 -8,-12" fill="${p.secondary}" stroke="${p.frameGold}" stroke-width="1.5" />
          <!-- Glass Chimney & Flame -->
          <rect x="-10" y="-12" width="20" height="26" rx="3" fill="#FFFBEB" filter="url(#glow-soft)" opacity="0.9" stroke="${p.frameGold}" stroke-width="1.5" />
          <ellipse cx="0" cy="0" rx="4" ry="7" fill="#F59E0B" filter="url(#glow-strong)" />
          <!-- Lantern Base -->
          <rect x="-14" y="14" width="28" height="8" rx="2" fill="${p.secondary}" stroke="${p.frameGold}" stroke-width="1.5" />
        </g>

        <!-- Right Harvest Lantern -->
        <g transform="translate(145, 168)">
          <!-- Handle & Loop -->
          <circle cx="0" cy="-28" r="6" fill="none" stroke="${p.frameGold}" stroke-width="2" />
          <polygon points="-12,-20 12,-20 8,-12 -8,-12" fill="${p.secondary}" stroke="${p.frameGold}" stroke-width="1.5" />
          <!-- Glass Chimney & Flame -->
          <rect x="-10" y="-12" width="20" height="26" rx="3" fill="#FFFBEB" filter="url(#glow-soft)" opacity="0.9" stroke="${p.frameGold}" stroke-width="1.5" />
          <ellipse cx="0" cy="0" rx="4" ry="7" fill="#F59E0B" filter="url(#glow-strong)" />
          <!-- Lantern Base -->
          <rect x="-14" y="14" width="28" height="8" rx="2" fill="${p.secondary}" stroke="${p.frameGold}" stroke-width="1.5" />
        </g>
      </g>
    `,
  },

  'yellow-3': {
    cardKey: 'yellow-3',
    title: 'Three Floating Pumpkins',
    subtitle: 'The Harvest Trio',
    lore: 'Three carved pumpkin spirits rise into the autumn wind, laughing as golden leaves whirl in their wake.',
    renderIllustration: (p) => `
      <g id="art-yellow-3">
        <!-- Swirling Autumn Breeze Trails -->
        <path d="M 65 190 Q 120 140, 175 180" stroke="${p.primary}" stroke-width="1.5" fill="none" stroke-dasharray="3,3" opacity="0.6" />
        
        <!-- Pumpkin 1 (Top Center, Menacing) -->
        <g transform="translate(120, 126)">
          <ellipse cx="0" cy="0" rx="18" ry="16" fill="#EA580C" stroke="${p.primary}" stroke-width="1.5" />
          <path d="M 0 -16 Q 3 -22, 1 -24" stroke="#047857" stroke-width="2.5" fill="none" />
          <!-- Face -->
          <polygon points="-8,-4 -4,-8 -2,-2" fill="#FEF08A" filter="url(#glow-soft)" />
          <polygon points="8,-4 4,-8 2,-2" fill="#FEF08A" filter="url(#glow-soft)" />
          <path d="M -8 4 Q 0 10, 8 4 Q 0 7, -8 4" fill="#FEF08A" filter="url(#glow-soft)" />
        </g>

        <!-- Pumpkin 2 (Bottom Left, Cheerful) -->
        <g transform="translate(90, 175)">
          <ellipse cx="0" cy="0" rx="16" ry="14" fill="#F59E0B" stroke="${p.frameGold}" stroke-width="1.5" />
          <path d="M 0 -14 Q -3 -18, -1 -20" stroke="#047857" stroke-width="2.5" fill="none" />
          <!-- Triangle Eyes & Smile -->
          <polygon points="-6,-3 -2,-6 0,-1" fill="#FFFBEB" filter="url(#glow-soft)" />
          <polygon points="6,-3 2,-6 0,-1" fill="#FFFBEB" filter="url(#glow-soft)" />
          <path d="M -6 4 Q 0 10, 6 4" stroke="#1C0D02" stroke-width="2" fill="none" />
        </g>

        <!-- Pumpkin 3 (Bottom Right, Mischievous) -->
        <g transform="translate(150, 175)">
          <ellipse cx="0" cy="0" rx="16" ry="14" fill="#D97706" stroke="${p.primary}" stroke-width="1.5" />
          <path d="M 0 -14 Q 3 -18, 1 -20" stroke="#047857" stroke-width="2.5" fill="none" />
          <polygon points="-6,-3 -2,-6 0,-1" fill="#FEF08A" filter="url(#glow-soft)" />
          <polygon points="6,-3 2,-6 0,-1" fill="#FEF08A" filter="url(#glow-soft)" />
          <polygon points="-5,4 5,4 0,8" fill="#FEF08A" filter="url(#glow-soft)" />
        </g>

        <!-- Swirling Autumn Oak Leaves -->
        <path d="M 100 148 Q 110 140, 116 148 Q 110 156, 100 148 Z" fill="#B45309" />
        <path d="M 136 154 Q 146 146, 152 154 Q 146 162, 136 154 Z" fill="#D97706" />
      </g>
    `,
  },

  'yellow-4': {
    cardKey: 'yellow-4',
    title: 'Cornfield Scarecrow',
    subtitle: 'The Harvest Sentinel',
    lore: 'Perched upon weathered timbers with glowing amber eyes, the pumpkin scarecrow commands the midnight stalks.',
    renderIllustration: (p) => `
      <g id="art-yellow-4">
        <!-- Moonlit Cornfield Backdrop -->
        <g stroke="#78350F" stroke-width="2">
          <line x1="68" y1="180" x2="68" y2="230" />
          <line x1="78" y1="170" x2="78" y2="230" />
          <line x1="88" y1="175" x2="88" y2="230" />
          <line x1="152" y1="175" x2="152" y2="230" />
          <line x1="162" y1="170" x2="162" y2="230" />
          <line x1="172" y1="180" x2="172" y2="230" />
        </g>

        <!-- Scarecrow Wooden Frame Post -->
        <g transform="translate(120, 175)">
          <line x1="0" y1="-25" x2="0" y2="50" stroke="#3E1A04" stroke-width="5" stroke-linecap="round" />
          <line x1="-36" y1="-10" x2="36" y2="-10" stroke="#3E1A04" stroke-width="4" stroke-linecap="round" />

          <!-- Tattered Burlap Coat -->
          <polygon points="-14,-10 14,-10 20,25 -20,25" fill="#78350F" stroke="${p.primary}" stroke-width="1.5" />
          <!-- Straw Tuft Sleeves -->
          <line x1="-32" y1="-10" x2="-40" y2="-6" stroke="#FEF08A" stroke-width="2" />
          <line x1="-32" y1="-10" x2="-42" y2="-12" stroke="#FEF08A" stroke-width="2" />
          <line x1="32" y1="-10" x2="40" y2="-6" stroke="#FEF08A" stroke-width="2" />
          <line x1="32" y1="-10" x2="42" y2="-12" stroke="#FEF08A" stroke-width="2" />

          <!-- Carved Pumpkin Head -->
          <circle cx="0" cy="-28" r="16" fill="#EA580C" stroke="${p.primary}" stroke-width="2" />
          <polygon points="-6,-32 -2,-35 -3,-29" fill="#FFFBEB" filter="url(#glow-soft)" />
          <polygon points="6,-32 2,-35 3,-29" fill="#FFFBEB" filter="url(#glow-soft)" />
          <path d="M -6 -23 Q 0 -18, 6 -23" stroke="#FFFBEB" stroke-width="2" fill="none" filter="url(#glow-soft)" />
          <!-- Tattered Burlap Hat -->
          <polygon points="-14,-36 14,-36 0,-48" fill="#451A03" stroke="${p.frameGold}" stroke-width="1" />
        </g>
      </g>
    `,
  },

  'yellow-5': {
    cardKey: 'yellow-5',
    title: 'Harvest Pumpkin Pentacle',
    subtitle: 'The Five Gourd Circle',
    lore: 'Five heirloom gourds sit aligned with the autumn equinox, channeling the fertility and mystery of harvest night.',
    renderIllustration: (p) => `
      <g id="art-yellow-5">
        <!-- Golden Woven Wheat Sheaf Circle -->
        <circle cx="120" cy="165" r="42" fill="#1C0D02" stroke="${p.frameGold}" stroke-width="2" stroke-dasharray="4,4" />
        
        <!-- 5 Mini Gourds in Golden Pentacle Ring -->
        ${[0, 72, 144, 216, 288].map(deg => `
          <g transform="translate(120, 165) rotate(${deg}) translate(0, -32) rotate(-${deg})">
            <ellipse cx="0" cy="0" rx="10" ry="8" fill="#F59E0B" stroke="${p.primary}" stroke-width="1.2" />
            <path d="M 0 -8 Q 2 -12, 0 -13" stroke="#047857" stroke-width="1.5" fill="none" />
            <circle cx="0" cy="0" r="2.5" fill="#FFFBEB" filter="url(#glow-soft)" />
          </g>
        `).join('')}

        <!-- Center Golden Harvest Star -->
        <polygon points="120,150 125,160 135,165 125,170 120,180 115,170 105,165 115,160" fill="${p.frameGold}" stroke="#B45309" stroke-width="1.5" filter="url(#glow-soft)" />
      </g>
    `,
  },

  'yellow-6': {
    cardKey: 'yellow-6',
    title: 'Haunted Harvest Barn',
    subtitle: 'Under the Golden Moon',
    lore: 'Behind weathered timber slats and golden glowing panes, unseen specters gather for the autumn barn dance.',
    renderIllustration: (p) => `
      <g id="art-yellow-6">
        <!-- Huge Golden Harvest Full Moon -->
        <circle cx="120" cy="140" r="44" fill="url(#harvest-moon-grad)" filter="url(#glow-soft)" />
        <circle cx="102" cy="125" r="10" fill="#B45309" opacity="0.3" />
        <circle cx="140" cy="150" r="12" fill="#B45309" opacity="0.25" />

        <!-- Weathered Rustic Barn Silhouette -->
        <g transform="translate(120, 175)">
          <!-- Main Barn Walls -->
          <polygon points="-36,10 0,-18 36,10 36,45 -36,45" fill="#1C0A02" stroke="${p.primary}" stroke-width="2" />
          <!-- Roof Line -->
          <path d="M -42 12 L 0 -22 L 42 12" stroke="${p.frameGold}" stroke-width="2.5" fill="none" />

          <!-- Weather Vane Owl Silhouette on Roof -->
          <line x1="0" y1="-22" x2="0" y2="-34" stroke="${p.frameGold}" stroke-width="1.8" />
          <polygon points="-4,-34 4,-34 0,-40" fill="${p.frameGold}" />

          <!-- Glowing Golden Barn Windows -->
          <polygon points="-8,-6 0,-12 8,-6 8,4 -8,4" fill="#FEF08A" filter="url(#glow-soft)" />
          <!-- Main Double Doors with Crossbeams -->
          <rect x="-18" y="15" width="36" height="30" fill="#2E1205" stroke="${p.frameGold}" stroke-width="1.5" />
          <line x1="-18" y1="15" x2="18" y2="45" stroke="${p.primary}" stroke-width="1.5" />
          <line x1="18" y1="15" x2="-18" y2="45" stroke="${p.primary}" stroke-width="1.5" />
        </g>
      </g>
    `,
  },

  'yellow-7': {
    cardKey: 'yellow-7',
    title: 'Seven Autumn Leaves',
    subtitle: 'The Whispering Gale',
    lore: 'Seven enchanted oak leaves spiral around the candle flame, foretelling seven weeks of haunted harvest frost.',
    renderIllustration: (p) => `
      <g id="art-yellow-7">
        <!-- Center Candle & Warm Halo -->
        <g transform="translate(120, 168)">
          <circle cx="0" cy="-6" r="28" fill="#F59E0B" opacity="0.3" filter="url(#glow-strong)" />
          <rect x="-4" y="5" width="8" height="22" rx="2" fill="#FFFBEB" stroke="${p.primary}" stroke-width="1" />
          <!-- Flame -->
          <path d="M 0 5 C -4 -2, -2 -10, 0 -14 C 2 -10, 4 -2, 0 5 Z" fill="#FEF08A" filter="url(#glow-strong)" />
        </g>

        <!-- Seven Spiraling Oak Leaves -->
        ${[
          { deg: -120, r: 42, col: '#EA580C' },
          { deg: -70, r: 38, col: '#D97706' },
          { deg: -20, r: 44, col: '#F59E0B' },
          { deg: 30, r: 40, col: '#B45309' },
          { deg: 80, r: 42, col: '#EA580C' },
          { deg: 130, r: 36, col: '#F59E0B' },
          { deg: 180, r: 40, col: '#D97706' },
        ].map((l, idx) => `
          <g transform="translate(120, 162) rotate(${l.deg}) translate(0, -${l.r}) rotate(${idx * 45})">
            <!-- Oak Leaf Silhouette -->
            <path d="M 0 -12 C 6 -10, 8 -6, 5 -2 C 8 2, 7 6, 4 9 C 2 12, 0 14, 0 16 C 0 14, -2 12, -4 9 C -7 6, -8 2, -5 -2 C -8 -6, -6 -10, 0 -12 Z" fill="${l.col}" stroke="${p.frameGold}" stroke-width="1" />
            <line x1="0" y1="-10" x2="0" y2="15" stroke="${p.frameGold}" stroke-width="0.8" />
          </g>
        `).join('')}
      </g>
    `,
  },

  'yellow-8': {
    cardKey: 'yellow-8',
    title: 'Harvest Corn Effigy',
    subtitle: 'Eight Amber Runes',
    lore: 'Woven from the final sheaves of the field, the corn-dolly effigy pulses with eight ancient runes of protection.',
    renderIllustration: (p) => `
      <g id="art-yellow-8">
        <!-- Woven Corn Husk Effigy -->
        <g transform="translate(120, 165)">
          <!-- Effigy Head & Crown -->
          <circle cx="0" cy="-30" r="12" fill="#D97706" stroke="${p.frameGold}" stroke-width="1.5" />
          <path d="M -8 -42 L 0 -34 L 8 -42" stroke="${p.frameGold}" stroke-width="2" fill="none" />
          
          <!-- Crossed Sheaf Arms -->
          <path d="M -32 -14 Q 0 -22, 32 -14" stroke="#D97706" stroke-width="6" fill="none" stroke-linecap="round" />
          <line x1="-30" y1="-14" x2="-36" y2="-10" stroke="${p.frameGold}" stroke-width="2" />
          <line x1="30" y1="-14" x2="36" y2="-10" stroke="${p.frameGold}" stroke-width="2" />

          <!-- Skirt / Lower Sheaves -->
          <polygon points="-8,-14 8,-14 24,35 -24,35" fill="#B45309" stroke="${p.primary}" stroke-width="2" />
          <line x1="0" y1="-14" x2="0" y2="35" stroke="${p.frameGold}" stroke-width="2" />
          <line x1="-12" y1="5" x2="12" y2="5" stroke="${p.frameGold}" stroke-width="2" />
        </g>

        <!-- Eight Amber Harvest Runes Surrounding Effigy -->
        ${[0, 45, 90, 135, 180, 225, 270, 315].map(deg => `
          <g transform="translate(120, 165) rotate(${deg}) translate(0, -48)">
            <circle cx="0" cy="0" r="4.5" fill="#1C0D02" stroke="${p.primary}" stroke-width="1.5" />
            <circle cx="0" cy="0" r="2" fill="#FEF08A" filter="url(#glow-soft)" />
          </g>
        `).join('')}
      </g>
    `,
  },

  'yellow-9': {
    cardKey: 'yellow-9',
    title: 'Jack-o-Lantern Spiral',
    subtitle: 'The Nine Floating Lanterns',
    lore: 'Nine smiling gourds ascend in a golden spiral constellation, lighting the path between living and dead.',
    renderIllustration: (p) => `
      <g id="art-yellow-9">
        <!-- Spiral Light Path -->
        <path d="M 120 165 Q 140 145, 130 125 Q 110 105, 95 125 Q 85 155, 115 185 Q 155 195, 165 155" stroke="${p.primary}" stroke-width="1.5" fill="none" stroke-dasharray="3,3" opacity="0.6" />

        <!-- Nine Jack-o'-Lanterns along ascending spiral -->
        ${[
          { cx: 120, cy: 165, r: 8 },
          { cx: 135, cy: 150, r: 8.5 },
          { cx: 135, cy: 132, r: 9 },
          { cx: 120, cy: 118, r: 9.5 },
          { cx: 104, cy: 126, r: 10 },
          { cx: 96, cy: 145, r: 10.5 },
          { cx: 105, cy: 168, r: 11 },
          { cx: 128, cy: 184, r: 11.5 },
          { cx: 154, cy: 165, r: 12 },
        ].map(j => `
          <g transform="translate(${j.cx}, ${j.cy})" filter="url(#glow-soft)">
            <circle cx="0" cy="0" r="${j.r}" fill="#EA580C" stroke="${p.frameGold}" stroke-width="1.2" />
            <!-- Tiny Carved Face -->
            <polygon points="-2,-1 0,-3 2,-1" fill="#FEF08A" />
            <path d="M -3 2 Q 0 4, 3 2" stroke="#FEF08A" stroke-width="1" fill="none" />
          </g>
        `).join('')}
      </g>
    `,
  },

  'yellow-skip': {
    cardKey: 'yellow-skip',
    title: 'Haunted Scarecrow Barrier',
    subtitle: 'The Forbidden Boundary',
    lore: 'With crossed wooden scythes and an unblinking pumpkin scowl, the harvest scarecrow commands all to halt.',
    renderIllustration: (p) => `
      <g id="art-yellow-skip">
        <!-- Spooky Cornstalk Ward Circle -->
        <circle cx="120" cy="165" r="54" fill="#1C0D02" stroke="${p.secondary}" stroke-width="2" stroke-dasharray="4,4" />

        <!-- Prominent Themed SKIP Prohibition Symbol -->
        <g transform="translate(120, 165)" filter="url(#glow-strong)">
          <!-- Outer Pumpkin Gold Ring -->
          <circle cx="0" cy="0" r="46" fill="#3B1704" stroke="${p.primary}" stroke-width="9" />
          <circle cx="0" cy="0" r="46" fill="none" stroke="${p.frameGold}" stroke-width="2" />
          <!-- Heavy Spiked Diagonal Wooden Bar -->
          <line x1="-32" y1="-32" x2="32" y2="32" stroke="${p.primary}" stroke-width="9" stroke-linecap="round" />
          <line x1="-32" y1="-32" x2="32" y2="32" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />

          <!-- Crossed Scythe Blades -->
          <path d="M -22 -22 Q -30 -10, -22 0" stroke="${p.frameGold}" stroke-width="2.5" fill="none" />
          <path d="M 22 22 Q 30 10, 22 0" stroke="${p.frameGold}" stroke-width="2.5" fill="none" />

          <!-- Central Glowing Jack-o'-Lantern Medallion -->
          <circle cx="0" cy="0" r="14" fill="#EA580C" stroke="${p.frameGold}" stroke-width="1.5" />
          <polygon points="-4,-3 -1,-6 0,-2" fill="#FEF08A" />
          <polygon points="4,-3 1,-6 0,-2" fill="#FEF08A" />
          <path d="M -4 4 Q 0 8, 4 4" stroke="#FEF08A" stroke-width="1.5" fill="none" />
        </g>
      </g>
    `,
  },

  'yellow-reverse': {
    cardKey: 'yellow-reverse',
    title: 'Autumn Cyclone',
    subtitle: 'Swirling Whirlwinds in Reverse',
    lore: 'Opposing gusts of fiery autumn leaves and nocturnal bats invert the direction of the wind.',
    renderIllustration: (p) => `
      <g id="art-yellow-reverse">
        <!-- Circular Autumn Wind Ring -->
        <circle cx="120" cy="165" r="50" fill="none" stroke="${p.secondary}" stroke-width="2" stroke-dasharray="4,4" opacity="0.7" />

        <!-- Top Looping Arrow & Whirlwind (Clockwise) -->
        <g filter="url(#glow-strong)">
          <path d="M 78 168 C 76 126, 126 112, 154 136" fill="none" stroke="${p.primary}" stroke-width="10" stroke-linecap="round" />
          <path d="M 78 168 C 76 126, 126 112, 154 136" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
          <polygon points="144,118 168,140 140,154" fill="${p.primary}" stroke="#FFFFFF" stroke-width="2" />
          <!-- Autumn Leaf on Arrow -->
          <circle cx="152" cy="136" r="3" fill="#EA580C" />
        </g>

        <!-- Bottom Looping Arrow & Whirlwind (Counter-Clockwise) -->
        <g filter="url(#glow-strong)">
          <path d="M 162 162 C 164 204, 114 218, 86 194" fill="none" stroke="${p.primary}" stroke-width="10" stroke-linecap="round" />
          <path d="M 162 162 C 164 204, 114 218, 86 194" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
          <polygon points="96,212 72,190 100,176" fill="${p.primary}" stroke="#FFFFFF" stroke-width="2" />
          <!-- Autumn Leaf on Arrow -->
          <circle cx="88" cy="194" r="3" fill="#EA580C" />
        </g>

        <!-- Center Golden Harvest Star -->
        <polygon points="120,154 123,162 131,165 123,168 120,176 117,168 109,165 117,162" fill="#FEF08A" filter="url(#glow-soft)" />
      </g>
    `,
  },

  'yellow-draw2': {
    cardKey: 'yellow-draw2',
    title: 'Twin Jack-o-Lantern Cards',
    subtitle: 'The Harvest Bounty (+2)',
    lore: 'Two carved pumpkin lanterns cast twin glowing cards upon the threshing floor, demanding double retribution.',
    renderIllustration: (p) => `
      <g id="art-yellow-draw2">
        <!-- Harvest Gold Halo -->
        <ellipse cx="120" cy="165" rx="52" ry="46" fill="url(#harvest-moon-grad)" opacity="0.6" filter="url(#glow-soft)" />

        <!-- Two Harvest Cards -->
        <!-- Card 1 (Left tilted) -->
        <g transform="translate(100, 150) rotate(-14)">
          <rect x="-24" y="-36" width="48" height="72" rx="6" fill="#2E1205" stroke="${p.frameGold}" stroke-width="3" />
          <rect x="-18" y="-30" width="36" height="60" rx="4" fill="${p.primary}" opacity="0.85" />
          <circle cx="0" cy="0" r="10" fill="#FEF08A" opacity="0.7" />
        </g>

        <!-- Card 2 (Right tilted) -->
        <g transform="translate(140, 158) rotate(12)">
          <rect x="-24" y="-36" width="48" height="72" rx="6" fill="#2E1205" stroke="${p.frameGold}" stroke-width="3" />
          <rect x="-18" y="-30" width="36" height="60" rx="4" fill="${p.primary}" opacity="0.9" />
          <!-- Pumpkin face on card -->
          <circle cx="0" cy="-4" r="8" fill="#EA580C" />
          <polygon points="-2,-4 0,-6 2,-4" fill="#FEF08A" />
        </g>

        <!-- Twin Mini Jack-o'-Lanterns Flanking -->
        <g transform="translate(78, 175) scale(0.7)">
          <circle cx="0" cy="0" r="14" fill="#EA580C" stroke="${p.frameGold}" stroke-width="2" />
          <polygon points="-3,-2 0,-5 3,-2" fill="#FEF08A" />
        </g>
        <g transform="translate(162, 175) scale(0.7)">
          <circle cx="0" cy="0" r="14" fill="#EA580C" stroke="${p.frameGold}" stroke-width="2" />
          <polygon points="-3,-2 0,-5 3,-2" fill="#FEF08A" />
        </g>

        <!-- Bold Gothic +2 Banner -->
        <g transform="translate(120, 185)" filter="url(#glow-strong)">
          <rect x="-44" y="-20" width="88" height="40" rx="20" fill="#1C0A02" stroke="${p.primary}" stroke-width="3.5" />
          <text x="0" y="2" text-anchor="middle" dominant-baseline="central"
                font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
                font-size="34" font-weight="900" fill="#FFFFFF"
                stroke="${p.primary}" stroke-width="1.5" paint-order="stroke fill">+2</text>
        </g>
      </g>
    `,
  },
};
