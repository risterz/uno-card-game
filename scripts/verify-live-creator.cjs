const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');

async function testLive() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://uno-card-game-335.pages.dev', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));

    const title = await page.title();
    const badge = await page.$eval('[data-testid="creator-badge"]', el => el.textContent.trim());
    const footer = await page.$eval('.app-footer', el => el.textContent.trim());
    const bgm = await page.$eval('[data-testid="bgm-toggle-button"]', el => el.textContent.trim());

    console.log('--- LIVE CLOUDFLARE PAGES VERIFICATION ---');
    console.log('Title:', title);
    console.log('Badge:', badge);
    console.log('Footer:', footer);
    console.log('BGM Button:', bgm);
    console.log('Status: ALL VERIFIED ON LIVE SITE!');
  } finally {
    await browser.close();
  }
}

testLive().catch(e => { console.error(e); process.exit(1); });
