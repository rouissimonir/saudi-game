import type { GameState } from '../game/rules';
import { normalizeSave } from '../game/normalizeSave';

export const SAVE_KEY = 'qahwa_majlis_merge_save_v3';
export const BACKUP_KEY = `${SAVE_KEY}_backup`;
export type SaveLoadResult = { state: GameState | null; status: 'fresh' | 'loaded' | 'recovered' | 'corrupt' | 'unavailable' };

function parseSave(raw: string | null): GameState | null {
  if (!raw) return null;
  try { return normalizeSave(JSON.parse(raw)); } catch { return null; }
}

export function readSave(storage: Storage): SaveLoadResult {
  try {
    const primary = storage.getItem(SAVE_KEY);
    const backup = storage.getItem(BACKUP_KEY);
    const state = parseSave(primary);
    if (state) return { state, status: 'loaded' };
    const recovered = parseSave(backup);
    if (recovered) return { state: recovered, status: 'recovered' };
    return { state: null, status: primary !== null || backup !== null ? 'corrupt' : 'fresh' };
  } catch { return { state: null, status: 'unavailable' }; }
}

/** Back up only a valid previous primary, before replacing it. Never copy a corrupt primary over a good backup. */
export function writeSave(storage: Storage, state: GameState): boolean {
  try {
    const next = JSON.stringify(state);
    const previous = storage.getItem(SAVE_KEY);
    if (previous === next) return true;
    if (previous && parseSave(previous)) storage.setItem(BACKUP_KEY, previous);
    storage.setItem(SAVE_KEY, next);
    return true;
  } catch { return false; }
}

/** Remove backup first, so a failed reset cannot silently resurrect an old game. */
export function clearSave(storage: Storage): boolean {
  try { storage.removeItem(BACKUP_KEY); storage.removeItem(SAVE_KEY); return true; } catch { return false; }
}

export function loadSave(): SaveLoadResult {
  try { return readSave(localStorage); } catch { return { state: null, status: 'unavailable' }; }
}

export function persistSave(state: GameState): boolean {
  try { return writeSave(localStorage, state); } catch { return false; }
}

export function removeSave(): boolean {
  try { return clearSave(localStorage); } catch { return false; }
}
