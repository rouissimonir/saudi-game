import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from './events';
import { createInitialGameState } from './rules';

const day = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();

test('a festival lasts three local days, ends at local midnight and rotates through all themes', () => {
  const seen = new Set<string>();
  let prev = E.activeLiveEvent(day(2026, 10, 1));
  seen.add(prev.def.id);
  let changes = 0;
  for (let i = 1; i <= 24; i++) {
    const ev = E.activeLiveEvent(day(2026, 10, 1 + i));
    if (ev.instanceId !== prev.instanceId) {
      changes++;
      assert.equal(new Date(prev.endsAt).getHours(), 0);
      assert.ok(prev.endsAt <= day(2026, 10, 1 + i, 0));
    }
    seen.add(ev.def.id);
    prev = ev;
  }
  assert.equal(changes, 8, '24 days = 8 festivals');
  assert.equal(seen.size, E.LIVE_EVENTS.length);
  const a = E.activeLiveEvent(day(2026, 10, 25, 0));
  assert.ok(a.endsAt > day(2026, 10, 25, 0) && a.endsAt - day(2026, 10, 25, 0) <= 3 * 86_400_000);
});

test('featured chain merges earn double, generators and chests earn nothing', () => {
  assert.equal(E.mergeEventPoints('qahwa', 4, 'qahwa'), 8);
  assert.equal(E.mergeEventPoints('oud', 4, 'qahwa'), 4);
  assert.equal(E.mergeEventPoints('chest', 3, 'qahwa'), 0);
});

test('milestones are claimed once, pay their reward and reset with the next festival', () => {
  const now = day(2026, 10, 25);
  let s = E.addEventPoints(createInitialGameState(), now, 85);
  assert.deepEqual(E.claimableMilestones(s, now), [0, 1]);
  const r = E.claimEventMilestone(s, now, 1);
  assert.ok(r.claimed);
  assert.equal(r.state.energy, s.energy + 25);
  s = r.state;
  assert.equal(E.claimEventMilestone(s, now, 1).claimed, false);
  assert.equal(E.claimEventMilestone(s, now, 2).claimed, false, 'not enough points');
  const later = E.activeLiveEvent(now).endsAt + 1000;
  assert.equal(E.eventProgress(s, later).points, 0);
  assert.deepEqual(E.claimableMilestones(s, later), []);
});
