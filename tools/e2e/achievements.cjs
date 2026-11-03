// The Achievements sheet lists lifetime goals, collects a finished one once, and the menu badge follows.
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
    await page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k)); s.tutorialDismissed = true; s.ordersCompleted = 6; localStorage.setItem(k, JSON.stringify(s)); }, key);
    await page.reload();
    const claim = page.getByTestId('daily-login-claim');
    if (await claim.isVisible().catch(() => false)) await claim.click();
    const save = () => page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
    const gemsBefore = (await save()).diamonds;
    await page.getByRole('button', { name: /^(menu|القائمة)$/i }).first().tap();
    await page.getByText(/^(Achievements|الإنجازات)$/).first().tap();
    await page.getByTestId('achievements-modal').waitFor();
    const row = page.getByTestId('achievement-guests_5');
    await row.getByRole('button').tap();
    await page.waitForTimeout(400);
    const after = await save();
    if (after.diamonds !== gemsBefore + 5) throw new Error(`Expected +5 gems, got ${after.diamonds - gemsBefore}`);
    if (!after.claimedAchievements.includes('guests_5')) throw new Error('Claim was not recorded');
    if (await row.getByRole('button').count()) throw new Error('A collected achievement still shows Claim');
    const locked = page.getByTestId('achievement-guests_25').getByRole('button');
    if (!(await locked.isDisabled())) throw new Error('An unfinished achievement can be claimed');
    console.log('Achievements: opened from the menu, collected once for +5 gems, unfinished goals stay locked.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
