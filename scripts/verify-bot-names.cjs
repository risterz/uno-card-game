const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');

async function verifyBotNames() {
  console.log('Verifying bot names: Syifa, Umairah, Harraz...');
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

    // Open settings modal to configure 4 players
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const settingsBtn = btns.find(b => b.title && b.title.includes('Settings')) ||
        btns.find(b => b.textContent && b.textContent.includes('Settings'));
      if (settingsBtn) settingsBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Select 4 players in settings modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn4 = btns.find(b => b.textContent && b.textContent.includes('4 Players'));
      if (btn4) btn4.click();
      const startBtn = document.querySelector('[data-testid="start-new-match-btn"]') ||
        btns.find(b => b.textContent && b.textContent.includes('Start New Match'));
      if (startBtn) (startBtn).click();
    });
    await new Promise(r => setTimeout(r, 600));

    const opponentNames = await page.$$eval('.opponent-name', els => els.map(e => e.textContent.trim()));
    console.log('Opponent names displayed on game board:', opponentNames);

    const hasSyifa = opponentNames.includes('Syifa');
    const hasUmairah = opponentNames.includes('Umairah');
    const hasHarraz = opponentNames.includes('Harraz');

    console.log(`Found Syifa: ${hasSyifa}`);
    console.log(`Found Umairah: ${hasUmairah}`);
    console.log(`Found Harraz: ${hasHarraz}`);

    if (!hasSyifa || !hasUmairah || !hasHarraz) {
      throw new Error(`Bot names mismatch! Found: ${opponentNames.join(', ')}`);
    }

    console.log('✅ ALL BOT NAMES VERIFIED: Syifa, Umairah, Harraz!');
  } finally {
    await browser.close();
  }
}

verifyBotNames().catch(e => {
  console.error(e);
  process.exit(1);
});
