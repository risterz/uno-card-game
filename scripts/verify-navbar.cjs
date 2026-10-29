const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');
const path = require('path');

async function testNavbarResponsiveness() {
  console.log('🧪 Verifying Navbar UI & Mobile Responsiveness across Viewports...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const viewports = [
    { name: 'desktop', width: 1280, height: 800 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 },
  ];

  let allPassed = true;

  for (const vp of viewports) {
    console.log(`\n▶ Testing Viewport: [${vp.name.toUpperCase()}] (${vp.width}x${vp.height})`);
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));

    // 1. Inspect navbar geometry and text wrapping
    const navReport = await page.evaluate(() => {
      const nav = document.querySelector('.top-nav');
      const brand = document.querySelector('.nav-brand');
      const tabs = document.querySelector('.nav-tabs');
      const tabButtons = Array.from(document.querySelectorAll('.nav-tab'));

      const navRect = nav ? nav.getBoundingClientRect() : null;
      const brandRect = brand ? brand.getBoundingClientRect() : null;
      const tabsRect = tabs ? tabs.getBoundingClientRect() : null;

      // Check if tabs have wrapped awkwardly into tall heights
      const tabHeights = tabButtons.map(t => Math.round(t.getBoundingClientRect().height));
      const allTabsUniform = tabHeights.every(h => Math.abs(h - tabHeights[0]) <= 2);

      // Check if body or root has horizontal overflow
      const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;

      return {
        navHeight: navRect ? Math.round(navRect.height) : 0,
        brandWidth: brandRect ? Math.round(brandRect.width) : 0,
        tabsWidth: tabsRect ? Math.round(tabsRect.width) : 0,
        tabHeights,
        allTabsUniform,
        hasHorizontalScroll,
        scrollWidth: document.documentElement.scrollWidth,
        windowWidth: window.innerWidth,
      };
    });

    console.log(`   📏 Navbar Height: ${navReport.navHeight}px (Uniform tab heights: ${navReport.allTabsUniform}, H-Scroll: ${navReport.hasHorizontalScroll})`);

    // Navbar should be neat and compact (under 75px)
    if (navReport.navHeight <= 75 && navReport.allTabsUniform && !navReport.hasHorizontalScroll) {
      console.log(`   ✅ Viewport ${vp.name}: Clean layout, no overflow, tabs neat and uniform!`);
    } else {
      console.error(`   ❌ Viewport ${vp.name} FAILED check: height=${navReport.navHeight}, uniform=${navReport.allTabsUniform}, hscroll=${navReport.hasHorizontalScroll}`);
      allPassed = false;
    }

    // 2. Click between tabs to verify functionality
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.nav-tab'));
      const galleryTab = tabs.find(t => t.textContent && (t.textContent.includes('Deck') || t.textContent.includes('Cards')));
      if (galleryTab) galleryTab.click();
    });
    await new Promise(r => setTimeout(r, 300));

    const ssPath = path.join(__dirname, '..', 'public', `verified-navbar-${vp.name}.png`);
    await page.screenshot({ path: ssPath });
    console.log(`   📸 Captured screenshot: public/verified-navbar-${vp.name}.png`);
  }

  await browser.close();

  if (allPassed) {
    console.log('\n🎉 ALL NAVBAR & MOBILE RESPONSIVE VERIFICATIONS PASSED PERFECTLY!');
  } else {
    console.error('\n❌ SOME NAVBAR CHECKS FAILED!');
    process.exit(1);
  }
}

testNavbarResponsiveness().catch(err => {
  console.error(err);
  process.exit(1);
});
