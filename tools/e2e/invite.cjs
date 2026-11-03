// "Invite a friend" opens the share sheet and a first share unlocks the Hospitality Ambassador achievement.
const { chromium } = require('playwright');

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const key = 'qahwa_majlis_merge_save_v3';
    await page.addInitScript(() => { window.__shared = []; navigator.share = async data => { window.__shared.push(data); }; });
    await page.goto(new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/').href);
    await page.getByTestId('scene-skip').click();
    await page.waitForFunction(k => !!localStorage.getItem(k), key);
    await page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k)); s.tutorialDismissed = true; localStorage.setItem(k, JSON.stringify(s)); }, key);
    await page.reload();
    const claim = page.getByTestId('daily-login-claim');
    if (await claim.isVisible().catch(() => false)) await claim.click();
    await page.getByRole('button', { name: /^(menu|القائمة)$/i }).first().tap();
    await page.getByText(/^(Invite a friend|ادعُ صديقاً)$/).first().tap();
    await page.waitForTimeout(500);
    const shared = await page.evaluate(() => window.__shared);
    if (shared.length !== 1 || !/^https:\/\//.test(shared[0].url) || !shared[0].text) throw new Error(`Share sheet got ${JSON.stringify(shared)}`);
    const count = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).sharedCount, key);
    if (count !== 1) throw new Error(`sharedCount is ${count}`);
    await page.getByRole('button', { name: /^(menu|القائمة)$/i }).first().tap();
    await page.getByText(/^(Achievements|الإنجازات)$/).first().tap();
    const ambassador = page.getByTestId('achievement-invite_1').getByRole('button');
    if (await ambassador.isDisabled()) throw new Error('The invite achievement is not claimable after sharing');
    console.log('Invite: share sheet opened with a link, first share unlocks its achievement.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
