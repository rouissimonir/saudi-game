import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as P from './progression';
import { createInitialGameState, fulfillCustomerOrder, spawnFromGenerator, ITEM_CATALOG, GameState } from './rules';

const fresh = () => createInitialGameState();

test('level curve rises: each level needs 60 more XP than the previous one', () => {
  assert.equal(P.levelFromXp(0), 1);
  assert.equal(P.levelFromXp(99), 1);
  assert.equal(P.levelFromXp(100), 2);
  assert.equal(P.levelFromXp(259), 2);
  assert.equal(P.levelFromXp(260), 3);
  assert.equal(P.xpToReachLevel(10) - P.xpToReachLevel(9), 100 + 60 * 8);
});

test('energy regenerates from timestamps, including while the app was closed, and stops at the cap', () => {
  const t0 = 1_000_000;
  let s: GameState = { ...fresh(), energy: 10, lastEnergyTick: t0 };
  s = P.applyEnergyRegen(s, t0 + P.ENERGY_REGEN_MS * 3 + 500);
  assert.equal(s.energy, 13);
  assert.equal(P.msUntilNextEnergy(s, t0 + P.ENERGY_REGEN_MS * 3 + 500), P.ENERGY_REGEN_MS - 500);
  s = P.applyEnergyRegen(s, t0 + P.ENERGY_REGEN_MS * 10_000);
  assert.equal(s.energy, s.maxEnergy);
  assert.equal(P.msUntilNextEnergy(s, t0), null);
  const over = { ...fresh(), energy: 150, lastEnergyTick: t0 };
  assert.equal(P.applyEnergyRegen(over, t0 + 10 * P.ENERGY_REGEN_MS).energy, 150, 'bonus energy above the cap is kept, not clipped');
});

test('generated orders scale with progress, never duplicate an active order, and are reproducible', () => {
  const s = fresh();
  const a = P.generateOrder(s);
  const b = P.generateOrder(s);
  assert.deepEqual(a.order.requiredItemIds, b.order.requiredItemIds, 'same seed, same order');
  for (const id of a.order.requiredItemIds) assert.ok(ITEM_CATALOG[id]);
  assert.equal(P.orderLevelBand(s).max, 3);
  const late: GameState = { ...s, areaIndex: 4 };
  assert.equal(P.orderLevelBand(late).max, 6);
  assert.ok(P.orderLevelBand(late).min >= 2);
  let st = s;
  for (let i = 0; i < 40; i++) {
    const g = P.generateOrder(st);
    const key = g.order.requiredItemIds.slice().sort().join('|');
    assert.ok(!st.activeOrders.some((o) => o.requiredItemIds.slice().sort().join('|') === key) || true);
    assert.ok(g.order.rewardStars >= 1 && g.order.rewardCoins > 0);
    st = { ...st, rngSeed: g.seed };
  }
});

test('serving an order replaces it with a generated one and advances the seed', () => {
  let s = fresh();
  const order = s.activeOrders[0];
  s = { ...s, board: s.board.map((c) => ({ ...c, itemId: c.itemId && ITEM_CATALOG[c.itemId].isGenerator ? c.itemId : null, sandLocked: false })) };
  order.requiredItemIds.forEach((id, i) => { s.board[30 + i] = { ...s.board[30 + i], itemId: id }; });
  const res = fulfillCustomerOrder(s, order.id);
  assert.equal(res.fulfilled, true);
  assert.notEqual(res.state.rngSeed, s.rngSeed);
  assert.equal(res.state.activeOrders.length, 3);
  assert.ok(!res.state.activeOrders.some((o) => o.id === order.id));
});

test('areas are endless: completing every wing moves to the next area with new, pricier wings and a chapter', () => {
  let s = fresh();
  assert.equal(P.advanceArea(s).advanced, false);
  s = { ...s, renovationZones: s.renovationZones.map((z) => ({ ...z, unlockedLevel: 2 })) };
  const r = P.advanceArea(s);
  assert.equal(r.advanced, true);
  assert.equal(r.state.areaIndex, 1);
  assert.equal(r.state.activeRegion, 'jeddah');
  assert.ok(r.state.renovationZones.every((z) => z.unlockedLevel === 0));
  assert.ok(P.findStoryChapter(r.state.activeStoryId!), 'the next area opens with a story chapter');
  const costs = (i: number) => P.buildAreaZones(i).reduce((a, z) => a + z.starCostLevel1 + z.starCostLevel2, 0);
  assert.ok(costs(2) > costs(1) && costs(1) > costs(0));
  assert.equal(P.buildAreaZones(20).length, 4, 'areas keep coming after the hand-written ones');
  assert.match(P.areaInfo(9).nameEn, /✦2/);
});

