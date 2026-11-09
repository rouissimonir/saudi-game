import test from 'node:test';
import assert from 'node:assert/strict';
import { trackRecent } from './recentKeys';

test('evicts the oldest keys beyond the limit', () => {
  const order: string[] = [];
  assert.deepEqual(trackRecent(order, 'a', 2), []);
  assert.deepEqual(trackRecent(order, 'b', 2), []);
  assert.deepEqual(trackRecent(order, 'c', 2), ['a']);
  assert.deepEqual(order, ['b', 'c']);
});

test('using a key again makes it the newest', () => {
  const order: string[] = [];
  for (const k of ['a', 'b', 'a']) trackRecent(order, k, 2);
  assert.deepEqual(trackRecent(order, 'c', 2), ['b']);
  assert.deepEqual(order, ['a', 'c']);
});
