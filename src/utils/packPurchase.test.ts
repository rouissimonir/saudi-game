import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState } from '../game/rules';
import { PAID_PACKS } from '../game/dailyPack';
import { PackStorePort, StorePackage, buyPack, listedPacks, todaysOffer, unappliedPurchases } from './packPurchase';

const refill = PAID_PACKS[0];
const pkg: StorePackage = { identifier: 'refill_pkg', product: { identifier: refill.productId, priceString: 'SAR 4.99', title: 'Refill' } };
const port = (over: Partial<PackStorePort> = {}): PackStorePort => ({
  listPackages: async () => [pkg, { identifier: 'x', product: { identifier: 'other', priceString: '1', title: 'x' } }],
  purchase: async () => ({ transaction: { transactionIdentifier: 'tx-1', productIdentifier: refill.productId, purchaseDate: new Date().toISOString() } }),
  transactions: async () => [],
  ...over,
});

test('lists only known packs and keeps the store price string', async () => {
  const listed = await listedPacks(port());
  assert.equal(listed.length, 1);
  assert.equal(listed[0].priceString, 'SAR 4.99');
  assert.equal(todaysOffer(listed, '2026-11-08')?.pack.id, 'refill');
  assert.equal(todaysOffer([], '2026-11-08'), null);
  assert.deepEqual(await listedPacks(port({ listPackages: async () => [] })), []);
});

test('a purchase reports the store transaction id', async () => {
  const [listed] = await listedPacks(port());
  assert.deepEqual(await buyPack(port(), listed), { kind: 'bought', pack: refill, transactionId: 'tx-1' });
});

test('cancel is quiet, other errors and mismatched products fail', async () => {
  const [listed] = await listedPacks(port());
  assert.equal((await buyPack(port({ purchase: async () => { throw { code: '1' }; } }), listed)).kind, 'cancelled');
  assert.equal((await buyPack(port({ purchase: async () => { throw { userCancelled: true }; } }), listed)).kind, 'cancelled');
  assert.equal((await buyPack(port({ purchase: async () => { throw new Error('network'); } }), listed)).kind, 'failed');
  const wrong = port({ purchase: async () => ({ transaction: { transactionIdentifier: 't', productIdentifier: 'other', purchaseDate: '' } }) });
  assert.equal((await buyPack(wrong, listed)).kind, 'failed');
});

test('recovers only recent charged purchases that the save has not received', () => {
  const now = Date.parse('2026-11-08T12:00:00Z');
  const tx = (id: string, iso: string, product = refill.productId) => ({ transactionIdentifier: id, productIdentifier: product, purchaseDate: iso });
  const state = { ...createInitialGameState(), packTransactions: ['done'] };
  const got = unappliedPurchases(state, [
    tx('done', '2026-11-08T11:00:00Z'),
    tx('fresh', '2026-11-08T11:30:00Z'),
    tx('old', '2026-11-01T11:00:00Z'),
    tx('other-product', '2026-11-08T11:00:00Z', 'something.else'),
    tx('future', '2026-11-09T11:00:00Z'),
    tx('bad-date', 'nonsense'),
  ], now);
  assert.deepEqual(got.map((g) => g.transactionId), ['fresh']);
});
