import React, { useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Language } from '../game/rules';
import { cloudAccount, readSandboxWallet } from '../utils/cloudAccount';

/** Optional recovery identity for the sandbox wallet; never required for free play. */
export function PurchaseAccountPanel({ lang }: { lang: Language }) {
  const ar = lang === 'ar';
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [message, setMessage] = useState('');
  const [wallet, setWallet] = useState<{ energy: number; gems: number } | null>(null);
  useEffect(() => {
    let alive = true;
    void cloudAccount.auth.getSession().then(({ data }) => { if (alive) setSession(data.session); });
    const { data } = cloudAccount.auth.onAuthStateChange((_event, next) => {
      if (alive) { setSession(next); setWallet(null); }
    });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);
  const run = async (action: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setMessage('');
    try { await action(); }
    catch { setMessage(ar ? 'تعذّر إكمال الطلب. تحقّق من اتصالك وحاول مجدداً.' : 'Could not complete the request. Check your connection and try again.'); }
    finally { lock.current = false; setBusy(false); }
  };
  return <section className="rounded-xl border border-amber-700 p-3 space-y-2" data-testid="purchase-account">
    <h4 className="font-bold">{ar ? 'حساب استعادة المشتريات' : 'Purchase recovery account'}</h4>
    <p className="text-xs">{ar ? 'استخدم نفس البريد لاستعادة رصيدك التجريبي. اللعب المجاني لا يحتاج حساباً.' : 'Use the same email to recover your test balance. Free play does not require an account.'}</p>
    {session ? <>
      <p className="break-all text-xs">{session.user.email}</p>
      <button type="button" disabled={busy} className="min-h-11 underline px-2" onClick={() => void run(async () => setWallet(await readSandboxWallet()))}>{ar ? 'عرض الرصيد التجريبي' : 'Check test balance'}</button>
      {wallet && <p role="status">{ar ? 'طاقة' : 'Energy'}: {wallet.energy} · {ar ? 'جواهر' : 'Gems'}: {wallet.gems}</p>}
      <button type="button" disabled={busy} className="min-h-11 underline px-2" onClick={() => void run(async () => {
        const { error } = await cloudAccount.auth.signOut(); if (error) throw error;
        setCode(''); setEmail(''); setSent(false); setWallet(null);
      })}>{ar ? 'تسجيل الخروج' : 'Sign out'}</button>
    </> : <form className="space-y-2" onSubmit={event => {
      event.preventDefault();
      void run(async () => {
        if (!sent) {
          const { error } = await cloudAccount.auth.signInWithOtp({ email: email.trim() });
          if (error) throw error;
          setSent(true);
          setMessage(ar ? 'تحقّق من بريدك وأدخل رمز الدخول.' : 'Check your email and enter the sign-in code.');
        } else {
          const { error } = await cloudAccount.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
          if (error) throw error;
          setCode('');
        }
      });
    }}>
      <label className="block text-xs">{ar ? 'البريد الإلكتروني' : 'Email'}<input type="email" autoComplete="email" required value={email} disabled={busy || sent} onChange={event => setEmail(event.target.value)} className="block w-full min-h-11 rounded-lg border p-2 bg-white text-stone-900" /></label>
      {sent && <label className="block text-xs">{ar ? 'رمز الدخول' : 'Sign-in code'}<input autoComplete="one-time-code" inputMode="numeric" required value={code} onChange={event => setCode(event.target.value)} className="block w-full min-h-11 rounded-lg border p-2 bg-white text-stone-900" /></label>}
      <button type="submit" disabled={busy} className="min-h-11 underline font-bold">{sent ? (ar ? 'تأكيد الرمز' : 'Verify code') : (ar ? 'إرسال رمز الدخول' : 'Send sign-in code')}</button>
      {sent && <button type="button" disabled={busy} className="min-h-11 underline px-2" onClick={() => { setSent(false); setCode(''); }}>{ar ? 'تغيير البريد أو إعادة المحاولة' : 'Change email or retry'}</button>}
    </form>}
    <p role="status" className="text-xs">{message}</p>
  </section>;
}
