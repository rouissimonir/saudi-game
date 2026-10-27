import React from 'react';
import { findNearestEmptyCell, ITEM_CATALOG, type GameState, type Language } from '../game/rules';
import type { OrderNeed } from '../game/orderGuide';

/** Return the allocated pantry item, or explain why the board needs space first. */
export function ReturnPantryItem({ need, state, lang, onRetrieve }: { need: OrderNeed; state: GameState; lang: Language; onRetrieve: (index: number) => void }) {
  if (need.location !== 'pantry' || need.inventoryIndex === undefined) return null;
  const ar = lang === 'ar';
  const full = findNearestEmptyCell(state.board, 24) === null;
  const item = ITEM_CATALOG[need.itemId];
  const name = ar ? item?.nameAr : item?.nameEn;
  return <div className="mt-1">
    <button type="button" data-testid="return-pantry-item" onClick={() => onRetrieve(need.inventoryIndex!)} disabled={full} aria-label={ar ? `أعد ${name} إلى اللوحة` : `Return ${name} to the board`} className="min-h-11 rounded-lg bg-[#10B981] px-3 py-1 text-xs font-bold text-white disabled:opacity-40">
      {ar ? 'أعده للوحة' : 'Return to board'}
    </button>
    {full && <p className="mt-1 text-xs text-[#FDE68A]" role="status">{ar ? 'اللوحة ممتلئة؛ فرّغ خانة أولاً.' : 'The board is full; free a space first.'}</p>}
  </div>;
}
