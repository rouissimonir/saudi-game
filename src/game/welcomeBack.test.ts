import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState } from './rules';
import { WELCOME_BACK_MIN_MS, readPresence, welcomeBackSummary, writePresence } from './welcomeBack';

test('no welcome back for a short break, an unknown past, or when nothing changed', () => {
  const state = { ...createInitialGameState(), energy: 50 };
  const now = 10_000_000;
  assert.equal(welcomeBackSummary(null, now, state), null);
  assert.equal(welcomeBackSummary({ at: now - 5 * 60_000, energy: 10 }, now, state), null, 'five minutes is not away');
  assert.equal(welcomeBackSummary({ at: now - WELCOME_BACK_MIN_MS, energy: 50 }, now, { ...state, activeOrders: [] }), null, 'nothing to report');
});

test('reports the energy regained while away', () => {
  const state = { ...createInitialGameState(), energy: 80, activeOrders: [] };
  const now = 20_000_000;
  const summary = welcomeBackSummary({ at: now - 45 * 60_000, energy: 35 }, now, state);
  assert.deepEqual(summary, { minutesAway: 45, energyGained: 45, readyOrders: 0 });
});

test('never reports negative energy and counts only ready orders', () => {
  const base = createInitialGameState();
  const itemId = base.board.find((c) => c.itemId && !c.sandLocked)!.itemId!;
  const ready = { ...base.activeOrders[0], requiredItemIds: [itemId] };
  const state = { ...base, energy: 20, activeOrders: [ready, { ...base.activeOrders[1], requiredItemIds: ['nonexistent_item_for_test'] }] };
  const summary = welcomeBackSummary({ at: 0, energy: 90 }, 3 * 60 * 60_000, state);
  assert.equal(summary?.energyGained, 0);
  assert.equal(summary?.readyOrders, 1);
});

test('presence round-trips through storage and survives bad data', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); } };
  assert.equal(readPresence(storage), null);
  writePresence({ at: 123, energy: 7 }, storage);
  assert.deepEqual(readPresence(storage), { at: 123, energy: 7 });
  values.set('qahwa_presence', 'not json');
  assert.equal(readPresence(storage), null);
});
