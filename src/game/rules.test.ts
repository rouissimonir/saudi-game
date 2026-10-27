import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSave } from './normalizeSave';
import {
  createInitialGameState,
  type GameState,
  canMergeItems,
  getNextMergedItemId,
  spawnFromGenerator,
  mergeOrMoveCells,
  fulfillCustomerOrder,
  orderCoinReward,
  VIP_ORDER_GEMS,
  upgradeRenovationZone,
  findBestMergePair,
  autoMergeReservations,
  cyclePowerMultiplier,
  storeBoardItemInInventory,
  retrieveInventoryItemToBoard,
  unlockBonusBubbleWithGems,
  useGoldenScissors,
  useJokerUpgrade,
  openBoardChest,
  CHEST_REWARDS,
  spinLuckyWheel,
  voteMazayenEntry,
  getDailyLoginDay,
  claimDailyLoginReward,
  getTutorialStep,
  dailyLoginAfterTutorial,
  getActiveSeason,
  SEASONS,
  gradePour,
  completePour,
  POUR_REWARDS,
  buildMergeParticleBurst,
} from './rules';

test('initial game state sets up 7x7 board with 4 heritage generators (including Oud) and starter items', () => {
  const state = createInitialGameState();
  assert.equal(state.board.length, 49);
  assert.equal(state.board[1].itemId, 'gen_qahwa');
  assert.equal(state.board[2].itemId, 'gen_oud');
  assert.equal(state.board[3].itemId, 'gen_barista');
  assert.equal(state.board[5].itemId, 'gen_sweets');
  assert.equal(state.board[26].itemId, 'chest_1');
  assert.equal(state.scissorsCount, 2);
  assert.equal(state.jokerCount, 1);
  assert.equal(state.freeSpinsAvailable, 1);
});

test('canMergeItems and getNextMergedItemId evolve Qahwa, Oud, and Chest chains properly', () => {
  assert.equal(canMergeItems('qahwa_1', 'qahwa_1'), true);
  assert.equal(canMergeItems('oud_1', 'oud_1'), true);
  assert.equal(canMergeItems('chest_1', 'chest_1'), true);
  assert.equal(canMergeItems('chest_2', 'chest_2'), false);
  assert.equal(getNextMergedItemId('oud_1'), 'oud_2');
  assert.equal(getNextMergedItemId('oud_5'), 'oud_6');
  assert.equal(getNextMergedItemId('chest_1'), 'chest_2');
});

test('Power Boost multiplier (1x -> 2x -> 4x) spawns higher-level items directly including Oud', () => {
  let state = createInitialGameState();
  state = cyclePowerMultiplier(state);
  assert.equal(state.powerMultiplier, 2);

  // Spawn from Oud generator (cell 2) at 2x multiplier -> oud_2
  const res2x = spawnFromGenerator(state, 2, 0.1);
  assert.equal(res2x.spawnedItemId, 'oud_2');
  assert.equal(res2x.state.energy, state.energy - 2);
});

test('low energy uses the highest affordable power boost without wasting energy', () => {
  const base = createInitialGameState();
  for (const [selected, energy, cost, item] of [
    [4, 1, 1, 'qahwa_1'], [4, 2, 2, 'qahwa_2'], [4, 3, 2, 'qahwa_2'],
    [4, 4, 4, 'qahwa_3'], [2, 3, 2, 'qahwa_2'], [1, 4, 1, 'qahwa_1'],
  ] as const) {
    const result = spawnFromGenerator({ ...base, powerMultiplier: selected, energy }, 1, 0);
    assert.equal(result.spawnedItemId, item);
    assert.equal(result.state.energy, energy - cost);
  }
  const empty = spawnFromGenerator({ ...base, powerMultiplier: 4, energy: 0 }, 1, 0);
  assert.equal(empty.reason, 'NO_ENERGY');
  assert.equal(empty.state.energy, 0);
});

test('Golden Scissors splits Lv.2+ item into two Lv.(N-1) items and Royal Joker upgrades Lv.1-5 item', () => {
  const state = createInitialGameState();
  // Cell 25 has qahwa_2 (Lv.2)
  const splitRes = useGoldenScissors(state, 25);
  assert.equal(splitRes.split, true);
  assert.equal(splitRes.lowerItemId, 'qahwa_1');
  assert.equal(splitRes.state.board[25].itemId, 'qahwa_1');
  assert.equal(splitRes.state.scissorsCount, 1);

  // Use Royal Joker on Cell 24 (barista_2 -> barista_3)
  const jokerRes = useJokerUpgrade(splitRes.state, 24);
  assert.equal(jokerRes.upgraded, true);
  assert.equal(jokerRes.upgradedItemId, 'barista_3');
  assert.equal(jokerRes.state.board[24].itemId, 'barista_3');
  assert.equal(jokerRes.state.jokerCount, 0);
});

