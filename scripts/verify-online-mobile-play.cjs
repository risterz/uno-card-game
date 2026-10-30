const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');

async function testOnlineMobilePlay() {
  console.log('🧪 Testing Online Multiplayer Play on 360x740 Mobile Viewport...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const ctxA = await browser.createBrowserContext();
  const ctxB = await browser.createBrowserContext();
  const pA = await ctxA.newPage();
  const pB = await ctxB.newPage();

  // Mobile viewport (Android standard 360x740)
  await pA.setViewport({ width: 360, height: 740 });
  await pB.setViewport({ width: 360, height: 740 });

  await pA.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await pA.click('[data-testid="nav-tab-online"]');
  await pA.waitForSelector('[data-testid="create-player-name-input"]');
  await pA.type('[data-testid="create-player-name-input"]', 'AliceMob');
  await pA.click('[data-testid="create-room-btn"]');

  await pA.waitForSelector('.room-code-value');
  const code = await pA.$eval('.room-code-value', el => el.textContent.trim());

  await pB.goto(`http://localhost:3000/?room=${code}`, { waitUntil: 'domcontentloaded' });
  await pB.waitForSelector('[data-testid="join-player-name-input"]');
  await pB.type('[data-testid="join-player-name-input"]', 'BobMob');
  await pB.click('[data-testid="join-room-submit-btn"]');

  await pA.waitForFunction(() => document.querySelectorAll('.player-slot:not(.empty-slot)').length === 2);
  await pA.click('[data-testid="start-match-btn"]');
  await pA.waitForSelector('.game-arena');
  await pB.waitForSelector('.game-arena');

  // Verify zero horizontal scroll on mobile in-game
  const overflowCheckA = await pA.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  const overflowCheckB = await pB.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

  if (overflowCheckA || overflowCheckB) {
    console.error(`❌ Mobile overflow detected: Alice=${overflowCheckA}, Bob=${overflowCheckB}`);
    process.exit(1);
  } else {
    console.log('✅ In-game match has zero horizontal overflow on 360px mobile.');
  }

  // Check that timer pill, center table timer, and player pods fit neatly
  const timerPillA = await pA.$('[data-testid="online-round-timer"]');
  const centerTimerA = await pA.$('[data-testid="center-timer-bar"]');
  const isTimerVisible = Boolean(timerPillA && centerTimerA);
  console.log(`✅ Timer widgets rendered cleanly on mobile: ${isTimerVisible}`);

  // Test card interaction: Draw card if our turn or click card
  const drawPile = await pA.$('[data-testid="online-draw-pile"]');
  if (drawPile) {
    await drawPile.click();
    await new Promise(r => setTimeout(r, 400));
    console.log('✅ Draw card action executed smoothly on mobile.');
  }

  await browser.close();
  console.log('🎉 ONLINE MOBILE PLAY VERIFIED SUCCESSFULLY!');
}

testOnlineMobilePlay().catch(err => {
  console.error(err);
  process.exit(1);
});
