import { Capacitor } from '@capacitor/core';
import { retryableInitialization } from './revenueCatTestStore';

/** The public App Store key is only used by production bundles on native iOS. */
export function canInitializeAppStore(isProduction: boolean, platform: string, key: string | undefined): boolean {
  return isProduction && platform === 'ios' && typeof key === 'string' && /^appl_[A-Za-z0-9]+$/.test(key);
}

const initialize = retryableInitialization(async () => {
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  await Purchases.configure({ apiKey: import.meta.env.VITE_REVENUECAT_IOS_KEY });
});

export function initializeRevenueCatAppStore(): Promise<void> {
  if (!import.meta.env.PROD) return Promise.resolve();
  const key = import.meta.env.VITE_REVENUECAT_IOS_KEY;
  if (!canInitializeAppStore(import.meta.env.PROD, Capacitor.getPlatform(), key)) return Promise.resolve();
  return initialize();
}
