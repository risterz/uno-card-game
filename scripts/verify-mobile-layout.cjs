const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');

async function testMobile() {
  console.log('Testing Mobile Layout at 327x677 and standard mobile viewports...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 327, height: 677 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  for (const cnt of [1, 7, 13, 20]) {
    await page.click(`[data-testid='test-hand-btn-${cnt}']`);
    await new Promise(r => setTimeout(r, 300));
    const res = await page.evaluate((c) => {
      const cards = Array.from(document.querySelectorAll('.hand-card-wrapper')).map(el => {
        const r = el.getBoundingClientRect();
        return {
          left: Math.round(r.left),
          right: Math.round(r.right),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
        };
      });
      const first = cards[0];
      const last = cards[cards.length - 1];
      return {
        count: c,
        renderedCount: cards.length,
        firstLeft: first ? first.left : null,
        lastRight: last ? last.right : null,
        bottomPadding: first ? (window.innerHeight - first.bottom) : null,
        docScrollWidth: document.documentElement.scrollWidth,
        docScrollHeight: document.documentElement.scrollHeight,
      };
    }, cnt);
    console.log(`Test Hand ${cnt}:`, res);
  }

  // Click card to test selection lift
  const cardToClick = await page.$('.hand-card-wrapper.is-playable');
  if (cardToClick) {
    await cardToClick.click();
    await new Promise(r => setTimeout(r, 200));
    const selMetric = await page.evaluate(() => {
      const sel = document.querySelector('.hand-card-wrapper.is-selected');
      const toolbar = document.querySelector('.local-hand-toolbar').getBoundingClientRect();
      if (!sel) return null;
      const r = sel.getBoundingClientRect();
      return {
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        toolbarBottom: Math.round(toolbar.bottom),
        gapToToolbar: Math.round(r.top - toolbar.bottom),
        bottomPadding: Math.round(window.innerHeight - r.bottom),
      };
    });
    console.log('Selected Card Lift Metric:', selMetric);
  }

  // Now test multiple viewports
  const viewports = [
    { name: 'Narrow Mobile (327x677)', w: 327, h: 677 },
    { name: 'Android Small (360x800)', w: 360, h: 800 },
    { name: 'iPhone 14 (390x844)', w: 390, h: 844 },
    { name: 'iPhone Pro Max (430x932)', w: 430, h: 932 },
    { name: 'Tablet (768x1024)', w: 768, h: 1024 },
  ];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.w, height: vp.h });
    await new Promise(r => setTimeout(r, 400));
    const metrics = await page.evaluate(() => {
      const scrollW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const scrollH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const topBar = document.querySelector('.game-top-bar').getBoundingClientRect();
      const statusRow = document.querySelector('.game-status-row').getBoundingClientRect();
      const controls = document.querySelector('.game-controls-group').getBoundingClientRect();
      const firstCard = document.querySelector('.hand-card-wrapper')?.getBoundingClientRect();

      return {
        overflowX: scrollW > winW,
        scrollW,
        winW,
        scrollH,
        winH,
        topBarHeight: Math.round(topBar.height),
        topBarOverlap: Math.round(statusRow.bottom - controls.top) > 1,
        bottomPadding: firstCard ? Math.round(winH - firstCard.bottom) : null,
      };
    });
    console.log(`Viewport ${vp.name}:`, metrics);
    await page.screenshot({ path: `public/layout-verification/mobile-test-${vp.w}x${vp.h}.png` });
  }

  await browser.close();
  console.log('Mobile verification completed successfully.');
}

testMobile().catch(err => {
  console.error(err);
  process.exit(1);
});