test('Mergeable Majlis Chest (chest_1) opens or merges into chest_2 for 3x rewards', () => {
  const state = createInitialGameState();
  // Cell 26 has chest_1
  const openRes = openBoardChest(state, 26);
  assert.equal(openRes.opened, true);
  assert.equal(openRes.tier, 1);
  assert.equal(openRes.state.board[26].itemId, null);
  assert.equal(openRes.state.coins, state.coins + 60);
  assert.equal(openRes.state.diamonds, state.diamonds + 12);
});

test('Lucky Dallah Spin Wheel and Weekly Mazayen Al-Majlis voting award prizes accurately', () => {
  const state = createInitialGameState();
  const spinRes = spinLuckyWheel(state, 0); // Wedge 0 = +45 Energy
  assert.equal(spinRes.spun, true);
  assert.equal(spinRes.state.freeSpinsAvailable, 0);
  assert.equal(spinRes.state.energy, state.energy + 45);

  const voteRes = voteMazayenEntry(spinRes.state, 'riv_1');
  assert.equal(voteRes.voted, true);
  assert.equal(voteRes.state.mazayenVotesRemaining, 2);
  assert.equal(voteRes.state.coins, spinRes.state.coins + 25);
});

test('a full board delivers wheel prizes, opening chest prizes without losing contents', () => {
  const base = createInitialGameState();
  const board = base.board.map(c => ({ ...c, itemId: c.itemId ?? 'qahwa_1', sandLocked: false }));
  const free = { ...base, board };
  const freeResult = spinLuckyWheel(free, 5);
  assert.equal(freeResult.spun, true);
  assert.equal(freeResult.openedChest, true);
  assert.deepEqual(freeResult.state.lastWheelPrize, { wedgeId: 'w_chest', openedChest: true });
  assert.equal(freeResult.state.freeSpinsAvailable, 0);
  assert.equal(freeResult.state.board, board);
  assert.equal(freeResult.state.coins, free.coins + CHEST_REWARDS.wooden.coins);
  assert.equal(freeResult.state.diamonds, free.diamonds + CHEST_REWARDS.wooden.gems);
  assert.equal(freeResult.state.energy, free.energy + CHEST_REWARDS.wooden.energy);
  assert.equal(freeResult.state.prestigePoints, free.prestigePoints + 15 + CHEST_REWARDS.wooden.prestige);
  const paid = { ...free, freeSpinsAvailable: 0, diamonds: 50 };
  const paidResult = spinLuckyWheel(paid, 5);
  assert.equal(paidResult.spun, true);
  assert.equal(paidResult.state.diamonds, 50 - 15 + CHEST_REWARDS.wooden.gems);
  const energyPrize = spinLuckyWheel(free, 0);
  assert.equal(energyPrize.state.energy, free.energy + 45);
  assert.equal(energyPrize.openedChest, false);
  const noGems = { ...paid, diamonds: 14 };
  assert.equal(spinLuckyWheel(noGems, 5).state, noGems);
  const space = spinLuckyWheel(base, 5);
  assert.equal(space.openedChest, false);
  assert.equal(space.state.board.filter(c => c.itemId === 'chest_1').length, 2);
});

test('the last wheel prize survives save reload without being paid again', () => {
  const initial = createInitialGameState();
  const spun = spinLuckyWheel(initial, 1).state;
  const loaded = normalizeSave(JSON.parse(JSON.stringify(spun)))!;
  assert.deepEqual(loaded.lastWheelPrize, { wedgeId: 'w_coins', openedChest: false });
  assert.equal(loaded.coins, initial.coins + 120);
  const old = { ...initial } as Partial<GameState>;
  delete old.lastWheelPrize;
  assert.equal(normalizeSave(old)?.lastWheelPrize, null);
  assert.equal(normalizeSave({ ...initial, lastWheelPrize: { wedgeId: 'w_fake', openedChest: true } })?.lastWheelPrize, null);
  assert.equal(normalizeSave({ ...initial, lastWheelPrize: { wedgeId: 'w_coins', openedChest: true } })?.lastWheelPrize, null);
});

