const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');
const path = require('path');

async function verifyOnlineTimer() {
  console.log('🧪 Starting Online Turn Timer Verification Suite...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const clientUrl = 'http://localhost:3000';
  let passed = true;

  try {
    const context1 = await browser.createBrowserContext();
    const pageAlice = await context1.newPage();
    await pageAlice.setViewport({ width: 1280, height: 800 });
    const context2 = await browser.createBrowserContext();
    const pageBob = await context2.newPage();
    await pageBob.setViewport({ width: 1280, height: 800 });

    pageAlice.on('pageerror', err => console.error('   [Alice PageError]:', err.message));
    pageBob.on('pageerror', err => console.error('   [Bob PageError]:', err.message));

    await pageAlice.goto(`${clientUrl}/`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    // 1. Verify Local Game Board has NO round timer (strictly Online mode only)
    console.log('\n▶ Step 1: Checking Local Mode (Must be untimed)...');
    const localTimer = await pageAlice.$('[data-testid="online-round-timer"]');
    if (localTimer) {
      console.error('❌ FAILED: Timer pill found in local game mode!');
      passed = false;
    } else {
      console.log('✅ Local mode has no round timer as required (strictly untimed).');
    }

    // 2. Open Online Multiplayer
    console.log('\n▶ Step 2: Creating and Joining Multiplayer Room...');
    await pageAlice.click('[data-testid="nav-tab-online"]');
    await pageAlice.waitForSelector('[data-testid="create-player-name-input"]', { timeout: 4000 });
    await pageAlice.$eval('[data-testid="create-player-name-input"]', el => (el.value = ''));
    await pageAlice.type('[data-testid="create-player-name-input"]', 'AliceHost');
    await pageAlice.click('[data-testid="create-room-btn"]');

    await pageAlice.waitForSelector('.room-code-value', { timeout: 6000 });
    const roomCode = await pageAlice.$eval('.room-code-value', el => el.textContent.trim());
    console.log(`   Room created with code: "${roomCode}"`);

    // Bob joins room via direct room query
    await pageBob.goto(`${clientUrl}/?room=${roomCode}`, { waitUntil: 'domcontentloaded' });
    await pageBob.waitForSelector('[data-testid="join-player-name-input"]', { timeout: 6000 });
    await pageBob.$eval('[data-testid="join-player-name-input"]', el => (el.value = ''));
    await pageBob.type('[data-testid="join-player-name-input"]', 'BobGuest');
    await pageBob.click('[data-testid="join-room-submit-btn"]');

    // Wait for lobby to show 2 players
    await pageAlice.waitForFunction(
      () => document.querySelectorAll('.player-slot:not(.empty-slot)').length === 2,
      { timeout: 6000 }
    );
    console.log('   Both players connected in lobby.');

    // Alice starts game
    console.log('   Alice starting game...');
    await pageAlice.click('[data-testid="start-match-btn"]');
    await pageAlice.waitForSelector('.game-arena', { timeout: 6000 });
    await pageBob.waitForSelector('.game-arena', { timeout: 6000 });

    // 3. Verify Online Round Timer Elements
    console.log('\n▶ Step 3: Verifying Online Round Timer Elements...');
    await pageAlice.waitForSelector('[data-testid="online-round-timer"]', { timeout: 4000 });
    const aliceTopTimer = await pageAlice.$('[data-testid="online-round-timer"]');
    const aliceCenterBar = await pageAlice.$('[data-testid="center-timer-bar"]');
    const bobTopTimer = await pageBob.$('[data-testid="online-round-timer"]');

    if (aliceTopTimer && aliceCenterBar && bobTopTimer) {
      const timerText = await pageAlice.evaluate(el => el.textContent.trim(), aliceTopTimer);
      console.log(`✅ Online round timer pill active: "${timerText}"`);
      console.log('✅ Center table timer progress bar rendered.');
    } else {
      console.error('❌ FAILED: Timer elements missing in online game board!');
      passed = false;
    }

    // Wait and verify timer strictly counts down
    const initialSecs = parseInt(await pageAlice.evaluate(el => el.textContent.replace(/[^0-9]/g, ''), aliceTopTimer), 10);
    console.log(`   Initial timer reading: ${initialSecs}s`);

    await new Promise(r => setTimeout(r, 2600));
    const nextSecs = parseInt(await pageAlice.evaluate(el => el.textContent.replace(/[^0-9]/g, ''), aliceTopTimer), 10);
    console.log(`   Timer reading after 2.6s: ${nextSecs}s`);

    if (nextSecs < initialSecs) {
      console.log(`✅ Timer counts down smoothly: ${initialSecs}s -> ${nextSecs}s`);
    } else {
      console.error(`❌ FAILED: Timer is NOT moving! Initial: ${initialSecs}s, Next: ${nextSecs}s`);
      passed = false;
    }

    // Also verify opponent pod timer badge shows the countdown on Bob's screen
    const oppTimerEl = await pageBob.$('[data-testid^="opponent-timer-"]');
    if (oppTimerEl) {
      const oppTimerText = await pageBob.evaluate(el => el.textContent.trim(), oppTimerEl);
      console.log(`✅ Inactive player sees active opponent timer countdown: "${oppTimerText}"`);
    }

    // Screenshot timer
    const screenshotPath = path.resolve('dist/online-timer-verification.png');
    await pageAlice.screenshot({ path: screenshotPath });
    console.log(`📸 Saved online round timer screenshot: ${screenshotPath}`);

  } catch (err) {
    console.error('❌ Exception during verification:', err);
    passed = false;
  } finally {
    await browser.close();
  }

  if (passed) {
    console.log('\n🎉 ALL ONLINE ROUND TIMER CHECKS PASSED PERFECTLY!');
    process.exit(0);
  } else {
    console.error('\n❌ SOME CHECKS FAILED!');
    process.exit(1);
  }
}

verifyOnlineTimer();
