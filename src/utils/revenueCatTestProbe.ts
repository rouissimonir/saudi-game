import { Capacitor } from '@capacitor/core';
import { canInitializeTestStore, initializeRevenueCatTestStore } from './revenueCatTestStore';
import { inspectTestOffering, type ProbeStage } from './revenueCatProbeStages';

/** A fixed, non-sensitive stage label remains visible if simulator console forwarding fails. */
function reportProbeStage(stage: ProbeStage): void {
  const failed = ['CONFIG_FAILED', 'FETCH_FAILED', 'NO_CURRENT', 'MISSING_PACKAGES'].includes(stage);
  const marker = `QAHWA_TEST_STORE_${failed ? 'OFFERINGS_FAILED' : stage === 'STARTED' || stage === 'INELIGIBLE' ? `PROBE_${stage}` : stage}`;
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
  await inspectTestOffering(initializeRevenueCatTestStore, async () => {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const offerings = await Purchases.getOfferings();
    return offerings.current ? offerings.current.availablePackages.map(pkg => pkg.identifier) : null;
  }, reportProbeStage);
}