test('Sadu Pantry inventory, Bonus Bubble, Customer Orders, and Renovation work end-to-end', () => {
  const state = createInitialGameState();
  const storeRes = storeBoardItemInInventory(state, 25);
  assert.equal(storeRes.stored, true);
  const retRes = retrieveInventoryItemToBoard(storeRes.state, 0);
  assert.equal(retRes.retrieved, true);

  // Unlock sand-locked sweets_2 at cell 6 by merging sweets_1 (17+18 -> 18) and then 18 -> 6
  const m1 = mergeOrMoveCells(retRes.state, 17, 18);
  assert.equal(m1.mergedItemId, 'sweets_2');
  const orderRes = fulfillCustomerOrder(m1.state, 'ord_init_1');
  assert.equal(orderRes.fulfilled, true);

  const upg = upgradeRenovationZone(orderRes.state, 'zone_sadu');
  assert.equal(upg.upgraded, true);
  assert.ok(findBestMergePair(upg.state.board) !== null);

  // Test Bonus Bubble unlock
  const m3 = mergeOrMoveCells(upg.state, 18, 6);
  if (m3.state.bonusBubble) {
    const bub = unlockBonusBubbleWithGems(m3.state);
    assert.equal(bub.unlocked, true);
  }
});

function emptyBoardState(): GameState {
  const state = createInitialGameState();
  return {
    ...state,
    board: state.board.map((c) => ({ ...c, itemId: null, sandLocked: false })),
  };
}

function withItems(state: ReturnType<typeof emptyBoardState>, items: Record<number, string>) {
  return { ...state, board: state.board.map((c) => (items[c.index] ? { ...c, itemId: items[c.index] } : c)) };
}

test('auto-merge preserves individual order and focused recipe quantities', () => {
  const state = withItems(emptyBoardState(), { 0: 'qahwa_2', 2: 'qahwa_2', 4: 'sweets_1', 6: 'sweets_1' });
  const first = { ...state.activeOrders[0], requiredItemIds: ['qahwa_2', 'qahwa_2'] };
  const second = { ...state.activeOrders[1], requiredItemIds: ['qahwa_2'] };
  const reservations = autoMergeReservations([first, second], ['sweets_1']);
  assert.deepEqual(reservations, { qahwa_2: 2, sweets_1: 1 });
  assert.equal(findBestMergePair(state.board, reservations), null);
  assert.ok(findBestMergePair(state.board), 'manual merges remain possible');
  state.board[8].itemId = 'sweets_1';
  assert.deepEqual(findBestMergePair(state.board, reservations), [4, 6]);
  const result = mergeOrMoveCells(state, 4, 6);
  assert.equal(result.action, 'MERGED');
  assert.equal(result.state.board.filter(c => c.itemId === 'sweets_1').length, 1);
});

test('auto-merge accounts for pantry copies without spending needed board copies', () => {
  const state = withItems(emptyBoardState(), { 0: 'qahwa_1', 2: 'qahwa_1' });
  const order = { ...state.activeOrders[0], requiredItemIds: ['qahwa_1', 'qahwa_1'] };
  state.activeOrders = [order];
  state.inventory = ['qahwa_1'];
  let reservations = autoMergeReservations(state.activeOrders, [], state.inventory);
  assert.equal(reservations.qahwa_1, 1);
  assert.equal(findBestMergePair(state.board, reservations), null);
  state.inventory.push('qahwa_1');
  reservations = autoMergeReservations(state.activeOrders, [], state.inventory);
  assert.equal(reservations.qahwa_1, 0);
  assert.deepEqual(findBestMergePair(state.board, reservations), [0, 2]);
  assert.equal(mergeOrMoveCells(state, 0, 2).action, 'MERGED');
  assert.equal(autoMergeReservations([], ['qahwa_1', 'qahwa_1'], ['qahwa_1']).qahwa_1, 1);
});

test('a pantry copy allows a mega merge past a tier already needed by an order', () => {
  const state = withItems(emptyBoardState(), { 0: 'qahwa_1', 1: 'qahwa_1', 8: 'qahwa_1' });
  state.activeOrders = [{ ...state.activeOrders[0], requiredItemIds: ['qahwa_2'] }];
  state.inventory = ['qahwa_2'];
  const pair = findBestMergePair(state.board, autoMergeReservations(state.activeOrders, [], state.inventory));
  assert.ok(pair);
  const result = mergeOrMoveCells(state, ...pair);
  assert.equal(result.megaMerge, true);
  assert.equal(result.mergedItemId, 'qahwa_3');
  assert.deepEqual(result.state.inventory, ['qahwa_2']);
});

