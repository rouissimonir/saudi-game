import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exportSaveCode, importSaveCode } from './saveTransfer';
import { createInitialGameState } from '../game/rules';
import { advanceArea, restoredPlaceDetails } from '../game/progression';

test('a save survives the transfer code round trip and the code stays short', async () => {
  const s = { ...createInitialGameState(), coins: 4321, areaIndex: 3 };
  const code = await exportSaveCode(s);
  assert.ok(code.startsWith('QM1.'));
  assert.ok(code.length < 6000, `code is ${code.length} chars`);
  const back = await importSaveCode(`  ${code.slice(0, 40)}\n${code.slice(40)}  `);
  assert.ok(back);
  assert.equal(back.coins, 4321);
  assert.equal(back.areaIndex, 3);
  assert.equal(back.board.length, 49);
});

test('garbage and truncated codes are rejected', async () => {
  const code = await exportSaveCode(createInitialGameState());
  assert.equal(await importSaveCode('hello'), null);
  assert.equal(await importSaveCode(code.slice(0, code.length - 30)), null);
  assert.equal(await importSaveCode('QM1.' + btoa('{"board":[]}')), null);
});

test('completed-place choices survive transfer across multiple areas', async () => {
  let state = createInitialGameState();
  for (let area = 0; area < 10; area++) {
    state = advanceArea({ ...state, renovationZones: state.renovationZones.map((zone, index) => ({ ...zone, unlockedLevel: 2, selectedStyle: index % zone.styles.length })) }).state;
  }
  const imported = await importSaveCode(await exportSaveCode(state));
  assert.ok(imported);
  assert.equal(imported.areaIndex, 10);
  for (let area = 0; area < 10; area++) {
    assert.deepEqual(restoredPlaceDetails(imported.storyFlags, area), restoredPlaceDetails(state.storyFlags, area));
    assert.ok(restoredPlaceDetails(imported.storyFlags, area));
  }
  assert.equal(restoredPlaceDetails(imported.storyFlags, 10), null);
});

test('transfer codes work without browser compression streams and stay compatible', async () => {
  const originalCompression = Object.getOwnPropertyDescriptor(globalThis, 'CompressionStream');
  const originalDecompression = Object.getOwnPropertyDescriptor(globalThis, 'DecompressionStream');
  const state = { ...createInitialGameState(), coins: 9876 };
  const browserCode = await exportSaveCode(state);
  try {
    Object.defineProperty(globalThis, 'CompressionStream', { configurable: true, value: undefined });
    Object.defineProperty(globalThis, 'DecompressionStream', { configurable: true, value: undefined });
    assert.equal((await importSaveCode(browserCode))?.coins, 9876);
    const fallbackCode = await exportSaveCode(state);
    assert.ok(fallbackCode.startsWith('QM1.'));
    assert.equal((await importSaveCode(fallbackCode))?.coins, 9876);
    if (originalDecompression) Object.defineProperty(globalThis, 'DecompressionStream', originalDecompression);
    assert.equal((await importSaveCode(fallbackCode))?.coins, 9876);
  } finally {
    if (originalCompression) Object.defineProperty(globalThis, 'CompressionStream', originalCompression);
    else Reflect.deleteProperty(globalThis, 'CompressionStream');
    if (originalDecompression) Object.defineProperty(globalThis, 'DecompressionStream', originalDecompression);
    else Reflect.deleteProperty(globalThis, 'DecompressionStream');
  }
});
