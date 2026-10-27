import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState } from './rules';
import { gatheringReaction, hostTasting, prepareTastingTray, setTastingStyle } from './tasting';
import { normalizeSave } from './normalizeSave';

test('tasting consumes only unlocked recipe items, persists choices, and pays once', () => {
  let state = createInitialGameState();
  state.board = state.board.map((c, i) => ({ ...c, itemId: i === 0 ? 'qahwa_2' : i === 1 ? 'sweets_2' : i === 2 ? 'barista_2' : i === 3 ? 'sweets_1' : null, sandLocked: false }));
  assert.equal(hostTasting(state), state);
  assert.equal(setTastingStyle(state, 'warm'), state);
  state = prepareTastingTray(state, 0, 0);
  assert.equal(state.board[0].itemId, null);
  assert.equal(state.board[1].itemId, null);
  assert.equal(prepareTastingTray(state, 0, 1), state);
  state = prepareTastingTray(state, 1, 0);
  assert.equal(setTastingStyle(state, 'invalid'), state);
  state = setTastingStyle(state, 'green');
  const restored = normalizeSave(JSON.parse(JSON.stringify(state)));
  assert.ok(restored);
  assert.equal(restored.storyFlags.tasting_style, 'green');
  const result = hostTasting(restored);
  assert.equal(result.coins, restored.coins + 150);
  assert.equal(result.diamonds, restored.diamonds + 5);
  assert.equal(hostTasting(result), result);
  const redesigned = setTastingStyle(result, 'rose');
  assert.equal(redesigned.storyFlags.tasting_style, 'rose');
  assert.equal(redesigned.coins, result.coins);
  assert.equal(hostTasting(redesigned), redesigned);
});

test('missing or sand-locked items cannot be consumed', () => {
  const state = createInitialGameState();
  state.board = state.board.map((c, i) => ({ ...c, itemId: i === 0 ? 'qahwa_2' : i === 1 ? 'sweets_2' : null, sandLocked: i === 1 }));
  assert.equal(prepareTastingTray(state, 0, 0), state);
  assert.equal(state.board[0].itemId, 'qahwa_2');
});

test('guests respond to the chosen trays only after the gathering', () => {
  assert.equal(gatheringReaction({ tasting_tray_0: 'traditional' }, 'faisal'), null);
  const flags = { tasting_complete: 'yes', tasting_tray_0: 'traditional', tasting_tray_1: 'fragrant' };
  assert.match(gatheringReaction(flags, 'faisal')!.en, /Coffee and dates/);
  assert.match(gatheringReaction(flags, 'noura')!.en, /oud/);
  assert.match(gatheringReaction({ ...flags, tasting_tray_0: 'modern' }, 'faisal')!.en, /Specialty coffee/);
  assert.match(gatheringReaction({ ...flags, tasting_tray_1: 'sweet' }, 'noura')!.en, /Fresh dates/);
  assert.equal(gatheringReaction({ ...flags, tasting_tray_0: 'invalid' }, 'faisal'), null);
});

// A selected recipe remains the player's active goal across saves and disappears once prepared.
test('hospitality focus survives saves and ignores completed or invalid recipes', async () => {
  const { hospitalityFocus, setHospitalityFocus } = await import('./hospitalityFocus');
  const state = createInitialGameState();
  const goal = { kind: 'tasting' as const, items: ['qahwa_2', 'sweets_2'], nameAr: 'ignored', nameEn: 'ignored' };
  const focused = setHospitalityFocus(state, goal);
  const loaded = normalizeSave(JSON.parse(JSON.stringify(focused)))!;
  assert.equal(hospitalityFocus(loaded)?.nameEn, 'Coffee and dates');
  assert.deepEqual(hospitalityFocus(loaded)?.items, goal.items);
  assert.equal(hospitalityFocus({ ...loaded, storyFlags: { ...loaded.storyFlags, tasting_tray_0: 'traditional' } }), null);
  assert.equal(hospitalityFocus({ ...loaded, storyFlags: { ...loaded.storyFlags, hospitality_focus: 'tasting:unknown' } }), null);
  assert.equal(hospitalityFocus(setHospitalityFocus(loaded, null)), null);
  const invalid = setHospitalityFocus(state, { ...goal, items: ['unknown'] });
  assert.equal(invalid, state);
  const taif = { kind: 'taif' as const, items: ['oud_3', 'sweets_2'], nameAr: '', nameEn: '' };
  assert.equal(setHospitalityFocus(state, taif), state, 'Taif focus is unavailable before its story');
  const later = setHospitalityFocus({ ...state, areaIndex: 4 }, taif);
  assert.equal(hospitalityFocus(normalizeSave(JSON.parse(JSON.stringify(later)))!)?.nameEn, 'Rose scent and dates');
  assert.equal(hospitalityFocus({ ...later, storyFlags: { ...later.storyFlags, taif_welcome: 'dates' } }), null);
});

test('preparing a different tray preserves the focused hospitality recipe', async () => {
  const { hospitalityFocus, setHospitalityFocus } = await import('./hospitalityFocus');
  let state = createInitialGameState();
  state.board = state.board.map((cell, index) => ({ ...cell, itemId: index === 0 ? 'qahwa_2' : index === 1 ? 'sweets_2' : null, sandLocked: false }));
  state = setHospitalityFocus(state, { kind: 'tasting', items: ['barista_2', 'sweets_1'], nameAr: '', nameEn: '' });
  const prepared = prepareTastingTray(state, 0, 0);
  assert.equal(prepared.storyFlags.tasting_tray_0, 'traditional');
  assert.equal(hospitalityFocus(prepared)?.nameEn, 'Coffee and fresh dates');
  const loaded = normalizeSave(JSON.parse(JSON.stringify(prepared)))!;
  assert.equal(hospitalityFocus(loaded)?.nameEn, 'Coffee and fresh dates');
  const withItems = { ...loaded, board: loaded.board.map((cell, i) => i === 0 ? { ...cell, itemId: 'barista_2' } : i === 1 ? { ...cell, itemId: 'sweets_1' } : cell) };
  assert.equal(hospitalityFocus(prepareTastingTray(withItems, 1, 0)), null);
});
