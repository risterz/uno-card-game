const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');
const path = require('path');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });

  // Wait 1 second for react to stabilize
  await new Promise(r => setTimeout(r, 1000));

  const info = await page.evaluate(() => {
    const handSection = document.querySelector('.human-hand-section');
    const handContainer = document.querySelector('.hand-cards-container');
    const cards = document.querySelectorAll('.hand-card-wrapper');
    const cardWrappers = document.querySelectorAll('.hand-cards-container .card-wrapper');

    return {
      handSectionRect: handSection ? handSection.getBoundingClientRect() : null,
      handContainerRect: handContainer ? handContainer.getBoundingClientRect() : null,
      cardCount: cards.length,
      cardWrapperCount: cardWrappers.length,
      cardsRects: Array.from(cards).map(c => {
        const r = c.getBoundingClientRect();
        const style = window.getComputedStyle(c);
        return {
          x: r.x, y: r.y, width: r.width, height: r.height,
          display: style.display, visibility: style.visibility, opacity: style.opacity
        };
      })
    };
  });

  console.log('Inspection Result:', JSON.stringify(info, null, 2));

  const screenshotPath = path.join(__dirname, '..', 'public', 'debug-screenshot.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to:', screenshotPath);

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
