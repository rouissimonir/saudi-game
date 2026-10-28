/**
 * Records real gameplay clips for the marketing video, one clip per scene, on an iPhone-sized screen.
 *
 *   node tools/promo/record.cjs <ar|en> <baseUrl> <outDir> [scenes]
 *   node tools/promo/record.cjs ar http://localhost:4173/promo/ promo_raw/ prologue,board,taif,night
 *
 * Scenes: prologue (title + opening story), board (generator taps and finger-drag merges), taif (half-restored Majlis,
 * golden light), night (restored Majlis at night). The area scenes play through the game's own travel first in a
 * hidden setup context, then record only the result. A soft dot follows the pointer so taps and drags are visible
 * in a recording that has no finger. Edit the clips together with tools/promo/edit.sh.
 *
 * Run with PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH set if the bundled browser build does not match.
 */
const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

const lang = process.argv[2] || 'ar';
const BASE = process.argv[3] || 'http://localhost:4173/';
const OUT = path.resolve(process.argv[4] || 'promo_raw/');
const only = process.argv[5] ? process.argv[5].split(',') : ['prologue', 'board', 'taif', 'night'];
fs.mkdirSync(OUT, { recursive: true });
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const VIEW = { width: 430, height: 932 };
const SAVE = 'qahwa_majlis_merge_save_v3';
const PLAY = /play|start|continue|العب|ابدأ|متابعة/i;

