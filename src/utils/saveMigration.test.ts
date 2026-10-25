import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: () => null,
  length: 0,
};

test('saves from before the endless economy load with every new field filled in', async () => {
  const { createInitialGameState } = await import('../game/rules');
  const { loadSavedGameState, saveGameState } = await import('./soundAndHaptics');
  const { generateOrder } = await import('../game/progression');
  const legacy: Record<string, unknown> = { ...createInitialGameState(), activeStoryId: null, coins: 777 };
  for (const k of ['areaIndex', 'rngSeed', 'generatorLevels', 'totalSpawns', 'wingUpgrades', 'sandTilesBought', 'coinEnergyToday', 'lastEnergyTick', 'dailyQuests']) {
    delete legacy[k];
  }
  saveGameState(legacy as never);
  const loaded = loadSavedGameState();
  assert.ok(loaded);
  assert.equal(loaded.coins, 777);
  assert.equal(loaded.activeStoryId, null, 'intentional nulls survive');
  assert.equal(loaded.areaIndex, 0);
  assert.ok(Number.isFinite(loaded.rngSeed));
  assert.equal(loaded.generatorLevels.qahwa, 1);
  const { order, seed } = generateOrder(loaded);
  assert.ok(Number.isFinite(seed));
  assert.ok(order.requiredItemIds.length > 0);
});
