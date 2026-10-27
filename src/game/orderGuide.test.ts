import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState } from './rules';
import { focusCells, ingredientInstruction, ingredientNeeds, orderNeeds, pantryMergePiece, tutorialMergePair } from './orderGuide';
import { TASTING_TRAYS } from './tasting';

test('order guide allocates duplicate items once and distinguishes pantry and locked tiles', () => {
  const state = createInitialGameState();
  const order = { ...state.activeOrders[0], requiredItemIds: ['qahwa_2', 'qahwa_2', 'qahwa_2'] };
  state.board = state.board.map((c, i) => ({ ...c, itemId: i === 0 || i === 1 ? 'qahwa_2' : i === 2 ? 'qahwa_1' : i === 3 ? 'gen_qahwa' : null, sandLocked: i === 1 }));
  const needs = orderNeeds(order, state.board, ['qahwa_2']);
  assert.deepEqual(needs.map(n => n.location), ['board', 'pantry', 'missing']);
  assert.deepEqual(needs.map(n => n.inventoryIndex), [undefined, 0, undefined]);
  assert.deepEqual([...focusCells(needs, state.board)], [2, 3]);
});

test('first-session suggestion points to a useful pair without using needed or locked items', () => {
  const state = createInitialGameState();
  assert.deepEqual(tutorialMergePair(state), { indices: [17, 18], itemId: 'sweets_1' });
  const order = { ...state.activeOrders[0], requiredItemIds: ['sweets_1', 'sweets_2'] };
  const limited = { ...state, activeOrders: [order] };
  assert.equal(tutorialMergePair(limited), null);
  limited.board = limited.board.map((cell, i) => i === 19 ? { ...cell, itemId: 'sweets_1' } : cell);
  assert.deepEqual(tutorialMergePair(limited), { indices: [17, 18], itemId: 'sweets_1' });
  limited.board = limited.board.map((cell, i) => i === 18 ? { ...cell, sandLocked: true } : cell);
  assert.equal(tutorialMergePair(limited), null);
});

test('duplicate pantry ingredients point to distinct slots and update after retrieval', () => {
  const state = createInitialGameState();
  state.board = state.board.map(cell => ({ ...cell, itemId: null, sandLocked: false }));
  const needs = ingredientNeeds(['qahwa_2', 'qahwa_2', 'qahwa_2'], state.board, ['sweets_1', 'qahwa_2', 'qahwa_2']);
  assert.deepEqual(needs.map(n => n.inventoryIndex), [1, 2, undefined]);
  state.board[0].itemId = 'qahwa_2';
  const remaining = ingredientNeeds(['qahwa_2', 'qahwa_2', 'qahwa_2'], state.board, ['sweets_1', 'qahwa_2']);
  assert.deepEqual(remaining.map(n => n.location), ['board', 'pantry', 'missing']);
  assert.equal(remaining[1].inventoryIndex, 1);
});

test('merge guidance suggests spare pantry pieces without consuming ingredients reserved for the recipe', () => {
  const state = createInitialGameState();
  state.board = state.board.map(cell => ({ ...cell, itemId: null, sandLocked: false }));
  const inventory = ['qahwa_1', 'sweets_1', 'qahwa_1'];
  const needs = ingredientNeeds(['qahwa_1', 'qahwa_2'], state.board, inventory);
  assert.equal(needs[0].inventoryIndex, 0);
  assert.deepEqual(pantryMergePiece(needs[1], needs, inventory), { itemId: 'qahwa_1', inventoryIndex: 2 });
  assert.equal(pantryMergePiece(needs[0], needs, inventory), null);
  const withoutSpare = ingredientNeeds(['qahwa_1', 'qahwa_2'], state.board, ['qahwa_1']);
  assert.equal(pantryMergePiece(withoutSpare[1], withoutSpare, ['qahwa_1']), null);
  const base = ingredientNeeds(['qahwa_1'], state.board, []);
  assert.equal(pantryMergePiece(base[0], base, []), null);
});

test('focus keeps required lower-tier pieces separate from spare pieces for a merge', () => {
  const state = createInitialGameState();
  state.board = state.board.map((cell, i) => ({ ...cell, itemId: i < 3 ? 'qahwa_1' : i === 3 ? 'gen_qahwa' : null, sandLocked: false }));
  const needs = ingredientNeeds(['qahwa_1', 'qahwa_1', 'qahwa_2'], state.board, []);
  assert.deepEqual(needs.map(need => need.boardIndex), [0, 1, undefined]);
  assert.deepEqual([...focusCells(needs, state.board)], [2, 3]);
  assert.match(ingredientInstruction(needs[2], 'en', 1, needs), /Also needed for this recipe: 2 ×/);
  assert.match(ingredientInstruction(needs[2], 'ar', 1, needs), /تحتاج الوصفة أيضًا إلى 2 ×/);
  state.board[0].itemId = null;
  const updated = ingredientNeeds(['qahwa_1', 'qahwa_1', 'qahwa_2'], state.board, []);
  assert.deepEqual([...focusCells(updated, state.board)], [3]);
});

