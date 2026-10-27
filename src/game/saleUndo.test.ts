import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState } from './rules';
import { canUndoSale, sellWithReceipt, undoSale } from './saleUndo';

test('a sale can be reversed once, even if energy regenerated in the meantime', () => {
  const original = createInitialGameState();
  const index = original.board.findIndex(c => c.itemId === 'qahwa_2' && !c.sandLocked);
  assert.ok(index >= 0);
  const sale = sellWithReceipt(original, index);
  assert.ok(sale);
  assert.equal(sale.state.board[index].itemId, null);
  const withEnergy = { ...sale.state, energy: sale.state.energy + 1 };
  assert.ok(canUndoSale(withEnergy, sale.receipt));
  const restored = undoSale(withEnergy, sale.receipt);
  assert.equal(restored.board[index].itemId, 'qahwa_2');
  assert.equal(restored.coins, original.coins);
  assert.equal(restored.energy, withEnergy.energy);
  assert.equal(undoSale(restored, sale.receipt), restored);
});

test('unrelated board and coin changes do not prevent undo while the sold cell is untouched', () => {
  const original = createInitialGameState();
  const index = original.board.findIndex(c => c.itemId === 'qahwa_2' && !c.sandLocked);
  const sale = sellWithReceipt(original, index);
  assert.ok(sale);
  const unrelated = { ...sale.state, coins: sale.state.coins + 25, board: sale.state.board.map((c, i) => i === 17 ? { ...c, itemId: null } : c) };
  assert.ok(canUndoSale(unrelated, sale.receipt));
  const restored = undoSale(unrelated, sale.receipt);
  assert.equal(restored.coins, original.coins + 25);
  assert.equal(restored.board[index].itemId, 'qahwa_2');
  assert.equal(restored.board[17].itemId, null);
  assert.equal(undoSale(restored, sale.receipt), restored, 'the receipt cannot be used twice');
});

test('changing the sold cell or spending too much prevents undo', () => {
  const original = createInitialGameState();
  const index = original.board.findIndex(c => c.itemId === 'qahwa_2' && !c.sandLocked);
  const sale = sellWithReceipt(original, index);
  assert.ok(sale);
  const changedBoard = { ...sale.state, board: sale.state.board.map(c => ({ ...c })) };
  const changedCoins = { ...sale.state, coins: sale.receipt.value - 1 };
  assert.equal(undoSale(changedBoard, sale.receipt), changedBoard);
  assert.equal(undoSale(changedCoins, sale.receipt), changedCoins);
  assert.equal(sellWithReceipt(original, original.board.findIndex(c => c.itemId === 'gen_qahwa')), null);
});
