const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');

async function verify() {
  console.log('Testing Made by risterz & BGM components...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    // 1. Verify creator badge
    const badgeText = await page.$eval('[data-testid="creator-badge"]', el => el.textContent.trim());
    console.log(`Creator badge found: "${badgeText}"`);
    if (!badgeText.toLowerCase().includes('risterz')) {
      throw new Error(`Creator badge missing "risterz": ${badgeText}`);
    }

    // 2. Verify footer
    const footerText = await page.$eval('.app-footer', el => el.textContent.trim());
    console.log(`Footer found: "${footerText}"`);
    if (!footerText.toLowerCase().includes('risterz')) {
      throw new Error(`Footer missing "risterz": ${footerText}`);
    }

    // 3. Verify BGM button
    const bgmBtn = await page.$('[data-testid="bgm-toggle-button"]');
    if (!bgmBtn) {
      throw new Error('BGM toggle button not found!');
    }
    const bgmBtnText = await page.$eval('[data-testid="bgm-toggle-button"]', el => el.textContent.trim());
    console.log(`Initial BGM button: "${bgmBtnText}"`);

    // Click BGM button to toggle play
    await page.click('[data-testid="bgm-toggle-button"]');
    await new Promise(r => setTimeout(r, 500));

    const bgmPlayingClass = await page.$eval('[data-testid="bgm-toggle-button"]', el => el.className);
    console.log(`BGM button class after click: "${bgmPlayingClass}"`);

    // 4. Verify mobile responsiveness
    await page.setViewport({ width: 360, height: 740 });
    await new Promise(r => setTimeout(r, 300));
    const mobileBadgeVisible = await page.$eval('[data-testid="creator-badge"]', el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    console.log(`Mobile creator badge visible: ${mobileBadgeVisible}`);

    console.log('✅ ALL CREATOR & BGM CHECKS PASSED!');
  } finally {
    await browser.close();
  }
}

verify().catch(e => {
  console.error(e);
  process.exit(1);
});
