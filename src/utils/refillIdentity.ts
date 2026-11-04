/** Prototype for preparing a backend identity before a refill purchase.
 * The caller must serialize this entire operation with account changes and purchasing.
 */
export interface RefillIdentityPorts {
  validatedUserId(): Promise<string | null>;
  createGuest(): Promise<string>;
  revenueCatUserId(): Promise<string>;
  logOutRevenueCat(): Promise<void>;
  logInRevenueCat(id: string): Promise<void>;
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const anonymousPrefix = '$RCAnonymousID:';

/** Fails closed if a validated session or RevenueCat identity changes during preparation. */
export async function prepareRefillIdentity(ports: RefillIdentityPorts): Promise<string> {
  const user = await ports.validatedUserId() ?? await ports.createGuest();
  if (!uuid.test(user)) throw new Error('Invalid purchase identity');
  const desired = `qahwa:${user.toLowerCase()}`;
  const current = await ports.revenueCatUserId();
  if (current !== desired) {
    if (!current.startsWith(anonymousPrefix)) {
      await ports.logOutRevenueCat();
      const afterLogout = await ports.revenueCatUserId();
      if (!afterLogout.startsWith(anonymousPrefix)) throw new Error('Could not clear purchase identity');
    }
    await ports.logInRevenueCat(desired);
  }
  const [verifiedUser, verifiedRevenueCat] = await Promise.all([ports.validatedUserId(), ports.revenueCatUserId()]);
  if (verifiedUser?.toLowerCase() !== user.toLowerCase() || verifiedRevenueCat !== desired) throw new Error('Purchase identity changed');
  return desired;
}
