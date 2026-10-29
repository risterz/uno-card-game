import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { FULL_DECK, getUniqueCardTemplates, computeDeckStatistics } from '../src/data/deck';
import { CardColor, CardType, CardValue } from '../src/types/card';
import { CARD_HEIGHT, CARD_VIEWBOX, CARD_WIDTH } from '../src/utils/svg-card-generator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SRC_ASSETS_CARDS_DIR = path.join(rootDir, 'src', 'assets', 'cards');
const SRC_CARD_BACK_FILE = path.join(rootDir, 'src', 'assets', 'card-back.svg');

interface ValidationResult {
  checkName: string;
  passed: boolean;
  message: string;
  details?: unknown;
}

const results: ValidationResult[] = [];

function recordResult(checkName: string, passed: boolean, message: string, details?: unknown) {
  results.push({ checkName, passed, message, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${checkName}]: ${message}`);
  if (!passed && details) {
    console.error('   Details:', details);
  }
}

// 1. Deck contains exactly 108 cards
function validateDeckSize() {
  const count = FULL_DECK.length;
  const passed = count === 108;
  recordResult(
    'Deck Size Check',
    passed,
    passed ? `Deck contains exactly 108 cards (got ${count})` : `Expected 108 cards, but found ${count}`
  );
}

// 2. Every card has valid type, color, value, and identifier
function validateCardProperties() {
  const validColors: CardColor[] = ['red', 'blue', 'green', 'yellow', 'wild'];
  const validTypes: CardType[] = ['number', 'action', 'wild'];
  const validValues: CardValue[] = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'skip', 'reverse', 'draw2',
    'wild', 'wild_draw4'
  ];

  let invalidCards = 0;
  for (const card of FULL_DECK) {
    const isValidColor = validColors.includes(card.color);
    const isValidType = validTypes.includes(card.type);
    const isValidValue = validValues.includes(card.value);
    const isValidId = typeof card.id === 'string' && card.id.length > 0;
    const isValidKey = typeof card.cardKey === 'string' && card.cardKey.length > 0;

    if (!isValidColor || !isValidType || !isValidValue || !isValidId || !isValidKey) {
      invalidCards++;
    }
  }

  const passed = invalidCards === 0;
  recordResult(
    'Card Properties Check',
    passed,
    passed ? 'All 108 cards have valid color, type, value, and identifiers' : `Found ${invalidCards} cards with invalid properties`
  );
}

// 3. Every required card combination appears the correct number of times
function validateCardInventoryCounts() {
  const stats = computeDeckStatistics(FULL_DECK);
  const errors: string[] = [];

  // Color breakdown
  const expectedColorCounts: Record<CardColor, number> = {
    red: 25,
    blue: 25,
    green: 25,
    yellow: 25,
    wild: 8,
  };

  for (const [color, expected] of Object.entries(expectedColorCounts)) {
    const actual = stats.byColor[color as CardColor];
    if (actual !== expected) {
      errors.push(`Color ${color}: expected ${expected}, got ${actual}`);
    }
  }

  // Type breakdown
  if (stats.byType.number !== 76) errors.push(`Number cards: expected 76, got ${stats.byType.number}`);
  if (stats.byType.action !== 24) errors.push(`Action cards: expected 24, got ${stats.byType.action}`);
  if (stats.byType.wild !== 8) errors.push(`Wild cards: expected 8, got ${stats.byType.wild}`);

  // Zero card (1 of each color)
  for (const color of ['red', 'blue', 'green', 'yellow'] as CardColor[]) {
    const zeroCount = FULL_DECK.filter(c => c.color === color && c.value === '0').length;
    if (zeroCount !== 1) {
      errors.push(`Color ${color} zero cards: expected 1, got ${zeroCount}`);
    }
  }

  // Numbers 1-9 (2 of each color)
  for (const color of ['red', 'blue', 'green', 'yellow'] as CardColor[]) {
    for (let num = 1; num <= 9; num++) {
      const val = String(num) as CardValue;
      const count = FULL_DECK.filter(c => c.color === color && c.value === val).length;
      if (count !== 2) {
        errors.push(`Color ${color} number ${num}: expected 2, got ${count}`);
      }
    }
  }

  // Actions: 2 of each per color
  for (const color of ['red', 'blue', 'green', 'yellow'] as CardColor[]) {
    for (const action of ['skip', 'reverse', 'draw2'] as CardValue[]) {
      const count = FULL_DECK.filter(c => c.color === color && c.value === action).length;
      if (count !== 2) {
        errors.push(`Color ${color} action ${action}: expected 2, got ${count}`);
      }
    }
  }

  // Wild: 4 Wild and 4 Wild Draw Four
  const wildCount = FULL_DECK.filter(c => c.value === 'wild').length;
  if (wildCount !== 4) errors.push(`Wild cards: expected 4, got ${wildCount}`);

  const wildDraw4Count = FULL_DECK.filter(c => c.value === 'wild_draw4').length;
  if (wildDraw4Count !== 4) errors.push(`Wild Draw Four cards: expected 4, got ${wildDraw4Count}`);

  const passed = errors.length === 0;
  recordResult(
    'Inventory Distribution Check',
    passed,
    passed
      ? 'Inventory perfectly matches standard UNO distribution (76 numbers, 24 actions, 8 wilds)'
      : `Inventory mismatch found: ${errors.join('; ')}`,
    errors.length > 0 ? errors : undefined
  );
}

// 4. All card assets use the same dimensions and viewBox
function validateAssetDimensions() {
  const svgFiles = fs.readdirSync(SRC_ASSETS_CARDS_DIR).filter((f: string) => f.endsWith('.svg'));
  let mismatched = 0;

  for (const file of svgFiles) {
    const filePath = path.join(SRC_ASSETS_CARDS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasViewBox = content.includes(`viewBox="${CARD_VIEWBOX}"`);
    const hasWidth = content.includes(`width="${CARD_WIDTH}"`);
    const hasHeight = content.includes(`height="${CARD_HEIGHT}"`);

    if (!hasViewBox || !hasWidth || !hasHeight) {
      mismatched++;
    }
  }

  // Also validate card-back.svg
  const cardBackContent = fs.readFileSync(SRC_CARD_BACK_FILE, 'utf-8');
  const cardBackOk = cardBackContent.includes(`viewBox="${CARD_VIEWBOX}"`) &&
                     cardBackContent.includes(`width="${CARD_WIDTH}"`) &&
                     cardBackContent.includes(`height="${CARD_HEIGHT}"`);

  if (!cardBackOk) mismatched++;

  const passed = mismatched === 0;
  recordResult(
    'Asset Dimensions & ViewBox Check',
    passed,
    passed
      ? `All ${svgFiles.length} card SVGs and card-back use exact uniform dimensions (${CARD_WIDTH}x${CARD_HEIGHT}, viewBox="${CARD_VIEWBOX}")`
      : `Found ${mismatched} assets with incorrect dimensions or viewBox`
  );
}

// 5. Corner labels follow consistent positioning rules
function validateCornerLabelPositioning() {
  const templates = getUniqueCardTemplates();
  let inconsistentCorners = 0;

  for (const template of templates) {
    const filePath = path.join(SRC_ASSETS_CARDS_DIR, `${template.cardKey}.svg`);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Expected top-left position and bottom-right rotated position
    const hasTopLeftCorner = content.includes('translate(30, 36)');
    const hasBottomRightCorner = content.includes('translate(210, 300) rotate(180)');

    if (!hasTopLeftCorner || !hasBottomRightCorner) {
      inconsistentCorners++;
    }
  }

  const passed = inconsistentCorners === 0;
  recordResult(
    'Corner Label Consistency Check',
    passed,
    passed
      ? 'All card templates adhere strictly to identical corner positioning (top-left [30, 36] and bottom-right [210, 300] rotated 180°)'
      : `Found ${inconsistentCorners} templates with mismatched corner coordinates`
  );
}

// 6. Number and action symbols use the correct templates
function validateSymbolTemplates() {
  const templates = getUniqueCardTemplates();
  let errors: string[] = [];

  for (const t of templates) {
    const filePath = path.join(SRC_ASSETS_CARDS_DIR, `${t.cardKey}.svg`);
    const content = fs.readFileSync(filePath, 'utf-8');

    if (t.type === 'number') {
      // Must contain numeral
      if (!content.includes(`>${t.value}<`)) {
        errors.push(`Template ${t.cardKey} missing central numeral ${t.value}`);
      }
      // 6 and 9 must have underline indicator
      if (t.value === '6' || t.value === '9') {
        if (!content.includes('rect x="88" y="222" width="64" height="8"')) {
          errors.push(`Template ${t.cardKey} missing essential 6/9 underline indicator`);
        }
      }
    } else if (t.value === 'skip') {
      // Must contain prohibition geometry
      if (!content.includes('circle cx="120" cy="168" r="48"')) {
        errors.push(`Template ${t.cardKey} missing prohibition circle geometry`);
      }
    } else if (t.value === 'reverse') {
      // Must contain reverse curved arrows
      if (!content.includes('polygon points="144,124 168,146 142,160"')) {
        errors.push(`Template ${t.cardKey} missing reverse arrowheads`);
      }
    } else if (t.value === 'draw2') {
      // Must contain stacked cards and +2
      if (!content.includes('+2')) {
        errors.push(`Template ${t.cardKey} missing +2 badge`);
      }
    } else if (t.value === 'wild') {
      // Must contain 4 colored quadrants
      if (!content.includes('#E61938') || !content.includes('#0066E5') || !content.includes('#F5A600') || !content.includes('#00A852')) {
        errors.push(`Template ${t.cardKey} missing complete 4-quadrant palette`);
      }
    } else if (t.value === 'wild_draw4') {
      // Must contain +4 badge
      if (!content.includes('+4')) {
        errors.push(`Template ${t.cardKey} missing +4 badge`);
      }
    }
  }

  const passed = errors.length === 0;
  recordResult(
    'Symbol & Artwork Template Check',
    passed,
    passed
      ? 'All numbers, action symbols (skip, reverse, draw2), 6/9 underlines, and wild emblems conform to template specifications'
      : `Symbol template errors: ${errors.join('; ')}`,
    errors.length > 0 ? errors : undefined
  );
}

// 7. No required asset is missing
function validateNoMissingAssets() {
  const missingFiles: string[] = [];

  // Card back check
  if (!fs.existsSync(SRC_CARD_BACK_FILE) || fs.statSync(SRC_CARD_BACK_FILE).size === 0) {
    missingFiles.push('src/assets/card-back.svg');
  }

  // 54 template assets
  for (const t of getUniqueCardTemplates()) {
    const p = path.join(SRC_ASSETS_CARDS_DIR, `${t.cardKey}.svg`);
    if (!fs.existsSync(p) || fs.statSync(p).size === 0) {
      missingFiles.push(`src/assets/cards/${t.cardKey}.svg`);
    }
  }

  // 108 card instance assets
  for (const card of FULL_DECK) {
    const p = path.join(SRC_ASSETS_CARDS_DIR, `${card.id}.svg`);
    if (!fs.existsSync(p) || fs.statSync(p).size === 0) {
      missingFiles.push(`src/assets/cards/${card.id}.svg`);
    }
  }

  const passed = missingFiles.length === 0;
  recordResult(
    'Asset Completeness Check',
    passed,
    passed
      ? 'Zero missing assets: 108 card instances, 54 templates, and card-back all verified on disk'
      : `Missing or empty assets detected: ${missingFiles.slice(0, 5).join(', ')}... (${missingFiles.length} total)`,
    missingFiles.length > 0 ? missingFiles : undefined
  );
}

// 8. The deck contains no accidental duplicate identifiers
function validateNoDuplicateIds() {
  const seenIds = new Set<string>();
  const duplicates: string[] = [];

  for (const card of FULL_DECK) {
    if (seenIds.has(card.id)) {
      duplicates.push(card.id);
    } else {
      seenIds.add(card.id);
    }
  }

  const passed = duplicates.length === 0 && seenIds.size === 108;
  recordResult(
    'Identifier Uniqueness Check',
    passed,
    passed
      ? `All 108 card identifiers are unique with zero duplicates (108 unique IDs confirmed)`
      : `Duplicate card IDs detected: ${duplicates.join(', ')}`,
    duplicates.length > 0 ? duplicates : undefined
  );
}

// Run all checks
console.log('🔍 Executing Full Card Deck & Asset Consistency Validation Suite...\n');

validateDeckSize();
validateCardProperties();
validateCardInventoryCounts();
validateAssetDimensions();
validateCornerLabelPositioning();
validateSymbolTemplates();
validateNoMissingAssets();
validateNoDuplicateIds();

console.log('\n======================================================');
const allPassed = results.every(r => r.passed);
if (allPassed) {
  console.log('🎉 ALL 8 VALIDATION CHECKS PASSED PERFECTLY (100% SUCCESS)');
  console.log('   The 108-card deck and SVG design system meet all strict requirements.');
  console.log('======================================================\n');
  process.exit(0);
} else {
  console.error('❌ VALIDATION FAILED. Fix issues listed above.');
  console.log('======================================================\n');
  process.exit(1);
}
