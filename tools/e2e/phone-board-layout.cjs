// Verify that guests and the full board share the initial screen on iPhone 13 Pro-sized viewports.
const { chromium, webkit } = require('playwright');

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const engine = process.env.PHONE_TEST_BROWSER === 'webkit' ? webkit : chromium;
  const browser = await engine.launch(engine === chromium && executablePath ? { executablePath } : {});
  try {
    for (const height of [844, 740, 664]) {
      const page = await browser.newPage({ viewport: { width: 390, height }, isMobile: true, hasTouch: true });
      await page.goto(new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/').href);
      await page.getByTestId('scene-skip').click();
      const suggested = page.locator('[data-cell-index][aria-label*="مقترح للدمج الأول"]');
      if (await suggested.count() !== 2) throw new Error('Expected two suggested tutorial pieces');
      for (const tile of await suggested.all()) {
        const highlight = tile.locator('[data-board-highlight="merge"]');
        if (await highlight.count() !== 1 || !(await highlight.isVisible())) throw new Error('A suggested piece lacks a visible merge highlight');
        const border = await highlight.evaluate(el => ({ width: parseFloat(getComputedStyle(el).borderTopWidth), color: getComputedStyle(el).borderTopColor }));
        if (border.width < 2 || border.color !== 'rgb(16, 185, 129)') throw new Error(`Suggested piece highlight is not visible: ${JSON.stringify(border)}`);
      }
      const cards = page.locator('[data-testid^="guest-card-"]');
      if (await cards.count() !== 3) throw new Error('Expected three guest cards');
      for (const card of await cards.all()) {
        if (await card.getByRole('button', { name: /^(دليل|Guide)$/ }).count()) throw new Error('A redundant Guide button remains under a guest');
      }
      await cards.first().getByRole('button', { name: /^دليل طلب / }).tap();
      await page.getByRole('dialog', { name: 'دليل الطلب' }).getByRole('button', { name: 'إغلاق' }).tap();
      for (const phase of ['coach', 'normal']) {
        if (phase === 'normal') {
          await page.getByTestId('tutorial-coach').getByRole('button').click();
          await page.getByTestId('daily-login-claim').click();
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        const bounds = await page.evaluate(() => {
          const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
          const coach = document.querySelector('[data-testid=tutorial-coach]');
          return { dock: rect('[data-testid=guest-order-dock]'), board: rect('[data-testid=merge-board-grid]'), header: rect('header'), nav: rect('[data-testid=bottom-nav]'), coach: coach?.getBoundingClientRect().toJSON() };
        });
        if (bounds.dock.top < bounds.header.bottom - 1 || bounds.board.bottom > bounds.nav.top + 1 || bounds.dock.bottom > bounds.board.top) {
          throw new Error(`${height}px ${phase}: guests and board are not visible together: ${JSON.stringify(bounds)}`);
        }
        if (phase === 'coach' && (!bounds.coach || bounds.coach.bottom > bounds.nav.top + 1)) throw new Error(`${height}px: tutorial coach is obscured`);
      }
      await page.locator('[data-cell-index="17"]').tap();
      if (!(await page.locator('[data-cell-index="17"] [data-board-highlight="selected"]').isVisible()) || !(await page.locator('[data-cell-index="18"] [data-board-highlight="merge"]').isVisible())) throw new Error('Selected piece or matching target lacks its highlight');
      await page.locator('[data-cell-index="18"]').tap();
      await page.getByRole('button', { name: /^تقديم طلب / }).first().waitFor();
      await page.evaluate(() => window.scrollTo(0, 0));
      const readyBounds = await page.evaluate(() => ({ board: document.querySelector('[data-testid=merge-board-grid]').getBoundingClientRect().toJSON(), nav: document.querySelector('[data-testid=bottom-nav]').getBoundingClientRect().toJSON() }));
      if (readyBounds.board.bottom > readyBounds.nav.top + 1) throw new Error(`${height}px ready order: board is obscured: ${JSON.stringify(readyBounds)}`);
      await page.getByRole('button', { name: /^تقديم طلب / }).first().tap();
      await page.evaluate(() => window.scrollTo(0, 0));
      const afterOrder = await page.evaluate(() => {
        const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
        return { dock: rect('[data-testid=guest-order-dock]'), board: rect('[data-testid=merge-board-grid]'), header: rect('header'), nav: rect('[data-testid=bottom-nav]') };
      });
      if (afterOrder.dock.top < afterOrder.header.bottom - 1 || afterOrder.board.bottom > afterOrder.nav.top + 1) {
        throw new Error(`${height}px after serving: guests or board are obscured: ${JSON.stringify(afterOrder)}`);
      }
      await page.close();
    }
    const landscape = await browser.newPage({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
    await landscape.goto(new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/').href);
    await landscape.getByTestId('scene-skip').click();
    const landscapeBounds = await landscape.evaluate(() => {
      const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
      return { dock: rect('[data-testid=guest-order-dock]'), board: rect('[data-testid=merge-board-grid]'), header: rect('header') };
    });
    if (landscapeBounds.board.top < landscapeBounds.header.bottom || landscapeBounds.board.bottom > 390 || landscapeBounds.dock.bottom > 390) throw new Error(`Landscape board or guests are clipped: ${JSON.stringify(landscapeBounds)}`);
    await landscape.close();
    console.log('Guests and board fit at 390 × 844, 390 × 740, 390 × 664 and 844 × 390; portrait checks include a merge and guest order.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
