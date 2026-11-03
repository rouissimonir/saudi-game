import React, { lazy, Suspense, useRef, useState } from 'react';
import { registerPlugin } from '@capacitor/core';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { initializeRevenueCatAppStore } from '../utils/revenueCatAppStore';
import type { Language } from '../game/rules';
import { updatePaidAccess, usePaidAccess } from '../utils/paidAccess';
import { PaidMajlisDecor } from './PaidMajlisDecor';
const PurchaseAccountPanel = lazy(() => import('./PurchaseAccountPanel').then(module => ({ default: module.PurchaseAccountPanel })));

const SandboxCheck = registerPlugin<{ check(): Promise<{ isSandbox: boolean }> }>('SandboxCheck');

/** Explicitly enabled TestFlight diagnostics; never grants game items or access. */
export function AppleSandboxPurchasePanel({ lang }: { lang: Language }) {
  const ar = lang === 'ar';
  const access = usePaidAccess();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const run = async (work: () => Promise<void>) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setStatus('');
    try {
      if (!(await SandboxCheck.check()).isSandbox) {
        setStatus(ar ? 'تعذّر تأكيد بيئة الاختبار. لم تتم أي عملية.' : 'Could not confirm the sandbox environment. No transaction was attempted.');
        return;
      }
      await initializeRevenueCatAppStore();
      await work();
    } catch (error) {
      const e = error as { code?: unknown; userCancelled?: boolean; data?: { userCancelled?: boolean } } | null;
      if (String(e?.code) !== '1' && !e?.userCancelled && !e?.data?.userCancelled) {
        setStatus(ar ? 'تعذّر إكمال الاختبار. حاولي مرة أخرى.' : 'The test could not be completed. Please try again.');
      }
    } finally { inFlight.current = false; setBusy(false); }
  };
  return <section data-testid="apple-sandbox-purchases" className="rounded-2xl border-2 border-dashed border-amber-700 bg-amber-50 p-3 text-sm text-amber-950 space-y-2">
    <h3 className="font-black">{ar ? 'اختبار مشتريات TestFlight' : 'TestFlight purchase test'}</h3>
    <p>{ar ? 'مشتريات تجريبية عبر Apple. الزينة تظهر في المجلس بعد تأكيد الاستحقاق.' : 'Apple sandbox purchases. Decorations appear in your Majlis after entitlement confirmation.'}</p>
    <PaidMajlisDecor lang={lang} preview />
    <Suspense fallback={<p role="status">{ar ? 'جارٍ التحميل…' : 'Loading…'}</p>}><PurchaseAccountPanel lang={lang} /></Suspense>
    {(access.decor || access.membership) && <p role="status">{ar ? 'الزينة متاحة الآن في المجلس.' : 'Your decoration corner is now available in the Majlis.'}</p>}
    <button type="button" disabled={busy} className="min-h-11 underline font-bold" onClick={() => void run(async () => {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const offerings = await Purchases.getOfferings();
      const available = offerings.current?.availablePackages.filter(pkg => ['$rc_monthly', 'decor_pack'].includes(pkg.identifier)) ?? [];
      setPackages(available);
      setStatus(available.length ? '' : (ar ? 'لا توجد عروض متاحة للاختبار حالياً.' : 'No test offers are available right now.'));
    })}>{ar ? 'عرض منتجات الاختبار' : 'Load test products'}</button>
    {packages.map(pkg => <div key={pkg.identifier} className="rounded-xl bg-white p-2">
      <p className="font-bold">{pkg.product.title} · {pkg.product.priceString}</p>
      <p>{pkg.identifier === '$rc_monthly'
        ? (ar ? 'ألوان ركن الضيافة متاحة طوال مدة الاشتراك. لا تتضمن طاقة أو جواهر.' : 'Access to the hospitality corner palettes while subscribed. Includes no energy or gems.')
        : (ar ? 'ألوان ركن الضيافة الثلاثة بشكل دائم. شراء لمرة واحدة.' : 'All three hospitality corner palettes permanently. One-time purchase.')}</p>
      {pkg.identifier === '$rc_monthly' && <p>{ar ? 'اشتراك شهري تجريبي يتجدد تلقائياً في بيئة الاختبار.' : 'Monthly test subscription; renews automatically in the sandbox.'}</p>}
      <button type="button" disabled={busy || (pkg.identifier === '$rc_monthly' ? access.membership : access.decor)} className="min-h-11 underline font-bold disabled:opacity-50" onClick={() => void run(async () => {
        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        const result = await Purchases.purchasePackage({ aPackage: pkg });
        updatePaidAccess(result.customerInfo.entitlements.active);
        const entitlement = pkg.identifier === '$rc_monthly' ? 'majlis_membership' : 'majlis_decor_pack';
        setStatus(result.customerInfo.entitlements.active[entitlement]
          ? (ar ? 'تم تأكيد الشراء. الزينة متاحة في المجلس.' : 'Purchase confirmed. Decorations are available in your Majlis.')
          : (ar ? 'لم يتم تأكيد الاستحقاق بعد. لا توجد مزايا داخل اللعبة.' : 'The entitlement is not confirmed yet. No game benefits are delivered.'));
      })}>{(pkg.identifier === '$rc_monthly' ? access.membership : access.decor) ? (ar ? 'مفعّلة' : 'Active') : (ar ? 'اختبار الشراء' : 'Test purchase')}</button>
    </div>)}
    <button type="button" disabled={busy} className="min-h-11 underline font-bold" onClick={() => void run(async () => {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const result = await Purchases.restorePurchases();
      const active = result.customerInfo.entitlements.active;
      updatePaidAccess(active);
      setStatus(active.majlis_membership || active.majlis_decor_pack
        ? (ar ? 'تم تأكيد استحقاق اختبار قابل للاستعادة.' : 'A restorable test entitlement is active.')
        : (ar ? 'لم يتم العثور على استحقاقات اختبار نشطة.' : 'No active test entitlements were found.'));
    })}>{ar ? 'اختبار استعادة المشتريات' : 'Test restore purchases'}</button>
    <p role="status">{status}</p>
  </section>;
}
