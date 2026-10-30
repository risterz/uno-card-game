const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');

async function verifyHouseRulesUI() {
  console.log('--- Verifying House Rules UI & Modifiers ---');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));

    // Open settings modal (button is "Match Setup")
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('Match Setup'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Verify modal contains all 3 house rules
    const modalText = await page.evaluate(() => document.querySelector('.modal-body')?.textContent || '');
    console.log('Modal text found. Length:', modalText.length);

    const hasStacking = modalText.includes('Draw Stacking');
    const hasSevenZero = modalText.includes('7-0 Rule');
    const hasJumpIn = modalText.includes('Jump-In Rule');

    console.log(`- Stacking toggle found: ${hasStacking}`);
    console.log(`- 7-0 Rule toggle found: ${hasSevenZero}`);
    console.log(`- Jump-In toggle found: ${hasJumpIn}`);

    if (!hasStacking || !hasSevenZero || !hasJumpIn) {
      throw new Error('One or more house rules toggles missing from settings modal!');
    }

    console.log('✅ ALL HOUSE RULES UI COMPONENTS VERIFIED PERFECTLY!');
  } finally {
    await browser.close();
  }
}

verifyHouseRulesUI().catch(e => {
  console.error(e);
  process.exit(1);
});
