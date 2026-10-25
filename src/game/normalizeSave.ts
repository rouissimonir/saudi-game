import { GameState, createInitialGameState } from './rules';

/**
 * Turns any stored save (local storage or a transfer code, from this or an older build) into a complete
 * GameState, or null when it is not a save. Fields added after the save was written come from a fresh state.
 */
export function normalizeSave(raw: unknown): GameState | null {
  const parsed = raw as Partial<GameState> | null;
  if (!parsed || !Array.isArray(parsed.board) || parsed.board.length !== 49 || typeof parsed.coins !== 'number') return null;
  const defaults = createInitialGameState();
  const discovered = parsed.discoveredItemIds ?? defaults.discoveredItemIds;
  return {
    ...defaults,
    ...parsed,
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
