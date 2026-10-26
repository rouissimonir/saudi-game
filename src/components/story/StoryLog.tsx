import React from 'react';
import { BookOpen, Lock, Play, X } from 'lucide-react';
import type { Language } from '../../game/rules';
import { SCENES } from '../../story/scenes';
import { CAST_NAMES, CastId } from '../../story/types';
import { actorSrc } from './art';

export interface StoryLogEntry {
  id: string;
  number: number;
  titleAr: string;
  titleEn: string;
  speaker: CastId | null;
  unlocked: boolean;
}

interface StoryLogProps {
  lang: Language;
  prologueSeen: boolean;
  entries: StoryLogEntry[];
  onPlay: (id: string) => void;
  onClose: () => void;
}

/** "Chapter 2: Threads of Najdi Sadu" -> "Threads of Najdi Sadu"; the row already shows the episode number. */
const shortTitle = (t: string) => t.replace(/^[^:：]{1,40}[:：]\s*/, '');

/** Episode list: rewatch the prologue and every finished chapter; upcoming chapters show locked. */
export const StoryLog: React.FC<StoryLogProps> = ({ lang, prologueSeen, entries, onPlay, onClose }) => {
  const isAr = lang === 'ar';
  const prologue = SCENES.prologue;
  const rows: StoryLogEntry[] = [
    { id: 'prologue', number: 0, titleAr: prologue.titleAr, titleEn: prologue.titleEn, speaker: 'layla', unlocked: prologueSeen },
    ...entries,
  ];
  const watched = rows.filter((r) => r.unlocked).length;
  const title = isAr ? 'حكاية المجلس' : 'Story episodes';
  return (
    <div role="dialog" aria-modal="true" aria-label={title} data-testid="story-log" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 p-3" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border-[3px] border-[#D97706] shadow-2xl overflow-hidden text-[#2C1E14]" onClick={(e) => e.stopPropagation()}>
        <div className="h-2 w-full sadu-trim" />
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <h2 className="flex items-center gap-2 text-lg font-black text-[#78350F]">
            <BookOpen className="w-5 h-5 text-[#D97706]" />
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label={isAr ? 'إغلاق' : 'Close'} className="w-9 h-9 rounded-full hud-pill flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="px-4 pb-2 text-xs font-bold text-[#92400E]">
          {isAr ? `فُتحت ${watched} من ${rows.length} حلقة` : `${watched} of ${rows.length} episodes unlocked`}
        </p>
        <ul className="px-3 pb-4 space-y-2 max-h-[65vh] overflow-y-auto">
          {rows.map((r) => {
            const name = r.speaker ? (isAr ? CAST_NAMES[r.speaker].ar : CAST_NAMES[r.speaker].en) : '';
            return (
              <li key={r.id}>
                <button
                  type="button"
                  disabled={!r.unlocked}
                  onClick={() => onPlay(r.id)}
                  data-testid={`story-log-${r.id}`}
                  className={`w-full flex items-center gap-3 rounded-2xl border-2 p-2 text-start transition ${
                    r.unlocked ? 'border-[#F59E0B] bg-[#FEF3C7] active:scale-[0.98]' : 'border-[#E7DCCB] bg-[#F5EFE6] opacity-70'
                  }`}
                >
                  <span className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-gradient-to-b from-[#FCD9A8] to-[#E8A86B]">
                    {r.speaker && (
                      <img src={actorSrc(r.speaker, 'neutral')} alt="" loading="lazy" className={`w-full h-full object-cover object-top ${r.unlocked ? '' : 'grayscale blur-[1px]'}`} />
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[11px] font-black text-[#B45309]">
                      {r.number === 0 ? (isAr ? 'المقدمة' : 'Prologue') : r.number < 0 ? (isAr ? 'الخاتمة' : 'Epilogue') : isAr ? `الحلقة ${r.number}` : `Episode ${r.number}`}
                      {name && r.unlocked ? ` · ${name}` : ''}
                    </span>
                    <span className="block text-sm font-extrabold leading-snug truncate">
                      {r.unlocked ? shortTitle(isAr ? r.titleAr : r.titleEn) : isAr ? 'تُفتح مع ترميم المجلس' : 'Unlocks as you restore the Majlis'}
                    </span>
                  </span>
                  <span className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${r.unlocked ? 'bg-[#D97706] text-white' : 'bg-[#E7DCCB] text-[#8B7355]'}`}>
                    {r.unlocked ? <Play className="w-4 h-4" fill="currentColor" /> : <Lock className="w-4 h-4" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