test('items already on the board or in the pantry do not light up sources', () => {
  const state = createInitialGameState();
  const order = { ...state.activeOrders[0], requiredItemIds: ['qahwa_2'] };
  const needs = orderNeeds(order, state.board, []);
  assert.equal(needs[0].location, 'board');
  assert.equal(focusCells(needs, state.board).size, 0);
  assert.equal(needs[0].generatorId, 'gen_qahwa');
});

test('a tasting recipe uses the same inventory-aware guidance as a guest order', () => {
  const state = createInitialGameState();
  const recipe = TASTING_TRAYS[0][0];
  state.board = state.board.map(c => c.itemId === 'sweets_2' ? { ...c, itemId: null } : c);
  const needs = ingredientNeeds(recipe.items, state.board, ['sweets_2']);
  assert.deepEqual(needs.map(n => n.location), ['board', 'pantry']);
  assert.equal(focusCells(needs, state.board).size, 0);
  const missing = ingredientNeeds(recipe.items, state.board, []);
  assert.equal(missing[1].location, 'missing');
  assert.ok(focusCells(missing, state.board).has(5), 'the sweets generator is highlighted');
});

test('ingredient guidance identifies the preceding merge and the boost needed for level one', () => {
  const missing = { itemId: 'qahwa_2', location: 'missing' as const, generatorId: 'gen_qahwa' };
  assert.match(ingredientInstruction(missing, 'en', 4), /Merge two .* to make this/);
  assert.match(ingredientInstruction(missing, 'ar', 4), /ادمج قطعتين/);
  const base = { ...missing, itemId: 'qahwa_1' };
  assert.match(ingredientInstruction(base, 'en', 4), /power boost to ×1/);
  assert.doesNotMatch(ingredientInstruction(base, 'en', 1), /Set the power boost/);
  assert.match(ingredientInstruction({ ...missing, location: 'pantry' }, 'en', 1), /return it to the board/);
  assert.match(ingredientInstruction({ ...missing, location: 'board' }, 'ar', 1), /جاهز/);
  assert.match(ingredientInstruction({ ...missing, itemId: 'unknown' }, 'en', 1), /chain guide/);
});

test('focused guest order survives save and becomes inactive after the order is replaced', async () => {
  const { focusedGuestOrder, setFocusedGuestOrder } = await import('./orderGuide');
  const { normalizeSave } = await import('./normalizeSave');
  const state = createInitialGameState();
  const order = state.activeOrders[0];
  const selected = setFocusedGuestOrder(state, order.id);
  const restored = normalizeSave(JSON.parse(JSON.stringify(selected)))!;
  assert.equal(focusedGuestOrder(restored)?.id, order.id);
  assert.equal(focusedGuestOrder({ ...restored, activeOrders: restored.activeOrders.filter(o => o.id !== order.id) }), null);
  assert.equal(focusedGuestOrder(setFocusedGuestOrder(restored, null)), null);
  assert.equal(setFocusedGuestOrder(state, 'missing-order'), state);
});


test('higher boosts explain direct generator drops without promising a lucky result', () => {
  const levelTwo = { itemId: 'qahwa_2', location: 'missing' as const, generatorId: 'gen_qahwa' };
  assert.doesNotMatch(ingredientInstruction(levelTwo, 'en', 1), /base drop/);
  assert.match(ingredientInstruction(levelTwo, 'en', 2), /boost to ×2.*costs 2 energy per tap.*lucky drop/);
  assert.match(ingredientInstruction(levelTwo, 'ar', 4), /المضاعف على ×2.*يستهلك 2 طاقة للنقرة/);
  const levelThree = { ...levelTwo, itemId: 'qahwa_3' };
  assert.match(ingredientInstruction(levelThree, 'en', 4), /costs 4 energy per tap/);
  assert.doesNotMatch(ingredientInstruction(levelThree, 'en', 2), /base drop/);
  assert.match(ingredientInstruction(levelThree, 'en', 4), /boost to ×4/);
  assert.doesNotMatch(ingredientInstruction({ ...levelTwo, generatorId: null }, 'en', 4), /base drop/);
});