test('auto-merge accounts for sand and prevents a mega merge consuming or skipping reserved items', () => {
  const state = withItems(emptyBoardState(), { 0: 'qahwa_1', 1: 'qahwa_1', 8: 'qahwa_1' });
  state.board[1].sandLocked = true;
  assert.deepEqual(findBestMergePair(state.board, { qahwa_1: 1 }), [0, 1], 'the protected neighbour is left untouched');
  const pair = findBestMergePair(state.board, { qahwa_2: 1 });
  assert.deepEqual(pair, [0, 1], 'the regular merge does not skip the needed level');
  assert.equal(mergeOrMoveCells(state, ...pair!).mergedItemId, 'qahwa_2');
  state.board[8].itemId = null;
  assert.equal(findBestMergePair(state.board, { qahwa_1: 1 }), null, 'a locked tile still consumes the unlocked item');
  state.board[4].itemId = 'qahwa_1';
  assert.deepEqual(findBestMergePair(state.board, { qahwa_1: 1 }), [0, 1], 'a surplus item allows the sand to be cleared');
});

test('combo chain grows inside the window, pays bonus coins from the 3rd merge, and resets when stale', () => {
  let state = withItems(emptyBoardState(), {
    8: 'qahwa_1', 9: 'qahwa_1', 11: 'qahwa_1', 12: 'qahwa_1', 22: 'qahwa_1', 23: 'qahwa_1', 25: 'qahwa_1', 26: 'qahwa_1',
  });
  const t0 = 1_000_000;
  const r1 = mergeOrMoveCells(state, 8, 9, t0);
  assert.equal(r1.comboCount, 1);
  const r2 = mergeOrMoveCells(r1.state, 11, 12, t0 + 2000);
  assert.equal(r2.comboCount, 2);
  const r3 = mergeOrMoveCells(r2.state, 22, 23, t0 + 4000);
  assert.equal(r3.comboCount, 3);
  assert.equal(r3.comboBonusCoins, 2);
  assert.equal(r3.state.coins, r2.state.coins + 2);
  const r4 = mergeOrMoveCells(r3.state, 25, 26, t0 + 4000 + 6001);
  assert.equal(r4.comboCount, 1);
  assert.equal(r4.comboBonusCoins, 0);
});

test('mega merge absorbs an adjacent third matching item for a free extra level', () => {
  const state = { ...withItems(emptyBoardState(), { 24: 'qahwa_1', 25: 'qahwa_1', 26: 'qahwa_1' }), activeOrders: [] };
  const res = mergeOrMoveCells(state, 24, 25, 5000);
  assert.equal(res.action, 'MERGED');
  assert.equal(res.megaMerge, true);
  assert.equal(res.mergedItemId, 'qahwa_3');
  assert.equal(res.state.board[24].itemId, null);
  assert.equal(res.state.board[26].itemId, null);
  assert.equal(res.state.board[25].itemId, 'qahwa_3');
});

test('a manual merge does not absorb a reserved third item or skip a needed result', () => {
  const base = withItems(emptyBoardState(), { 24: 'qahwa_1', 25: 'qahwa_1', 26: 'qahwa_1' });
  const order = { ...base.activeOrders[0], requiredItemIds: ['qahwa_1'] };
  const reservedThird = mergeOrMoveCells({ ...base, activeOrders: [order] }, 24, 25, 5000);
  assert.equal(reservedThird.megaMerge, false);
  assert.equal(reservedThird.mergedItemId, 'qahwa_2');
  assert.equal(reservedThird.state.board[26].itemId, 'qahwa_1');
  const needsNext = mergeOrMoveCells({ ...base, activeOrders: [{ ...order, requiredItemIds: ['qahwa_2'] }] }, 24, 25, 5000);
  assert.equal(needsNext.mergedItemId, 'qahwa_2');
  assert.equal(needsNext.state.board[26].itemId, 'qahwa_1');
  const focused = mergeOrMoveCells({ ...base, activeOrders: [] }, 24, 25, 5000, ['qahwa_1']);
  assert.equal(focused.state.board[26].itemId, 'qahwa_1');
  const alreadyReady = withItems({ ...base, activeOrders: [{ ...order, requiredItemIds: ['qahwa_2'] }] }, { 40: 'qahwa_2' });
  assert.equal(mergeOrMoveCells(alreadyReady, 24, 25, 5000).megaMerge, true);
});

test('a non-adjacent third item does not trigger mega merge', () => {
  const state = withItems(emptyBoardState(), { 24: 'qahwa_1', 25: 'qahwa_1', 40: 'qahwa_1' });
  const res = mergeOrMoveCells(state, 24, 25, 5000);
  assert.equal(res.megaMerge, false);
  assert.equal(res.mergedItemId, 'qahwa_2');
  assert.equal(res.state.board[40].itemId, 'qahwa_1');
});

