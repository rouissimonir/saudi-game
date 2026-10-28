/**
 * Every iPhone screen size must match exactly one launch image (<link rel="apple-touch-startup-image">), and the file it
 * names must be exactly that device's pixel size. Regenerate with tools/art/make_startup_images.py.
 *
 *   node tools/e2e/launch-images.cjs http://localhost:4173/
 */
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:4173/';
const DEVICES = [[320,568,2],[375,667,2],[414,736,3],[375,812,3],[414,896,2],[414,896,3],[390,844,3],[428,926,3],[393,852,3],[430,932,3],[402,874,3],[440,956,3]];
(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const b = await chromium.launch(executablePath ? { executablePath } : {});
  let bad = 0;
  for (const [w, h, r] of DEVICES) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, screen: { width: w, height: h }, deviceScaleFactor: r, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage(); const fails = [];
    pg.on('response', (res) => { if (res.status() >= 400) fails.push(res.url()); });
    await pg.goto(BASE); await pg.waitForTimeout(400);
    const m = await pg.evaluate(() => [...document.querySelectorAll('link[rel=apple-touch-startup-image]')].filter((l) => matchMedia(l.media).matches).map((l) => l.getAttribute('href')));
    const want = `icons/splash/ios-${w * r}x${h * r}.png`;
    const okOne = m.length === 1 && m[0] === want;
    // the file the link names must exist and be exactly the device's pixel size
    let size = null;
    if (m[0]) size = await pg.evaluate(async (u) => { const i = new Image(); i.src = u; await i.decode(); return [i.naturalWidth, i.naturalHeight]; }, new URL(m[0], BASE).href);
    const okSize = size && size[0] === w * r && size[1] === h * r;
    if (!okOne || !okSize) bad++;
    console.log(`${okOne && okSize ? 'ok  ' : 'FAIL'} ${w}x${h}@${r}: ${m.join(',') || 'none'} ${size ? size.join('x') : ''}`);
    await ctx.close();
  }
  console.log(bad ? `${bad} problems` : 'all twelve devices match exactly one correctly sized launch image');
  await b.close();
  if (bad) process.exitCode = 1;
})();
