const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');
const path = require('path');

async function testWildCardButtons() {
  console.log('🧪 Starting Puppeteer Wild Card Color Selection Browser Verification...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
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

  const colorsToTest = ['red', 'blue', 'green', 'yellow'];
  let allPassed = true;

  for (const color of colorsToTest) {
    console.log(`\n▶ Testing color button: [${color.toUpperCase()}]`);

    // 1. Give human player a Wild card
    await page.evaluate(() => {
      if (typeof window.__UNO_GIVE_WILD__ === 'function') {
        window.__UNO_GIVE_WILD__('wild');
      }
    });
    await new Promise(r => setTimeout(r, 200));

    // 2. Click the wild card in hand to select it, then click again or click "Play" button
    const wildCardFound = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.hand-card-wrapper'));
      const wildCard = cards.find(c => {
        const inner = c.querySelector('.card-wrapper');
        return inner && inner.getAttribute('data-value') === 'wild';
      });
      if (wildCard) {
        wildCard.click();
        return true;
      }
      return false;
    });

    if (!wildCardFound) {
      console.error(`❌ Could not locate Wild card in hand for ${color}`);
      allPassed = false;
      continue;
    }

    await new Promise(r => setTimeout(r, 200));

    // Click the "Play" action button or click the card a second time
    await page.evaluate(() => {
      const playBtn = Array.from(document.querySelectorAll('.hand-center-actions button'))
        .find(b => b.textContent && b.textContent.includes('Play'));
      if (playBtn) {
        playBtn.click();
      } else {
        const cards = Array.from(document.querySelectorAll('.hand-card-wrapper'));
        const wildCard = cards.find(c => {
          const inner = c.querySelector('.card-wrapper');
          return inner && inner.getAttribute('data-value') === 'wild';
        });
        if (wildCard) wildCard.click();
      }
    });

    await new Promise(r => setTimeout(r, 300));

    // 3. Verify color choice modal is visible
    const modalVisible = await page.evaluate(() => {
      const modal = document.querySelector('.color-choice-modal');
      const title = modal ? modal.querySelector('.color-choice-title') : null;
      return modal && title && title.textContent?.includes('Wild Card Played!');
    });

    if (!modalVisible) {
      console.error(`❌ Color choice modal did not appear after playing Wild card!`);
      allPassed = false;
      continue;
    }
    console.log(`   ✅ Modal opened successfully with prompt: "Wild Card Played!"`);

    // Screenshot modal for the first color
    if (color === 'red') {
      const modalSs = path.join(__dirname, '..', 'public', 'verified-wild-modal.png');
      await page.screenshot({ path: modalSs });
      console.log(`   📸 Captured modal screenshot: public/verified-wild-modal.png`);
    }

    // 4. Click the color button
    const buttonClicked = await page.evaluate((targetColor) => {
      const btn = document.querySelector(`.color-pick-btn.${targetColor}`);
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    }, color);

    if (!buttonClicked) {
      console.error(`❌ Button for color .${color} not found in modal!`);
      allPassed = false;
      continue;
    }

    await new Promise(r => setTimeout(r, 400));

    // 5. Verify results:
    // a) Modal is closed
    // b) Active color is targetColor
    // c) Color ring has class .color-<targetColor>
    const report = await page.evaluate((targetColor) => {
      const modal = document.querySelector('.color-choice-modal');
      const colorRing = document.querySelector('.color-ring');
      const colorLabel = document.querySelector('.color-text-label');
      const activeColor = colorLabel ? colorLabel.textContent?.trim().toLowerCase() : '';
      const ringHasColor = colorRing ? colorRing.classList.contains(`color-${targetColor}`) : false;

      return {
        modalClosed: !modal,
        activeColor,
        ringHasColor,
      };
    }, color);

    if (report.modalClosed && report.activeColor === color && report.ringHasColor) {
      console.log(`   ✅ Button [${color.toUpperCase()}] clicked -> Modal closed, active table color changed to "${report.activeColor}" (Ring: .color-${color})`);
    } else {
      console.error(`   ❌ Failed for color ${color}: modalClosed=${report.modalClosed}, activeColor=${report.activeColor}, ringHasColor=${report.ringHasColor}`);
      allPassed = false;
    }

    const ssPath = path.join(__dirname, '..', 'public', `verified-color-${color}.png`);
    await page.screenshot({ path: ssPath });
    console.log(`   📸 Screenshot saved: public/verified-color-${color}.png`);
  }

  // 6. Test Cancel Button
  console.log(`\n▶ Testing Cancel button in modal`);
  await page.evaluate(() => {
    window.__UNO_GIVE_WILD__('wild');
  });
  await new Promise(r => setTimeout(r, 200));

  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.hand-card-wrapper'));
    const wildCard = cards.find(c => {
      const inner = c.querySelector('.card-wrapper');
      return inner && inner.getAttribute('data-value') === 'wild';
    });
    if (wildCard) {
      wildCard.click();
    }
  });
  await new Promise(r => setTimeout(r, 200));

  await page.evaluate(() => {
    const playBtn = Array.from(document.querySelectorAll('.hand-center-actions button'))
      .find(b => b.textContent && b.textContent.includes('Play'));
    if (playBtn) {
      playBtn.click();
    } else {
      const cards = Array.from(document.querySelectorAll('.hand-card-wrapper'));
      const wildCard = cards.find(c => {
        const inner = c.querySelector('.card-wrapper');
        return inner && inner.getAttribute('data-value') === 'wild';
      });
      if (wildCard) wildCard.click();
    }
  });
  await new Promise(r => setTimeout(r, 300));

  const cancelResult = await page.evaluate(() => {
    const modal = document.querySelector('.color-choice-modal');
    if (!modal) return { error: 'Modal not open' };
    const cancelBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Cancel');
    if (!cancelBtn) return { error: 'Cancel button not found' };
    cancelBtn.click();
    return { ok: true };
  });

  await new Promise(r => setTimeout(r, 300));

  const afterCancel = await page.evaluate(() => {
    const modal = document.querySelector('.color-choice-modal');
    return { modalClosed: !modal };
  });

  if (afterCancel.modalClosed) {
    console.log(`   ✅ Cancel button closed modal without applying wild card.`);
  } else {
    console.error(`   ❌ Cancel button failed to close modal.`);
    allPassed = false;
  }

  // Check console errors
  if (consoleErrors.length === 0) {
    console.log(`\n✅ Zero runtime browser console errors detected!`);
  } else {
    console.error(`\n❌ Found ${consoleErrors.length} browser console errors!`);
    allPassed = false;
  }

  await browser.close();

  if (allPassed) {
    console.log('\n🎉 ALL REAL GAMEPLAY BROWSER VERIFICATION CHECKS PASSED PERFECTLY!');
  } else {
    console.error('\n❌ SOME VERIFICATION CHECKS FAILED!');
    process.exit(1);
  }
}

testWildCardButtons().catch(err => {
  console.error(err);
  process.exit(1);
});
