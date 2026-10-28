import { Capacitor } from '@capacitor/core';

/** Test Store is only permitted in a development build running inside the iOS shell. */
export function canInitializeTestStore(isDevelopment: boolean, platform: string, key: string | undefined): boolean {
  return isDevelopment && platform === 'ios' && typeof key === 'string' && /^test_[A-Za-z0-9]+$/.test(key);
}

let initialization: Promise<void> | undefined;

export function initializeRevenueCatTestStore(): Promise<void> {
  if (!import.meta.env.DEV) return Promise.resolve();
  const key = import.meta.env.VITE_REVENUECAT_TEST_KEY;
  if (!canInitializeTestStore(import.meta.env.DEV, Capacitor.getPlatform(), key)) return Promise.resolve();
  if (!initialization) {
    initialization = import('@revenuecat/purchases-capacitor')
      .then(async ({ Purchases, LOG_LEVEL }) => {
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
        await Purchases.configure({ apiKey: key });
      })
      .catch(() => {
        // Store setup must never prevent a player from opening the game.
        console.warn('RevenueCat Test Store initialization failed.');
      });
  }
  return initialization;
}
