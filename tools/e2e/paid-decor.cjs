const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(process.env.E2E_URL || 'http://localhost:4207');
    await page.evaluate(async () => {
      const React = await import('/node_modules/.vite/deps/react.js');
      const { createRoot } = await import('/node_modules/.vite/deps/react-dom_client.js');
      const { PaidMajlisDecor } = await import('/src/components/PaidMajlisDecor.tsx');
      const access = await import('/src/utils/paidAccess.ts');
      window.testPaidAccess = access.updatePaidAccess;
      document.getElementById('root').remove();
      const root = document.createElement('div'); document.body.appendChild(root);
      createRoot(root).render(React.createElement(PaidMajlisDecor, { lang: 'en' }));
    });
    const decor = page.getByTestId('paid-majlis-decor');
    if (await decor.count()) throw new Error('Unowned decorations are visible');
    await page.evaluate(() => window.testPaidAccess({ majlis_decor_pack: { isActive: true, expirationDate: null } }));
    await decor.waitFor();
    await decor.getByRole('button', { name: 'Taif rose' }).click();
    if (await decor.getByRole('button', { name: 'Taif rose' }).getAttribute('aria-pressed') !== 'true') throw new Error('Style selection failed');
    if (process.env.E2E_SCREENSHOT) await page.screenshot({ path: process.env.E2E_SCREENSHOT });
    await page.evaluate(() => window.testPaidAccess({}));
    await decor.waitFor({ state: 'detached' });
    await page.evaluate(() => window.testPaidAccess({ majlis_membership: { isActive: true, expirationDate: new Date(Date.now() + 600).toISOString() } }));
    await decor.waitFor();
    await decor.waitFor({ state: 'detached' });
    console.log('Decor ownership, selection, revocation and timed membership expiry passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
