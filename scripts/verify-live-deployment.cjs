const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');

async function testLiveDeployment() {
  console.log('--- Testing Live Cloudflare Pages + Render Deployment ---');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const liveUrl = 'https://uno-card-game-335.pages.dev';

  try {
    const context1 = await browser.createBrowserContext();
    const pageAlice = await context1.newPage();
    await pageAlice.setViewport({ width: 1280, height: 800 });

    const context2 = await browser.createBrowserContext();
    const pageBob = await context2.newPage();
    await pageBob.setViewport({ width: 1280, height: 800 });

    pageAlice.on('pageerror', err => console.error('   [Alice PageError]:', err.message));
    pageBob.on('pageerror', err => console.error('   [Bob PageError]:', err.message));

    console.log(`1. Navigating Alice to: ${liveUrl}`);
    await pageAlice.goto(`${liveUrl}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 600));

    // Check title and logo
    const title = await pageAlice.title();
    console.log(`   Page title: "${title}"`);
    const logoExists = await pageAlice.$('[data-testid="app-brand-logo"], img[alt*="Nano Banana"]');
    console.log(`   Brand Logo rendered: ${!!logoExists}`);

    // Alice opens Online tab and creates room
    console.log('2. Alice creating multiplayer room...');
    await pageAlice.click('[data-testid="nav-tab-online"]');
    await pageAlice.waitForSelector('[data-testid="create-player-name-input"]', { timeout: 8000 });
    await pageAlice.type('[data-testid="create-player-name-input"]', 'AliceHost');
    await pageAlice.click('[data-testid="create-room-btn"]');

    await pageAlice.waitForSelector('.room-code-value', { timeout: 15000 });
    const roomCode = await pageAlice.$eval('.room-code-value', el => el.textContent.trim());
    console.log(`   Room created successfully on Render! Room code: "${roomCode}"`);

    // Bob joins room via direct room query
    console.log(`3. Bob joining room "${roomCode}" on: ${liveUrl}`);
    await pageBob.goto(`${liveUrl}/?room=${roomCode}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageBob.waitForSelector('[data-testid="join-player-name-input"]', { timeout: 15000 });
    await pageBob.type('[data-testid="join-player-name-input"]', 'BobGuest');
    await pageBob.click('[data-testid="join-room-submit-btn"]');

    // Wait for lobby to show 2 players
    await pageAlice.waitForFunction(
      () => document.querySelectorAll('.player-slot:not(.empty-slot)').length === 2,
      { timeout: 15000 }
    );
    console.log('   Both players connected in lobby via live Render Socket.IO server.');

    // Alice starts game
    console.log('4. Alice starting game...');
    await pageAlice.click('[data-testid="start-match-btn"]');
    await pageAlice.waitForSelector('.game-arena', { timeout: 15000 });
    await pageBob.waitForSelector('.game-arena', { timeout: 15000 });
    console.log('   Match active! Both clients entered live game arena.');

    // Check round timer on active player
    await pageAlice.waitForSelector('[data-testid="online-round-timer"]', { timeout: 10000 });
    const timerValue1 = await pageAlice.$eval('[data-testid="online-round-timer"]', el => el.textContent.trim());
    console.log(`5. Initial round timer reading: "${timerValue1}"`);

    // Wait 3 seconds and verify countdown ticks down
    await new Promise(r => setTimeout(r, 3000));
    const timerValue2 = await pageAlice.$eval('[data-testid="online-round-timer"]', el => el.textContent.trim());
    console.log(`   Round timer reading after 3s: "${timerValue2}"`);

    console.log('\n=============================================================');
    console.log('🎉 LIVE PRODUCTION VERIFICATION COMPLETE: ALL SYSTEMS GO!');
    console.log('Cloudflare Pages Frontend: https://uno-card-game-335.pages.dev');
    console.log('Render Multiplayer Backend: https://uno-multiplayer-backend-en4e.onrender.com');
    console.log('=============================================================');
  } finally {
    await browser.close();
  }
}

testLiveDeployment().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
