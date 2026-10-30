const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');
const path = require('path');

async function verifyLogo() {
  console.log('🧪 Verifying Nano Banana Logo rendering in App Navbar...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));

  // Check logo image element
  const logoEl = await page.$('.brand-logo-img');
  if (!logoEl) {
    console.error('❌ .brand-logo-img not found in DOM!');
    process.exit(1);
  }

  const logoDetails = await page.evaluate(el => {
    return {
      src: el.src,
      complete: el.complete,
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
      clientWidth: el.clientWidth,
      clientHeight: el.clientHeight,
    };
  }, logoEl);

  console.log('Logo Image Details:', logoDetails);

  if (!logoDetails.complete || logoDetails.naturalWidth === 0) {
    console.error('❌ Logo image failed to load or has 0 naturalWidth!');
    process.exit(1);
  }
  console.log('✅ Nano Banana logo image loaded successfully!');

  // Take screenshot of desktop navbar
  const desktopScreenshot = path.resolve('public/layout-verification/nano-banana-logo-desktop.png');
  await page.screenshot({ path: desktopScreenshot, clip: { x: 0, y: 0, width: 1280, height: 70 } });
  console.log(`📸 Desktop navbar screenshot saved: ${desktopScreenshot}`);

  // Test mobile navbar
  await page.setViewport({ width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 400));
  const mobileScreenshot = path.resolve('public/layout-verification/nano-banana-logo-mobile.png');
  await page.screenshot({ path: mobileScreenshot, clip: { x: 0, y: 0, width: 390, height: 60 } });
  console.log(`📸 Mobile navbar screenshot saved: ${mobileScreenshot}`);

  await browser.close();
  console.log('🎉 ALL LOGO CHECKS PASSED!');
}

verifyLogo().catch(err => {
  console.error(err);
  process.exit(1);
});
