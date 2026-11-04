import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { createClient } from '@supabase/supabase-js';
import { createInitialGameState } from '../game/rules';
import { CheckpointAccountChanged, CheckpointConflict, sandboxCheckpointClient } from './sandboxCheckpoint';

// Run only with the local Postman simulation. All credentials and account data are synthetic.
test('checkpoint client sends account-bound RPCs and handles a simulated conflict', async () => {
  const user = 'b928f790-1234-4123-8123-0123456789ab';
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const accessToken = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user, role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })}.test`;
  const supabase = createClient('http://localhost:4317/cloud', 'local-publishable-key', { auth: { persistSession: false, autoRefreshToken: false } });
  const session = await supabase.auth.setSession({ access_token: accessToken, refresh_token: 'local-only' });
  assert.equal(session.error, null);
  const client = sandboxCheckpointClient(supabase);
  const initial = createInitialGameState();
  assert.equal(await client.load(user), null);
  const saved = await client.save(user, 0, initial);
  assert.equal(saved.revision, 1);
  assert.equal((await client.load(user))?.revision, 1);
  const claim = await client.claim(user, 1, 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee');
  assert.equal(claim.gameState.energy, initial.energy + 120);
  assert.equal(claim.gameState.diamonds, initial.diamonds + 20);
  assert.equal(claim.alreadyClaimed, false);
  await assert.rejects(client.save(user, 99, initial), CheckpointConflict);
  await assert.rejects(client.save('aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee', 0, initial), CheckpointAccountChanged);
  await assert.rejects(client.claim(user, 1, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'), CheckpointAccountChanged);
});
