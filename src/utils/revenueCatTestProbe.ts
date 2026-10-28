import { Capacitor } from '@capacitor/core';
import { canInitializeTestStore, initializeRevenueCatTestStore } from './revenueCatTestStore';

/** CI-only diagnostics: read offerings, never initiate a transaction. */
export async function probeRevenueCatTestStore(): Promise<void> {
  if (!import.meta.env.DEV || import.meta.env.VITE_REVENUECAT_TEST_PROBE !== '1') return;
  console.log('QAHWA_TEST_STORE_PROBE_STARTED');
  if (!canInitializeTestStore(true, Capacitor.getPlatform(), import.meta.env.VITE_REVENUECAT_TEST_KEY)) {
    console.error('QAHWA_TEST_STORE_PROBE_INELIGIBLE');
    return;
  }
  try {
    await initializeRevenueCatTestStore();
    console.log('QAHWA_TEST_STORE_INITIALIZED');
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const offerings = await Purchases.getOfferings();
    const ids = new Set(offerings.current?.availablePackages.map(pkg => pkg.identifier) ?? []);
    if (!['$rc_monthly', 'starter_pack', 'decor_pack'].every(id => ids.has(id))) throw new Error('Expected test packages missing');
    console.log('QAHWA_TEST_STORE_OFFERINGS_OK');
  } catch {
    console.error('QAHWA_TEST_STORE_OFFERINGS_FAILED');
  }
}
