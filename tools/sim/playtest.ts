/**
 * Economy playtest: a greedy "reasonable player" bot plays through the real rules and reports how long
 * each renovation area takes, how often energy runs out and where coins go.
 *   npx tsx tools/sim/playtest.ts [areas=4] [runs=3] [--rewards] [--adaptive-boost]
 * --rewards models a player who claims daily gifts, quests, festival milestones, discoveries,
 * story rewards and a good pour. --adaptive-boost selects a generator power based on the lowest
 * missing item in its chain. The bot does not spend gems, use tools, spin the wheel or model
 * real session breaks. Both modes are continuous bot scenarios, not predictions of human play.
 */
import * as R from '../../src/game/rules';
import * as P from '../../src/game/progression';
import * as E from '../../src/game/events';

const TAP_MS = 1500; // a deliberate player: about one action every 1.5 s

function play(seed: number, areas: number, collectRewards: boolean, adaptiveBoost: boolean) {
  const start = new Date(2026, 0, 1, 12).getTime();
  let s: R.GameState = { ...R.createInitialGameState(), rngSeed: seed, lastEnergyTick: start };
  let now = start, active = 0, waited = 0, energyOuts = 0, sells = 0, stuckBoard = 0;
  let rnd = seed;
  const roll = () => (rnd = (Math.imul(rnd, 1664525) + 1013904223) >>> 0) / 4294967296;
  const perArea: { minutes: number; activeMin: number; waitMin: number; outs: number; level: number; coinsSpent: number; orders: number; merges: number; spawns: number }[] = [];
  let areaStart = { now: start, active: 0, waited: 0, outs: 0, orders: s.ordersCompleted, merges: s.totalMerges, spawns: s.totalSpawns };
  let coinsSpent = 0;
  const tap = () => { now += TAP_MS; active += TAP_MS; s = P.applyEnergyRegen(s, now); };
  for (let step = 0; step < 400000 && perArea.length < areas; step++) {
    if (collectRewards) {
      const day = R.dayKeyFromDate(new Date(now));
      s = P.ensureDailyQuests(s, day);
      s = R.claimDailyLoginReward(s, day).state;
      s = P.claimShopGift(s, day).state;
      for (const row of P.questProgress(s)) if (row.done && !row.claimed) s = P.claimQuest(s, row.quest.id).state;
      s = P.claimQuestBonus(s).state;
      for (const i of E.claimableMilestones(s, now)) s = E.claimEventMilestone(s, now, i).state;
      for (const id of P.unclaimedDiscoveries(s)) s = P.claimDiscovery(s, id).state;
      if (s.pourTokens > 0) s = R.completePour(s, 31).state; // good, not perfect
      if (s.activeStoryId) {
        const chapter = P.findStoryChapter(s.activeStoryId);
        const id = s.activeStoryId;
        if (chapter && !s.completedStoryIds.includes(id)) s = { ...s, completedStoryIds: [...s.completedStoryIds, id], diamonds: s.diamonds + chapter.rewardDiamonds, energy: s.energy + chapter.rewardEnergy };
        s = { ...s, activeStoryId: null };
      }
    }
    // area finished?
    if (P.isAreaComplete(s)) {
      perArea.push({ minutes: (now - areaStart.now) / 60000, activeMin: (active - areaStart.active) / 60000, waitMin: (waited - areaStart.waited) / 60000, outs: energyOuts - areaStart.outs, level: s.level, coinsSpent, orders: s.ordersCompleted - areaStart.orders, merges: s.totalMerges - areaStart.merges, spawns: s.totalSpawns - areaStart.spawns });
      s = P.advanceArea(s).state;
      if (!collectRewards) s = { ...s, activeStoryId: null };
      areaStart = { now, active, waited, outs: energyOuts, orders: s.ordersCompleted, merges: s.totalMerges, spawns: s.totalSpawns }; coinsSpent = 0;
      continue;
    }
    let did = false;
    for (const z of s.renovationZones) { const r = R.upgradeRenovationZone(s, z.id); if (r.upgraded) { s = collectRewards ? r.state : { ...r.state, activeStoryId: null }; did = true; break; } }
    if (did) { tap(); continue; }
    for (const o of s.activeOrders) { const r = R.fulfillCustomerOrder(s, o.id); if (r.fulfilled) { s = collectRewards ? E.addEventPoints(r.state, now, E.EVENT_ORDER_POINTS) : r.state; did = true; break; } }
    if (did) { tap(); continue; }
    const chest = s.board.find((c) => c.itemId && R.ITEM_CATALOG[c.itemId].isChest && !c.sandLocked);
    if (chest) { s = R.openBoardChest(s, chest.index).state; tap(); continue; }
    // spend coins on the generator the orders need most
    const needChains = s.activeOrders.flatMap((o) => o.requiredItemIds.map((i) => R.ITEM_CATALOG[i].chain)) as R.ChainId[];
    for (const ch of new Set(needChains)) {
      const cost = P.generatorUpgradeCost(s.generatorLevels[ch]);
      if (cost !== null && s.coins >= cost + 200) { const u = P.upgradeGenerator(s, ch); if (u.upgraded) { s = u.state; coinsSpent += cost; did = true; break; } }
    }
    if (did) { tap(); continue; }
    // merge, but never merge away an item an order needs
    const needed = new Set(s.activeOrders.flatMap((o) => o.requiredItemIds));
    let pair: [number, number] | null = null;
    const cells = s.board.filter((c) => c.itemId && !R.ITEM_CATALOG[c.itemId].isGenerator && !R.ITEM_CATALOG[c.itemId].isChest);
    outer: for (let i = 0; i < cells.length; i++) for (let j = i + 1; j < cells.length; j++) {
      const a = cells[i], b = cells[j];
      if (a.itemId !== b.itemId || (a.sandLocked && b.sandLocked)) continue;
      // keep only as many copies as the orders ask for; merge the surplus upwards
      const want = s.activeOrders.reduce((n, o) => n + o.requiredItemIds.filter((x) => x === a.itemId).length, 0);
      const have = s.board.filter((c) => c.itemId === a.itemId && !c.sandLocked).length;
      if (want > 0 && have - want < 2) continue;
      const from = a.sandLocked ? b : a, to = a.sandLocked ? a : b;
      if (R.canMergeItems(from.itemId, to.itemId)) { pair = [from.index, to.index]; break outer; }
    }
    if (pair) { const r = R.mergeOrMoveCells(s, pair[0], pair[1], now); if (r.action === 'MERGED') { s = r.state; if (collectRewards && r.mergedItemId) { const def = R.ITEM_CATALOG[r.mergedItemId]; s = E.addEventPoints(s, now, E.mergeEventPoints(def.chain, def.level, E.activeLiveEvent(now).def.featuredChain)); } tap(); continue; } }
    // spawn from a needed chain
    const day = R.dayKeyFromDate(new Date(now));
    if (s.energy <= 0 && s.coins >= P.coinEnergyPrice(s, day) + 300) { coinsSpent += P.coinEnergyPrice(s, day); s = P.buyEnergyWithCoins(s, day).state; tap(); continue; }
    if (s.energy <= 0) {
      energyOuts += 1;
      const wait = P.msUntilNextEnergy(s, now) ?? P.ENERGY_REGEN_MS;
      now += wait; waited += wait; s = P.applyEnergyRegen(s, now);
      continue;
    }
    const chain = needChains.length ? needChains[Math.floor(roll() * needChains.length)] : 'qahwa';
    const g = s.board.find((c) => c.itemId && R.ITEM_CATALOG[c.itemId].spawnsChain === chain)!;
    if (adaptiveBoost) {
      const missing = s.activeOrders.flatMap(order => order.requiredItemIds)
        .filter(id => R.ITEM_CATALOG[id].chain === chain && !s.board.some(cell => !cell.sandLocked && cell.itemId === id));
      const level = Math.min(...missing.map(id => R.ITEM_CATALOG[id].level), 3);
      s = { ...s, powerMultiplier: level <= 1 ? 1 : level === 2 ? 2 : 4 };
    }
    const sp = R.spawnFromGenerator(s, g.index, roll(), now);
    if (sp.spawnedCellIndex === null) {
      // board full: sell the lowest item no order needs; if impossible, buy a sand tile
      const loose = s.board.filter((c) => c.itemId && !c.sandLocked && !R.ITEM_CATALOG[c.itemId].isGenerator && !needed.has(c.itemId))
        .sort((a, b) => R.ITEM_CATALOG[a.itemId!].level - R.ITEM_CATALOG[b.itemId!].level)[0];
      if (loose) { s = R.sellBoardItem(s, loose.index); sells++; tap(); continue; }
      stuckBoard++;
      if (process.env.DEBUG) { console.log('STUCK board:', s.board.map((c) => (c.itemId ? (c.sandLocked ? '#' : '') + c.itemId : '.')).join(' '), '\nneeded:', [...needed].join(','), 'energy', s.energy); }
      break;
    }
    s = sp.state; tap();
  }
  return { perArea, sells, stuckBoard };
}

