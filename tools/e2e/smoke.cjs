// End-to-end smoke test: clicks through every screen on a phone viewport and fails on any console error.
// Usage: npm run build && npx vite preview, then in another terminal: node tools/e2e/smoke.cjs http://localhost:4173/
const { chromium, devices } = require('playwright');
(async () => {
  const base = process.argv[2] || 'http://localhost:4173/';
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const b = await chromium.launch(executablePath ? { executablePath } : {});
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push('pageerror: ' + e.message)); pg.on('console', m => m.type() === 'error' && errs.push('console: ' + m.text()));
  const log = []; const step = async (name, fn) => { try { await fn(); log.push('ok   ' + name); } catch (e) { log.push('FAIL ' + name + ' — ' + e.message.split('\n')[0]); } };
  const closeDialogs = async () => { for (let i = 0; i < 4 && await pg.locator('[role=dialog]').count(); i++) { const d = pg.locator('[role=dialog]').last(); const c = d.getByRole('button', { name: /close|إغلاق|✕|استلم|claim|متابعة|continue|لاحق|skip|تخطي/i }).first(); if (await c.count()) await c.tap(); else await d.locator('button').first().tap(); await pg.waitForTimeout(250); } };
  await step('title renders', async () => { await pg.goto(base); await pg.getByRole('button', { name: /start|ابدأ|play|العب/i }).first().waitFor({ timeout: 8000 }); });
  await step('start game', async () => { await pg.getByRole('button', { name: /start|ابدأ|play|العب/i }).first().tap(); await pg.waitForTimeout(700); });
  await step('opening prologue plays, then skip', async () => {
    await pg.locator('[data-testid=scene-player]').waitFor({ timeout: 8000 });
    for (let i = 0; i < 3; i++) { await pg.mouse.click(195, 300); await pg.waitForTimeout(250); }
    await pg.locator('[data-testid=scene-skip]').tap();
    await pg.locator('[data-testid=merge-board-grid]').waitFor({ timeout: 4000 });
    if (await pg.locator('[data-testid=scene-player]').count()) throw new Error('scene still open');
  });
  await step('daily login claim', async () => { const c = pg.getByRole('button', { name: /استلم هديتي|claim/i }).first(); if (await c.count()) { await c.tap(); await pg.waitForTimeout(300); } });
  await closeDialogs();
  const cells = pg.locator('[data-cell-index]');
  await step('tap select + tap merge', async () => {
    const labels = await cells.evaluateAll(es => es.map(e => e.getAttribute('aria-label')));
    const g = labels.findIndex(l => /مولد|Generator/.test(l));
    for (let i = 0; i < 6; i++) { await cells.nth(g).tap(); await pg.waitForTimeout(120); }
    const l2 = await cells.evaluateAll(es => es.map(e => e.getAttribute('aria-label')));
    const m = {}; let pair = null; l2.forEach((l, i) => { if (/مولد|Generator|فارغة|Empty|رمال|Sand/.test(l)) return; const k = l.replace(/\(.*\)/, '').trim(); if (m[k] !== undefined && !pair) pair = [m[k], i]; else m[k] = i; });
    if (!pair) throw new Error('no pair');
    // spawning auto-selects the new item; tap it again to clear the selection before the tap-tap merge
    const sel = await pg.evaluate(() => JSON.parse(localStorage.getItem('qahwa_majlis_merge_save_v3')).selectedCellIndex);
    if (sel !== null) { await cells.nth(sel).tap(); await pg.waitForTimeout(200); }
    const l3 = await cells.evaluateAll(es => es.map(e => e.getAttribute('aria-label')));
    const m2 = {}; pair = null; l3.forEach((l, i) => { if (/مولد|Generator|فارغة|Empty|رمال|Sand/.test(l)) return; const k = l.replace(/\(.*\)/, '').trim(); if (m2[k] !== undefined && !pair) pair = [m2[k], i]; else m2[k] = i; });
    await cells.nth(pair[0]).tap(); await pg.waitForTimeout(150); await cells.nth(pair[1]).tap(); await pg.waitForTimeout(400);
    const after = await cells.nth(pair[0]).getAttribute('aria-label'); if (!/فارغة|Empty/.test(after)) throw new Error('tap-merge did not merge: ' + after);
  });
  await step('sell selected item', async () => { const l = await cells.evaluateAll(es => es.map(e => e.getAttribute('aria-label'))); const i = l.findIndex(x => /Lv\./.test(x) && !/مولد|Generator|رمال|Sand/.test(x)); await cells.nth(i).tap(); const sell = pg.getByRole('button', { name: /بيع|Sell/ }).first(); if (await sell.count()) { await sell.tap(); await pg.waitForTimeout(200); } });
  await step('quests sheet', async () => { await pg.locator('[data-testid=nav-quests]').tap(); await pg.locator('[data-testid=quests-modal]').waitFor({ timeout: 3000 }); await closeDialogs(); });
  await step('workshop upgrade', async () => { await pg.locator('[data-testid=nav-workshop]').tap(); await pg.locator('[data-testid=workshop-modal]').waitFor({ timeout: 3000 }); await closeDialogs(); });
  await step('shop: daily gift once, milestones tab', async () => {
    await pg.locator('[data-testid=nav-shop]').tap();
    const claim = pg.locator('[data-testid=shop-gift-claim]');
    await claim.waitFor({ timeout: 4000 });
    if (await claim.isDisabled()) throw new Error('daily gift not claimable on a new save');
    await claim.tap();
    await pg.waitForTimeout(150);
    if (!(await claim.isDisabled())) throw new Error('daily gift claimable twice');
    await pg.locator('[data-testid=shop-tab-milestones]').tap();
    await pg.locator('[data-testid=shop-points]').waitFor({ timeout: 2000 });
    await closeDialogs();
  });
  await step('wheel spin', async () => { await pg.getByRole('button', { name: /القائمة|Menu/ }).tap(); await pg.getByRole('button', { name: /عجلة|wheel/i }).tap(); await pg.waitForTimeout(500); const spin = pg.locator('[role=dialog]').getByRole('button', { name: /أدر|spin|دوّر|مجاني|free/i }).first(); if (await spin.count()) { await spin.tap(); await pg.waitForTimeout(3500); } await closeDialogs(); });
  await step('chains guide', async () => { await pg.getByRole('button', { name: /دليل السلاسل|Chains/ }).tap(); await pg.waitForTimeout(400); await closeDialogs(); });
  await step('energy sheet', async () => { await pg.locator('[data-testid=hud-energy]').tap(); await pg.locator('[data-testid=energy-modal]').waitFor({ timeout: 3000 }); await closeDialogs(); });
  await step('event sheet', async () => { const coach = pg.locator('[data-testid=tutorial-coach] button'); if (await coach.count()) { await coach.first().tap(); await pg.waitForTimeout(500); await closeDialogs(); } /* the event bar is hidden while the first-session coach shows; the daily gift opens once it is dismissed */ await pg.evaluate(() => window.scrollTo(0, 0)); /* the board is scrolled into view; the bar sits above it */ await pg.locator('[data-testid=event-bar]:visible').first().tap(); await pg.locator('[data-testid=event-modal]').waitFor({ timeout: 3000 }); await closeDialogs(); });
  await step('pour mini-game', async () => {
    await pg.evaluate(() => { const k = 'qahwa_majlis_merge_save_v3'; const s = JSON.parse(localStorage.getItem(k)); s.pourTokens = 2; s.tutorialDismissed = true; localStorage.setItem(k, JSON.stringify(s)); });
    await pg.reload(); await pg.getByRole('button', { name: /start|ابدأ|play|العب|continue/i }).first().tap(); await pg.waitForTimeout(600); await closeDialogs();
    await pg.locator('[data-testid=pour-challenge-button]').tap(); await pg.waitForTimeout(500);
    const hold = pg.locator('[role=dialog] button').filter({ hasText: /اضغط|hold|صب|pour/i }).first();
    if (await hold.count()) { const bb = await hold.boundingBox(); await pg.mouse.move(bb.x + 5, bb.y + 5); await pg.mouse.down(); await pg.waitForTimeout(900); await pg.mouse.up(); await pg.waitForTimeout(600); }
    await closeDialogs();
  });
  await step('majlis + style + story', async () => {
    await pg.locator('[data-testid=nav-majlis]').tap(); await pg.locator('[data-testid=area-name]').waitFor({ timeout: 4000 });
    await pg.evaluate(() => { const k = 'qahwa_majlis_merge_save_v3'; const s = JSON.parse(localStorage.getItem(k)); s.stars = 50; s.coins = 5000; localStorage.setItem(k, JSON.stringify(s)); });
    await pg.reload(); await pg.getByRole('button', { name: /start|ابدأ|play|العب|continue/i }).first().tap(); await pg.waitForTimeout(600); await closeDialogs();
    await pg.locator('[data-testid=nav-majlis]').tap(); await pg.waitForTimeout(500);
    const restore = pg.getByRole('button', { name: /ترميم الجناح|Restore Wing/ }).first(); await restore.tap(); await pg.waitForTimeout(800);
    await closeDialogs();
  });
  await step('pause + resume', async () => { await pg.getByRole('button', { name: /القائمة|Menu/ }).tap(); await pg.getByRole('button', { name: /إيقاف مؤقت|Pause/ }).tap(); await pg.waitForTimeout(300); await pg.getByRole('button', { name: /استئناف|Resume/ }).tap(); });
  await step('switch to English', async () => { await pg.getByRole('button', { name: /القائمة|Menu/ }).tap(); await pg.getByRole('button', { name: 'English' }).tap(); await pg.getByText('Board').first().waitFor({ timeout: 2000 }); });
  await step('fasih kids page', async () => { const p2 = await ctx.newPage(); p2.on('pageerror', e => errs.push('fasih: ' + e.message)); await p2.goto(base + 'fasih.html'); await p2.waitForTimeout(1200); const n = await p2.locator('button').count(); if (n < 1) throw new Error('no buttons'); await p2.locator('button').first().tap(); await p2.waitForTimeout(500); await p2.close(); });
  console.log(log.join('\n')); console.log('errors', errs.length ? errs : '[]');
  await b.close();
  if (errs.length || log.some(entry => entry.startsWith('FAIL '))) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
