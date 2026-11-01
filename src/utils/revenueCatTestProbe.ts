import { Capacitor } from '@capacitor/core';
import { canInitializeTestStore, initializeRevenueCatTestStore } from './revenueCatTestStore';

type ProbeStage = 'STARTED' | 'INELIGIBLE' | 'INITIALIZED' | 'OFFERINGS_OK' | 'OFFERINGS_FAILED';

/** A fixed, non-sensitive stage label remains visible if simulator console forwarding fails. */
function reportProbeStage(stage: ProbeStage): void {
  const marker = `QAHWA_TEST_STORE_${stage === 'STARTED' || stage === 'INELIGIBLE' ? `PROBE_${stage}` : stage}`;
  console.log(marker);
  const badge = document.getElementById('revenuecat-ci-probe') ?? document.createElement('div');
  badge.id = 'revenuecat-ci-probe';
  badge.textContent = `RC TEST: ${stage}`;
  badge.setAttribute('style', 'position:fixed;z-index:2147483647;bottom:10px;left:10px;background:#fff;color:#000;padding:8px;font:700 18px sans-serif');
  if (!badge.isConnected) document.body.appendChild(badge);
}

/** CI-only diagnostics: read offerings, never initiate a transaction. */
export async function probeRevenueCatTestStore(): Promise<void> {
  if (!import.meta.env.DEV || import.meta.env.VITE_REVENUECAT_TEST_PROBE !== '1') return;
  reportProbeStage('STARTED');
  if (!canInitializeTestStore(true, Capacitor.getPlatform(), import.meta.env.VITE_REVENUECAT_TEST_KEY)) {
    reportProbeStage('INELIGIBLE');
    return;
  }
  try {
    await initializeRevenueCatTestStore();
    reportProbeStage('INITIALIZED');
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const offerings = await Purchases.getOfferings();
    const ids = new Set(offerings.current?.availablePackages.map(pkg => pkg.identifier) ?? []);
    if (!['$rc_monthly', 'starter_pack', 'decor_pack'].every(id => ids.has(id))) throw new Error('Expected test packages missing');
    reportProbeStage('OFFERINGS_OK');
  } catch {
    reportProbeStage('OFFERINGS_FAILED');
  }
}