const areas = Number(process.argv[2] ?? 4), runs = Number(process.argv[3] ?? 3);
const collectRewards = process.argv.includes('--rewards');
const adaptiveBoost = process.argv.includes('--adaptive-boost');
const results = Array.from({ length: runs }, (_, i) => play(1000 + i, areas, collectRewards, adaptiveBoost));
console.log(`Scenario: ${collectRewards ? 'claims available rewards' : 'no optional reward claims'}; ${adaptiveBoost ? 'adaptive generator boost' : 'generator boost fixed at ×1'}; no gem spending, tools or breaks.`);
for (let a = 0; a < areas; a++) {
  const rows = results.map((r) => r.perArea[a]).filter(Boolean);
  if (!rows.length) { console.log(`area ${a}: not reached`); continue; }
  const avg = (k: keyof typeof rows[0]) => (rows.reduce((x, r) => x + (r[k] as number), 0) / rows.length);
  const range = rows.map(r => r.minutes).sort((x, y) => x - y);
  console.log(`area ${a} (${P.areaInfo(a).nameEn}, reached ${rows.length}/${runs}): mean ${avg('minutes').toFixed(0)} min (range ${range[0].toFixed(0)}–${range[range.length - 1].toFixed(0)}) = active ${avg('activeMin').toFixed(0)} + waiting ${avg('waitMin').toFixed(0)} | orders ${avg('orders').toFixed(1)} | merges ${avg('merges').toFixed(1)} | spawns ${avg('spawns').toFixed(1)} | energy ran out ${avg('outs').toFixed(0)}x | level ${avg('level').toFixed(0)} | coins spent ${avg('coinsSpent').toFixed(0)}`);
}
console.log('board-full sells', results.map((r) => r.sells).join(','), '| stuck', results.map((r) => r.stuckBoard).join(','));
