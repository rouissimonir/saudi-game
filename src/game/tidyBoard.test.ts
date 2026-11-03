import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ITEM_CATALOG, createInitialGameState, type GameState } from './rules';
import { tidyBoard } from './tidyBoard';

function withItems(placement: Record<number, string | null>, locked: number[] = []): GameState {
  const base = createInitialGameState();
  const board = base.board.map((cell) => ({ ...cell, itemId: null as string | null, sandLocked: false }));
  for (const [index, itemId] of Object.entries(placement)) board[Number(index)] = { ...board[Number(index)], itemId };
  for (const index of locked) board[index] = { ...board[index], sandLocked: true };
  return { ...base, board, selectedCellIndex: 5 };
}

const counts = (s: GameState) => {
  const m: Record<string, number> = {};
  for (const c of s.board) if (c.itemId) m[c.itemId] = (m[c.itemId] ?? 0) + 1;
  return m;
};

test('loose items are grouped by chain, highest level first, with free space at the end', () => {
  const s = withItems({ 3: 'qahwa_1', 10: 'sweets_2', 20: 'qahwa_3', 30: 'qahwa_1', 40: 'barista_2' });
  const r = tidyBoard(s);
  assert.equal(r.moved, true);
  assert.deepEqual(r.state.board.slice(0, 5).map((c) => c.itemId), ['qahwa_3', 'qahwa_1', 'qahwa_1', 'barista_2', 'sweets_2']);
  assert.ok(r.state.board.slice(5).every((c) => c.itemId === null));
  assert.deepEqual(counts(r.state), counts(s), 'nothing is lost or duplicated');
  assert.equal(r.state.selectedCellIndex, null);
});

test('generators and sand-covered tiles stay exactly where they are', () => {
  const generator = Object.values(ITEM_CATALOG).find((i) => i.isGenerator)!.id;
  const s = withItems({ 0: generator, 6: 'qahwa_2', 7: 'qahwa_1', 20: 'qahwa_2' }, [7]);
  const r = tidyBoard(s);
  assert.equal(r.state.board[0].itemId, generator);
  assert.equal(r.state.board[7].itemId, 'qahwa_1');
  assert.equal(r.state.board[7].sandLocked, true);
  assert.deepEqual(counts(r.state), counts(s));
});

test('an already tidy board is left alone', () => {
  const s = withItems({ 0: 'qahwa_2', 1: 'qahwa_1' });
  const r = tidyBoard(s);
  assert.equal(r.moved, false);
  assert.equal(r.state, s);
});

test('a full board stays full and keeps every item', () => {
  const ids = Object.values(ITEM_CATALOG).filter((i) => !i.isGenerator).map((i) => i.id);
  const placement: Record<number, string> = {};
  for (let i = 0; i < 49; i++) placement[i] = ids[(i * 7) % ids.length];
  const s = withItems(placement);
  const r = tidyBoard(s);
  assert.deepEqual(counts(r.state), counts(s));
  assert.equal(r.state.board.filter((c) => c.itemId).length, 49);
});
