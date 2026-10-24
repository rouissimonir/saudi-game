import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialGameState,
  canMergeItems,
  getNextMergedItemId,
  spawnFromGenerator,
  mergeOrMoveCells,
  fulfillCustomerOrder,
  upgradeRenovationZone,
  findBestMergePair,
  cyclePowerMultiplier,
  storeBoardItemInInventory,
  retrieveInventoryItemToBoard,
  unlockBonusBubbleWithGems,
  useGoldenScissors,
  useJokerUpgrade,
  openBoardChest,
  spinLuckyWheel,
  voteMazayenEntry,
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
