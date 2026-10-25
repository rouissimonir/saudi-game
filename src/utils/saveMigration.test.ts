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

test('old saves do not get retroactive collection rewards for items found before the update', async () => {
  const { createInitialGameState } = await import('../game/rules');
  const { normalizeSave } = await import('../game/normalizeSave');
  const { unclaimedDiscoveries } = await import('../game/progression');
  const legacy: Record<string, unknown> = { ...createInitialGameState() };
  legacy.discoveredItemIds = [...(legacy.discoveredItemIds as string[]), 'qahwa_4', 'oud_5'];
  delete legacy.claimedDiscoveryIds;
  const loaded = normalizeSave(legacy);
  assert.ok(loaded);
  assert.deepEqual(unclaimedDiscoveries(loaded), []);
  const later = { ...loaded, discoveredItemIds: [...loaded.discoveredItemIds, 'qahwa_5'] };
  assert.deepEqual(unclaimedDiscoveries(later), ['qahwa_5'], 'finds after the update still pay');
});

test('transfer codes from older builds get the same normalisation as local saves', async () => {
  const { createInitialGameState } = await import('../game/rules');
  const { exportSaveCode, importSaveCode } = await import('./saveTransfer');
  const legacy: Record<string, unknown> = { ...createInitialGameState(), generatorLevels: { qahwa: 3 } };
  delete legacy.tutorialDismissed;
  legacy.totalMerges = 12;
  const back = await importSaveCode(await exportSaveCode(legacy as never));
  assert.ok(back);
  assert.equal(back.generatorLevels.qahwa, 3);
  assert.equal(back.generatorLevels.oud, 1, 'missing generator levels are filled in');
  assert.equal(back.tutorialDismissed, true);
});
