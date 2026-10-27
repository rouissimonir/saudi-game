import React from 'react';
import { ITEM_CATALOG, VIP_ORDER_GEMS, orderCoinReward, type CustomerOrder, type GameState, type Language, type Season } from '../game/rules';
import { ingredientInstruction, orderNeeds } from '../game/orderGuide';
import { ItemArtwork } from './ItemArtwork';
import { CustomerPortrait } from './CustomerPortrait';
import { ReturnPantryItem } from './ReturnPantryItem';
import { PantryMergeHelper } from './PantryMergeHelper';
import { tastingGuestMemory } from '../game/guestMemories';

export function OrderGuide({ order, state, season, lang, focused, onFocus, onClose, onRetrieve, onServe }: { order: CustomerOrder; state: GameState; season: Season | null; lang: Language; focused: boolean; onFocus: () => void; onClose: () => void; onRetrieve: (index: number) => void; onServe: () => void }) {
  const ar = lang === 'ar';
  const needs = orderNeeds(order, state.board, state.inventory);
  const reward = orderCoinReward(state, order, season);
  const ready = needs.every(need => need.location === 'board');
  const memory = order.customerId === 'faisal' || order.customerId === 'noura' ? tastingGuestMemory(state.storyFlags, order.customerId) : null;
  return <div role="dialog" aria-modal="true" aria-label={ar ? 'دليل الطلب' : 'Order guide'} dir={ar ? 'rtl' : 'ltr'} className="safe-dialog fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3">
    <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl border-2 border-[#D99B26] bg-[#241812] p-4 text-[#FBF7F0] shadow-2xl">
      <div className="flex items-center gap-3"><CustomerPortrait avatarKey={order.customerId} size="md" /><div className="flex-1"><p className="text-xs font-bold text-[#FBBF24]">{ar ? 'دليل الضيافة' : 'Hospitality guide'}</p><h2 className="font-black">{ar ? order.customerNameAr : order.customerNameEn}</h2></div><button type="button" onClick={onClose} aria-label={ar ? 'إغلاق' : 'Close'} className="rounded-lg bg-white/10 px-3 py-2">✕</button></div>
      <p className="my-3 text-sm text-[#EBD8BA]">{ar ? order.quoteAr : order.quoteEn}</p>
      {memory && <p data-testid="order-guest-memory" className="mb-3 rounded-xl border border-[#8B5E3C] bg-[#302116] p-2 text-xs leading-relaxed text-[#FDECCB]"><span className="block font-bold text-[#FBBF24]">{ar ? 'ذكرى من اللمّة' : 'A memory from your gathering'}</span>{ar ? memory.textAr : memory.textEn}</p>}
      <div data-testid="order-reward-breakdown" className="mb-3 rounded-xl border border-[#D99B26]/40 bg-[#39271B] p-2 text-xs text-[#FDECCB]">
        <p className="font-black">{ar ? 'مكافأة الضيافة' : 'Hospitality reward'}: +{reward.total} 🪙 · +{order.rewardStars} ⭐</p>
        {order.isVip && <p data-testid="vip-reward-details" className="mt-1 font-bold text-[#FDE68A]">{ar ? `ضيف مميز: +${VIP_ORDER_GEMS} جوهرة` : `VIP guest: +${VIP_ORDER_GEMS} gems`}{order.requiredItemIds.length > 0 && (ar ? ' وصندوق ضيافة على اللوحة' : ' and a hospitality chest on the board')}</p>}
        <p className="mt-1 leading-relaxed">{ar ? `الطلب ${reward.base}` : `Order ${reward.base}`}{reward.restoration > 0 && (ar ? ` + الترميم ${reward.restoration}` : ` + restoration ${reward.restoration}`)}{reward.area > 0 && (ar ? ` + المنطقة ${reward.area}` : ` + area ${reward.area}`)}{reward.seasonal > 0 && (ar ? ` + الموسم ${reward.seasonal}` : ` + season ${reward.seasonal}`)}</p>
      </div>
      <div className="space-y-2">{needs.map((need, i) => {
        const def = ITEM_CATALOG[need.itemId];
        return <div key={`${need.itemId}-${i}`} className="flex items-start gap-2 rounded-xl bg-[#39271B] p-2"><ItemArtwork itemId={need.itemId} size="md" /><div className="min-w-0 flex-1"><div className="text-sm font-bold">{ar ? def?.nameAr : def?.nameEn} · L{def?.level}</div><div className="text-xs font-bold mt-1 text-[#FDE68A]" data-testid={`order-ingredient-help-${i}`}>{ingredientInstruction(need, lang, state.powerMultiplier, needs)}</div><ReturnPantryItem need={need} state={state} lang={lang} onRetrieve={onRetrieve} /><PantryMergeHelper need={need} needs={needs} state={state} lang={lang} onRetrieve={onRetrieve} /></div></div>;
      })}</div>
      {ready && <button type="button" onClick={onServe} data-testid="serve-from-guide" className="w-full mt-4 min-h-11 rounded-xl btn-3d-green py-3 font-black text-white">{ar ? 'قدّم الطلب واستقبل الضيف' : 'Serve and welcome your guest'}</button>}
      {!ready && <button type="button" onClick={onFocus} aria-pressed={focused} data-testid="focus-order" className="w-full mt-4 rounded-xl btn-3d-amber py-3 font-black text-[#241812]">{focused ? (ar ? 'إلغاء التركيز على الطلب' : 'Stop focusing on this order') : (ar ? 'ركّز على هذا الطلب' : 'Focus on this order')}</button>}
      {!ready && <p className="text-xs text-[#D4B483] mt-2">{ar ? 'سيظهر إطار ذهبي حول المولّدات والعناصر المفيدة على اللوحة.' : 'A gold outline marks useful generators and lower-level items on the board.'}</p>}
      <button type="button" onClick={onClose} className="w-full mt-3 text-sm font-bold text-[#EBD8BA] underline">{ar ? 'العودة للوحة' : 'Back to the board'}</button>
    </div>
  </div>;
}
