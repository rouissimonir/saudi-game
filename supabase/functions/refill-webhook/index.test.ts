import { strict as assert } from 'node:assert';
import { test } from 'node:test';

test('HTTP handler rejects unauthorized, malformed and unprocessable events before accessing the ledger', async () => {
  let handler: ((request: Request) => Promise<Response>) | undefined;
  const variables: Record<string, string> = {
    REVENUECAT_WEBHOOK_AUTH: 'Bearer local-test-only',
    SUPABASE_URL: 'http://127.0.0.1:1',
    SUPABASE_SERVICE_ROLE_KEY: 'local-test-only',
  };
  const globals = globalThis as unknown as { Deno?: unknown };
  const original = globals.Deno;
  globals.Deno = { env: { get: (name: string) => variables[name] }, serve: (callback: typeof handler) => { handler = callback; } };
  try {
    await import('./index');
    assert.ok(handler);
    const call = (body: string, auth = 'Bearer local-test-only') => handler!(new Request('http://localhost/', { method: 'POST', headers: { authorization: auth }, body }));
    assert.equal((await call('{}', 'wrong')).status, 401);
    assert.equal((await call('{')).status, 400);
    assert.equal((await call('x'.repeat(65537))).status, 413);
    assert.equal((await call(JSON.stringify({ event: { product_id: 'unrelated' } }))).status, 200);
    const unsafe = { event: { product_id: 'sa.qahwamajlis.energy.refill', app_id: 'appd8c8c1ea34', store: 'APP_STORE', environment: 'PRODUCTION' } };
    assert.equal((await call(JSON.stringify(unsafe))).status, 503);
  } finally { globals.Deno = original; }
});
