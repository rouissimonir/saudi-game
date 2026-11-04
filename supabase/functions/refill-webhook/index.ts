import { classifyRefillEvent } from './events.ts';

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Promise<Response>): void;
};

/** No credentials or event payloads are logged; unsupported events require review. */
Deno.serve(async (request: Request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const expected = Deno.env.get('REVENUECAT_WEBHOOK_AUTH');
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!expected || !url || !serviceKey) return new Response('Not configured', { status: 503 });

  const digest = async (value: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  const [providedHash, expectedHash] = await Promise.all([digest(request.headers.get('authorization') ?? ''), digest(expected)]);
  let difference = 0;
  for (let i = 0; i < expectedHash.length; i++) difference |= providedHash[i] ^ expectedHash[i];
  if (difference !== 0) return new Response('Unauthorized', { status: 401 });

  if (Number(request.headers.get('content-length')) > 65536) return new Response('Payload too large', { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) return new Response('Invalid JSON', { status: 400 });
  const decoder = new TextDecoder();
  let text = '';
  let bytes = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    bytes += part.value.byteLength;
    if (bytes > 65536) { await reader.cancel(); return new Response('Payload too large', { status: 413 }); }
    text += decoder.decode(part.value, { stream: true });
  }
  text += decoder.decode();
  let payload: unknown;
  try { payload = JSON.parse(text); } catch { return new Response('Invalid JSON', { status: 400 }); }
  const decision = classifyRefillEvent(payload);
  if (decision.action === 'ignore') return new Response('Ignored', { status: 200 });
  // A non-200 keeps the failed event visible for reconciliation and provider retries.
  if (decision.action === 'review') return new Response(`Review: ${decision.reason}`, { status: 503 });

  try {
    const result = await fetch(`${url}/rest/v1/rpc/record_refill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({ p_user: decision.userId, p_environment: decision.environment, p_transaction: decision.transactionId, p_kind: decision.kind }),
    });
    return result.ok ? new Response('Recorded', { status: 200 }) : new Response('Ledger unavailable', { status: 503 });
  } catch { return new Response('Ledger unavailable', { status: 503 }); }
});
