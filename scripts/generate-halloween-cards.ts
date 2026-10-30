import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { FULL_DECK, getUniqueCardTemplates } from '../src/data/deck';
import { generateHalloweenCardBackSvg, generateHalloweenCardSvg } from '../src/themes/halloween/halloween-generator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SRC_HALLOWEEN_DIR = path.join(rootDir, 'src', 'assets', 'cards', 'halloween');
const PUBLIC_HALLOWEEN_DIR = path.join(rootDir, 'public', 'cards', 'halloween');
const THEME_CARD_BACK_FILE = path.join(rootDir, 'src', 'themes', 'halloween', 'card-back.svg');

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function runHalloweenCardGeneration() {
  console.log('🎃 Starting Halloween Collector Deck asset generation...');

  ensureDir(SRC_HALLOWEEN_DIR);
  ensureDir(PUBLIC_HALLOWEEN_DIR);

  // 1. Generate Halloween Card Back
  console.log('📦 Generating Halloween card-back.svg...');
  const cardBackSvg = generateHalloweenCardBackSvg();
  fs.writeFileSync(path.join(SRC_HALLOWEEN_DIR, 'card-back.svg'), cardBackSvg, 'utf-8');
  fs.writeFileSync(path.join(PUBLIC_HALLOWEEN_DIR, 'card-back.svg'), cardBackSvg, 'utf-8');
  fs.writeFileSync(THEME_CARD_BACK_FILE, cardBackSvg, 'utf-8');

  // 2. Generate all 54 unique card templates
  const uniqueTemplates = getUniqueCardTemplates();
  console.log(`🎨 Generating ${uniqueTemplates.length} unique Halloween card templates...`);

  for (const template of uniqueTemplates) {
    const svg = generateHalloweenCardSvg(template);
    fs.writeFileSync(path.join(SRC_HALLOWEEN_DIR, `${template.cardKey}.svg`), svg, 'utf-8');
    fs.writeFileSync(path.join(PUBLIC_HALLOWEEN_DIR, `${template.cardKey}.svg`), svg, 'utf-8');
  }

  // 3. Generate all 108 cards by unique ID
  console.log(`🗂️ Generating all ${FULL_DECK.length} Halloween deck cards by unique ID...`);
  for (const card of FULL_DECK) {
    const svg = generateHalloweenCardSvg(card);
    fs.writeFileSync(path.join(SRC_HALLOWEEN_DIR, `${card.id}.svg`), svg, 'utf-8');
    fs.writeFileSync(path.join(PUBLIC_HALLOWEEN_DIR, `${card.id}.svg`), svg, 'utf-8');
  }

  console.log('✅ Successfully generated Halloween Collector Deck assets:');
  console.log(`   - 1 Card Back in ${SRC_HALLOWEEN_DIR}`);
  console.log(`   - ${uniqueTemplates.length} Unique templates in ${SRC_HALLOWEEN_DIR}`);
  console.log(`   - ${FULL_DECK.length} Card instances in ${SRC_HALLOWEEN_DIR}`);
  console.log(`   - Public card assets in ${PUBLIC_HALLOWEEN_DIR}`);
}

runHalloweenCardGeneration().catch((err) => {
  console.error('❌ Halloween card generation failed:', err);
  process.exit(1);
});
