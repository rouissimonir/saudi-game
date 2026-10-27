import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rotationForWedge } from './wheelRotation';

test('each awarded wedge lands at the pointer, including after earlier spins', () => {
  let angle = 0;
  for (const index of [0, 5, 2, 2, 1, 4, 3]) {
    const previous = angle;
    angle = rotationForWedge(previous, index, 6);
    assert.ok(angle >= previous + 720);
    assert.equal((angle + index * 60 + 30) % 360, 0);
  }
});
