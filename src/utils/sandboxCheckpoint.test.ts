import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { createInitialGameState } from '../game/rules';
import { parseSandboxCheckpoint, parseSandboxClaim } from './sandboxCheckpoint';

test('remote checkpoint must contain a valid game and a safe integer revision', () => {
  const state = createInitialGameState();
  const result = parseSandboxCheckpoint({ revision: 2, game_state: state });
  assert.equal(result.revision, 2);
  assert.equal(result.gameState.board.length, 49);
  assert.throws(() => parseSandboxCheckpoint({ revision: -1, game_state: state }));
  assert.throws(() => parseSandboxCheckpoint({ revision: 2, game_state: { ...state, board: [] } }));
  assert.throws(() => parseSandboxCheckpoint({ revision: 2, game_state: { ...state, energy: '100' } }));
});

test('claim responses must have whole amounts and an explicit replay flag', () => {
  const state = createInitialGameState();
  const valid = { revision: 3, game_state: state, energy_claimed: 120, gems_claimed: 20, already_claimed: false };
  assert.equal(parseSandboxClaim(valid).energyClaimed, 120);
  assert.equal(parseSandboxClaim({ ...valid, already_claimed: true }).alreadyClaimed, true);
  assert.throws(() => parseSandboxClaim({ ...valid, gems_claimed: -1 }));
  assert.throws(() => parseSandboxClaim({ ...valid, energy_claimed: 0.5 }));
  assert.throws(() => parseSandboxClaim({ ...valid, already_claimed: undefined }));
});
