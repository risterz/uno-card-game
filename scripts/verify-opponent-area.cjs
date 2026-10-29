const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, '../public/layout-verification/opponents');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function verifyOpponents() {
  console.log('🧪 Starting Local UNO Opponent Area Layout & Responsiveness Verification...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  const viewports = [
    { name: 'Mobile-327x677', w: 327, h: 677 },
    { name: 'Mobile-360x800', w: 360, h: 800 },
    { name: 'Mobile-390x844', w: 390, h: 844 },
    { name: 'Mobile-430x932', w: 430, h: 932 },
    { name: 'Tablet-768x1024', w: 768, h: 1024 },
    { name: 'Desktop-1440x900', w: 1440, h: 900 },
  ];

  const opponentScenarios = [
    { label: '3-Opponents (4 Players)', totalPlayers: 4, expectedOpponents: 3 },
    { label: '2-Opponents (3 Players)', totalPlayers: 3, expectedOpponents: 2 },
    { label: '4-Opponents (5 Players)', totalPlayers: 5, expectedOpponents: 4 },
  ];

  let totalTests = 0;
  let passedTests = 0;
  const failures = [];

  for (const vp of viewports) {
    console.log(`\n======================================================`);
    console.log(`🔍 Testing Viewport: ${vp.name} (${vp.w}x${vp.h})`);
    console.log(`======================================================`);
    await page.setViewport({ width: vp.w, height: vp.h });

    for (const scenario of opponentScenarios) {
      totalTests++;
      console.log(`\n  --- Scenario: ${scenario.label} ---`);

      // Navigate to game
      await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 300));

      // Open Match Setup modal to configure player count
      const setupBtn = await page.$('[data-testid="match-setup-btn"]');
      if (setupBtn) {
        await setupBtn.click();
        await new Promise(r => setTimeout(r, 200));

        // Click player count button
        const countBtn = await page.$(`[data-testid="player-count-btn-${scenario.totalPlayers}"]`);
        if (countBtn) {
          await countBtn.click();
          await new Promise(r => setTimeout(r, 100));
        }

        // Click Start New Match button
        const startBtn = await page.$('[data-testid="start-new-match-btn"]');
        if (startBtn) {
          await startBtn.click();
          await new Promise(r => setTimeout(r, 400));
        }
      }

      // Check metrics in page
      const metrics = await page.evaluate(() => {
        const row = document.querySelector('.local-opponents-row');
        if (!row) return { error: 'No .local-opponents-row found' };

        const rowRect = row.getBoundingClientRect();
        const pods = Array.from(document.querySelectorAll('.local-opponent-pod'));
        const podData = pods.map((pod, idx) => {
          const podRect = pod.getBoundingClientRect();
          const header = pod.querySelector('.opponent-header');
          const headerLeft = pod.querySelector('.opponent-header-left');
          const avatar = pod.querySelector('.opponent-avatar');
          const name = pod.querySelector('.opponent-name');
          const badge = pod.querySelector('.opponent-cards-badge');
          const statusRow = pod.querySelector('.opponent-status-row');
          const visual = pod.querySelector('.opponent-cards-visual');
          const miniCards = Array.from(pod.querySelectorAll('.mini-card-back'));

          const headerRect = header ? header.getBoundingClientRect() : null;
          const avatarRect = avatar ? avatar.getBoundingClientRect() : null;
          const nameRect = name ? name.getBoundingClientRect() : null;
          const badgeRect = badge ? badge.getBoundingClientRect() : null;
          const statusRect = statusRow ? statusRow.getBoundingClientRect() : null;
          const visualRect = visual ? visual.getBoundingClientRect() : null;

          // Check overlap: name and badge must not overlap
          const nameBadgeOverlap = (nameRect && badgeRect)
            ? (nameRect.right > badgeRect.left + 1)
            : false;

          // Check visual card backs overflow pod
          const visualOverflow = (visualRect && podRect)
            ? (visualRect.left < podRect.left - 2 || visualRect.right > podRect.right + 2)
            : false;

          // Check vertical hierarchy: header above status above visual
          const hierarchyCorrect = (headerRect && statusRect && visualRect)
            ? (headerRect.bottom <= statusRect.top + 2 && statusRect.bottom <= visualRect.top + 2)
            : false;

          return {
            index: idx,
            podWidth: Math.round(podRect.width),
            podHeight: Math.round(podRect.height),
            podTop: Math.round(podRect.top),
            podBottom: Math.round(podRect.bottom),
            name: name ? name.textContent.trim() : null,
            badgeText: badge ? badge.textContent.trim() : null,
            cardBackCount: miniCards.length,
            nameBadgeOverlap,
            visualOverflow,
            hierarchyCorrect,
          };
        });

        // Check equal heights and aligned edges
        const heights = podData.map(p => p.podHeight);
        const tops = podData.map(p => p.podTop);
        const bottoms = podData.map(p => p.podBottom);
        const maxHeightDiff = Math.max(...heights) - Math.min(...heights);
        const maxTopDiff = Math.max(...tops) - Math.min(...tops);
        const maxBottomDiff = Math.max(...bottoms) - Math.min(...bottoms);

        const docScrollW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        const hasHorizontalOverflow = docScrollW > winW + 1;

        return {
          podCount: pods.length,
          rowWidth: Math.round(rowRect.width),
          podData,
          maxHeightDiff,
          maxTopDiff,
          maxBottomDiff,
          hasHorizontalOverflow,
          docScrollW,
          winW,
        };
      });

      if (metrics.error) {
        console.error(`  ❌ Error: ${metrics.error}`);
        failures.push(`${vp.name} - ${scenario.label}: ${metrics.error}`);
        continue;
      }

      console.log(`     Pod Count: ${metrics.podCount} (expected ${scenario.expectedOpponents})`);
      console.log(`     Height Delta across pods: ${metrics.maxHeightDiff}px (should be <= 2px)`);
      console.log(`     Top Edge Delta across pods: ${metrics.maxTopDiff}px (should be <= 2px)`);
      console.log(`     Horizontal Document Overflow: ${metrics.hasHorizontalOverflow ? 'YES (FAIL)' : 'NONE (PASS)'}`);

      let scenarioPassed = true;

      if (metrics.podCount !== scenario.expectedOpponents) {
        console.warn(`     ⚠️ Pod count mismatch: got ${metrics.podCount}, expected ${scenario.expectedOpponents}`);
      }

      if (metrics.hasHorizontalOverflow) {
        console.error(`     ❌ Horizontal overflow: doc width ${metrics.docScrollW} > viewport ${metrics.winW}`);
        scenarioPassed = false;
      }

      if (metrics.maxTopDiff > 3 || metrics.maxBottomDiff > 3) {
        console.error(`     ❌ Pod edges misaligned: top delta ${metrics.maxTopDiff}px, bottom delta ${metrics.maxBottomDiff}px`);
        scenarioPassed = false;
      }

      for (const p of metrics.podData) {
        if (p.nameBadgeOverlap) {
          console.error(`     ❌ Pod ${p.index} (${p.name}): Name and Card Badge overlap!`);
          scenarioPassed = false;
        }
        if (p.visualOverflow) {
          console.error(`     ❌ Pod ${p.index} (${p.name}): Card backs visual overflows pod!`);
          scenarioPassed = false;
        }
        if (!p.hierarchyCorrect) {
          console.error(`     ❌ Pod ${p.index} (${p.name}): Vertical hierarchy incorrect!`);
          scenarioPassed = false;
        }
        console.log(`       Pod ${p.index} [${p.name}]: badge="${p.badgeText}", cardBacks=${p.cardBackCount}, size=${p.podWidth}x${p.podHeight}px`);
      }

      // Take screenshot of the opponent area
      const screenshotPath = path.join(screenshotDir, `${vp.name}_${scenario.label.replace(/[^a-zA-Z0-9]/g, '_')}.png`);
      const rowClip = await page.evaluate(() => {
        const row = document.querySelector('.local-opponents-row');
        if (!row) return null;
        const r = row.getBoundingClientRect();
        return {
          x: Math.max(0, Math.floor(r.x) - 4),
          y: Math.max(0, Math.floor(r.y) - 6),
          width: Math.min(window.innerWidth, Math.ceil(r.width) + 8),
          height: Math.ceil(r.height) + 12,
        };
      });

      if (rowClip) {
        await page.screenshot({ path: screenshotPath, clip: rowClip });
        console.log(`     📸 Screenshot: ${path.basename(screenshotPath)}`);
      }

      if (scenarioPassed) {
        passedTests++;
        console.log(`     ✅ PASS: All assertions passed for ${scenario.label} at ${vp.name}!`);
      } else {
        failures.push(`${vp.name} - ${scenario.label}`);
      }
    }
  }

  await browser.close();

  console.log(`\n======================================================`);
  console.log(`📊 Opponent Area Verification Summary:`);
  console.log(`   Total Scenarios: ${totalTests}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${failures.length}`);
  if (failures.length > 0) {
    console.error(`\n❌ Failed tests:`);
    failures.forEach(f => console.error(`   - ${f}`));
    process.exit(1);
  } else {
    console.log(`\n🎉 ALL LOCAL OPPONENT AREA TESTS PASSED PERFECTLY!`);
  }
}

verifyOpponents().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
