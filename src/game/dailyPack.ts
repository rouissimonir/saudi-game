import { GameState } from './rules';

/**
 * Paid packs. Contents are fixed and shown before purchase (no random rewards).
 * `productId` is the App Store product; a pack is only offered when the store actually lists it,
 * so adding a pack here before its product exists changes nothing for players.
 */
export interface PaidPack {
  id: string;
  productId: string;
  nameAr: string;
  nameEn: string;
  energy: number;
  gems: number;
  coins: number;
}

export const PAID_PACKS: readonly PaidPack[] = [
  // The one App Store product that exists today (SAR 4.99, repeatable). Amounts are a first guess to be tuned from play data.
  { id: 'refill', productId: 'sa.qahwamajlis.energy.refill', nameAr: 'حقيبة الضيافة', nameEn: 'Hospitality refill', energy: 100, gems: 30, coins: 0 },
];

/** Most recent transaction IDs kept in the save; Apple IDs are unique, so this only has to outlast retries and restores. */
export const MAX_REMEMBERED_TRANSACTIONS = 200;

function dayNumber(dayKey: string): number {
  const t = Date.parse(`${dayKey}T00:00:00Z`);
  return Number.isNaN(t) ? 0 : Math.floor(t / 86_400_000);
}

/** Today's pack among those the store currently lists. Rotates by calendar day; null when none is for sale. */
export function packOfferFor(dayKey: string, listedProductIds: readonly string[], packs: readonly PaidPack[] = PAID_PACKS): PaidPack | null {
  const available = packs.filter((p) => listedProductIds.includes(p.productId));
  if (available.length === 0) return null;
  return available[((dayNumber(dayKey) % available.length) + available.length) % available.length];
}

/** The offer pops up once a day, after the login gift; closing it does not spend anything. */
export function packOfferDue(state: GameState, shownDay: string, dayKey: string): boolean {
  return shownDay !== dayKey && state.packBoughtDay !== dayKey;
}

export function packPurchaseApplied(state: GameState, transactionId: string): boolean {
  return state.packTransactions.includes(transactionId);
}

/** Adds a purchased pack once per store transaction; `dayKey` is the day it was bought. Repeats (retry, restore, relaunch) leave the save unchanged. */
export function applyPackPurchase(
  state: GameState,
  pack: PaidPack,
  transactionId: string,
  dayKey: string
): { state: GameState; applied: boolean } {
  if (!transactionId || packPurchaseApplied(state, transactionId)) return { state, applied: false };
  return {
    state: {
      ...state,
      energy: state.energy + pack.energy,
      diamonds: state.diamonds + pack.gems,
      coins: state.coins + pack.coins,
      packTransactions: [...state.packTransactions, transactionId].slice(-MAX_REMEMBERED_TRANSACTIONS),
      // A recovered purchase from an earlier day must not hide, or overwrite, a later day's record.
      packBoughtDay: dayKey > state.packBoughtDay ? dayKey : state.packBoughtDay,
    },
    applied: true,
  };
}
