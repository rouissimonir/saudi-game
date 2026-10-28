/**
 * Keyboard-only checks on a desktop-size viewport:
 *  - the story scene can be advanced with Enter alone, Tab stays inside it, Enter on Skip skips;
 *  - a dialogue choice can be picked with the keyboard;
 *  - a modal dialog (the Shop) takes focus, keeps Tab and Shift+Tab inside, and Escape returns focus to what opened it;
 *  - every tab stop on the board shows a focus style.
 *
 *   node tools/e2e/keyboard.cjs http://localhost:4173/
 */
const { chromium } = require('playwright');

(async () => {
  const base = process.argv[2] || 'http://localhost:4173/';
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const b = await chromium.launch(executablePath ? { executablePath } : {});
  const ctx = await b.newContext({ viewport: { width: 1024, height: 800 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('qahwa_lang', 'en'); } catch {} });
  const log = [];
  const check = (name, ok, detail = '') => log.push(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : detail ? ` (${detail})` : ''}`);
  const pg = await ctx.newPage();
  const active = () => pg.evaluate(() => { const e = document.activeElement; return e ? e.getAttribute('data-testid') || e.tagName : null; });
  const insideTopDialog = () => pg.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog][aria-modal=true]')].pop(); return d ? d.contains(document.activeElement) : null; });

  await pg.goto(new URL('?autostart=1', base).href);
  await pg.getByTestId('scene-player').waitFor({ timeout: 8000 });
  const tabs = []; for (let i = 0; i < 6; i++) { await pg.keyboard.press('Tab'); tabs.push(await insideTopDialog()); }
  check('scene: Tab stays inside the story scene', tabs.every(Boolean), tabs.join());
  await pg.evaluate(() => document.querySelector('[data-testid=scene-player]').focus());
  let presses = 0;
  for (; presses < 40 && !(await pg.getByTestId('scene-choices').count()); presses++) { await pg.keyboard.press('Enter'); await pg.waitForTimeout(250); }
  check('scene: Enter alone reaches the first choice', await pg.getByTestId('scene-choices').count() > 0, `${presses} presses`);
  await pg.locator('[data-testid^=scene-choice-]').first().focus(); await pg.keyboard.press('Enter'); await pg.waitForTimeout(700);
  check('scene: a choice is picked with Enter', (await pg.getByTestId('scene-choices').count()) === 0);
  await pg.getByTestId('scene-skip').focus(); await pg.keyboard.press('Enter'); await pg.waitForTimeout(1500);
  check('scene: Enter on Skip skips', (await pg.getByTestId('scene-player').count()) === 0);

  for (let i = 0; i < 3 && await pg.locator('[role=dialog]').count(); i++) { const c = pg.locator('[role=dialog]').last().getByRole('button', { name: /claim|close|skip/i }).first(); if (await c.count()) await c.click(); await pg.waitForTimeout(300); }
  await pg.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
  const stops = [];
  for (let i = 0; i < 40; i++) { await pg.keyboard.press('Tab'); stops.push(await pg.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const cs = getComputedStyle(e); return { name: e.getAttribute('aria-label') || e.textContent.trim().slice(0, 20), ring: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none' }; })); }
  const noRing = stops.filter((s) => s && !s.ring);
  check('board: every tab stop shows a focus style', noRing.length === 0, noRing.map((s) => s.name).join(', '));

  await pg.locator('[data-testid=nav-shop]').focus(); await pg.keyboard.press('Enter'); await pg.waitForTimeout(600);
  check('shop: focus moves into the dialog on open', await insideTopDialog() === true);
  const fwd = [], back = [];
  for (let i = 0; i < 14; i++) { await pg.keyboard.press('Tab'); fwd.push(await insideTopDialog()); }
  for (let i = 0; i < 14; i++) { await pg.keyboard.press('Shift+Tab'); back.push(await insideTopDialog()); }
  check('shop: Tab and Shift+Tab stay inside the dialog', fwd.every(Boolean) && back.every(Boolean));
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(500);
  check('shop: Escape closes it and returns focus to the tab', (await pg.locator('[role=dialog][aria-modal=true]').count()) === 0 && (await active()) === 'nav-shop', String(await active()));

  console.log(log.join('\n'));
  await b.close();
  if (log.some((l) => l.startsWith('FAIL'))) process.exitCode = 1;
})();
