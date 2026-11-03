// A new player who stops for a few seconds gets a gentle pulse on one mergeable pair; any touch clears it.
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
    const hinted = () => page.locator('[data-board-highlight][data-hint]').count();
    if (await hinted() !== 0) throw new Error('Hint showed before the player was idle');
    await page.waitForTimeout(9500);
    const count = await hinted();
    if (count !== 2) throw new Error(`Expected 2 hinted tiles after 9.5 s idle, found ${count}`);
    await page.mouse.click(195, 700);
    await page.waitForTimeout(300);
    if (await hinted() !== 0) throw new Error('Hint did not clear on touch');
    console.log('Idle hint: appears after about 8 s for two tiles and clears on touch.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
