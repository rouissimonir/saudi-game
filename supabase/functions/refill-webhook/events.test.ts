import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { classifyRefillEvent } from './events';

const user = 'b928f790-1234-4123-8123-0123456789ab';
const sample = { id: 'event-123', app_id: 'appd8c8c1ea34', product_id: 'sa.qahwamajlis.energy.refill', store: 'APP_STORE', environment: 'SANDBOX', type: 'NON_RENEWING_PURCHASE', transaction_id: '123456789', app_user_id: `qahwa:${user}` };
const decide = (changes: Record<string, unknown>) => classifyRefillEvent({ api_version: '1.0', event: { ...sample, ...changes } });

test('recognizes a single sandbox refill and a confirmed refund', () => {
  assert.deepEqual(decide({}), { action: 'record', eventId: 'event-123', userId: user, transactionId: '123456789', kind: 'purchase', environment: 'SANDBOX' });
  assert.deepEqual(decide({ type: 'CANCELLATION', cancel_reason: 'CUSTOMER_SUPPORT' }), { action: 'record', eventId: 'event-123', userId: user, transactionId: '123456789', kind: 'refund', environment: 'SANDBOX' });
});
test('does not credit the wrong store, product, account, environment or quantity', () => {
  assert.deepEqual(decide({ product_id: 'another' }), { action: 'ignore' });
  assert.deepEqual(decide({ store: 'PLAY_STORE' }), { action: 'ignore' });
  assert.deepEqual(decide({ environment: 'PRODUCTION' }), { action: 'review', reason: 'unsupported_environment' });
  assert.deepEqual(decide({ quantity: 2 }), { action: 'review', reason: 'unsupported_quantity' });
  assert.deepEqual(decide({ app_user_id: '$RCAnonymousID:abc' }), { action: 'review', reason: 'unknown_identity' });
  assert.deepEqual(decide({ aliases: ['qahwa:aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'] }), { action: 'review', reason: 'ambiguous_identity' });
  assert.deepEqual(decide({ transaction_id: 'x' }), { action: 'review', reason: 'invalid_transaction' });
  assert.deepEqual(decide({ id: '' }), { action: 'review', reason: 'invalid_event' });
});
test('refuses unhandled refunds and accepts a single matching alias', () => {
  assert.deepEqual(decide({ type: 'REFUND_REVERSED' }), { action: 'review', reason: 'unsupported_event' });
  assert.deepEqual(decide({ type: 'CANCELLATION', cancel_reason: 'UNKNOWN' }), { action: 'review', reason: 'unsupported_event' });
  assert.equal(decide({ app_user_id: '$RCAnonymousID:x', aliases: [`qahwa:${user}`] }).action, 'record');
  assert.deepEqual(classifyRefillEvent(null), { action: 'review', reason: 'unsupported_event' });
});
