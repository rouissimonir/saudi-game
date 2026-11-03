// Starting a new game erases progress, so it needs a second, explicit confirmation; cancelling keeps everything.
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
    await page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k)); s.tutorialDismissed = true; s.coins = 7777; localStorage.setItem(k, JSON.stringify(s)); }, key);
    await page.reload();
    const claim = page.getByTestId('daily-login-claim');
    if (await claim.isVisible().catch(() => false)) await claim.click();
    const coins = () => page.evaluate(k => JSON.parse(localStorage.getItem(k)).coins, key);
    await page.getByRole('button', { name: /^(menu|القائمة)$/i }).first().tap();
    await page.getByText(/^(Pause|إيقاف مؤقت)$/).first().tap();
    await page.getByTestId('reset-game').tap();
    await page.getByTestId('reset-confirm').waitFor();
    if (await coins() < 7777) throw new Error('Progress was erased before confirming');
    await page.getByTestId('reset-confirm').getByRole('button', { name: /^(Cancel|إلغاء)$/ }).tap();
    if (await page.getByTestId('reset-confirm').count()) throw new Error('Confirmation stayed after Cancel');
    if (await coins() < 7777) throw new Error('Cancel erased progress');
    await page.getByTestId('reset-game').tap();
    await page.getByTestId('reset-confirm-yes').tap();
    await page.waitForTimeout(600);
    if (await coins() >= 7777) throw new Error('Confirming did not start a new game');
    console.log('Reset: needs confirmation, Cancel keeps progress, Yes starts fresh.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