test('crossing an XP threshold grants gems and an energy top-up exactly once', () => {
  let state = withItems(emptyBoardState(), { 24: 'qahwa_5', 25: 'qahwa_5' });
  state = { ...state, xp: 95, level: 1, energy: 3, diamonds: 10 };
  const res = mergeOrMoveCells(state, 24, 25, 9000);
  assert.ok(res.levelUp);
  assert.equal(res.levelUp!.toLevel, res.state.level);
  assert.equal(res.state.diamonds, 10 + res.levelUp!.gems);
  assert.equal(res.state.energy, state.energy + res.levelUp!.energy);
  assert.ok(res.levelUp!.energy < state.maxEnergy, 'a level-up tops energy up, it does not refill it');
  const again = withItems({ ...res.state, board: res.state.board.map((c) => ({ ...c, itemId: null })) }, { 24: 'qahwa_1', 25: 'qahwa_1' });
  const res2 = mergeOrMoveCells(again, 24, 25, 9100);
  assert.equal(res2.levelUp, undefined);
});

test('orders grant every crossed level reward, including VIP bonuses, only on success', () => {
  const base = createInitialGameState();
  const order = { ...base.activeOrders[0], requiredItemIds: ['qahwa_2'], rewardXp: 400, isVip: true };
  const state = { ...base, xp: 95, level: 1, energy: 3, diamonds: 10, activeOrders: [order] };
  const result = fulfillCustomerOrder(state, order.id);
  assert.ok(result.fulfilled);
  assert.deepEqual(result.levelUp, { fromLevel: 1, toLevel: 4, gems: 15, energy: 45 });
  assert.equal(result.state.energy, 48);
  assert.equal(result.state.diamonds, 35, 'level gems and the VIP bonus both apply');
  const again = fulfillCustomerOrder(result.state, order.id);
  assert.equal(again.fulfilled, false);
  assert.equal(again.state.diamonds, 35);
});

test('renovations pay level rewards, but failed upgrades and style changes do not', () => {
  const base = createInitialGameState();
  const state = { ...base, xp: 90, level: 1, energy: 3, diamonds: 10, stars: 10, coins: 1000 };
  const result = upgradeRenovationZone(state, 'zone_sadu');
  assert.ok(result.upgraded);
  assert.deepEqual(result.levelUp, { fromLevel: 1, toLevel: 2, gems: 5, energy: 15 });
  assert.equal(result.state.energy, 18);
  assert.equal(result.state.diamonds, 15);
  const style = upgradeRenovationZone(result.state, 'zone_sadu', 1);
  assert.ok(style.upgraded);
  assert.equal(style.levelUp, undefined);
  assert.equal(style.state.diamonds, 15);
  assert.equal(upgradeRenovationZone({ ...state, stars: 0 }, 'zone_sadu').levelUp, undefined);
});

test('style selection never spends stars or upgrades a wing', () => {
  const base = { ...createInitialGameState(), stars: 50, coins: 1000 };
  const original = base.renovationZones.find(z => z.id === 'zone_sadu')!;
  const same = upgradeRenovationZone(base, original.id, original.selectedStyle);
  assert.equal(same.upgraded, false);
  assert.equal(same.state, base);
  const planned = upgradeRenovationZone(base, original.id, 1);
  assert.equal(planned.state.stars, base.stars);
  assert.equal(planned.state.coins, base.coins);
  assert.equal(planned.state.renovationZones.find(z => z.id === original.id)?.unlockedLevel, 0);
  assert.equal(planned.state.renovationZones.find(z => z.id === original.id)?.selectedStyle, 1);
  const restored = upgradeRenovationZone(planned.state, original.id);
  assert.equal(restored.state.renovationZones.find(z => z.id === original.id)?.selectedStyle, 1);
  const active = upgradeRenovationZone(restored.state, original.id, 1);
  assert.equal(active.upgraded, false);
  assert.equal(active.state, restored.state);
  const invalid = upgradeRenovationZone(restored.state, original.id, 999);
  assert.equal(invalid.upgraded, false);
  assert.equal(invalid.state, restored.state);
  const changed = upgradeRenovationZone(restored.state, original.id, 2);
  assert.equal(changed.state.stars, restored.state.stars);
  assert.equal(changed.state.renovationZones.find(z => z.id === original.id)?.unlockedLevel, 1);
  assert.ok(changed.state.coins < restored.state.coins);
});

