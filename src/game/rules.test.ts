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
  getDailyLoginDay,
  claimDailyLoginReward,
  getTutorialStep,
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

function emptyBoardState() {
  const state = createInitialGameState();
  return {
    ...state,
    board: state.board.map((c) => ({ ...c, itemId: null, sandLocked: false })),
  };
}

function withItems(state: ReturnType<typeof emptyBoardState>, items: Record<number, string>) {
  return { ...state, board: state.board.map((c) => (items[c.index] ? { ...c, itemId: items[c.index] } : c)) };
}

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
  const state = withItems(emptyBoardState(), { 24: 'qahwa_1', 25: 'qahwa_1', 26: 'qahwa_1' });
  const res = mergeOrMoveCells(state, 24, 25, 5000);
  assert.equal(res.action, 'MERGED');
  assert.equal(res.megaMerge, true);
  assert.equal(res.mergedItemId, 'qahwa_3');
  assert.equal(res.state.board[24].itemId, null);
  assert.equal(res.state.board[26].itemId, null);
  assert.equal(res.state.board[25].itemId, 'qahwa_3');
});

test('a non-adjacent third item does not trigger mega merge', () => {
  const state = withItems(emptyBoardState(), { 24: 'qahwa_1', 25: 'qahwa_1', 40: 'qahwa_1' });
  const res = mergeOrMoveCells(state, 24, 25, 5000);
  assert.equal(res.megaMerge, false);
  assert.equal(res.mergedItemId, 'qahwa_2');
  assert.equal(res.state.board[40].itemId, 'qahwa_1');
});

test('crossing an XP threshold grants gems and refills energy exactly once', () => {
  let state = withItems(emptyBoardState(), { 24: 'qahwa_5', 25: 'qahwa_5' });
  state = { ...state, xp: 95, level: 1, energy: 3, diamonds: 10 };
  const res = mergeOrMoveCells(state, 24, 25, 9000);
  assert.ok(res.levelUp);
  assert.equal(res.levelUp!.toLevel, res.state.level);
  assert.equal(res.state.diamonds, 10 + res.levelUp!.gems);
  assert.equal(res.state.energy, state.maxEnergy);
  const again = withItems({ ...res.state, board: res.state.board.map((c) => ({ ...c, itemId: null })) }, { 24: 'qahwa_1', 25: 'qahwa_1' });
  const res2 = mergeOrMoveCells(again, 24, 25, 9100);
  assert.equal(res2.levelUp, undefined);
});

test('daily login streak: first claim, consecutive days, reset after a gap, never double-pays', () => {
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
  assert.equal(afterGap.day, 1);
  assert.equal(afterGap.state.loginStreak, 1);

  assert.equal(getDailyLoginDay(d2.state, '2026-03-01'), null);
});

test('daily login day 7 drops a Gilded chest and the cycle wraps back to day 1', () => {
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

test('day 7 chest converts to coins when the board is full', () => {
  let state = createInitialGameState();
  state = { ...state, board: state.board.map((c) => (c.itemId ? c : { ...c, itemId: 'qahwa_1' })), loginStreak: 6, lastLoginDay: '2026-03-06' };
  const res = claimDailyLoginReward(state, '2026-03-07');
  assert.equal(res.day, 7);
  assert.equal(res.state.coins, state.coins + 180);
  assert.ok(!res.state.board.some((c) => c.itemId === 'chest_2'));
});

test('tutorial coaches merge first, then serving an order, then stops', () => {
  const s = createInitialGameState();
  assert.equal(getTutorialStep(s), 'merge');
  assert.equal(getTutorialStep({ ...s, totalMerges: 1 }), 'serve');
  assert.equal(getTutorialStep({ ...s, totalMerges: 1, ordersCompleted: 1 }), null);
  assert.equal(getTutorialStep({ ...s, tutorialDismissed: true }), null);
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

