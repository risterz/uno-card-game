import { HalloweenCardArtwork, SVG_SNIPPETS } from './artwork';

export const RED_ARTWORKS: Record<string, HalloweenCardArtwork> = {
  'red-0': {
    cardKey: 'red-0',
    title: "Vampire's Awakening",
    subtitle: 'Crimson Crypt Sarcophagus',
    lore: 'The ancient lord of the crypt stirs as the blood moon aligns, rising from his eternal stone rest.',
    renderIllustration: (p) => `
      <g id="art-red-0">
        <!-- Crypt Arch Background -->
        <path d="M 60 230 L 60 130 C 60 90, 180 90, 180 130 L 180 230 Z" fill="#2A060E" stroke="${p.frameGold}" stroke-width="1.5" opacity="0.6" />
        
        <!-- Distant Blood Moon -->
        <circle cx="120" cy="120" r="32" fill="#E11D48" opacity="0.4" filter="url(#glow-soft)" />
        <circle cx="120" cy="120" r="28" fill="#881337" opacity="0.7" />

        <!-- Gothic Stone Sarcophagus -->
        <polygon points="85,170 155,170 148,235 92,235" fill="#150307" stroke="${p.primary}" stroke-width="2" />
        <line x1="92" y1="190" x2="148" y2="190" stroke="${p.frameGold}" stroke-width="1.5" />
        <!-- Ornate Cross on Coffin -->
        <path d="M 120 180 L 120 225 M 106 195 L 134 195" stroke="${p.frameGold}" stroke-width="2.5" stroke-linecap="round" />
        
        <!-- Rising Vampire Silhouette -->
        <path d="M 120 130 C 112 130, 108 138, 108 148 C 108 162, 100 176, 92 186 C 104 184, 114 175, 120 166 C 126 175, 136 184, 148 186 C 140 176, 132 162, 132 148 C 132 138, 128 130, 120 130 Z" fill="#0A0204" />
        <!-- Glowing Red Vampire Eyes -->
        <circle cx="116" cy="144" r="1.5" fill="#FF4D6D" filter="url(#glow-soft)" />
        <circle cx="124" cy="144" r="1.5" fill="#FF4D6D" filter="url(#glow-soft)" />

        <!-- Flocking Bats -->
        ${SVG_SNIPPETS.batSilhouette(80, 110, 0.7, '#FF4D6D')}
        ${SVG_SNIPPETS.batSilhouette(160, 105, 0.8, '#FF4D6D')}
        ${SVG_SNIPPETS.batSilhouette(120, 85, 0.6, '#FDA4AF')}
      </g>
    `,
  },

  'red-1': {
    cardKey: 'red-1',
    title: 'Crimson Nightwing',
    subtitle: 'The Great Vampire Bat',
    lore: 'With wings that blot out the blood moon, the crimson bat commands the nocturnal skies of Dracul.',
    renderIllustration: (p) => `
      <g id="art-red-1">
        <!-- Giant Glowing Blood Moon -->
        <circle cx="120" cy="155" r="46" fill="url(#blood-moon-grad)" filter="url(#glow-soft)" />
        <!-- Moon Craters -->
        <circle cx="106" cy="140" r="7" fill="#700918" opacity="0.4" />
        <circle cx="134" cy="168" r="9" fill="#700918" opacity="0.35" />
        <circle cx="138" cy="138" r="5" fill="#700918" opacity="0.3" />

        <!-- Distant Mountain Peaks & Castle Silhouettes -->
        <polygon points="60,230 90,195 120,230" fill="#190308" />
        <polygon points="110,230 145,185 180,230" fill="#140206" />
        <rect x="140" y="175" width="8" height="15" fill="#140206" />

        <!-- Detailed Crimson Nightwing Bat -->
        <g transform="translate(120, 160)">
          <!-- Left Wing -->
          <path d="M 0 -8 C -14 -24, -42 -22, -62 -4 C -54 8, -42 12, -34 22 C -28 12, -18 8, 0 10" fill="#180307" stroke="${p.primary}" stroke-width="1.8" />
          <path d="M 0 -8 C -20 -4, -36 4, -48 18" stroke="${p.secondary}" stroke-width="1.2" fill="none" />
          <!-- Right Wing -->
          <path d="M 0 -8 C 14 -24, 42 -22, 62 -4 C 54 8, 42 12, 34 22 C 28 12, 18 8, 0 10" fill="#180307" stroke="${p.primary}" stroke-width="1.8" />
          <path d="M 0 -8 C 20 -4, 36 4, 48 18" stroke="${p.secondary}" stroke-width="1.2" fill="none" />
          <!-- Bat Body & Ears -->
          <ellipse cx="0" cy="4" rx="8" ry="14" fill="#0A0103" stroke="${p.frameGold}" stroke-width="1" />
          <polygon points="-5,-8 -8,-18 -2,-11" fill="#0A0103" />
          <polygon points="5,-8 8,-18 2,-11" fill="#0A0103" />
          <!-- Eyes -->
          <circle cx="-3" cy="-2" r="1.8" fill="#FF4D6D" filter="url(#glow-soft)" />
          <circle cx="3" cy="-2" r="1.8" fill="#FF4D6D" filter="url(#glow-soft)" />
          <!-- Fangs -->
          <polygon points="-2,4 0,7 -1,4" fill="#FFFFFF" />
          <polygon points="1,4 0,7 2,4" fill="#FFFFFF" />
        </g>
      </g>
    `,
  },

  'red-2': {
    cardKey: 'red-2',
    title: 'Two Haunted Roses',
    subtitle: 'Entwined Blood Blossoms',
    lore: 'Nourished by ancient crimson tears, twin roses bloom eternally amidst the cursed cemetery brambles.',
    renderIllustration: (p) => `
      <g id="art-red-2">
        <!-- Stone Crypt Wall Backdrop -->
        <rect x="70" y="100" width="100" height="135" rx="10" fill="#170308" stroke="${p.secondary}" stroke-width="1.5" />
        
        <!-- Left Blood Rose -->
        <g transform="translate(98, 155)">
          <path d="M 0 35 Q -10 15, 0 0" stroke="#064E3B" stroke-width="3" fill="none" />
          <!-- Thorns -->
          <polygon points="-4,22 -10,20 -4,18" fill="#064E3B" />
          <polygon points="2,10 8,8 2,6" fill="#064E3B" />
          <!-- Petals -->
          <ellipse cx="0" cy="-6" rx="16" ry="14" fill="${p.secondary}" />
          <path d="M -12 -8 C -14 -18, 14 -18, 12 -8 C 8 2, -8 2, -12 -8 Z" fill="${p.primary}" stroke="${p.frameGold}" stroke-width="1" />
          <circle cx="0" cy="-8" r="6" fill="#FF4D6D" />
          <!-- Dewdrop -->
          <circle cx="6" cy="2" r="2.2" fill="#FDA4AF" filter="url(#glow-soft)" />
        </g>

        <!-- Right Blood Rose -->
        <g transform="translate(142, 165)">
          <path d="M 0 25 Q 10 10, 0 -10" stroke="#064E3B" stroke-width="3" fill="none" />
          <!-- Thorns -->
          <polygon points="3,12 9,10 3,8" fill="#064E3B" />
          <!-- Petals -->
          <ellipse cx="0" cy="-16" rx="16" ry="14" fill="${p.secondary}" />
          <path d="M -12 -18 C -14 -28, 14 -28, 12 -18 C 8 -8, -8 -8, -12 -18 Z" fill="${p.primary}" stroke="${p.frameGold}" stroke-width="1" />
          <circle cx="0" cy="-18" r="6" fill="#FF4D6D" />
          <!-- Dewdrop -->
          <circle cx="-5" cy="-8" r="2.2" fill="#FDA4AF" filter="url(#glow-soft)" />
        </g>

        <!-- Entwined Bramble Ribbons -->
        <path d="M 85 210 Q 120 185, 155 215" stroke="${p.frameGold}" stroke-width="1.5" fill="none" stroke-dasharray="3,3" />
      </g>
    `,
  },

  'red-3': {
    cardKey: 'red-3',
    title: 'Three Gothic Candles',
    subtitle: 'The Blood Candelabra',
    lore: 'Three black wax candles flicker with trapped phantom heat, illuminating the dark corridors of the ancestral tomb.',
    renderIllustration: (p) => `
      <g id="art-red-3">
        <!-- Wrought-Iron Candelabra Base -->
        <g transform="translate(120, 195)">
          <path d="M -35 0 C -35 -20, 35 -20, 35 0" stroke="${p.frameGold}" stroke-width="3" fill="none" />
          <line x1="0" y1="-20" x2="0" y2="30" stroke="${p.frameGold}" stroke-width="4" stroke-linecap="round" />
          <path d="M -20 30 L 20 30" stroke="${p.frameGold}" stroke-width="4" stroke-linecap="round" />
        </g>

        <!-- Candle 1 (Left) -->
        <g transform="translate(85, 160)">
          <rect x="-7" y="0" width="14" height="35" rx="2" fill="#2A050D" stroke="${p.primary}" stroke-width="1.5" />
          <!-- Dripping Wax -->
          <path d="M -5 6 C -5 14, -1 14, -1 6" fill="#E11D48" />
          <!-- Wick & Flame -->
          <line x1="0" y1="0" x2="0" y2="-6" stroke="#000000" stroke-width="1.5" />
          <path d="M 0 -6 C -6 -14, -3 -22, 0 -26 C 3 -22, 6 -14, 0 -6 Z" fill="#FF4D6D" filter="url(#glow-soft)" />
          <ellipse cx="0" cy="-12" rx="2" ry="5" fill="#FFE4E6" />
        </g>

        <!-- Candle 2 (Center, Taller) -->
        <g transform="translate(120, 142)">
          <rect x="-8" y="0" width="16" height="42" rx="2" fill="#2A050D" stroke="${p.frameGold}" stroke-width="1.8" />
          <!-- Dripping Wax -->
          <path d="M 2 8 C 2 18, 6 18, 6 8" fill="#E11D48" />
          <!-- Wick & Flame -->
          <line x1="0" y1="0" x2="0" y2="-6" stroke="#000000" stroke-width="1.5" />
          <path d="M 0 -6 C -7 -16, -4 -26, 0 -30 C 4 -26, 7 -16, 0 -6 Z" fill="#FF4D6D" filter="url(#glow-soft)" />
          <ellipse cx="0" cy="-14" rx="2.5" ry="6" fill="#FFFFFF" />
        </g>

        <!-- Candle 3 (Right) -->
        <g transform="translate(155, 160)">
          <rect x="-7" y="0" width="14" height="35" rx="2" fill="#2A050D" stroke="${p.primary}" stroke-width="1.5" />
          <!-- Dripping Wax -->
          <path d="M -3 5 C -3 13, 1 13, 1 5" fill="#E11D48" />
          <!-- Wick & Flame -->
          <line x1="0" y1="0" x2="0" y2="-6" stroke="#000000" stroke-width="1.5" />
          <path d="M 0 -6 C -6 -14, -3 -22, 0 -26 C 3 -22, 6 -14, 0 -6 Z" fill="#FF4D6D" filter="url(#glow-soft)" />
          <ellipse cx="0" cy="-12" rx="2" ry="5" fill="#FFE4E6" />
        </g>
      </g>
    `,
  },

  'red-4': {
    cardKey: 'red-4',
    title: 'Castle Dracul',
    subtitle: 'The Four Spires',
    lore: 'High atop the craggy crimson precipice, the four spires of Dracul pierce the stormy blood-red firmament.',
    renderIllustration: (p) => `
      <g id="art-red-4">
        <!-- Crimson Lightning Storm Background -->
        <rect x="65" y="95" width="110" height="135" rx="10" fill="#180308" />
        <path d="M 95 95 L 90 120 L 98 123 L 92 145" stroke="#FDA4AF" stroke-width="1.5" fill="none" opacity="0.8" />
        <path d="M 145 95 L 140 115 L 146 118 L 138 138" stroke="#FDA4AF" stroke-width="1.2" fill="none" opacity="0.6" />

        <!-- Cliff Precipice -->
        <path d="M 65 210 Q 120 195, 175 220 L 175 230 L 65 230 Z" fill="#0C0204" />

        <!-- The Four Spires of Dracul Castle -->
        <!-- Spire 1 (Far Left) -->
        <rect x="75" y="150" width="14" height="60" fill="#22040B" stroke="${p.primary}" stroke-width="1" />
        <polygon points="73,150 82,120 91,150" fill="#150207" stroke="${p.frameGold}" stroke-width="1" />

        <!-- Spire 2 (Center Left, Grand Keep) -->
        <rect x="94" y="130" width="22" height="80" fill="#2A050E" stroke="${p.primary}" stroke-width="1.2" />
        <polygon points="92,130 105,95 118,130" fill="#180309" stroke="${p.frameGold}" stroke-width="1.2" />
        <!-- Illuminated Red Window -->
        <rect x="101" y="145" width="8" height="14" rx="4" fill="#FF4D6D" filter="url(#glow-soft)" />

        <!-- Spire 3 (Center Right, Belfry) -->
        <rect x="122" y="140" width="18" height="70" fill="#22040B" stroke="${p.primary}" stroke-width="1.2" />
        <polygon points="120,140 131,108 142,140" fill="#150207" stroke="${p.frameGold}" stroke-width="1.2" />
        <rect x="127" y="152" width="8" height="12" rx="4" fill="#FF4D6D" opacity="0.8" />

        <!-- Spire 4 (Far Right) -->
        <rect x="145" y="155" width="14" height="55" fill="#1C0309" stroke="${p.primary}" stroke-width="1" />
        <polygon points="143,155 152,125 161,155" fill="#120206" stroke="${p.frameGold}" stroke-width="1" />

        <!-- Bats around Spire -->
        ${SVG_SNIPPETS.batSilhouette(86, 115, 0.6, '#FDA4AF')}
        ${SVG_SNIPPETS.batSilhouette(155, 118, 0.6, '#FDA4AF')}
      </g>
    `,
  },

  'red-5': {
    cardKey: 'red-5',
    title: "Vampire Lord's Amulet",
    subtitle: 'The Pentagram Blood Ruby',
    lore: 'An antique heirloom bearing five enchanted facets of crushed ruby that pulse with dark immortality.',
    renderIllustration: (p) => `
      <g id="art-red-5">
        <!-- Radiating Amulet Rays -->
        <g transform="translate(120, 165)">
          <!-- 5 Radiating Beams -->
          ${[0, 72, 144, 216, 288].map(deg => `
            <line x1="0" y1="0" x2="0" y2="-52" transform="rotate(${deg})" stroke="${p.lightGlow}" stroke-width="2" stroke-dasharray="4,4" opacity="0.6" />
            <circle cx="0" cy="-52" r="3" transform="rotate(${deg})" fill="${p.frameGold}" />
          `).join('')}

          <!-- Outer Gothic Ornate Ring -->
          <circle cx="0" cy="0" r="42" fill="#170308" stroke="${p.frameGold}" stroke-width="3" />
          <circle cx="0" cy="0" r="36" fill="none" stroke="${p.secondary}" stroke-width="1.5" />

          <!-- Five-Pointed Star Filigree -->
          <polygon points="0,-34 20,-20 32,10 0,28 -32,10 -20,-20" fill="#2A050E" stroke="${p.primary}" stroke-width="2" />

          <!-- Central Ruby Gem -->
          <polygon points="0,-18 17,-5 11,15 -11,15 -17,-5" fill="url(#ruby-gem-grad)" stroke="#FFFFFF" stroke-width="1.5" filter="url(#glow-soft)" />
          <!-- Inner Facet Highlights -->
          <line x1="0" y1="-18" x2="0" y2="4" stroke="#FFFFFF" stroke-width="1" opacity="0.7" />
          <line x1="17" y1="-5" x2="0" y2="4" stroke="#FFFFFF" stroke-width="1" opacity="0.7" />
          <line x1="-17" y1="-5" x2="0" y2="4" stroke="#FFFFFF" stroke-width="1" opacity="0.7" />
          <line x1="11" y1="15" x2="0" y2="4" stroke="#FFFFFF" stroke-width="1" opacity="0.7" />
          <line x1="-11" y1="15" x2="0" y2="4" stroke="#FFFFFF" stroke-width="1" opacity="0.7" />
        </g>
      </g>
    `,
  },

  'red-6': {
    cardKey: 'red-6',
    title: 'The Blood Chalice',
    subtitle: 'Elixir of the Damned',
    lore: 'Carved with grimacing gargoyles, the golden chalice overflows with six drops of consecrated vampire vintage.',
    renderIllustration: (p) => `
      <g id="art-red-6">
        <!-- Backdrop Arcane Niche -->
        <path d="M 75 225 L 75 135 C 75 100, 165 100, 165 135 L 165 225 Z" fill="#1A0307" stroke="${p.frameGold}" stroke-width="1.5" />

        <!-- Golden Gothic Chalice -->
        <g transform="translate(120, 175)">
          <!-- Chalice Base -->
          <ellipse cx="0" cy="38" rx="26" ry="8" fill="${p.frameGold}" stroke="#78350F" stroke-width="2" />
          <!-- Chalice Stem & Knop -->
          <rect x="-4" y="10" width="8" height="28" fill="${p.frameGold}" />
          <circle cx="0" cy="22" r="7" fill="${p.primary}" stroke="${p.frameGold}" stroke-width="2" />
          <!-- Chalice Cup Body -->
          <path d="M -26 -12 C -28 14, 28 14, 26 -12 Z" fill="${p.frameGold}" stroke="#78350F" stroke-width="2" />
          <!-- Liquid Rim -->
          <ellipse cx="0" cy="-12" rx="26" ry="6" fill="#881337" stroke="${p.frameGold}" stroke-width="1.5" />
          <!-- Glowing Crimson Liquid -->
          <ellipse cx="0" cy="-13" rx="22" ry="4.5" fill="#E11D48" filter="url(#glow-soft)" />

          <!-- 6 Floating Blood Droplets -->
          <g filter="url(#glow-soft)">
            <circle cx="-16" cy="-28" r="3" fill="#FF4D6D" />
            <circle cx="-8" cy="-36" r="3.5" fill="#FF4D6D" />
            <circle cx="0" cy="-44" r="4" fill="#FF4D6D" />
            <circle cx="8" cy="-36" r="3.5" fill="#FF4D6D" />
            <circle cx="16" cy="-28" r="3" fill="#FF4D6D" />
            <circle cx="0" cy="-24" r="2.5" fill="#FF4D6D" />
          </g>
        </g>
      </g>
    `,
  },

  'red-7': {
    cardKey: 'red-7',
    title: 'The Seven Belfry Bats',
    subtitle: 'Swarm of the Cathedral',
    lore: 'As the midnight bell tolled seven times, a crimson cloud of seven winged horrors burst forth from the steeple.',
    renderIllustration: (p) => `
      <g id="art-red-7">
        <!-- Gothic Cathedral Belfry Window -->
        <path d="M 68 225 L 68 135 C 68 95, 172 95, 172 135 L 172 225 Z" fill="#20040A" stroke="${p.frameGold}" stroke-width="2" />
        <!-- Stained Glass Traceries -->
        <line x1="120" y1="95" x2="120" y2="225" stroke="${p.frameGold}" stroke-width="1.5" />
        <path d="M 68 155 C 95 145, 145 145, 172 155" stroke="${p.frameGold}" stroke-width="1.5" fill="none" />
        <!-- Rose Glass Radiance -->
        <circle cx="120" cy="135" r="22" fill="#E11D48" opacity="0.5" filter="url(#glow-soft)" />

        <!-- Seven Belfry Bats in Flight Formation -->
        ${SVG_SNIPPETS.batSilhouette(120, 115, 0.9, '#FFFFFF')}
        ${SVG_SNIPPETS.batSilhouette(95, 138, 0.75, '#FDA4AF')}
        ${SVG_SNIPPETS.batSilhouette(145, 138, 0.75, '#FDA4AF')}
        ${SVG_SNIPPETS.batSilhouette(80, 168, 0.65, '#E11D48')}
        ${SVG_SNIPPETS.batSilhouette(160, 168, 0.65, '#E11D48')}
        ${SVG_SNIPPETS.batSilhouette(102, 195, 0.7, '#881337')}
        ${SVG_SNIPPETS.batSilhouette(138, 195, 0.7, '#881337')}
      </g>
    `,
  },

  'red-8': {
    cardKey: 'red-8',
    title: 'Gothic Gargoyle',
    subtitle: 'Sentinel of the Abyss',
    lore: 'Stone by day, predator by night. The horned sentinel perches high upon the roofline surveying its realm.',
    renderIllustration: (p) => `
      <g id="art-red-8">
        <!-- Blood Moon Backdrop -->
        <circle cx="135" cy="140" r="38" fill="url(#blood-moon-grad)" filter="url(#glow-soft)" />

        <!-- Stone Cathedral Parapet & Cornice -->
        <polygon points="65,225 140,225 150,190 65,190" fill="#140206" stroke="${p.primary}" stroke-width="1.5" />
        <rect x="135" y="185" width="22" height="15" fill="#20040A" stroke="${p.frameGold}" stroke-width="1" />

        <!-- Detailed Stone Gargoyle Perched -->
        <g transform="translate(110, 165)">
          <!-- Wings -->
          <path d="M 0 0 C 10 -25, 35 -30, 48 -18 C 40 -6, 32 2, 25 15 Z" fill="#22050B" stroke="${p.frameGold}" stroke-width="1.2" />
          <path d="M -15 0 C -25 -25, -45 -28, -52 -15 C -42 -4, -32 4, -22 15 Z" fill="#180307" stroke="${p.primary}" stroke-width="1" />
          <!-- Torso & Claws -->
          <ellipse cx="2" cy="10" rx="14" ry="16" fill="#120205" stroke="${p.primary}" stroke-width="1.5" />
          <!-- Head & Horns -->
          <circle cx="0" cy="-6" r="10" fill="#20040A" stroke="${p.frameGold}" stroke-width="1" />
          <path d="M -6 -12 C -8 -24, -14 -22, -18 -26 C -12 -16, -6 -14, -4 -12" fill="${p.frameGold}" />
          <path d="M 6 -12 C 8 -24, 14 -22, 18 -26 C 12 -16, 6 -14, 4 -12" fill="${p.frameGold}" />
          <!-- Glowing Eyes -->
          <circle cx="-3" cy="-6" r="1.8" fill="#FF4D6D" filter="url(#glow-soft)" />
          <circle cx="3" cy="-6" r="1.8" fill="#FF4D6D" filter="url(#glow-soft)" />
          <!-- Fanged Snarl -->
          <path d="M -4 -1 Q 0 4, 4 -1" stroke="#FFFFFF" stroke-width="1.2" fill="none" />
        </g>
      </g>
    `,
  },

  'red-9': {
    cardKey: 'red-9',
    title: 'The Phantom Carriage',
    subtitle: 'Midnight Steeds of Dracul',
    lore: 'Driven by invisible hands, the gothic black carriage crosses the fog-bound gorge before cockcrow.',
    renderIllustration: (p) => `
      <g id="art-red-9">
        <!-- Misty Cobblestone Bridge -->
        <path d="M 65 210 Q 120 200, 175 210 L 175 230 L 65 230 Z" fill="#120206" stroke="${p.frameGold}" stroke-width="1.5" />
        
        <!-- Blood Moon Silhouette -->
        <circle cx="100" cy="130" r="30" fill="url(#blood-moon-grad)" filter="url(#glow-soft)" opacity="0.8" />

        <!-- Gothic Coach Body -->
        <g transform="translate(130, 168)">
          <!-- Carriage Cabin -->
          <rect x="-28" y="-22" width="46" height="32" rx="6" fill="#24050E" stroke="${p.frameGold}" stroke-width="2" />
          <!-- Arched Windows with Glowing Red Interior -->
          <rect x="-20" y="-16" width="14" height="16" rx="4" fill="#FF4D6D" opacity="0.8" filter="url(#glow-soft)" />
          <rect x="0" y="-16" width="14" height="16" rx="4" fill="#FF4D6D" opacity="0.8" filter="url(#glow-soft)" />
          <!-- Roof Filigree & Crest -->
          <path d="M -32 -22 Q -5 -32, 22 -22" stroke="${p.frameGold}" stroke-width="2" fill="none" />
          <polygon points="-5,-32 -2,-26 -8,-26" fill="${p.frameGold}" />

          <!-- Front Carriage Lantern -->
          <circle cx="24" cy="-14" r="5" fill="#FF4D6D" filter="url(#glow-soft)" />

          <!-- Ornate Spoked Wheels -->
          <circle cx="-16" cy="18" r="14" fill="none" stroke="${p.frameGold}" stroke-width="2.5" />
          <circle cx="-16" cy="18" r="3" fill="${p.primary}" />
          <line x1="-16" y1="4" x2="-16" y2="32" stroke="${p.frameGold}" stroke-width="1.2" />
          <line x1="-30" y1="18" x2="-2" y2="18" stroke="${p.frameGold}" stroke-width="1.2" />

          <circle cx="16" cy="18" r="11" fill="none" stroke="${p.frameGold}" stroke-width="2.5" />
          <circle cx="16" cy="18" r="2.5" fill="${p.primary}" />
          <line x1="16" y1="7" x2="16" y2="29" stroke="${p.frameGold}" stroke-width="1.2" />
          <line x1="5" y1="18" x2="27" y2="18" stroke="${p.frameGold}" stroke-width="1.2" />
        </g>
      </g>
    `,
  },

  'red-skip': {
    cardKey: 'red-skip',
    title: 'Vampire Crypt Gate',
    subtitle: 'Forbidden Blood Barrier',
    lore: 'None shall pass the iron-spiked portals of the elder tomb, bound tight by cursed vampire seals.',
    renderIllustration: (p) => `
      <g id="art-red-skip">
        <!-- Gothic Stone Portal Frame -->
        <path d="M 65 230 L 65 125 C 65 80, 175 80, 175 125 L 175 230 Z" fill="#140205" stroke="${p.frameGold}" stroke-width="2" />
        
        <!-- Heavy Spiked Crypt Iron Bars -->
        <g stroke="${p.secondary}" stroke-width="2.5">
          <line x1="85" y1="95" x2="85" y2="230" />
          <line x1="102" y1="85" x2="102" y2="230" />
          <line x1="120" y1="80" x2="120" y2="230" />
          <line x1="138" y1="85" x2="138" y2="230" />
          <line x1="155" y1="95" x2="155" y2="230" />
        </g>

        <!-- Prominent Themed SKIP Symbol (Prohibition Seal) -->
        <g transform="translate(120, 165)" filter="url(#glow-strong)">
          <!-- Outer Spiked Blood Ring -->
          <circle cx="0" cy="0" r="46" fill="#1C0308" stroke="${p.primary}" stroke-width="9" />
          <circle cx="0" cy="0" r="46" fill="none" stroke="${p.frameGold}" stroke-width="2" />
          <!-- Heavy Spiked Diagonal Bar -->
          <line x1="-32" y1="-32" x2="32" y2="32" stroke="${p.primary}" stroke-width="9" stroke-linecap="round" />
          <line x1="-32" y1="-32" x2="32" y2="32" stroke="${p.frameGold}" stroke-width="2" stroke-linecap="round" />

          <!-- Central Cursed Skull Emblem -->
          <circle cx="0" cy="0" r="14" fill="#0A0103" stroke="${p.frameGold}" stroke-width="1.5" />
          <circle cx="-4" cy="-2" r="2.2" fill="#FF4D6D" />
          <circle cx="4" cy="-2" r="2.2" fill="#FF4D6D" />
          <path d="M -3 6 L 3 6" stroke="#FFFFFF" stroke-width="1.2" />
        </g>
      </g>
    `,
  },

  'red-reverse': {
    cardKey: 'red-reverse',
    title: 'Vampiric Ouroboros',
    subtitle: 'Twin Blood Bats in Reverse',
    lore: 'Two ancient bats trace the eternal reverse spiral, inverting the flow of mortal time.',
    renderIllustration: (p) => `
      <g id="art-red-reverse">
        <!-- Circular Blood Vortex Background -->
        <circle cx="120" cy="165" r="50" fill="none" stroke="${p.secondary}" stroke-width="2" stroke-dasharray="6,4" opacity="0.6" />
        
        <!-- Swirling Reverse Arrow Tracks -->
        <!-- Top Track & Arrow (Clockwise rightwards) -->
        <g filter="url(#glow-strong)">
          <path d="M 78 168 C 76 126, 126 112, 154 136" fill="none" stroke="${p.primary}" stroke-width="10" stroke-linecap="round" />
          <path d="M 78 168 C 76 126, 126 112, 154 136" fill="none" stroke="${p.frameGold}" stroke-width="2" stroke-linecap="round" />
          <!-- Arrow Head / Bat Silhouette -->
          <polygon points="144,118 168,140 140,154" fill="${p.primary}" stroke="${p.frameGold}" stroke-width="2" />
          <!-- Bat Wing Graphic on Arrow -->
          <path d="M 148 132 Q 134 116, 118 122" stroke="#FFFFFF" stroke-width="1.5" fill="none" />
        </g>

        <!-- Bottom Track & Arrow (Counter-Clockwise leftwards) -->
        <g filter="url(#glow-strong)">
          <path d="M 162 162 C 164 204, 114 218, 86 194" fill="none" stroke="${p.primary}" stroke-width="10" stroke-linecap="round" />
          <path d="M 162 162 C 164 204, 114 218, 86 194" fill="none" stroke="${p.frameGold}" stroke-width="2" stroke-linecap="round" />
          <!-- Arrow Head / Bat Silhouette -->
          <polygon points="96,212 72,190 100,176" fill="${p.primary}" stroke="${p.frameGold}" stroke-width="2" />
          <!-- Bat Wing Graphic on Arrow -->
          <path d="M 92 198 Q 106 214, 122 208" stroke="#FFFFFF" stroke-width="1.5" fill="none" />
        </g>

        <!-- Center Ruby Core Star -->
        <polygon points="120,155 123,162 130,165 123,168 120,175 117,168 110,165 117,162" fill="#FFFFFF" filter="url(#glow-soft)" />
      </g>
    `,
  },

  'red-draw2': {
    cardKey: 'red-draw2',
    title: 'Twin Cursed Blades',
    subtitle: 'Vampiric Offering (+2)',
    lore: 'Two ceremonial crypt blades cross before a pair of bloodstone cards, sealing a double curse upon your foe.',
    renderIllustration: (p) => `
      <g id="art-red-draw2">
        <!-- Blood Radiance Halo -->
        <circle cx="120" cy="160" r="48" fill="url(#blood-moon-grad)" opacity="0.6" filter="url(#glow-soft)" />

        <!-- Two Blood-Crypt Cards -->
        <!-- Card 1 (Left tilted) -->
        <g transform="translate(100, 150) rotate(-14)">
          <rect x="-24" y="-36" width="48" height="72" rx="6" fill="#1C0308" stroke="${p.frameGold}" stroke-width="3" />
          <rect x="-18" y="-30" width="36" height="60" rx="4" fill="${p.primary}" opacity="0.8" />
          <path d="M 0 -18 L 0 18 M -12 0 L 12 0" stroke="${p.frameGold}" stroke-width="1.5" />
        </g>

        <!-- Card 2 (Right tilted) -->
        <g transform="translate(140, 158) rotate(12)">
          <rect x="-24" y="-36" width="48" height="72" rx="6" fill="#1C0308" stroke="${p.frameGold}" stroke-width="3" />
          <rect x="-18" y="-30" width="36" height="60" rx="4" fill="${p.primary}" opacity="0.9" />
          <!-- Gothic Bat on Card Face -->
          <path d="M 0 -8 C 6 -14, 14 -10, 14 0 C 8 2, 4 8, 0 6 C -4 8, -8 2, -14 0 C -14 -10, -6 -14, 0 -8 Z" fill="#FFFFFF" />
        </g>

        <!-- Two Crossed Blood Daggers -->
        <line x1="75" y1="130" x2="165" y2="200" stroke="${p.frameGold}" stroke-width="4" stroke-linecap="round" />
        <line x1="165" y1="130" x2="75" y2="200" stroke="${p.frameGold}" stroke-width="4" stroke-linecap="round" />
        <circle cx="120" cy="165" r="6" fill="#FF4D6D" filter="url(#glow-soft)" />

        <!-- Bold Gothic +2 Banner -->
        <g transform="translate(120, 185)" filter="url(#glow-strong)">
          <rect x="-44" y="-20" width="88" height="40" rx="20" fill="#0E0205" stroke="${p.primary}" stroke-width="3.5" />
          <text x="0" y="2" text-anchor="middle" dominant-baseline="central"
                font-family="'Impact', 'Arial Black', -apple-system, sans-serif"
                font-size="34" font-weight="900" fill="#FFFFFF"
                stroke="${p.primary}" stroke-width="1.5" paint-order="stroke fill">+2</text>
        </g>
      </g>
    `,
  },
};
