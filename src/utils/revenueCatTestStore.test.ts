import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canInitializeTestStore, retryableInitialization } from './revenueCatTestStore';
import { canInitializeAppStore } from './revenueCatAppStore';
import { classifyProbeFetchError, inspectTestOffering, type ProbeStage } from './revenueCatProbeStages';
import { accessFromEntitlements } from './paidAccess';

test('paid access uses active unexpired entitlements, never a legacy save flag', () => {
  const now = Date.parse('2026-11-03T12:00:00Z');
  assert.deepEqual(accessFromEntitlements({ vipPassActive: true }, now), { membership: false, decor: false });
  assert.deepEqual(accessFromEntitlements({ majlis_membership: { isActive: true, expirationDate: '2026-11-04T12:00:00Z' }, majlis_decor_pack: { isActive: true, expirationDate: null } }, now), { membership: true, decor: true });
  assert.equal(accessFromEntitlements({ majlis_membership: { isActive: true, expirationDate: '2026-11-02T12:00:00Z' } }, now).membership, false);
  assert.equal(accessFromEntitlements({ majlis_decor_pack: { isActive: false, expirationDate: null } }, now).decor, false);
});

test('test probe maps known fetch errors to fixed non-sensitive categories', () => {
  assert.equal(classifyProbeFetchError({ code: '10', message: 'private' }), 'FETCH_NETWORK');
  assert.equal(classifyProbeFetchError({ code: '11' }), 'FETCH_CREDENTIALS');
  assert.equal(classifyProbeFetchError({ code: '23' }), 'FETCH_CONFIGURATION');
  assert.equal(classifyProbeFetchError({ code: '23', underlyingErrorMessage: 'None of the products registered in the RevenueCat dashboard could be fetched from App Store Connect. private details' }), 'FETCH_PRODUCTS_UNAVAILABLE');
  assert.equal(classifyProbeFetchError({ code: '23', data: { underlyingErrorMessage: 'None of the products registered\nin the dashboard could be fetched. private details' } }), 'FETCH_PRODUCTS_UNAVAILABLE');
  assert.equal(classifyProbeFetchError({ code: '23', message: 'There are no products registered in the RevenueCat dashboard for your offerings. private details' }), 'FETCH_NO_PRODUCTS');
  assert.equal(classifyProbeFetchError({ code: '23', data: { message: 'There are no products registered\nin the dashboard for your offerings.' } }), 'FETCH_NO_PRODUCTS');
  assert.equal(classifyProbeFetchError({ code: '23', underlyingErrorMessage: { private: 'secret' } }), 'FETCH_CONFIGURATION');
  assert.equal(classifyProbeFetchError({ code: '12' }), 'FETCH_BACKEND');
  assert.equal(classifyProbeFetchError({ code: '32' }), 'FETCH_STORE');
  assert.equal(classifyProbeFetchError({ code: 'UNIMPLEMENTED' }), 'FETCH_PLUGIN');
  assert.equal(classifyProbeFetchError({ code: 'untrusted text', message: 'private' }), 'FETCH_OTHER');
  assert.equal(classifyProbeFetchError(null), 'FETCH_OTHER');
});

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
  assert.deepEqual(await stages(ok, fail), ['INITIALIZED', 'FETCH_OTHER']);
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
