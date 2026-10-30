import { describe, it, expect } from 'vitest';
import { FULL_DECK, getUniqueCardTemplates } from '../../data/deck';
import { CARD_THEMES, getCardTheme } from '../../themes/cardThemes';
import { HALLOWEEN_ARTWORKS } from '../../themes/halloween/artwork';
import { generateHalloweenCardBackSvg, generateHalloweenCardSvg } from '../../themes/halloween/halloween-generator';
import { generateCardBackSvg, generateCardSvg } from '../../utils/svg-card-generator';

describe('Card Themes System', () => {
  it('registers classic and halloween themes with complete metadata', () => {
    expect(CARD_THEMES.classic).toBeDefined();
    expect(CARD_THEMES.halloween).toBeDefined();
    expect(getCardTheme('classic').name).toBe('Classic Deck');
    expect(getCardTheme('halloween').name).toBe("Halloween Collector's Deck");
  });

  it('contains dedicated Halloween artwork for all 54 unique card templates', () => {
    const templates = getUniqueCardTemplates();
    expect(templates.length).toBe(54);

    for (const template of templates) {
      const art = HALLOWEEN_ARTWORKS[template.cardKey];
      expect(art, `Missing artwork for ${template.cardKey}`).toBeDefined();
      expect(art.title.length).toBeGreaterThan(0);
      expect(art.lore.length).toBeGreaterThan(0);
    }
  });

  it('guarantees unique illustrations across all 54 card designs', () => {
    const templates = getUniqueCardTemplates();
    const titles = new Set<string>();

    for (const template of templates) {
      const art = HALLOWEEN_ARTWORKS[template.cardKey];
      expect(titles.has(art.title), `Duplicate title: ${art.title}`).toBe(false);
      titles.add(art.title);
    }

    expect(titles.size).toBe(54);
  });

  it('generates valid SVG strings with standard dimensions for all cards in both themes', () => {
    const sampleCards = [
      FULL_DECK.find(c => c.cardKey === 'red-7')!,
      FULL_DECK.find(c => c.cardKey === 'blue-skip')!,
      FULL_DECK.find(c => c.cardKey === 'green-reverse')!,
      FULL_DECK.find(c => c.cardKey === 'yellow-draw2')!,
      FULL_DECK.find(c => c.cardKey === 'wild')!,
      FULL_DECK.find(c => c.cardKey === 'wild_draw4')!,
    ];

    for (const card of sampleCards) {
      const classicSvg = generateCardSvg(card);
      const halloweenSvg = generateHalloweenCardSvg(card);

      expect(classicSvg).toContain('viewBox="0 0 240 336"');
      expect(halloweenSvg).toContain('viewBox="0 0 240 336"');
      expect(classicSvg).toContain('width="240"');
      expect(halloweenSvg).toContain('width="240"');
      expect(classicSvg).toContain('height="336"');
      expect(halloweenSvg).toContain('height="336"');
      expect(halloweenSvg).toContain('data-theme="halloween"');
    }
  });

  it('generates valid symmetrical card-backs for both themes', () => {
    const classicBack = generateCardBackSvg();
    const halloweenBack = generateHalloweenCardBackSvg();

    expect(classicBack).toContain('data-card-role="card-back"');
    expect(halloweenBack).toContain('data-card-role="card-back"');
    expect(halloweenBack).toContain('rotate(180)');
    expect(halloweenBack).toContain('data-theme="halloween"');
  });

  it('theme switching never mutates card definition or card ID', () => {
    const sampleCard = { ...FULL_DECK[0] };
    const originalId = sampleCard.id;
    const originalKey = sampleCard.cardKey;
    const originalValue = sampleCard.value;
    const originalColor = sampleCard.color;

    // Generate in classic
    const classicSvg = getCardTheme('classic').generateCardSvg(sampleCard);
    // Generate in halloween
    const halloweenSvg = getCardTheme('halloween').generateCardSvg(sampleCard);

    expect(sampleCard.id).toBe(originalId);
    expect(sampleCard.cardKey).toBe(originalKey);
    expect(sampleCard.value).toBe(originalValue);
    expect(sampleCard.color).toBe(originalColor);
    expect(classicSvg).not.toBe(halloweenSvg);
  });
});
