// Exercise the guest guide with a synthetic save in an isolated browser context.
const { chromium } = require('playwright');

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
    const key = 'qahwa_majlis_merge_save_v3';
    await page.goto(new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/').href);
    await page.getByTestId('scene-skip').click();
    await page.waitForFunction(key => !!localStorage.getItem(key), key);
    const styles = await page.evaluate(key => {
      const save = JSON.parse(localStorage.getItem(key));
      save.tutorialDismissed = true;
      save.renovationZones[1].unlockedLevel = 1;
      save.renovationZones[1].selectedStyle = 1;
      save.activeOrders[0].customerId = 'noura';
      save.activeOrders[0].customerNameAr = 'نورة';
      save.activeOrders[0].customerNameEn = 'Noura';
      localStorage.setItem(key, JSON.stringify(save));
      return save.renovationZones[1].styles.map(style => style.nameAr);
    }, key);
    await page.reload();
    const claim = page.getByTestId('daily-login-claim');
    if (await claim.isVisible()) await claim.click();
    const guide = () => page.getByRole('button', { name: 'دليل طلب نورة', exact: true }).first();
    await guide().click();
    const reaction = page.getByTestId('order-majlis-reaction');
    if (!(await reaction.innerText()).includes(styles[1])) throw new Error('Guide did not show the restored wing style');
    await page.getByRole('dialog').getByRole('button', { name: 'إغلاق' }).click();
    await page.evaluate(key => {
      const save = JSON.parse(localStorage.getItem(key));
      save.renovationZones[1].selectedStyle = 0;
      localStorage.setItem(key, JSON.stringify(save));
    }, key);
    await page.reload();
    await guide().click();
    if (!(await reaction.innerText()).includes(styles[0])) throw new Error('Guide did not update after a saved style change');
    await page.getByRole('dialog').getByRole('button', { name: 'إغلاق' }).click();
    await page.evaluate(key => {
      const save = JSON.parse(localStorage.getItem(key));
      save.activeOrders[0].customerId = 'faisal';
      save.activeOrders[0].customerNameAr = 'فيصل';
      localStorage.setItem(key, JSON.stringify(save));
    }, key);
    await page.reload();
    await page.getByRole('button', { name: 'دليل طلب فيصل', exact: true }).first().click();
    if (await reaction.count()) throw new Error('Guide showed another guest’s reaction');
    console.log('Guest guide reflects saved wing styles and does not show another guest’s reaction.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
