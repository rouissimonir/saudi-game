import { Capacitor } from '@capacitor/core';

/** Test Store is only permitted in a development build running inside the iOS shell. */
export function canInitializeTestStore(isDevelopment: boolean, platform: string, key: string | undefined): boolean {
  return isDevelopment && platform === 'ios' && typeof key === 'string' && /^test_[A-Za-z0-9]+$/.test(key);
}

/** Share a running initialization, but allow a subsequent attempt after failure. */
export function retryableInitialization(start: () => Promise<void>): () => Promise<void> {
  let pending: Promise<void> | undefined;
  return () => {
    if (!pending) pending = Promise.resolve().then(start).catch(error => { pending = undefined; throw error; });
    return pending;
  };
}

const initialize = retryableInitialization(async () => {
  const { Purchases, LOG_LEVEL } = await import('@revenuecat/purchases-capacitor');
  await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
  await Purchases.configure({ apiKey: import.meta.env.VITE_REVENUECAT_TEST_KEY });
});

export function initializeRevenueCatTestStore(): Promise<void> {
  if (!import.meta.env.DEV) return Promise.resolve();
  const key = import.meta.env.VITE_REVENUECAT_TEST_KEY;
  if (!canInitializeTestStore(import.meta.env.DEV, Capacitor.getPlatform(), key)) return Promise.resolve();
  return initialize();
}
