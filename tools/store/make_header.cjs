/**
 * Makes the optional App Store Connect "Header" artwork (landscape, 3840x1646) in English and Arabic.
 *
 *   node tools/store/make_header.cjs [outDir]        default: store/header
 *
 * Brand panel (icon, name, tagline) on one side and three painted places on the other; the Arabic version is
 * mirrored. Keep the important content away from the edges: App Store Connect may crop the header differently on
 * different devices (check its Preview and "Explore templates"). Art comes from public/assets/art/majlis.
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'store', 'header'));
const FONTS = path.join(ROOT, 'public', 'fonts');
const ART = path.join(ROOT, 'public', 'assets', 'art', 'majlis');
const ICON = path.join(ROOT, 'public', 'icons', 'icon-512.png');
const W = 3840, H = 1646;
const PANELS = [['alula_3', '45%'], ['riyadh_3_night', '58%'], ['khobar_3', '66%']];
const TEXT = {
  en: { dir: 'ltr', name: 'Qahwa &amp; Majlis', tag: 'Merge. Brew. Serve your guests.' },
  ar: { dir: 'rtl', name: 'قهوة ومجلس', tag: 'ادمج، حضّر، وأكرم ضيوفك.' },
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  for (const lang of ['en', 'ar']) {
    const t = TEXT[lang];
    const panels = PANELS.map(([n, pos]) => `<div class="p"><img src="file://${ART}/${n}.webp" style="object-position:${pos} 50%"></div>`).join('');
    const html = `<!doctype html><html dir="${t.dir}"><head><meta charset="utf-8"><style>
      @font-face{font-family:Cairo;font-weight:200 1000;src:url(file://${FONTS}/cairo-arabic.woff2);unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFC,U+200C-200E}
      @font-face{font-family:Cairo;font-weight:200 1000;src:url(file://${FONTS}/cairo-latin.woff2);unicode-range:U+0000-00FF,U+0131,U+2000-206F,U+20AC}
      *{box-sizing:border-box;margin:0}
      body{width:${W}px;height:${H}px;overflow:hidden;font-family:Cairo,sans-serif;color:#FBF7F0;position:relative;
        background:radial-gradient(120% 120% at 20% 0%,#5A3A22 0%,#3A2417 50%,#1E130D 100%)}
      .band{position:absolute;top:0;left:0;right:0;height:26px;z-index:3;background:repeating-linear-gradient(90deg,#9E2A2B 0 70px,#1C1410 70px 96px,#D99B26 96px 166px,#1C1410 166px 192px,#FBF7F0 192px 218px,#1C1410 218px 244px)}
      .row{position:absolute;inset:26px 0 0 0;display:flex;flex-direction:row}
      .brand{flex:0 0 1640px;display:flex;flex-direction:column;justify-content:center;gap:40px;padding:0 120px 0 280px}
      html[dir=rtl] .brand{padding:0 280px 0 120px}
      .icon{width:330px;height:330px;border-radius:74px;border:8px solid #D99B26;box-shadow:0 24px 60px rgba(0,0,0,.55);overflow:hidden}
      .icon img{width:100%;height:100%;display:block}
      h1{font-weight:900;font-size:230px;line-height:1.05;text-shadow:0 8px 0 rgba(0,0,0,.35)}
      p{font-weight:800;font-size:76px;line-height:1.25;color:#F5B83D;white-space:nowrap}
      .panels{flex:1;display:flex;gap:26px;padding:70px 0 70px 0}
      .p{flex:1;border-radius:46px;overflow:hidden;border:7px solid #D99B26;box-shadow:0 24px 60px rgba(0,0,0,.5);position:relative}
      .p img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(1.06) contrast(1.04)}
      .panels .p:first-child{margin-inline-start:0}
      .fade{position:absolute;top:26px;bottom:0;width:260px;z-index:2;pointer-events:none}
    </style></head><body><div class="band"></div>
      <div class="row">
        <div class="brand"><div class="icon"><img src="file://${ICON}"></div><h1>${t.name}</h1><p>${t.tag}</p></div>
        <div class="panels" style="${t.dir === 'rtl' ? 'padding-left:200px' : 'padding-right:200px'}">${panels}</div>
      </div></body></html>`;
    const file = path.join(OUT, `_${lang}.html`);
    fs.writeFileSync(file, html);
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    await page.goto('file://' + file);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every((i) => i.complete));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, `header_${lang}_${W}x${H}.png`) });
    await page.close();
    fs.rmSync(file);
  }
  await browser.close();
  console.log('wrote', fs.readdirSync(OUT).join(', '), 'in', OUT);
})().catch((e) => { console.error(e); process.exit(1); });
