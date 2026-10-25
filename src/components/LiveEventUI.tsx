import React from 'react';
import { Check, Clock, Coins, Gem, Gift, Lock, Scissors, Sparkles, X, Zap } from 'lucide-react';
import { GameState, Language } from '../game/rules';
import { EVENT_MILESTONES, EVENT_ORDER_POINTS, EventReward, activeLiveEvent, claimableMilestones, eventProgress } from '../game/events';

function formatEndsIn(ms: number, isAr: boolean): string {
  const h = Math.max(0, Math.floor(ms / 3_600_000));
  const d = Math.floor(h / 24);
  if (d >= 1) return isAr ? `${d}ي ${h % 24}س` : `${d}d ${h % 24}h`;
  const m = Math.max(0, Math.floor((ms % 3_600_000) / 60_000));
  return isAr ? `${h}س ${m}د` : `${h}h ${m}m`;
}

function RewardChips({ reward }: { reward: EventReward }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 text-xs font-extrabold">
      {reward.coins ? <span className="inline-flex items-center gap-0.5">+{reward.coins}<Coins className="w-3.5 h-3.5 text-amber-600" /></span> : null}
      {reward.gems ? <span className="inline-flex items-center gap-0.5">+{reward.gems}<Gem className="w-3.5 h-3.5 text-sky-600" /></span> : null}
      {reward.energy ? <span className="inline-flex items-center gap-0.5">+{reward.energy}<Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-600" /></span> : null}
      {reward.scissors ? <span className="inline-flex items-center gap-0.5">+{reward.scissors}<Scissors className="w-3.5 h-3.5 text-pink-600" /></span> : null}
      {reward.joker ? <span className="inline-flex items-center gap-0.5">+{reward.joker}<Sparkles className="w-3.5 h-3.5 text-violet-600" /></span> : null}
    </span>
  );
}

/** Slim festival strip under the HUD: token, name, countdown and progress to the next milestone. */
export const LiveEventBar: React.FC<{ lang: Language; state: GameState; now: number; onOpen: () => void }> = ({ lang, state, now, onOpen }) => {
  const isAr = lang === 'ar';
  const ev = activeLiveEvent(now);
  const p = eventProgress(state, now);
  const ready = claimableMilestones(state, now).length;
  const nextIdx = EVENT_MILESTONES.findIndex((m) => p.points < m.points);
  const prevTarget = nextIdx > 0 ? EVENT_MILESTONES[nextIdx - 1].points : 0;
  const target = nextIdx >= 0 ? EVENT_MILESTONES[nextIdx].points : EVENT_MILESTONES[EVENT_MILESTONES.length - 1].points;
  const frac = nextIdx < 0 ? 1 : (p.points - prevTarget) / (target - prevTarget);
  return (
    <button
      type="button"
      onClick={onOpen}
      data-testid="event-bar"
      className={`w-full max-w-[460px] mx-auto flex items-center gap-2 px-2.5 h-7 overflow-hidden bg-gradient-to-r ${ev.def.gradient} text-white text-[11px] font-bold`}
    >
      <span className="text-sm leading-none">{ev.def.token}</span>
      <span className="truncate min-w-0 max-w-[40%]">{isAr ? ev.def.nameAr : ev.def.nameEn}</span>
      <span className="relative flex-1 min-w-[60px] h-2.5 rounded-full bg-black/35 overflow-hidden">
        <span className="absolute inset-y-0 start-0 rounded-full bg-[#FDE047]" style={{ width: `${Math.round(frac * 100)}%` }} />
      </span>
      <span className="tabular-nums shrink-0">{p.points}/{target}</span>
      {ready > 0 ? (
        <span className="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-[#10B981] px-1.5 py-0.5 text-[10px] animate-pulse">
          <Gift className="w-3 h-3" />
          {ready}
        </span>
      ) : (
        <span className="shrink-0 inline-flex items-center gap-0.5 opacity-85 tabular-nums">
          <Clock className="w-3 h-3" />
          {formatEndsIn(ev.endsAt - now, isAr)}
        </span>
      )}
    </button>
  );
};

export const LiveEventModal: React.FC<{
  lang: Language;
  state: GameState;
  now: number;
  onClose: () => void;
  onClaim: (index: number) => void;
}> = ({ lang, state, now, onClose, onClaim }) => {
  const isAr = lang === 'ar';
  const ev = activeLiveEvent(now);
  const p = eventProgress(state, now);
  return (
    <div role="dialog" aria-modal="true" aria-label={isAr ? ev.def.nameAr : ev.def.nameEn} data-testid="event-modal" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 p-3" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border-[3px] border-[#D97706] shadow-2xl overflow-hidden text-[#2C1E14]" onClick={(e) => e.stopPropagation()}>
        <div className={`relative bg-gradient-to-r ${ev.def.gradient} text-white px-4 pt-4 pb-3`}>
          <button type="button" onClick={onClose} aria-label={isAr ? 'إغلاق' : 'Close'} className="absolute top-3 end-3 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
          <div className="text-3xl leading-none">{ev.def.token}</div>
          <h2 className="mt-1 text-lg font-black">{isAr ? ev.def.nameAr : ev.def.nameEn}</h2>
          <p className="text-xs font-semibold opacity-90">
            {isAr ? ev.def.descAr : ev.def.descEn} {isAr ? `كل طلب +${EVENT_ORDER_POINTS}.` : `Every order +${EVENT_ORDER_POINTS}.`}
          </p>
          <p className="mt-1.5 text-xs font-bold inline-flex items-center gap-1 tabular-nums">
            <Clock className="w-3.5 h-3.5" />
            {isAr ? `ينتهي خلال ${formatEndsIn(ev.endsAt - now, true)}` : `Ends in ${formatEndsIn(ev.endsAt - now, false)}`} · {p.points} {ev.def.token}
          </p>
        </div>
        <ol className="px-4 py-3 space-y-2 max-h-[60vh] overflow-y-auto">
          {EVENT_MILESTONES.map((m, i) => {
            const claimed = p.claimed.includes(i);
            const reached = p.points >= m.points;
            return (
              <li key={m.points} data-testid={`event-milestone-${i}`} className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-2 ${reached ? 'border-[#34D399] bg-[#ECFDF5]' : 'border-[#E7D3AE] bg-white'}`}>
                <span className={`w-12 shrink-0 text-center text-sm font-black tabular-nums ${reached ? 'text-[#047857]' : 'text-[#92400E]'}`}>
                  {m.points}
                  <span className="block text-[10px] leading-none">{ev.def.token}</span>
                </span>
                <span className="flex-1 min-w-0 text-[#3E2723]">
                  <RewardChips reward={m.reward} />
                </span>
                {claimed ? (
                  <span className="w-20 text-center text-xs font-bold text-[#059669] inline-flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" />
                    {isAr ? 'تم' : 'Done'}
                  </span>
                ) : reached ? (
                  <button type="button" onClick={() => onClaim(i)} className="w-20 rounded-xl btn-3d-green text-white text-xs font-extrabold py-1.5">
                    {isAr ? 'استلام' : 'Claim'}
                  </button>
                ) : (
                  <span className="w-20 flex justify-center text-[#C8AF87]">
                    <Lock className="w-4 h-4" />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        <p className="px-4 pb-4 text-[11px] text-center text-[#78350F]/70">
          {isAr ? 'مهرجان جديد كل ثلاثة أيام، والنقاط تبدأ من الصفر.' : 'A new festival every three days; points start again from zero.'}
        </p>
      </div>
    </div>
  );
};
