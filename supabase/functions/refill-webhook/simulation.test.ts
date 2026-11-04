import { strict as assert } from 'node:assert';
import { test } from 'node:test';

// Requires the local Postman simulation: no real Supabase data or secrets are used.
test('actual webhook handler sends the correct RPC and reports a simulated database outage', async () => {
  let handler: ((request: Request) => Promise<Response>) | undefined;
  const vars: Record<string, string> = {
    REVENUECAT_WEBHOOK_AUTH: 'Bearer local-webhook-key',
    SUPABASE_URL: 'http://localhost:4317/ledger',
    SUPABASE_SERVICE_ROLE_KEY: 'local-service-key',
  };
  const globals = globalThis as unknown as { Deno?: unknown };
  const original = globals.Deno;
  globals.Deno = { env: { get: (name: string) => vars[name] }, serve: (callback: typeof handler) => { handler = callback; } };
  try {
    await import('./index');
    assert.ok(handler);
    const event = { id: 'event-123', app_id: 'appd8c8c1ea34', product_id: 'sa.qahwamajlis.energy.refill',
      store: 'APP_STORE', environment: 'SANDBOX', type: 'NON_RENEWING_PURCHASE',
      app_user_id: 'qahwa:b928f790-1234-4123-8123-0123456789ab', transaction_id: '123456789' };
    const call = (transactionId: string) => handler!(new Request('http://localhost/', {
      method: 'POST', headers: { authorization: vars.REVENUECAT_WEBHOOK_AUTH },
      body: JSON.stringify({ event: { ...event, transaction_id: transactionId } }),
    }));
    assert.equal((await call('123456789')).status, 200);
    assert.equal((await call('999')).status, 503);
  } finally { globals.Deno = original; }
});
