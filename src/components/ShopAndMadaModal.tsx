import React, { useState } from 'react';
import { Check, Coins, Crown, Gem, Gift, ShoppingBag, Trophy, Zap } from 'lucide-react';
import { Language, LiveOpsMilestone, dayKeyFromDate } from '../game/rules';
import { SHOP_GIFT } from '../game/progression';
import { useNow } from '../utils/useNow';
import { Sheet } from './ProgressionModals';

/** What a paid pack grants. Purchases are granted directly until store billing is wired in the native build. */
const ENERGY_CRATE = { id: 'pack_energy_100', energy: 100, gems: 10, coins: 0, priceAr: '14.99 ر.س', priceEn: 'SAR 14.99' };
const VIP_PASS = { id: 'pack_vip', energy: 150, gems: 120, coins: 300, priceAr: '44.99 ر.س', priceEn: 'SAR 44.99' };

interface ShopAndMadaModalProps {
  lang: Language;
  isOpen: boolean;
  shopGiftDay: string;
  liveOpsPoints: number;
  milestones: LiveOpsMilestone[];
  vipPassActive: boolean;
  onClose: () => void;
  onClaimGift: () => void;
  onBuyPack: (packId: string, energyGain: number, diamondsGain: number, coinsGain: number, activateVip?: boolean) => void;
  onClaimMilestone: (milestoneId: string) => void;
}

