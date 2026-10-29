const puppeteer = require('D:/Antigravity/ember-olive/node_modules/puppeteer-core');

async function verifyTestHandNonMutating() {
  console.log('🧪 Starting Test Hand Non-Mutating Verification...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  } catch (e) {
    console.log('Port 3000 not reachable, trying port 3001...');
    await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });
  }
  await new Promise(r => setTimeout(r, 600));

  let passed = true;

  // 1. Initial State Inspection
  const initialState = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.hand-card-wrapper'));
    const cardIds = cards.map(c => c.id.replace('hand-card-', ''));
    const drawPileCount = document.querySelector('.deck-counter')?.textContent?.trim();
    const discardPileText = document.querySelector('.center-piles-area .discard-card')?.textContent?.trim();
    const opponentCounts = Array.from(document.querySelectorAll('.opponent-badge')).map(b => b.textContent?.trim());
    return {
      cardCount: cards.length,
      cardIds,
      drawPileCount,
      discardPileText,
      opponentCounts,
    };
  });

  console.log(`Initial Human Cards (${initialState.cardCount}):`, initialState.cardIds);
  console.log('Initial Draw Pile Count:', initialState.drawPileCount);

  if (initialState.cardCount !== 7) {
    console.error(`❌ Expected initial hand to have 7 cards, got ${initialState.cardCount}`);
    passed = false;
  }

  // 2. Click Test Hand: 1
  console.log('\nTesting Test Hand: 1');
  await page.click('[data-testid="test-hand-btn-1"]');
  await new Promise(r => setTimeout(r, 300));

  const state1 = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.hand-card-wrapper'));
    const cardIds = cards.map(c => c.id.replace('hand-card-', ''));
    const drawPileCount = document.querySelector('.deck-counter')?.textContent?.trim();
    const msg = document.querySelector('[data-testid="test-hand-message"]')?.textContent?.trim();
    const playerInfo = document.querySelector('.player-name-tag')?.textContent?.trim();
    return {
      renderedCount: cards.length,
      cardIds,
      drawPileCount,
      msg,
      playerInfo,
    };
  });

  if (state1.renderedCount === 1 && state1.cardIds[0] === initialState.cardIds[0]) {
    console.log(`✅ Hand: 1 correctly displays 1 card (${state1.cardIds[0]}), strictly matching 1st card of original hand.`);
  } else {
    console.error('❌ Hand: 1 failed:', state1);
    passed = false;
  }

  if (state1.drawPileCount === initialState.drawPileCount) {
    console.log(`✅ Draw pile unchanged (${state1.drawPileCount}).`);
  } else {
    console.error('❌ Draw pile was mutated!', state1.drawPileCount);
    passed = false;
  }

  if (state1.playerInfo && state1.playerInfo.includes('7 cards')) {
    console.log(`✅ Authoritative player hand remains 7 cards: "${state1.playerInfo}".`);
  } else {
    console.error('❌ Authoritative player hand was mutated!', state1.playerInfo);
    passed = false;
  }

  if (state1.msg === 'Showing 1 of 7 cards.') {
    console.log(`✅ Status message correct: "${state1.msg}".`);
  } else {
    console.error('❌ Status message unexpected:', state1.msg);
    passed = false;
  }

  // 3. Click Test Hand: 13 (Hand has 7 cards -> should show 7 and say "Showing 7 of 13 requested cards.")
  console.log('\nTesting Test Hand: 13 (fewer cards available than requested)');
  await page.click('[data-testid="test-hand-btn-13"]');
  await new Promise(r => setTimeout(r, 300));

  const state13First = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.hand-card-wrapper'));
    const cardIds = cards.map(c => c.id.replace('hand-card-', ''));
    const drawPileCount = document.querySelector('.deck-counter')?.textContent?.trim();
    const msg = document.querySelector('[data-testid="test-hand-message"]')?.textContent?.trim();
    return {
      renderedCount: cards.length,
      cardIds,
      drawPileCount,
      msg,
    };
  });

  if (state13First.renderedCount === 7 && state13First.msg === 'Showing 7 of 13 requested cards.') {
    console.log(`✅ Hand: 13 renders only available 7 cards with message: "${state13First.msg}". Zero cards generated!`);
  } else {
    console.error('❌ Hand: 13 failed:', state13First);
    passed = false;
  }

  if (JSON.stringify(state13First.cardIds) === JSON.stringify(initialState.cardIds)) {
    console.log('✅ Card identities and order exactly match initial hand.');
  } else {
    console.error('❌ Card identities changed unexpectedly!', state13First.cardIds);
    passed = false;
  }

  // 4. Repeated clicks on 13 must NEVER regenerate or mutate cards
  console.log('\nTesting repeated clicks on Test Hand: 13 (must not re-roll cards)');
  // Clicking active 13 will toggle it off, clicking again turns it on
  await page.click('[data-testid="test-hand-btn-13"]'); // toggle off
  await new Promise(r => setTimeout(r, 200));
  await page.click('[data-testid="test-hand-btn-13"]'); // toggle on
  await new Promise(r => setTimeout(r, 200));

  const state13Second = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.hand-card-wrapper'));
    const cardIds = cards.map(c => c.id.replace('hand-card-', ''));
    return {
      renderedCount: cards.length,
      cardIds,
    };
  });

  if (JSON.stringify(state13Second.cardIds) === JSON.stringify(initialState.cardIds)) {
    console.log('✅ Repeated clicks strictly preserved 100% card identities and order. No re-roll occurred.');
  } else {
    console.error('❌ Repeated click mutated cards!', state13Second.cardIds);
    passed = false;
  }

  // 5. Test Hand: 20
  console.log('\nTesting Test Hand: 20');
  await page.click('[data-testid="test-hand-btn-20"]');
  await new Promise(r => setTimeout(r, 300));

  const state20 = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.hand-card-wrapper'));
    const msg = document.querySelector('[data-testid="test-hand-message"]')?.textContent?.trim();
    return { renderedCount: cards.length, msg };
  });

  if (state20.renderedCount === 7 && state20.msg === 'Showing 7 of 20 requested cards.') {
    console.log(`✅ Hand: 20 shows available 7 cards with: "${state20.msg}".`);
  } else {
    console.error('❌ Hand: 20 failed:', state20);
    passed = false;
  }

  // 6. Test Reset Button "All"
  console.log('\nTesting Reset Button ("All")');
  await page.click('[data-testid="test-hand-btn-reset"]');
  await new Promise(r => setTimeout(r, 300));

  const stateReset = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.hand-card-wrapper'));
    const msg = document.querySelector('[data-testid="test-hand-message"]');
    const resetBtn = document.querySelector('[data-testid="test-hand-btn-reset"]');
    return {
      renderedCount: cards.length,
      hasMsg: !!msg,
      hasResetBtn: !!resetBtn,
    };
  });

  if (stateReset.renderedCount === 7 && !stateReset.hasMsg && !stateReset.hasResetBtn) {
    console.log('✅ Reset button restored full hand view; message and reset button dismissed.');
  } else {
    console.error('❌ Reset failed:', stateReset);
    passed = false;
  }

  // 7. Verify dynamic overlap styling reflects the rendered count
  console.log('\nTesting overlap style when sliced');
  await page.click('[data-testid="test-hand-btn-1"]');
  await new Promise(r => setTimeout(r, 200));

  const overlap1 = await page.evaluate(() => {
    const el = document.getElementById('human-hand-container');
    return el?.style.getPropertyValue('--hand-card-overlap');
  });

  if (overlap1 === '0px') {
    console.log(`✅ Hand: 1 overlap computed to ${overlap1}.`);
  } else {
    console.error('❌ Overlap for 1 card failed:', overlap1);
    passed = false;
  }

  await browser.close();

  if (allPassed(passed)) {
    console.log('\n🎉 ALL NON-MUTATING TEST HAND CHECKS PASSED PERFECTLY!');
    process.exit(0);
  } else {
    console.error('\n❌ SOME CHECKS FAILED.');
    process.exit(1);
  }

  function allPassed(val) {
    return val;
  }
}

verifyTestHandNonMutating().catch(err => {
  console.error('Fatal error during test:', err);
  process.exit(1);
});