test('daily welcome gifts preserve progress across a break and never double-pay', () => {
  const base = createInitialGameState();
  assert.equal(getDailyLoginDay(base, '2026-03-01'), 1);

  const d1 = claimDailyLoginReward(base, '2026-03-01');
  assert.equal(d1.claimed, true);
  assert.equal(d1.state.energy, base.energy + 20);
  assert.equal(claimDailyLoginReward(d1.state, '2026-03-01').claimed, false);

  const d2 = claimDailyLoginReward(d1.state, '2026-03-02');
  assert.equal(d2.day, 2);
  assert.equal(d2.state.coins, d1.state.coins + 100);
  assert.equal(d2.state.loginStreak, 2);

  const afterGap = claimDailyLoginReward(d2.state, '2026-03-05');
  assert.equal(afterGap.day, 3);
  assert.equal(afterGap.state.loginStreak, 3);
  assert.equal(afterGap.state.diamonds, d2.state.diamonds + 10);
  assert.equal(claimDailyLoginReward(afterGap.state, '2026-03-05').claimed, false);

  assert.equal(getDailyLoginDay(d2.state, '2026-03-01'), null);
});

test('an existing six-day save still earns the seventh gift after time away', () => {
  const oldSave = { ...createInitialGameState(), loginStreak: 6, lastLoginDay: '2026-01-10' };
  const reward = claimDailyLoginReward(oldSave, '2026-02-15');
  assert.equal(reward.day, 7);
  assert.equal(reward.state.loginStreak, 7);
  assert.ok(reward.state.board.some(cell => cell.itemId === 'chest_2'));
  assert.equal(getDailyLoginDay(reward.state, '2026-02-16'), 1);
  assert.equal(claimDailyLoginReward(reward.state, '2026-02-14').claimed, false);
});

test('seventh welcome gift drops a Gilded chest and the cycle wraps back to gift 1', () => {
  let state = createInitialGameState();
  for (let i = 1; i <= 7; i++) {
    state = claimDailyLoginReward(state, `2026-03-0${i}`).state;
  }
  assert.equal(state.loginStreak, 7);
  assert.ok(state.board.some((c) => c.itemId === 'chest_2'));
  assert.equal(getDailyLoginDay(state, '2026-03-08'), 1);
  const wrapped = claimDailyLoginReward(state, '2026-03-08');
  assert.equal(wrapped.day, 1);
  assert.equal(wrapped.state.loginStreak, 8);
});

test('day 7 chest opens for its complete contents when the board is full', () => {
  let state = createInitialGameState();
  state = { ...state, board: state.board.map((c) => (c.itemId ? c : { ...c, itemId: 'qahwa_1' })), loginStreak: 6, lastLoginDay: '2026-03-06' };
  const res = claimDailyLoginReward(state, '2026-03-07');
  assert.equal(res.day, 7);
  assert.equal(res.state.coins, state.coins + 180);
  assert.equal(res.state.diamonds, state.diamonds + 30 + 35);
  assert.equal(res.state.energy, state.energy + 65);
  assert.equal(res.state.scissorsCount, state.scissorsCount + 1);
  assert.equal(res.state.jokerCount, state.jokerCount + 1);
  assert.equal(res.state.prestigePoints, state.prestigePoints + 45);
  assert.ok(!res.state.board.some((c) => c.itemId === 'chest_2'));
});

test('tutorial coaches merge first, then serving an order, then stops', () => {
  const s = createInitialGameState();
  assert.equal(getTutorialStep(s), 'merge');
  assert.equal(getTutorialStep({ ...s, totalMerges: 1 }), 'serve');
  assert.equal(getTutorialStep({ ...s, totalMerges: 1, ordersCompleted: 1 }), null);
  assert.equal(getTutorialStep({ ...s, tutorialDismissed: true }), null);
});

test('first-session coaching defers the daily reward without consuming it', () => {
  const initial = createInitialGameState();
  const today = '2026-03-01';
  assert.equal(dailyLoginAfterTutorial(initial, today), null);
  assert.equal(dailyLoginAfterTutorial({ ...initial, totalMerges: 1 }, today), null);
  const completed = { ...initial, totalMerges: 1, ordersCompleted: 1 };
  assert.equal(dailyLoginAfterTutorial(completed, today), 1);
  assert.equal(dailyLoginAfterTutorial({ ...initial, tutorialDismissed: true }, today), 1);
  const claimed = claimDailyLoginReward(completed, today);
  assert.equal(dailyLoginAfterTutorial(claimed.state, today), null);
});

