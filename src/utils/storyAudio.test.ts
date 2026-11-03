import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadMuted, loadMusicEnabled, saveMusicEnabled, saveMuted, SoundAndHapticsManager } from './soundAndHaptics';

test('player gesture resumes a suspended audio context immediately and respects mute', () => {
  const originalWindow = globalThis.window;
  let resumes = 0;
  class FakeAudioContext {
    state = 'suspended';
    resume() { resumes++; return Promise.resolve(); }
  }
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { AudioContext: FakeAudioContext } });
  try {
    const sound = new SoundAndHapticsManager();
    sound.unlockAudio();
    assert.equal(resumes, 1, 'resume is invoked within the player gesture');
    sound.muted = true;
    sound.unlockAudio();
    assert.equal(resumes, 1, 'muted audio remains inactive');
  } finally {
    if (originalWindow === undefined) Reflect.deleteProperty(globalThis, 'window');
    else Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
  }
});

test('an interrupted audio context is asked to resume on the next player gesture', () => {
  const originalWindow = globalThis.window;
  let resumes = 0;
  class FakeAudioContext {
    state = 'interrupted';
    resume() { resumes++; return Promise.resolve(); }
  }
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { AudioContext: FakeAudioContext } });
  try {
    const sound = new SoundAndHapticsManager();
    sound.unlockAudio();
    assert.equal(resumes, 1);
    sound.muted = true;
    sound.unlockAudio();
    assert.equal(resumes, 1, 'muted audio is not resumed');
  } finally {
    if (originalWindow === undefined) Reflect.deleteProperty(globalThis, 'window');
    else Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
  }
});

test('muting releases the media helper and an old rejected play cannot reset its replacement', async () => {
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  let created = 0, paused = 0;
  const rejections: Array<() => void> = [];
  class FakeAudioContext { state = 'running'; }
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { AudioContext: FakeAudioContext } });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {} });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement() {
    created++;
    return { setAttribute() {}, pause() { paused++; }, play() { return new Promise<void>((_, reject) => rejections.push(() => reject(new Error('play denied')))); } };
  } } });
  try {
    const sound = new SoundAndHapticsManager();
    sound.unlockAudio();
    assert.equal(created, 1);
    sound.muted = true;
    assert.equal(paused, 1);
    sound.muted = false;
    sound.unlockAudio();
    assert.equal(created, 2);
    rejections[0]();
    await Promise.resolve();
    sound.unlockAudio();
    assert.equal(created, 2, 'a stale rejection does not reset the new helper');
    sound.muted = true;
    assert.equal(paused, 2);
  } finally {
    for (const [name, descriptor] of [['window', windowDescriptor], ['navigator', navigatorDescriptor], ['document', documentDescriptor]] as const) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
  }
});

test('supported audio session is reset when muting and restored on unmute', () => {
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const session = { type: 'auto' };
  class FakeAudioContext { state = 'running'; }
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { AudioContext: FakeAudioContext } });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { audioSession: session } });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement() { throw new Error('unneeded helper'); } } });
  try {
    const sound = new SoundAndHapticsManager();
    sound.unlockAudio();
    assert.equal(session.type, 'playback');
    sound.muted = true;
    assert.equal(session.type, 'auto');
    sound.muted = false;
    sound.unlockAudio();
    assert.equal(session.type, 'playback');
    sound.muted = true;
  } finally {
    for (const [name, descriptor] of [['window', windowDescriptor], ['navigator', navigatorDescriptor], ['document', documentDescriptor]] as const) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
  }
});

test('mute preference persists and unavailable storage does not interrupt play', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } });
  try {
    assert.equal(loadMuted(), false);
    saveMuted(true);
    assert.equal(loadMuted(), true);
    saveMuted(false);
    assert.equal(loadMuted(), false);
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } } });
    assert.equal(loadMuted(), false);
    assert.doesNotThrow(() => saveMuted(true));
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

test('story completion resolves when playback ends, is stopped, or audio is missing', async () => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  let source: { onended: (() => void) | null; buffer: unknown; connect: () => void; start: () => void; stop: () => void };
  class FakeAudioContext {
    state = 'running'; currentTime = 0; destination = {};
    decodeAudioData() { return Promise.resolve({}); }
    createGain() { return { gain: { value: 1 }, connect() {} }; }
    createBufferSource() { source = { buffer: null, onended: null, connect() {}, start() {}, stop() {} }; return source; }
  }
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { AudioContext: FakeAudioContext } });
  globalThis.fetch = (() => Promise.resolve(new Response(new Uint8Array([1])))) as typeof fetch;
  try {
    const sound = new SoundAndHapticsManager();
    let done = false;
    const first = sound.playStoryLine('first').then(() => { done = true; });
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(done, false);
    source!.onended!();
    await first;
    assert.equal(done, true);
    const stopped = sound.playStoryLine('second');
    sound.stopStoryLine();
    await stopped;
    globalThis.fetch = (() => Promise.resolve(new Response('', { status: 404 }))) as typeof fetch;
    await sound.playStoryLine('missing');
  } finally {
    if (originalWindow === undefined) Reflect.deleteProperty(globalThis, 'window');
    else Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
    globalThis.fetch = originalFetch;
  }
});

