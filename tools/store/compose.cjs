/**
 * Frames raw game captures as App Store screenshots: a caption above the screen on the game's warm brown.
 *
 *   node tools/store/compose.cjs <rawDir> <outDir>
 *
 * Reads <rawDir>/<lang>_<n>.png (from tools/store/capture.cjs, 1290x2796) and writes
 * <outDir>/<lang>/0<n>.png at 1290x2796, the size Apple asks for on 6.7" iPhones (also accepted for 6.9").
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const [rawDir = 'store_raw', outDir = 'store_out'] = process.argv.slice(2);
const FONTS = path.resolve(__dirname, '..', '..', 'public', 'fonts');
const CAPTIONS = {
  en: [
    ['Merge. Brew.', 'Serve your guests.'],
    ['A story you play,', 'not just read.'],
    ['Restore the Majlis,', 'wing by wing.'],
    ['Travel across', 'the Kingdom.'],
    ['Every wing', 'tells its tale.'],
  ],
  ar: [
    ['ادمج، حضّر،', 'وأكرم ضيوفك.'],
    ['حكاية تعيشها،', 'مو بس تقراها.'],
    ['رمّم المجلس', 'جناحاً بعد جناح.'],
    ['سافر عبر', 'أرجاء المملكة.'],
    ['لكل جناح', 'حكايته.'],
  ],
};

(async () => {
  const browser = await chromium.launch();
  for (const lang of ['en', 'ar']) {
    fs.mkdirSync(path.join(outDir, lang), { recursive: true });
    for (let n = 1; n <= 5; n++) {
      const raw = path.resolve(rawDir, `${lang}_${n}.png`);
      if (!fs.existsSync(raw)) continue;
      const [a, b] = CAPTIONS[lang][n - 1];
      const page = await browser.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 3 });
      const html = path.resolve(outDir, `_${lang}_${n}.html`);
      fs.writeFileSync(html, `<!doctype html><html dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
        @font-face{font-family:Cairo;font-weight:200 1000;src:url(file://${FONTS}/cairo-arabic.woff2);unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFC,U+200C-200E}
        @font-face{font-family:Cairo;font-weight:200 1000;src:url(file://${FONTS}/cairo-latin.woff2);unicode-range:U+0000-00FF,U+0131,U+2000-206F,U+20AC}
        *{box-sizing:border-box;margin:0}
        body{width:430px;height:932px;overflow:hidden;font-family:Cairo,sans-serif;color:#FBF7F0;
          background:radial-gradient(120% 70% at 50% 0%,#5A3A22 0%,#3A2417 45%,#1E130D 100%);position:relative}
        .band{position:absolute;top:0;left:0;right:0;height:8px;background:repeating-linear-gradient(90deg,#9E2A2B 0 22px,#1C1410 22px 30px,#D99B26 30px 52px,#1C1410 52px 60px,#FBF7F0 60px 68px,#1C1410 68px 76px)}
        h1{position:absolute;top:34px;left:20px;right:20px;text-align:center;font-weight:900;font-size:33px;line-height:1.25;letter-spacing:-.2px;text-shadow:0 2px 0 rgba(0,0,0,.35)}
        h1 span{display:block}
        h1 span:last-child{color:#F5B83D}
        .shot{position:absolute;left:50%;top:150px;width:352px;transform:translateX(-50%);border-radius:30px;border:3px solid #D99B26;box-shadow:0 18px 40px rgba(0,0,0,.55),0 0 0 6px rgba(217,155,38,.18);overflow:hidden;background:#000}
        .shot img{display:block;width:100%;height:auto}
      </style></head><body><div class="band"></div><h1><span>${a}</span><span>${b}</span></h1>
      <div class="shot"><img src="file://${raw}"></div></body></html>`);
      await page.goto('file://' + html);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(outDir, lang, `0${n}.png`) });
      await page.close();
      fs.unlinkSync(html);
    }
  }
  await browser.close();
  console.log('done');
})();
