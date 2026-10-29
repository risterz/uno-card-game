const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');
const path = require('path');

async function testLifecycleDirect() {
  console.log('🧪 Testing Notification Lifecycle & Auto-Dismissal Timing...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Switch to pass_and_play or pause AI so bots don't play cards in the background
  console.log('▶ 1. Switching to Local Pass & Play mode to isolate notification testing...');
  await page.evaluate(() => {
    // Open match setup
    const setupBtn = Array.from(document.querySelectorAll('.game-controls-group .game-btn')).find(b => b.textContent.includes('Match Setup'));
    if (setupBtn) setupBtn.click();
  });
  await new Promise(r => setTimeout(r, 200));

  await page.evaluate(() => {
    // Click Local Pass & Play
    const passPlayBtn = Array.from(document.querySelectorAll('.modal-dialog button')).find(b => b.textContent.includes('Local Pass & Play'));
    if (passPlayBtn) passPlayBtn.click();

    // Start match
    const startBtn = Array.from(document.querySelectorAll('.modal-dialog button')).find(b => b.textContent.includes('Start New Match'));
    if (startBtn) startBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Dismiss privacy shield if present
  await page.evaluate(() => {
    const shieldBtn = document.querySelector('.privacy-shield-overlay button');
    if (shieldBtn) shieldBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  console.log('▶ 2. Giving Human a Draw Two card...');
  // Give human a wild_draw4 card
  await page.evaluate(() => {
    if (typeof window.__UNO_GIVE_WILD__ === 'function') {
      window.__UNO_GIVE_WILD__('wild_draw4');
    }
  });
  await new Promise(r => setTimeout(r, 300));

  // Play Wild Draw 4
  console.log('▶ 3. Playing Wild Draw 4...');
  await page.evaluate(async () => {
    const cardEl = document.querySelector('.card-wrapper[data-value="wild_draw4"]');
    const handCard = cardEl ? cardEl.closest('.hand-card-wrapper') : null;
    if (handCard) {
      handCard.click();
      await new Promise(r => setTimeout(r, 150));
      const playBtn = document.querySelector('.hand-center-actions .game-btn.primary');
      if (playBtn) playBtn.click();
      else handCard.click();
    }
  });
  await new Promise(r => setTimeout(r, 800));

  // Choose Yellow color
  await page.evaluate(() => {
    const yellowBtn = document.querySelector('.color-pick-btn.yellow');
    if (yellowBtn) yellowBtn.click();
  });
  await new Promise(r => setTimeout(r, 100));

  // Check notification presence immediately
  const notifImmediately = await page.evaluate(() => {
    const banner = document.querySelector('.action-banner-wild4') || document.querySelector('.action-banner-draw');
    const overlay = document.querySelector('.action-effect-overlay');
    const bannerRect = banner ? banner.getBoundingClientRect() : null;
    return {
      hasBanner: !!banner,
      text: banner ? banner.textContent : null,
      top: bannerRect ? bannerRect.top : null,
      height: bannerRect ? bannerRect.height : null,
      pointerEvents: banner ? window.getComputedStyle(banner).pointerEvents : null,
    };
  });

  console.log('   Immediate notification state:', notifImmediately);
  await page.screenshot({ path: path.join(__dirname, '../public/verified-direct-notif-active.png') });

  if (!notifImmediately.hasBanner) {
    console.error('❌ Notification banner did not appear!');
    process.exit(1);
  }

  // Monitor dismissal every 200ms
  console.log('\n▶ 4. Tracking notification dismissal over time...');
  let dismissedAt = null;
  for (let elapsed = 200; elapsed <= 2400; elapsed += 200) {
    await new Promise(r => setTimeout(r, 200));
    const stillPresent = await page.evaluate(() => {
      const banner = document.querySelector('.action-banner-wild4') || document.querySelector('.action-banner-draw');
      return !!banner;
    });
    console.log(`   t = ${elapsed + 100}ms: banner present = ${stillPresent}`);
    if (!stillPresent && dismissedAt === null) {
      dismissedAt = elapsed + 100;
    }
  }

  await page.screenshot({ path: path.join(__dirname, '../public/verified-direct-notif-dismissed.png') });

  console.log(`\n   Dismissal confirmed at approx: ${dismissedAt}ms`);
  if (dismissedAt && dismissedAt >= 1300 && dismissedAt <= 1900) {
    console.log('✅ Notification dismissed exactly within configured duration (1.5s ± 0.3s)!');
  } else {
    console.error(`❌ Notification dismissed at unexpected time: ${dismissedAt}ms`);
  }

  await browser.close();
  console.log('\n🎉 DIRECT NOTIFICATION TIMING TEST COMPLETE!');
}

testLifecycleDirect().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
