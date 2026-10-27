import { CHAIN_PROGRESSION, ITEM_CATALOG, autoMergeReservations, getNextMergedItemId, type BoardCell, type CustomerOrder, type GameState, type Language } from './rules';

export type OrderNeed = { itemId: string; location: 'board' | 'pantry' | 'missing'; generatorId: string | null; boardIndex?: number; inventoryIndex?: number };

/** Explain a concrete next step without assuming a lucky generator drop or consuming items. */
export function ingredientInstruction(need: OrderNeed, lang: Language, powerMultiplier: number, needs: readonly OrderNeed[] = []): string {
  const ar = lang === 'ar';
  if (need.location === 'board') return ar ? '✓ جاهز على اللوحة' : '✓ Ready on the board';
  if (need.location === 'pantry') return ar ? 'في المؤونة — أعده إلى اللوحة' : 'In the pantry — return it to the board';
  const item = ITEM_CATALOG[need.itemId];
  const generator = need.generatorId ? ITEM_CATALOG[need.generatorId] : undefined;
  if (!item || item.isGenerator || item.chain === 'generator') return ar ? 'راجع دليل السلاسل للعثور عليه' : 'See the chain guide to find it';
  const chain = CHAIN_PROGRESSION[item.chain];
  const index = chain.indexOf(item.id);
  if (index > 0) {
    const previous = ITEM_CATALOG[chain[index - 1]];
    const otherIngredients = new Map<string, number>();
    for (const other of needs) {
      const def = ITEM_CATALOG[other.itemId];
      if (def && def.chain === item.chain && def.level < item.level) otherIngredients.set(def.id, (otherIngredients.get(def.id) ?? 0) + 1);
    }
    const keep = [...otherIngredients].map(([id, count]) => `${count} × ${ar ? ITEM_CATALOG[id].nameAr : ITEM_CATALOG[id].nameEn}`).join(ar ? '، ' : ', ');
    const reminder = keep ? (ar ? ` تحتاج الوصفة أيضًا إلى ${keep}؛ احتفظ بها للتحضير.` : ` Also needed for this recipe: ${keep}. Keep them for the preparation.`) : '';
    const directBoost = index === 1 && powerMultiplier >= 2 ? 2 : index === 2 && powerMultiplier >= 4 ? 4 : null;
    const direct = directBoost && generator
      ? (ar ? ` أو اضبط المضاعف على ×${directBoost} وانقر على ${generator.nameAr}؛ المستوى الأساسي يطابق المطلوب عند توفر الطاقة، وقد تحصل على مستوى أعلى.` : ` Or set the boost to ×${directBoost} and tap ${generator.nameEn}; its base drop matches when enough energy is available, and a lucky drop can be higher.`)
      : '';
    return (ar ? `ادمج قطعتين من ${previous.nameAr} للحصول عليه.` : `Merge two ${previous.nameEn} to make this.`) + direct + reminder;
  }
  if (index === 0 && generator) {
    const boost = powerMultiplier !== 1 ? (ar ? 'غيّر مضاعف الطاقة إلى ×1، ثم ' : 'Set the power boost to ×1, then ') : '';
    return ar ? `${boost}انقر على ${generator.nameAr} لإنتاج عناصر من هذه السلسلة.` : `${boost}${boost ? 'tap' : 'Tap'} ${generator.nameEn} to produce items from this chain.`;
  }
  return ar ? 'راجع دليل السلاسل للعثور عليه' : 'See the chain guide to find it';
}

/** Allocate each physical item at most once, just like serving an order does. */
export function ingredientNeeds(itemIds: readonly string[], board: BoardCell[], inventory: string[]): OrderNeed[] {
  const usedBoard = new Set<number>();
  const usedInventory = new Set<number>();
  return itemIds.map<OrderNeed>(itemId => {
    const boardCell = board.find(cell => !cell.sandLocked && cell.itemId === itemId && !usedBoard.has(cell.index));
    const inventoryIndex = boardCell ? -1 : inventory.findIndex((id, i) => id === itemId && !usedInventory.has(i));
    if (boardCell) usedBoard.add(boardCell.index);
    else if (inventoryIndex >= 0) usedInventory.add(inventoryIndex);
    const def = ITEM_CATALOG[itemId];
    const generator = def && Object.values(ITEM_CATALOG).find(item => item.isGenerator && item.spawnsChain === def.chain);
    return { itemId, location: boardCell ? 'board' : inventoryIndex >= 0 ? 'pantry' : 'missing', generatorId: generator?.id ?? null, ...(boardCell ? { boardIndex: boardCell.index } : {}), ...(inventoryIndex >= 0 ? { inventoryIndex } : {}) };
  });
}

