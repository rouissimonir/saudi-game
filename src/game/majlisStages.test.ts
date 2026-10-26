import { test } from 'node:test';
import assert from 'node:assert/strict';
import { restorationStage } from './majlisStages';

test('restoration stages: ruin until two wings are done, half restored after, fully restored only at the end', () => {
  // Diriyah: 4 wings x 2 tiers = 8 levels, 3 painted stages
  const stages = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((l) => restorationStage(l, 8, 3));
  assert.deepEqual(stages, [1, 1, 1, 1, 2, 2, 2, 2, 3]);
  assert.equal(restorationStage(9, 8, 3), 3);
  assert.equal(restorationStage(5, 8, 1), 1);
  assert.equal(restorationStage(-1, 8, 3), 1);
});
