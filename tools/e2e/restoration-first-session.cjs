// Restore a first Majlis wing from a fresh game, without modifying the save.
const { chromium } = require('playwright');

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
    const url = new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/');
    const save = () => page.evaluate(() => JSON.parse(localStorage.getItem('qahwa_majlis_merge_save_v3')));
    const cell = index => page.locator(`[data-cell-index="${index}"]`);
    await page.goto(url.href);
    await page.getByTestId('scene-skip').click();
    await cell(17).click();
    await cell(18).click();
    await page.getByRole('button', { name: 'تقديم!', exact: true }).first().click();
    await page.getByTestId('daily-login-claim').click();
    await page.getByTestId('first-restoration-prompt').click();
    await page.getByTestId('first-restoration-guide').getByRole('button').click();
    const wingId = await page.evaluate(() => document.activeElement.dataset.testid);
    if (!wingId?.startsWith('restoration-wing-')) throw new Error('Guide did not focus a wing');
    const wing = page.getByTestId(wingId);
    const id = wingId.slice('restoration-wing-'.length);
    const before = await save();
    const zone = before.renovationZones.find(item => item.id === id);
    await wing.locator('button[aria-pressed]').nth(1).click();
    await page.waitForFunction(wingId => JSON.parse(localStorage.getItem('qahwa_majlis_merge_save_v3')).renovationZones.find(z => z.id === wingId).selectedStyle === 1, id);
    const styled = await save();
    if (styled.coins !== before.coins || styled.stars !== before.stars) throw new Error('Selecting a future style charged the player');
    await wing.getByRole('button', { name: 'ترميم الجناح الآن' }).click();
    await page.getByTestId('scene-skip').waitFor();
    await page.getByTestId('scene-skip').click();
    const reveal = page.getByTestId('restoration-reveal');
    await reveal.waitFor();
    await reveal.getByRole('button', { name: 'شاهد لمستك في المجلس' }).click();
    const reaction = page.getByTestId('majlis-detail-reaction');
    await reaction.waitFor();
    if (!(await reaction.innerText()).includes(zone.styles[1].nameAr)) throw new Error('Family reaction did not reflect the chosen style');
    const bounds = await page.evaluate(() => {
      const reaction = document.querySelector('[data-testid=majlis-detail-reaction]').getBoundingClientRect();
      const header = document.querySelector('[data-testid=game-hud]').closest('header').getBoundingClientRect();
      const navigation = document.querySelector('[data-testid=bottom-nav]').getBoundingClientRect();
      return { top: reaction.top, bottom: reaction.bottom, header: header.bottom, navigation: navigation.top };
    });
    if (bounds.top < bounds.header || bounds.bottom > bounds.navigation) throw new Error(`Reaction obscured: ${JSON.stringify(bounds)}`);
    await page.waitForFunction(() => !JSON.parse(localStorage.getItem('qahwa_majlis_merge_save_v3')).storyFlags.restoration_reveal_wing);
    const restored = await save();
    if (restored.stars !== before.stars - zone.starCostLevel1 || restored.wingUpgrades !== before.wingUpgrades + 1) throw new Error('Restoration cost or progress incorrect');
    await page.reload();
    const reloaded = await save();
    if (reloaded.stars !== restored.stars || reloaded.wingUpgrades !== restored.wingUpgrades || reloaded.renovationZones.find(z => z.id === id).selectedStyle !== 1) throw new Error('Restoration did not survive reload');
    console.log('Fresh restoration: free style selection, one star cost, visible family reaction, and saved progress.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
