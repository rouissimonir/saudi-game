import { findCellsForOrder, type GameState } from './rules';

export const WELCOME_BACK_MIN_MS = 20 * 60 * 1000;
const PRESENCE_KEY = 'qahwa_presence';

/** What the game looked like when the player last left, kept outside the save so it never needs a migration. */
export interface PresenceSnapshot {
  at: number;
  energy: number;
}

export interface WelcomeBack {
  minutesAway: number;
  energyGained: number;
  readyOrders: number;
}

/** A short "welcome back" only when the player was away a while and there is something worth saying. */
export function welcomeBackSummary(snapshot: PresenceSnapshot | null, now: number, state: GameState): WelcomeBack | null {
  if (!snapshot || !Number.isFinite(snapshot.at) || now - snapshot.at < WELCOME_BACK_MIN_MS) return null;
  const energyGained = Math.max(0, Math.floor(state.energy - (Number.isFinite(snapshot.energy) ? snapshot.energy : state.energy)));
  const readyOrders = state.activeOrders.filter((order) => findCellsForOrder(state.board, order.requiredItemIds) !== null).length;
  if (energyGained === 0 && readyOrders === 0) return null;
  return { minutesAway: Math.floor((now - snapshot.at) / 60_000), energyGained, readyOrders };
}

export function readPresence(storage: Pick<Storage, 'getItem'> = localStorage): PresenceSnapshot | null {
  try {
    const raw = storage.getItem(PRESENCE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PresenceSnapshot>;
    return typeof parsed.at === 'number' && typeof parsed.energy === 'number' ? { at: parsed.at, energy: parsed.energy } : null;
  } catch { return null; }
}

export function writePresence(snapshot: PresenceSnapshot, storage: Pick<Storage, 'setItem'> = localStorage): void {
  try { storage.setItem(PRESENCE_KEY, JSON.stringify(snapshot)); } catch { /* optional convenience */ }
}
