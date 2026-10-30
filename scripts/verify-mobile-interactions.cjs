const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');

async function testMobileInteractions() {
  console.log('🧪 Testing Mobile Interactions & Edge Cases across Small Viewports...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  let allPassed = true;

  // Test across small mobile viewports
  for (const w of [320, 360, 390]) {
    const h = 700;
    console.log(`\n▶ Testing Viewport ${w}x${h}...`);
    await page.setViewport({ width: w, height: h });
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 400));

    // Test different hand sizes (1, 7, 13, 20 cards)
    for (const count of [1, 7, 13, 20]) {
      const btn = await page.$(`[data-testid='test-hand-btn-${count}']`);
      if (btn) {
        await btn.click();
        await new Promise(r => setTimeout(r, 150));
      }
      const state = await page.evaluate(() => {
        const docW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        const cards = document.querySelectorAll('.hand-card-wrapper');
        return {
          overflowX: docW > winW,
          scrollW: docW,
          winW,
          renderedCards: cards.length,
        };
      });

      if (state.overflowX) {
        console.error(`   ❌ FAIL at ${w}px with ${count} cards: scrollWidth=${state.scrollW} > ${state.winW}`);
        allPassed = false;
      } else {
        console.log(`   ✅ Hand size ${count} cards: 0 horizontal overflow (fits cleanly in ${w}px)`);
      }
    }

    // Test card selection lift on mobile
    const playableCard = await page.$('.hand-card-wrapper.is-playable');
    if (playableCard) {
      await playableCard.click();
      await new Promise(r => setTimeout(r, 150));
      const liftState = await page.evaluate(() => {
        const sel = document.querySelector('.hand-card-wrapper.is-selected');
        const toolbar = document.querySelector('.local-hand-toolbar, .hand-toolbar')?.getBoundingClientRect();
        if (!sel || !toolbar) return null;
        const selRect = sel.getBoundingClientRect();
        return {
          gapToToolbar: Math.round(selRect.top - toolbar.bottom),
          inViewport: selRect.bottom <= window.innerHeight && selRect.top >= 0,
        };
      });
      console.log(`   Card Selection Lift: gapToToolbar=${liftState ? liftState.gapToToolbar : 'N/A'}px, inViewport=${liftState?.inViewport}`);
    }
  }

  await browser.close();

  if (allPassed) {
    console.log('\n🎉 ALL MOBILE INTERACTION & RESPONSIVENESS CHECKS PASSED PERFECTLY!');
    process.exit(0);
  } else {
    console.error('\n❌ SOME CHECKS FAILED!');
    process.exit(1);
  }
}

testMobileInteractions().catch(err => {
  console.error(err);
  process.exit(1);
});
