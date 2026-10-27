import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState, fulfillCustomerOrder } from './rules';
import { tastingGuestMemory } from './guestMemories';
import { normalizeSave } from './normalizeSave';

test('serving a guest after the gathering records their selected tray once', () => {
  const base = createInitialGameState();
  const order = { ...base.activeOrders[0], customerId: 'noura', requiredItemIds: ['qahwa_2'] };
  const state = { ...base, activeOrders: [order], storyFlags: { tasting_complete: 'yes', tasting_tray_0: 'modern', tasting_tray_1: 'fragrant', tasting_style: 'warm' } };
  const served = fulfillCustomerOrder(state, order.id);
  assert.ok(served.fulfilled);
  assert.equal(served.rememberedGuest, 'noura');
  assert.equal(served.state.storyFlags.tasting_visit_noura, 'fragrant');
  assert.match(tastingGuestMemory(served.state.storyFlags, 'noura')!.textEn, /oud/);
  const saved = normalizeSave(JSON.parse(JSON.stringify(served.state)));
  assert.ok(saved);
  assert.equal(tastingGuestMemory(saved.storyFlags, 'noura')?.textEn, tastingGuestMemory(served.state.storyFlags, 'noura')?.textEn);
  const second = { ...saved, board: saved.board.map((c, i) => i === 25 ? { ...c, itemId: 'qahwa_2', sandLocked: false } : c), activeOrders: [order], storyFlags: { ...saved.storyFlags, tasting_style: 'green' } };
  const again = fulfillCustomerOrder(second, order.id);
  assert.equal(again.rememberedGuest, null);
  assert.equal(again.state.storyFlags.tasting_visit_noura, 'fragrant');
});

test('unfinished gatherings, other guests and unavailable orders cannot create memories', () => {
  const base = createInitialGameState();
  const missing = { ...base.activeOrders[0], requiredItemIds: ['qahwa_6'], customerId: 'noura' };
  const state = { ...base, activeOrders: [missing], storyFlags: { tasting_complete: 'yes', tasting_tray_1: 'sweet' } };
  assert.equal(fulfillCustomerOrder(state, missing.id).fulfilled, false);
  assert.equal('tasting_visit_noura' in state.storyFlags, false);
  const order = { ...missing, customerId: 'tariq', requiredItemIds: ['qahwa_2'] };
  assert.equal(fulfillCustomerOrder({ ...state, activeOrders: [order] }, order.id).rememberedGuest, null);
  const before = { ...base, activeOrders: [{ ...order, customerId: 'faisal' }], storyFlags: { tasting_tray_0: 'modern' } };
  assert.equal(fulfillCustomerOrder(before, order.id).rememberedGuest, null);
});

test('Faisal remembers the first tray and the alternative choice changes his line', () => {
  const base = createInitialGameState();
  const order = { ...base.activeOrders[0], customerId: 'faisal', requiredItemIds: ['qahwa_2'] };
  const visit = (choice: string) => fulfillCustomerOrder({ ...base, activeOrders: [order], storyFlags: { tasting_complete: 'yes', tasting_tray_0: choice } }, order.id);
  const traditional = visit('traditional');
  const modern = visit('modern');
  assert.equal(traditional.rememberedGuest, 'faisal');
  assert.equal(modern.rememberedGuest, 'faisal');
  assert.notEqual(tastingGuestMemory(traditional.state.storyFlags, 'faisal')?.textEn, tastingGuestMemory(modern.state.storyFlags, 'faisal')?.textEn);
  assert.equal(visit('unknown').rememberedGuest, null);
});
