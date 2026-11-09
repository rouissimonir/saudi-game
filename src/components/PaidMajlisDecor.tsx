import { useState } from 'react';
import type { Language } from '../game/rules';
import { usePaidAccess } from '../utils/paidAccess';
import { ItemArtwork } from './ItemArtwork';

const styles = [
  { id: 'oasis', ar: 'أخضر الواحة', en: 'Oasis green', color: '#14564D', accent: '#E5BD68' },
  { id: 'rose', ar: 'ورد الطائف', en: 'Taif rose', color: '#733B53', accent: '#F5C9D4' },
  { id: 'night', ar: 'ليلة المجلس', en: 'Majlis night', color: '#263B61', accent: '#F3D697' },
];

/** Only the visual preference is persisted; access always comes from RevenueCat. */
export function PaidMajlisDecor({ lang, preview = false }: { lang: Language; preview?: boolean }) {
  const access = usePaidAccess();
  const [selected, setSelected] = useState(() => {
    try { return localStorage.getItem('qahwa-decor-choice') ?? 'oasis'; } catch { return 'oasis'; }
  });
  if (!preview && !access.decor && !access.membership) return null;
  const ar = lang === 'ar';
  const style = styles.find(s => s.id === selected) ?? styles[0];
  return <section data-testid="paid-majlis-decor" className="rounded-2xl p-4 space-y-3 border-2" style={{ background: style.color, color: style.accent, borderColor: style.accent }}>
    <h3 className="font-black">{ar ? 'ركن الضيافة المزخرف' : 'Decorated hospitality corner'}{preview ? (ar ? ' — معاينة' : ' — Preview') : ''}</h3>
    <div aria-hidden="true" className="rounded-xl border-2 p-4 text-center" style={{ borderColor: style.accent, backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 12px, ${style.accent}22 12px, ${style.accent}22 15px)` }}>
      <div className="flex items-end justify-center gap-3">
        <div className="h-12 w-10 rounded-t-2xl border-2 shadow-inner" style={{ background: style.color, borderColor: style.accent }} />
        <div className="flex items-end justify-center rounded-[50%] border-2 bg-[#6D482E] px-5 py-3 shadow-xl" style={{ borderColor: style.accent }}><ItemArtwork itemId="qahwa_3" size="md" /><ItemArtwork itemId="sweets_2" size="sm" /></div>
        <div className="h-12 w-10 rounded-t-2xl border-2 shadow-inner" style={{ background: style.color, borderColor: style.accent }} />
      </div>
      <div className="mt-2 border-t-4 rounded-full mx-auto w-4/5" style={{ borderColor: style.accent }} />
    </div>
    <div className="flex flex-wrap gap-2">{styles.map(s => <button type="button" key={s.id} aria-pressed={s.id === style.id} onClick={() => {
      setSelected(s.id);
      if (!preview) try { localStorage.setItem('qahwa-decor-choice', s.id); } catch { /* Preference is optional. */ }
    }} className="min-h-11 px-3 rounded-xl border-2 text-xs font-bold" style={{ borderColor: s.id === style.id ? style.accent : 'transparent' }}>{ar ? s.ar : s.en}</button>)}</div>
    <p className="text-xs">{preview ? (ar ? 'ثلاثة ألوان ونقشة هندسية لركن الضيافة.' : 'Three palettes and a geometric pattern for your hospitality corner.') : access.decor ? (ar ? 'مجموعة الزينة الدائمة' : 'Permanent decoration collection') : (ar ? 'متاحة طوال مدة العضوية' : 'Available while your membership is active')}</p>
  </section>;
}
