// Use an isolated synthetic save to exercise travel, saved choices and a reload.
const { chromium } = require('playwright');

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
    const key = 'qahwa_majlis_merge_save_v3';
    const save = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
    await page.goto(new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/').href);
    await page.getByTestId('scene-skip').click();
    await page.waitForFunction(key => !!localStorage.getItem(key), key);
    const setup = await page.evaluate(key => {
      const state = JSON.parse(localStorage.getItem(key));
      state.tutorialDismissed = true;
      state.seenScenes = [...new Set([...(state.seenScenes || []), 'prologue'])];
      state.activeStoryId = null;
      state.renovationZones.forEach(zone => { zone.unlockedLevel = 2; zone.selectedStyle = 1; });
      return { state, choice: state.renovationZones[1].styles[1].nameAr };
    }, key);
    await page.addInitScript(({ key, state }) => { if (!sessionStorage.getItem('test_restored_places_seeded')) { localStorage.setItem(key, JSON.stringify(state)); sessionStorage.setItem('test_restored_places_seeded', 'yes'); } }, { key, state: setup.state });
    const choice = setup.choice;
    await page.reload();
    const gift = page.getByTestId('daily-login-claim');
    if (await gift.isVisible()) await gift.click();
    const loaded = await save();
    if (!loaded.renovationZones.every(zone => zone.unlockedLevel === 2)) throw new Error(`Test setup did not retain completed wings: ${loaded.renovationZones.map(z => z.unlockedLevel).join(',')}`);
    await page.getByTestId('nav-majlis').click();
    await page.getByTestId('advance-area').getByRole('button', { name: 'سافر الآن' }).click();
    await page.getByTestId('scene-skip').click();
    await page.waitForFunction(key => { const state = JSON.parse(localStorage.getItem(key)); return state.areaIndex === 1 && state.activeStoryId === null && state.completedStoryIds.includes('area_1'); }, key);
    const traveled = await save();
    if (traveled.areaIndex !== 1) throw new Error('Travel did not advance the area');
    const places = page.getByTestId('restored-places');
    await places.getByRole('button').first().click();
    if (!(await page.getByTestId('restored-place-details').innerText()).includes(choice)) throw new Error('Saved style is missing');
    await page.getByTestId('restored-place-details').getByRole('button').nth(1).click();
    if (!(await page.getByTestId('restored-place-reaction').innerText()).includes(choice)) throw new Error('Family reaction did not reflect the saved style');
    await page.reload();
    await page.getByTestId('nav-majlis').click();
    await places.getByRole('button').first().click();
    if (!(await page.getByTestId('restored-place-details').innerText()).includes(choice)) throw new Error('Saved style did not survive reload');
    await page.getByTestId('restored-place-details').getByRole('button').nth(1).click();
    if (!(await page.getByTestId('restored-place-reaction').innerText()).includes(choice)) throw new Error('Family reaction did not survive reload');
    const artwork = page.getByTestId('restored-place-details').locator('img');
    await artwork.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => { const img = document.querySelector('[data-testid=restored-place-details] img'); return img && img.complete && img.naturalWidth > 0; });
    if (process.env.RESTORED_PLACES_SCREENSHOT) await page.screenshot({ path: process.env.RESTORED_PLACES_SCREENSHOT });
    const revisited = await save();
    if (revisited.coins !== traveled.coins || revisited.diamonds !== traveled.diamonds) throw new Error('Revisiting granted a reward');
    console.log('Travel preserves chosen styles for a reward-free revisit after reload.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
