// After a long break the game says what changed (energy regained, guests waiting) in a dismissible card.
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
    await page.evaluate(k => {
      const s = JSON.parse(localStorage.getItem(k)); s.tutorialDismissed = true; s.energy = 60;
      localStorage.setItem(k, JSON.stringify(s));
    }, key);
    // The game records its own departure when the page unloads, so plant the old snapshot as the next load starts (once).
    await page.addInitScript(() => {
      if (sessionStorage.getItem('seeded')) return;
      sessionStorage.setItem('seeded', '1');
      localStorage.setItem('qahwa_presence', JSON.stringify({ at: Date.now() - 40 * 60_000, energy: 10 }));
    });
    await page.reload();
    const claim = page.getByTestId('daily-login-claim');
    if (await claim.isVisible().catch(() => false)) await claim.click();
    const card = page.getByTestId('welcome-back');
    await card.waitFor({ timeout: 5000 });
    const text = await card.innerText();
    if (!/\+\d+/.test(text)) throw new Error(`Welcome-back card has no energy figure: ${text}`);
    await card.getByRole('button').click();
    if (await card.count()) throw new Error('Card did not dismiss');
    await page.reload();
    await page.waitForTimeout(1500);
    if (await page.getByTestId('welcome-back').count()) throw new Error('Card repeated after a quick reload');
    console.log('Welcome back: shown once after a 40 minute absence, dismissible, not repeated.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
