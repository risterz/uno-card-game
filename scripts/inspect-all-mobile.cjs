const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const viewports = [
  { name: 'Narrow-Phone-320x640', w: 320, h: 640 },
  { name: 'Narrow-Phone-327x677', w: 327, h: 677 },
  { name: 'Android-360x800', w: 360, h: 800 },
  { name: 'iPhone-14-390x844', w: 390, h: 844 },
  { name: 'iPhone-Pro-Max-430x932', w: 430, h: 932 },
  { name: 'Tablet-768x1024', w: 768, h: 1024 },
];

async function inspectMobile() {
  console.log('📱 Inspecting Mobile Responsiveness across all screens...');
  const outDir = path.resolve('public/layout-verification/mobile-audit');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const report = [];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.w, height: vp.h });

    // 1. Local Game Board
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 400));

    const localMetrics = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const topBar = document.querySelector('.game-top-bar')?.getBoundingClientRect();
      const arena = document.querySelector('.local-game-arena, .game-arena')?.getBoundingClientRect();
      const hand = document.querySelector('.hand-cards-container')?.getBoundingClientRect();
      return {
        hasOverflowX: docW > winW,
        scrollWidth: docW,
        winW,
        scrollHeight: docH,
        winH,
        topBarH: topBar ? Math.round(topBar.height) : null,
        arenaH: arena ? Math.round(arena.height) : null,
        handH: hand ? Math.round(hand.height) : null,
      };
    });

    await page.screenshot({ path: path.join(outDir, `local-${vp.name}.png`) });

    // 2. Online Lobby
    const onlineTab = await page.$('[data-testid="nav-tab-online"]');
    if (onlineTab) {
      await onlineTab.click();
      await new Promise(r => setTimeout(r, 300));
    }
    const lobbyMetrics = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const card = document.querySelector('.lobby-card')?.getBoundingClientRect();
      return {
        hasOverflowX: docW > winW,
        scrollWidth: docW,
        winW,
        cardW: card ? Math.round(card.width) : null,
      };
    });

    await page.screenshot({ path: path.join(outDir, `lobby-${vp.name}.png`) });

    // 3. Card Gallery
    const galleryTab = await page.$('[data-testid="nav-tab-gallery"]');
    if (galleryTab) {
      await galleryTab.click();
      await new Promise(r => setTimeout(r, 400));
    }
    const galleryMetrics = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      return {
        hasOverflowX: docW > winW,
        scrollWidth: docW,
        winW,
      };
    });
    await page.screenshot({ path: path.join(outDir, `gallery-${vp.name}.png`) });

    report.push({ vp: vp.name, local: localMetrics, lobby: lobbyMetrics, gallery: galleryMetrics });
    console.log(`\nResults for ${vp.name}:`);
    console.log('   Local Game:   ', localMetrics.hasOverflowX ? `❌ OVERFLOW (${localMetrics.scrollWidth} > ${localMetrics.winW})` : '✅ OK', `(TopBar: ${localMetrics.topBarH}px)`);
    console.log('   Online Lobby: ', lobbyMetrics.hasOverflowX ? `❌ OVERFLOW (${lobbyMetrics.scrollWidth} > ${lobbyMetrics.winW})` : '✅ OK', `(Card: ${lobbyMetrics.cardW}px)`);
    console.log('   Card Gallery: ', galleryMetrics.hasOverflowX ? `❌ OVERFLOW (${galleryMetrics.scrollWidth} > ${galleryMetrics.winW})` : '✅ OK');
  }

  // 4. Test In-Game Online Match on Mobile (iPhone 390x844 and Narrow 327x677)
  console.log('\n▶ Testing In-Game Online Match on Mobile...');
  const ctxA = await browser.createBrowserContext();
  const ctxB = await browser.createBrowserContext();
  const pA = await ctxA.newPage();
  const pB = await ctxB.newPage();
  await pA.setViewport({ width: 390, height: 844 });
  await pB.setViewport({ width: 390, height: 844 });

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

  const onlineInGameMetrics = await pA.evaluate(() => {
    const docW = document.documentElement.scrollWidth;
    const winW = window.innerWidth;
    const topBar = document.querySelector('.game-top-bar')?.getBoundingClientRect();
    const timerPill = document.querySelector('[data-testid="online-round-timer"]')?.getBoundingClientRect();
    const centerTimer = document.querySelector('[data-testid="center-timer-bar"]')?.getBoundingClientRect();
    const myTurnTimer = document.querySelector('[data-testid="my-turn-timer"]')?.getBoundingClientRect();
    const handToolbar = document.querySelector('.hand-toolbar')?.getBoundingClientRect();
    const cards = Array.from(document.querySelectorAll('.hand-card-wrapper')).map(el => el.getBoundingClientRect());

    return {
      hasOverflowX: docW > winW,
      scrollWidth: docW,
      winW,
      topBarH: topBar ? Math.round(topBar.height) : null,
      topBarRight: topBar ? Math.round(topBar.right) : null,
      hasTimer: Boolean(timerPill),
      hasCenterTimer: Boolean(centerTimer),
      hasHandTimer: Boolean(myTurnTimer),
      handToolbarH: handToolbar ? Math.round(handToolbar.height) : null,
      cardCount: cards.length,
      firstCardBottom: cards[0] ? Math.round(cards[0].bottom) : null,
      winH: window.innerHeight,
    };
  });

  console.log('\nOnline In-Game Metrics (iPhone 390x844):', onlineInGameMetrics);
  await pA.screenshot({ path: path.join(outDir, 'online-ingame-390x844.png') });

  // Test Narrow 320x640
  await pA.setViewport({ width: 320, height: 640 });
  await new Promise(r => setTimeout(r, 400));
  const narrowMetrics = await pA.evaluate(() => {
    const docW = document.documentElement.scrollWidth;
    const winW = window.innerWidth;
    return {
      hasOverflowX: docW > winW,
      scrollWidth: docW,
      winW,
    };
  });
  console.log('Online In-Game Metrics (Narrow 320x640):', narrowMetrics);
  await pA.screenshot({ path: path.join(outDir, 'online-ingame-320x640.png') });

  await browser.close();
}

inspectMobile().catch(err => {
  console.error(err);
  process.exit(1);
});
