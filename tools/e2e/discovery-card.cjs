// Finding an item for the first time shows a card with its reward and a one-tap claim.
const { chromium } = require('playwright');

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const key = 'qahwa_majlis_merge_save_v3';
    await page.goto(new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/').href);
    await page.getByTestId('scene-skip').click();
    await page.waitForFunction(k => !!localStorage.getItem(k), key);
    // Put two Lv.3 coffee items on empty tiles and make Lv.4 undiscovered, so merging them is a genuine first find.
    const pair = await page.evaluate(k => {
      const s = JSON.parse(localStorage.getItem(k)); s.tutorialDismissed = true;
      const empty = s.board.filter(c => c.itemId === null && !c.sandLocked).slice(0, 2);
      if (empty.length < 2) throw new Error('No room on the starting board');
      empty.forEach(c => { s.board[c.index].itemId = 'qahwa_3'; });
      s.discoveredItemIds = s.discoveredItemIds.filter(id => id !== 'qahwa_4');
      s.claimedDiscoveryIds = s.claimedDiscoveryIds.filter(id => id !== 'qahwa_4');
      localStorage.setItem(k, JSON.stringify(s));
      return empty.map(c => c.index);
    }, key);
    await page.reload();
    const claim = page.getByTestId('daily-login-claim');
    if (await claim.isVisible().catch(() => false)) await claim.click();
    const save = () => page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
    const before = await save();
    await page.locator(`[data-cell-index="${pair[0]}"]`).click();
    await page.locator(`[data-cell-index="${pair[1]}"]`).click();
    const card = page.getByTestId('discovery-card');
    await card.waitFor({ timeout: 4000 });
    const coins = (await save()).coins;
    await page.getByTestId('discovery-claim').click();
    await page.waitForTimeout(400);
    if (await card.count()) throw new Error('Card stayed after claiming');
    const after = await save();
    if (after.coins <= coins - 1) throw new Error('Claiming did not pay out');
    if (after.claimedDiscoveryIds.length <= before.claimedDiscoveryIds.length) throw new Error('Discovery was not marked claimed');
    console.log('Discovery card: appears on a first find and pays out with one tap.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
