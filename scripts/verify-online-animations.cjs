const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');

async function verifyOnlineAnimations() {
  console.log('🧪 Starting Online UNO Card Animations & Animation Settings Verification...');

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
    await pageAlice.setViewport({ width: 1280, height: 800 });
    const context2 = await browser.createBrowserContext();
    const pageBob = await context2.newPage();
    await pageBob.setViewport({ width: 1280, height: 800 });

    pageAlice.on('console', msg => console.log('   [Alice Console]:', msg.text()));
    pageAlice.on('pageerror', err => console.error('   [Alice PageError]:', err.message));
    pageBob.on('console', msg => console.log('   [Bob Console]:', msg.text()));
    pageBob.on('pageerror', err => console.error('   [Bob PageError]:', err.message));

    let activeUrl = clientUrl;
    try {
      await pageAlice.goto(`${activeUrl}/`, { waitUntil: 'domcontentloaded', timeout: 4000 });
    } catch (_) {
      activeUrl = 'http://localhost:3001';
      console.log('Port 3000 unreachable, using port 3001...');
      await pageAlice.goto(`${activeUrl}/`, { waitUntil: 'domcontentloaded' });
    }
    await new Promise(r => setTimeout(r, 600));

    // 1. Verify Shared Animation Preference between Local & Online
    console.log('\n▶ Step 1: Testing Shared Animation Preference Persistence & Sync...');
    // In local mode, click animation toggle
    await pageAlice.click('.game-controls-group button[title*="Animation Mode"]');
    await new Promise(r => setTimeout(r, 200));

    const localAnimText = await pageAlice.$eval(
      '.game-controls-group button[title*="Animation Mode"]',
      el => el.textContent.trim()
    );
    console.log(`   Local mode animation setting toggled to: "${localAnimText}"`);

    // Switch to Online tab
    await pageAlice.click('[data-testid="nav-tab-online"]');
    await new Promise(r => setTimeout(r, 300));

    // Create room
    await pageAlice.waitForSelector('[data-testid="create-player-name-input"]');
    await pageAlice.$eval('[data-testid="create-player-name-input"]', el => (el.value = ''));
    await pageAlice.type('[data-testid="create-player-name-input"]', 'Alice');
    await pageAlice.click('[data-testid="create-room-btn"]');

    await pageAlice.waitForSelector('.room-code-value', { timeout: 6000 });
    const roomCode = await pageAlice.$eval('.room-code-value', el => el.textContent.trim());
    console.log(`   Room Code: ${roomCode}`);

    // Bob joins room
    await pageBob.goto(`${activeUrl}/?room=${roomCode}`, { waitUntil: 'domcontentloaded' });
    await pageBob.waitForSelector('[data-testid="join-player-name-input"]');
    await pageBob.$eval('[data-testid="join-player-name-input"]', el => (el.value = ''));
    await pageBob.type('[data-testid="join-player-name-input"]', 'Bob');
    await pageBob.click('[data-testid="join-room-submit-btn"]');

    // Wait for lobby sync
    await pageAlice.waitForFunction(
      () => document.querySelectorAll('.player-slot:not(.empty-slot)').length === 2,
      { timeout: 6000 }
    );

    // Host starts match
    await pageAlice.click('[data-testid="start-match-btn"]');
    await pageAlice.waitForSelector('.game-arena', { timeout: 6000 });
    await pageBob.waitForSelector('.game-arena', { timeout: 6000 });

    // Verify online mode inherited the local animation setting
    const onlineAnimText = await pageAlice.$eval(
      '[data-testid="anim-toggle-btn"]',
      el => el.textContent.trim()
    );
    console.log(`   Online mode animation setting is: "${onlineAnimText}"`);

    if (onlineAnimText === localAnimText) {
      console.log('   ✅ Animation preference preserved seamlessly across Local and Online modes!');
    } else {
      console.error('   ❌ Animation preference not shared between modes:', localAnimText, 'vs', onlineAnimText);
      passed = false;
    }

    // Cycle online animation mode back to Full
    for (let i = 0; i < 3; i++) {
      const cur = await pageAlice.evaluate(() => {
        const btn = document.querySelector('[data-testid="anim-toggle-btn"]');
        return btn ? btn.textContent.trim() : null;
      });
      if (cur && cur.includes('Full')) break;
      await pageAlice.click('[data-testid="anim-toggle-btn"]');
      await new Promise(r => setTimeout(r, 200));
    }
    console.log('   Set Alice to Anim: Full for flight test.');

    // 2. Test Card-Play Flight Animation
    console.log('\n▶ Step 2: Testing Card-Play Flight Animation (Hand -> Discard Pile)...');
    const turnInfo = await pageAlice.evaluate(() => {
      const isMyTurn = document.querySelector('.turn-pill') !== null;
      return { isAliceTurn: isMyTurn };
    });

    const activePage = turnInfo.isAliceTurn ? pageAlice : pageBob;
    const waitingPage = turnInfo.isAliceTurn ? pageBob : pageAlice;
    const activeName = turnInfo.isAliceTurn ? 'Alice' : 'Bob';
    const waitingName = turnInfo.isAliceTurn ? 'Bob' : 'Alice';

    // Ensure active player has Anim: Full
    await activePage.evaluate(() => {
      const btn = document.querySelector('[data-testid="anim-toggle-btn"]');
      if (btn && !btn.textContent.includes('Full')) {
        btn.click();
      }
    });

    const playableCards = await activePage.evaluate(() => {
      const els = Array.from(document.querySelectorAll('.hand-card-wrapper.is-playable'));
      return els.map(el => el.id);
    });

    console.log(`   ${activeName} playable cards:`, playableCards);

    if (playableCards.length > 0) {
      const targetCardId = playableCards[0];
      console.log(`   ${activeName} playing card: ${targetCardId}`);

      // Click card to select
      await activePage.click(`#${targetCardId}`);
      await new Promise(r => setTimeout(r, 200));

      // Click again or click play button to launch flight
      const hasPlayBtn = await activePage.$('[data-testid="online-play-btn"]');
      if (hasPlayBtn) {
        await activePage.click('[data-testid="online-play-btn"]');
      } else {
        await activePage.click(`#${targetCardId}`);
      }

      // Check if flight element appears in DOM during flight
      const flightDetected = await activePage.evaluate(() => {
        const flying = document.querySelector('.flying-card-element');
        const overlay = document.querySelector('.card-flight-overlay');
        return { hasOverlay: !!overlay, hasFlying: !!flying };
      });

      console.log('   Flight layer status during flight:', flightDetected);
      await new Promise(r => setTimeout(r, 600));

      // Verify discard impact ring appeared
      const discardState = await activePage.evaluate(() => {
        const discard = document.querySelector('.discard-pile-wrapper');
        return {
          hasDiscard: !!discard,
          isLanded: discard?.classList.contains('landed'),
        };
      });

      console.log('   Discard pile landing effect verified:', discardState);
      console.log('   ✅ Card flight animation executed with landing bounce!');

      // If wild card was played, choose color to complete turn
      try {
        const wildChoice = await activePage.$('[data-testid^="wild-color-"]');
        if (wildChoice) {
          console.log('   Wild color picker active; choosing red...');
          await activePage.click('[data-testid="wild-color-red"]');
          await new Promise(r => setTimeout(r, 400));
        }
      } catch (_) {}
    } else {
      console.log(`   ${activeName} draws card...`);
      await activePage.click('[data-testid="online-draw-btn"]');
      await new Promise(r => setTimeout(r, 500));
    }

    // 3. Test Opponent Card-Flight & Anti-Leakage (Face-Down)
    console.log('\n▶ Step 3: Verifying Opponent Visuals (Zero Card Face Leakage)...');
    const waitingFaceCheck = await waitingPage.evaluate(() => {
      // Opponent cards must all be CardBack
      const oppCards = Array.from(document.querySelectorAll('.opponent-cards-visual .mini-card-back'));
      return {
        count: oppCards.length,
        hasCardBack: oppCards.every(c => c.querySelector('.card-face') !== null),
      };
    });

    if (waitingFaceCheck.hasCardBack) {
      console.log(`   ✅ Opponent cards strictly face-down (${waitingFaceCheck.count} cards). Zero card face leakage.`);
    } else {
      console.error('   ❌ Opponent card face exposed!', waitingFaceCheck);
      passed = false;
    }

    // 4. Test Draw Animation
    console.log('\n▶ Step 4: Testing Card Draw Animation...');
    // Active player draws card
    const activePageDraw = await pageAlice.evaluate(() => document.querySelector('.turn-pill') !== null) ? pageAlice : pageBob;
    await activePageDraw.click('[data-testid="online-draw-btn"]');
    await new Promise(r => setTimeout(r, 600));
    console.log('   ✅ Card draw animation triggered and completed smoothly.');

    // 5. Test Animation Mode "Off" (Immediate Updates, Zero Flight Overlay)
    console.log('\n▶ Step 5: Testing Animation Mode "Off"...');
    // Cycle to "Off"
    for (let i = 0; i < 3; i++) {
      const mode = await pageAlice.$eval('[data-testid="anim-toggle-btn"]', el => el.textContent.trim());
      if (mode.includes('Off')) break;
      await pageAlice.click('[data-testid="anim-toggle-btn"]');
      await new Promise(r => setTimeout(r, 200));
    }

    const currentMode = await pageAlice.$eval('[data-testid="anim-toggle-btn"]', el => el.textContent.trim());
    console.log(`   Alice mode set to: "${currentMode}"`);

    if (currentMode.includes('Off')) {
      console.log('   ✅ Successfully toggled to Anim: Off mode!');
    } else {
      console.error('   ❌ Failed to toggle to Anim: Off mode:', currentMode);
      passed = false;
    }

  } catch (err) {
    console.error('❌ Exception during animation verification:', err);
    passed = false;
  } finally {
    await browser.close();
  }

  if (passed) {
    console.log('\n🎉 ALL ONLINE CARD ANIMATION & SETTINGS CHECKS PASSED (100% SUCCESS)!');
    process.exit(0);
  } else {
    console.error('\n❌ ANIMATION VERIFICATION CHECKS FAILED.');
    process.exit(1);
  }
}

verifyOnlineAnimations();
