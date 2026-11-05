import type { SupabaseClient } from '@supabase/supabase-js';
import type { GameState } from '../game/rules';
import { normalizeSave } from '../game/normalizeSave';

export interface SandboxCheckpoint { revision: number; gameState: GameState }
export interface SandboxClaim extends SandboxCheckpoint { energyClaimed: number; gemsClaimed: number; alreadyClaimed: boolean }
export class CheckpointConflict extends Error {}
export class CheckpointAccountChanged extends Error {}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const wholeNumber = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const object = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));

/** Validate before allowing any remote response to be offered to the save system. */
export function parseSandboxCheckpoint(value: unknown): SandboxCheckpoint {
  if (!object(value) || !wholeNumber(value.revision)) throw new Error('Invalid checkpoint response');
  // normalizeSave fills missing fields for old local saves. A purchase checkpoint
  // must explicitly contain both balances so a damaged response cannot reset them.
  if (!object(value.game_state) || !wholeNumber(value.game_state.energy) || !wholeNumber(value.game_state.diamonds)) throw new Error('Invalid game checkpoint');
  const gameState = normalizeSave(value.game_state);
  if (!gameState || !wholeNumber(gameState.energy) || !wholeNumber(gameState.diamonds)) throw new Error('Invalid game checkpoint');
  return { revision: value.revision, gameState };
}

export function parseSandboxClaim(value: unknown): SandboxClaim {
  const checkpoint = parseSandboxCheckpoint(value);
  if (!object(value) || !wholeNumber(value.energy_claimed) || !wholeNumber(value.gems_claimed) || typeof value.already_claimed !== 'boolean') throw new Error('Invalid claim response');
  return { ...checkpoint, energyClaimed: value.energy_claimed, gemsClaimed: value.gems_claimed, alreadyClaimed: value.already_claimed };
}

/** These operations never mutate local saves. The caller must resolve conflicts and persist claim IDs before sending. */
export function sandboxCheckpointClient(client: SupabaseClient) {
  const checkAccount = async (userId: string) => {
    if (!uuid.test(userId)) throw new CheckpointAccountChanged('Invalid account');
    const { data, error } = await client.auth.getUser();
    if (error || data.user?.id.toLowerCase() !== userId.toLowerCase()) throw new CheckpointAccountChanged('Account unavailable or changed');
  };
  const validateRevision = (revision: number) => { if (!wholeNumber(revision)) throw new Error('Invalid checkpoint revision'); };
  const throwRpcError = (error: { code?: string } | null) => {
    if (!error) return;
    if (error.code === '40001') throw new CheckpointConflict('Checkpoint changed on another device');
    throw new Error('Checkpoint request failed');
  };
  return {
    async load(userId: string): Promise<SandboxCheckpoint | null> {
      await checkAccount(userId);
      const { data, error } = await client.from('sandbox_game_checkpoints').select('revision,game_state').eq('user_id', userId).maybeSingle();
      throwRpcError(error);
      await checkAccount(userId);
      return data === null ? null : parseSandboxCheckpoint(data);
    },
    async save(userId: string, revision: number, state: GameState): Promise<SandboxCheckpoint> {
      validateRevision(revision);
      const checked = normalizeSave(state);
      if (!checked || !wholeNumber(checked.energy) || !wholeNumber(checked.diamonds)) throw new Error('Invalid game checkpoint');
      await checkAccount(userId);
      const { data, error } = await client.rpc('save_sandbox_checkpoint_bound', { p_user: userId, p_expected_revision: revision, p_state: checked });
      throwRpcError(error);
      await checkAccount(userId);
      if (!Array.isArray(data) || data.length !== 1) throw new Error('Invalid checkpoint response');
      return parseSandboxCheckpoint(data[0]);
    },
    async claim(userId: string, revision: number, claimId: string): Promise<SandboxClaim> {
      validateRevision(revision);
      if (!uuid.test(claimId)) throw new Error('Invalid claim ID');
      await checkAccount(userId);
      const { data, error } = await client.rpc('claim_sandbox_wallet_bound', { p_user: userId, p_expected_revision: revision, p_claim_id: claimId });
      throwRpcError(error);
      await checkAccount(userId);
      if (!Array.isArray(data) || data.length !== 1) throw new Error('Invalid claim response');
      return parseSandboxClaim(data[0]);
    },
  };
}
