import { useSyncExternalStore } from 'react';

export interface PaidAccess { membership: boolean; decor: boolean }
const empty: PaidAccess = { membership: false, decor: false };
let access = empty;
const listeners = new Set<() => void>();
let expiryTimer: ReturnType<typeof setTimeout> | undefined;

/** Ownership is never read from a game save or transfer code. */
export function accessFromEntitlements(active: Record<string, unknown>, now = Date.now()): PaidAccess {
  const owns = (key: string) => {
    const value = active[key];
    if (!value || typeof value !== 'object') return false;
    const entitlement = value as { isActive?: boolean; expirationDate?: string | null };
    return entitlement.isActive === true && (entitlement.expirationDate === null ||
      (typeof entitlement.expirationDate === 'string' && Date.parse(entitlement.expirationDate) > now));
  };
  return { membership: owns('majlis_membership'), decor: owns('majlis_decor_pack') };
}
export function updatePaidAccess(active: Record<string, unknown>): void {
  clearTimeout(expiryTimer);
  access = accessFromEntitlements(active);
  listeners.forEach(listener => listener());
  const nextExpiry = Object.values(active).flatMap(value => {
    const date = value && typeof value === 'object' && 'expirationDate' in value ? value.expirationDate : null;
    const time = typeof date === 'string' ? Date.parse(date) : NaN;
    return time > Date.now() ? [time] : [];
  });
  if (nextExpiry.length) expiryTimer = setTimeout(() => updatePaidAccess(active), Math.min(2147483647, Math.min(...nextExpiry) - Date.now() + 10));
}
export function usePaidAccess(): PaidAccess {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => access, () => empty);
}
