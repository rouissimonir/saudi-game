import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState } from './rules';
import { readRateRecord, shouldAskForRating, writeRateRecord, WRITE_REVIEW_URL } from './ratePrompt';

const happy = { ...createInitialGameState(), level: 5, ordersCompleted: 12 };
const none = { asks: 0, lastAskAt: 0, done: false };
const DAY = 24 * 60 * 60_000;

test('asks only a settled, happy player and only when switched on', () => {
  assert.equal(shouldAskForRating(happy, none, 1000, true), true);
  assert.equal(shouldAskForRating(happy, none, 1000, false), false, 'switched off');
  assert.equal(shouldAskForRating({ ...happy, level: 3 }, none, 1000, true), false);
  assert.equal(shouldAskForRating({ ...happy, ordersCompleted: 9 }, none, 1000, true), false);
});

test('never again after rating, waits two weeks after a "later", and stops after two asks', () => {
  assert.equal(shouldAskForRating(happy, { asks: 1, lastAskAt: 0, done: true }, 100 * DAY, true), false);
  assert.equal(shouldAskForRating(happy, { asks: 1, lastAskAt: 0, done: false }, 13 * DAY, true), false);
  assert.equal(shouldAskForRating(happy, { asks: 1, lastAskAt: 0, done: false }, 14 * DAY, true), true);
  assert.equal(shouldAskForRating(happy, { asks: 2, lastAskAt: 0, done: false }, 100 * DAY, true), false);
});

test('the record survives storage and bad data, and the link points at the review form', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); } };
  assert.deepEqual(readRateRecord(storage), none);
  writeRateRecord({ asks: 1, lastAskAt: 5, done: true }, storage);
  assert.deepEqual(readRateRecord(storage), { asks: 1, lastAskAt: 5, done: true });
  values.set('qahwa_rate', '{oops');
  assert.deepEqual(readRateRecord(storage), none);
  assert.match(WRITE_REVIEW_URL, /^https:\/\/apps\.apple\.com\/app\/id\d+\?action=write-review$/);
});
