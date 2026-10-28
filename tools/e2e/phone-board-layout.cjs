// Verify that guests and the full board share the initial screen on iPhone 13 Pro-sized viewports.
const { chromium } = require('playwright');

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    for (const height of [844, 740]) {
      const page = await browser.newPage({ viewport: { width: 390, height }, isMobile: true, hasTouch: true });
      await page.goto(new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/').href);
      await page.getByTestId('scene-skip').click();
      for (const phase of ['coach', 'normal']) {
        if (phase === 'normal') {
          await page.getByTestId('tutorial-coach').getByRole('button').click();
          await page.getByTestId('daily-login-claim').click();
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        const bounds = await page.evaluate(() => {
          const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
          return { dock: rect('[data-testid=guest-order-dock]'), board: rect('[data-testid=merge-board-grid]'), header: rect('header'), nav: rect('[data-testid=bottom-nav]') };
        });
        if (bounds.dock.top < bounds.header.bottom - 1 || bounds.board.bottom > bounds.nav.top + 1 || bounds.dock.bottom > bounds.board.top) {
          throw new Error(`${height}px ${phase}: guests and board are not visible together: ${JSON.stringify(bounds)}`);
        }
      }
      await page.close();
    }
    console.log('Guest cards and full board fit together at 390 × 844 and 390 × 740.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
