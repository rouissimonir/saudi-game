import React from 'react';
import { ITEM_CATALOG, findNearestEmptyCell, type GameState, type Language } from '../game/rules';
import { pantryMergePiece, type OrderNeed } from '../game/orderGuide';

/** Offer a spare pantry piece that can be merged toward a missing ingredient. */
export function PantryMergeHelper({ need, needs, state, lang, onRetrieve }: { need: OrderNeed; needs: OrderNeed[]; state: GameState; lang: Language; onRetrieve: (index: number) => void }) {
  const piece = pantryMergePiece(need, needs, state.inventory);
  if (!piece) return null;
  const ar = lang === 'ar';
  const name = ar ? ITEM_CATALOG[piece.itemId].nameAr : ITEM_CATALOG[piece.itemId].nameEn;
  const full = findNearestEmptyCell(state.board, 24) === null;
  return <div className="mt-1">
    <button type="button" data-testid="return-merge-piece" disabled={full} onClick={() => onRetrieve(piece.inventoryIndex)} className="min-h-11 rounded-lg bg-[#10B981] px-3 py-1 text-xs font-bold text-white disabled:opacity-40">
      {ar ? `أعد ${name} من المؤونة للدمج` : `Return ${name} from pantry to merge`}
    </button>
    {full && <p className="mt-1 text-xs text-[#FDE68A]" role="status">{ar ? 'اللوحة ممتلئة؛ فرّغ خانة أولاً.' : 'The board is full; free a space first.'}</p>}
  </div>;
}
