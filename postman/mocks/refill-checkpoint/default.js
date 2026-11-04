// A local contract stand-in; this does not implement Supabase security or persistence.
const http = require('http');
const userId = 'b928f790-1234-4123-8123-0123456789ab';
const switchedUser = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
let currentUser = userId;
let snapshot;
let revision = 0;
http.createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (req.headers.apikey !== 'local-publishable-key' || !req.headers.authorization?.startsWith('Bearer ')) {
    res.writeHead(401); return res.end();
  }
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'GET' && path === '/auth/v1/user') return res.end(JSON.stringify({ id: currentUser, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} }));
  if (req.method === 'GET' && path === '/rest/v1/sandbox_game_checkpoints') {
    if (new URL(req.url, 'http://localhost').searchParams.get('user_id') !== `eq.${userId}`) { res.writeHead(403); return res.end('{}'); }
    return res.end(JSON.stringify(snapshot ? [{ revision, game_state: snapshot }] : []));
  }
  if (req.method === 'POST' && path === '/rest/v1/rpc/save_sandbox_checkpoint_bound') {
    if (req.body?.p_user !== userId) { res.writeHead(403); return res.end('{}'); }
    if (req.body.p_expected_revision !== 0) { res.writeHead(409); return res.end(JSON.stringify({ code: '40001' })); }
    snapshot = req.body.p_state;
    revision = 1;
    return res.end(JSON.stringify([{ revision, game_state: snapshot }]));
  }
  if (req.method === 'POST' && path === '/rest/v1/rpc/claim_sandbox_wallet_bound') {
    if (req.body?.p_user !== userId || req.body.p_expected_revision !== 1 || !snapshot) { res.writeHead(400); return res.end('{}'); }
    snapshot = { ...snapshot, energy: snapshot.energy + 120, diamonds: snapshot.diamonds + 20 };
    revision = 2;
    if (req.body.p_claim_id === 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') currentUser = switchedUser;
    return res.end(JSON.stringify([{ revision, game_state: snapshot, energy_claimed: 120, gems_claimed: 20, already_claimed: false }]));
  }
  res.writeHead(501); res.end('{}');
}).listen(process.env.PORT || 4501);
