import React from 'react';
import { Gem, Zap, Coins, Scissors, Wand2, Gift, Check } from 'lucide-react';
import { DAILY_LOGIN_REWARDS, DailyReward, Language } from '../game/rules';

interface DailyLoginModalProps {
  lang: Language;
  /** Streak day (1..7) that will be claimed now, or null when closed. */
  day: number | null;
  onClaim: () => void;
}

function rewardParts(reward: DailyReward, isAr: boolean): { icon: React.ReactNode; label: string }[] {
  const parts: { icon: React.ReactNode; label: string }[] = [];
  if (reward.energy) parts.push({ icon: <Zap className="w-4 h-4 fill-current text-[#FBBF24]" />, label: `+${reward.energy}` });
  if (reward.coins) parts.push({ icon: <Coins className="w-4 h-4 text-[#FBBF24]" />, label: `+${reward.coins}` });
  if (reward.gems) parts.push({ icon: <Gem className="w-4 h-4 text-[#38BDF8]" />, label: `+${reward.gems}` });
  if (reward.scissors) parts.push({ icon: <Scissors className="w-4 h-4 text-[#F472B6]" />, label: `+${reward.scissors}` });
  if (reward.joker) parts.push({ icon: <Wand2 className="w-4 h-4 text-[#A78BFA]" />, label: `+${reward.joker}` });
  if (reward.freeSpins) parts.push({ icon: <Gift className="w-4 h-4 text-[#34D399]" />, label: isAr ? `+${reward.freeSpins} دورة` : `+${reward.freeSpins} spin` });
  if (reward.chest) parts.push({ icon: <Gift className="w-4 h-4 text-[#FBBF24]" />, label: isAr ? 'صندوق ملكي' : 'Royal chest' });
  return parts;
}

export const DailyLoginModal: React.FC<DailyLoginModalProps> = ({ lang, day, onClaim }) => {
  if (day === null) return null;
  const isAr = lang === 'ar';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? 'هدية اليوم' : 'Daily reward'}
      data-testid="daily-login-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
    >
      <div className="w-full max-w-md rounded-2xl border-2 border-[#D99B26] bg-[#241812] text-[#FBF7F0] shadow-2xl overflow-hidden">
        <div className="h-2 w-full sadu-trim" />
        <div className="p-5">
          <span className="text-xs font-semibold text-[#FBBF24]">
            {isAr ? 'غبقة اليوم · مكافأة الدخول اليومي' : 'Daily Ghabga · Login Reward'}
          </span>
          <h2 className="text-xl font-bold mt-0.5">
            {isAr ? `يا هلا! اليوم ${day} من 7` : `Welcome back! Day ${day} of 7`}
          </h2>
          <p className="text-xs text-[#D4A373] mt-1">
            {isAr ? 'ادخل كل يوم لتكمل السلسلة وتفتح صندوق اليوم السابع.' : 'Come back every day to keep your streak and open the Day 7 chest.'}
          </p>

          <div className="grid grid-cols-7 gap-1.5 mt-4">
            {DAILY_LOGIN_REWARDS.map((reward) => {
              const done = reward.day < day;
              const current = reward.day === day;
              return (
                <div
                  key={reward.day}
                  className={`rounded-lg border px-1 py-2 flex flex-col items-center gap-1 text-[10px] font-bold ${
                    current
                      ? 'border-[#FBBF24] bg-[#D99B26]/25 ring-2 ring-[#FBBF24]'
                      : done
                      ? 'border-[#10B981]/60 bg-[#10B981]/15 text-[#6EE7B7]'
                      : 'border-[#8B5E3C]/50 bg-[#1C1410]'
                  }`}
                >
                  <span>{reward.day}</span>
                  {done ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    rewardParts(reward, isAr)
                      .slice(0, 1)
                      .map((p, i) => <span key={i}>{p.icon}</span>)
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 rounded-xl bg-[#1C1410] border border-[#D99B26]/30 py-3 text-sm font-extrabold tabular-nums">
            {rewardParts(DAILY_LOGIN_REWARDS[day - 1], isAr).map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                {p.icon}
                {p.label}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={onClaim}
            data-testid="daily-login-claim"
            className="mt-4 w-full rounded-xl bg-[#D97724] hover:bg-[#EA8A35] text-white font-extrabold py-3 transition-colors"
          >
            {isAr ? 'استلم هديتي' : 'Claim reward'}
          </button>
        </div>
      </div>
    </div>
  );
};
