import { PAID_PACKS, PaidPack, packOfferFor, packPurchaseApplied } from '../game/dailyPack';
import type { GameState } from '../game/rules';

/** The few RevenueCat shapes this file needs, so it can be tested without the native SDK. */
export interface StoreTransaction { transactionIdentifier: string; productIdentifier: string; purchaseDate: string }
export interface StorePackage { identifier: string; product: { identifier: string; priceString: string; title: string } }
export interface PackStorePort {
  listPackages(): Promise<StorePackage[]>;
  purchase(pkg: StorePackage): Promise<{ transaction: StoreTransaction }>;
  transactions(): Promise<StoreTransaction[]>;
}

export interface ListedPack { pack: PaidPack; storePackage: StorePackage; priceString: string }

/** Packs the store lists right now. Prices are always the store's own localized strings. */
export async function listedPacks(port: PackStorePort, packs: readonly PaidPack[] = PAID_PACKS): Promise<ListedPack[]> {
  const found = await port.listPackages();
  return packs.flatMap((pack) => {
    const storePackage = found.find((p) => p.product.identifier === pack.productId);
    return storePackage ? [{ pack, storePackage, priceString: storePackage.product.priceString }] : [];
  });
}

export function todaysOffer(listed: ListedPack[], dayKey: string): ListedPack | null {
  const pack = packOfferFor(dayKey, listed.map((l) => l.pack.productId), listed.map((l) => l.pack));
  return listed.find((l) => l.pack === pack) ?? null;
}

export type PurchaseOutcome =
  | { kind: 'bought'; pack: PaidPack; transactionId: string }
  | { kind: 'cancelled' }
  | { kind: 'failed' };

/** RevenueCat reports a cancelled sheet as error code "1" / userCancelled; that is not an error to show. */
export function isCancelled(error: unknown): boolean {
  const e = error as { code?: unknown; userCancelled?: boolean; data?: { userCancelled?: boolean } } | null;
  return String(e?.code) === '1' || e?.userCancelled === true || e?.data?.userCancelled === true;
}

export async function buyPack(port: PackStorePort, listed: ListedPack): Promise<PurchaseOutcome> {
  try {
    const { transaction } = await port.purchase(listed.storePackage);
    if (!transaction?.transactionIdentifier || transaction.productIdentifier !== listed.pack.productId) return { kind: 'failed' };
    return { kind: 'bought', pack: listed.pack, transactionId: transaction.transactionIdentifier };
  } catch (error) {
    return isCancelled(error) ? { kind: 'cancelled' } : { kind: 'failed' };
  }
}

/** Only recent purchases are recovered: a reinstall must not hand back a player's whole purchase history. */
export const RECOVERY_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Purchases the store charged for but this save has not received (the app closed between payment and delivery).
 * Needed because the save is local; a server ledger would replace this.
 */
export function unappliedPurchases(
  state: GameState,
  transactions: StoreTransaction[],
  now: number,
  packs: readonly PaidPack[] = PAID_PACKS
): { pack: PaidPack; transactionId: string; purchasedAt: string }[] {
  return transactions.flatMap((t) => {
    const pack = packs.find((p) => p.productId === t.productIdentifier);
    const when = Date.parse(t.purchaseDate);
    if (!pack || !t.transactionIdentifier || Number.isNaN(when) || now - when > RECOVERY_WINDOW_MS || when > now + 60_000) return [];
    return packPurchaseApplied(state, t.transactionIdentifier) ? [] : [{ pack, transactionId: t.transactionIdentifier, purchasedAt: t.purchaseDate }];
  }).sort((a, b) => a.transactionId.localeCompare(b.transactionId));
}

/** The real port. Loaded lazily so web and non-iOS bundles never touch the native SDK. */
export async function revenueCatPackPort(): Promise<PackStorePort> {
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  return {
    listPackages: async () => (await Purchases.getOfferings()).current?.availablePackages ?? [],
    purchase: async (pkg) => {
      const offerings = await Purchases.getOfferings();
      const real = offerings.current?.availablePackages.find((p) => p.identifier === pkg.identifier);
      if (!real) throw new Error('Package no longer available');
      const result = await Purchases.purchasePackage({ aPackage: real });
      return { transaction: result.transaction };
    },
    transactions: async () => (await Purchases.getCustomerInfo()).customerInfo.nonSubscriptionTransactions,
  };
}