test('a temporarily unavailable story clip can be retried and successful audio is cached', async () => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  let requests = 0, starts = 0;
  class FakeAudioContext {
    state = 'running'; currentTime = 0; destination = {};
    decodeAudioData() { return Promise.resolve({}); }
    createGain() { return { gain: { value: 1 }, connect() {} }; }
    createBufferSource() { return { buffer: null, onended: null as (() => void) | null, connect() {}, start() { starts++; queueMicrotask(() => this.onended?.()); }, stop() {} }; }
  }
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { AudioContext: FakeAudioContext } });
  globalThis.fetch = (() => { requests++; return requests === 1 ? Promise.reject(new Error('temporary failure')) : Promise.resolve(new Response(new Uint8Array([1]))); }) as typeof fetch;
  try {
    const sound = new SoundAndHapticsManager();
    await sound.playStoryLine('retry');
    assert.equal(starts, 0);
    await sound.playStoryLine('retry');
    assert.equal(starts, 1);
    await sound.playStoryLine('retry');
    assert.equal(starts, 2);
    assert.equal(requests, 2, 'the successful retry is cached');
  } finally {
    if (originalWindow === undefined) Reflect.deleteProperty(globalThis, 'window');
    else Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
    globalThis.fetch = originalFetch;
  }
});

test('late story audio cannot replace a newer or stopped line', async () => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  const pending = new Map<string, (response: Response) => void>();
  const started: number[] = [];
  class FakeAudioContext {
    state = 'running';
    currentTime = 0;
    destination = {};
    decodeAudioData(data: ArrayBuffer) { return Promise.resolve({ id: new Uint8Array(data)[0] }); }
    createGain() { return { gain: { value: 1, setValueAtTime() {} }, connect() {} }; }
    createBufferSource() {
      return { buffer: null as { id: number } | null, connect() {}, onended: null, start() { started.push(this.buffer!.id); }, stop() {} };
    }
  }
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { AudioContext: FakeAudioContext } });
  globalThis.fetch = ((url: string | URL | Request) => new Promise<Response>(resolve => pending.set(String(url), resolve))) as typeof fetch;
  const finish = async (id: string, value: number) => {
    const resolve = [...pending.entries()].find(([url]) => url.endsWith(`/${id}.mp3`))?.[1];
    assert.ok(resolve);
    resolve(new Response(new Uint8Array([value])));
    await new Promise(resolve => setTimeout(resolve, 0));
  };
  try {
    const sound = new SoundAndHapticsManager();
    sound.playStoryLine('old');
    sound.playStoryLine('new');
    await finish('new', 2);
    await finish('old', 1);
    assert.deepEqual(started, [2]);
    sound.playStoryLine('stopped');
    sound.stopStoryLine();
    await finish('stopped', 3);
    assert.deepEqual(started, [2]);
  } finally {
    if (originalWindow === undefined) Reflect.deleteProperty(globalThis, 'window');
    else Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
    globalThis.fetch = originalFetch;
  }
});

test('muting silences active story audio and invalidates delayed playback', async () => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  const pending = new Map<string, (response: Response) => void>();
  const started: number[] = [], stopped: number[] = [], volumes: number[] = [];
  class FakeAudioContext {
    state = 'running'; currentTime = 0; destination = {};
    decodeAudioData(data: ArrayBuffer) { return Promise.resolve({ id: new Uint8Array(data)[0] }); }
    createGain() { return { gain: { value: 1, setValueAtTime(v: number) { volumes.push(v); } }, connect() {} }; }
    createBufferSource() { return { buffer: null as { id: number } | null, connect() {}, onended: null, start() { started.push(this.buffer!.id); }, stop() { stopped.push(this.buffer!.id); } }; }
  }
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { AudioContext: FakeAudioContext } });
  globalThis.fetch = ((url: string | URL | Request) => new Promise<Response>(resolve => pending.set(String(url), resolve))) as typeof fetch;
  const finish = async (id: string, value: number) => {
    const resolve = [...pending.entries()].find(([url]) => url.endsWith(`/${id}.mp3`))?.[1];
    assert.ok(resolve);
    resolve(new Response(new Uint8Array([value])));
    await new Promise(resolve => setTimeout(resolve, 0));
  };
  try {
    const sound = new SoundAndHapticsManager();
    sound.playStoryLine('active');
    await finish('active', 1);
    sound.muted = true;
    assert.deepEqual(stopped, [1]);
    assert.deepEqual(volumes, [0]);
    sound.muted = false;
    sound.playStoryLine('pending');
    sound.muted = true;
    sound.muted = false;
    await finish('pending', 2);
    assert.deepEqual(started, [1], 'muted downloads do not play after unmuting');
    assert.deepEqual(volumes, [0, 1, 0, 1]);
  } finally {
    if (originalWindow === undefined) Reflect.deleteProperty(globalThis, 'window');
    else Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
    globalThis.fetch = originalFetch;
  }
});

