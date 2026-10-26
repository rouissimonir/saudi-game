// Story layout check: plays the prologue and every hand-written chapter (both choices, two sets of earlier choices)
// in English and Arabic on an iPhone SE, and reports any speech bubble that climbs above 52% of the screen (over the
// characters' faces) or choice buttons that overlap it.
// Usage: npm run build && npx vite preview, then: node tools/e2e/story_layout.cjs http://localhost:4173/
const { chromium, devices } = require('playwright');
const FLAGS = [
  { rivalry: 'firm', rashid_ch1: 'proud', menu: 'heritage', tariq: 'blend', rashid_ch4: 'stand', jeddah: 'souq', abha: 'train', riyadh: 'own' },
  { rivalry: 'polite', rashid_ch1: 'host', menu: 'fusion', tariq: 'cup', rashid_ch4: 'welcome', jeddah: 'rawshan', abha: 'farmers', riyadh: 'partner' },
];
const CHAPTERS = ['chap_1', 'chap_2', 'chap_3', 'chap_4', 'area_1', 'area_2', 'area_3', 'area_4', 'area_5', 'area_6', 'area_7'];
(async () => {
  const base = process.argv[2] || 'http://localhost:4173/';
  const b = await chromium.launch();
  const issues = []; let lines = 0, worst = { top: 1, where: '' };
  for (const lang of ['en', 'ar']) {
    const ctx = await b.newContext({ ...devices['iPhone SE'] });
    await ctx.addInitScript((l) => { localStorage.setItem('qahwa_lang', l); }, lang);
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
    await pg.goto(base);
    const H = pg.viewportSize().height;
    const play = async (label, pick) => {
      await pg.locator('[data-testid=scene-player]').waitFor({ timeout: 10000 });
      for (let i = 0; i < 30; i++) {
        await pg.waitForTimeout(80);
        if (!(await pg.locator('[data-testid=scene-player]').count())) return;
        await pg.mouse.click(180, 200); await pg.waitForTimeout(120); // finish typing
        const m = await pg.evaluate(() => {
          const bub = document.querySelector('.scene-bubble'); const ch = document.querySelector('[data-testid=scene-choices]');
          const t = document.querySelector('[data-testid=scene-text]');
          return bub ? { top: bub.getBoundingClientRect().top, choicesBottom: ch ? ch.getBoundingClientRect().bottom : null, text: t ? t.textContent.trim().slice(0, 50) : '' } : null;
        });
        if (m) {
          lines++;
          const frac = m.top / H;
          if (frac < worst.top) worst = { top: frac, where: `${lang} ${label}: ${m.text}` };
          if (frac < 0.52) issues.push(`${lang} ${label}: bubble top at ${(frac * 100).toFixed(0)}% — "${m.text}"`);
          if (m.choicesBottom && m.choicesBottom > m.top + 2) issues.push(`${lang} ${label}: choices overlap the bubble — "${m.text}"`);
        }
        if (await pg.locator('[data-testid=scene-choices]').count()) { await pg.locator('[data-testid^=scene-choice-]').nth(pick).tap(); continue; }
        await pg.mouse.click(180, 200);
      }
    };
    // prologue, both branches
    for (const pick of [0, 1]) {
      await pg.evaluate(() => localStorage.removeItem('qahwa_majlis_merge_save_v3')); await pg.reload();
      await pg.getByRole('button', { name: /start|ابدأ|play|العب/i }).first().tap();
      await play(`prologue/${pick}`, pick);
    }
    for (const chap of CHAPTERS) for (const [k, flags] of FLAGS.entries()) {
      await pg.evaluate(([c, f]) => { const key = 'qahwa_majlis_merge_save_v3'; const s = JSON.parse(localStorage.getItem(key)); s.activeStoryId = c; s.storyFlags = f; s.completedStoryIds = []; localStorage.setItem(key, JSON.stringify(s)); }, [chap, flags]);
      await pg.reload(); await pg.getByRole('button', { name: /start|ابدأ|play|العب|continue|متابعة/i }).first().tap();
      await play(`${chap}/${k}`, k);
    }
    if (errs.length) issues.push(`${lang}: page errors ${errs.join('; ')}`);
    await ctx.close();
  }
  console.log(`lines measured: ${lines}; highest bubble top: ${(worst.top * 100).toFixed(0)}% (${worst.where})`);
  console.log(issues.length ? issues.join('\n') : 'no issues');
  await b.close();
})();
