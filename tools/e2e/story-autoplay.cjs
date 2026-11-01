// Exercises auto-play with a controllable audio source; this is not a native iPhone audio test.
const { chromium } = require('playwright');

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const installFakeAudio = () => {
      localStorage.setItem('qahwa_lang', 'en');
      window.storyTestSources = [];
      class FakeAudioContext {
        state = 'running'; currentTime = 0; destination = {};
        decodeAudioData() { return Promise.resolve({}); }
        createGain() { return { gain: { value: 1, setValueAtTime() {}, setTargetAtTime() {} }, connect() {} }; }
        createBufferSource() {
          const source = { buffer: null, onended: null, connect() {}, start() { window.storyTestSources.push(source); }, stop() {} };
          return source;
        }
      }
      window.AudioContext = FakeAudioContext;
    };
    await page.addInitScript(installFakeAudio);
    await page.goto(new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/').href);
    await page.getByTestId('scene-auto').click();
    await page.waitForFunction(() => window.storyTestSources.some(source => typeof source.onended === 'function'));
    await page.waitForTimeout(3500);
    if (await page.getByTestId('actor-layla').count()) throw new Error('Auto-play advanced before the opening voice ended');
    await page.evaluate(() => window.storyTestSources.find(source => typeof source.onended === 'function').onended());
    await page.getByTestId('actor-layla').waitFor({ timeout: 6000 });
    await page.getByTestId('actor-noura').waitFor({ timeout: 18000 });
    await page.close();

    const muted = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await muted.addInitScript(installFakeAudio);
    await muted.addInitScript(() => localStorage.setItem('qahwa_sound_muted', 'true'));
    await muted.goto(new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/').href);
    const soundButton = muted.getByTestId('scene-sound');
    if (await soundButton.getAttribute('aria-label') !== 'Turn sound on') throw new Error('Muted scene lacks a sound-on control');
    await soundButton.click();
    await muted.waitForFunction(() => window.storyTestSources.some(source => typeof source.onended === 'function'));
    if (await muted.getByTestId('actor-layla').count()) throw new Error('Changing sound advanced the story');
    if (await soundButton.getAttribute('aria-label') !== 'Mute sound') throw new Error('Sound-on scene lacks a mute control');
    await soundButton.click();
    await muted.getByTestId('scene-auto').click();
    await muted.getByTestId('actor-layla').waitFor({ timeout: 6000 });
    await muted.close();

    const manual = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await manual.addInitScript(installFakeAudio);
    await manual.goto(new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/').href);
    await manual.waitForFunction(() => window.storyTestSources.some(source => typeof source.onended === 'function'));
    await manual.getByTestId('scene-text').click();
    await manual.getByTestId('actor-layla').waitFor({ timeout: 3000 });
    await manual.close();
    for (const lang of ['ar', 'en']) {
      const small = await browser.newPage({ viewport: { width: 320, height: 568 }, reducedMotion: 'reduce' });
      await small.addInitScript(value => localStorage.setItem('qahwa_lang', value), lang);
      await small.goto(new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/').href);
      await small.getByTestId('scene-sound').waitFor();
      const boxes = await Promise.all(['scene-sound', 'scene-history', 'scene-auto', 'scene-skip'].map(id => small.getByTestId(id).boundingBox()));
      if (boxes.some(box => !box || box.x < 0 || box.x + box.width > 320)) throw new Error(`${lang}: story controls leave the screen`);
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        if (boxes[i].x < boxes[j].x + boxes[j].width && boxes[j].x < boxes[i].x + boxes[i].width && boxes[i].y < boxes[j].y + boxes[j].height && boxes[j].y < boxes[i].y + boxes[i].height) throw new Error(`${lang}: story controls overlap`);
      }
      await small.close();
    }
    console.log('Auto-play waited for speech, recovered from a stalled voice, and advanced when muted; manual advance remained available.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
