import React from 'react';
import { findCellsForOrder, ITEM_CATALOG, type GameState, type Language } from '../game/rules';
import { ingredientInstruction, ingredientNeeds } from '../game/orderGuide';
import { TAIF_WELCOMES, prepareTaifWelcome, taifWelcomeReflection } from '../game/taifWelcome';
import { assetUrl } from '../utils/assetUrl';
import { CustomerPortrait } from './CustomerPortrait';
import { ItemArtwork } from './ItemArtwork';
import { ReturnPantryItem } from './ReturnPantryItem';
import { PantryMergeHelper } from './PantryMergeHelper';

type Props = { lang: Language; state: GameState; onChange: React.Dispatch<React.SetStateAction<GameState>>; onClose: () => void; onFocus: (items: readonly string[], ar: string, en: string) => void; onRetrieve: (index: number) => void };

export function TaifWelcome({ lang, state, onChange, onClose, onFocus, onRetrieve }: Props) {
  const ar = lang === 'ar';
  const choice = TAIF_WELCOMES.find(recipe => recipe.id === state.storyFlags?.taif_welcome);
  const reflection = taifWelcomeReflection(choice?.id, state.storyFlags?.taif);
  return <div role="dialog" aria-modal="true" aria-label={ar ? 'ضيافة ورد الطائف' : 'A Taif rose welcome'} dir={ar ? 'rtl' : 'ltr'} className="safe-dialog fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3">
    <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl border-2 border-[#D99B26] bg-[#241812] text-[#FBF7F0] shadow-2xl">
      <div className="relative h-28 overflow-hidden"><img src={assetUrl('assets/art/story/bg_taif.webp')} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#241812] to-transparent" /><button type="button" onClick={onClose} aria-label={ar ? 'إغلاق' : 'Close'} className="absolute top-3 end-3 rounded-lg bg-black/70 px-3 py-2">✕</button></div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3"><CustomerPortrait avatarKey="noura" size="md" /><div><p className="text-xs font-bold text-[#FBBF24]">{ar ? 'ذكرى من الطائف · بلا مؤقت' : 'A memory from Taif · no timer'}</p><h2 className="font-black text-lg">{ar ? 'ضيافة ورد الطائف' : 'A Taif rose welcome'}</h2></div></div>
        <p className="text-sm leading-relaxed text-[#EBD8BA]">{state.storyFlags?.taif === 'pomegranate' ? (ar ? 'نورة: أذكر مشروب الورد والرمان اللي اخترتيه للصغار. نرتّب ضيافة للضيوف ونخلّي ذكرى الطائف معنا؟' : 'Noura: I remember the rose-and-pomegranate drink you chose for the children. Shall we prepare a welcome and keep a memory of Taif?') : state.storyFlags?.taif === 'rose' ? (ar ? 'نورة: فنجال جدّك بماء الورد خلّى لمّتنا أحلى. نرتّب ضيافة للضيوف ونخلّي ذكرى الطائف معنا؟' : 'Noura: Your grandfather’s rose-water coffee made our gathering special. Shall we prepare a welcome and keep a memory of Taif?') : (ar ? 'نورة: الورد يجمعنا بذكريات الطائف. نرتّب ضيافة للضيوف ونخلّي الذكرى معنا؟' : 'Noura: Roses bring back memories of Taif. Shall we prepare a welcome and keep that memory?')}</p>
        {choice ? <div data-testid="taif-welcome-memory" className="rounded-xl border border-[#D99B26]/60 bg-[#3B281A] p-3"><div className="flex items-center gap-2"><span className="text-2xl">🌹</span><div><p className="font-black">{ar ? choice.nameAr : choice.nameEn}</p><p className="text-xs text-[#EBD8BA]">{ar ? 'ذكرى محفوظة في مجلسك' : 'A memory kept in your Majlis'}</p></div></div><p data-testid="taif-welcome-reflection" className="mt-3 text-sm">{ar ? reflection?.ar : reflection?.en}</p><p className="mt-2 text-xs font-bold text-[#FBBF24]">{ar ? 'مكافأة الضيافة' : 'Welcome reward'}: +150 🪙 · +20 ⚡</p></div> : <>
          <p className="text-xs text-[#D4B483]">{ar ? 'اختاري ضيافة واحدة؛ ستُستخدم عناصرها من اللوحة. تولة الورد لتعطير المكان فقط، وليست للشرب.' : 'Choose one welcome; its items are used from the board. Rose perfume scents the room and is not a drink ingredient.'}</p>
          {TAIF_WELCOMES.map((recipe, index) => { const needs = ingredientNeeds(recipe.items, state.board, state.inventory); const ready = findCellsForOrder(state.board, [...recipe.items]) !== null; return <section key={recipe.id} className="rounded-xl border border-[#8B5E3C] bg-[#302116] p-3"><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-black">{ar ? recipe.nameAr : recipe.nameEn}</h3><button type="button" disabled={!ready} aria-label={ar ? `استقبل الضيوف: ${recipe.nameAr}` : `Welcome guests: ${recipe.nameEn}`} onClick={() => { onChange(s => prepareTaifWelcome(s, index)); }} className="min-h-11 min-w-11 rounded-lg bg-[#10B981] px-3 py-2 text-xs font-black text-white disabled:opacity-40">{ar ? 'استقبل الضيوف' : 'Welcome guests'}</button></div><div className="mt-2 space-y-1">{needs.map((need, i) => { const def = ITEM_CATALOG[need.itemId]; return <div key={`${need.itemId}-${i}`} className="flex items-center gap-2 text-xs"><ItemArtwork itemId={need.itemId} size="sm" /><div><span className="font-bold">{ar ? def.nameAr : def.nameEn}</span><span className="block text-[10px] text-[#FDE68A]">{ingredientInstruction(need, lang, state.powerMultiplier, needs)}</span><ReturnPantryItem need={need} state={state} lang={lang} onRetrieve={onRetrieve} /><PantryMergeHelper need={need} needs={needs} state={state} lang={lang} onRetrieve={onRetrieve} /></div></div>; })}</div>{!ready && <button type="button" aria-label={ar ? `أرني على اللوحة: ${recipe.nameAr}` : `Show me on the board: ${recipe.nameEn}`} onClick={() => onFocus(recipe.items, recipe.nameAr, recipe.nameEn)} className="mt-2 min-h-11 text-xs font-bold text-[#FBBF24] underline">{ar ? 'أرني على اللوحة' : 'Show me on the board'}</button>}</section>; })}
        </>}
        <button type="button" onClick={onClose} className="w-full text-sm font-bold text-[#EBD8BA] underline">{ar ? 'العودة' : 'Back'}</button>
      </div>
    </div>
  </div>;
}
