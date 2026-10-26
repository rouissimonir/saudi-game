// Monkey test: thousands of random taps, button presses and drags across the whole game, then a save sanity check.
// Reports any page error or console error. Usage: npm run build && npx vite preview, then:
//   node tools/e2e/monkey.cjs <seed> <ar|en> <steps> http://localhost:4173/
const { chromium, devices } = require('playwright');
(async () => {
  const base = process.argv[5] || 'http://localhost:4173/';
  const seed = Number(process.argv[2] || 1), lang = process.argv[3] || 'ar', steps = Number(process.argv[4] || 900);
  let x = seed; const rnd = () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648);
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  await ctx.addInitScript((l) => localStorage.setItem('qahwa_lang', l), lang);
  const pg = await ctx.newPage();
  const errs = new Map();
  const note = (m) => errs.set(m.slice(0, 160), (errs.get(m.slice(0, 160)) || 0) + 1);
  pg.on('pageerror', (e) => note('pageerror: ' + e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) note('console: ' + m.text()); });
  await pg.goto(base);
  await pg.getByRole('button', { name: /start|ابدأ|play|العب/i }).first().tap();
  // generous resources so purchases, upgrades and restores actually happen
  await pg.waitForTimeout(800);
  await pg.evaluate(() => { const k = 'qahwa_majlis_merge_save_v3'; const s = JSON.parse(localStorage.getItem(k) || 'null'); if (s) { s.coins = 50000; s.diamonds = 5000; s.stars = 200; s.energy = 500; localStorage.setItem(k, JSON.stringify(s)); } });
  await pg.reload(); await pg.getByRole('button', { name: /start|ابدأ|play|العب|continue|متابعة/i }).first().tap();
  const { width: W, height: H } = pg.viewportSize();
  let taps = 0, drags = 0, buttons = 0;
  for (let i = 0; i < steps; i++) {
    const r = rnd();
    try {
      if (r < 0.45) { // tap a random visible button
        const btns = pg.locator('button:visible');
        const n = await btns.count();
        if (n) { await btns.nth(Math.floor(rnd() * n)).click({ timeout: 800, force: true }); buttons++; }
      } else if (r < 0.8) { await pg.mouse.click(rnd() * W, rnd() * H); taps++; }
      else { // drag across the board area
        const x0 = rnd() * W, y0 = H * (0.3 + rnd() * 0.5);
        await pg.mouse.move(x0, y0); await pg.mouse.down(); await pg.mouse.move(x0 + (rnd() - 0.5) * 160, y0 + (rnd() - 0.5) * 160, { steps: 4 }); await pg.mouse.up(); drags++;
      }
    } catch { /* element vanished mid-click: fine */ }
    if (rnd() < 0.02) await pg.keyboard.press(['Escape', 'Enter', 'p', ' '][Math.floor(rnd() * 4)]);
    await pg.waitForTimeout(25);
  }
  const alive = await pg.evaluate(() => document.body.innerText.length > 50);
  // the save must still be sane: no negative or non-finite currencies, an intact board
  await pg.waitForTimeout(600);
  const save = await pg.evaluate(() => JSON.parse(localStorage.getItem('qahwa_majlis_merge_save_v3') || 'null'));
  const bad = [];
  if (!save) bad.push('no save');
  else {
    for (const k of ['coins', 'diamonds', 'energy', 'stars', 'xp', 'level']) if (!(Number.isFinite(save[k]) && save[k] >= 0)) bad.push(`${k}=${save[k]}`);
    if (!Array.isArray(save.board) || save.board.length === 0) bad.push('board missing');
  }
  if (bad.length) note('save: ' + bad.join(', '));
  console.log(`seed ${seed} ${lang}: ${buttons} buttons, ${taps} taps, ${drags} drags | page alive: ${alive} | distinct errors: ${errs.size}`);
  for (const [m, n] of errs) console.log(`  x${n} ${m}`);
  await b.close();
})();
