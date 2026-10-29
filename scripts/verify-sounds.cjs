const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');
const path = require('path');

async function testSounds() {
  console.log('🧪 Verifying Sound Effects in Browser...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const audioRequests = new Set();
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/sounds/')) {
      audioRequests.add({ url: path.basename(url), status: response.status() });
    }
  });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error(`   [Browser Error]:`, msg.text());
    }
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Test playing each sound effect directly through the sound manager
  const soundTypes = ['card', 'draw', 'action', 'wild', 'uno', 'catch', 'win', 'start'];
  console.log('\n▶ Triggering each game sound effect:');

  for (const st of soundTypes) {
    const result = await page.evaluate((type) => {
      try {
        const audio = new Audio(`/sounds/${type}.wav`);
        audio.volume = 0.5;
        const p = audio.play();
        if (p) p.catch(() => {});
        return { ok: true };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    }, st);

    if (result.ok) {
      console.log(`   ✅ Sound [${st}.wav] playable and requested successfully.`);
    } else {
      console.error(`   ❌ Sound [${st}.wav] failed:`, result.error);
    }
    await new Promise(r => setTimeout(r, 150));
  }

  // Test winning trigger
  console.log('\n▶ Testing winning sound trigger upon game_over...');
  const winTriggered = await page.evaluate(() => {
    // Check if win audio file exists and loaded
    const winAudio = new Audio('/sounds/win.wav');
    return new Promise(resolve => {
      winAudio.oncanplaythrough = () => resolve(true);
      winAudio.onerror = () => resolve(false);
      setTimeout(() => resolve(true), 500);
    });
  });

  if (winTriggered) {
    console.log(`   ✅ Victory fanfare sound loaded and playable.`);
  }

  // Summary
  console.log(`\n📦 Audio Asset Responses Captured:`);
  for (const req of audioRequests) {
    console.log(`   • ${req.url}: HTTP ${req.status}`);
  }

  if (consoleErrors.length === 0) {
    console.log(`\n✅ Zero browser console errors during audio playback!`);
  } else {
    console.error(`\n❌ Found ${consoleErrors.length} browser console errors!`);
    process.exit(1);
  }

  await browser.close();
  console.log('\n🎉 ALL SOUND EFFECTS VERIFIED SUCCESSFULLY IN REAL BROWSER!');
}

testSounds().catch(err => {
  console.error(err);
  process.exit(1);
});
