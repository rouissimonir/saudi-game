import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState } from './rules';
import { normalizeSave } from './normalizeSave';
import { TAIF_WELCOMES, prepareTaifWelcome, taifWelcomeAvailable, taifWelcomeReflection } from './taifWelcome';

test('Taif welcome unlocks after the chapter and stays available for later or older saves', () => {
  const s = createInitialGameState();
  assert.equal(taifWelcomeAvailable(s), false);
  assert.equal(taifWelcomeAvailable({ ...s, areaIndex: 3 }), false);
  assert.equal(taifWelcomeAvailable({ ...s, areaIndex: 3, completedStoryIds: ['area_3'] }), true);
  assert.equal(taifWelcomeAvailable({ ...s, areaIndex: 4 }), true);
});

test('a welcome consumes the chosen items once and persists the memory and rewards', () => {
  for (let choice = 0; choice < TAIF_WELCOMES.length; choice++) {
    const base = createInitialGameState();
    const recipe = TAIF_WELCOMES[choice];
    const state = { ...base, areaIndex: 3, completedStoryIds: ['area_3'], board: base.board.map((c, i) => ({ ...c, itemId: i === 0 ? recipe.items[0] : i === 1 ? recipe.items[1] : null, sandLocked: false })) };
    const after = prepareTaifWelcome(state, choice);
    assert.equal(after.board[0].itemId, null);
    assert.equal(after.board[1].itemId, null);
    assert.equal(after.coins, state.coins + 150);
    assert.equal(after.energy, state.energy + 20);
    assert.equal(after.storyFlags.taif_welcome, recipe.id);
    assert.equal(prepareTaifWelcome(after, choice), after);
    assert.equal(normalizeSave(JSON.parse(JSON.stringify(after)))?.storyFlags.taif_welcome, recipe.id);
  }
});

test('the welcome cannot consume locked, missing or premature items', () => {
  const base = createInitialGameState();
  const state = { ...base, areaIndex: 3, completedStoryIds: ['area_3'], board: base.board.map((c, i) => ({ ...c, itemId: i === 0 ? 'oud_3' : i === 1 ? 'sweets_2' : null, sandLocked: i === 0 })) };
  assert.equal(prepareTaifWelcome(state, 0), state);
  const unlocked = { ...state, board: state.board.map(c => ({ ...c, sandLocked: false })) };
  assert.equal(prepareTaifWelcome({ ...unlocked, areaIndex: 2 }, 0).storyFlags.taif_welcome, undefined);
  assert.equal(prepareTaifWelcome(unlocked, 99), unlocked);
});

test('Taif reflections remember the prepared welcome and the earlier story choice', () => {
  for (const welcome of ['dates', 'coffee']) {
    for (const story of ['rose', 'pomegranate']) {
      const reflection = taifWelcomeReflection(welcome, story)!;
      assert.match(reflection.en, welcome === 'dates' ? /dates/ : /specialty coffee/);
      assert.match(reflection.en, story === 'rose' ? /grandfather’s rose-water coffee/ : /rose-and-pomegranate/);
      assert.match(reflection.ar, welcome === 'dates' ? /التمر/ : /القهوة المختصة/);
      assert.match(reflection.ar, story === 'rose' ? /فنجال جدّك/ : /الرمان/);
    }
  }
  assert.ok(taifWelcomeReflection('dates', undefined), 'older saves still have a reflection');
  assert.equal(taifWelcomeReflection(undefined, 'rose'), null);
  assert.equal(taifWelcomeReflection('unknown', 'rose'), null);
});
