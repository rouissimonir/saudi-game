/** A normalized, authenticated RevenueCat event may affect one sandbox wallet. */
export type RefillDecision =
  | { action: 'ignore' }
  | { action: 'review'; reason: 'unsupported_environment' | 'unsupported_quantity' | 'unknown_identity' | 'ambiguous_identity' | 'unsupported_event' | 'invalid_transaction' }
  | { action: 'record'; userId: string; transactionId: string; kind: 'purchase' | 'refund'; environment: 'SANDBOX' };

const product = 'sa.qahwamajlis.energy.refill';
const app = 'appd8c8c1ea34';
const identity = /^qahwa:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
const record = (value: unknown): Record<string, unknown> | null => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;

/** Never use subscriber attributes or an arbitrary email as proof of ownership. */
export function classifyRefillEvent(payload: unknown): RefillDecision {
  const event = record(record(payload)?.event);
  if (!event) return { action: 'review', reason: 'unsupported_event' };
  if (event.product_id !== product) return { action: 'ignore' };
  if (typeof event.app_id !== 'string' || typeof event.store !== 'string') return { action: 'review', reason: 'unsupported_event' };
  if (event.app_id !== app || event.store !== 'APP_STORE') return { action: 'ignore' };
  if (event.environment !== 'SANDBOX') return { action: 'review', reason: 'unsupported_environment' };
  if (event.quantity !== undefined && event.quantity !== 1) return { action: 'review', reason: 'unsupported_quantity' };
  const kind = event.type === 'NON_RENEWING_PURCHASE' ? 'purchase'
    : event.type === 'CANCELLATION' && event.cancel_reason === 'CUSTOMER_SUPPORT' ? 'refund' : null;
  if (!kind) return { action: 'review', reason: 'unsupported_event' };
  if (typeof event.transaction_id !== 'string' || !/^[0-9]{1,200}$/.test(event.transaction_id)) return { action: 'review', reason: 'invalid_transaction' };
  const candidates = [event.app_user_id, event.original_app_user_id, ...(Array.isArray(event.aliases) ? event.aliases : [])]
    .flatMap(value => typeof value === 'string' ? [identity.exec(value)?.[1]?.toLowerCase()].filter((id): id is string => Boolean(id)) : []);
  const ids = [...new Set(candidates)];
  if (!ids.length) return { action: 'review', reason: 'unknown_identity' };
  if (ids.length !== 1) return { action: 'review', reason: 'ambiguous_identity' };
  return { action: 'record', userId: ids[0], transactionId: event.transaction_id, kind, environment: 'SANDBOX' };
}
