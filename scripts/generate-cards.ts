import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { FULL_DECK, getUniqueCardTemplates } from '../src/data/deck';
import { generateCardBackSvg, generateCardSvg } from '../src/utils/svg-card-generator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SRC_ASSETS_CARDS_DIR = path.join(rootDir, 'src', 'assets', 'cards');
const SRC_CARD_BACK_FILE = path.join(rootDir, 'src', 'assets', 'card-back.svg');
const PUBLIC_CARDS_DIR = path.join(rootDir, 'public', 'cards');
const PUBLIC_CARD_BACK_FILE = path.join(rootDir, 'public', 'cards', 'card-back.svg');
const PUBLIC_PREVIEW_DIR = path.join(rootDir, 'public', 'cards-preview');

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function runCardGeneration() {
  console.log('🚀 Starting deterministic card generation...');

  // Ensure output directories exist
  ensureDir(SRC_ASSETS_CARDS_DIR);
  ensureDir(PUBLIC_CARDS_DIR);
  ensureDir(PUBLIC_PREVIEW_DIR);

  // 1. Generate Card Back
  console.log('📦 Generating card-back.svg...');
  const cardBackSvg = generateCardBackSvg();
  fs.writeFileSync(SRC_CARD_BACK_FILE, cardBackSvg, 'utf-8');
  fs.writeFileSync(PUBLIC_CARD_BACK_FILE, cardBackSvg, 'utf-8');
  fs.writeFileSync(path.join(PUBLIC_PREVIEW_DIR, 'card-back.svg'), cardBackSvg, 'utf-8');

  // 2. Generate all unique templates (54 unique designs)
  const uniqueTemplates = getUniqueCardTemplates();
  console.log(`🎨 Generating ${uniqueTemplates.length} unique card templates...`);

  for (const template of uniqueTemplates) {
    const svg = generateCardSvg(template);
    // Write by cardKey (e.g. red-7.svg, wild.svg)
    fs.writeFileSync(path.join(SRC_ASSETS_CARDS_DIR, `${template.cardKey}.svg`), svg, 'utf-8');
    fs.writeFileSync(path.join(PUBLIC_CARDS_DIR, `${template.cardKey}.svg`), svg, 'utf-8');
    fs.writeFileSync(path.join(PUBLIC_PREVIEW_DIR, `${template.cardKey}.svg`), svg, 'utf-8');
  }

  // 3. Generate all 108 cards by unique ID for strict 1:1 file inventory
  console.log(`🗂️ Generating all ${FULL_DECK.length} individual card files by unique ID...`);
  for (const card of FULL_DECK) {
    const svg = generateCardSvg(card);
    fs.writeFileSync(path.join(SRC_ASSETS_CARDS_DIR, `${card.id}.svg`), svg, 'utf-8');
    fs.writeFileSync(path.join(PUBLIC_CARDS_DIR, `${card.id}.svg`), svg, 'utf-8');
  }

  // 4. Generate index export file for TypeScript bundling
  const indexExports = `// Auto-generated card asset index
export const CARD_BACK_SVG = \`${cardBackSvg.replace(/`/g, '\\`')}\`;

export const UNIQUE_CARD_KEYS = ${JSON.stringify(uniqueTemplates.map(t => t.cardKey), null, 2)} as const;
`;
  fs.writeFileSync(path.join(SRC_ASSETS_CARDS_DIR, 'index.ts'), indexExports, 'utf-8');

  console.log(`✅ Finished: Successfully generated:`);
  console.log(`   - 1 Card Back asset (${SRC_CARD_BACK_FILE})`);
  console.log(`   - ${uniqueTemplates.length} Unique card templates in ${SRC_ASSETS_CARDS_DIR}`);
  console.log(`   - ${FULL_DECK.length} Full deck instance cards in ${SRC_ASSETS_CARDS_DIR}`);
  console.log(`   - Public card assets and preview assets in ${PUBLIC_CARDS_DIR} and ${PUBLIC_PREVIEW_DIR}`);
}

runCardGeneration().catch((err) => {
  console.error('❌ Card generation failed:', err);
  process.exit(1);
});
