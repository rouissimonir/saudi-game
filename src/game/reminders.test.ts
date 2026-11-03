import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState } from './rules';
import { REMINDER_IDS, avoidQuietHours, planReminders } from './reminders';

const at = (y: number, mo: number, d: number, h: number, mi = 0) => new Date(y, mo, d, h, mi).getTime();

test('quiet hours push a reminder to 08:30 and leave daytime alone', () => {
  assert.equal(avoidQuietHours(at(2026, 10, 3, 23, 15)), at(2026, 10, 4, 8, 30));
  assert.equal(avoidQuietHours(at(2026, 10, 3, 3, 0)), at(2026, 10, 3, 8, 30));
  assert.equal(avoidQuietHours(at(2026, 10, 3, 8, 0)), at(2026, 10, 3, 8, 0));
  assert.equal(avoidQuietHours(at(2026, 10, 3, 21, 59)), at(2026, 10, 3, 21, 59));
  assert.equal(avoidQuietHours(at(2026, 10, 3, 22, 0)), at(2026, 10, 4, 8, 30));
});

test('energy reminder fires when energy is full again, and only when it is not full yet', () => {
  const now = at(2026, 10, 3, 12, 0);
  const low = { ...createInitialGameState(), energy: 40, maxEnergy: 100, lastEnergyTick: now };
  const plan = planReminders(low, now, 'en');
  const energy = plan.find((r) => r.id === REMINDER_IDS.energy)!;
  assert.ok(energy, 'scheduled');
  assert.equal(energy.at, now + 60 * 60_000 * 1, 'sixty missing points take sixty minutes');
  const full = { ...low, energy: 100 };
  assert.equal(planReminders(full, now, 'en').some((r) => r.id === REMINDER_IDS.energy), false);
  const almost = { ...low, energy: 99, lastEnergyTick: now - 40_000 };
  assert.equal(planReminders(almost, now, 'en').some((r) => r.id === REMINDER_IDS.energy), false, 'under three minutes is not worth a notification');
});

test('daily gift and comeback reminders are in the future, in daytime and in the right order', () => {
  const now = at(2026, 10, 3, 23, 30);
  const plan = planReminders({ ...createInitialGameState(), energy: 100, maxEnergy: 100 }, now, 'ar');
  const daily = plan.find((r) => r.id === REMINDER_IDS.daily)!;
  const comeback = plan.find((r) => r.id === REMINDER_IDS.comeback)!;
  assert.ok(daily.at >= now + 2 * 60 * 60_000);
  assert.ok(new Date(daily.at).getHours() >= 8 && new Date(daily.at).getHours() < 22);
  assert.ok(comeback.at > daily.at);
  assert.ok(comeback.at - now >= 2 * 24 * 60 * 60_000 && comeback.at - now <= 4 * 24 * 60 * 60_000, '2-4 days away');
  assert.ok(new Date(comeback.at).getHours() >= 8 && new Date(comeback.at).getHours() < 22);
});

test('ids are unique and texts exist in both languages', () => {
  const state = { ...createInitialGameState(), energy: 10, maxEnergy: 100 };
  for (const lang of ['ar', 'en'] as const) {
    const plan = planReminders(state, at(2026, 10, 3, 12, 0), lang);
    assert.equal(new Set(plan.map((r) => r.id)).size, plan.length);
    for (const r of plan) assert.ok(r.title.length > 0 && r.body.length > 0);
  }
});
