import type { GameState } from './rules';

export const APP_STORE_ID = '6827965054';
export const WRITE_REVIEW_URL = `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`;
const KEY = 'qahwa_rate';
const REASK_MS = 14 * 24 * 60 * 60_000;
const MAX_ASKS = 2;

/** What the player already told us: how many times we asked, when last, and whether they rated. */
export interface RateRecord {
  asks: number;
  lastAskAt: number;
  done: boolean;
}

export function readRateRecord(storage: Pick<Storage, 'getItem'> = localStorage): RateRecord {
  try {
    const parsed = JSON.parse(storage.getItem(KEY) ?? 'null') as Partial<RateRecord> | null;
    if (parsed && typeof parsed.asks === 'number' && typeof parsed.lastAskAt === 'number') return { asks: parsed.asks, lastAskAt: parsed.lastAskAt, done: parsed.done === true };
  } catch { /* fall through */ }
  return { asks: 0, lastAskAt: 0, done: false };
}

export function writeRateRecord(record: RateRecord, storage: Pick<Storage, 'setItem'> = localStorage): void {
  try { storage.setItem(KEY, JSON.stringify(record)); } catch { /* a missed note is harmless */ }
}

/**
 * Ask for a rating only at a happy, settled moment: a player who has welcomed several guests and passed level 4,
 * never twice in two weeks, never after they rated, and at most twice in total.
 */
export function shouldAskForRating(state: GameState, record: RateRecord, now: number, enabled: boolean): boolean {
  if (!enabled || record.done || record.asks >= MAX_ASKS) return false;
  if (record.asks > 0 && now - record.lastAskAt < REASK_MS) return false;
  return state.level >= 4 && state.ordersCompleted >= 10;
}
