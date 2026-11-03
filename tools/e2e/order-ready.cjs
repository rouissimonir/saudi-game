// When a merge makes a guest's order ready, the card gets a one-time bounce and the Serve pill appears.
const { chromium } = require('playwright');

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await page.goto(new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/').href);
    await page.getByTestId('scene-skip').click();
    if (await page.locator('[data-testid^="order-action-"]').count()) throw new Error('An order was ready before any merge');
    await page.locator('[data-cell-index="17"]').click();
    await page.locator('[data-cell-index="18"]').click();
    await page.getByRole('button', { name: /^تقديم طلب / }).first().waitFor({ timeout: 3000 });
    const bounced = await page.locator('.order-ready-bump').count();
    if (bounced < 1) throw new Error('The ready card did not get its bounce');
    await page.waitForTimeout(1200);
    if (await page.locator('.order-ready-bump').count()) throw new Error('The bounce did not end');
    console.log('Order ready: the card bounces once when its order becomes ready.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