const DOT = () => {
  const dot = document.createElement('div');
  dot.style.cssText = 'position:fixed;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:rgba(255,244,214,.55);border:2px solid rgba(255,255,255,.8);box-shadow:0 0 18px rgba(255,214,140,.7);pointer-events:none;z-index:2147483647;opacity:0;transition:opacity .25s,transform .12s;';
  const mount = () => document.documentElement.appendChild(dot);
  if (document.documentElement) mount(); else addEventListener('DOMContentLoaded', mount);
  const move = (e) => { dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px'; dot.style.opacity = '1'; };
  addEventListener('pointerdown', (e) => { move(e); dot.style.transform = 'scale(.7)'; }, true);
  addEventListener('pointermove', move, true);
  addEventListener('pointerup', () => { dot.style.transform = 'scale(1)'; setTimeout(() => { dot.style.opacity = '0'; }, 450); }, true);
};

async function context(b, { record, storageState } = {}) {
  const ctx = await b.newContext({
    ...devices['iPhone 14 Pro Max'], viewport: VIEW, storageState,
    deviceScaleFactor: 2,
  });
  await ctx.addInitScript((l) => { try { if (!localStorage.getItem('qahwa_lang')) localStorage.setItem('qahwa_lang', l); } catch {} }, lang);
  if (record) await ctx.addInitScript(DOT);
  return ctx;
}
async function settle(pg) {
  for (let i = 0; i < 3 && await pg.locator('[role=dialog]').count(); i++) {
    const c = pg.locator('[role=dialog]').last().getByRole('button', { name: /claim|close|skip|استلم|استلام|إغلاق|تخطي/i }).first();
    if (await c.count()) await c.tap().catch(() => {});
    await pg.waitForTimeout(350);
  }
}
async function reopen(pg) {
  await pg.reload(); await pg.waitForTimeout(900);
  const st = pg.getByRole('button', { name: PLAY }).first(); if (await st.count()) await st.tap();
  await pg.waitForTimeout(900); await settle(pg);
}
const patch = (pg, fn, arg) => pg.evaluate(([src, a]) => { const k = 'qahwa_majlis_merge_save_v3'; const s = JSON.parse(localStorage.getItem(k)); (new Function('s', 'a', src))(s, a); localStorage.setItem(k, JSON.stringify(s)); }, [`(${fn.toString()})(s, a)`, arg]);

/** Finds a started game with the prologue skipped and a comfortable save. */
async function freshSetup(b) {
  const ctx = await context(b); const pg = await ctx.newPage();
  await pg.goto(BASE); await pg.waitForTimeout(900);
  await pg.getByRole('button', { name: PLAY }).first().click(); await pg.waitForTimeout(1000);
  await pg.locator('[data-testid=scene-skip]').tap(); await pg.waitForTimeout(1500); await settle(pg);
  await patch(pg, (s) => { s.seenScenes = ['prologue']; s.lastLoginDay = new Date().toISOString().slice(0, 10); s.tutorialDismissed = true; s.coins = 1240; s.diamonds = 85; s.level = 7; s.stars = 6; s.energy = 100; }, null);
  await reopen(pg);
  return { ctx, pg };
}
async function travel(pg, steps) {
  for (let a = 0; a < steps; a++) {
    console.log(`travel ${a + 1}/${steps}`);
    await patch(pg, (s) => { s.renovationZones.forEach((z) => { z.unlockedLevel = 2; }); s.stars = 40; }, null); await reopen(pg);
    await pg.locator('[data-testid=nav-majlis]').tap(); await pg.waitForTimeout(900);
    await pg.locator('[data-testid=advance-area] button').first().tap(); await pg.waitForTimeout(1200);
    for (let i = 0; i < 4; i++) { const sk = pg.locator('[data-testid=scene-skip]'); if (await sk.count()) { await sk.tap().catch(() => {}); await pg.waitForTimeout(900); } await settle(pg); }
    await pg.locator('[data-testid=nav-board]').tap().catch(() => {}); await pg.waitForTimeout(500);
  }
}
async function saveState(ctx, name) { const f = path.join(OUT, `state_${name}.json`); await ctx.storageState({ path: f }); return f; }
/** Screen capture through DevTools at the phone's real pixel density (the built-in recorder only captures at 1x). */
async function startCapture(ctx, pg, name) {
  const dir = path.join(OUT, `${lang}_${name}_frames`); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const cdp = await ctx.newCDPSession(pg); const frames = []; let n = 0;
  cdp.on('Page.screencastFrame', (f) => {
    const file = path.join(dir, String(++n).padStart(6, '0') + '.jpg');
    fs.writeFileSync(file, Buffer.from(f.data, 'base64')); frames.push({ file, t: f.metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: VIEW.width * 2, maxHeight: VIEW.height * 2, everyNthFrame: 1 });
  return { dir, frames, cdp };
}
async function finish(ctx, pg, name, cap) {
  await cap.cdp.send('Page.stopScreencast').catch(() => {}); await pg.waitForTimeout(200);
  const list = cap.frames.map((f, i) => `file '${f.file}'\nduration ${((cap.frames[i + 1] ? cap.frames[i + 1].t : f.t + 0.5) - f.t).toFixed(4)}`).join('\n') + `\nfile '${cap.frames[cap.frames.length - 1].file}'\n`;
  const lf = path.join(cap.dir, 'list.txt'); fs.writeFileSync(lf, list);
  const dest = path.join(OUT, `${lang}_${name}.mp4`);
  require('child_process').execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lf, '-vf', 'fps=30,scale=860:1864:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', dest]);
  fs.rmSync(cap.dir, { recursive: true, force: true }); await ctx.close();
  console.log('recorded', dest, cap.frames.length + ' frames');
}
/** Real touch drag through DevTools, so the game sees the same events a finger sends. */
async function drag(pg, cdp, from, to, ms = 700) {
  const a = await from.boundingBox(), b = await to.boundingBox();
  const x = a.x + a.width / 2, y = a.y + a.height / 2, tx = b.x + b.width / 2, ty = b.y + b.height / 2;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  const n = 14;
  for (let i = 1; i <= n; i++) {
    const t = i / n, e = t * t * (3 - 2 * t);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (tx - x) * e, y: y + (ty - y) * e }] });
    await pg.waitForTimeout(ms / n);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

