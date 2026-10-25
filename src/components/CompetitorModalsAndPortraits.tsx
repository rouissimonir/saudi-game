import React, { useState } from 'react';
import {
  X,
  Trophy,
  Star,
  Check,
  Lock,
  Zap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Gem,
  Heart,
  Gift,
} from 'lucide-react';
import {
  ChainCategory,
  ITEM_CATALOG,
  KSA_LEADERBOARD_RIVALS,
  Language,
  LUCKY_WHEEL_WEDGES,
  WheelWedge,
} from '../game/rules';
import { discoveryReward } from '../game/progression';
import { ItemArtwork } from './ItemArtwork';
import { assetUrl } from '../utils/assetUrl';

/**
 * Illustrated Khaleeji Character Portraits for the Gossip Harbor / Travel Town Customer Order Strip
 */
export const PORTRAIT_BACKDROP: Record<string, string> = {
  noura: '#5A1E1E',
  faisal: '#1E3A4A',
  tariq: '#3A2616',
  lama: '#4A1F44',
  sultan: '#3E2412',
  ghabga: '#1E1B4B',
};

export const CustomerPortrait: React.FC<{
  avatarKey?: 'noura' | 'faisal' | 'tariq' | 'lama' | 'sultan' | 'ghabga' | string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ avatarKey = 'noura', size = 'md' }) => {
  const dim = size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-14 h-14' : 'w-11 h-11';
  // Blender-rendered bust in public/assets/art/characters/<key>.png; falls back to the built-in SVG if missing
  const [failedKey, setFailedKey] = React.useState<string | null>(null);
  const useImage = failedKey !== avatarKey && avatarKey in PORTRAIT_BACKDROP;

  return (
    <div
      style={useImage ? { backgroundColor: PORTRAIT_BACKDROP[avatarKey] } : undefined}
      className={`${dim} rounded-full overflow-hidden border-2 border-[#D99B26] bg-[#2B1D14] shrink-0 shadow-inner flex items-center justify-center`}
    >
      {useImage && (
        <img
          src={assetUrl(`assets/art/characters/${avatarKey}.png`)}
          alt=""
          width={256}
          height={256}
          draggable={false}
          onError={() => setFailedKey(avatarKey)}
          className="w-full h-full object-cover scale-[1.12] translate-y-[6%]"
        />
      )}
      {!useImage && (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        {avatarKey === 'noura' && (
          <g>
            <rect width="64" height="64" fill="#3B2316" />
            <circle cx="32" cy="32" r="28" fill="#5A1E1E" />
            <path d="M12,64 C12,34 52,34 52,64 Z" fill="#1F1612" />
            <circle cx="32" cy="27" r="13" fill="#E6B89C" />
            <path
              d="M17,24 C22,12 42,12 47,24 C49,34 48,48 48,60 L16,60 C16,48 15,34 17,24 Z"
              fill="none"
              stroke="#FBBF24"
              strokeWidth="2.5"
            />
            <circle cx="27" cy="27" r="3.8" fill="none" stroke="#FBBF24" strokeWidth="1.6" />
            <circle cx="37" cy="27" r="3.8" fill="none" stroke="#FBBF24" strokeWidth="1.6" />
            <line x1="30.8" y1="27" x2="33.2" y2="27" stroke="#FBBF24" strokeWidth="1.6" />
            <path d="M28,33 Q32,36 36,33" fill="none" stroke="#7F3D27" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )}

        {avatarKey === 'faisal' && (
          <g>
            <rect width="64" height="64" fill="#1E293B" />
            <circle cx="32" cy="32" r="28" fill="#2A9D8F" opacity="0.3" />
            <path d="M12,64 C14,42 50,42 52,64 Z" fill="#334155" />
            <path d="M22,46 L42,46 L45,64 L19,64 Z" fill="#9A3412" />
            <circle cx="32" cy="26" r="12" fill="#DCA788" />
            <path d="M19,22 C20,12 44,12 45,22 Z" fill="#1E1B18" />
            <path d="M22,28 C22,37 42,37 42,28" fill="none" stroke="#1E1B18" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="28" cy="25" r="1.6" fill="#1E1B18" />
            <circle cx="36" cy="25" r="1.6" fill="#1E1B18" />
            <path d="M29,31 Q32,33 35,31" fill="none" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {avatarKey === 'tariq' && (
          <g>
            <rect width="64" height="64" fill="#281B12" />
            <path d="M8,64 C12,42 52,42 56,64 Z" fill="#1C1410" stroke="#FBBF24" strokeWidth="2" />
            <path d="M16,22 C16,10 48,10 48,22 L52,56 L12,56 Z" fill="#F8FAFC" />
            <circle cx="32" cy="28" r="11" fill="#D49B78" />
            <rect x="18" y="14" width="28" height="4.5" rx="2.2" fill="#111827" stroke="#FBBF24" strokeWidth="0.8" />
            <path d="M23,30 C23,39 41,39 41,30" fill="none" stroke="#1F2937" strokeWidth="3.5" />
            <circle cx="28" cy="26" r="1.5" fill="#111827" />
            <circle cx="36" cy="26" r="1.5" fill="#111827" />
          </g>
        )}

        {avatarKey === 'lama' && (
          <g>
            <rect width="64" height="64" fill="#311B2E" />
            <circle cx="32" cy="32" r="27" fill="#9D174D" opacity="0.35" />
            <path d="M14,64 C14,36 50,36 50,64 Z" fill="#3B1D38" stroke="#F4A261" strokeWidth="1.5" />
            <circle cx="32" cy="26" r="11.5" fill="#E8B89A" />
            <path d="M18,22 C20,11 44,11 46,24" fill="none" stroke="#F4A261" strokeWidth="3" />
            <circle cx="28" cy="25" r="1.7" fill="#1F1612" />
            <circle cx="36" cy="25" r="1.7" fill="#1F1612" />
            <path d="M29,31 Q32,34 35,31" fill="none" stroke="#9E2A2B" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {avatarKey === 'sultan' && (
          <g>
            <rect width="64" height="64" fill="#2D1B10" />
            <path d="M14,22 C14,9 50,9 50,22 L54,58 L10,58 Z" fill="#DC2626" />
            <path d="M16,22 C16,11 48,11 48,22 L50,56 L14,56 Z" fill="#FEF2F2" opacity="0.75" />
            <circle cx="32" cy="28" r="11" fill="#C98E6B" />
            <rect x="18" y="13" width="28" height="5" rx="2.5" fill="#111827" />
            <path d="M23,31 C24,39 40,39 41,31" fill="none" stroke="#374151" strokeWidth="3.5" />
            <circle cx="28" cy="26" r="1.5" fill="#111827" />
            <circle cx="36" cy="26" r="1.5" fill="#111827" />
          </g>
        )}

        {avatarKey === 'ghabga' && (
          <g>
            <rect width="64" height="64" fill="#1E1B4B" />
            <circle cx="32" cy="32" r="24" fill="#FBBF24" opacity="0.2" />
            <path d="M32,12 L37,24 L50,25 L40,34 L43,47 L32,40 L21,47 L24,34 L14,25 L27,24 Z" fill="#FBBF24" stroke="#FFF" strokeWidth="1.5" />
          </g>
        )}
      </svg>
      )}
    </div>
  );
};

/**
 * Visual Merge Chain Evolution Tree Modal (Now includes all 4 Cultural & Specialty Chains + Chests!)
 */
export const ChainTreeModal: React.FC<{
  lang: Language;
  isOpen: boolean;
  initialChain: ChainCategory;
  discoveredItemIds: string[];
  claimableItemIds?: string[];
  onClaimDiscovery?: (itemId: string) => void;
  onClose: () => void;
}> = ({ lang, isOpen, initialChain, discoveredItemIds, claimableItemIds = [], onClaimDiscovery, onClose }) => {
  const [selectedChain, setSelectedChain] = useState<ChainCategory>(initialChain);

  React.useEffect(() => {
    setSelectedChain(initialChain);
  }, [initialChain]);

  if (!isOpen) return null;
  const isAr = lang === 'ar';

  const chains: { id: ChainCategory; titleAr: string; titleEn: string; genId?: string }[] = [
    {
      id: 'qahwa',
      titleAr: 'سلسلة القهوة الخولانية',
      titleEn: 'Saudi Khawlani Qahwa',
      genId: 'gen_qahwa',
    },
    {
      id: 'oud',
      titleAr: 'سلسلة العود والبخور والورد',
      titleEn: 'Oud, Bakhoor & Taif Rose',
      genId: 'gen_oud',
    },
    {
      id: 'barista',
      titleAr: 'سلسلة الباريستا المختصة (V60)',
      titleEn: 'Specialty Barista & V60',
      genId: 'gen_barista',
    },
    {
      id: 'sweets',
      titleAr: 'سلسلة التمور والحلويات',
      titleEn: 'Royal Dates & Sweets',
      genId: 'gen_sweets',
    },
    {
      id: 'chest',
      titleAr: 'صناديق الضيافة الملكية',
      titleEn: 'Majlis Treasure Chests',
    },
  ];

  const activeMeta = chains.find((c) => c.id === selectedChain) || chains[0];
  const generatorDef = activeMeta.genId ? ITEM_CATALOG[activeMeta.genId] : null;
  const chainItems = Object.values(ITEM_CATALOG)
    .filter((i) => !i.isGenerator && i.chain === selectedChain)
    .sort((a, b) => a.level - b.level);

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? 'شجرة تطور الدمج' : 'Merge Chain Evolution Tree'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80"
    >
      <div className="w-full max-w-2xl rounded-2xl border-2 border-[#D99B26] bg-[#221711] text-[#FBF7F0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="h-2 w-full sadu-trim" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#2B1D14] shrink-0">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FBBF24] block">
              {isAr ? 'دليل تطور السلاسل الأربع والصناديق' : 'MERGE EVOLUTION TREE (4 CHAINS + CHESTS)'}
            </span>
            <h2 className="text-lg sm:text-xl font-bold mt-0.5">
              {isAr ? activeMeta.titleAr : activeMeta.titleEn}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isAr ? 'إغلاق' : 'Close'}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chain Switcher Tabs */}
        <div className="px-4 pt-3 flex gap-1.5 overflow-x-auto bg-[#1B120E] shrink-0">
          {chains.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedChain(c.id)}
              className={`px-3 py-2 rounded-t-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                selectedChain === c.id
                  ? 'bg-[#D97724] text-white'
                  : 'bg-[#2B1D14] text-[#D4A373] hover:text-white'
              }`}
            >
              {isAr ? c.titleAr : c.titleEn}
              {claimableItemIds.some((id) => ITEM_CATALOG[id]?.chain === c.id) && (
                <span className="ms-1.5 inline-block w-2 h-2 rounded-full bg-[#EF4444] align-middle" />
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {generatorDef && (
            <div className="rounded-xl bg-[#2E1F16] border border-[#FBBF24]/40 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#1C1410] border border-[#FBBF24] flex items-center justify-center shrink-0">
                  <ItemArtwork itemId={generatorDef.id} size="md" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#FBBF24] uppercase inline-flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" />
                    {isAr ? 'المولّد الأساسي' : 'SOURCE GENERATOR'}
                  </span>
                  <div className="text-sm font-bold text-white">
                    {isAr ? generatorDef.nameAr : generatorDef.nameEn}
                  </div>
                  <p className="text-xs text-[#E5DEC9]/80">
                    {isAr ? generatorDef.descAr : generatorDef.descEn}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#FBBF24]/20 text-[#FBBF24] text-xs font-bold whitespace-nowrap">
                {isAr ? 'ينتج المستوى 1–3' : 'Spawns Lv.1–3'}
              </span>
            </div>
          )}

          {/* Step-by-Step Visual Evolution Path */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {chainItems.map((item, idx) => {
              const unlocked = discoveredItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`relative rounded-xl p-3 border flex flex-col items-center text-center transition-all ${
                    unlocked
                      ? 'bg-[#2B1D14] border-[#D99B26]/50 shadow-md'
                      : 'bg-[#17100C] border-white/10 opacity-70'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-[10px] font-bold text-[#D4A373] mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-black/50 text-[#FBBF24] tabular-nums">
                      Lv.{item.level}
                    </span>
                    {unlocked ? (
                      <span className="text-[#34D399] inline-flex items-center gap-0.5">
                        <Check className="w-3 h-3" />
                        {isAr ? 'مكتشف' : 'Found'}
                      </span>
                    ) : (
                      <Lock className="w-3 h-3 text-white/40" />
                    )}
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-[#FBF5E8] border-2 border-[#D99B26]/60 flex items-center justify-center my-1 shadow-inner">
                    <ItemArtwork itemId={item.id} size="md" />
                  </div>

                  <div className="text-xs font-bold text-[#FBF7F0] mt-1 line-clamp-1">
                    {isAr ? item.nameAr : item.nameEn}
                  </div>
                  <div className="text-[11px] text-[#D4A373] tabular-nums mt-0.5">
                    {isAr ? `قيمة البيع: ${item.sellValue} ر.س` : `Sell: ${item.sellValue} SAR`}
                  </div>

                  {claimableItemIds.includes(item.id) && onClaimDiscovery && (() => {
                    const reward = discoveryReward(item.id);
                    return (
                      <button
                        type="button"
                        data-testid={`claim-discovery-${item.id}`}
                        onClick={() => onClaimDiscovery(item.id)}
                        className="mt-2 w-full rounded-lg btn-3d-green text-white text-[11px] font-extrabold py-1.5 inline-flex items-center justify-center gap-1 animate-pulse"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        {isAr ? 'اكتشاف جديد!' : 'New find!'} +{reward?.coins}🪙{reward?.gems ? ` +${reward.gems}💎` : ''}
                      </button>
                    );
                  })()}

                  {idx < chainItems.length - 1 && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#FBBF24] font-semibold">
                      <span>{isAr ? 'ادمج 2 للترقية' : 'Merge 2 → Next'}</span>
                      <ArrowIcon className="w-3 h-3" />
                    </div>
                  )}
                  {idx === chainItems.length - 1 && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#34D399] font-bold">
                      <Sparkles className="w-3 h-3" />
                      <span>{isAr ? 'الحد الأقصى للهيبة!' : 'MAX LEVEL CROWN!'}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Unified Hub Modal for:
 * 1) Diwan Al-Karam Saudi Prestige Leaderboard
 * 2) Weekly "Mazayen Al-Majlis" Showcase Voting Contest (Mazayen #37 KSA benchmark)
 * 3) Daily "Finjan Al-Sabah" Lucky Dallah Spin Wheel
 */
export const LeaderboardModal: React.FC<{
  lang: Language;
  isOpen: boolean;
  initialSection?: 'leaderboard' | 'mazayen' | 'wheel';
  playerPrestige: number;
  ordersCompleted: number;
  totalRenovated: number;
  freeSpinsAvailable: number;
  diamonds: number;
  mazayenVotesRemaining: number;
  votedRivalIds: string[];
  onSpinWheel: () => WheelWedge | null;
  onVoteMazayen: (rivalId: string) => void;
  onClose: () => void;
}> = ({
  lang,
  isOpen,
  initialSection = 'leaderboard',
  playerPrestige,
  ordersCompleted,
  totalRenovated,
  freeSpinsAvailable,
  diamonds,
  mazayenVotesRemaining,
  votedRivalIds,
  onSpinWheel,
  onVoteMazayen,
  onClose,
}) => {
  const [section, setSection] = useState<'leaderboard' | 'mazayen' | 'wheel'>(initialSection);
  const [lastWonWedge, setLastWonWedge] = useState<WheelWedge | null>(null);
  const [wheelRotation, setWheelRotation] = useState<number>(0);

  React.useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  if (!isOpen) return null;
  const isAr = lang === 'ar';

  const combinedEntries = [
    ...KSA_LEADERBOARD_RIVALS.map((r) => ({
      ...r,
      isPlayer: false,
    })),
    {
      id: 'player_majlis',
      nameAr: 'مجلسك (قصر الدرعية)',
      nameEn: 'Your Diriyah Majlis',
      cityAr: 'الدرعية التاريخية',
      cityEn: 'Historic Diriyah',
      prestigePoints: playerPrestige,
      badgeAr: 'أنت · صاحب المجلس',
      badgeEn: 'YOU · Majlis Host',
      styleTagAr: 'الدرعية والقهوة المختصة',
      styleTagEn: 'Diriyah & Specialty Roastery',
      votes: 95 + totalRenovated * 8,
      isPlayer: true,
    },
  ].sort((a, b) => b.prestigePoints - a.prestigePoints);

  const handleSpinClick = () => {
    const won = onSpinWheel();
    if (won) {
      setWheelRotation((prev) => prev + 720 + Math.floor(Math.random() * 360));
      setLastWonWedge(won);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? 'ديوان الكرم ومزاين المجالس وعجلة الحظ' : 'Diwan Al-Karam, Mazayen & Lucky Wheel'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80"
    >
      <div className="w-full max-w-2xl rounded-2xl border-2 border-[#D99B26] bg-[#221711] text-[#FBF7F0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="h-2 w-full sadu-trim" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#2B1D14] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FBBF24]/20 border border-[#FBBF24] flex items-center justify-center text-[#FBBF24]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FBBF24] block">
                {isAr ? 'منافسات المجالس ومكافآت فنجال الصباح' : 'SAUDI PRESTIGE LEAGUE, MAZAYEN & DAILY WHEEL'}
              </span>
              <h2 className="text-lg sm:text-xl font-bold">
                {isAr ? 'ديوان الكرم ومزاين المجالس' : 'Diwan Al-Karam & Mazayen Hub'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isAr ? 'إغلاق' : 'Close'}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Navigation Tabs */}
        <div className="px-4 pt-3 flex gap-2 bg-[#19110D] border-b border-white/10 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSection('leaderboard')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
              section === 'leaderboard'
                ? 'bg-[#D97724] text-white'
                : 'bg-[#2B1D14] text-[#D4A373] hover:text-white'
            }`}
          >
            {isAr ? 'صدارة ديوان الكرم' : 'KSA Prestige Rank'}
          </button>
          <button
            type="button"
            onClick={() => setSection('mazayen')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
              section === 'mazayen'
                ? 'bg-[#D97724] text-white'
                : 'bg-[#2B1D14] text-[#D4A373] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? `مزاين المجالس (${mazayenVotesRemaining} أصوات)` : `Mazayen Contest (${mazayenVotesRemaining})`}</span>
          </button>
          <button
            type="button"
            onClick={() => setSection('wheel')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
              section === 'wheel'
                ? 'bg-[#D97724] text-white'
                : 'bg-[#2B1D14] text-[#D4A373] hover:text-white'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>
              {isAr
                ? `عجلة فنجال الصباح (${freeSpinsAvailable > 0 ? 'مجاناً!' : '15💎'})`
                : `Lucky Dallah Spin (${freeSpinsAvailable > 0 ? 'FREE!' : '15💎'})`}
            </span>
          </button>
        </div>

        {/* Section Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {section === 'leaderboard' && (
            <>
              <div className="rounded-xl bg-gradient-to-r from-[#D97724]/30 to-[#2A9D8F]/25 border border-[#FBBF24]/50 p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#FDE68A] font-semibold">
                    {isAr ? 'نقاط الكرم والهيبة الحالية لمجلسك' : 'Your Current Hospitality Prestige'}
                  </div>
                  <div className="text-xs text-[#E5DEC9]/80 mt-0.5">
                    {isAr
                      ? `الطلبات المنجزة: ${ordersCompleted} · الأجنحة المرممة: ${totalRenovated}/8`
                      : `Orders Served: ${ordersCompleted} · Wings Restored: ${totalRenovated}/8`}
                  </div>
                </div>
                <div className="text-end">
                  <span className="text-xl font-extrabold tabular-nums text-[#FBBF24]">
                    {playerPrestige}
                  </span>
                  <span className="block text-[10px] text-[#D4A373]">
                    {isAr ? 'نقطة كرم' : 'PRESTIGE PTS'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {combinedEntries.map((row, index) => {
                  const rank = index + 1;
                  return (
                    <div
                      key={row.id}
                      className={`rounded-xl p-3 border flex items-center justify-between gap-3 ${
                        row.isPlayer
                          ? 'bg-[#D97724]/25 border-[#FBBF24] ring-1 ring-[#FBBF24]'
                          : 'bg-[#19110D] border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg font-extrabold tabular-nums text-xs flex items-center justify-center shrink-0 ${
                            rank === 1
                              ? 'bg-[#FBBF24] text-[#1C1410]'
                              : rank === 2
                              ? 'bg-[#E2E8F0] text-[#1C1410]'
                              : rank === 3
                              ? 'bg-[#D97724] text-white'
                              : 'bg-white/10 text-[#D4A373]'
                          }`}
                        >
                          #{rank}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-white truncate">
                            {isAr ? row.nameAr : row.nameEn}
                          </div>
                          <div className="text-[11px] text-[#D4A373] truncate">
                            {isAr ? `${row.cityAr} · ${row.badgeAr}` : `${row.cityEn} · ${row.badgeEn}`}
                          </div>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-[#FBBF24]/30 text-xs font-extrabold tabular-nums text-[#FBBF24] shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{row.prestigePoints}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {section === 'mazayen' && (
            <div className="space-y-3">
              <div className="rounded-xl bg-[#2E1F16] border border-[#FBBF24]/40 p-3.5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#FBBF24]">
                    {isAr
                      ? 'مسابقة مزاين المجالس الأسبوعية (صوّت واربح فوراً!)'
                      : 'Weekly Mazayen Al-Majlis Showcase (Vote & Earn!)'}
                  </div>
                  <p className="text-xs text-[#E5DEC9]/80 mt-0.5">
                    {isAr
                      ? 'صوّت لأجمل المجالس السعودية المشاركة هذا الأسبوع لربح +25 ريال ذهبي و+20 نقطة هيبة لكل صوت!'
                      : 'Vote for the best-designed Saudi cafés this week to earn +25 SAR & +20 Prestige Points per vote!'}
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-[#1C1410] border border-[#FBBF24] text-xs font-extrabold tabular-nums text-[#FBBF24] shrink-0">
                  {isAr ? `الأصوات المتبقية: ${mazayenVotesRemaining}` : `Votes Left: ${mazayenVotesRemaining}`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {KSA_LEADERBOARD_RIVALS.slice(0, 4).map((rival) => {
                  const hasVoted = votedRivalIds.includes(rival.id);
                  return (
                    <div
                      key={`maz_${rival.id}`}
                      className="rounded-xl bg-[#19110D] border border-[#D99B26]/35 p-3.5 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white">
                            {isAr ? rival.nameAr : rival.nameEn}
                          </span>
                          <span className="text-[11px] text-[#FBBF24] font-semibold">
                            {isAr ? rival.cityAr : rival.cityEn}
                          </span>
                        </div>
                        <p className="text-xs text-[#D4A373] mt-1">
                          {isAr ? rival.styleTagAr : rival.styleTagEn}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-xs tabular-nums text-[#E5DEC9] inline-flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-[#F43F5E] fill-[#F43F5E]" />
                          {(rival.votes || 50) + (hasVoted ? 1 : 0)}
                        </span>

                        <button
                          type="button"
                          disabled={hasVoted || mazayenVotesRemaining <= 0}
                          onClick={() => onVoteMazayen(rival.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            hasVoted
                              ? 'bg-[#10B981]/20 text-[#34D399]'
                              : mazayenVotesRemaining > 0
                              ? 'bg-[#D97724] hover:bg-[#E08738] text-white shadow'
                              : 'bg-white/10 text-white/40 cursor-not-allowed'
                          }`}
                        >
                          {hasVoted
                            ? isAr
                              ? 'تم التصويت (+25 ر.س)'
                              : 'Voted (+25 SAR)'
                            : isAr
                            ? 'تصويت (+25 ر.س)'
                            : 'Vote (+25 SAR)'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {section === 'wheel' && (
            <div className="flex flex-col items-center text-center space-y-4 py-2">
              {/* Interactive SVG Dallah Spin Wheel */}
              <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
                {/* Top Pointer */}
                <div className="absolute -top-2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-[#FBBF24] drop-shadow" />

                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full transition-transform duration-700 ease-out"
                  style={{ transform: `rotate(${wheelRotation}deg)` }}
                >
                  <circle cx="100" cy="100" r="95" fill="#2B1D14" stroke="#FBBF24" strokeWidth="5" />
                  {LUCKY_WHEEL_WEDGES.map((w, i) => {
                    const angle = i * 60;
                    return (
                      <g key={w.id} transform={`rotate(${angle} 100 100)`}>
                        <path
                          d="M100,100 L100,8 A92,92 0 0,1 179.6,54 Z"
                          fill={w.color}
                          stroke="#1C1410"
                          strokeWidth="2"
                          opacity="0.88"
                        />
                        <text
                          x="128"
                          y="48"
                          fill="#FFFFFF"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                          transform="rotate(30 128 48)"
                        >
                          {`+${w.amount}`}
                        </text>
                      </g>
                    );
                  })}
                  <circle cx="100" cy="100" r="22" fill="#1C1410" stroke="#FBBF24" strokeWidth="4" />
                  <circle cx="100" cy="100" r="8" fill="#FBBF24" />
                </svg>
              </div>

              {lastWonWedge && (
                <div className="px-4 py-2 rounded-xl bg-[#10B981]/20 border border-[#10B981] text-xs sm:text-sm font-bold text-[#34D399]">
                  {isAr
                    ? `مبروك! ربحت من عجلة فنجال الصباح: ${lastWonWedge.labelAr}`
                    : `Congratulations! You won: ${lastWonWedge.labelEn}`}
                </div>
              )}

              <button
                type="button"
                onClick={handleSpinClick}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D97724] to-[#F59E0B] hover:opacity-95 text-[#1C1410] font-extrabold text-sm shadow-xl inline-flex items-center gap-2 cursor-pointer"
              >
                {freeSpinsAvailable > 0 ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isAr ? 'أدر العجلة مجاناً الآن! (فنجال الصباح)' : 'Spin Free Now! (Morning Finjan)'}</span>
                  </>
                ) : (
                  <>
                    <Gem className="w-4 h-4 text-[#0F172A]" />
                    <span>{isAr ? `أدر العجلة مجدداً (15 جوهرة · رصيدك ${diamonds})` : `Spin Again (15 Gems · Balance ${diamonds})`}</span>
                  </>
                )}
              </button>

              {/* Wedge Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full pt-2">
                {LUCKY_WHEEL_WEDGES.map((w) => (
                  <div
                    key={`leg_${w.id}`}
                    className="px-2.5 py-1.5 rounded-lg bg-[#19110D] border border-white/10 text-[11px] font-semibold text-[#E5DEC9] flex items-center gap-2"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: w.color }} />
                    <span className="truncate">{isAr ? w.labelAr : w.labelEn}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
