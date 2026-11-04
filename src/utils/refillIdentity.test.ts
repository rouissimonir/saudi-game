import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { prepareRefillIdentity, type RefillIdentityPorts } from './refillIdentity';

const first = 'b928f790-1234-4123-8123-0123456789ab';
const second = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
function fixture() {
  let user: string | null = first;
  let rc = '$RCAnonymousID:initial';
  const calls: string[] = [];
  const ports: RefillIdentityPorts = {
    validatedUserId: async () => user,
    createGuest: async () => { calls.push('guest'); user = first; return first; },
    revenueCatUserId: async () => rc,
    logOutRevenueCat: async () => { calls.push('logout'); rc = '$RCAnonymousID:new'; },
    logInRevenueCat: async id => { calls.push(`login:${id}`); rc = id; },
  };
  return { ports, calls, setUser: (id: string | null) => { user = id; }, setRc: (id: string) => { rc = id; } };
}

test('a guest can prepare an opaque purchase identity without entering an email', async () => {
  const f = fixture(); f.setUser(null);
  assert.equal(await prepareRefillIdentity(f.ports), `qahwa:${first}`);
  assert.deepEqual(f.calls, ['guest', `login:qahwa:${first}`]);
});
test('switching identified accounts logs out first; a matching identity does not', async () => {
  const f = fixture(); f.setRc(`qahwa:${second}`);
  await prepareRefillIdentity(f.ports);
  assert.deepEqual(f.calls, ['logout', `login:qahwa:${first}`]);
  f.calls.length = 0; await prepareRefillIdentity(f.ports); assert.deepEqual(f.calls, []);
});
test('failed sign-out or a session switch prevents proceeding', async () => {
  const f = fixture(); f.setRc(`qahwa:${second}`);
  f.ports.logOutRevenueCat = async () => { throw new Error('offline'); };
  await assert.rejects(prepareRefillIdentity(f.ports));
  assert.deepEqual(f.calls, []);
  const g = fixture(); g.ports.logInRevenueCat = async () => { g.setUser(second); g.setRc(`qahwa:${first}`); };
  await assert.rejects(prepareRefillIdentity(g.ports), /identity changed/);
});
test('invalid backend identifiers never reach RevenueCat', async () => {
  const f = fixture(); f.setUser('person@example.com');
  await assert.rejects(prepareRefillIdentity(f.ports), /Invalid purchase identity/);
  assert.deepEqual(f.calls, []);
});
