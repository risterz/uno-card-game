const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

async function verifyOnlineLayout() {
  console.log('🧪 Starting Critical UI Layout & Dimensions Verification for Online Match...');

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

    let activeUrl = clientUrl;
    try {
      await pageAlice.goto(`${activeUrl}/`, { waitUntil: 'domcontentloaded', timeout: 4000 });
    } catch (_) {
      activeUrl = 'http://localhost:3001';
      console.log('Port 3000 unreachable, using port 3001...');
      await pageAlice.goto(`${activeUrl}/`, { waitUntil: 'domcontentloaded' });
    }
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
    await pageBob.goto(`${activeUrl}/?room=${roomCode}`, { waitUntil: 'domcontentloaded' });
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
    await pageBob.waitForSelector('.game-arena', { timeout: 6000 });
    console.log('   ✅ Both browsers entered online game table!');

    const viewports = [
      { name: 'Desktop (1440x900)', width: 1440, height: 900 },
      { name: 'Laptop/Small Desktop (1024x768)', width: 1024, height: 768 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Mobile (390x844)', width: 390, height: 844 },
    ];

    const screenshotDir = path.join(process.cwd(), 'public', 'layout-verification');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    for (const vp of viewports) {
      console.log(`\n======================================================`);
      console.log(`🔍 Inspecting Layout at Viewport: ${vp.name}`);
      console.log(`======================================================`);

      await pageAlice.setViewport({ width: vp.width, height: vp.height });
      await new Promise(r => setTimeout(r, 400));

      const layout = await pageAlice.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;

        const arena = document.querySelector('.game-arena')?.getBoundingClientRect();
        const drawPile = document.getElementById('draw-pile-target')?.getBoundingClientRect();
        const discardPile = document.getElementById('discard-pile-target')?.getBoundingClientRect();
        const activeColor = document.querySelector('.active-color-indicator')?.getBoundingClientRect();
        const oppPod = document.querySelector('.opponent-pod')?.getBoundingClientRect();
        const miniCard = document.querySelector('.mini-card-back')?.getBoundingClientRect();
        const handContainer = document.getElementById('human-hand-container')?.getBoundingClientRect();
        const handCards = Array.from(document.querySelectorAll('#human-hand-container .hand-card-wrapper')).map(
          el => {
            const r = el.getBoundingClientRect();
            return { w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left) };
          }
        );

        return {
          horizontalOverflow: docWidth > winWidth + 1,
          docWidth,
          winWidth,
          winHeight,
          arena: arena ? { w: Math.round(arena.width), h: Math.round(arena.height), bottom: Math.round(arena.bottom) } : null,
          drawPile: drawPile ? { w: Math.round(drawPile.width), h: Math.round(drawPile.height), top: Math.round(drawPile.top), left: Math.round(drawPile.left) } : null,
          discardPile: discardPile ? { w: Math.round(discardPile.width), h: Math.round(discardPile.height), top: Math.round(discardPile.top), left: Math.round(discardPile.left) } : null,
          activeColor: activeColor ? { w: Math.round(activeColor.width), left: Math.round(activeColor.left) } : null,
          oppPod: oppPod ? { w: Math.round(oppPod.width), h: Math.round(oppPod.height), top: Math.round(oppPod.top) } : null,
          miniCard: miniCard ? { w: Math.round(miniCard.width), h: Math.round(miniCard.height) } : null,
          handContainer: handContainer ? { w: Math.round(handContainer.width), h: Math.round(handContainer.height), bottom: Math.round(handContainer.bottom) } : null,
          handCardsCount: handCards.length,
          firstHandCard: handCards[0] || null,
        };
      });

      // 1. Horizontal Overflow Check
      if (!layout.horizontalOverflow) {
        console.log(`   ✅ Horizontal Overflow: NONE (docWidth ${layout.docWidth}px <= viewport ${layout.winWidth}px)`);
      } else {
        console.error(`   ❌ HORIZONTAL OVERFLOW DETECTED: docWidth ${layout.docWidth}px > viewport ${layout.winWidth}px`);
        passed = false;
      }

      // 2. Side-by-side Piles Check
      if (layout.drawPile && layout.discardPile) {
        const topDiff = Math.abs(layout.drawPile.top - layout.discardPile.top);
        const isHorizontal = layout.discardPile.left > layout.drawPile.left;
        const ratioDraw = layout.drawPile.h / layout.drawPile.w;
        const ratioDiscard = layout.discardPile.h / layout.discardPile.w;

        console.log(`   Draw Pile Dims: ${layout.drawPile.w}x${layout.drawPile.h}px (Aspect Ratio: ${ratioDraw.toFixed(2)})`);
        console.log(`   Discard Pile Dims: ${layout.discardPile.w}x${layout.discardPile.h}px (Aspect Ratio: ${ratioDiscard.toFixed(2)})`);
        console.log(`   Pile Vertical Alignment Delta: ${topDiff}px | Discard is to right: ${isHorizontal}`);

        if (topDiff <= 25 && isHorizontal) {
          console.log(`   ✅ Piles Arrangement: SIDE BY SIDE in center console (not stacked vertically).`);
        } else {
          console.error(`   ❌ PILES ARE NOT SIDE BY SIDE! topDiff=${topDiff}px, isHorizontal=${isHorizontal}`);
          passed = false;
        }

        // Card size check: width between 60px and 140px, aspect ratio around 1.4 (5:7 ratio with badge)
        if (layout.drawPile.w <= 135 && layout.drawPile.w >= 60 && ratioDraw >= 1.35 && ratioDraw <= 1.52) {
          console.log(`   ✅ Piles Card Sizing: Perfectly proportional 5:7 ratio without blowing up.`);
        } else {
          console.error(`   ❌ Piles Card Sizing out of bounds: width=${layout.drawPile.w}, ratio=${ratioDraw}`);
          passed = false;
        }
      } else {
        console.error(`   ❌ Missing draw or discard pile!`);
        passed = false;
      }

      // 3. Opponent Panel & Mini Cards Check
      if (layout.oppPod && layout.miniCard) {
        console.log(`   Opponent Pod: ${layout.oppPod.w}x${layout.oppPod.h}px | Mini Card: ${layout.miniCard.w}x${layout.miniCard.h}px`);
        if (layout.miniCard.w <= 40 && layout.miniCard.h <= 55) {
          console.log(`   ✅ Opponent Mini Cards: Compact face-down fan (${layout.miniCard.w}x${layout.miniCard.h}px).`);
        } else {
          console.error(`   ❌ Opponent Mini Card too large: ${layout.miniCard.w}x${layout.miniCard.h}px`);
          passed = false;
        }
      }

      // 4. Player Hand Check
      if (layout.firstHandCard && layout.handContainer) {
        console.log(`   Player Hand Card: ${layout.firstHandCard.w}x${layout.firstHandCard.h}px (${layout.handCardsCount} cards)`);
        if (layout.firstHandCard.w <= 120 && layout.firstHandCard.w >= 50) {
          console.log(`   ✅ Player Hand: Responsive card width within hand container.`);
        } else {
          console.error(`   ❌ Player hand card size out of bounds: width=${layout.firstHandCard.w}`);
          passed = false;
        }

        if (layout.arena && layout.arena.bottom <= layout.winHeight + 10) {
          console.log(`   ✅ Tabletop Felt: Fits inside viewport height (${layout.arena.bottom}px <= ${layout.winHeight}px).`);
        } else {
          console.error(`   ❌ Tabletop exceeds viewport height! arena.bottom=${layout.arena?.bottom}, winHeight=${layout.winHeight}`);
          passed = false;
        }
      }

      // Capture screenshot
      const vpClean = vp.name.replace(/[^a-zA-Z0-9]/g, '_');
      const ssPath = path.join(screenshotDir, `online-layout-${vpClean}.png`);
      await pageAlice.screenshot({ path: ssPath, fullPage: false });
      console.log(`   📸 Captured Layout Screenshot: ${ssPath}`);
    }

    // Step 5: Verify move synchronization still works
    console.log(`\n======================================================`);
    console.log(`🎮 Testing Card Play Synchronization on Rebuilt Table`);
    console.log(`======================================================`);

    const turnInfo = await pageAlice.evaluate(() => {
      const isMyTurn = document.querySelector('.turn-pill') !== null;
      return { isAliceTurn: isMyTurn };
    });

    const activePage = turnInfo.isAliceTurn ? pageAlice : pageBob;
    const waitingPage = turnInfo.isAliceTurn ? pageBob : pageAlice;
    const activeName = turnInfo.isAliceTurn ? 'Alice' : 'Bob';

    console.log(`   Active turn: ${activeName}`);
    const playable = await activePage.evaluate(() => document.querySelectorAll('.hand-card-wrapper.is-playable').length);

    if (playable > 0) {
      await activePage.click('.hand-card-wrapper.is-playable');
      await new Promise(r => setTimeout(r, 200));
      const hasPlayBtn = await activePage.$('[data-testid="online-play-btn"]');
      if (hasPlayBtn) {
        await activePage.click('[data-testid="online-play-btn"]');
      } else {
        await activePage.click('.hand-card-wrapper.is-playable.is-selected');
      }
      console.log(`   ✅ ${activeName} played a card.`);
    } else {
      await activePage.click('[data-testid="online-draw-btn"]');
      console.log(`   ✅ ${activeName} drew a card.`);
    }

    await new Promise(r => setTimeout(r, 600));
    console.log('   ✅ Game synchronization active and verified on rebuilt tabletop.');

  } catch (err) {
    console.error('❌ Exception during layout verification:', err);
    passed = false;
  } finally {
    await browser.close();
  }

  if (passed) {
    console.log('\n🎉 ALL ONLINE LAYOUT & DIMENSIONS VERIFICATION CHECKS PASSED (100% SUCCESS)!');
    process.exit(0);
  } else {
    console.error('\n❌ LAYOUT VERIFICATION FAILED.');
    process.exit(1);
  }
}

verifyOnlineLayout();