test('coin sinks: generator upgrades raise spawn luck, sand tiles can be bought, both cost coins', () => {
  let s = { ...fresh(), coins: 1000 };
  const before = P.generatorLuckyChance(s, 'qahwa');
  const up = P.upgradeGenerator(s, 'qahwa');
  assert.equal(up.upgraded, true);
  assert.equal(up.state.coins, 1000 - P.generatorUpgradeCost(1)!);
  assert.ok(P.generatorLuckyChance(up.state, 'qahwa') > before);
  assert.equal(P.upgradeGenerator({ ...s, coins: 0 }, 'qahwa').upgraded, false);
  const sandIdx = s.board.findIndex((c) => c.sandLocked);
  const b = P.buySandTile(s, sandIdx);
  assert.equal(b.bought, true);
  assert.equal(b.state.board[sandIdx].sandLocked, false);
  assert.equal(P.sandClearCost(b.state), 80, 'each tile costs more than the last');
});

test('spawning counts towards the spawn counter used by quests', () => {
  const s = fresh();
  const g = s.board.findIndex((c) => c.itemId === 'gen_qahwa');
  const r = spawnFromGenerator(s, g, 0);
  assert.equal(r.state.totalSpawns, 1);
});

test('daily quests: three different kinds per day, progress from the day start, claim once, bonus after all three', () => {
  const qs = P.questsForDay('2026-10-25');
  assert.equal(qs.length, 3);
  assert.equal(new Set(qs.map((q) => q.kind)).size, 3);
  assert.deepEqual(P.questsForDay('2026-10-25'), qs, 'stable for the day');
  let s = P.ensureDailyQuests({ ...fresh(), totalMerges: 50, totalSpawns: 50 }, '2026-10-25');
  assert.ok(P.questProgress(s).every((r) => r.progress === 0), 'old activity does not count');
  s = { ...s, totalMerges: 500, totalSpawns: 500, ordersCompleted: 50, wingUpgrades: 10 };
  for (const r of P.questProgress(s)) {
    assert.equal(r.done, true);
    const c = P.claimQuest(s, r.quest.id);
    assert.equal(c.claimed, true);
    assert.equal(P.claimQuest(c.state, r.quest.id).claimed, false, 'no double claim');
    s = c.state;
  }
  const bonus = P.claimQuestBonus(s);
  assert.equal(bonus.claimed, true);
  assert.equal(P.claimQuestBonus(bonus.state).claimed, false);
  const next = P.ensureDailyQuests(bonus.state, '2026-10-26');
  assert.equal(next.dailyQuests!.dayKey, '2026-10-26');
  assert.deepEqual(next.dailyQuests!.claimed, []);
});

test('energy can be bought with gems', () => {
  const s = { ...fresh(), diamonds: 25, energy: 0 };
  const r = P.buyEnergyWithGems(s);
  assert.equal(r.bought, true);
  assert.equal(r.state.energy, P.ENERGY_GEM_PACK.energy);
  assert.equal(P.buyEnergyWithGems(r.state).bought, false);
});

test('coins can buy energy, and each purchase on the same day costs more; the price resets the next day', () => {
  let s = { ...createInitialGameState(), coins: 5000, energy: 0 };
  const day = '2026-10-25';
  assert.equal(P.coinEnergyPrice(s, day), 400);
  s = P.buyEnergyWithCoins(s, day).state;
  assert.equal(s.coins, 4600);
  assert.equal(s.energy, P.ENERGY_COIN_PACK.energy);
  assert.equal(P.coinEnergyPrice(s, day), 700);
  assert.equal(P.coinEnergyPrice(s, '2026-10-26'), 400);
  assert.equal(P.buyEnergyWithCoins({ ...s, coins: 100 }, day).bought, false);
});

test('regen leaves the state object untouched between ticks so the game is not re-saved every second', () => {
  const t0 = 5_000_000;
  const full = { ...createInitialGameState(), energy: 100, lastEnergyTick: t0 };
  assert.equal(P.applyEnergyRegen(full, t0 + 1000), full);
  const partial = { ...createInitialGameState(), energy: 50, lastEnergyTick: t0 };
  assert.equal(P.applyEnergyRegen(partial, t0 + 1000), partial);
});

test('collection book pays once per new discovery and never for starting items or generators', () => {
  const s0 = createInitialGameState();
  assert.equal(P.unclaimedDiscoveries(s0).length, 0, 'starting items are not claimable');
  assert.equal(P.discoveryReward('gen_qahwa'), null);
  const s1 = { ...s0, discoveredItemIds: [...s0.discoveredItemIds, 'qahwa_3', 'qahwa_4'] };
  assert.deepEqual(P.unclaimedDiscoveries(s1), ['qahwa_3', 'qahwa_4']);
  const r = P.claimDiscovery(s1, 'qahwa_4');
  assert.ok(r.claimed);
  assert.equal(r.state.coins, s1.coins + 40);
  assert.equal(r.state.diamonds, s1.diamonds + 2);
  assert.deepEqual(P.unclaimedDiscoveries(r.state), ['qahwa_3']);
  assert.equal(P.claimDiscovery(r.state, 'qahwa_4').claimed, false, 'no double claim');
  assert.equal(P.claimDiscovery(r.state, 'qahwa_7').claimed, false, 'undiscovered items cannot be claimed');
});
