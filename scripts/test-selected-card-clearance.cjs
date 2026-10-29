const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');

async function testClearance() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const clientUrl = 'http://localhost:3000';

  const context1 = await browser.createBrowserContext();
  const page1 = await context1.newPage();
  const context2 = await browser.createBrowserContext();
  const page2 = await context2.newPage();

  // Test Mobile 390x844
  await page1.setViewport({ width: 390, height: 844 });
  await page1.goto(`${clientUrl}/`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));

  // Create room
  await page1.click('[data-testid="nav-tab-online"]');
  await page1.waitForSelector('[data-testid="create-player-name-input"]');
  await page1.type('[data-testid="create-player-name-input"]', 'P1');
  await page1.click('[data-testid="create-room-btn"]');
  await page1.waitForSelector('.room-code-value');
  const roomCode = await page1.$eval('.room-code-value', el => el.textContent.trim());

  // Player 2 joins
  await page2.setViewport({ width: 390, height: 844 });
  await page2.goto(`${clientUrl}/?room=${roomCode}`, { waitUntil: 'domcontentloaded' });
  await page2.waitForSelector('[data-testid="join-player-name-input"]');
  await page2.type('[data-testid="join-player-name-input"]', 'P2');
  await page2.click('[data-testid="join-room-submit-btn"]');

  await page1.waitForFunction(
    () => document.querySelectorAll('.player-slot:not(.empty-slot)').length === 2,
    { timeout: 6000 }
  );

  await page1.click('[data-testid="start-match-btn"]');
  await page1.waitForSelector('.game-arena', { timeout: 6000 });
  await new Promise(r => setTimeout(r, 600));

  // Click first card on page1
  await page1.click('.hand-card-wrapper');
  await new Promise(r => setTimeout(r, 400));

  const mobileMetrics = await page1.evaluate(() => {
    const toolbar = document.querySelector('.hand-toolbar')?.getBoundingClientRect();
    const selCard = document.querySelector('.hand-card-wrapper.is-selected')?.getBoundingClientRect();
    return {
      toolbarBottom: toolbar ? Math.round(toolbar.bottom) : null,
      selectedCardTop: selCard ? Math.round(selCard.top) : null,
      clearance: (toolbar && selCard) ? Math.round(selCard.top - toolbar.bottom) : null,
      isHiddenBelowToolbar: (toolbar && selCard) ? (selCard.top < toolbar.bottom) : null,
    };
  });
  console.log('Mobile 390x844 Selected Card vs Toolbar:', mobileMetrics);
  await page1.screenshot({ path: 'public/layout-verification/online-selected-card-mobile-fixed.png' });

  // Test Desktop 1440x900
  await page1.setViewport({ width: 1440, height: 900 });
  await new Promise(r => setTimeout(r, 500));
  const desktopMetrics = await page1.evaluate(() => {
    const toolbar = document.querySelector('.hand-toolbar')?.getBoundingClientRect();
    const selCard = document.querySelector('.hand-card-wrapper.is-selected')?.getBoundingClientRect();
    return {
      toolbarBottom: toolbar ? Math.round(toolbar.bottom) : null,
      selectedCardTop: selCard ? Math.round(selCard.top) : null,
      clearance: (toolbar && selCard) ? Math.round(selCard.top - toolbar.bottom) : null,
      isHiddenBelowToolbar: (toolbar && selCard) ? (selCard.top < toolbar.bottom) : null,
    };
  });
  console.log('Desktop 1440x900 Selected Card vs Toolbar:', desktopMetrics);
  await page1.screenshot({ path: 'public/layout-verification/online-selected-card-desktop-fixed.png' });

  await browser.close();
  console.log('Clearance verification completed successfully.');
}

testClearance().catch(err => {
  console.error(err);
  process.exit(1);
});
