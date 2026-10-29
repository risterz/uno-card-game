const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, '../public/layout-verification/selection-tests');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function runSelectionVerification() {
  console.log('--- Starting Card Selection Clearance Verification ---');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  const viewports = [
    { name: 'Mobile-327x677', w: 327, h: 677 },
    { name: 'Mobile-360x800', w: 360, h: 800 },
    { name: 'Mobile-390x844', w: 390, h: 844 },
    { name: 'Desktop-1440x900', w: 1440, h: 900 },
  ];

  const handSizes = [1, 7, 13, 20];
  let allPassed = true;
  const results = [];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.w, height: vp.h });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));

    for (const size of handSizes) {
      // Click Test Hand button for this size
      const testBtnSelector = `[data-testid="test-hand-btn-${size}"]`;
      const btn = await page.$(testBtnSelector);
      if (btn) {
        await btn.click();
        await new Promise(r => setTimeout(r, 150));
      }

      // Find all hand card wrappers
      const cardCount = await page.evaluate(() => {
        return document.querySelectorAll('.local-player-hand-region .hand-card-wrapper').length;
      });

      if (cardCount === 0) {
        console.error(`[FAIL] ${vp.name} size=${size}: No cards found in hand`);
        allPassed = false;
        continue;
      }

      // Test positions: start (0), middle, end
      const positions = [
        { label: 'start', idx: 0 },
        { label: 'middle', idx: Math.floor(cardCount / 2) },
        { label: 'end', idx: cardCount - 1 },
      ];

      // Remove duplicate indices (e.g. if size == 1)
      const uniquePositions = positions.filter((pos, index, self) =>
        index === self.findIndex(t => t.idx === pos.idx)
      );

      for (const pos of uniquePositions) {
        // Ensure any currently selected card is deselected first by clicking outside or clearing
        await page.evaluate(() => {
          const sel = document.querySelector('.local-player-hand-region .hand-card-wrapper.is-selected');
          if (sel) {
            // Click the table background or another non-card element to clear selection
            const table = document.querySelector('.local-game-table');
            if (table) table.click();
          }
        });
        await new Promise(r => setTimeout(r, 100));

        // Click the target card to select it
        await page.evaluate((targetIdx) => {
          const cards = document.querySelectorAll('.local-player-hand-region .hand-card-wrapper');
          if (cards[targetIdx]) {
            // If already selected, do not double-click (which plays it)
            if (!cards[targetIdx].classList.contains('is-selected')) {
              cards[targetIdx].click();
            }
          }
        }, pos.idx);

        await new Promise(r => setTimeout(r, 200));

        const measurement = await page.evaluate(() => {
          const bar = document.querySelector('.local-hand-toolbar')?.getBoundingClientRect();
          const selCard = document.querySelector('.local-player-hand-region .hand-card-wrapper.is-selected');
          const selCardRect = selCard ? selCard.getBoundingClientRect() : null;
          const container = document.querySelector('.local-hand-cards-container')?.getBoundingClientRect();

          if (!bar || !selCardRect || !container) {
            return { error: 'Missing elements', bar: !!bar, selCard: !!selCardRect, container: !!container };
          }

          const clearance = Math.round(selCardRect.top - bar.bottom);
          const bottomDiff = Math.round(container.bottom - selCardRect.bottom);

          return {
            barBottom: Math.round(bar.bottom),
            cardTop: Math.round(selCardRect.top),
            cardBottom: Math.round(selCardRect.bottom),
            containerBottom: Math.round(container.bottom),
            clearance,
            bottomDiff,
            cardHeight: Math.round(selCardRect.height),
            cardWidth: Math.round(selCardRect.width),
          };
        });

        const testName = `${vp.name}_size${size}_pos-${pos.label}`;
        const passClearance = measurement.clearance !== undefined && measurement.clearance >= 8;
        const passBottom = measurement.bottomDiff !== undefined && measurement.bottomDiff >= -4; // allow sub-pixel rounding
        const passed = passClearance && passBottom;

        if (!passed) {
          allPassed = false;
        }

        results.push({
          test: testName,
          clearance: measurement.clearance,
          bottomDiff: measurement.bottomDiff,
          passed,
          measurement,
        });

        console.log(
          `[${passed ? 'PASS' : 'FAIL'}] ${testName} -> clearance: ${measurement.clearance}px (>=8px required), bottomDiff: ${measurement.bottomDiff}px`
        );

        // Take a screenshot of the hand region for visual proof
        if (pos.label === 'middle' || !passed) {
          await page.screenshot({
            path: path.join(screenshotDir, `${testName}.png`),
            clip: {
              x: 0,
              y: Math.max(0, (measurement.barBottom || 300) - 20),
              width: vp.w,
              height: Math.min(vp.h, (measurement.containerBottom || vp.h) - Math.max(0, (measurement.barBottom || 300) - 20) + 20),
            },
          });
        }
      }
    }
  }

  await browser.close();

  console.log('\n--- Verification Summary ---');
  console.log(`Total tests: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.passed).length}`);
  console.log(`Failed: ${results.filter(r => !r.passed).length}`);

  if (!allPassed) {
    console.error('FAILED: One or more card selection clearance tests did not pass!');
    process.exit(1);
  } else {
    console.log('SUCCESS: All card selection clearances strictly positive and visible!');
  }
}

runSelectionVerification().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
