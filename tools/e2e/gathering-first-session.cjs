// Play the first order and gathering through the UI, with no seeded or modified save.
const { chromium } = require('playwright');

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await page.addInitScript(() => { Object.defineProperty(navigator, 'vibrate', { configurable: true, value: duration => { window.testVibrations = [...(window.testVibrations || []), duration]; return true; } }); });
    const url = new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/');
    const save = () => page.evaluate(() => JSON.parse(localStorage.getItem('qahwa_majlis_merge_save_v3')));
    const cell = index => page.locator(`[data-cell-index="${index}"]`);
    await page.goto(url.href);
    await page.getByTestId('scene-skip').click();
    const clipped = await page.locator('[data-testid^=order-recipe-]').evaluateAll(rows => rows.some(row => row.scrollWidth > row.clientWidth));
    if (clipped) throw new Error('Guest ingredients are clipped on the phone viewport');
    await cell(17).click();
    await cell(18).click();
    const serve = page.getByRole('button', { name: /^تقديم طلب / }).first();
    const initialOrder = (await save()).activeOrders[0];
    if (!(await serve.getAttribute('aria-label')).includes(initialOrder.customerNameAr)) throw new Error('Serve action does not identify its guest');
    const target = await serve.boundingBox();
    if (!target || target.width < 44 || target.height < 44) throw new Error('Serve touch target is smaller than 44 × 44');
    await serve.click();
    await page.getByTestId('daily-login-claim').waitFor();
    await page.waitForTimeout(3000); // The welcome must not expire behind the daily gift.
    await page.getByTestId('daily-login-claim').click();
    const welcome = page.getByTestId('guest-welcome-feedback');
    await welcome.waitFor();
    if (!(await welcome.innerText()).includes('تم استقبال')) throw new Error('Guest welcome is missing after the gift');
    if (!(await welcome.locator('img, svg').count())) throw new Error('Guest portrait missing');

    // Focus the specialty-coffee tray and identify the already available ingredient.
    await page.getByTestId('open-tasting').click();
    await page.getByTestId('tasting-choice-modern').locator('..').getByRole('button', { name: 'أرني على اللوحة: قهوة مختصة وتمر' }).click();
    if (!(await page.getByTestId('recipe-marker-legend').innerText()).includes('للوصفة')) throw new Error('Recipe marker legend missing');
    const readyCoffee = cell(24);
    if (await readyCoffee.getAttribute('data-recipe-needed') !== 'true') throw new Error('Ready recipe ingredient not marked');
    if (!(await readyCoffee.getAttribute('aria-label')).includes('جاهز للوصفة المختارة')) throw new Error('Ready recipe ingredient not described');
    // A stored ingredient is not lost: the recipe prompt points to the pantry.
    await readyCoffee.click();
    await page.getByRole('button', { name: 'تخزين', exact: true }).click();
    await page.getByTestId('recipe-progress-hint').getByText('في المؤونة:', { exact: false }).waitFor();
    await page.getByTestId('open-tasting').click();
    const returnItem = page.getByTestId('tasting-choice-modern').locator('..').getByTestId('return-pantry-item');
    if (!(await returnItem.getAttribute('aria-label')).startsWith('أعده للوحة:')) throw new Error('Pantry action name does not include its visible label');
    await returnItem.click();
    await page.getByRole('dialog').getByRole('button', { name: 'إغلاق' }).click();
    if ((await page.getByTestId('recipe-progress-hint').innerText()).includes('في المؤونة')) throw new Error('Pantry prompt did not clear after retrieval');


    // Make sweets for the specialty-coffee tray. A lucky generator drop may already be level 2.
    for (let attempt = 0; attempt < 8; attempt++) {
      const state = await save();
      if (state.board.some(c => c.itemId === 'sweets_2' && !c.sandLocked)) break;
      const pieces = state.board.filter(c => c.itemId === 'sweets_1' && !c.sandLocked);
      if (pieces.length >= 2) {
        if (state.selectedCellIndex !== null) await cell(state.selectedCellIndex).click();
        await cell(pieces[0].index).click();
        await cell(pieces[1].index).click();
      } else {
        await cell(5).click();
      }
      await page.waitForTimeout(100);
    }
    if (!(await save()).board.some(c => c.itemId === 'sweets_2' && !c.sandLocked)) throw new Error('Could not prepare sweets from the starting board');
    await page.getByTestId('open-tasting').click();
    const first = page.getByTestId('tasting-tray-0');
    const prepare = first.getByRole('button', { name: 'جهّز: قهوة مختصة وتمر', exact: true });
    const prepareSize = await prepare.boundingBox();
    if (!prepareSize || prepareSize.width < 44 || prepareSize.height < 44) throw new Error('Prepare touch target is smaller than 44 × 44');
    await prepare.click();
    await page.getByRole('dialog').getByRole('button', { name: 'إغلاق' }).click();
    if (await page.locator('[data-recipe-needed=true]').count()) throw new Error('Completed recipe still marked on board');

    // Merge the two starter coffee pieces for the coffee-and-oud tray.
    let state = await save();
    const coffee = state.board.filter(c => c.itemId === 'qahwa_1' && !c.sandLocked);
    if (coffee.length < 2) throw new Error('Starter coffee pieces unavailable');
    if (state.selectedCellIndex !== null) await cell(state.selectedCellIndex).click();
    await cell(coffee[0].index).click();
    await cell(coffee[1].index).click();
    await page.getByTestId('open-tasting').click();
    await page.getByTestId('tasting-tray-1').getByRole('button', { name: /^جهّز:/ }).nth(1).click();
    await page.getByRole('button', { name: 'نحاس دافئ' }).click();
    state = await save();
    const vibrationCount = await page.evaluate(() => (window.testVibrations || []).length);
    await page.getByTestId('host-tasting').click();
    await page.getByTestId('tasting-payoff').waitFor();
    await page.waitForFunction(count => (window.testVibrations || []).length === count + 1, vibrationCount);
    if (await page.evaluate(() => window.testVibrations.at(-1)) !== 35) throw new Error('Gathering haptic missing or incorrect');
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('qahwa_majlis_merge_save_v3')).storyFlags.tasting_complete === 'yes');
    const done = await save();
    if (done.storyFlags.tasting_tray_0 !== 'modern' || done.storyFlags.tasting_tray_1 !== 'fragrant') throw new Error('Chosen trays were not saved');
    if (done.coins !== state.coins + 150 || done.diamonds !== state.diamonds + 5) throw new Error('Gathering reward was incorrect');
    await page.reload();
    const restored = await save();
    if (restored.storyFlags.tasting_complete !== 'yes' || restored.coins !== done.coins || restored.diamonds !== done.diamonds) throw new Error('Gathering did not survive reload');
    const afterReloadVibrations = await page.evaluate(() => (window.testVibrations || []).length);
    await page.getByTestId('open-tasting').click();
    await page.getByTestId('tasting-payoff').waitFor();
    if (await page.evaluate(() => (window.testVibrations || []).length) !== afterReloadVibrations) throw new Error('Revisiting the gathering replayed its haptic');
    console.log(`Fresh gathering: served first guest, prepared two trays and hosted; ${done.energy} energy remained.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
