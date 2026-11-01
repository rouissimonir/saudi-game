import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadMuted, saveMuted, SoundAndHapticsManager } from './soundAndHaptics';

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
