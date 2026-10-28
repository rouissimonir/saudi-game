// Real touch events through Chromium's DevTools protocol; uses a fresh, disposable save.
const { chromium, devices } = require('playwright');

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    const context = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await context.newPage();
    await page.goto(new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/').href);
    await page.getByTestId('scene-skip').click();
    await page.getByTestId('tutorial-coach').getByRole('button').click();
    await page.getByTestId('daily-login-claim').click();
    const source = page.locator('[data-cell-index="17"]');
    const target = page.locator('[data-cell-index="18"]');
    const a = await source.boundingBox();
    const b = await target.boundingBox();
    if (!a || !b) throw new Error('Initial merge pair is not visible');
    const x = a.x + a.width / 2, y = a.y + a.height / 2;
    const targetX = b.x + b.width / 2, targetY = b.y + b.height / 2;
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let n = 1; n <= 6; n++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (targetX - x) * n / 6, y: y + (targetY - y) * n / 6 }] });
      await page.waitForTimeout(40);
    }
    if (!(await page.getByTestId('drag-ghost').isVisible())) throw new Error('Drag preview did not appear');
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(400);
    if (!(await source.getAttribute('aria-label')).includes('خلية فارغة') || !(await target.getAttribute('aria-label')).includes('Lv.2')) throw new Error('Touch drag did not merge the pair');
    console.log('Touch drag showed a preview and merged the initial pair.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