test('muting cancels a spoken character line', async () => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  const originalUtterance = globalThis.SpeechSynthesisUtterance;
  let cancels = 0, spoken = 0;
  class FakeAudioContext { state = 'running'; currentTime = 0; destination = {}; }
  const speechSynthesis = { getVoices: () => [{ lang: 'ar-SA', name: 'Arabic' }], cancel: () => { cancels++; }, speak: () => { spoken++; } };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { AudioContext: FakeAudioContext, speechSynthesis } });
  Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', { configurable: true, value: class {} });
  globalThis.fetch = (() => Promise.resolve(new Response('', { status: 404 }))) as typeof fetch;
  try {
    const sound = new SoundAndHapticsManager();
    sound.playVoice('noura', 'served');
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(spoken, 1);
    sound.muted = true;
    assert.equal(cancels, 2, 'one cancellation before speaking and another when muted');
  } finally {
    if (originalWindow === undefined) Reflect.deleteProperty(globalThis, 'window');
    else Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
    if (originalUtterance === undefined) Reflect.deleteProperty(globalThis, 'SpeechSynthesisUtterance');
    else Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', { configurable: true, value: originalUtterance });
    globalThis.fetch = originalFetch;
  }
});

test('a shipped voice file that fails to load is never read with the device voice, and the failure is reported', async () => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  const originalUtterance = globalThis.SpeechSynthesisUtterance;
  let spoken = 0;
  class FakeAudioContext { state = 'running'; currentTime = 0; destination = {}; decodeAudioData() { return Promise.reject(new Error('EncodingError')); } }
  const speechSynthesis = { getVoices: () => [{ lang: 'ar-SA', name: 'Arabic' }], cancel: () => {}, speak: () => { spoken++; } };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { AudioContext: FakeAudioContext, speechSynthesis } });
  Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', { configurable: true, value: class {} });
  globalThis.fetch = (() => Promise.resolve(new Response(new Uint8Array([1, 2, 3])))) as typeof fetch;
  try {
    const sound = new SoundAndHapticsManager();
    sound.playVoice('noura', 'served');
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(spoken, 0, 'formal-Arabic device speech must not replace a dialect recording');
    const d = sound.getAudioDiagnostics();
    assert.equal(d.files.length, 1);
    assert.equal(d.files[0].ok, false);
    assert.match(d.files[0].detail, /decode failed.*EncodingError/);
    assert.match(d.lastVoicePlayback, /silent/);
  } finally {
    if (originalWindow === undefined) Reflect.deleteProperty(globalThis, 'window');
    else Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
    if (originalUtterance === undefined) Reflect.deleteProperty(globalThis, 'SpeechSynthesisUtterance');
    else Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', { configurable: true, value: originalUtterance });
    globalThis.fetch = originalFetch;
  }
});

test('an interrupted audio context is resumed and the callback form of decodeAudioData works', async () => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  let resumes = 0, started = 0;
  class FakeAudioContext {
    state = 'interrupted'; currentTime = 0; destination = {};
    resume() { resumes++; return Promise.resolve(); }
    decodeAudioData(_d: ArrayBuffer, ok: (b: unknown) => void) { ok({ duration: 1 }); return undefined; }
    createGain() { return { gain: { value: 1, setValueAtTime() {} }, connect() {} }; }
    createBufferSource() { return { buffer: null, connect() {}, onended: null, start() { started++; }, stop() {} }; }
  }
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { AudioContext: FakeAudioContext } });
  globalThis.fetch = (() => Promise.resolve(new Response(new Uint8Array([1])))) as typeof fetch;
  try {
    const sound = new SoundAndHapticsManager();
    sound.unlockAudio();
    assert.equal(resumes, 1);
    sound.playVoice('tariq', 'greet');
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(started, 1);
    assert.match(sound.getAudioDiagnostics().lastVoicePlayback, /recorded file \(Web Audio\)/);
  } finally {
    if (originalWindow === undefined) Reflect.deleteProperty(globalThis, 'window');
    else Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
    globalThis.fetch = originalFetch;
  }
});

test('music can be switched off on its own and the choice is remembered', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } });
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
  try {
    assert.equal(loadMusicEnabled(), true, 'music is on by default');
    saveMusicEnabled(false);
    assert.equal(loadMusicEnabled(), false);
    assert.equal(loadMuted(), false, 'effects and voices are not muted by the music choice');
    const sound = new SoundAndHapticsManager();
    assert.equal(sound.musicEnabled, false);
    // With music off, starting the ambient loop schedules nothing (no timers, no downloads).
    sound.startAmbient();
    assert.equal((sound as unknown as { ambientScheduled: boolean }).ambientScheduled, false);
    saveMusicEnabled(true);
    assert.equal(loadMusicEnabled(), true);
  } finally {
    if (originalWindow === undefined) Reflect.deleteProperty(globalThis, 'window');
    else Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
