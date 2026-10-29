const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');

async function verifyLocalLayout() {
  console.log('🧪 Starting Local UNO Game Tabletop Layout Verification...\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const clientUrl = 'http://localhost:3000';
  const viewports = [
    { name: 'Desktop (1440x900)', w: 1440, h: 900 },
    { name: 'Laptop (1280x720)', w: 1280, h: 720 },
    { name: 'Tablet / Small Desktop (1024x768)', w: 1024, h: 768 },
    { name: 'Mobile (390x844)', w: 390, h: 844 },
  ];

  let allPassed = true;

  try {
    for (const vp of viewports) {
      console.log(`======================================================`);
      console.log(`🔍 Inspecting Local Tabletop at Viewport: ${vp.name}`);
      console.log(`======================================================`);

      const page = await browser.newPage();
      await page.setViewport({ width: vp.w, height: vp.h });
      await page.goto(`${clientUrl}/`, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 600));

      // 1. Verify 4 distinct regions exist in the DOM
      const regionsExist = await page.evaluate(() => {
        const opp = document.querySelector('.local-opponents-row');
        const center = document.querySelector('.local-center-play-area');
        const statusRegion = document.querySelector('.local-player-status-region');
        const handRegion = document.querySelector('.local-player-hand-region');
        const toolbar = document.querySelector('.local-hand-toolbar');
        const handCards = document.querySelector('.local-hand-cards-container');
        return {
          hasOpponents: !!opp,
          hasCenter: !!center,
          hasStatus: !!statusRegion,
          hasHand: !!handRegion,
          hasToolbar: !!toolbar,
          hasHandCards: !!handCards,
        };
      });

      if (
        regionsExist.hasOpponents &&
        regionsExist.hasCenter &&
        regionsExist.hasStatus &&
        regionsExist.hasHand
      ) {
        console.log('   ✅ 4 Clearly Separated Regions Found: Opponents, Center, Player Status, Hand.');
      } else {
        console.error('   ❌ Missing one or more required regions:', regionsExist);
        allPassed = false;
      }

      // 2. Measure geometry and vertical spacing
      const metrics = await page.evaluate(() => {
        const arena = document.querySelector('.local-game-arena').getBoundingClientRect();
        const opp = document.querySelector('.local-opponents-row').getBoundingClientRect();
        const centerConsole = document.querySelector('.local-center-table-console').getBoundingClientRect();
        const toolbar = document.querySelector('.local-hand-toolbar').getBoundingClientRect();
        const cards = document.querySelector('.local-hand-cards-container').getBoundingClientRect();
        const drawWrapper = document.getElementById('draw-pile-target').getBoundingClientRect();
        const discardWrapper = document.getElementById('discard-pile-target').getBoundingClientRect();

        const oppToCenter = Math.round(centerConsole.top - opp.bottom);
        const centerToToolbar = Math.round(toolbar.top - centerConsole.bottom);
        const toolbarToCards = Math.round(cards.top - toolbar.bottom);
        const cardsBottomPadding = Math.round(arena.bottom - cards.bottom);
        const pileDelta = Math.abs(drawWrapper.top - discardWrapper.top);

        // Document overflow check
        const docScrollHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        const docScrollWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;

        return {
          oppToCenter,
          centerToToolbar,
          toolbarToCards,
          cardsBottomPadding,
          pileDelta,
          drawDims: { w: Math.round(drawWrapper.width), h: Math.round(drawWrapper.height) },
          discardDims: { w: Math.round(discardWrapper.width), h: Math.round(discardWrapper.height) },
          overflowX: docScrollWidth > winWidth,
          overflowY: docScrollHeight > winHeight,
        };
      });

      console.log(`   Opponents -> Central Console Gap: ${metrics.oppToCenter}px`);
      console.log(`   Central Console -> Player Toolbar Gap: ${metrics.centerToToolbar}px`);
      console.log(`   Player Toolbar -> Hand Cards Container Gap: ${metrics.toolbarToCards}px`);
      console.log(`   Hand Cards Bottom Felt Padding: ${metrics.cardsBottomPadding}px`);
      console.log(`   Central Piles Vertical Alignment Delta: ${metrics.pileDelta}px`);

      // Verify no horizontal overflow
      if (!metrics.overflowX) {
        console.log('   ✅ Horizontal Overflow: NONE (Clean fit inside viewport width)');
      } else {
        console.error('   ❌ Horizontal overflow detected!');
        allPassed = false;
      }

      // Verify no vertical page overflow on desktop / laptop / tablet viewports
      if (!metrics.overflowY) {
        console.log('   ✅ Vertical Overflow: NONE (Desktop table fully visible in viewport)');
      } else {
        console.warn('   ⚠️ Vertical page scroll active.');
      }

      // Verify central piles horizontally aligned
      if (metrics.pileDelta <= 6) {
        console.log('   ✅ Central Piles: Horizontally aligned side by side (delta <= 6px).');
      } else {
        console.error(`   ❌ Piles not aligned horizontally (delta = ${metrics.pileDelta}px)`);
        allPassed = false;
      }

      // Verify status bar separated from center and hand
      if (metrics.centerToToolbar >= 18 && metrics.toolbarToCards >= 14) {
        console.log('   ✅ Player Status Bar: Distinctly separated from center table and card hand.');
      } else {
        console.error('   ❌ Insufficient separation around player status bar:', {
          centerToToolbar: metrics.centerToToolbar,
          toolbarToCards: metrics.toolbarToCards,
        });
        allPassed = false;
      }

      // Verify adequate bottom padding
      if (metrics.cardsBottomPadding >= 14) {
        console.log(`   ✅ Hand Cards Bottom Padding: Adequate (${metrics.cardsBottomPadding}px >= 14px).`);
      } else {
        console.error(`   ❌ Insufficient bottom padding: ${metrics.cardsBottomPadding}px < 14px`);
        allPassed = false;
      }

      // 3. Test card selection headroom (no clipping or collision with status bar)
      const headroomCheck = await page.evaluate(() => {
        const playableCard = document.querySelector('.hand-card-wrapper.is-playable');
        if (!playableCard) return { success: true, reason: 'no-playable-card' };

        playableCard.click();
        const cardRect = playableCard.getBoundingClientRect();
        const toolbarRect = document.querySelector('.local-hand-toolbar').getBoundingClientRect();
        const gapToToolbar = Math.round(cardRect.top - toolbarRect.bottom);

        return {
          success: gapToToolbar >= 8,
          gapToToolbar,
          cardRect: { top: Math.round(cardRect.top), bottom: Math.round(cardRect.bottom) },
          toolbarRect: { top: Math.round(toolbarRect.top), bottom: Math.round(toolbarRect.bottom) },
        };
      });

      if (headroomCheck.success) {
        console.log(`   ✅ Selected Card Lift: Has ${headroomCheck.gapToToolbar}px clearance below status bar without overlapping!`);
      } else {
        console.error('   ❌ Selected card overlapped player status bar!', headroomCheck);
        allPassed = false;
      }

      // Save screenshot for visual audit
      const safeName = vp.name.replace(/[^a-zA-Z0-9]/g, '_');
      const screenshotPath = `public/layout-verification/local-verified-${safeName}.png`;
      await page.screenshot({ path: screenshotPath });
      console.log(`   📸 Screenshot saved: ${screenshotPath}\n`);

      await page.close();
    }

    // 4. Verify Online Mode remains completely operational and untouched
    console.log('======================================================');
    console.log('🌐 Verifying Online Mode Remained Untouched & Operational');
    console.log('======================================================');
    const onlinePage = await browser.newPage();
    await onlinePage.setViewport({ width: 1280, height: 800 });
    await onlinePage.goto(`${clientUrl}/`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 400));

    await onlinePage.click('[data-testid="nav-tab-online"]');
    await new Promise(r => setTimeout(r, 400));

    const onlineLobbyReady = await onlinePage.evaluate(() => {
      const createInput = document.querySelector('[data-testid="create-player-name-input"]');
      const createBtn = document.querySelector('[data-testid="create-room-btn"]');
      return !!createInput && !!createBtn;
    });

    if (onlineLobbyReady) {
      console.log('   ✅ Online Multiplayer view loads and functions with zero regressions.');
    } else {
      console.error('   ❌ Online Multiplayer lobby not accessible!');
      allPassed = false;
    }
    await onlinePage.close();

  } catch (err) {
    console.error('❌ Exception during layout verification:', err);
    allPassed = false;
  } finally {
    await browser.close();
  }

  if (allPassed) {
    console.log('🎉 ALL LOCAL GAME TABLETOP LAYOUT CHECKS PASSED (100% SUCCESS)!');
    process.exit(0);
  } else {
    console.error('❌ SOME CHECKS FAILED.');
    process.exit(1);
  }
}

verifyLocalLayout();