(async () => {
  const b = await chromium.launch(executablePath ? { executablePath } : {});

  if (only.includes('prologue')) { // title, then the opening story, as a new player sees it
    const ctx = await context(b, { record: OUT }); const pg = await ctx.newPage(); const cap = await startCapture(ctx, pg, 'prologue');
    await pg.goto(BASE); await pg.waitForTimeout(3200);
    await pg.getByRole('button', { name: PLAY }).first().tap();
    await pg.locator('[data-testid=scene-player]').waitFor({ timeout: 8000 });
    await pg.waitForTimeout(3500);
    for (let i = 0; i < 5; i++) { await pg.mouse.click(215, 520); await pg.waitForTimeout(2600); }
    await finish(ctx, pg, 'prologue', cap);
  }

  if (only.includes('board')) { // spawn from the generator, then merge pairs with a finger-drag
    const setup = await freshSetup(b); const state = await saveState(setup.ctx, 'board'); await setup.ctx.close();
    const ctx = await context(b, { record: OUT, storageState: state }); const pg = await ctx.newPage(); const cap = await startCapture(ctx, pg, 'board');
    await pg.goto(BASE); await pg.waitForTimeout(1200);
    const st = pg.getByRole('button', { name: PLAY }).first(); if (await st.count()) await st.tap();
    await pg.waitForTimeout(1500); await settle(pg);
    const hint = pg.locator('[data-testid=tutorial-coach] button'); if (await hint.count()) await hint.tap();
    await pg.waitForTimeout(1200);
    const cells = pg.locator('[data-cell-index]');
    const labels = () => cells.evaluateAll((es) => es.map((e) => e.getAttribute('aria-label')));
    const gen = (await labels()).findIndex((l) => /مولد|Generator/.test(l));
    for (let i = 0; i < 6; i++) { await cells.nth(gen).tap(); await pg.waitForTimeout(650); }
    const cdp = await ctx.newCDPSession(pg);
    for (let round = 0; round < 4; round++) {
      const l = await labels(); const seen = {}; let pair = null;
      l.forEach((t, i) => { if (!t || /مولد|Generator|فارغة|Empty|رمال|Sand/.test(t)) return; const k = t.replace(/\(.*\)/, '').trim(); if (seen[k] !== undefined && !pair) pair = [seen[k], i]; else seen[k] = i; });
      if (!pair) { await cells.nth(gen).tap(); await pg.waitForTimeout(700); continue; }
      await drag(pg, cdp, cells.nth(pair[0]), cells.nth(pair[1])); await pg.waitForTimeout(1300);
    }
    await pg.waitForTimeout(1500);
    await finish(ctx, pg, 'board', cap);
  }

  for (const name of ['taif', 'night']) {
    if (!only.includes(name)) continue;
    const target = name === 'taif' ? 3 : 6, frac = name === 'taif' ? 0.5 : 1;
    const mood = name === 'taif' ? (lang === 'ar' ? 'عصاري نجد' : 'Golden Afternoon') : (lang === 'ar' ? 'ليالي الفوانيس' : 'Lantern Night'); // exact names: the event bar shares a word with the night mood
    const setup = await freshSetup(b); const { pg } = setup;
    await travel(pg, target);
    await patch(pg, (s, f) => { s.renovationZones.forEach((z) => { z.unlockedLevel = Math.round(2 * f); }); s.stars = 6; s.tutorialDismissed = true; }, frac); await reopen(pg);
    await pg.locator('[data-testid=nav-majlis]').tap(); await pg.waitForTimeout(1200);
    await pg.getByRole('button', { name: mood, exact: true }).tap(); await pg.waitForTimeout(1500);
    const state = await saveState(setup.ctx, name); await setup.ctx.close();
    const ctx = await context(b, { record: OUT, storageState: state }); const rec = await ctx.newPage(); const cap = await startCapture(ctx, rec, name);
    await rec.goto(BASE); await rec.waitForTimeout(1200);
    const st = rec.getByRole('button', { name: PLAY }).first(); if (await st.count()) await st.tap();
    await rec.waitForTimeout(1200); await settle(rec);
    await rec.locator('[data-testid=nav-majlis]').tap(); await rec.waitForTimeout(3200);
    for (let i = 0; i < 4; i++) { await rec.mouse.wheel(0, 260); await rec.waitForTimeout(1100); }
    await rec.waitForTimeout(1200);
    await finish(ctx, rec, name, cap);
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
