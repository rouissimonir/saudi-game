/**
 * Rotating live events: a new three-day festival every three days, each with its own token,
 * a featured merge chain that earns double points and an eight-step milestone track.
 * Pure and date-driven, so every player sees the same festival on the same day.
 */
import { ChainId, GameState } from './rules';

export interface EventReward {
  coins?: number;
  gems?: number;
  energy?: number;
  scissors?: number;
  joker?: number;
}

export interface LiveEventDef {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  token: string;
  featuredChain: ChainId;
  /** Tailwind gradient classes for the event bar. */
  gradient: string;
}

export const LIVE_EVENTS: LiveEventDef[] = [
  {
    id: 'khawlani',
    nameAr: 'مهرجان البن الخولاني',
    nameEn: 'Khawlani Coffee Festival',
    descAr: 'دمج عناصر القهوة يمنح نقاطاً مضاعفة.',
    descEn: 'Qahwa merges earn double points.',
    token: '☕',
    featuredChain: 'qahwa',
    gradient: 'from-[#78350F] to-[#B45309]',
  },
  {
    id: 'sarram',
    nameAr: 'موسم صرام التمور',
    nameEn: 'Date Harvest Season',
    descAr: 'دمج التمور والحلويات يمنح نقاطاً مضاعفة.',
    descEn: 'Dates & sweets merges earn double points.',
    token: '🌴',
    featuredChain: 'sweets',
    gradient: 'from-[#14532D] to-[#15803D]',
  },
  {
    id: 'fawanees',
    nameAr: 'ليالي الفوانيس',
    nameEn: 'Lantern Nights',
    descAr: 'دمج العود والبخور يمنح نقاطاً مضاعفة.',
    descEn: 'Oud & bakhoor merges earn double points.',
    token: '🏮',
    featuredChain: 'oud',
    gradient: 'from-[#312E81] to-[#6D28D9]',
  },
  {
    id: 'specialty',
    nameAr: 'أسبوع القهوة المختصة',
    nameEn: 'Specialty Coffee Week',
    descAr: 'دمج أدوات الباريستا يمنح نقاطاً مضاعفة.',
    descEn: 'Barista merges earn double points.',
    token: '🫖',
    featuredChain: 'barista',
    gradient: 'from-[#0C4A6E] to-[#0369A1]',
  },
];

export const EVENT_DAYS = 3;
export const EVENT_ORDER_POINTS = 10;

export const EVENT_MILESTONES: { points: number; reward: EventReward }[] = [
  { points: 30, reward: { coins: 100 } },
  { points: 80, reward: { energy: 25 } },
  { points: 150, reward: { gems: 5 } },
  { points: 250, reward: { scissors: 1, coins: 150 } },
  { points: 380, reward: { energy: 50 } },
  { points: 540, reward: { coins: 400 } },
  { points: 740, reward: { gems: 15, joker: 1 } },
  { points: 1000, reward: { gems: 40, energy: 60 } },
];

export interface ActiveEvent {
  def: LiveEventDef;
  /** Unique per occurrence, e.g. "khawlani@6762". */
  instanceId: string;
  endsAt: number;
}

const DAY_MS = 86_400_000;

/** The festival running at `now` (local calendar days, matching the daily login and quests). */
export function activeLiveEvent(now: number): ActiveEvent {
  const d = new Date(now);
  const localDay = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS;
  const slot = Math.floor(localDay / EVENT_DAYS);
  const def = LIVE_EVENTS[slot % LIVE_EVENTS.length];
  const endsAt = new Date(1970, 0, 1 + (slot + 1) * EVENT_DAYS).getTime(); // local midnight when the slot ends
  return { def, instanceId: `${def.id}@${slot}`, endsAt };
}

export interface EventProgress {
  instanceId: string;
  points: number;
  claimed: number[];
}

/** The player's progress in the current festival; progress from an earlier festival is dropped. */
export function eventProgress(state: GameState, now: number): EventProgress {
  const { instanceId } = activeLiveEvent(now);
  const saved = state.liveEvent;
  return saved && saved.instanceId === instanceId ? saved : { instanceId, points: 0, claimed: [] };
}

export function mergeEventPoints(chain: string, resultLevel: number, featured: ChainId): number {
  if (chain === 'generator' || chain === 'chest') return 0;
  return chain === featured ? resultLevel * 2 : resultLevel;
}

export function addEventPoints(state: GameState, now: number, points: number): GameState {
  if (points <= 0) return state;
  const p = eventProgress(state, now);
  return { ...state, liveEvent: { ...p, points: p.points + points } };
}

export function claimableMilestones(state: GameState, now: number): number[] {
  const p = eventProgress(state, now);
  return EVENT_MILESTONES.map((m, i) => (p.points >= m.points && !p.claimed.includes(i) ? i : -1)).filter((i) => i >= 0);
}

export function claimEventMilestone(state: GameState, now: number, index: number): { state: GameState; claimed: boolean } {
  const m = EVENT_MILESTONES[index];
  const p = eventProgress(state, now);
  if (!m || p.points < m.points || p.claimed.includes(index)) return { state, claimed: false };
  const r = m.reward;
  return {
    state: {
      ...state,
      coins: state.coins + (r.coins ?? 0),
      diamonds: state.diamonds + (r.gems ?? 0),
      energy: state.energy + (r.energy ?? 0),
      scissorsCount: state.scissorsCount + (r.scissors ?? 0),
      jokerCount: state.jokerCount + (r.joker ?? 0),
      liveEvent: { ...p, claimed: [...p.claimed, index] },
    },
    claimed: true,
  };
}
