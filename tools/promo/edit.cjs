/**
 * Cuts the recorded clips (tools/promo/record.cjs) into the marketing video.
 *
 *   node tools/promo/edit.cjs <ar|en> <rawDir> <outDir> [voiceoverDir]
 *
 * Writes <outDir>/<lang>_social.mp4 (1080x1920, captions on the game's warm brown, for TikTok, Reels and Shorts) and
 * <outDir>/<lang>_preview.mp4 (886x1920, only footage from the app, no added text or end card, for the App Store app preview).
 * Both are about 28 s, cross-faded, with the game's own generated oud loop (public/assets/audio/ambient.mp3) fading
 * in and out. Captions are the App Store caption lines; the Arabic ones await native review like the rest.
 *
 * Optional voiceover: pass a folder as the 4th argument holding vo_<lang>_0.mp3 .. vo_<lang>_5.mp3 (one line per shot,
 * the last for the end card). Each line starts just after its shot fades in and the music drops under it. The App Store
 * preview keeps only lines 0 to 4, since it has no end card.
 *
 * Needs ffmpeg and Playwright. Cut points are in SEGMENTS below.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const lang = process.argv[2] || 'ar';
const RAW = path.resolve(process.argv[3] || 'promo_raw');
const OUT = path.resolve(process.argv[4] || 'promo_out');
const VO = process.argv[5] ? path.resolve(process.argv[5]) : null;
const ROOT = path.resolve(__dirname, '..', '..');
const FONTS = path.join(ROOT, 'public', 'fonts');
const MUSIC = path.join(ROOT, 'public', 'assets', 'audio', 'ambient.mp3');
fs.mkdirSync(OUT, { recursive: true });
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

// clip: file name in RAW, from/len in seconds of that clip, caption: two lines or null
const SEGMENTS = {
  ar: [
    { clip: 'ar_prologue.mp4', from: 0.6, len: 3.4, caption: ['أهلاً بك', 'في المجلس'] },
    { clip: 'ar_prologue.mp4', from: 5.8, len: 7.0, caption: ['حكاية تعيشها،', 'مو بس تقراها.'] },
    { clip: 'ar_board.mp4', from: 7.0, len: 9.0, caption: ['ادمج، حضّر،', 'وأكرم ضيوفك.'] },
    { clip: 'ar_taif.mp4', from: 4.5, len: 5.5, caption: ['رمّم المجلس', 'جناحاً بعد جناح.'] },
    { clip: 'ar_night.mp4', from: 3.6, len: 5.5, caption: ['سافر عبر', 'أرجاء المملكة.'] },
  ],
  en: [
    { clip: 'en_prologue.mp4', from: 0.6, len: 3.4, caption: ['Welcome', 'to the Majlis'] },
    { clip: 'en_prologue.mp4', from: 5.8, len: 7.0, caption: ['A story you play,', 'not just read.'] },
    { clip: 'en_board.mp4', from: 7.0, len: 9.0, caption: ['Merge. Brew.', 'Serve your guests.'] },
    { clip: 'en_taif.mp4', from: 4.5, len: 5.5, caption: ['Restore the Majlis,', 'wing by wing.'] },
    { clip: 'en_night.mp4', from: 3.6, len: 5.5, caption: ['Travel across', 'the Kingdom.'] },
  ],
}[lang];
const END = { ar: ['قهوة ومجلس', 'ضيافة سعودية بنكهة القهوة'], en: ['Qahwa & Majlis', 'Saudi hospitality, one cup at a time'] }[lang];
const END_LEN = 3.2, FADE = 0.5, W = 1080, H = 1920, PW = 760, PH = Math.round(PW * 1864 / 860), PX = (W - PW) / 2, PY = 250;

const FONT_CSS = `
  @font-face{font-family:Cairo;font-weight:200 1000;src:url(file://${FONTS}/cairo-arabic.woff2);unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFC,U+200C-200E}
  @font-face{font-family:Cairo;font-weight:200 1000;src:url(file://${FONTS}/cairo-latin.woff2);unicode-range:U+0000-00FF,U+0131,U+2000-206F,U+20AC}
  *{box-sizing:border-box;margin:0}`;
const BAND = 'position:absolute;top:0;left:0;right:0;height:20px;background:repeating-linear-gradient(90deg,#9E2A2B 0 55px,#1C1410 55px 75px,#D99B26 75px 130px,#1C1410 130px 150px,#FBF7F0 150px 170px,#1C1410 170px 190px)';
const BG = 'radial-gradient(120% 70% at 50% 0%,#5A3A22 0%,#3A2417 45%,#1E130D 100%)';

async function renderOverlays() {
  const b = await chromium.launch(executablePath ? { executablePath } : {});
  const dir = path.join(OUT, `_${lang}_overlays`); fs.mkdirSync(dir, { recursive: true });
  const shot = async (name, body, { transparent = true } = {}) => {
    const pg = await b.newPage({ viewport: { width: W, height: H } });
    const file = path.join(dir, name + '.html');
    fs.writeFileSync(file, `<!doctype html><html dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>${FONT_CSS}
      body{width:${W}px;height:${H}px;overflow:hidden;font-family:Cairo,sans-serif;color:#FBF7F0;position:relative}</style></head><body>${body}</body></html>`);
    await pg.goto('file://' + file); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(250);
    await pg.screenshot({ path: path.join(dir, name + '.png'), omitBackground: transparent });
    await pg.close();
  };
  await shot('bg', `<div style="position:absolute;inset:0;background:${BG}"></div><div style="${BAND}"></div>`, { transparent: false });
  // frame around the phone footage: transparent inside, gold edge, soft shadow outside
  await shot('ring', `<div style="position:absolute;left:${PX}px;top:${PY}px;width:${PW}px;height:${PH}px;border-radius:52px;border:6px solid #D99B26;box-shadow:0 30px 70px rgba(0,0,0,.55),0 0 0 12px rgba(217,155,38,.18)"></div>`);
  await shot('mask', `<div style="position:absolute;inset:0;background:#000"></div><div style="position:absolute;left:${PX}px;top:${PY}px;width:${PW}px;height:${PH}px;border-radius:52px;background:#fff"></div>`, { transparent: false });
  SEGMENTS.forEach(({ caption }, i) => caption && shot(`cap${i}`, `<h1 style="position:absolute;top:48px;left:40px;right:40px;text-align:center;font-weight:900;font-size:70px;line-height:1.2;text-shadow:0 4px 0 rgba(0,0,0,.35)"><span style="display:block">${caption[0]}</span><span style="display:block;color:#F5B83D">${caption[1]}</span></h1>`));
  await shot('end', `<div style="position:absolute;inset:0;background:${BG}"></div><div style="${BAND}"></div>
    <div style="position:absolute;left:60px;right:60px;top:760px;text-align:center"><h1 style="font-weight:900;font-size:120px;line-height:1.2;text-shadow:0 5px 0 rgba(0,0,0,.35)">${END[0]}</h1><p style="margin-top:36px;font-weight:700;font-size:50px;line-height:1.4;color:#F5B83D">${END[1]}</p></div>`, { transparent: false });
  await b.close();
  return dir;
}

function ff(args) { execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' }); }

(async () => {
  const dir = await renderOverlays();
  const seg = (i) => path.join(OUT, `_${lang}_seg${i}.mp4`), prev = (i) => path.join(OUT, `_${lang}_prev${i}.mp4`);
  const fades = (len) => `fade=t=in:st=0:d=0.3:alpha=1,fade=t=out:st=${(len - 0.4).toFixed(2)}:d=0.4:alpha=1`;
  SEGMENTS.forEach((s, i) => {
    const input = ['-ss', String(s.from), '-t', String(s.len), '-i', path.join(RAW, s.clip)];
    // social: footage inside a rounded frame on the brand background, caption above
    ff([...input, '-loop', '1', '-t', String(s.len), '-i', path.join(dir, 'bg.png'), '-loop', '1', '-t', String(s.len), '-i', path.join(dir, 'mask.png'),
      '-loop', '1', '-t', String(s.len), '-i', path.join(dir, 'ring.png'), '-loop', '1', '-t', String(s.len), '-i', path.join(dir, `cap${i}.png`),
      '-filter_complex', `[0:v]fps=30,scale=${PW}:${PH}:flags=lanczos,format=rgba[v];` +
        `[2:v]scale=${W}:${H},format=gray[m];[m]crop=${PW}:${PH}:${PX}:${PY}[mc];[v][mc]alphamerge[vr];` +
        `[1:v][vr]overlay=${PX}:${PY}[a];[a][3:v]overlay=0:0[b];[4:v]format=rgba,${fades(s.len)}[c];[b][c]overlay=0:0,format=yuv420p[o]`,
      '-map', '[o]', '-r', '30', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', seg(i)]);
    // App Store preview: the footage only, fitted to 886x1920
    ff([...input, '-vf', 'fps=30,scale=886:1920:flags=lanczos,format=yuv420p', '-an', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', prev(i)]);
  });
  const endSeg = path.join(OUT, `_${lang}_end.mp4`);
  ff(['-loop', '1', '-t', String(END_LEN), '-i', path.join(dir, 'end.png'), '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '17', endSeg]);

  const chain = (files, lens, dest, withMusic, vo = []) => {
    const inputs = files.flatMap((f) => ['-i', f]);
    let filter = '', last = '[0:v]', t = lens[0];
    const starts = [0];
    for (let i = 1; i < files.length; i++) {
      const off = (t - FADE).toFixed(2);
      filter += `${last}[${i}:v]xfade=transition=fade:duration=${FADE}:offset=${off}[x${i}];`; last = `[x${i}]`; starts.push(t - FADE); t += lens[i] - FADE;
    }
    const total = t;
    const args = [...inputs];
    if (withMusic) args.push('-stream_loop', '-1', '-i', MUSIC);
    vo.forEach((line) => args.push('-i', line.file));
    const mi = files.length;
    const music = `[${mi}:a]atrim=0:${total.toFixed(2)},afade=t=in:st=0:d=1.5,afade=t=out:st=${(total - 2).toFixed(2)}:d=2,volume=${vo.length ? 0.32 : 0.85},aformat=sample_rates=44100:channel_layouts=stereo`;
    let audio = '';
    if (withMusic && vo.length) {
      const names = vo.map((line, k) => { const ms = Math.round((starts[line.shot] + 0.6) * 1000); audio += `;[${mi + 1 + k}:a]aformat=sample_rates=44100:channel_layouts=stereo,adelay=${ms}|${ms}[v${k}]`; return `[v${k}]`; });
      audio = `;${music}[m]` + audio + `;[m]${names.join('')}amix=inputs=${vo.length + 1}:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]`;
    } else if (withMusic) audio = `;${music},loudnorm=I=-16:TP=-1.5:LRA=11[a]`;
    ff([...args, '-filter_complex', filter.slice(0, -1) + audio,
      '-map', last, ...(withMusic ? ['-map', '[a]', '-c:a', 'aac', '-b:a', '256k'] : []), '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-t', total.toFixed(2), dest]);
    return total;
  };
  const voLines = (count) => (VO ? Array.from({ length: count }, (_, shot) => ({ shot, file: path.join(VO, `vo_${lang}_${shot}.mp3`) })).filter((l) => fs.existsSync(l.file)) : []);
  const lens = [...SEGMENTS.map((s) => s.len), END_LEN];
  const t1 = chain([...SEGMENTS.map((_, i) => seg(i)), endSeg], lens, path.join(OUT, `${lang}_social.mp4`), true, voLines(SEGMENTS.length + 1));
  const t2 = chain(SEGMENTS.map((_, i) => prev(i)), SEGMENTS.map((s) => s.len), path.join(OUT, `${lang}_preview.mp4`), true, voLines(SEGMENTS.length));
  console.log(`wrote ${lang}_social.mp4 (${t1.toFixed(1)} s) and ${lang}_preview.mp4 (${t2.toFixed(1)} s) in ${OUT}`);
  for (const f of fs.readdirSync(OUT)) if (f.startsWith('_') && f.endsWith('.mp4')) fs.rmSync(path.join(OUT, f));
})().catch((e) => { console.error(e); process.exitCode = 1; });
