import { msUntilEnergyFull } from './progression';
import type { GameState, Language } from './rules';

/** One local notification to schedule. Ids are fixed so that re-planning replaces the old ones. */
export interface Reminder {
  id: number;
  at: number;
  title: string;
  body: string;
}

export const REMINDER_IDS = { energy: 1001, daily: 1002, comeback: 1003 } as const;
const MINUTE = 60_000;
const QUIET_FROM_HOUR = 22;
const QUIET_UNTIL_HOUR = 8;

/** Never wake anyone at night: a time between 22:00 and 08:00 moves to 08:30. */
export function avoidQuietHours(at: number): number {
  const d = new Date(at);
  const hour = d.getHours();
  if (hour >= QUIET_FROM_HOUR) return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, QUIET_UNTIL_HOUR, 30).getTime();
  if (hour < QUIET_UNTIL_HOUR) return new Date(d.getFullYear(), d.getMonth(), d.getDate(), QUIET_UNTIL_HOUR, 30).getTime();
  return at;
}

function nextLocalTime(now: number, hour: number, minGapMs: number): number {
  const d = new Date(now);
  let at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, 0).getTime();
  while (at < now + minGapMs) at += 24 * 60 * MINUTE;
  return new Date(at).getTime();
}

const TEXT: Record<Language, { energy: [string, string]; daily: [string, string]; comeback: [string, string] }> = {
  ar: {
    energy: ['قهوتك جاهزة ☕', 'اكتملت طاقتك والضيوف بانتظارك.'],
    daily: ['هديتك اليومية 🎁', 'غبقة اليوم بانتظارك، تفضّل استلمها.'],
    comeback: ['اشتقنا لك!', 'مجلسك ينتظرك والضيوف جاهزون للقهوة.'],
  },
  en: {
    energy: ['Your coffee is ready ☕', 'Your energy is full and guests are waiting.'],
    daily: ['Your daily gift 🎁', "Today's Ghabga gift is waiting for you."],
    comeback: ['We miss you!', 'Your Majlis is waiting and your guests are ready for coffee.'],
  },
};

/**
 * What to remind the player about while the game is closed: energy full again (only if it is not already), the next
 * daily gift, and a gentle "come back" after three quiet days. Always replaced as a set, never stacked.
 */
export function planReminders(state: GameState, now: number, lang: Language): Reminder[] {
  const text = TEXT[lang];
  const out: Reminder[] = [];
  const untilFull = msUntilEnergyFull(state, now);
  if (untilFull !== null && untilFull >= 3 * MINUTE) {
    out.push({ id: REMINDER_IDS.energy, at: avoidQuietHours(now + untilFull), title: text.energy[0], body: text.energy[1] });
  }
  out.push({ id: REMINDER_IDS.daily, at: avoidQuietHours(nextLocalTime(now, 10, 2 * 60 * MINUTE)), title: text.daily[0], body: text.daily[1] });
  out.push({ id: REMINDER_IDS.comeback, at: avoidQuietHours(nextLocalTime(now + 3 * 24 * 60 * MINUTE - 24 * 60 * MINUTE, 18, 24 * 60 * MINUTE)), title: text.comeback[0], body: text.comeback[1] });
  return out;
}
