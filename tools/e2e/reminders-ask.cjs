// In the installed app (simulated here by the iOS bridge marker) the game offers reminders once, after the first served guest;
// the website never asks. The system permission prompt itself needs a real device.
const { chromium } = require('playwright');

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    const url = new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/').href;
    const key = 'qahwa_majlis_merge_save_v3';
    const open = async (native) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      if (native) await page.addInitScript(() => { window.webkit = { messageHandlers: { bridge: { postMessage() {} } } }; });
      await page.goto(url);
      await page.getByTestId('scene-skip').click();
      await page.waitForFunction(k => !!localStorage.getItem(k), key);
      await page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k)); s.tutorialDismissed = true; s.ordersCompleted = 1; s.lastLoginDay = ''; localStorage.setItem(k, JSON.stringify(s)); }, key);
      await page.reload();
      const claim = page.getByTestId('daily-login-claim');
      if (await claim.isVisible().catch(() => false)) await claim.click();
      await page.waitForTimeout(800);
      return page;
    };
    const web = await open(false);
    if (await web.getByTestId('reminder-ask').count()) throw new Error('The website must not ask for reminders');
    await web.close();
    const app = await open(true);
    await app.getByTestId('reminder-ask').waitFor({ timeout: 4000 });
    await app.getByRole('button', { name: /^(Not now|ليس الآن)$/ }).tap();
    if (await app.getByTestId('reminder-ask').count()) throw new Error('The ask stayed after declining');
    await app.reload();
    await app.waitForTimeout(1200);
    if (await app.getByTestId('reminder-ask').count()) throw new Error('The ask came back after the player declined');
    await app.getByRole('button', { name: /^(menu|القائمة)$/i }).first().tap();
    if (!(await app.getByText(/^(Reminders on|تشغيل التذكيرات)$/).count())) throw new Error('Menu has no reminders switch in the app');
    console.log('Reminders: asked once in the app after the first guest, never on the website, switch stays in the menu.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
