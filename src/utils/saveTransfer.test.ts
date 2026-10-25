import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exportSaveCode, importSaveCode } from './saveTransfer';
import { createInitialGameState } from '../game/rules';

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
