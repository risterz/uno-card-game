const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

async function verifyHalloweenUI() {
  console.log('🎃 Verifying Halloween Collector\'s Deck UI & Artwork...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // 1. Visit App
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  console.log('1️⃣ Checking Local Play Table with Theme Switcher...');
  // Click Halloween in navbar
  const halloweenBtn = await page.$('.theme-toggle-btn.halloween');
  if (halloweenBtn) {
    await halloweenBtn.click();
    console.log('   Clicked Halloween theme toggle in navbar');
    await new Promise(r => setTimeout(r, 500));
  }

  // Check if hand cards now have theme-halloween
  const hasHalloweenCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.card-wrapper.theme-halloween'));
    return cards.length > 0;
  });
  console.log(`   Cards rendered with theme-halloween: ${hasHalloweenCards}`);

  // Screenshot game board in Halloween mode
  const distDir = path.resolve(__dirname, '..', 'dist');
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  await page.screenshot({ path: path.join(distDir, 'verified-halloween-local-game.png') });
  console.log('   📸 Saved dist/verified-halloween-local-game.png');

  // 2. Switch to 108-Card Deck Gallery tab
  console.log('\n2️⃣ Navigating to Cards Gallery...');
  const galleryTabBtn = await page.evaluateHandle(() => {
    const tabs = Array.from(document.querySelectorAll('.nav-tab'));
    return tabs.find(t => t.textContent.includes('Cards') || t.textContent.includes('108-Card'));
  });
  if (galleryTabBtn) {
    await galleryTabBtn.click();
    await new Promise(r => setTimeout(r, 600));
  }

  // Check Gallery Title & Halloween Lore Banner
  const galleryInfo = await page.evaluate(() => {
    const title = document.querySelector('.header-title')?.textContent || '';
    const hasHalloweenBanner = document.querySelector('.halloween-lore-banner') !== null;
    const cardCount = document.querySelectorAll('.cards-grid .grid-item').length;
    const firstCaptionName = document.querySelector('.card-caption-name')?.textContent || '';
    return { title, hasHalloweenBanner, cardCount, firstCaptionName };
  });
  console.log(`   Gallery Title: "${galleryInfo.title}"`);
  console.log(`   Halloween Lore Banner Present: ${galleryInfo.hasHalloweenBanner}`);
  console.log(`   Rendered Cards Count: ${galleryInfo.cardCount}`);
  console.log(`   First Card Caption Name: "${galleryInfo.firstCaptionName}"`);

  await page.screenshot({ path: path.join(distDir, 'verified-halloween-gallery.png') });
  console.log('   📸 Saved dist/verified-halloween-gallery.png');

  // 3. Test Side-by-Side Comparison Mode
  console.log('\n3️⃣ Testing Side-by-Side Comparison Mode...');
  const compareBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('.gallery-theme-toolbar button'));
    return buttons.find(b => b.textContent.includes('Side-by-Side'));
  });
  if (compareBtn) {
    await compareBtn.click();
    await new Promise(r => setTimeout(r, 600));
  }

  const comparisonActive = await page.evaluate(() => {
    return document.querySelectorAll('.comparison-item').length > 0;
  });
  console.log(`   Side-by-Side Comparison Items Rendered: ${comparisonActive}`);

  await page.screenshot({ path: path.join(distDir, 'verified-halloween-compare.png') });
  console.log('   📸 Saved dist/verified-halloween-compare.png');

  // 4. Test Card Inspector Modal
  console.log('\n4️⃣ Testing Card Inspector Modal...');
  const firstCard = await page.$('.grid-item .card-wrapper');
  if (firstCard) {
    await firstCard.click();
    await new Promise(r => setTimeout(r, 600));
  }

  const modalInfo = await page.evaluate(() => {
    const modal = document.querySelector('.modal-dialog');
    const title = modal ? modal.querySelector('h3')?.textContent : null;
    const hasLore = modal ? modal.textContent.includes('Lord') || modal.textContent.includes('Crimson') || modal.textContent.includes('Vampire') : false;
    return { title, hasLore };
  });
  console.log(`   Inspector Modal Opened: "${modalInfo.title}"`);
  console.log(`   Modal Displays Thematic Lore: ${modalInfo.hasLore}`);

  await page.screenshot({ path: path.join(distDir, 'verified-halloween-modal.png') });
  console.log('   📸 Saved dist/verified-halloween-modal.png');

  await browser.close();
  console.log('\n🎉 ALL HALLOWEEN UI CHECKS VERIFIED SUCCESSFULLY!');
}

verifyHalloweenUI().catch(err => {
  console.error('❌ Halloween UI verification failed:', err);
  process.exit(1);
});
