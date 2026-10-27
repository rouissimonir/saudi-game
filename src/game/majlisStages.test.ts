import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MOOD_SUFFIXES, moodSuffix, restorationStage } from './majlisStages';

test('restoration stages: ruin until two wings are done, half restored after, fully restored only at the end', () => {
  // Diriyah: 4 wings x 2 tiers = 8 levels, 3 painted stages
  const stages = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((l) => restorationStage(l, 8, 3));
  assert.deepEqual(stages, [1, 1, 1, 1, 2, 2, 2, 2, 3]);
  assert.equal(restorationStage(9, 8, 3), 3);
  assert.equal(restorationStage(5, 8, 1), 1);
  assert.equal(restorationStage(-1, 8, 3), 1);
});

test('every painted stage has its image, and every area is covered', async () => {
  const { existsSync } = await import('node:fs');
  const { PAINTED_STAGES } = await import('./majlisStages');
  const { areaInfo, AREA_COUNT_BEFORE_PRESTIGE } = await import('./progression');
  for (let i = 0; i < AREA_COUNT_BEFORE_PRESTIGE; i++) assert.ok(PAINTED_STAGES[areaInfo(i).id], `${areaInfo(i).id} has painted stages`);
  for (const [id, n] of Object.entries(PAINTED_STAGES)) {
    for (let i = 1; i <= n; i++) {
      for (const m of MOOD_SUFFIXES) assert.ok(existsSync(`public/assets/art/majlis/${id}_${i}${m}.webp`), `${id}_${i}${m}.webp`);
    }
  }
});

test('each Majlis ambiance chip maps to its painted mood', () => {
  assert.equal(moodSuffix('afternoon'), '');
  assert.equal(moodSuffix('ramadan_night'), '_night');
  assert.equal(moodSuffix('courtyard_rain'), '_rain');
});
