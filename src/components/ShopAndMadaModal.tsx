import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import {
  ITEM_CATALOG,
  Language,
  LiveOpsMilestone,
} from '../game/rules';
import { ItemArtwork } from './ItemArtwork';

interface ShopAndMadaModalProps {
  lang: Language;
  isOpen: boolean;
  initialTab?: 'shop' | 'liveops' | 'almanac' | 'capacitor';
  coins: number;
  diamonds: number;
  liveOpsPoints: number;
  milestones: LiveOpsMilestone[];
  discoveredItemIds: string[];
  vipPassActive: boolean;
  onClose: () => void;
  onBuyPack: (packId: string, energyGain: number, diamondsGain: number, coinsGain: number, activateVip?: boolean) => void;
  onClaimMilestone: (milestoneId: string) => void;
}

export const ShopAndMadaModal: React.FC<ShopAndMadaModalProps> = ({
  lang,
  isOpen,
  initialTab = 'shop',
  coins,
  diamonds,
  liveOpsPoints,
  milestones,
  discoveredItemIds,
  vipPassActive,
  onClose,
  onBuyPack,
  onClaimMilestone,
}) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'liveops' | 'almanac' | 'capacitor'>(initialTab);
  const [selectedPaymentRail, setSelectedPaymentRail] = useState<'mada' | 'applepay' | 'stcpay'>('mada');
  const [receiptBanner, setReceiptBanner] = useState<string | null>(null);

  if (!isOpen) return null;
  const isAr = lang === 'ar';

  const handlePurchase = (
    title: string,
    packId: string,
    energyGain: number,
    diamondsGain: number,
    coinsGain: number,
    activateVip?: boolean
  ) => {
    onBuyPack(packId, energyGain, diamondsGain, coinsGain, activateVip);
    const railName =
      selectedPaymentRail === 'mada'
        ? 'Apple Pay (Mada مدى)'
        : selectedPaymentRail === 'stcpay'
        ? 'STC Bank / STC Pay'
        : 'Apple Pay';
    setReceiptBanner(
      isAr
        ? `تمت العملية بنجاح عبر ${railName}: ${title}`
        : `Approved via ${railName}: ${title}`
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? 'ديوان المتجر وموسم الغبقة' : 'Diwan Store & LiveOps'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80"
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border-2 border-[#D99B26] bg-[#1C1410] text-[#FBF7F0] shadow-2xl overflow-hidden">
        <div className="h-2 w-full sadu-trim shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#241812] border-b border-[#D99B26]/25 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#FBF7F0]">
              {isAr ? 'سوق الدرعية وموسم الغبقة' : 'Diriyah Souq & LiveOps Hub'}
            </h2>
            <p className="text-xs text-[#D4A373]">
              {isAr
                ? 'دفع محلي فوري عبر مدى و Apple Pay و STC Pay + دليل البن الخولاني'
                : 'Native Saudi Mada, Apple Pay & STC Pay Rails + Item Almanac'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isAr ? 'إغلاق المتجر' : 'Close Store'}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
          >
            <span>{isAr ? 'إغلاق' : 'Close'}</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-[#160F0C] border-b border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('shop')}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer truncate ${
              activeTab === 'shop'
                ? 'bg-[#D97724] text-white'
                : 'text-[#D4A373] hover:bg-white/5'
            }`}
          >
            {isAr ? 'متجر مدى / VIP' : 'Mada Store'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('liveops')}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer truncate ${
              activeTab === 'liveops'
                ? 'bg-[#D97724] text-white'
                : 'text-[#D4A373] hover:bg-white/5'
            }`}
          >
            {isAr ? 'موسم الغبقة' : 'LiveOps Pass'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('almanac')}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer truncate ${
              activeTab === 'almanac'
                ? 'bg-[#D97724] text-white'
                : 'text-[#D4A373] hover:bg-white/5'
            }`}
          >
            {isAr ? `دليل القهوة (${discoveredItemIds.length}/21)` : `Almanac (${discoveredItemIds.length}/21)`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('capacitor')}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer truncate ${
              activeTab === 'capacitor'
                ? 'bg-[#2A9D8F] text-white'
                : 'text-[#34D399] hover:bg-white/5'
            }`}
          >
            {isAr ? 'تصدير iOS Capacitor' : 'Capacitor iOS'}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {receiptBanner && (
            <div className="rounded-xl bg-[#10B981]/20 border border-[#10B981] px-4 py-2.5 text-xs font-bold text-[#A7F3D0] flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>{receiptBanner}</span>
              </span>
              <button
                type="button"
                onClick={() => setReceiptBanner(null)}
                className="text-white/70 hover:text-white ms-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {activeTab === 'shop' && (
            <div className="space-y-4">
              {/* Saudi Local Payment Rail Selector */}
              <div className="rounded-xl bg-[#241812] border border-[#D99B26]/30 p-3.5">
                <span className="text-xs font-bold text-[#E9C46A] block mb-2">
                  {isAr
                    ? 'وسيلة الدفع السعودية المفضلة (توجيه شهادات مدى المحلية):'
                    : 'Preferred GCC Checkout Rail (Native Mada BIN Routing):'}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'mada', labelAr: 'مدى + Apple Pay', labelEn: 'Apple Pay (Mada)' },
                    { id: 'stcpay', labelAr: 'STC Bank / Pay', labelEn: 'STC Bank / Pay' },
                    { id: 'applepay', labelAr: 'بطاقة ائتمانية', labelEn: 'Apple Pay (Intl)' },
                  ].map((rail) => (
                    <button
                      key={rail.id}
                      type="button"
                      onClick={() => setSelectedPaymentRail(rail.id as 'mada' | 'applepay' | 'stcpay')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        selectedPaymentRail === rail.id
                          ? 'border-[#FBBF24] bg-[#D99B26]/25 text-white'
                          : 'border-white/10 bg-[#1C1410] text-white/60'
                      }`}
                    >
                      {isAr ? rail.labelAr : rail.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shop Bundles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Free Daily Dallah Refill */}
                <div className="rounded-xl border border-[#34D399]/40 bg-[#241812] p-4 flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#34D399]">
                      {isAr ? 'ضيافة المجلس اليومية' : 'Daily Majlis Hospitality'}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">
                      {isAr ? 'دلة طاقة الصباح المجانية' : 'Complimentary Dallah Refill'}
                    </h3>
                    <p className="text-xs text-[#E5DEC9]/75 mt-1">
                      {isAr ? '+40 طاقة فورية + 25 ريال ذهبي' : '+40 Instant Energy + 25 Gold Riyals'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handlePurchase(
                        isAr ? 'ضيافة المجلس (+40 طاقة)' : 'Daily Hospitality (+40 Energy)',
                        'pack_free',
                        40,
                        0,
                        25
                      )
                    }
                    className="w-full py-2 px-3 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold cursor-pointer"
                  >
                    {isAr ? 'استلام مجاناً' : 'Claim Free'}
                  </button>
                </div>

                {/* Energy Refill with Coins/Gems */}
                <div className="rounded-xl border border-[#D99B26]/35 bg-[#241812] p-4 flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#FBBF24]">
                      {isAr ? 'شحن سريع بالعملات' : 'Instant Roastery Refill'}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">
                      {isAr ? 'صندوق 100 طاقة تحميص' : '100 Barista Energy Crate'}
                    </h3>
                    <p className="text-xs text-[#E5DEC9]/75 mt-1">
                      {isAr
                        ? 'يمنحك +100 طاقة لمواصلة دمج الطلبات فوراً.'
                        : 'Grants +100 Energy immediately for non-stop merging.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handlePurchase(
                        isAr ? 'صندوق 100 طاقة' : '100 Energy Crate',
                        'pack_energy_100',
                        100,
                        10,
                        0
                      )
                    }
                    className="w-full py-2 px-3 rounded-lg bg-[#D97724] hover:bg-[#E08738] text-white text-xs font-bold cursor-pointer"
                  >
                    {isAr ? 'شراء · 14.99 ر.س' : 'Buy · SAR 14.99'}
                  </button>
                </div>

                {/* VIP Baron Majlis Pass */}
                <div className="sm:col-span-2 rounded-xl border-2 border-[#FBBF24] bg-gradient-to-r from-[#2A1B12] via-[#3A2214] to-[#2A1B12] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#FBBF24]">
                      {isAr ? 'باقة كبار الشخصيات — الأكثر مبيعاً في السعودية' : 'KSA Best-Seller — VIP Majlis Pass'}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {isAr
                        ? 'عضوية شيخ المجلس (VIP Majlis Baron)'
                        : 'VIP Majlis Baron Membership'}
                    </h3>
                    <p className="text-xs text-[#FDE68A]/90 mt-1">
                      {isAr
                        ? 'ترفع سقف الطاقة إلى 150 + تضاعف فرصة إنتاج عناصر المستوى 2 + تمنح +150 طاقة و +120 جوهرة و +300 ريال فوراً!'
                        : 'Raises Max Energy to 150 + boosts lucky Lv.2 generator spawns + grants 150 Energy, 120 Gems & 300 SAR!'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handlePurchase(
                        isAr ? 'عضوية شيخ المجلس VIP' : 'VIP Majlis Baron Pass',
                        'pack_vip',
                        150,
                        120,
                        300,
                        true
                      )
                    }
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-[#1C1410] font-extrabold text-xs whitespace-nowrap shrink-0 cursor-pointer shadow-lg"
                  >
                    {vipPassActive
                      ? isAr
                        ? 'مفعّلة ✓ (تجديد +مكافأة)'
                        : 'Active ✓ (Bonus Top-Up)'
                      : isAr
                      ? 'تفعيل · 44.99 ر.س'
                      : 'Activate · SAR 44.99'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'liveops' && (
            <div className="space-y-3">
              <div className="rounded-xl bg-[#241812] border border-[#D99B26]/40 p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#FBBF24]">
                    {isAr ? 'حدث ليالي الغبقة الرمضانية ويوم التأسيس' : 'Ramadan Ghabga & Founding Day Event'}
                  </h3>
                  <p className="text-xs text-[#E5DEC9]/80 mt-0.5">
                    {isAr
                      ? 'ادمج العناصر وأكمل طلبات الضيوف وترميم المجلس لجمع نقاط الحدث!'
                      : 'Merge items, serve guests, and restore the Majlis to earn Event Points!'}
                  </p>
                </div>
                <div className="text-end font-mono tabular-nums">
                  <span className="text-xs text-[#D4A373] block">{isAr ? 'نقاطك' : 'Points'}</span>
                  <span className="text-lg font-extrabold text-[#FBBF24]">{liveOpsPoints}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {milestones.map((m) => {
                  const unlocked = liveOpsPoints >= m.pointsRequired;
                  return (
                    <div
                      key={m.id}
                      className="rounded-xl bg-[#241812] border border-white/10 p-3.5 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">
                          {isAr ? m.titleAr : m.titleEn}
                        </div>
                        <div className="text-[11px] text-[#D4A373] font-mono tabular-nums mt-0.5">
                          {isAr
                            ? `المطلوب: ${m.pointsRequired} نقطة حدث`
                            : `Requires: ${m.pointsRequired} Event Points`}
                        </div>
                      </div>
                      {m.claimed ? (
                        <span className="text-xs font-bold text-[#34D399]">
                          ✓ {isAr ? 'تم الاستلام' : 'Claimed'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={!unlocked}
                          onClick={() => onClaimMilestone(m.id)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                            unlocked
                              ? 'bg-[#10B981] hover:bg-[#059669] text-white'
                              : 'bg-white/10 text-white/40 cursor-not-allowed'
                          }`}
                        >
                          {isAr ? 'استلام المكافأة' : 'Claim'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'almanac' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.values(ITEM_CATALOG).map((item) => {
                const discovered = discoveredItemIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl p-3 border flex items-center gap-2.5 ${
                      discovered
                        ? 'bg-[#241812] border-[#D99B26]/35'
                        : 'bg-[#160F0C] border-white/5 opacity-50'
                    }`}
                  >
                    <ItemArtwork itemId={item.id} size="sm" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {discovered ? (isAr ? item.nameAr : item.nameEn) : '؟؟؟'}
                      </div>
                      <div className="text-[11px] text-[#D4A373] font-mono tabular-nums">
                        {item.isGenerator
                          ? isAr
                            ? 'مولّد رئيسي'
                            : 'Generator'
                          : `${isAr ? 'مستوى' : 'Lv.'} ${item.level}/${item.maxLevel}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'capacitor' && (
            <div className="space-y-3 text-xs leading-relaxed text-[#E5DEC9]" dir="ltr">
              <div className="rounded-xl bg-[#241812] border border-[#2A9D8F]/50 p-4">
                <h3 className="text-sm font-bold text-[#34D399] mb-1">
                  Capacitor iOS & Android Production Architecture Ready
                </h3>
                <p className="text-white/80">
                  This project includes a pre-configured <code className="text-[#FBBF24]">capacitor.config.ts</code>{' '}
                  (<code className="text-[#FBBF24]">appId: "sa.qahwamajlis.merge"</code>), deterministic 60fps touch
                  handlers, WebAudio Hijaz Maqam synthesis, Haptics bridge, and offline-first state persistence.
                </p>
                <pre className="mt-3 p-3 rounded-lg bg-black/60 text-[#A7F3D0] font-mono text-[11px] overflow-x-auto">
{`# Build & Package for Apple App Store (Xcode)
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios`}
                </pre>
              </div>
              <div className="rounded-xl bg-[#241812] border border-white/10 p-3.5 flex items-center justify-between">
                <span>Current Player Wallet State (Persisted):</span>
                <span className="font-mono tabular-nums text-[#FBBF24]">
                  {coins} SAR · {diamonds} Gems
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
