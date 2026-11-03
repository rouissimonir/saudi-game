import React from 'react';
import { Check, Coins, Gem, Trophy } from 'lucide-react';
import type { GameState, Language } from '../game/rules';
import { achievementRows } from '../game/achievements';
import { Sheet } from './ProgressionModals';

export const AchievementsModal: React.FC<{
  lang: Language;
  state: GameState;
  onClose: () => void;
  onClaim: (id: string) => void;
}> = ({ lang, state, onClose, onClaim }) => {
  const isAr = lang === 'ar';
  const rows = achievementRows(state);
  const claimedCount = rows.filter((r) => r.claimed).length;
  // Ready to collect first, then in progress (closest first), then collected.
  const ordered = [...rows].sort((a, b) => {
    const rank = (r: typeof a) => (r.claimed ? 2 : r.done ? 0 : 1);
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    return b.progress / b.def.target - a.progress / a.def.target;
  });
  return (
    <Sheet testId="achievements-modal" title={isAr ? 'الإنجازات' : 'Achievements'} closeLabel={isAr ? 'إغلاق' : 'Close'} icon={<Trophy className="w-5 h-5 text-[#B45309]" />} onClose={onClose}>
      <p className="text-xs font-bold text-[#78350F]" data-testid="achievements-summary">
        {isAr ? `أنجزت ${claimedCount} من ${rows.length}` : `${claimedCount} of ${rows.length} collected`}
      </p>
      {ordered.map(({ def, progress, done, claimed }) => (
        <div key={def.id} data-testid={`achievement-${def.id}`} className={`rounded-2xl border-2 p-3 ${done && !claimed ? 'border-[#10B981] bg-[#ECFDF5]' : 'border-[#E7D3AE] bg-white'} ${claimed ? 'opacity-70' : ''}`}>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-2xl w-9 text-center shrink-0">{def.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="font-extrabold text-sm leading-tight">{isAr ? def.titleAr : def.titleEn}</div>
              <div className="text-xs text-[#78350F]">{isAr ? def.descAr : def.descEn}</div>
            </div>
            <span dir="ltr" className="shrink-0 text-xs font-bold text-[#92400E] flex flex-col items-end gap-0.5">
              <span className="flex items-center gap-0.5">+{def.reward.gems}<Gem className="w-3.5 h-3.5 text-sky-600" /></span>
              <span className="flex items-center gap-0.5">+{def.reward.coins}<Coins className="w-3.5 h-3.5" /></span>
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-3 rounded-full bg-[#F3E8D2] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#34D399] to-[#059669] transition-all" style={{ width: `${(progress / def.target) * 100}%` }} />
            </div>
            <span className="text-xs tabular-nums font-bold w-14 text-center">{progress}/{def.target}</span>
            {claimed ? (
              <span className="w-20 text-center text-xs font-bold text-[#059669] flex items-center justify-center gap-1"><Check className="w-4 h-4" />{isAr ? 'تم' : 'Done'}</span>
            ) : (
              <button type="button" disabled={!done} onClick={() => onClaim(def.id)} className="min-h-11 w-20 rounded-xl btn-3d-green text-white text-xs font-extrabold py-1.5 disabled:opacity-35">
                {isAr ? 'استلام' : 'Claim'}
              </button>
            )}
          </div>
        </div>
      ))}
    </Sheet>
  );
};
