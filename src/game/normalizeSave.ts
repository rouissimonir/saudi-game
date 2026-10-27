import { GameState, ITEM_CATALOG, LUCKY_WHEEL_WEDGES, createInitialGameState } from './rules';

const record = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const nonnegative = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const knownItem = (value: unknown): value is string => typeof value === 'string' && Object.prototype.hasOwnProperty.call(ITEM_CATALOG, value);
const dayKey = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
const numericFields = (value: unknown, fields: readonly string[]) => record(value) && fields.every(field => nonnegative(value[field]));
const stringFields = (value: Record<string, unknown>, fields: readonly string[]) => fields.every(field => typeof value[field] === 'string');
const validZone = (value: unknown): boolean => {
  if (!record(value) || !stringFields(value, ['id', 'nameAr', 'nameEn', 'descAr', 'descEn'])) return false;
  if (!Number.isInteger(value.unlockedLevel) || (value.unlockedLevel as number) < 0 || (value.unlockedLevel as number) > 2 || !Number.isInteger(value.storyChapterIndex)) return false;
  if (!numericFields(value, ['starCostLevel1', 'starCostLevel2', 'coinBonusPerOrder'])) return false;
  if (!Array.isArray(value.styles) || value.styles.length === 0 || !value.styles.every(style => record(style) && stringFields(style, ['nameAr', 'nameEn', 'swatch']))) return false;
  return Number.isInteger(value.selectedStyle) && (value.selectedStyle as number) >= 0 && (value.selectedStyle as number) < value.styles.length;
};

/**
 * Turns any stored save (local storage or a transfer code, from this or an older build) into a complete
 * GameState, or null when it is not a save. Fields added after the save was written come from a fresh state.
 */
export function normalizeSave(raw: unknown): GameState | null {
  const parsed = raw as Partial<GameState> | null;
  if (!parsed || !Array.isArray(parsed.board) || parsed.board.length !== 49 || !Number.isFinite(parsed.coins)) return null;
  // Do not accept a syntactically valid but unusable board as a recoverable save.
  if (!parsed.board.every((cell, index) => cell && cell.index === index && cell.row === Math.floor(index / 7) && cell.col === index % 7 && (cell.itemId === null || knownItem(cell.itemId)) && typeof cell.sandLocked === 'boolean')) return null;
  if (parsed.activeOrders !== undefined && (!Array.isArray(parsed.activeOrders) || !parsed.activeOrders.every(order => order && typeof order.id === 'string' && Array.isArray(order.requiredItemIds) && order.requiredItemIds.every(knownItem)))) return null;
  if (parsed.discoveredItemIds !== undefined && (!Array.isArray(parsed.discoveredItemIds) || !parsed.discoveredItemIds.every(id => typeof id === 'string'))) return null;
  for (const list of [parsed.inventory, parsed.claimedDiscoveryIds, parsed.seenScenes, parsed.completedStoryIds]) {
    if (list !== undefined && (!Array.isArray(list) || !list.every(id => typeof id === 'string'))) return null;
  }
  if (parsed.inventory !== undefined && !parsed.inventory.every(knownItem)) return null;
  if (parsed.storyFlags !== undefined && (!parsed.storyFlags || typeof parsed.storyFlags !== 'object' || Array.isArray(parsed.storyFlags) || !Object.values(parsed.storyFlags).every(value => typeof value === 'string'))) return null;
  if (parsed.renovationZones !== undefined && (!Array.isArray(parsed.renovationZones) || parsed.renovationZones.length === 0 || !parsed.renovationZones.every(validZone))) return null;
  if (parsed.generatorLevels !== undefined && (!record(parsed.generatorLevels) || Object.values(parsed.generatorLevels).some(level => !Number.isInteger(level) || (level as number) < 1 || (level as number) > 5))) return null;
  const quest = parsed.dailyQuests;
  if (quest != null && (!record(quest) || !dayKey(quest.dayKey) || !numericFields(quest.baseline, ['merge', 'spawn', 'order', 'renovate']) || !Array.isArray(quest.claimed) || !quest.claimed.every(id => typeof id === 'string') || typeof quest.bonusClaimed !== 'boolean')) return null;
  const event = parsed.liveEvent;
  if (event != null && (!record(event) || typeof event.instanceId !== 'string' || !/^[a-zA-Z0-9_-]+@-?\d+$/.test(event.instanceId) || !nonnegative(event.points) || !Array.isArray(event.claimed) || !event.claimed.every(index => Number.isSafeInteger(index) && index >= 0))) return null;
  if (parsed.questDelivery != null && !numericFields(parsed.questDelivery, ['quests', 'bonuses', 'chests', 'openedChests', 'coins', 'gems', 'energy', 'scissors', 'joker', 'prestige'])) return null;
  if (parsed.festivalDelivery != null && !numericFields(parsed.festivalDelivery, ['milestones', 'coins', 'gems', 'energy', 'scissors', 'joker'])) return null;
  const defaults = createInitialGameState();
  const discovered = parsed.discoveredItemIds ?? defaults.discoveredItemIds;
  const prize = parsed.lastWheelPrize;
  const validPrize = record(prize) && typeof prize.wedgeId === 'string' && typeof prize.openedChest === 'boolean' && LUCKY_WHEEL_WEDGES.some(wedge => wedge.id === prize.wedgeId && (!prize.openedChest || wedge.rewardType === 'chest'));
  return {
    ...defaults,
    ...parsed,
    lastWheelPrize: validPrize ? { wedgeId: prize.wedgeId as string, openedChest: prize.openedChest as boolean } : null,
    discoveredItemIds: discovered,
    generatorLevels: { ...defaults.generatorLevels, ...parsed.generatorLevels },
    tutorialDismissed: parsed.tutorialDismissed ?? (parsed.totalMerges ?? 0) > 0,
    // Saves from before the collection book: everything already found counts as claimed (no retroactive windfall).
    claimedDiscoveryIds: parsed.claimedDiscoveryIds ?? [...discovered],
    // Players from before the story scenes keep playing where they were instead of being sent through the prologue.
    seenScenes: parsed.seenScenes ?? ['prologue'],
    storyFlags: { ...parsed.storyFlags },
    selectedCellIndex: null,
  };
}
