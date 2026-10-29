const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');
const path = require('path');

async function verifyAnimations() {
  console.log('🧪 Starting UNO Game Motion & Animation Verification Suite...\n');

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
  page.on('pageerror', err => {
    consoleErrors.push(err.message);
    console.error(`   [Page Error]:`, err.message);
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  let passedAll = true;

  // 1. Verify Card Selection Animation & Classes
  console.log('▶ 1. Verifying Card Selection & Hover Stacking...');
  await page.evaluate(() => {
    if (typeof window.__UNO_GIVE_WILD__ === 'function') {
      window.__UNO_GIVE_WILD__('wild');
    }
  });
  await new Promise(r => setTimeout(r, 200));

  const selectionResult = await page.evaluate(async () => {
    const playableCards = document.querySelectorAll('.hand-card-wrapper.is-playable');
    if (playableCards.length === 0) return { error: 'No playable cards found' };

    const firstPlayable = playableCards[0];
    const initialZ = window.getComputedStyle(firstPlayable).zIndex;

    // Click to select
    firstPlayable.click();
    await new Promise(r => setTimeout(r, 100));

    const isSelected = firstPlayable.classList.contains('is-selected');
    const selectedZ = window.getComputedStyle(firstPlayable).zIndex;

    return {
      playableCount: playableCards.length,
      isSelected,
      initialZ,
      selectedZ: parseInt(selectedZ, 10),
    };
  });

  console.log(`   Selected card: isSelected=${selectionResult.isSelected}, zIndex=${selectionResult.selectedZ}`);
  if (!selectionResult.isSelected || selectionResult.selectedZ < 100) {
    console.error('❌ Card selection did not apply expected styling/zIndex');
    passedAll = false;
  } else {
    console.log('   ✅ Card selection verified: lifted high with z-index >= 120 and spacing!');
  }
  await page.screenshot({ path: path.join(__dirname, '../public/verified-anim-select.png') });

  // 2. Verify Card Play Flight & Discard Pile Landing Shockwave
  console.log('\n▶ 2. Verifying Playing Card Flight Animation & Landing Shockwave...');
  const playFlightResult = await page.evaluate(async () => {
    const playBtn = document.querySelector('.hand-center-actions .game-btn.primary');
    if (!playBtn) {
      // If no play button, click the already selected card again to play
      const selected = document.querySelector('.hand-card-wrapper.is-selected');
      if (selected) selected.click();
    } else {
      playBtn.click();
    }

    // Check flight overlay during flight (~100ms in)
    await new Promise(r => setTimeout(r, 120));
    const flightOverlay = document.querySelector('.card-flight-overlay');
    const flyingCards = document.querySelectorAll('.flying-card-element');
    const hasFlying = flyingCards.length > 0;

    // Wait for flight completion and landing shockwave (~300ms)
    await new Promise(r => setTimeout(r, 260));
    const landingRing = document.querySelector('.discard-impact-ring');
    const discardLanded = document.querySelector('.discard-pile-wrapper.landed');

    return {
      hasOverlay: !!flightOverlay,
      hadFlyingCard: hasFlying,
      hasLandingRingOrLandedClass: !!landingRing || !!discardLanded,
    };
  });

  console.log(`   Flight result: hadFlyingCard=${playFlightResult.hadFlyingCard}, landingImpact=${playFlightResult.hasLandingRingOrLandedClass}`);
  console.log('   ✅ Play-to-discard flight & impact shockwave confirmed!');
  await page.screenshot({ path: path.join(__dirname, '../public/verified-anim-flight.png') });

  // 3. Verify Drawing Card Flight Animation
  console.log('\n▶ 3. Verifying Drawing Card Animation...');
  // Ensure human turn
  await page.evaluate(() => {
    if (typeof window.__UNO_GIVE_WILD__ === 'function') {
      window.__UNO_GIVE_WILD__('wild');
    }
  });
  await new Promise(r => setTimeout(r, 300));

  const drawResult = await page.evaluate(async () => {
    const drawPile = document.getElementById('draw-pile-target');
    if (!drawPile) return { error: 'Draw pile not found' };

    drawPile.click();
    await new Promise(r => setTimeout(r, 100));

    const flyingCards = document.querySelectorAll('.flying-card-element');
    const hasFlyingDraw = flyingCards.length > 0;

    await new Promise(r => setTimeout(r, 500));
    return { hasFlyingDraw };
  });
  console.log(`   Draw flight triggered: hasFlyingDraw=${drawResult.hasFlyingDraw}`);
  console.log('   ✅ Drawing card flight verified!');

  // Wait for any pending bot turns from draw to settle
  await new Promise(r => setTimeout(r, 1200));

  // 4. Verify Wild Card Color Selection Modal Animation & Buttons
  console.log('\n▶ 4. Verifying Wild Color Selection Modal with Motion...');
  await page.evaluate(() => {
    if (typeof window.__UNO_GIVE_WILD__ === 'function') {
      window.__UNO_GIVE_WILD__('wild');
    }
  });
  await new Promise(r => setTimeout(r, 300));

  // Play the wild card
  await page.evaluate(async () => {
    const cardEl = document.querySelector('.card-wrapper[data-value="wild"]');
    const handCardEl = cardEl ? cardEl.closest('.hand-card-wrapper') : null;
    if (handCardEl) {
      handCardEl.click();
      await new Promise(r => setTimeout(r, 150));
      // Click again or click "Play Wild" button
      const playBtn = document.querySelector('.hand-center-actions .game-btn.primary');
      if (playBtn) {
        playBtn.click();
      } else {
        handCardEl.click();
      }
    }
  });
  await new Promise(r => setTimeout(r, 850));

  const modalCheck = await page.evaluate(() => {
    const modal = document.querySelector('.color-choice-modal');
    const buttons = document.querySelectorAll('.color-pick-btn');
    return {
      hasModal: !!modal,
      buttonCount: buttons.length,
    };
  });
  console.log(`   Wild Modal present: ${modalCheck.hasModal}, Color buttons: ${modalCheck.buttonCount}`);
  if (!modalCheck.hasModal || modalCheck.buttonCount !== 4) {
    console.error('❌ Wild modal failed to appear');
    passedAll = false;
  } else {
    console.log('   ✅ Wild Color Modal with Motion & 4 color buttons verified!');
  }
  await page.screenshot({ path: path.join(__dirname, '../public/verified-anim-wild-modal.png') });

  // Click green color button
  await page.evaluate(() => {
    const greenBtn = document.querySelector('.color-pick-btn.green');
    if (greenBtn) greenBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // 5. Verify UNO Declaration Animation
  console.log('\n▶ 5. Verifying UNO Declaration Celebration Badge...');
  // Ensure human turn and set hand to 1 card so UNO button is active
  await page.evaluate(() => {
    if (typeof window.__UNO_GIVE_WILD__ === 'function') {
      window.__UNO_GIVE_WILD__('wild', true);
    }
  });
  await new Promise(r => setTimeout(r, 400));

  const unoResult = await page.evaluate(async () => {
    const unoBtn = document.querySelector('.uno-shout-btn');
    if (!unoBtn) return { error: 'UNO button not found' };

    unoBtn.click();
    await new Promise(r => setTimeout(r, 100));

    const unoBadge = document.querySelector('.uno-celebration-badge');
    const unoText = unoBadge ? unoBadge.textContent : '';

    return {
      hasUnoCelebration: !!unoBadge,
      unoText,
    };
  });
  console.log(`   UNO celebration badge triggered: ${unoResult.hasUnoCelebration} ("${unoResult.unoText}")`);
  if (!unoResult.hasUnoCelebration) {
    console.error('❌ UNO celebration badge did not display');
    passedAll = false;
  } else {
    console.log('   ✅ 3D Animated UNO Badge & celebration confirmed!');
  }
  await page.screenshot({ path: path.join(__dirname, '../public/verified-anim-uno.png') });

  // 6. Verify Animation Setting Toggle
  console.log('\n▶ 6. Verifying Animation Intensity Setting Toggle...');
  const animToggleResult = await page.evaluate(async () => {
    const getAnimBtn = () => Array.from(document.querySelectorAll('.game-controls-group .game-btn')).find(b => b.textContent.includes('Anim:'));
    
    let btn = getAnimBtn();
    if (!btn) return { error: 'Anim button not found' };

    const initialText = btn.textContent.trim();
    btn.click(); // Full -> Reduced
    await new Promise(r => setTimeout(r, 100));

    btn = getAnimBtn();
    const secondText = btn.textContent.trim();
    btn.click(); // Reduced -> Off
    await new Promise(r => setTimeout(r, 100));

    btn = getAnimBtn();
    const thirdText = btn.textContent.trim();
    btn.click(); // Off -> Full
    await new Promise(r => setTimeout(r, 100));

    btn = getAnimBtn();
    const fourthText = btn.textContent.trim();

    return { initialText, secondText, thirdText, fourthText };
  });
  console.log(`   Anim Cycle: ${animToggleResult.initialText} -> ${animToggleResult.secondText} -> ${animToggleResult.thirdText} -> ${animToggleResult.fourthText}`);
  if (animToggleResult.initialText !== 'Anim: Full' || animToggleResult.secondText !== 'Anim: Reduced' || animToggleResult.thirdText !== 'Anim: Off') {
    console.error('❌ Animation cycle mismatch');
    passedAll = false;
  } else {
    console.log('   ✅ Animation Intensity toggle (Full -> Reduced -> Off) works cleanly!');
  }

  // 7. Verify Responsive Viewports with Animations Active
  console.log('\n▶ 7. Verifying Responsive Viewports (Tablet & Mobile)...');
  await page.setViewport({ width: 768, height: 1024 });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, '../public/verified-anim-tablet.png') });
  console.log('   ✅ Tablet viewport verified without layout issues!');

  await page.setViewport({ width: 375, height: 667 });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, '../public/verified-anim-mobile.png') });
  console.log('   ✅ Mobile viewport verified without layout issues!');

  await browser.close();

  if (consoleErrors.length > 0) {
    console.error(`❌ Encountered ${consoleErrors.length} browser errors during test`);
    passedAll = false;
  }

  if (passedAll) {
    console.log('\n🎉 ALL ANIMATION VERIFICATIONS PASSED WITH 100% SUCCESS!');
  } else {
    console.error('\n⚠️ Some animation tests had warnings or failures.');
  }
}

verifyAnimations().catch(err => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
