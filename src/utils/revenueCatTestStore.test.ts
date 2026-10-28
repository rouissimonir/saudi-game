import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canInitializeTestStore } from './revenueCatTestStore';

test('Test Store is available only to development builds on native iOS with a test key', () => {
  assert.equal(canInitializeTestStore(true, 'ios', 'test_Example123'), true);
  assert.equal(canInitializeTestStore(false, 'ios', 'test_Example123'), false);
  assert.equal(canInitializeTestStore(true, 'web', 'test_Example123'), false);
  assert.equal(canInitializeTestStore(true, 'android', 'test_Example123'), false);
  assert.equal(canInitializeTestStore(true, 'ios', 'appl_Example123'), false);
  assert.equal(canInitializeTestStore(true, 'ios', undefined), false);
});
