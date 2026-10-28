import React, { useRef, useState } from 'react';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { initializeRevenueCatTestStore } from '../utils/revenueCatTestStore';

/** Developer-only diagnostics. Test transactions do not grant game content. */
export function RevenueCatTestPanel() {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [status, setStatus] = useState('Load the test offering to begin.');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const run = async (work: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try { await initializeRevenueCatTestStore(); await work(); }
    catch (error) {
      if (typeof error === 'object' && error !== null && 'userCancelled' in error && error.userCancelled === true) setStatus('Test purchase cancelled.');
      else setStatus('Test Store request failed. Check the native debug logs and try again.');
    } finally { busyRef.current = false; setBusy(false); }
  };
  const entitlementText = (active: Record<string, unknown>) => Object.keys(active).join(', ') || 'none';

  return <section data-testid="revenuecat-test-panel" className="rounded-xl border-2 border-dashed border-amber-700 p-3 text-sm text-amber-950 space-y-2">
    <h3 className="font-black">RevenueCat Test Store — developer only</h3>
    <p>Test transactions do not grant game items or access. Consumable purchase testing is disabled until delivery is implemented.</p>
    <button type="button" disabled={busy} className="min-h-11 underline font-bold" onClick={() => void run(async () => {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const offerings = await Purchases.getOfferings();
      setPackages(offerings.current?.availablePackages ?? []);
      setStatus(offerings.current ? 'Test offering loaded.' : 'No current test offering is available.');
    })}>Load test offers</button>
    {packages.map(pkg => <div key={pkg.identifier} className="rounded-lg bg-amber-50 p-2">
      <p className="font-bold">{pkg.product.title} · {pkg.product.priceString}</p>
      {['$rc_monthly', 'decor_pack'].includes(pkg.identifier) ? <button type="button" disabled={busy} className="min-h-11 underline" onClick={() => void run(async () => {
        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        const result = await Purchases.purchasePackage({ aPackage: pkg });
        setStatus(`Test purchase completed. Active test entitlements: ${entitlementText(result.customerInfo.entitlements.active)}.`);
      })}>Test purchase</button> : <p>Purchase disabled: fulfillment is not implemented.</p>}
    </div>)}
    <button type="button" disabled={busy} className="min-h-11 underline font-bold" onClick={() => void run(async () => {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const result = await Purchases.restorePurchases();
      setStatus(`Restore finished. Active test entitlements: ${entitlementText(result.customerInfo.entitlements.active)}.`);
    })}>Restore test purchases</button>
    <p role="status">{status}</p>
  </section>;
}
