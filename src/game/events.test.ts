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
  // A local calendar day can be 23 or 25 hours across a daylight-saving change.
  const latestEnd = new Date(2026, 9, 25);
  latestEnd.setDate(latestEnd.getDate() + 3);
  assert.ok(a.endsAt > day(2026, 10, 25, 0) && a.endsAt <= latestEnd.getTime());
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

test('unclaimed earned milestones are delivered once when a player returns after a festival', () => {
  const now = day(2026, 10, 25);
  let state = E.addEventPoints(createInitialGameState(), now, 160);
  state = E.claimEventMilestone(state, now, 0).state;
  const later = E.activeLiveEvent(now).endsAt + 1000;
  const delivered = E.settleExpiredEvent(state, later);
  assert.equal(delivered.coins, state.coins, 'the claimed coin milestone is not paid twice');
  assert.equal(delivered.energy, state.energy + 25);
  assert.equal(delivered.diamonds, state.diamonds + 5);
  assert.deepEqual(delivered.festivalDelivery, { milestones: 2, coins: 0, gems: 5, energy: 25, scissors: 0, joker: 0 });
  assert.equal(E.eventProgress(delivered, later).points, 0);
  assert.equal(E.settleExpiredEvent(delivered, later), delivered);
  const afterMerge = E.addEventPoints(state, later, 3);
  assert.equal(afterMerge.energy, delivered.energy);
  assert.equal(E.eventProgress(afterMerge, later).points, 3);
});

test('festival delivery survives further rollovers and a backward clock does not erase progress', () => {
  const now = day(2026, 10, 25);
  const state = E.addEventPoints(createInitialGameState(), now, 30);
  const later = E.activeLiveEvent(now).endsAt + 1000;
  const first = E.settleExpiredEvent(state, later);
  const withNewPoints = E.addEventPoints(first, later, 80);
  const final = E.settleExpiredEvent(withNewPoints, E.activeLiveEvent(later).endsAt + 1000);
  assert.equal(final.festivalDelivery?.milestones, 3);
  assert.equal(final.festivalDelivery?.coins, 200);
  assert.equal(final.festivalDelivery?.energy, 25);
  assert.equal(E.addEventPoints(state, now - 10 * 86_400_000, 10), state);
});
