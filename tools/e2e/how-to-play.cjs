// The menu shows which build this is and opens a short "How to play" sheet that closes again.
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
    await page.getByRole('button', { name: /^(menu|القائمة)$/i }).first().tap();
    const label = (await page.getByTestId('build-label').innerText()).trim();
    if (!/(build \d+|dev build)/.test(label)) throw new Error(`Menu build label looks wrong: "${label}"`);
    await page.getByText(/^(How to play|كيف ألعب؟)$/).first().tap();
    const sheet = page.getByTestId('how-to-play');
    await sheet.waitFor();
    if ((await sheet.locator('li').count()) < 5) throw new Error('How to play has too few steps');
    await sheet.getByRole('button', { name: /^(Close|إغلاق)$/ }).tap();
    if (await sheet.count()) throw new Error('How to play did not close');
    console.log(`How to play: opens and closes; menu shows "${label}".`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
