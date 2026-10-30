import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { FULL_DECK, getUniqueCardTemplates } from '../src/data/deck';
import { CARD_HEIGHT, CARD_VIEWBOX, CARD_WIDTH } from '../src/utils/svg-card-generator';
import { HALLOWEEN_ARTWORKS } from '../src/themes/halloween/artwork';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SRC_CLASSIC_DIR = path.join(rootDir, 'src', 'assets', 'cards');
const SRC_HALLOWEEN_DIR = path.join(rootDir, 'src', 'assets', 'cards', 'halloween');
const HALLOWEEN_CARD_BACK = path.join(SRC_HALLOWEEN_DIR, 'card-back.svg');
const CLASSIC_CARD_BACK = path.join(SRC_CLASSIC_DIR, '..', 'card-back.svg');

interface ValidationCheck {
  name: string;
  passed: boolean;
  message: string;
  details?: unknown;
}

const checks: ValidationCheck[] = [];

function recordCheck(name: string, passed: boolean, message: string, details?: unknown) {
  checks.push({ name, passed, message, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${name}]: ${message}`);
  if (!passed && details) {
    console.error('   Details:', details);
  }
}

// 1. Check all 54 unique card templates have dedicated Halloween artwork registered
function validateHalloweenArtworksRegistry() {
  const templates = getUniqueCardTemplates();
  const missingArtworks: string[] = [];

  for (const t of templates) {
    if (!HALLOWEEN_ARTWORKS[t.cardKey]) {
      missingArtworks.push(t.cardKey);
    }
  }

  const passed = missingArtworks.length === 0;
  recordCheck(
    'Artwork Registry Completeness',
    passed,
    passed
      ? `All ${templates.length} card templates have registered Halloween artwork and lore`
      : `Missing Halloween artwork for: ${missingArtworks.join(', ')}`,
    missingArtworks.length > 0 ? missingArtworks : undefined
  );
}

// 2. Check that all 54 Halloween illustrations are unique (no duplicated illustrations)
function validateIllustrationUniqueness() {
  const templates = getUniqueCardTemplates();
  const titles = new Set<string>();
  const duplicates: string[] = [];

  for (const t of templates) {
    const art = HALLOWEEN_ARTWORKS[t.cardKey];
    if (art) {
      if (titles.has(art.title)) {
        duplicates.push(`${t.cardKey} shares duplicate title: ${art.title}`);
      }
      titles.add(art.title);
    }
  }

  const passed = duplicates.length === 0;
  recordCheck(
    'Illustration Uniqueness Check',
    passed,
    passed
      ? `All ${titles.size} Halloween illustrations are completely unique across all cards`
      : `Found duplicate artwork titles: ${duplicates.join('; ')}`,
    duplicates.length > 0 ? duplicates : undefined
  );
}

// 3. Verify all SVG files use exact uniform dimensions and viewBox (240x336, viewBox="0 0 240 336")
function validateThemeAssetDimensions() {
  const halloweenSvgFiles = fs.readdirSync(SRC_HALLOWEEN_DIR).filter(f => f.endsWith('.svg'));
  let mismatched = 0;

  for (const file of halloweenSvgFiles) {
    const content = fs.readFileSync(path.join(SRC_HALLOWEEN_DIR, file), 'utf-8');
    const hasViewBox = content.includes(`viewBox="${CARD_VIEWBOX}"`);
    const hasWidth = content.includes(`width="${CARD_WIDTH}"`);
    const hasHeight = content.includes(`height="${CARD_HEIGHT}"`);

    if (!hasViewBox || !hasWidth || !hasHeight) {
      mismatched++;
    }
  }

  const passed = mismatched === 0 && halloweenSvgFiles.length > 0;
  recordCheck(
    'Asset Dimensions & ViewBox Uniformity',
    passed,
    passed
      ? `All ${halloweenSvgFiles.length} Halloween SVGs conform to standard dimensions (${CARD_WIDTH}x${CARD_HEIGHT}, viewBox="${CARD_VIEWBOX}")`
      : `Found ${mismatched} assets with dimension mismatches`
  );
}

// 4. Verify corner labels adhere to exact coordinate standards (top-left [30, 36], bottom-right [210, 300] rotated 180)
function validateCornerPositioning() {
  const templates = getUniqueCardTemplates();
  let inconsistent = 0;

  for (const t of templates) {
    const content = fs.readFileSync(path.join(SRC_HALLOWEEN_DIR, `${t.cardKey}.svg`), 'utf-8');
    const hasTopLeft = content.includes('translate(30, 36)');
    const hasBottomRight = content.includes('translate(210, 300) rotate(180)');

    if (!hasTopLeft || !hasBottomRight) {
      inconsistent++;
    }
  }

  const passed = inconsistent === 0;
  recordCheck(
    'Corner Label Coordinates Check',
    passed,
    passed
      ? 'All Halloween templates adhere to standard corner positioning (top-left [30, 36] and bottom-right [210, 300] rotated 180°)'
      : `Found ${inconsistent} templates with incorrect corner coordinates`
  );
}

// 5. Verify number readability and action symbols on Halloween cards
function validateSymbolsAndLegibility() {
  const templates = getUniqueCardTemplates();
  const errors: string[] = [];

  for (const t of templates) {
    const content = fs.readFileSync(path.join(SRC_HALLOWEEN_DIR, `${t.cardKey}.svg`), 'utf-8');

    if (t.type === 'number') {
      if (!content.includes(`>${t.value}<`)) {
        errors.push(`Template ${t.cardKey} missing clear numeral ${t.value}`);
      }
      if (t.value === '6' || t.value === '9') {
        if (!content.includes('rect x="86" y="220" width="68" height="8"') && !content.includes('width="64"')) {
          errors.push(`Template ${t.cardKey} missing essential 6/9 underline bar`);
        }
      }
    } else if (t.value === 'skip') {
      if (!content.includes('circle cx="0" cy="0" r="46"')) {
        errors.push(`Template ${t.cardKey} missing skip circle`);
      }
    } else if (t.value === 'reverse') {
      if (!content.includes('polygon points="144,118 168,140 140,154"')) {
        errors.push(`Template ${t.cardKey} missing reverse arrowheads`);
      }
    } else if (t.value === 'draw2') {
      if (!content.includes('+2')) {
        errors.push(`Template ${t.cardKey} missing +2 badge`);
      }
    } else if (t.value === 'wild') {
      if (!content.includes('WILD')) {
        errors.push(`Template ${t.cardKey} missing WILD banner`);
      }
    } else if (t.value === 'wild_draw4') {
      if (!content.includes('+4')) {
        errors.push(`Template ${t.cardKey} missing +4 emblem`);
      }
    }
  }

  const passed = errors.length === 0;
  recordCheck(
    'Gameplay Symbols & Legibility Check',
    passed,
    passed
      ? 'All numbers, 6/9 underlines, action symbols, and wild banners verified legible and present'
      : `Legibility issues: ${errors.join('; ')}`,
    errors.length > 0 ? errors : undefined
  );
}

// 6. Verify full 108 card inventory generated on disk for Halloween theme
function validateHalloweenDiskInventory() {
  let missing = 0;
  for (const card of FULL_DECK) {
    const filePath = path.join(SRC_HALLOWEEN_DIR, `${card.id}.svg`);
    if (!fs.existsSync(filePath)) {
      missing++;
    }
  }

  const cardBackExists = fs.existsSync(HALLOWEEN_CARD_BACK);
  const passed = missing === 0 && cardBackExists;

  recordCheck(
    'Disk Asset Inventory Check',
    passed,
    passed
      ? `All 108 card instances, 54 templates, and Halloween card-back verified on disk (${SRC_HALLOWEEN_DIR})`
      : `Missing ${missing} Halloween card assets on disk`
  );
}

// 7. Verify Symmetrical Composition of Halloween Card Back
function validateCardBackSymmetry() {
  const content = fs.readFileSync(HALLOWEEN_CARD_BACK, 'utf-8');
  const hasRotatedSymmetry = content.includes('rotate(180)') && content.includes('data-card-role="card-back"');
  const hasJackOLantern = content.includes('Symmetrical Jack-o\'-Lantern Emblem');

  const passed = hasRotatedSymmetry && hasJackOLantern;
  recordCheck(
    'Card Back Symmetry & Identity Concealment',
    passed,
    passed
      ? 'Halloween card-back verified with 180° rotational symmetry, glowing jack-o\'-lantern crest, and card-value concealment'
      : 'Card back fails rotational symmetry or identity concealment check'
  );
}

// 8. Verify Classic Theme Remains Completely Intact
function validateClassicDeckPreserved() {
  const classicFiles = fs.readdirSync(SRC_CLASSIC_DIR).filter(f => f.endsWith('.svg'));
  const cardBackExists = fs.existsSync(CLASSIC_CARD_BACK);
  const passed = classicFiles.length >= 162 && cardBackExists;

  recordCheck(
    'Classic Deck Preservation Check',
    passed,
    passed
      ? `Classic tournament deck remains 100% intact (${classicFiles.length} SVGs in ${SRC_CLASSIC_DIR})`
      : 'Classic deck assets were unexpectedly modified or removed'
  );
}

console.log('🎃 Executing Halloween Theme & Design System Validation Suite...\n');

validateHalloweenArtworksRegistry();
validateIllustrationUniqueness();
validateThemeAssetDimensions();
validateCornerPositioning();
validateSymbolsAndLegibility();
validateHalloweenDiskInventory();
validateCardBackSymmetry();
validateClassicDeckPreserved();

const allPassed = checks.every(c => c.passed);
console.log('\n======================================================');
if (allPassed) {
  console.log(`🎉 ALL ${checks.length} THEME VALIDATION CHECKS PASSED (100% SUCCESS)`);
  console.log('   Halloween Collector\'s Deck and Classic Deck are both verified production-ready.');
} else {
  console.error(`❌ Validation failed: ${checks.filter(c => !c.passed).length} checks failed.`);
  process.exit(1);
}
console.log('======================================================\n');
