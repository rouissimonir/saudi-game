import { ITEM_CATALOG, type BoardCell, type GameState } from './rules';

const CHAIN_ORDER = ['qahwa', 'barista', 'sweets', 'oud', 'chest'];

/**
 * Groups loose items so matching pieces sit next to each other and the free space gathers at the end.
 * Generators and sand-covered tiles never move; only plain items and empty tiles are rearranged.
 */
export function tidyBoard(state: GameState): { state: GameState; moved: boolean } {
  const isGenerator = (cell: BoardCell) => cell.itemId !== null && Boolean(ITEM_CATALOG[cell.itemId]?.isGenerator);
  const slots = state.board.filter((cell) => !cell.sandLocked && !isGenerator(cell));
  const items = slots.filter((cell) => cell.itemId !== null).map((cell) => cell.itemId as string);
  items.sort((a, b) => {
    const A = ITEM_CATALOG[a];
    const B = ITEM_CATALOG[b];
    const chain = CHAIN_ORDER.indexOf(A.chain) - CHAIN_ORDER.indexOf(B.chain);
    if (chain !== 0) return chain;
    if (A.level !== B.level) return B.level - A.level;
    return a < b ? -1 : a > b ? 1 : 0;
  });
  const next = state.board.slice();
  let moved = false;
  slots.forEach((slot, i) => {
    const itemId = items[i] ?? null;
    if (slot.itemId !== itemId) {
      next[slot.index] = { ...slot, itemId };
      moved = true;
    }
  });
  if (!moved) return { state, moved: false };
  return { state: { ...state, board: next, selectedCellIndex: null }, moved: true };
}
