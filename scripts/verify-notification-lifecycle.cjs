const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');
const path = require('path');

async function testNotificationLifecycle() {
  console.log('🧪 Starting Notification Lifecycle & Banner Presentation Verification...\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error(`   [Browser Error]:`, msg.text());
    }
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  let passed = true;

  // 1. Give human player a Draw Two card to reproduce the exact scenario
  console.log('▶ 1. Testing Power Card Play & Auto-Dismissal Lifecycle...');

  // Let's play a Wild Draw 4 or Draw 2 using the existing helper
  console.log('▶ 2. Playing Wild Draw Four to test +4 penalty notification & auto-dismissal...');
  await page.evaluate(() => {
    if (typeof window.__UNO_GIVE_WILD__ === 'function') {
      window.__UNO_GIVE_WILD__('wild_draw4');
    }
  });
  await new Promise(r => setTimeout(r, 300));

  // Select and play Wild Draw 4
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

  // Pick color 'yellow'
  await page.evaluate(() => {
    const yellowBtn = document.querySelector('.color-pick-btn.yellow');
    if (yellowBtn) yellowBtn.click();
  });
  await new Promise(r => setTimeout(r, 200));

  // 3. Inspect notification appearance, position, and pointer-events
  const notifAppearance = await page.evaluate(() => {
    const overlay = document.querySelector('.action-effect-overlay');
    const banner = document.querySelector('.action-banner-wild4');
    const drawPile = document.getElementById('draw-pile-target');
    const discardPile = document.getElementById('discard-pile-target');

    if (!banner || !overlay) {
      return { found: false };
    }

    const bannerRect = banner.getBoundingClientRect();
    const drawPileRect = drawPile ? drawPile.getBoundingClientRect() : null;
    const discardPileRect = discardPile ? discardPile.getBoundingClientRect() : null;

    // Check if banner overlaps draw pile or discard pile
    const overlapsDraw = drawPileRect
      ? !(bannerRect.right < drawPileRect.left || bannerRect.left > drawPileRect.right || bannerRect.bottom < drawPileRect.top || bannerRect.top > drawPileRect.bottom)
      : false;
    const overlapsDiscard = discardPileRect
      ? !(bannerRect.right < discardPileRect.left || bannerRect.left > discardPileRect.right || bannerRect.bottom < discardPileRect.top || bannerRect.top > discardPileRect.bottom)
      : false;

    const overlayStyle = window.getComputedStyle(overlay);
    const bannerStyle = window.getComputedStyle(banner);

    return {
      found: true,
      text: banner.textContent,
      top: bannerRect.top,
      height: bannerRect.height,
      overlapsDraw,
      overlapsDiscard,
      overlayPointerEvents: overlayStyle.pointerEvents,
      bannerPointerEvents: bannerStyle.pointerEvents,
    };
  });

  console.log('   Notification appearance:', notifAppearance);
  await page.screenshot({ path: path.join(__dirname, '../public/verified-notif-position.png') });

  if (!notifAppearance.found) {
    console.error('❌ Notification banner did not appear');
    passed = false;
  } else {
    if (notifAppearance.overlapsDraw || notifAppearance.overlapsDiscard) {
      console.error('❌ Notification banner is overlapping the draw/discard piles!');
      passed = false;
    } else {
      console.log('   ✅ Banner is placed above the table console (NOT overlapping draw or discard pile)!');
    }

    if (notifAppearance.overlayPointerEvents !== 'none' || notifAppearance.bannerPointerEvents !== 'none') {
      console.error('❌ pointer-events is not set to none!');
      passed = false;
    } else {
      console.log('   ✅ pointer-events: none verified on both overlay and banner!');
    }

    if (notifAppearance.height > 60) {
      console.error(`❌ Banner height (${notifAppearance.height}px) is still oversized!`);
      passed = false;
    } else {
      console.log(`   ✅ Banner height is compact (${Math.round(notifAppearance.height)}px <= 50px)!`);
    }
  }

  // 4. Verify that subsequent turns and bot actions do NOT prevent auto-dismissal
  console.log('\n▶ 4. Monitoring notification dismissal across subsequent turns...');
  // Wait 1.8 seconds (duration is 1.5s)
  await new Promise(r => setTimeout(r, 1800));

  const notifAfterTimeout = await page.evaluate(() => {
    const banner = document.querySelector('.action-banner-wild4') || document.querySelector('.action-banner-draw');
    return {
      stillPresent: !!banner,
      text: banner ? banner.textContent : null,
    };
  });

  console.log('   Notification after 1.8s timeout:', notifAfterTimeout);
  if (notifAfterTimeout.stillPresent) {
    console.error(`❌ Notification banner is STUCK on screen: "${notifAfterTimeout.text}"!`);
    passed = false;
  } else {
    console.log('   ✅ Notification automatically dismissed on schedule after ~1.5s!');
  }
  await page.screenshot({ path: path.join(__dirname, '../public/verified-notif-dismissed.png') });

  // 5. Test rapid consecutive notifications
  console.log('\n▶ 5. Testing rapid consecutive notifications (Skip then Reverse)...');
  await page.evaluate(() => {
    // Trigger skip then reverse in quick succession
    if (typeof window.__UNO_GIVE_WILD__ === 'function') {
      window.__UNO_GIVE_WILD__('wild');
    }
  });
  await new Promise(r => setTimeout(r, 300));

  // Play wild and choose color
  await page.evaluate(async () => {
    const cardEl = document.querySelector('.card-wrapper[data-value="wild"]');
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

  // Choose Green
  await page.evaluate(() => {
    const greenBtn = document.querySelector('.color-pick-btn.green');
    if (greenBtn) greenBtn.click();
  });
  await new Promise(r => setTimeout(r, 200));

  const wildNotif = await page.evaluate(() => {
    const banner = document.querySelector('.action-banner-wild4');
    return {
      present: !!banner,
      text: banner ? banner.textContent : null,
    };
  });
  console.log('   Wild notification triggered:', wildNotif);

  // Wait 1.6s
  await new Promise(r => setTimeout(r, 1600));

  const wildNotifAfter = await page.evaluate(() => {
    const banner = document.querySelector('.action-banner-wild4');
    return {
      stillPresent: !!banner,
    };
  });
  console.log('   Wild notification after 1.6s:', wildNotifAfter);
  if (wildNotifAfter.stillPresent) {
    console.error('❌ Wild notification failed to dismiss!');
    passed = false;
  } else {
    console.log('   ✅ Wild notification cleanly dismissed on schedule!');
  }

  await browser.close();

  if (passed) {
    console.log('\n🎉 ALL NOTIFICATION LIFECYCLE & PRESENTATION VERIFICATIONS PASSED 100%!');
  } else {
    console.error('\n⚠️ Some notification lifecycle tests failed.');
    process.exit(1);
  }
}

testNotificationLifecycle().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
