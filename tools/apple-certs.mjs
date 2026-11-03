// List, and optionally remove, the signing certificates that Xcode's cloud signing creates in your Apple account.
//
// Why: the TestFlight workflow signs with an App Store Connect API key on a fresh Mac every run. Xcode may create a new
// "Apple Development: Created via API" certificate each time, and Apple caps how many a team can hold. At the cap, signing
// fails with "Your account has reached the maximum number of certificates". Removing those stale development certificates
// lets the next run create its own. Distribution certificates are never touched by this tool.
//
// Usage (needs ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8 in the environment; nothing secret is printed):
//   node tools/apple-certs.mjs list
//   node tools/apple-certs.mjs clean            # shows what it would remove
//   node tools/apple-certs.mjs clean --delete   # removes API-created development certificates
//   node tools/apple-certs.mjs builds           # latest TestFlight builds and whether each is ready or waiting on compliance
import { createPrivateKey, sign } from 'node:crypto';

const API = 'https://api.appstoreconnect.apple.com';
const [, , command = 'list', ...flags] = process.argv;

function token() {
  const { ASC_KEY_ID: kid, ASC_ISSUER_ID: iss, ASC_KEY_P8: raw } = process.env;
  if (!kid || !iss || !raw) throw new Error('ASC_KEY_ID, ASC_ISSUER_ID and ASC_KEY_P8 must be set.');
  const key = createPrivateKey(raw.replace(/\\n/g, '\n'));
  const b64 = (value) => Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: 'ES256', kid, typ: 'JWT' })}.${b64({ iss, iat: now, exp: now + 900, aud: 'appstoreconnect-v1' })}`;
  return `${unsigned}.${sign('sha256', Buffer.from(unsigned), { key, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;
}

async function call(path, init = {}) {
  const response = await fetch(`${API}${path}`, { ...init, headers: { Authorization: `Bearer ${token()}`, ...init.headers } });
  if (!response.ok && response.status !== 204) {
    const text = await response.text();
    throw new Error(`${init.method ?? 'GET'} ${path} -> HTTP ${response.status}: ${text.slice(0, 300)}`);
  }
  return response.status === 204 ? null : response.json();
}

async function certificates() {
  const out = [];
  let next = '/v1/certificates?limit=200';
  while (next) {
    const page = await call(next);
    out.push(...page.data);
    next = page.links?.next ? page.links.next.replace(API, '') : null;
  }
  return out.map((c) => ({ id: c.id, type: c.attributes.certificateType, name: c.attributes.name ?? c.attributes.displayName ?? '', expires: c.attributes.expirationDate ?? '' }));
}

const isDevelopment = (c) => /DEVELOPMENT/.test(c.type);
const isApiCreated = (c) => /created via api/i.test(c.name);

function show(rows) {
  if (rows.length === 0) { console.log('No certificates in this account.'); return; }
  for (const c of rows.sort((a, b) => a.type.localeCompare(b.type) || a.expires.localeCompare(b.expires))) {
    console.log(`${c.type.padEnd(22)} ${c.expires.slice(0, 10)}  ${c.name}  (${c.id})`);
  }
  const byType = rows.reduce((m, c) => ({ ...m, [c.type]: (m[c.type] ?? 0) + 1 }), {});
  console.log(`\nTotals by type: ${JSON.stringify(byType)}`);
}

async function builds() {
  const appId = process.env.ASC_APP_ID || '6827965054';
  const page = await call(`/v1/builds?filter[app]=${appId}&sort=-uploadedDate&limit=8&include=buildBetaDetail`);
  const beta = new Map((page.included ?? []).filter((i) => i.type === 'buildBetaDetails').map((i) => [i.id, i.attributes]));
  if (page.data.length === 0) { console.log('No builds found for this app.'); return; }
  for (const b of page.data) {
    const detail = beta.get(b.relationships?.buildBetaDetail?.data?.id) ?? {};
    const a = b.attributes;
    console.log(`build ${String(a.version).padEnd(4)} uploaded ${String(a.uploadedDate ?? '').slice(0, 16)}  processing=${a.processingState}  internal=${detail.internalBuildState ?? '?'}  external=${detail.externalBuildState ?? '?'}  encryption=${a.usesNonExemptEncryption ?? 'unanswered'}${a.expired ? '  EXPIRED' : ''}`);
  }
}

if (command === 'builds') {
  await builds();
  process.exit(0);
}

const rows = await certificates();
if (command === 'list') {
  show(rows);
} else if (command === 'clean') {
  const stale = rows.filter((c) => isDevelopment(c) && isApiCreated(c));
  console.log(`${rows.length} certificates; ${stale.length} are API-created development certificates.`);
  show(stale.slice());
  if (!flags.includes('--delete')) {
    console.log('\nDry run: nothing removed. Add --delete to remove the development certificates listed above.');
  } else {
    let removed = 0;
    for (const c of stale) {
      try { await call(`/v1/certificates/${c.id}`, { method: 'DELETE' }); removed++; }
      catch (error) { console.log(`Could not remove ${c.id}: ${error.message}`); }
    }
    console.log(`\nRemoved ${removed} of ${stale.length}.`);
  }
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(2);
}