export function orderNeeds(order: CustomerOrder, board: BoardCell[], inventory: string[]): OrderNeed[] {
  return ingredientNeeds(order.requiredItemIds, board, inventory);
}

/** A first-session suggestion that creates a missing guest item without using reserved pieces. */
export function tutorialMergePair(state: GameState): { indices: [number, number]; itemId: string } | null {
  const reserved = autoMergeReservations(state.activeOrders, [], state.inventory);
  for (const order of state.activeOrders) {
    for (const need of orderNeeds(order, state.board, state.inventory)) {
      if (need.location !== 'missing') continue;
      const target = ITEM_CATALOG[need.itemId];
      if (!target || target.chain === 'generator') continue;
      const chain = CHAIN_PROGRESSION[target.chain];
      const tier = chain.indexOf(target.id);
      if (tier <= 0) continue;
      const previous = chain[tier - 1];
      if (getNextMergedItemId(previous) !== target.id) continue;
      const cells = state.board.filter(cell => !cell.sandLocked && cell.itemId === previous);
      if (cells.length >= 2 + (reserved[previous] ?? 0)) return { indices: [cells[0].index, cells[1].index], itemId: previous };
    }
  }
  return null;
}

/** Find a spare preceding-tier piece without borrowing an ingredient already needed by the recipe. */
export function pantryMergePiece(need: OrderNeed, needs: OrderNeed[], inventory: string[]): { itemId: string; inventoryIndex: number } | null {
  if (need.location !== 'missing') return null;
  const target = ITEM_CATALOG[need.itemId];
  if (!target || target.isGenerator || target.chain === 'generator') return null;
  const chain = CHAIN_PROGRESSION[target.chain];
  const tier = chain.indexOf(target.id);
  if (tier <= 0) return null;
  const previousId = chain[tier - 1];
  const reserved = new Set(needs.flatMap(n => n.inventoryIndex === undefined ? [] : [n.inventoryIndex]));
  const inventoryIndex = inventory.findIndex((id, index) => id === previousId && !reserved.has(index));
  return inventoryIndex < 0 ? null : { itemId: previousId, inventoryIndex };
}

/** Highlight usable lower-level pieces and sources only for items still missing from the board and pantry. */
export function focusCells(needs: OrderNeed[], board: BoardCell[]): Set<number> {
  const missing = needs.filter(need => need.location === 'missing').map(need => ITEM_CATALOG[need.itemId]).filter(Boolean);
  const reserved = new Set(needs.flatMap(need => need.boardIndex === undefined ? [] : [need.boardIndex]));
  return new Set(board.filter(cell => {
    if (cell.sandLocked || !cell.itemId || reserved.has(cell.index)) return false;
    const def = ITEM_CATALOG[cell.itemId];
    return Boolean(def && missing.some(target => def.isGenerator ? def.spawnsChain === target.chain : def.chain === target.chain && def.level < target.level));
  }).map(cell => cell.index));
}

/** Restore only an order that is still present; old or completed IDs never become active. */
export function focusedGuestOrder(state: GameState): CustomerOrder | null {
  const id = state.storyFlags?.focused_guest_order;
  return state.activeOrders.find(order => order.id === id) ?? null;
}

export function setFocusedGuestOrder(state: GameState, id: string | null): GameState {
  if (id && !state.activeOrders.some(order => order.id === id)) return state;
  const flags = { ...state.storyFlags };
  if (id) flags.focused_guest_order = id;
  else delete flags.focused_guest_order;
  return { ...state, storyFlags: flags };
}
