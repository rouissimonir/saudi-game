// Regression: changing a transfer code must cancel an older pending validation.
// Run against a built preview: npm run test:phone:transfer -- http://localhost:4173/
const { chromium } = require('playwright');

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    // Hold the asynchronous decompression until the input has been changed.
    await page.addInitScript(() => {
      const original = Response.prototype.arrayBuffer;
      Response.prototype.arrayBuffer = async function () {
        if (window.delayTransfer) {
          window.waitingTransfer = true;
          await new Promise(resolve => { window.releaseTransfer = resolve; });
        }
        return original.call(this);
      };
    });
    const url = new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/');
    await page.goto(url.href);
    await page.getByTestId('scene-skip').click();
    await page.getByTestId('tutorial-coach').getByRole('button', { name: 'تخطي' }).click();
    await page.getByTestId('daily-login-claim').click();
    await page.getByRole('button', { name: 'القائمة' }).click();
    await page.getByRole('button', { name: /نقل التقدم/ }).click();
    await page.waitForFunction(() => document.querySelector('[data-testid=transfer-code]')?.value);
    const code = await page.getByTestId('transfer-code').inputValue();
    await page.getByTestId('transfer-input').fill(code);
    await page.evaluate(() => { window.delayTransfer = true; });
    await page.getByTestId('transfer-check').click();
    await page.waitForFunction(() => window.waitingTransfer);
    await page.getByTestId('transfer-input').fill('invalid');
    await page.evaluate(() => { window.delayTransfer = false; window.releaseTransfer(); });
    await page.waitForTimeout(300);
    if (await page.getByTestId('transfer-confirm').count()) throw new Error('Old code became confirmable after input changed');
    await page.getByTestId('transfer-check').click();
    await page.getByText('الرمز غير صالح أو ناقص.').waitFor();
    await page.getByTestId('transfer-input').fill(code);
    await page.getByTestId('transfer-check').click();
    await page.getByTestId('transfer-confirm').waitFor();
    console.log('Transfer check: stale result discarded, invalid code rejected, current code confirmable.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
