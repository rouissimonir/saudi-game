// With more than three guests the order dock scrolls sideways; with three it looks as before.
const { chromium } = require('playwright');
(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const key = 'qahwa_majlis_merge_save_v3';
    await page.goto(new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/').href);
    await page.getByTestId('scene-skip').click();
    await page.waitForFunction(k => !!localStorage.getItem(k), key);
    const dock = () => page.getByTestId('guest-order-dock').evaluate(e => ({ scroll: e.scrollWidth, client: e.clientWidth, cards: e.children.length }));
    const three = await dock();
    if (three.cards !== 3 || three.scroll > three.client + 1) throw new Error(`Three guests should fit: ${JSON.stringify(three)}`);
    await page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k)); s.tutorialDismissed = true; s.activeOrders.push({ ...s.activeOrders[0], id: 'extra_1' }, { ...s.activeOrders[1], id: 'extra_2' }); localStorage.setItem(k, JSON.stringify(s)); }, key);
    await page.reload();
    const claim = page.getByTestId('daily-login-claim');
    if (await claim.isVisible().catch(() => false)) await claim.click();
    const five = await dock();
    if (five.cards !== 5 || five.scroll <= five.client + 20) throw new Error(`Five guests should scroll: ${JSON.stringify(five)}`);
    const widths = await page.locator('[data-testid^="guest-card-"]').evaluateAll(els => els.map(e => Math.round(e.getBoundingClientRect().width)));
    if (Math.max(...widths) - Math.min(...widths) > 1) throw new Error(`Cards differ in width: ${widths}`);
    console.log(`Order dock: 3 guests fit, 5 guests scroll sideways (${widths[0]} px cards).`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
