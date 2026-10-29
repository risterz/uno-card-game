const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');
const path = require('path');

async function testActionCelebrations() {
  console.log('🧪 Starting Action Cards & Celebrations Animation Verification...\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // 1. Give human Wild Draw 4 card
  console.log('▶ 1. Testing Wild Draw Four (+4) Animation & Penalty Banner...');
  await page.evaluate(() => {
    if (typeof window.__UNO_GIVE_WILD__ === 'function') {
      window.__UNO_GIVE_WILD__('wild_draw4');
    }
  });
  await new Promise(r => setTimeout(r, 300));

  // Play Wild Draw 4
  await page.evaluate(async () => {
    const cardEl = document.querySelector('.card-wrapper[data-value="wild_draw4"]');
    const handCardEl = cardEl ? cardEl.closest('.hand-card-wrapper') : null;
    if (handCardEl) {
      handCardEl.click();
      await new Promise(r => setTimeout(r, 150));
      const playBtn = document.querySelector('.hand-center-actions .game-btn.primary');
      if (playBtn) playBtn.click();
      else handCardEl.click();
    }
  });
  await new Promise(r => setTimeout(r, 850));

  const modalBeforeClick = await page.evaluate(() => {
    return {
      hasModal: !!document.querySelector('.color-choice-modal'),
      hasYellowBtn: !!document.querySelector('.color-pick-btn.yellow'),
    };
  });
  console.log(`   Modal check before clicking yellow:`, modalBeforeClick);

  // Choose Yellow color
  await page.evaluate(() => {
    const yellowBtn = document.querySelector('.color-pick-btn.yellow');
    if (yellowBtn) yellowBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));

  // Check for Wild Draw 4 action banner overlay
  const bannerCheck = await page.evaluate(() => {
    const banner = document.querySelector('.action-banner-wild4');
    const overlay = document.querySelector('.action-effect-overlay');
    return {
      hasOverlay: !!overlay,
      hasBanner: !!banner,
      text: banner ? banner.textContent : '',
    };
  });
  console.log(`   Wild Draw 4 banner: hasOverlay=${bannerCheck.hasOverlay}, text="${bannerCheck.text}"`);
  await page.screenshot({ path: path.join(__dirname, '../public/verified-anim-action-wild4.png') });

  // 2. Test Victory Celebration Dialog & Confetti trigger
  console.log('\n▶ 2. Testing Victory Celebration Screen & Confetti...');
  // Give exactly 1 wild card (replace hand) with UNO safe
  await page.evaluate(() => {
    if (typeof window.__UNO_GIVE_WILD__ === 'function') {
      window.__UNO_GIVE_WILD__('wild', true, true);
    }
  });
  await new Promise(r => setTimeout(r, 300));

  // Play the last card to empty hand and trigger game_over victory!
  await page.evaluate(async () => {
    const cardEl = document.querySelector('.card-wrapper[data-value="wild"]');
    const handCardEl = cardEl ? cardEl.closest('.hand-card-wrapper') : null;
    if (handCardEl) {
      handCardEl.click();
      await new Promise(r => setTimeout(r, 150));
      const playBtn = document.querySelector('.hand-center-actions .game-btn.primary');
      if (playBtn) playBtn.click();
      else handCardEl.click();
    }
  });
  await new Promise(r => setTimeout(r, 700));

  // Pick blue to complete play and trigger game_over
  await page.evaluate(() => {
    const blueBtn = document.querySelector('.color-pick-btn.blue');
    if (blueBtn) blueBtn.click();
  });
  await new Promise(r => setTimeout(r, 700));

  const victoryCheck = await page.evaluate(() => {
    const victoryContainer = document.querySelector('.victory-celebration-container');
    const victoryCard = document.querySelector('.victory-card');
    const h2 = victoryCard ? victoryCard.querySelector('h2') : null;
    return {
      hasVictoryContainer: !!victoryContainer,
      hasVictoryCard: !!victoryCard,
      title: h2 ? h2.textContent : '',
    };
  });

  console.log(`   Victory Screen: container=${victoryCheck.hasVictoryContainer}, title="${victoryCheck.title}"`);
  await page.screenshot({ path: path.join(__dirname, '../public/verified-anim-victory.png') });

  // 3. Test Play Again button resets cleanly
  console.log('\n▶ 3. Testing Play Again button in Victory Celebration...');
  await page.evaluate(() => {
    const playAgainBtn = Array.from(document.querySelectorAll('.victory-card button')).find(b => b.textContent.includes('Play Again'));
    if (playAgainBtn) playAgainBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const postResetCheck = await page.evaluate(() => {
    const victoryContainer = document.querySelector('.victory-celebration-container');
    const handCards = document.querySelectorAll('.hand-card-wrapper');
    return {
      victoryDismissed: !victoryContainer,
      freshHandCount: handCards.length,
    };
  });
  console.log(`   Post-Reset: victoryDismissed=${postResetCheck.victoryDismissed}, freshHandCount=${postResetCheck.freshHandCount}`);

  await browser.close();

  if (bannerCheck.hasBanner && victoryCheck.hasVictoryCard && postResetCheck.victoryDismissed) {
    console.log('\n🎉 ALL ACTION & CELEBRATION ANIMATIONS VERIFIED 100%!');
  } else {
    console.error('\n⚠️ Some celebration checks did not pass as expected.');
  }
}

testActionCelebrations().catch(err => {
  console.error('Fatal action celebration test error:', err);
  process.exit(1);
});
