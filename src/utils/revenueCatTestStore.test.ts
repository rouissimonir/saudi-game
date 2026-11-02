import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canInitializeTestStore, retryableInitialization } from './revenueCatTestStore';
import { canInitializeAppStore } from './revenueCatAppStore';
import { inspectTestOffering, type ProbeStage } from './revenueCatProbeStages';

test('test offering diagnostics distinguish setup, fetch, missing offering and missing packages', async () => {
  const all = ['$rc_monthly', 'starter_pack', 'decor_pack'];
  const stages = async (init: () => Promise<void>, fetchIds: () => Promise<string[] | null>) => {
    const result: ProbeStage[] = [];
    await inspectTestOffering(init, fetchIds, stage => result.push(stage));
    return result;
  };
  const ok = async () => {};
  const fail = async (): Promise<never> => { throw Error('private details should not be reported'); };
  assert.deepEqual(await stages(fail, async () => all), ['CONFIG_FAILED']);
  assert.deepEqual(await stages(ok, fail), ['INITIALIZED', 'FETCH_FAILED']);
  assert.deepEqual(await stages(ok, async () => null), ['INITIALIZED', 'NO_CURRENT']);
  assert.deepEqual(await stages(ok, async () => ['$rc_monthly']), ['INITIALIZED', 'MISSING_PACKAGES']);
  assert.deepEqual(await stages(ok, async () => all), ['INITIALIZED', 'OFFERINGS_OK']);
});

test('App Store initialization requires a production iOS build and an App Store public key', () => {
  assert.equal(canInitializeAppStore(true, 'ios', 'appl_Example123'), true);
  assert.equal(canInitializeAppStore(false, 'ios', 'appl_Example123'), false);
  assert.equal(canInitializeAppStore(true, 'web', 'appl_Example123'), false);
  assert.equal(canInitializeAppStore(true, 'android', 'appl_Example123'), false);
  assert.equal(canInitializeAppStore(true, 'ios', 'test_Example123'), false);
  assert.equal(canInitializeAppStore(true, 'ios', undefined), false);
});

test('Test Store is available only to development builds on native iOS with a test key', () => {
  assert.equal(canInitializeTestStore(true, 'ios', 'test_Example123'), true);
  assert.equal(canInitializeTestStore(false, 'ios', 'test_Example123'), false);
  assert.equal(canInitializeTestStore(true, 'web', 'test_Example123'), false);
  assert.equal(canInitializeTestStore(true, 'android', 'test_Example123'), false);
  assert.equal(canInitializeTestStore(true, 'ios', 'appl_Example123'), false);
  assert.equal(canInitializeTestStore(true, 'ios', undefined), false);
});

test('initialization shares a concurrent attempt and retries after failure', async () => {
  let attempts = 0;
  const initialize = retryableInitialization(async () => {
    attempts++;
    if (attempts === 1) throw new Error('unavailable');
  });
  const first = initialize();
  assert.equal(initialize(), first);
  await assert.rejects(first, /unavailable/);
  await initialize();
  await initialize();
  assert.equal(attempts, 2);
});