function Rewards({ energy, gems, coins }: { energy: number; gems: number; coins: number }) {
  return (
    <span className="flex items-center gap-2 text-xs font-bold text-[#92400E]">
      {energy > 0 && <span className="flex items-center gap-0.5">+{energy}<Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" /></span>}
      {gems > 0 && <span className="flex items-center gap-0.5">+{gems}<Gem className="w-3.5 h-3.5 text-sky-600" /></span>}
      {coins > 0 && <span className="flex items-center gap-0.5">+{coins}<Coins className="w-3.5 h-3.5" /></span>}
    </span>
  );
}

export const ShopAndMadaModal: React.FC<ShopAndMadaModalProps> = ({
  lang,
  isOpen,
  shopGiftDay,
  liveOpsPoints,
  milestones,
  vipPassActive,
  onClose,
  onClaimGift,
  onBuyPack,
  onClaimMilestone,
}) => {
  const [tab, setTab] = useState<'shop' | 'milestones'>('shop');
  const [thanks, setThanks] = useState<string | null>(null);
  const now = useNow();
  if (!isOpen) return null;
  const isAr = lang === 'ar';
  const giftReady = shopGiftDay !== dayKeyFromDate(new Date(now));
  const claimable = milestones.filter((m) => !m.claimed && liveOpsPoints >= m.pointsRequired).length;

  const buy = (pack: typeof ENERGY_CRATE, nameAr: string, nameEn: string, vip?: boolean) => {
    onBuyPack(pack.id, pack.energy, pack.gems, pack.coins, vip);
    setThanks(isAr ? `أُضيف إلى مجلسك: ${nameAr}` : `Added to your Majlis: ${nameEn}`);
  };

  const tabClass = (on: boolean) =>
    `flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-extrabold transition-colors ${
      on ? 'bg-[#D97706] text-white shadow' : 'text-[#92400E] hover:bg-[#FEF3C7]'
    }`;

  return (
    <Sheet testId="shop-modal" title={isAr ? 'سوق الدرعية' : 'Diriyah Souq'} icon={<ShoppingBag className="w-5 h-5 text-[#B45309]" />} onClose={onClose}>
      <div role="tablist" className="flex gap-1 rounded-2xl bg-[#F3E8D2] p-1">
        <button type="button" role="tab" aria-selected={tab === 'shop'} className={tabClass(tab === 'shop')} onClick={() => setTab('shop')}>
          <ShoppingBag className="w-4 h-4" />
          {isAr ? 'المتجر' : 'Shop'}
        </button>
        <button type="button" role="tab" aria-selected={tab === 'milestones'} data-testid="shop-tab-milestones" className={tabClass(tab === 'milestones')} onClick={() => setTab('milestones')}>
          <Trophy className="w-4 h-4" />
          {isAr ? 'جوائز المجلس' : 'Milestones'}
          {claimable > 0 && <span className="min-w-5 h-5 px-1 rounded-full bg-[#059669] text-white text-[11px] leading-5 tabular-nums">{claimable}</span>}
        </button>
      </div>

      {thanks && (
        <div role="status" className="rounded-2xl border-2 border-[#34D399] bg-[#ECFDF5] px-3 py-2 text-xs font-bold text-[#065F46] flex items-center gap-1.5">
          <Check className="w-4 h-4 shrink-0" />
          {thanks}
        </div>
      )}

      {tab === 'shop' && (
        <>
          <div className="rounded-2xl border-2 border-[#34D399] bg-white p-3 flex items-center gap-3" data-testid="shop-gift">
            <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-[#059669]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-sm">{isAr ? 'هدية الضيافة اليومية' : 'Daily hospitality gift'}</div>
              <Rewards energy={SHOP_GIFT.energy} gems={0} coins={SHOP_GIFT.coins} />
            </div>
            <button
              type="button"
              data-testid="shop-gift-claim"
              disabled={!giftReady}
              onClick={() => {
                onClaimGift();
                setThanks(isAr ? 'استلمت هدية اليوم. نراك بكرة!' : "You claimed today's gift. See you tomorrow!");
              }}
              className="w-24 rounded-xl btn-3d-green text-white text-xs font-extrabold py-2 disabled:opacity-40"
            >
              {giftReady ? (isAr ? 'استلام' : 'Claim') : isAr ? 'بكرة' : 'Tomorrow'}
            </button>
          </div>

          <div className="rounded-2xl border-2 border-[#E7D3AE] bg-white p-3 flex items-center gap-3" data-testid="shop-energy-crate">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 fill-amber-500 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-sm">{isAr ? 'صندوق طاقة المحمصة' : 'Roastery energy crate'}</div>
              <Rewards energy={ENERGY_CRATE.energy} gems={ENERGY_CRATE.gems} coins={ENERGY_CRATE.coins} />
            </div>
            <button
              type="button"
              onClick={() => buy(ENERGY_CRATE, 'صندوق طاقة المحمصة', 'Roastery energy crate')}
              className="w-24 rounded-xl btn-3d-amber text-[#3B2410] text-xs font-extrabold py-2"
            >
              {isAr ? ENERGY_CRATE.priceAr : ENERGY_CRATE.priceEn}
            </button>
          </div>

          <div className="rounded-2xl border-[3px] border-[#F59E0B] bg-gradient-to-br from-[#FFFBEB] to-[#FDE68A] p-3 space-y-2" data-testid="shop-vip">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-[#B45309] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm text-[#78350F]">{isAr ? 'عضوية شيخ المجلس' : 'Majlis Sheikh pass'}</div>
                <div className="text-[11px] font-bold text-[#92400E]">{isAr ? 'الأكثر اختياراً' : 'Most popular'}</div>
              </div>
              {vipPassActive && (
                <span className="flex items-center gap-1 text-xs font-extrabold text-[#059669]">
                  <Check className="w-4 h-4" />
                  {isAr ? 'مفعّلة' : 'Active'}
                </span>
              )}
            </div>
            <ul className="text-xs text-[#78350F] space-y-0.5 ps-1">
              <li>• {isAr ? 'سقف الطاقة يصير 150 بدل 100' : 'Energy holds up to 150 instead of 100'}</li>
              <li>• {isAr ? 'فرصة أعلى لعناصر أقوى من المولّدات' : 'Generators drop stronger items more often'}</li>
            </ul>
            <div className="flex items-center justify-between gap-2">
              <Rewards energy={VIP_PASS.energy} gems={VIP_PASS.gems} coins={VIP_PASS.coins} />
              <button
                type="button"
                onClick={() => buy(VIP_PASS, 'عضوية شيخ المجلس', 'Majlis Sheikh pass', true)}
                className="rounded-xl btn-3d-amber text-[#3B2410] text-xs font-extrabold px-4 py-2 whitespace-nowrap"
              >
                {vipPassActive ? (isAr ? 'تجديد المكافأة' : 'Top up bonus') : isAr ? VIP_PASS.priceAr : VIP_PASS.priceEn}
              </button>
            </div>
          </div>
        </>
      )}

      {tab === 'milestones' && (
        <>
          <div className="rounded-2xl bg-[#FEF3C7] border-2 border-dashed border-[#D97706] p-3 flex items-center justify-between gap-3">
            <p className="text-xs text-[#78350F]">
              {isAr
                ? 'كل دمج وكل تصويت في مسابقة المجالس يعطيك نقاط مجلس. اجمعها وافتح الجوائز.'
                : 'Every merge and every contest vote earns Majlis points. Collect them to unlock rewards.'}
            </p>
            <span className="text-end shrink-0">
              <span className="block text-[11px] font-bold text-[#92400E]">{isAr ? 'نقاطك' : 'Points'}</span>
              <span className="text-xl font-black tabular-nums text-[#B45309]" data-testid="shop-points">{liveOpsPoints}</span>
            </span>
          </div>
          {milestones.map((m) => {
            const ready = liveOpsPoints >= m.pointsRequired;
            return (
              <div key={m.id} className="rounded-2xl border-2 border-[#E7D3AE] bg-white p-3" data-testid={`milestone-${m.id}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-sm">{isAr ? m.titleAr : m.titleEn}</span>
                  {m.claimed ? (
                    <span className="w-20 text-center text-xs font-bold text-[#059669] flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" />
                      {isAr ? 'تم' : 'Done'}
                    </span>
                  ) : (
                    <button type="button" disabled={!ready} onClick={() => onClaimMilestone(m.id)} className="w-20 rounded-xl btn-3d-green text-white text-xs font-extrabold py-1.5 disabled:opacity-35">
                      {isAr ? 'استلام' : 'Claim'}
                    </button>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-3 rounded-full bg-[#F3E8D2] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#FBBF24] to-[#D97706] transition-all" style={{ width: `${Math.min(100, (liveOpsPoints / m.pointsRequired) * 100)}%` }} />
                  </div>
                  <span className="text-xs tabular-nums font-bold w-16 text-center">{Math.min(liveOpsPoints, m.pointsRequired)}/{m.pointsRequired}</span>
                </div>
              </div>
            );
          })}
        </>
      )}
    </Sheet>
  );
};
