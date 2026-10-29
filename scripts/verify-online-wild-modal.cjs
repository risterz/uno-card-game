const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');
const path = require('path');

async function testOnlineWildModal() {
  console.log('🧪 Starting Online Wild Card Modal UI Verification...');

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
    const context2 = await browser.createBrowserContext();
    const pageBob = await context2.newPage();

    await pageAlice.setViewport({ width: 1280, height: 800 });
    await pageAlice.goto(`${clientUrl}/`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    // Alice creates room
    await pageAlice.click('[data-testid="nav-tab-online"]');
    await pageAlice.waitForSelector('[data-testid="create-player-name-input"]');
    await pageAlice.$eval('[data-testid="create-player-name-input"]', el => (el.value = ''));
    await pageAlice.type('[data-testid="create-player-name-input"]', 'Alice');
    await pageAlice.click('[data-testid="create-room-btn"]');

    await pageAlice.waitForSelector('.room-code-value', { timeout: 6000 });
    const roomCode = await pageAlice.$eval('.room-code-value', el => el.textContent.trim());
    console.log(`   Room Code created: ${roomCode}`);

    // Bob joins room
    await pageBob.goto(`${clientUrl}/?room=${roomCode}`, { waitUntil: 'domcontentloaded' });
    await pageBob.waitForSelector('[data-testid="join-player-name-input"]');
    await pageBob.$eval('[data-testid="join-player-name-input"]', el => (el.value = ''));
    await pageBob.type('[data-testid="join-player-name-input"]', 'Bob');
    await pageBob.click('[data-testid="join-room-submit-btn"]');

    // Wait for both in lobby
    await pageAlice.waitForFunction(
      () => document.querySelectorAll('.player-slot:not(.empty-slot)').length === 2,
      { timeout: 6000 }
    );

    // Host starts match
    await pageAlice.click('[data-testid="start-match-btn"]');
    await pageAlice.waitForSelector('.game-arena', { timeout: 6000 });
    console.log('   ✅ Match started, Alice is on the online game table.');

    // Trigger wild selection modal on Alice's client
    await pageAlice.evaluate(() => {
      if (typeof window.__UNO_ONLINE_TRIGGER_WILD_MODAL__ === 'function') {
        window.__UNO_ONLINE_TRIGGER_WILD_MODAL__();
      }
    });
    await new Promise(r => setTimeout(r, 400));

    // Inspect the modal
    const modalData = await pageAlice.evaluate(() => {
      const modal = document.querySelector('.color-choice-modal');
      const box = document.querySelector('.color-choice-box');
      const title = document.querySelector('.color-choice-title');
      const subtitle = document.querySelector('.color-choice-subtitle');
      const grid = document.querySelector('.color-buttons-grid');
      const buttons = Array.from(document.querySelectorAll('.color-pick-btn'));

      const boxStyles = box ? window.getComputedStyle(box) : null;
      const titleStyles = title ? window.getComputedStyle(title) : null;

      return {
        hasModal: !!modal,
        hasBox: !!box,
        hasTitle: !!title,
        titleText: title ? title.textContent : '',
        hasSubtitle: !!subtitle,
        subtitleText: subtitle ? subtitle.textContent : '',
        hasGrid: !!grid,
        buttonsCount: buttons.length,
        buttonLabels: buttons.map(b => b.textContent.trim()),
        boxBg: boxStyles ? boxStyles.backgroundColor : '',
        boxBorderRadius: boxStyles ? boxStyles.borderRadius : '',
        titleColor: titleStyles ? titleStyles.color : '',
        titleFontSize: titleStyles ? titleStyles.fontSize : '',
      };
    });

    console.log('Modal Inspection Data:', modalData);

    if (
      modalData.hasModal &&
      modalData.hasBox &&
      modalData.hasTitle &&
      modalData.hasSubtitle &&
      modalData.hasGrid &&
      modalData.buttonsCount === 4 &&
      modalData.titleText === 'Wild Card Played!'
    ) {
      console.log('   ✅ Wild Card Color Selection Modal correctly styled with design system classes!');
    } else {
      console.error('   ❌ Modal check failed:', modalData);
      passed = false;
    }

    // Capture desktop screenshot
    const desktopSs = path.join(__dirname, '..', 'public', 'layout-verification', 'online-wild-card-modal-verified.png');
    await pageAlice.screenshot({ path: desktopSs });
    console.log(`   📸 Screenshot saved: ${desktopSs}`);

    // Test on Mobile Viewport
    await pageAlice.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 300));

    const mobileData = await pageAlice.evaluate(() => {
      const box = document.querySelector('.color-choice-box')?.getBoundingClientRect();
      const buttons = Array.from(document.querySelectorAll('.color-pick-btn')).map(b => b.getBoundingClientRect());
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      return {
        boxWidth: Math.round(box ? box.width : 0),
        boxHeight: Math.round(box ? box.height : 0),
        winW,
        winH,
        fitsInScreen: box ? (box.width < winW && box.height < winH) : false,
        btn0Height: buttons[0] ? Math.round(buttons[0].height) : 0,
      };
    });
    console.log('Mobile Viewport (390x844) Modal Metrics:', mobileData);

    if (mobileData.fitsInScreen) {
      console.log('   ✅ Modal fits cleanly inside mobile viewport without overflowing.');
    } else {
      console.error('   ❌ Modal overflows mobile viewport:', mobileData);
      passed = false;
    }

    const mobileSs = path.join(__dirname, '..', 'public', 'layout-verification', 'online-wild-card-modal-mobile.png');
    await pageAlice.screenshot({ path: mobileSs });
    console.log(`   📸 Mobile Screenshot saved: ${mobileSs}`);

  } catch (err) {
    console.error('Error during verification:', err);
    passed = false;
  } finally {
    await browser.close();
  }

  if (passed) {
    console.log('\n🎉 ALL ONLINE WILD CARD UI VERIFICATIONS PASSED (100% SUCCESS)!');
    process.exit(0);
  } else {
    console.error('\n❌ Verification failed.');
    process.exit(1);
  }
}

testOnlineWildModal();
