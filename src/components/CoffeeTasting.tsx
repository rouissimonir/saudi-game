import React from 'react';
import { findCellsForOrder, ITEM_CATALOG, type GameState, type Language } from '../game/rules';
import { TASTING_REWARD, TASTING_STYLES, TASTING_TRAYS, hostTasting, prepareTastingTray, setTastingStyle } from '../game/tasting';
import { CustomerPortrait } from './CustomerPortrait';
import { ItemArtwork } from './ItemArtwork';
import { ReturnPantryItem } from './ReturnPantryItem';
import { PantryMergeHelper } from './PantryMergeHelper';
import { TastingCorner } from './TastingCorner';
import { ingredientInstruction, ingredientNeeds } from '../game/orderGuide';
import { tastingGuestMemory, type TastingGuest } from '../game/guestMemories';

type Props = { lang: Language; state: GameState; onChange: React.Dispatch<React.SetStateAction<GameState>>; onClose: () => void; onMajlis: () => void; onFocusRecipe: (items: readonly string[], nameAr: string, nameEn: string) => void; onRetrieve: (index: number) => void };

export function CoffeeTasting({ lang, state, onChange, onClose, onMajlis, onFocusRecipe, onRetrieve }: Props) {
  const ar = lang === 'ar';
  const flags = state.storyFlags ?? {};
  const ready = Boolean(flags.tasting_tray_0 && flags.tasting_tray_1);
  const complete = Boolean(flags.tasting_complete);
  const style = TASTING_STYLES.find(s => s.id === flags.tasting_style);
  return (
    <div role="dialog" aria-modal="true" aria-label={ar ? 'جلسة تذوق فيصل' : "Faisal's coffee tasting"} className="safe-dialog fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3" dir={ar ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl border-2 border-[#D99B26] bg-[#241812] text-[#FBF7F0] shadow-2xl">
        <div className="h-2 sadu-trim" />
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <CustomerPortrait avatarKey="faisal" size="sm" />
            <div className="flex-1"><p className="text-xs font-bold text-[#FBBF24]">{ar ? 'مناسبة في المجلس · بلا مؤقت' : 'A Majlis occasion · no timer'}</p><h2 className="text-lg font-black">{ar ? 'جلسة تذوق فيصل' : "Faisal's coffee tasting"}</h2></div>
            <button type="button" onClick={onClose} aria-label={ar ? 'إغلاق' : 'Close'} className="rounded-lg bg-white/10 px-3 py-1 font-bold">✕</button>
          </div>
          {!complete && <div data-testid="tasting-progress" className="rounded-xl border border-[#D99B26]/50 bg-[#39271B] p-3 text-xs text-[#FDECCB]"><p className="font-black text-[#FBBF24]">{ar ? 'تحضير اللمّة' : 'Preparing the gathering'}</p><ol className="mt-1 space-y-1"><li>{flags.tasting_tray_0 ? '✓' : '○'} {ar ? 'جهّز الصينية الأولى' : 'Prepare the first tray'}</li><li>{flags.tasting_tray_1 ? '✓' : '○'} {ar ? 'جهّز الصينية الثانية' : 'Prepare the second tray'}</li><li>{style ? '✓' : '○'} {ar ? 'اختر شكل ركن القهوة' : 'Choose the coffee corner'}</li></ol><p className="mt-2 font-bold">{ar ? 'بعد استقبال الضيوف' : 'After welcoming guests'}: +{TASTING_REWARD.coins} 🪙 · +{TASTING_REWARD.gems} 💎</p></div>}
          {style && <TastingCorner flags={flags} lang={lang} />}
          {!complete ? <p className="text-sm leading-relaxed text-[#EBD8BA]">{ar ? 'فيصل: ودي نجمع أهلنا على فنجان قهوة. نجهّز صينيتين ونرتّب ركن القهوة مع بعض؟' : "Faisal: Let's bring everyone together over coffee. Will you help me prepare two trays and make a welcoming corner?"}</p> : <div data-testid="tasting-payoff" className="rounded-xl border border-[#D99B26]/60 bg-[#3B281A] p-3 text-sm leading-relaxed space-y-2"><p>{flags.tasting_tray_0 === 'traditional' ? (ar ? 'فيصل: القهوة والتمر بداية جميلة للّمة.' : 'Faisal: Coffee and dates are a lovely way to start our gathering.') : (ar ? 'فيصل: القهوة المختصة مع التمر أعطت لقاؤنا لمسة جديدة.' : 'Faisal: Specialty coffee and dates give our gathering a fresh touch.')}</p><p>{flags.tasting_tray_1 === 'fragrant' ? (ar ? 'نورة: وريحة العود تكمّل دفء المجلس.' : 'Noura: The scent of oud makes the majlis feel even warmer.') : (ar ? 'نورة: والتمر الطازج يكمّل ضيافتنا.' : 'Noura: Fresh dates complete our hospitality.')}</p><p>{ar ? `فيصل: اخترتِ ${style?.ar} للركن، وصار لنا فيه ذكرى جميلة.` : `Faisal: Your ${style?.en.toLowerCase()} corner will hold a lovely memory of today.`}</p><p className="font-bold text-[#FBBF24]">{ar ? 'مكافأة المناسبة' : 'Gathering reward'}: +{TASTING_REWARD.coins} 🪙 · +{TASTING_REWARD.gems} 💎</p><button type="button" onClick={onMajlis} className="rounded-xl bg-[#D99B26] px-3 py-2 font-bold text-[#241812]">{ar ? 'شاهد الركن في المجلس' : 'See the corner in the Majlis'}</button></div>}
          {complete && (['faisal', 'noura'] as TastingGuest[]).map(guest => {
            const memory = tastingGuestMemory(flags, guest);
            return memory && <div key={guest} className="rounded-xl border border-[#8B5E3C] bg-[#302116] p-3 text-sm text-[#FDECCB]" data-testid={`tasting-memory-${guest}`}><div className="text-xs font-bold text-[#FBBF24] mb-1">{ar ? 'ذكرى زيارة' : 'A visit remembered'}</div>{ar ? memory.textAr : memory.textEn}</div>;
          })}
          {!complete && TASTING_TRAYS.map((choices, index) => {
            const key = `tasting_tray_${index}`;
            const selected = choices.find(c => c.id === flags[key]);
            return <section key={key} className="rounded-xl border border-[#8B5E3C] bg-[#302116] p-3" data-testid={`tasting-tray-${index}`}>
              <h3 className="font-black text-[#FBBF24]">{ar ? `الصينية ${index + 1}` : `Tray ${index + 1}`} {selected && '✓'}</h3>
              {selected ? <p className="text-sm mt-1">{ar ? selected.ar : selected.en}</p> : <>
                <p className="text-xs text-[#D4B483] mt-1">{ar ? 'اختر صينية واحدة؛ ستُستخدم عناصر اللوحة ويُحفظ اختيارك لهذه اللمّة.' : 'Choose one tray. Its board items are used and your choice is kept for this gathering.'}</p>
                <div className="space-y-2 mt-2">{choices.map((recipe, choice) => {
                  const available = findCellsForOrder(state.board, [...recipe.items]) !== null;
                  const needs = ingredientNeeds(recipe.items, state.board, state.inventory);
                  return <div key={recipe.id} className="rounded-lg bg-[#1C1410] p-2"><div className="flex items-center justify-between gap-2"><div className="text-sm font-bold">{ar ? recipe.ar : recipe.en}</div><button type="button" disabled={!available} onClick={() => { onChange(s => prepareTastingTray(s, index as 0 | 1, choice)); }} className="rounded-lg bg-[#10B981] px-3 py-2 text-xs font-black text-white disabled:opacity-40">{ar ? 'جهّز' : 'Prepare'}</button></div><p className="mt-1 text-xs leading-relaxed text-[#D4B483]" data-testid={`tasting-choice-${recipe.id}`}>{ar ? recipe.noteAr : recipe.noteEn}</p><div className="space-y-1 mt-2">{needs.map((need, i) => { const def = ITEM_CATALOG[need.itemId]; return <div key={`${need.itemId}-${i}`} className="flex items-center gap-1.5 text-xs text-[#EBD8BA]"><ItemArtwork itemId={need.itemId} size="sm" /><div><span className="font-bold">{ar ? def.nameAr : def.nameEn}</span><span className="block text-[10px] text-[#FDE68A]">{ingredientInstruction(need, lang, state.powerMultiplier, needs)}</span><ReturnPantryItem need={need} state={state} lang={lang} onRetrieve={onRetrieve} /><PantryMergeHelper need={need} needs={needs} state={state} lang={lang} onRetrieve={onRetrieve} /></div></div>; })}</div>{!available && <button type="button" onClick={() => onFocusRecipe(recipe.items, recipe.ar, recipe.en)} className="mt-2 text-xs font-bold text-[#FBBF24] underline">{ar ? 'أرني على اللوحة' : 'Show me on the board'}</button>}</div>;
                })}</div>
              </>}
            </section>;
          })}
          <section className="rounded-xl border border-[#8B5E3C] bg-[#302116] p-3"><h3 className="font-black text-[#FBBF24]">{ar ? 'ركن القهوة' : 'Coffee corner'}</h3><p className="text-xs text-[#D4B483] mt-1">{ready ? (ar ? 'اختر شكل الركن، ويمكنك تغييره لاحقاً.' : 'Choose a look for your corner. You can change it later.') : (ar ? 'جهّز الصينيتين أولاً لفتح الركن.' : 'Prepare both trays to unlock the corner.')}</p><div className="flex flex-wrap gap-2 mt-2">{TASTING_STYLES.map(s => <button key={s.id} type="button" disabled={!ready} onClick={() => onChange(prev => setTastingStyle(prev, s.id))} aria-pressed={flags.tasting_style === s.id} className={`rounded-lg border-2 px-3 py-2 text-xs font-bold disabled:opacity-40 ${flags.tasting_style === s.id ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: s.color, color: '#21170F' }}>{ar ? s.ar : s.en}</button>)}</div></section>
          {!complete && <button type="button" disabled={!ready || !style} onClick={() => onChange(hostTasting)} className="w-full rounded-xl btn-3d-amber py-3 font-black text-[#241812] disabled:opacity-40" data-testid="host-tasting">{ar ? 'استقبل الضيوف' : 'Welcome the guests'}</button>}
          {!complete && <button type="button" onClick={onClose} className="w-full text-sm font-bold text-[#EBD8BA] underline">{ar ? 'العودة للوحة الدمج' : 'Back to the merge board'}</button>}
        </div>
      </div>
    </div>
  );
}
