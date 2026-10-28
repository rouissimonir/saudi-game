/**
 * With "reduce motion" on, no animation may keep looping on the main screens (title, story scene, board, quests,
 * workshop, shop, Majlis). Finite transitions are allowed.
 *
 *   node tools/e2e/reduced-motion.cjs http://localhost:4173/
 */
const { chromium, devices } = require('playwright');

(async () => {
  const base = process.argv[2] || 'http://localhost:4173/';
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const b = await chromium.launch(executablePath ? { executablePath } : {});
  const ctx = await b.newContext({ ...devices['iPhone 13'], reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('qahwa_lang', 'en'); } catch {} });
  const pg = await ctx.newPage();
  const looping = {};
  const close = async () => { for (let i = 0; i < 4 && await pg.locator('[role=dialog]').count(); i++) { const d = pg.locator('[role=dialog]').last(); const c = d.getByRole('button', { name: /close|claim|skip|continue|resume/i }).first(); if (await c.count()) await c.tap().catch(() => {}); else await d.locator('button').first().tap().catch(() => {}); await pg.waitForTimeout(300); } };
  const probe = async (screen) => {
    await pg.waitForTimeout(700);
    const found = await pg.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect && a.effect.getComputedTiming().iterations === Infinity).map((a) => `${a.animationName || a.transitionProperty} on ${a.effect.target.tagName}.${String(a.effect.target.className).slice(0, 40)}`));
    if (found.length) looping[screen] = found;
  };
  await pg.goto(base); await probe('title');
  await pg.getByRole('button', { name: /play|start/i }).first().tap();
  await pg.getByTestId('scene-player').waitFor({ state: 'visible' }); await probe('story scene');
  await pg.locator('[data-testid=scene-skip]').tap(); await pg.waitForTimeout(1200);
  const cb = pg.locator('[data-testid=tutorial-coach] button'); if (await cb.count()) await cb.first().tap().catch(() => {});
  await pg.waitForTimeout(500); await close(); await pg.evaluate(() => window.scrollTo(0, 0));
  await pg.getByTestId('merge-board-grid').waitFor({ state: 'visible' }); await probe('board');
  for (const [id, target] of [['quests', 'quests-modal'], ['workshop', 'workshop-modal'], ['shop', 'shop-gift'], ['majlis', 'majlis-stage']]) {
    await pg.getByTestId(`nav-${id}`).tap();
    await pg.getByTestId(target).waitFor({ state: 'visible' });
    await probe(id); await close();
  }
  const bad = Object.entries(looping);
  console.log(bad.length ? bad.map(([s, l]) => `FAIL ${s}: ${l.join('; ')}`).join('\n') : 'ok   no looping animation with reduce motion on, on 7 screens');
  await b.close();
  if (bad.length) process.exitCode = 1;
})();
