import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ImpactStyle } from '@capacitor/haptics';
import { deliverHaptic, loadHapticsEnabled, saveHapticsEnabled } from './haptics';

test('native impacts use the requested strength; web uses the vibration fallback', async () => {
  const calls: (ImpactStyle | number)[] = [];
  const backend = { native: true, impact: async (style: ImpactStyle) => { calls.push(style); }, vibrate: (ms: number) => { calls.push(ms); } };
  await deliverHaptic('medium', true, backend);
  await deliverHaptic('heavy', true, backend);
  await deliverHaptic('light', true, { ...backend, native: false });
  assert.deepEqual(calls, [ImpactStyle.Medium, ImpactStyle.Heavy, 8]);
  await deliverHaptic('heavy', false, backend);
  assert.equal(calls.length, 3);
});

test('unsupported feedback does not interrupt play and never uses web fallback on native', async () => {
  let webCalls = 0;
  await assert.doesNotReject(deliverHaptic('light', true, { native: true, impact: async () => { throw new Error('unavailable'); }, vibrate: () => { webCalls++; } }));
  await assert.doesNotReject(deliverHaptic('light', true, { native: false, impact: async () => {}, vibrate: () => { throw new Error('unsupported'); } }));
  assert.equal(webCalls, 0);
});

test('the haptic preference persists independently', () => {
  const old = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } });
  try {
    assert.equal(loadHapticsEnabled(), true);
    saveHapticsEnabled(false);
    assert.equal(loadHapticsEnabled(), false);
    saveHapticsEnabled(true);
    assert.equal(loadHapticsEnabled(), true);
  } finally {
    if (old) Object.defineProperty(globalThis, 'localStorage', old);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
