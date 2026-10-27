import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState } from '../game/rules';
import { BACKUP_KEY, SAVE_KEY, clearSave, readSave, writeSave } from './saveStorage';

function memoryStore() {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); }, clear: () => values.clear(), key: () => null, length: 0 } as Storage;
  return { storage, values };
}

test('the previous valid save is recoverable when the current one is damaged', () => {
  const { storage, values } = memoryStore();
  const first = { ...createInitialGameState(), coins: 500 };
  const second = { ...first, coins: 600 };
  assert.equal(readSave(storage).status, 'fresh');
  assert.ok(writeSave(storage, first));
  assert.ok(writeSave(storage, second));
  assert.equal(readSave(storage).state?.coins, 600);
  values.set(SAVE_KEY, '{broken');
  const recovered = readSave(storage);
  assert.equal(recovered.status, 'recovered');
  assert.equal(recovered.state?.coins, 500);
  assert.ok(writeSave(storage, recovered.state!));
  assert.equal(JSON.parse(values.get(BACKUP_KEY)!).coins, 500, 'corrupt primary never overwrites backup');
});

test('unreadable or malformed saves are distinguished from a fresh installation', () => {
  const { storage, values } = memoryStore();
  values.set(SAVE_KEY, JSON.stringify({ ...createInitialGameState(), board: Array(49).fill(null) }));
  assert.equal(readSave(storage).status, 'corrupt');
  values.set(BACKUP_KEY, 'not json');
  assert.equal(readSave(storage).status, 'corrupt');
  assert.ok(clearSave(storage));
  assert.equal(readSave(storage).status, 'fresh');
});

test('malformed quest, festival, and item data recover the valid backup without overwriting it', () => {
  const valid = { ...createInitialGameState(), coins: 450 };
  const broken: unknown[] = [
    { ...valid, board: valid.board.map((cell, i) => i === 0 ? { ...cell, itemId: 'unknown_item' } : cell) },
    { ...valid, inventory: ['unknown_item'] },
    { ...valid, activeOrders: [{ ...valid.activeOrders[0], requiredItemIds: ['unknown_item'] }] },
    { ...valid, activeOrders: [{ ...valid.activeOrders[0], customerNameAr: null }] },
    { ...valid, activeOrders: [{ ...valid.activeOrders[0], rewardStars: 'broken' }] },
    { ...valid, activeOrders: [{ ...valid.activeOrders[0], rewardCoins: -1 }] },
    { ...valid, activeOrders: [{ ...valid.activeOrders[0], isVip: 'yes' }] },
    { ...valid, dailyQuests: { dayKey: '2026-10-20', baseline: null, claimed: [], bonusClaimed: false } },
    { ...valid, liveEvent: { instanceId: 'coffee@123', points: 100, claimed: null } },
    { ...valid, questDelivery: { quests: 1, coins: 'broken' } },
    { ...valid, festivalDelivery: { milestones: 1, coins: 50 } },
    { ...valid, renovationZones: [null] },
    { ...valid, renovationZones: [{ ...valid.renovationZones[0], styles: null }] },
    { ...valid, renovationZones: [{ ...valid.renovationZones[0], selectedStyle: 99 }] },
    { ...valid, generatorLevels: { qahwa: 'broken' } },
  ];
  for (const invalid of broken) {
    const { storage, values } = memoryStore();
    values.set(BACKUP_KEY, JSON.stringify(valid));
    values.set(SAVE_KEY, JSON.stringify(invalid));
    const recovered = readSave(storage);
    assert.equal(recovered.status, 'recovered');
    assert.equal(recovered.state?.coins, 450);
    assert.ok(writeSave(storage, recovered.state!));
    assert.equal(JSON.parse(values.get(BACKUP_KEY)!).coins, 450);
  }
});

test('a failed backup or write preserves the last primary and reports failure', () => {
  const { storage, values } = memoryStore();
  const first = createInitialGameState();
  assert.ok(writeSave(storage, first));
  const blocked = { ...storage, setItem: () => { throw new Error('quota'); } } as Storage;
  assert.equal(writeSave(blocked, { ...first, coins: 12345 }), false);
  assert.equal(JSON.parse(values.get(SAVE_KEY)!).coins, first.coins);
  const unreadable = { ...storage, getItem: () => { throw new Error('disabled'); } } as Storage;
  assert.equal(readSave(unreadable).status, 'unavailable');
  assert.equal(writeSave(unreadable, first), false);
});

test('a reset removes both slots and cannot clear the primary if backup removal fails', () => {
  const { storage, values } = memoryStore();
  const state = createInitialGameState();
  assert.ok(writeSave(storage, state));
  assert.ok(writeSave(storage, { ...state, coins: state.coins + 1 }));
  const blocked = { ...storage, removeItem: (key: string) => { if (key === BACKUP_KEY) throw new Error('blocked'); values.delete(key); } } as Storage;
  assert.equal(clearSave(blocked), false);
  assert.ok(values.has(SAVE_KEY));
  assert.ok(clearSave(storage));
  assert.equal(values.size, 0);
});