test('Saudi seasons: Founding Day and National Day windows boost order rewards; ordinary days do not', () => {
  assert.equal(getActiveSeason(new Date(2026, 1, 22))?.id, 'founding_day');
  assert.equal(getActiveSeason(new Date(2026, 8, 23))?.id, 'national_day');
  assert.equal(getActiveSeason(new Date(2026, 6, 1)), null);

  const state = createInitialGameState();
  const order = state.activeOrders[0];
  const ready = {
    ...state,
    board: state.board.map((c) => c),
  };
  // put the required items on empty cells so the order can be served
  let board = ready.board.map((c) => ({ ...c, itemId: null as string | null, sandLocked: false }));
  order.requiredItemIds.forEach((id, i) => {
    board = board.map((c) => (c.index === 10 + i ? { ...c, itemId: id } : c));
  });
  const withItems = { ...ready, board };
  const plain = fulfillCustomerOrder(withItems, order.id);
  const festive = fulfillCustomerOrder(withItems, order.id, SEASONS.national_day);
  assert.equal(plain.fulfilled, true);
  assert.ok(festive.state.coins > plain.state.coins);
  assert.equal(
    festive.state.prestigePoints - state.prestigePoints,
    2 * (plain.state.prestigePoints - state.prestigePoints)
  );
});

test('displayed order coins match the awarded base, restoration, area and seasonal bonus', () => {
  const base = createInitialGameState();
  const order = { ...base.activeOrders[0], requiredItemIds: ['qahwa_1'], rewardCoins: 101 };
  const state = { ...base, areaIndex: 2, activeOrders: [order] };
  const payout = orderCoinReward(state, order, SEASONS.national_day);
  assert.equal(payout.base, 101);
  assert.equal(payout.area, 16);
  assert.equal(payout.total, Math.round((payout.base + payout.restoration + payout.area) * 1.5));
  assert.equal(payout.base + payout.restoration + payout.area + payout.seasonal, payout.total);
  const result = fulfillCustomerOrder(state, order.id, SEASONS.national_day);
  assert.ok(result.fulfilled);
  assert.equal(result.state.coins - state.coins, payout.total);
});

test('VIP service grants the advertised gems and a chest on a consumed tile', () => {
  const base = createInitialGameState();
  const order = { ...base.activeOrders[0], isVip: true, requiredItemIds: ['qahwa_1'], rewardXp: 0 };
  const state = { ...base, activeOrders: [order] };
  const used = state.board.find(cell => cell.itemId === 'qahwa_1' && !cell.sandLocked)!;
  const result = fulfillCustomerOrder(state, order.id);
  assert.ok(result.fulfilled && result.spawnedChest);
  assert.equal(result.state.diamonds - state.diamonds, VIP_ORDER_GEMS);
  assert.equal(result.state.board[used.index].itemId, 'chest_1');
  assert.equal(fulfillCustomerOrder(result.state, order.id).fulfilled, false);
});

test('Ramadan is detected through the Hijri calendar when the runtime supports it', () => {
  // 2026-03-01 falls inside Ramadan 1447 (umalqura); skip quietly on runtimes without that calendar
  const supports = (() => {
    try {
      new Intl.DateTimeFormat('en-u-ca-islamic-umalqura').format(new Date());
      return true;
    } catch {
      return false;
    }
  })();
  if (!supports) return;
  assert.equal(getActiveSeason(new Date(2026, 2, 1))?.id, 'ramadan');
});

test('pour grading rewards a quarter-finjan pour and consumes one token', () => {
  assert.equal(gradePour(25), 'perfect');
  assert.equal(gradePour(21), 'perfect');
  assert.equal(gradePour(29), 'perfect');
  assert.equal(gradePour(16), 'good');
  assert.equal(gradePour(10), 'short');
  assert.equal(gradePour(60), 'overflow');

  const base = { ...createInitialGameState(), pourTokens: 1 };
  const res = completePour(base, 26);
  assert.equal(res.grade, 'perfect');
  assert.equal(res.state.pourTokens, 0);
  assert.equal(res.state.diamonds, base.diamonds + POUR_REWARDS.perfect.gems);
  assert.equal(completePour(res.state, 26).poured, false);
});

test('upgrading a renovation wing earns a pour challenge token', () => {
  const state = { ...createInitialGameState(), stars: 99 };
  const zone = state.renovationZones[0];
  const res = upgradeRenovationZone(state, zone.id);
  assert.equal(res.upgraded, true);
  assert.equal(res.state.pourTokens, state.pourTokens + 1);
});

