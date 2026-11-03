import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState } from './rules';
import { normalizeSave } from './normalizeSave';
import { ACHIEVEMENTS, achievementRows, claimAchievement, claimableAchievements } from './achievements';

test('ids are unique and every target is reachable and rewarded', () => {
  assert.equal(new Set(ACHIEVEMENTS.map((a) => a.id)).size, ACHIEVEMENTS.length);
  for (const a of ACHIEVEMENTS) {
    assert.ok(a.target > 0 && a.reward.gems > 0 && a.reward.coins > 0, a.id);
    assert.ok(a.titleAr && a.titleEn && a.descAr && a.descEn, a.id);
  }
});

test('a fresh game has nothing to claim, progress is capped at the target', () => {
  const state = createInitialGameState();
  assert.equal(claimableAchievements(state), 0);
  const rich = { ...state, ordersCompleted: 9999 };
  const row = achievementRows(rich).find((r) => r.def.id === 'guests_5')!;
  assert.equal(row.progress, 5);
  assert.equal(row.done, true);
});

test('claiming pays once and only when finished', () => {
  const base = { ...createInitialGameState(), ordersCompleted: 6 };
  const early = claimAchievement(base, 'guests_25');
  assert.equal(early.claimed, false);
  assert.equal(early.state, base);
  const first = claimAchievement(base, 'guests_5');
  assert.equal(first.claimed, true);
  assert.equal(first.state.diamonds, base.diamonds + 5);
  assert.equal(first.state.coins, base.coins + 100);
  assert.deepEqual(first.state.claimedAchievements, ['guests_5']);
  const again = claimAchievement(first.state, 'guests_5');
  assert.equal(again.claimed, false);
  assert.equal(again.state.diamonds, first.state.diamonds);
  assert.equal(claimAchievement(base, 'no_such').claimed, false);
});

test('old saves without the field load with nothing claimed, and a bad field is rejected', () => {
  const state = createInitialGameState();
  const { claimedAchievements: _omit, ...legacy } = state;
  assert.deepEqual(normalizeSave(legacy)?.claimedAchievements, []);
  assert.equal(normalizeSave({ ...state, claimedAchievements: 'nope' }), null);
});
