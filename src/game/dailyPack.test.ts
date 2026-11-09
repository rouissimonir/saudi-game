import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState } from './rules';
import { PAID_PACKS, PaidPack, applyPackPurchase, packOfferDue, packOfferFor } from './dailyPack';
import { normalizeSave } from './normalizeSave';

const refill = PAID_PACKS[0];
const extra: PaidPack = { ...refill, id: 'b', productId: 'p.b' };
const extra2: PaidPack = { ...refill, id: 'c', productId: 'p.c' };

test('offers nothing unless the store lists a pack', () => {
  assert.equal(packOfferFor('2026-11-08', []), null);
  assert.equal(packOfferFor('2026-11-08', ['unrelated']), null);
  assert.equal(packOfferFor('2026-11-08', [refill.productId])?.id, 'refill');
});

test('rotates through listed packs by calendar day and ignores unlisted ones', () => {
  const packs = [refill, extra, extra2];
  const listed = [refill.productId, 'p.b', 'p.c'];
  const days = ['2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11'];
  const ids = days.map((d) => packOfferFor(d, listed, packs)!.id);
  assert.equal(new Set(ids.slice(0, 3)).size, 3);
  assert.equal(ids[3], ids[0]);
  assert.equal(packOfferFor('2026-11-09', [refill.productId], packs)!.id, 'refill');
  assert.equal(packOfferFor('not-a-day', listed, packs) !== null, true);
});

test('shows the offer once a day and not after buying', () => {
  const s = createInitialGameState();
  assert.equal(packOfferDue(s, '', '2026-11-08'), true);
  assert.equal(packOfferDue(s, '2026-11-08', '2026-11-08'), false);
  assert.equal(packOfferDue({ ...s, packBoughtDay: '2026-11-08' }, '', '2026-11-08'), false);
  assert.equal(packOfferDue({ ...s, packBoughtDay: '2026-11-08' }, '2026-11-08', '2026-11-09'), true);
});

test('adds the pack once per transaction', () => {
  const s = createInitialGameState();
  const first = applyPackPurchase(s, refill, 'tx-1', '2026-11-08');
  assert.equal(first.applied, true);
  assert.equal(first.state.energy, s.energy + refill.energy);
  assert.equal(first.state.diamonds, s.diamonds + refill.gems);
  assert.equal(first.state.packBoughtDay, '2026-11-08');
  const again = applyPackPurchase(first.state, refill, 'tx-1', '2026-11-08');
  assert.equal(again.applied, false);
  assert.equal(again.state, first.state);
  assert.equal(applyPackPurchase(first.state, refill, 'tx-2', '2026-11-09').state.energy, s.energy + 2 * refill.energy);
  assert.equal(applyPackPurchase(s, refill, '', '2026-11-08').applied, false);
});

test('remembers only the latest 200 transactions', () => {
  let s = createInitialGameState();
  for (let i = 0; i < 205; i++) s = applyPackPurchase(s, refill, `tx-${i}`, '2026-11-08').state;
  assert.equal(s.packTransactions.length, 200);
  assert.equal(s.packTransactions[0], 'tx-5');
});

test('old saves load with no pack history and bad history is dropped', () => {
  const base = JSON.parse(JSON.stringify(createInitialGameState()));
  delete base.packTransactions; delete base.packBoughtDay;
  const old = normalizeSave(base)!;
  assert.deepEqual(old.packTransactions, []);
  assert.equal(old.packBoughtDay, '');
  const bad = normalizeSave({ ...base, packTransactions: ['a', 5, null], packBoughtDay: 7 })!;
  assert.deepEqual(bad.packTransactions, ['a']);
  assert.equal(bad.packBoughtDay, '');
});

test('a pack recovered from an earlier day never hides or overwrites a later purchase day', () => {
  const s = createInitialGameState();
  const today = applyPackPurchase(s, refill, 'tx-today', '2026-11-08').state;
  const late = applyPackPurchase(today, refill, 'tx-yesterday', '2026-11-07').state;
  assert.equal(late.packBoughtDay, '2026-11-08');
  assert.equal(late.energy, s.energy + 2 * refill.energy);
  // and recovering yesterday's pack today does not mark today's offer as taken
  assert.equal(applyPackPurchase(s, refill, 'tx-y', '2026-11-07').state.packBoughtDay, '2026-11-07');
  assert.equal(packOfferDue(applyPackPurchase(s, refill, 'tx-y', '2026-11-07').state, '', '2026-11-08'), true);
});
