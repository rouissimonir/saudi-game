import { ITEM_CATALOG, sellBoardItem, type BoardCell, type GameState } from './rules';

/** An in-memory receipt: the sold cell's identity prevents replay after that cell changes. */
export type SaleReceipt = { index: number; itemId: string; value: number; boardAfterSale: BoardCell[] };

export function sellWithReceipt(state: GameState, index: number): { state: GameState; receipt: SaleReceipt } | null {
  const cell = state.board[index];
  const itemId = cell?.itemId;
  if (!itemId) return null;
  const sold = sellBoardItem(state, index);
  if (sold === state) return null;
  return { state: sold, receipt: { index, itemId, value: ITEM_CATALOG[itemId].sellValue, boardAfterSale: sold.board } };
}

export function canUndoSale(state: GameState, receipt: SaleReceipt): boolean {
  return state.coins >= receipt.value &&
    state.board[receipt.index] === receipt.boardAfterSale[receipt.index] &&
    state.board[receipt.index]?.itemId === null && !state.board[receipt.index]?.sandLocked;
}

export function undoSale(state: GameState, receipt: SaleReceipt): GameState {
  if (!canUndoSale(state, receipt)) return state;
  return {
    ...state,
    board: state.board.map((cell, index) => index === receipt.index ? { ...cell, itemId: receipt.itemId } : cell),
    coins: state.coins - receipt.value,
    selectedCellIndex: receipt.index,
  };
}