test('ambient oud phrase stays inside the Hijaz scale and resolves to the tonic', async () => {
  const { AMBIENT_PHRASE, HIJAZ_SCALE_HZ } = await import('../utils/soundAndHaptics');
  assert.ok(AMBIENT_PHRASE.every((n) => n === -1 || (n >= 0 && n < HIJAZ_SCALE_HZ.length)));
  const lastNote = [...AMBIENT_PHRASE].reverse().find((n) => n !== -1);
  assert.equal(lastNote, 0);
});

test('voice lines: every character has every event, lines are short Arabic, ids are unique and picking round-robins', async () => {
  const v = await import('./voiceLines');
  const all = v.allVoiceLines();
  const chars = Object.keys(v.VOICE_PROFILES);
  assert.equal(chars.length, 6);
  for (const c of chars) {
    for (const e of ['greet', 'served', 'vip'] as const) {
      assert.ok(v.VOICE_LINES[c as keyof typeof v.VOICE_LINES][e].length >= 1, `${c}.${e} has lines`);
    }
  }
  assert.equal(new Set(all.map((l) => l.id)).size, all.length);
  for (const l of all) {
    assert.match(l.line.ar, /[؀-ۿ]/, `${l.id} is Arabic`);
    assert.ok(l.line.ar.length <= 60, `${l.id} is short enough to speak in about 3 seconds`);
    assert.ok(l.line.en.length > 3, `${l.id} has an English meaning`);
  }
  const a = v.pickVoiceLine('noura', 'served', 0);
  const b = v.pickVoiceLine('noura', 'served', 1);
  assert.notEqual(a.id, b.id);
  assert.equal(v.pickVoiceLine('noura', 'served', 3).id, a.id);
  assert.equal(v.pickVoiceLine('noura', 'served', -1).id, v.voiceLineId('noura', 'served', 2));
  assert.equal(v.voiceFileUrl(a.id), '/assets/audio/voice/noura_served_1.mp3');
});

test('buildMergeParticleBurst scales particle count, shockwave rings, and celebration tier by item level', () => {
  // Cell 24 is center of 7x7 board (row 3, col 3 -> 50%, 50%)
  const standard = buildMergeParticleBurst(24, 'qahwa_2', 1);
  assert.equal(standard.tier, 'standard');
  assert.equal(standard.isHighLevel, false);
  assert.equal(standard.row, 3);
  assert.equal(standard.col, 3);
  assert.ok(Math.abs(standard.xPercent - 50) < 0.01);
  assert.ok(Math.abs(standard.yPercent - 50) < 0.01);
  assert.equal(standard.particles.length, 12);
  assert.equal(standard.ringCount, 1);

  const epic = buildMergeParticleBurst(10, 'barista_3', 2);
  assert.equal(epic.tier, 'epic');
  assert.equal(epic.isHighLevel, true);
  assert.equal(epic.particles.length, 20);
  assert.equal(epic.ringCount, 2);

  const royal = buildMergeParticleBurst(18, 'oud_4', 3);
  assert.equal(royal.tier, 'royal');
  assert.equal(royal.isHighLevel, true);
  assert.equal(royal.particles.length, 28);
  assert.equal(royal.ringCount, 3);

  const masterpiece = buildMergeParticleBurst(30, 'qahwa_6', 4);
  assert.equal(masterpiece.tier, 'masterpiece');
  assert.equal(masterpiece.isHighLevel, true);
  assert.equal(masterpiece.isMaxLevel, true);
  assert.equal(masterpiece.particles.length, 36);
  assert.equal(masterpiece.ringCount, 3);
});


test('spawning and merging reuse unchanged board cell objects (lets the board skip re-rendering them)', () => {
  const s0 = createInitialGameState();
  const gen = s0.board.findIndex((c) => c.itemId === 'gen_qahwa');
  const spawned = spawnFromGenerator({ ...s0, rngSeed: 7 }, gen);
  const changed = spawned.state.board.filter((c, i) => c !== s0.board[i]).length;
  assert.ok(changed >= 1 && changed <= 2, `spawn replaced ${changed} cells`);
  const a = spawned.state.board.findIndex((c) => c.itemId === 'qahwa_1' && !c.sandLocked);
  const b = spawned.state.board.findIndex((c, i) => i !== a && c.itemId === 'qahwa_1' && !c.sandLocked);
  if (a >= 0 && b >= 0) {
    const merged = mergeOrMoveCells(spawned.state, a, b);
    const mChanged = merged.state.board.filter((c, i) => c !== spawned.state.board[i]).length;
    assert.ok(mChanged <= 3, `merge replaced ${mChanged} cells`);
  }
});
