// Verify a cancelled pour preserves the chance, a completed reward uses one, and practice is free.
const { chromium } = require('playwright');

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const url = new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/');
    const saveKey = 'qahwa_majlis_merge_save_v3';
    await page.goto(url.href);
    await page.getByTestId('scene-skip').click();
    await page.getByTestId('tutorial-coach').getByRole('button', { name: 'تخطي' }).click();
    await page.getByTestId('daily-login-claim').click();
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).tutorialDismissed, saveKey);
    await page.evaluate(key => {
      const save = JSON.parse(localStorage.getItem(key));
      save.pourTokens = 2;
      localStorage.setItem(key, JSON.stringify(save));
    }, saveKey);
    await page.reload();
    await page.getByTestId('pour-challenge-button').click();
    const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), saveKey);
    await page.getByTestId('finjan-tap').click();
    await page.waitForFunction(() => Number(document.querySelector('[data-testid=finjan-glass]').getAttribute('aria-valuenow')) > 0);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    if (await page.getByTestId('finjan-result').count()) throw new Error('Interrupted pour produced a result');
    await page.waitForFunction(() => document.querySelector('[data-testid=finjan-glass]').getAttribute('aria-valuenow') === '0');
    const cancelled = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), saveKey);
    const rewardFields = ['pourTokens', 'coins', 'diamonds', 'jokerCount', 'prestigePoints'];
    if (rewardFields.some(field => cancelled[field] !== before[field])) throw new Error('Interrupted pour changed rewards or chances');
    await page.getByTestId('finjan-tap').click();
    await page.waitForTimeout(550);
    await page.getByTestId('finjan-tap').click();
    await page.getByTestId('finjan-result').waitFor();
    await page.waitForFunction(({ key, tokens }) => JSON.parse(localStorage.getItem(key)).pourTokens === tokens - 1, { key: saveKey, tokens: before.pourTokens });
    const rewarded = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), saveKey);
    if (rewarded.coins <= before.coins) throw new Error('Completed pour did not grant its coin reward');
    await page.getByTestId('finjan-result').getByRole('button', { name: 'تمام' }).click();
    await page.getByTestId('pour-challenge-button').click();
    await page.getByRole('button', { name: 'تدريب مجاني' }).click();
    await page.getByTestId('finjan-tap').click();
    await page.waitForTimeout(350);
    await page.getByTestId('finjan-tap').click();
    await page.getByTestId('practice-result').waitFor();
    const practiced = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), saveKey);
    if (rewardFields.some(field => practiced[field] !== rewarded[field])) throw new Error('Practice consumed a chance or gave a reward');
    console.log('Pour check: interruption preserves progress, completed pour pays once, and practice is free.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
