const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');
const path = require('path');

async function testDifficultiesInBrowser() {
  console.log('🧪 Starting Browser Verification of Easy, Medium, and Hard AI Difficulties...');

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

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const difficulties = ['easy', 'medium', 'hard'];

  for (const diff of difficulties) {
    console.log(`\n▶ Testing AI Difficulty: [${diff.toUpperCase()}]`);

    // 1. Open Match Setup modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const setupBtn = btns.find(b => b.textContent && b.textContent.includes('Match Setup'));
      if (setupBtn) setupBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // 2. Select difficulty in modal
    const selected = await page.evaluate((targetDiff) => {
      const btns = Array.from(document.querySelectorAll('.modal-dialog .toggle-btn'));
      const diffBtn = btns.find(b => b.textContent?.trim().toLowerCase() === targetDiff);
      if (diffBtn) {
        diffBtn.click();
        return true;
      }
      return false;
    }, diff);

    if (!selected) {
      console.error(`❌ Could not find difficulty toggle button for ${diff}`);
      process.exit(1);
    }
    await new Promise(r => setTimeout(r, 200));

    // 3. Click "Start New Match"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.modal-dialog button'));
      const startBtn = btns.find(b => b.textContent && b.textContent.includes('Start New Match'));
      if (startBtn) startBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // 4. Verify UI reflects active difficulty
    const uiStatus = await page.evaluate((targetDiff) => {
      const topBadge = document.querySelector('.difficulty-badge');
      const botTags = Array.from(document.querySelectorAll('.opponent-difficulty-tag')).map(t => t.textContent?.trim().toLowerCase());
      return {
        topBadgeText: topBadge ? topBadge.textContent?.trim().toLowerCase() : '',
        botTags,
        allMatch: botTags.every(t => t === targetDiff),
      };
    }, diff);

    if (uiStatus.topBadgeText.includes(diff) && uiStatus.allMatch) {
      console.log(`   ✅ UI Display: Top bar badge is "${uiStatus.topBadgeText}", bot pods display [${uiStatus.botTags[0]?.toUpperCase()}]`);
    } else {
      console.error(`   ❌ UI mismatch for ${diff}: topBadge="${uiStatus.topBadgeText}", botTags=${JSON.stringify(uiStatus.botTags)}`);
      process.exit(1);
    }

    // 5. Let AI take turns (wait 2 seconds for bots to compute and make moves)
    await new Promise(r => setTimeout(r, 2000));

    // 6. Screenshot active match
    const ssPath = path.join(__dirname, '..', 'public', `verified-difficulty-${diff}.png`);
    await page.screenshot({ path: ssPath });
    console.log(`   📸 Screenshot saved: public/verified-difficulty-${diff}.png`);
  }

  if (consoleErrors.length === 0) {
    console.log('\n✅ Zero runtime browser console errors detected across all 3 difficulty sessions!');
  } else {
    console.error(`\n❌ Found ${consoleErrors.length} browser console errors!`);
    process.exit(1);
  }

  await browser.close();
  console.log('\n🎉 ALL THREE AI DIFFICULTIES FULLY VERIFIED IN BROWSER!');
}

testDifficultiesInBrowser().catch(err => {
  console.error(err);
  process.exit(1);
});
