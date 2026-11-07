import React from 'react';
import { Gem, Zap, Coins, Package, Check } from 'lucide-react';
import type { Language } from '../game/rules';
import type { ListedPack } from '../utils/packPurchase';
import type { PackStatus } from '../utils/useDailyPacks';

interface Props {
  lang: Language;
  offer: ListedPack;
  status: PackStatus;
  bought: boolean;
  onBuy: () => void;
}

/** What is inside, the store's own price and one button; the same card is used in the daily popup and the shop. */
export const DailyPackCard: React.FC<Props> = ({ lang, offer, status, bought, onBuy }) => {
  const ar = lang === 'ar';
  const { pack } = offer;
  const busy = status === 'buying';
  return (
    <div className="rounded-2xl border-2 border-[#D99B26] bg-[#FFFBEB] p-3 text-[#3B2A14]" data-testid="daily-pack-card">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] flex items-center justify-center shrink-0"><Package className="w-6 h-6 text-[#B45309]" /></div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-sm">{ar ? pack.nameAr : pack.nameEn}</div>
          <div className="flex items-center gap-3 text-xs font-bold text-[#92400E]">
            {pack.energy > 0 && <span className="flex items-center gap-0.5">+{pack.energy}<Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" /></span>}
            {pack.gems > 0 && <span className="flex items-center gap-0.5">+{pack.gems}<Gem className="w-3.5 h-3.5 text-sky-600" /></span>}
            {pack.coins > 0 && <span className="flex items-center gap-0.5">+{pack.coins}<Coins className="w-3.5 h-3.5" /></span>}
          </div>
        </div>
        <button
          type="button"
          data-testid="daily-pack-buy"
          disabled={busy || bought}
          onClick={onBuy}
          className="min-h-11 min-w-24 px-3 rounded-xl bg-[#B45309] text-white text-sm font-extrabold disabled:opacity-60 flex items-center justify-center gap-1"
        >
          {bought ? <><Check className="w-4 h-4" />{ar ? 'تم' : 'Bought'}</> : busy ? (ar ? 'جارٍ…' : 'Please wait…') : offer.priceString}
        </button>
      </div>
      <p className="mt-2 text-[11px]">{ar ? 'محتويات ثابتة، بلا مفاجآت. اللعب المجاني لا يحتاج إلى شراء.' : 'Fixed contents, nothing random. Free play never needs a purchase.'}</p>
      {status === 'failed' && <p role="alert" className="mt-1 text-xs font-bold text-[#B91C1C]">{ar ? 'تعذّر إكمال الشراء. لم يتم خصم شيء من حسابك على الأرجح، حاول مجدداً.' : 'The purchase could not be completed. Please try again.'}</p>}
    </div>
  );
};

export const DailyPackModal: React.FC<Props & { open: boolean; onClose: () => void }> = ({ open, onClose, ...card }) => {
  if (!open) return null;
  const ar = card.lang === 'ar';
  return (
    <div role="dialog" aria-modal="true" aria-label={ar ? 'عرض اليوم' : "Today's offer"} data-testid="daily-pack-modal"
      className="safe-dialog fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-md rounded-2xl border-2 border-[#D99B26] bg-[#241812] text-[#FBF7F0] shadow-2xl overflow-hidden">
        <div className="h-2 w-full sadu-trim" />
        <div className="p-5 space-y-3">
          <h2 className="text-lg font-extrabold">{ar ? 'عرض اليوم' : "Today's offer"}</h2>
          <DailyPackCard {...card} />
          <button type="button" data-testid="daily-pack-close" onClick={onClose} className="w-full min-h-11 rounded-xl border border-[#D99B26] text-sm font-bold">
            {card.bought ? (ar ? 'متابعة' : 'Continue') : (ar ? 'ليس الآن' : 'Not now')}
          </button>
        </div>
      </div>
    </div>
  );
};
