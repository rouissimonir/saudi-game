import React from 'react';
import { Coins, Gem, Gift, Hammer, Check, Zap, X, ScrollText, Clock } from 'lucide-react';
import { ChainId, GameState, ITEM_CATALOG, Language } from '../game/rules';
import {
  ENERGY_COIN_PACK,
  ENERGY_GEM_PACK,
  GENERATOR_MAX_LEVEL,
  QUEST_BONUS,
  coinEnergyPrice,
  generatorLuckyChance,
  generatorUpgradeCost,
  msUntilNextEnergy,
  questProgress,
} from '../game/progression';
import { ItemArtwork } from './ItemArtwork';

export function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function Sheet({ title, icon, onClose, children, testId }: { title: string; icon: React.ReactNode; onClose: () => void; children: React.ReactNode; testId: string }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={title} data-testid={testId} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 p-3" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border-[3px] border-[#D97706] shadow-2xl overflow-hidden text-[#2C1E14]" onClick={(e) => e.stopPropagation()}>
        <div className="h-2 w-full sadu-trim" />
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h2 className="flex items-center gap-2 text-lg font-black text-[#78350F]">
            {icon}
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full hud-pill flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 pb-4 space-y-3 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export const EnergyModal: React.FC<{
  lang: Language;
  state: GameState;
  now: number;
  dayKey: string;
  onClose: () => void;
  onBuyWithGems: () => void;
  onBuyWithCoins: () => void;
  onOpenShop: () => void;
}> = ({ lang, state, now, dayKey, onClose, onBuyWithGems, onBuyWithCoins, onOpenShop }) => {
  const isAr = lang === 'ar';
  const next = msUntilNextEnergy(state, now);
  const coinPrice = coinEnergyPrice(state, dayKey);
  const full = state.energy >= state.maxEnergy;
  return (
    <Sheet testId="energy-modal" title={isAr ? 'الطاقة' : 'Energy'} icon={<Zap className="w-5 h-5 fill-[#F59E0B] text-[#B45309]" />} onClose={onClose}>
      <div className="rounded-2xl bg-[#FEF3C7] border-2 border-[#FCD34D] p-3 flex items-center justify-between">
        <span className="text-3xl font-black tabular-nums text-[#78350F]">
          {Math.round(state.energy)}
          <span className="text-base text-[#B45309]">/{state.maxEnergy}</span>
        </span>
        <span className="flex items-center gap-1.5 text-sm font-bold text-[#92400E]" data-testid="energy-countdown">
          <Clock className="w-4 h-4" />
          {full ? (isAr ? 'ممتلئة' : 'Full') : next !== null ? `${isAr ? '+1 خلال' : '+1 in'} ${formatCountdown(next)}` : ''}
        </span>
      </div>
      <p className="text-xs text-[#78350F]/80">
        {isAr ? 'تتجدد الطاقة نقطة كل دقيقة حتى وأنت خارج اللعبة.' : 'Energy refills one point every minute, even while the game is closed.'}
      </p>
      <button type="button" data-testid="buy-energy-gems" onClick={onBuyWithGems} disabled={state.diamonds < ENERGY_GEM_PACK.gems} className="w-full rounded-2xl btn-3d-green text-white font-extrabold py-3 flex items-center justify-center gap-2 disabled:opacity-40">
        +{ENERGY_GEM_PACK.energy} <Zap className="w-4 h-4 fill-white" /> · {ENERGY_GEM_PACK.gems} <Gem className="w-4 h-4" />
      </button>
      <button type="button" data-testid="buy-energy-coins" onClick={onBuyWithCoins} disabled={state.coins < coinPrice} className="w-full rounded-2xl btn-3d-amber text-[#3B2410] font-extrabold py-3 flex items-center justify-center gap-2 disabled:opacity-40">
        +{ENERGY_COIN_PACK.energy} <Zap className="w-4 h-4 fill-current" /> · {coinPrice} <Coins className="w-4 h-4" />
      </button>
      <p className="text-[11px] text-center text-[#78350F]/70">
        {isAr ? 'سعر الريالات يرتفع مع كل شراء في نفس اليوم.' : 'The coin price rises with each purchase on the same day.'}
      </p>
      <button type="button" onClick={onOpenShop} className="w-full text-sm font-bold text-[#047857] underline">
        {isAr ? 'المزيد في المتجر (دلة الصباح المجانية)' : 'More in the shop (free morning dallah)'}
      </button>
    </Sheet>
  );
};

export const QuestsModal: React.FC<{
  lang: Language;
  state: GameState;
  onClose: () => void;
  onClaim: (questId: string) => void;
  onClaimBonus: () => void;
}> = ({ lang, state, onClose, onClaim, onClaimBonus }) => {
  const isAr = lang === 'ar';
  const rows = questProgress(state);
  const allClaimed = rows.length > 0 && rows.every((r) => r.claimed);
  const bonusDone = state.dailyQuests?.bonusClaimed;
  return (
    <Sheet testId="quests-modal" title={isAr ? 'مهام اليوم' : 'Daily Quests'} icon={<ScrollText className="w-5 h-5 text-[#B45309]" />} onClose={onClose}>
      {rows.map(({ quest, progress, done, claimed }) => (
        <div key={quest.id} className="rounded-2xl border-2 border-[#E7D3AE] bg-white p-3" data-testid={`quest-${quest.id}`}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-extrabold text-sm">{isAr ? quest.titleAr : quest.titleEn}</span>
            <span className="text-xs font-bold text-[#92400E] flex items-center gap-2">
              {quest.reward.coins > 0 && <span className="flex items-center gap-0.5">+{quest.reward.coins}<Coins className="w-3.5 h-3.5" /></span>}
              {quest.reward.gems > 0 && <span className="flex items-center gap-0.5">+{quest.reward.gems}<Gem className="w-3.5 h-3.5 text-sky-600" /></span>}
              {quest.reward.energy > 0 && <span className="flex items-center gap-0.5">+{quest.reward.energy}<Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" /></span>}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-3 rounded-full bg-[#F3E8D2] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#34D399] to-[#059669] transition-all" style={{ width: `${(progress / quest.target) * 100}%` }} />
            </div>
            <span className="text-xs tabular-nums font-bold w-12 text-center">{progress}/{quest.target}</span>
            {claimed ? (
              <span className="w-20 text-center text-xs font-bold text-[#059669] flex items-center justify-center gap-1"><Check className="w-4 h-4" />{isAr ? 'تم' : 'Done'}</span>
            ) : (
              <button type="button" disabled={!done} onClick={() => onClaim(quest.id)} className="w-20 rounded-xl btn-3d-green text-white text-xs font-extrabold py-1.5 disabled:opacity-35">
                {isAr ? 'استلام' : 'Claim'}
              </button>
            )}
          </div>
        </div>
      ))}
      <div className="rounded-2xl border-2 border-dashed border-[#D97706] bg-[#FEF3C7] p-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-extrabold text-[#78350F]">
          <Gift className="w-5 h-5" />
          {isAr ? 'أكمل الثلاث: صندوق ملكي' : 'Finish all three: royal chest'}
          <span className="text-xs font-bold">+{QUEST_BONUS.gems}💎 +{QUEST_BONUS.energy}⚡</span>
        </span>
        <button type="button" data-testid="quest-bonus" disabled={!allClaimed || bonusDone} onClick={onClaimBonus} className="rounded-xl btn-3d-amber text-[#3B2410] text-xs font-extrabold px-3 py-1.5 disabled:opacity-35">
          {bonusDone ? (isAr ? 'تم' : 'Done') : isAr ? 'افتح' : 'Open'}
        </button>
      </div>
      <p className="text-[11px] text-center text-[#78350F]/70">{isAr ? 'مهام جديدة كل يوم.' : 'New quests every day.'}</p>
    </Sheet>
  );
};

const GENERATORS: { chain: ChainId; id: string }[] = [
  { chain: 'qahwa', id: 'gen_qahwa' },
  { chain: 'barista', id: 'gen_barista' },
  { chain: 'sweets', id: 'gen_sweets' },
  { chain: 'oud', id: 'gen_oud' },
];

export const WorkshopModal: React.FC<{
  lang: Language;
  state: GameState;
  onClose: () => void;
  onUpgrade: (chain: ChainId) => void;
}> = ({ lang, state, onClose, onUpgrade }) => {
  const isAr = lang === 'ar';
  return (
    <Sheet testId="workshop-modal" title={isAr ? 'ورشة المولّدات' : 'Generator Workshop'} icon={<Hammer className="w-5 h-5 text-[#B45309]" />} onClose={onClose}>
      <p className="text-xs text-[#78350F]/80">
        {isAr ? 'كل ترقية ترفع فرصة إنتاج عنصر من مستوى أعلى بنفس الطاقة.' : 'Each upgrade raises the chance of spawning a higher-level item for the same energy.'}
      </p>
      {GENERATORS.map(({ chain, id }) => {
        const level = state.generatorLevels?.[chain] ?? 1;
        const cost = generatorUpgradeCost(level);
        const def = ITEM_CATALOG[id];
        return (
          <div key={chain} className="rounded-2xl border-2 border-[#E7D3AE] bg-white p-3 flex items-center gap-3" data-testid={`workshop-${chain}`}>
            <div className="w-14 h-14 rounded-2xl tile-generator-3d flex items-center justify-center shrink-0">
              <ItemArtwork itemId={id} size="md" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-sm truncate">{isAr ? def.nameAr : def.nameEn}</div>
              <div className="text-xs text-[#92400E] font-bold">
                {isAr ? 'المستوى' : 'Level'} {level}/{GENERATOR_MAX_LEVEL} · {isAr ? 'فرصة الحظ' : 'Lucky'} {Math.round(generatorLuckyChance(state, chain) * 100)}%
              </div>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: GENERATOR_MAX_LEVEL }).map((_, i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full ${i < level ? 'bg-[#F59E0B]' : 'bg-[#F3E8D2]'}`} />
                ))}
              </div>
            </div>
            {cost === null ? (
              <span className="text-xs font-extrabold text-[#059669]">{isAr ? 'أقصى' : 'Max'}</span>
            ) : (
              <button type="button" disabled={state.coins < cost} onClick={() => onUpgrade(chain)} className="rounded-xl btn-3d-amber text-[#3B2410] text-xs font-extrabold px-3 py-2 flex items-center gap-1 disabled:opacity-35">
                {cost} <Coins className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </Sheet>
  );
};
