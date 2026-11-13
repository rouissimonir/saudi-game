// One-time setup: create ONE Apple Distribution certificate and ONE App Store provisioning profile, so CI signs with the
// same certificate every build instead of cloud signing creating a new one per run.
//
// Needs ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8 (and optionally BUNDLE_ID) in the environment and `openssl` on the path.
// Writes four text files into the output directory (default ./signing-out). Their contents become GitHub secrets:
//   DIST_CERT_P12_BASE64, DIST_CERT_PASSWORD, DIST_PROFILE_BASE64, DIST_PROFILE_NAME.
// The files hold a private key: treat them like a password and delete them after saving the secrets.
import { createPrivateKey, randomBytes, sign } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const API = 'https://api.appstoreconnect.apple.com';
const bundleIdentifier = process.env.BUNDLE_ID || 'sa.qahwamajlis.merge';
const outDir = process.argv[2] || 'signing-out';

function token() {
  const { ASC_KEY_ID: kid, ASC_ISSUER_ID: iss, ASC_KEY_P8: raw } = process.env;
  if (!kid || !iss || !raw) throw new Error('ASC_KEY_ID, ASC_ISSUER_ID and ASC_KEY_P8 must be set.');
  const key = createPrivateKey(raw.replace(/\\n/g, '\n'));
  const b64 = (v) => Buffer.from(typeof v === 'string' ? v : JSON.stringify(v)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: 'ES256', kid, typ: 'JWT' })}.${b64({ iss, iat: now, exp: now + 900, aud: 'appstoreconnect-v1' })}`;
  return `${unsigned}.${sign('sha256', Buffer.from(unsigned), { key, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;
}

async function call(method, route, body) {
  const response = await fetch(`${API}${route}`, {
    method,
    headers: { Authorization: `Bearer ${token()}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${route} -> HTTP ${response.status}: ${text.slice(0, 600)}`);
  return text ? JSON.parse(text) : null;
}

const openssl = (...args) => execFileSync('openssl', args, { stdio: ['ignore', 'pipe', 'pipe'] });
const work = mkdtempSync(path.join(tmpdir(), 'signing-'));
const file = (name) => path.join(work, name);

// 1. A private key and certificate signing request, made here so the key never leaves this run except as the p12.
openssl('genrsa', '-out', file('key.pem'), '2048');
openssl('req', '-new', '-key', file('key.pem'), '-out', file('request.csr'), '-subj', '/CN=Qahwa Majlis CI/O=Qahwa Majlis/C=SA');

// 2. One distribution certificate.
const created = await call('POST', '/v1/certificates', {
  data: { type: 'certificates', attributes: { certificateType: 'DISTRIBUTION', csrContent: readFileSync(file('request.csr'), 'utf8') } },
});
const certId = created.data.id;
writeFileSync(file('cert.cer'), Buffer.from(created.data.attributes.certificateContent, 'base64'));
openssl('x509', '-inform', 'DER', '-in', file('cert.cer'), '-out', file('cert.pem'));
const password = randomBytes(18).toString('base64url');
// Older algorithms on purpose: the macOS keychain cannot import the OpenSSL 3 defaults.
openssl('pkcs12', '-export', '-inkey', file('key.pem'), '-in', file('cert.pem'), '-out', file('signing.p12'),
  '-passout', `pass:${password}`, '-keypbe', 'PBE-SHA1-3DES', '-certpbe', 'PBE-SHA1-3DES', '-macalg', 'sha1');

// 3. One App Store profile for the app's bundle id, tied to that certificate.
const bundles = await call('GET', `/v1/bundleIds?filter[identifier]=${encodeURIComponent(bundleIdentifier)}&limit=10`);
const bundle = bundles.data.find((b) => b.attributes.identifier === bundleIdentifier);
if (!bundle) throw new Error(`Bundle id ${bundleIdentifier} not found in this Apple account.`);
const profileName = `Qahwa CI App Store ${new Date().toISOString().slice(0, 10)}`;
const profile = await call('POST', '/v1/profiles', {
  data: {
    type: 'profiles',
    attributes: { name: profileName, profileType: 'IOS_APP_STORE' },
    relationships: { bundleId: { data: { type: 'bundleIds', id: bundle.id } }, certificates: { data: [{ type: 'certificates', id: certId }] } },
  },
});

mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, 'DIST_CERT_P12_BASE64.txt'), readFileSync(file('signing.p12')).toString('base64'));
writeFileSync(path.join(outDir, 'DIST_CERT_PASSWORD.txt'), password);
writeFileSync(path.join(outDir, 'DIST_PROFILE_BASE64.txt'), profile.data.attributes.profileContent);
writeFileSync(path.join(outDir, 'DIST_PROFILE_NAME.txt'), profileName);
console.log(`Created certificate ${certId} (expires ${created.data.attributes.expirationDate?.slice(0, 10)}) and profile "${profileName}" (expires ${profile.data.attributes.expirationDate?.slice(0, 10)}).`);
console.log(`Wrote the four secret files to ${outDir}/ (contents are not printed).`);
