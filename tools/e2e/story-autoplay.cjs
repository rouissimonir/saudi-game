// Exercises auto-play with a controllable audio source; this is not a native iPhone audio test.
const { chromium } = require('playwright');

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await page.addInitScript(() => {
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
    });
    await page.goto(new URL('?autostart=1', process.argv[2] || 'http://localhost:4173/').href);
    await page.getByTestId('scene-auto').click();
    await page.waitForFunction(() => window.storyTestSources.length > 0);
    await page.waitForTimeout(3500);
    if (await page.getByTestId('actor-layla').count()) throw new Error('Auto-play advanced before the opening voice ended');
    await page.evaluate(() => window.storyTestSources[0].onended());
    await page.getByTestId('actor-layla').waitFor({ timeout: 6000 });
    await page.getByTestId('actor-noura').waitFor({ timeout: 18000 });
    console.log('Auto-play waited for the opening voice and advanced after a stalled subsequent voice timed out.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
