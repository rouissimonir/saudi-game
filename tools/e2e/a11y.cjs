/**
 * Automated accessibility audit (axe-core, WCAG 2.0/2.1/2.2 A and AA plus best practice) of the main screens on a phone
 * viewport, in English and Arabic: story scene and choice, board with the coach, daily gift, event, energy, shop,
 * Majlis wing cards and the pause menu. Prints one line per failing rule with the screens and an example element.
 *
 *   npm install --no-save axe-core
 *   node tools/e2e/a11y.cjs <en,ar> <baseUrl>
 *   node tools/e2e/a11y.cjs en,ar http://localhost:4173/
 *
 * Passing is necessary, not sufficient: it does not replace VoiceOver, Switch Control or Voice Control testing on a device.
 */
const { chromium, devices } = require('playwright');
const AXE = require.resolve('axe-core/axe.min.js');
const BASE = process.argv[3] || 'http://localhost:4173/';
const langs = (process.argv[2] || 'en,ar').split(',');
(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const b = await chromium.launch(executablePath ? { executablePath } : {}); const all = {};
  try {
  for (const lang of langs) {
    const ctx = await b.newContext({ ...devices['iPhone 13'] });
    await ctx.addInitScript((l) => { try { localStorage.setItem('qahwa_lang', l); } catch {} }, lang);
    const pg = await ctx.newPage();
    const run = async (name) => {
      // Sample finished colours, not the middle of a fade (a tab that was just tapped is still transitioning)
      await pg.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation-duration:0s!important}' }).catch(() => {});
      await pg.addScriptTag({ path: AXE });
      all[`${lang}:${name}`] = await pg.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'], resultTypes: ['violations'] }).then(r => r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, sample: v.nodes.slice(0, 4).map(n => n.target.join(' ').slice(0, 90) + ' :: ' + (n.html || '').slice(0, 90)) }))));
    };
    const closeDialogs = async () => { for (let i = 0; i < 4 && await pg.locator('[role=dialog]').count(); i++) { const d = pg.locator('[role=dialog]').last(); const c = d.getByRole('button', { name: /close|claim|skip|continue|resume|إغلاق|استلام|استلم|تخطي|استئناف/i }).first(); if (await c.count()) await c.tap(); else await d.locator('button').first().tap(); await pg.waitForTimeout(300); } if (await pg.locator('[role=dialog]').count()) throw new Error('Could not close dialogs'); };
    await pg.goto(BASE); await pg.waitForTimeout(1200);
    await pg.getByRole('button', { name: /play|start|العب|ابدأ/i }).first().tap(); await pg.waitForTimeout(2000);
    // story choice: tap through until a choice appears
    for (let i = 0; i < 14; i++) { if (await pg.locator('[data-testid^=scene-choice]').count()) break; await pg.mouse.click(195, 420); await pg.waitForTimeout(900); }
    if (await pg.locator('[data-testid^=scene-choice]').count()) await run('story-choice');
    await pg.locator('[data-testid=scene-skip]').tap(); await pg.waitForTimeout(1500);
    const cb = pg.locator('[data-testid=tutorial-coach] button'); if (await cb.count()) { await run('board-with-coach'); await cb.first().tap(); await pg.waitForTimeout(700); }
    if (await pg.locator('[data-testid=daily-login-modal]').count()) { await run('daily-gift'); await closeDialogs(); }
    await closeDialogs(); await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(300);
    await run('board');
    const ev = pg.locator('[data-testid=event-bar]:visible').first(); if (await ev.count()) { await ev.tap(); await pg.getByTestId('event-modal').waitFor(); await run('event'); await closeDialogs(); }
    await pg.getByTestId('hud-energy').tap(); await pg.getByTestId('energy-modal').waitFor(); await run('energy'); await closeDialogs();
    await pg.getByTestId('nav-shop').tap(); await pg.getByTestId('shop-tab-milestones').tap(); if (await pg.getByTestId('shop-tab-milestones').getAttribute('aria-selected') !== 'true') throw new Error('Shop milestones tab did not open'); await run('shop-milestones'); await closeDialogs();
    await pg.getByTestId('nav-majlis').tap(); await pg.getByTestId('wing-pic-0').scrollIntoViewIfNeeded(); await run('majlis-wings');
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(500);
    if (await pg.locator('[role=dialog]').count()) { await run('pause-menu'); await closeDialogs(); }
    await ctx.close();
  }
  const rules = {};
  for (const [screen, vs] of Object.entries(all)) for (const v of vs) { (rules[v.id] ||= { impact: v.impact, help: v.help, screens: {}, total: 0, sample: v.sample }); rules[v.id].screens[screen] = v.n; rules[v.id].total += v.n; }
  for (const [id, r] of Object.entries(rules).sort((a, b) => b[1].total - a[1].total)) console.log(`${id} [${r.impact}] total ${r.total} :: ${r.help}\n   ${Object.entries(r.screens).map(([s, n]) => `${s}=${n}`).join(' ')}\n   e.g. ${r.sample.slice(0, 3).join('\n        ')}`);
  console.log('screens audited', Object.keys(all).join(', '));
  if (Object.keys(rules).length) process.exitCode = 1;
  } finally { await b.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
