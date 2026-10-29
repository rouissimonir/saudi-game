/**
 * Captures the five App Store screens from the running game (iPhone 6.7" size, 1290x2796).
 *
 *   node tools/store/capture.cjs <en|ar> <shots> <baseUrl> <rawDir>
 *   node tools/store/capture.cjs en 1,2,3,4,5 http://localhost:4173/ store_raw/
 *
 *   1 the merge board with orders      2 a story scene (prologue)      3 a half-restored Majlis in golden light
 *   4 a fully restored Majlis at night 5 wing cards with their pictures
 *
 * Shots 3 to 5 play through the game's own area travel (each area's wings are rebuilt by the game, as a player would see
 * them), so they take a few minutes. Then frame them with tools/store/compose.cjs.
 */
const { chromium, devices } = require('playwright');
const lang = process.argv[2] || 'en';
const only = process.argv[3] ? process.argv[3].split(',') : ['1', '2', '3', '4', '5'];
const BASE = process.argv[4] || 'http://localhost:4173/';
const OUT = process.argv[5] || 'store_raw/';
require('fs').mkdirSync(OUT, { recursive: true });
async function open(b, { area = 0, frac = 0, mood = null, skipStory = true }) {
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro Max'], viewport: { width: 430, height: 932 } });
  await ctx.addInitScript((l) => { try { localStorage.setItem('qahwa_lang', l); } catch {} }, lang);
  const pg = await ctx.newPage();
  await pg.goto(BASE); await pg.waitForTimeout(900);
  await pg.getByRole('button', { name: /play|start|العب|ابدأ/i }).first().click(); await pg.waitForTimeout(1000);
  return { ctx, pg };
}
async function settle(pg) {
  for (let i = 0; i < 3 && await pg.locator('[role=dialog]').count(); i++) {
    const c = pg.locator('[role=dialog]').last().getByRole('button', { name: /claim|close|skip|استلم|استلام|إغلاق|تخطي/i }).first();
    if (await c.count()) await c.tap().catch(() => {}); await pg.waitForTimeout(350);
  }
}
async function setSave(pg, { area, frac, mood }) {
  await pg.evaluate(({ area, frac, mood }) => {
    const k = 'qahwa_majlis_merge_save_v3'; const s = JSON.parse(localStorage.getItem(k));
    s.areaIndex = area; s.seenScenes = ['prologue']; s.lastLoginDay = new Date().toISOString().slice(0, 10);
    s.tutorialDismissed = true; s.coins = 1240; s.diamonds = 85; s.level = 7; s.stars = 6;
    s.renovationZones.forEach((z) => { z.unlockedLevel = Math.round(2 * frac); });
    if (mood) s.ambiance = mood;
    localStorage.setItem(k, JSON.stringify(s));
  }, { area, frac, mood });
  await pg.reload(); await pg.waitForTimeout(1000);
  const st = pg.getByRole('button', { name: /play|start|continue|العب|ابدأ|متابعة/i }).first(); if (await st.count()) await st.tap();
  await pg.waitForTimeout(1000); await settle(pg);
}
(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const b = await chromium.launch(executablePath ? { executablePath } : {});
  if (only.includes('2')) { // story scene: tap through the prologue to a two-person beat
    const { ctx, pg } = await open(b, {});
    await pg.waitForTimeout(2500);
    for (let i = 0; i < 4; i++) { await pg.mouse.click(215, 500); await pg.waitForTimeout(1700); }
    await pg.waitForTimeout(2500);
    await pg.screenshot({ path: OUT + `${lang}_2.png` }); await ctx.close();
  }
  if (only.includes('1')) { // board
    const { ctx, pg } = await open(b, {});
    await pg.locator('[data-testid=scene-skip]').tap(); await pg.waitForTimeout(1500); await settle(pg);
    await setSave(pg, { area: 0, frac: 0.25, mood: null });
    const hint = pg.locator('[data-testid=tutorial-coach] button'); if (await hint.count()) await hint.tap();
    await pg.waitForTimeout(800);
    await pg.screenshot({ path: OUT + `${lang}_1.png` }); await ctx.close();
  }
  // bring the painted scene of the current area up under the header, as a player would scroll to it
  const stage = async (pg) => { await pg.evaluate(() => { const el = document.querySelector('[data-testid=area-name]'); if (!el) return; el.scrollIntoView(); window.scrollBy(0, el.getBoundingClientRect().top - 150); }); await pg.waitForTimeout(1500); };
  const allDone = (pg) => pg.evaluate(() => { const k = 'qahwa_majlis_merge_save_v3'; const s = JSON.parse(localStorage.getItem(k)); s.renovationZones.forEach((z) => { z.unlockedLevel = 2; }); s.stars = 40; localStorage.setItem(k, JSON.stringify(s)); });
  const reopen = async (pg) => { await pg.reload(); await pg.waitForTimeout(900); const st = pg.getByRole('button', { name: /play|start|continue|العب|ابدأ|متابعة/i }).first(); if (await st.count()) await st.tap(); await pg.waitForTimeout(900); await settle(pg); };
  const travelTo = async (pg, target) => {
    for (let a = 0; a < target; a++) {
      await allDone(pg); await reopen(pg);
      await pg.locator('[data-testid=nav-majlis]').tap(); await pg.waitForTimeout(900);
      await pg.locator('[data-testid=advance-area] button').first().tap(); await pg.waitForTimeout(1200);
      for (let i = 0; i < 4; i++) { const sk = pg.locator('[data-testid=scene-skip]'); if (await sk.count()) { await sk.tap().catch(() => {}); await pg.waitForTimeout(900); } await settle(pg); }
      await pg.locator('[data-testid=nav-board]').tap().catch(() => {}); await pg.waitForTimeout(500);
    }
  };
  const GOLD = lang === 'ar' ? 'عصاري نجد' : 'Golden Afternoon'; const NIGHT = lang === 'ar' ? 'ليالي الفوانيس' : 'Lantern Night'; // exact names: the event bar shares a word with the night mood
  if (['3', '4', '5'].some((n) => only.includes(n))) {
    const { ctx, pg } = await open(b, {});
    await pg.locator('[data-testid=scene-skip]').tap(); await pg.waitForTimeout(1500); await settle(pg);
    await setSave(pg, { area: 0, frac: 0, mood: null });
    let at = 0;
    const goto = async (target) => { while (at < target) { await travelTo(pg, 1); at++; } };
    const view = async (frac) => {
      await pg.evaluate((frac) => { const k = 'qahwa_majlis_merge_save_v3'; const s = JSON.parse(localStorage.getItem(k)); s.renovationZones.forEach((z) => { z.unlockedLevel = Math.round(2 * frac); }); s.stars = 6; s.tutorialDismissed = true; localStorage.setItem(k, JSON.stringify(s)); }, frac);
      await reopen(pg);
      await pg.locator('[data-testid=nav-majlis]').tap(); await pg.waitForTimeout(1200);
    };
    if (only.includes('3')) { await goto(3); await view(0.5); await pg.getByRole('button', { name: GOLD, exact: true }).tap(); await pg.waitForTimeout(1800); await stage(pg); await pg.screenshot({ path: OUT + `${lang}_3.png` }); }
    if (only.includes('4')) { await goto(6); await view(1); await pg.getByRole('button', { name: NIGHT, exact: true }).tap(); await pg.waitForTimeout(1800); await stage(pg); await pg.screenshot({ path: OUT + `${lang}_4.png` }); }
    if (only.includes('5')) {
      await goto(7); await view(0.5); await pg.getByRole('button', { name: GOLD, exact: true }).tap(); await pg.waitForTimeout(1500);
      await pg.evaluate(() => { const el = document.querySelector('[data-testid=wing-pic-0]'); el.scrollIntoView(); const r = el.getBoundingClientRect(); window.scrollBy(0, r.top - 118); });
      await pg.waitForTimeout(1500);
      await pg.screenshot({ path: OUT + `${lang}_5.png` });
    }
    await ctx.close();
  }
  await b.close();
})();
