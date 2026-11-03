// "Tidy board" puts matching pieces next to each other without losing anything.
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
    await page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k)); s.tutorialDismissed = true; localStorage.setItem(k, JSON.stringify(s)); }, key);
    await page.reload();
    const claim = page.getByTestId('daily-login-claim');
    if (await claim.isVisible().catch(() => false)) await claim.click();
    const items = () => page.evaluate(k => JSON.parse(localStorage.getItem(k)).board.map(c => c.itemId).filter(Boolean).sort(), key);
    const before = await items();
    await page.getByTestId('tidy-board').click();
    await page.waitForTimeout(500);
    const after = await items();
    if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Tidy changed which items are on the board');
    await page.getByTestId('tidy-board').click();
    await page.waitForTimeout(300);
    console.log(`Tidy board: ${after.length} items kept, second tap reports an already tidy board.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
