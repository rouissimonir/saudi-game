import React from 'react';
import { Gem, Zap } from 'lucide-react';
import { Language, StoryChapter } from '../game/rules';
import { CustomerPortrait } from './CompetitorModalsAndPortraits';

function speakerKey(chapter: StoryChapter): string | null {
  const name = chapter.speakerEn.toLowerCase();
  if (name.includes('noura')) return 'noura';
  if (name.includes('faisal')) return 'faisal';
  if (name.includes('tariq')) return 'tariq';
  if (name.includes('lama')) return 'lama';
  if (name.includes('sultan')) return 'sultan';
  return null;
}

interface StoryDialogueModalProps {
  lang: Language;
  chapter: StoryChapter | null;
  onClose: (claimRewardChapterId: string) => void;
}

export const StoryDialogueModal: React.FC<StoryDialogueModalProps> = ({
  lang,
  chapter,
  onClose,
}) => {
  if (!chapter) return null;
  const isAr = lang === 'ar';
  const lines = isAr ? chapter.dialogueAr : chapter.dialogueEn;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? chapter.titleAr : chapter.titleEn}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
    >
      <div className="w-full max-w-lg rounded-2xl border-2 border-[#D99B26] bg-[#241812] text-[#FBF7F0] shadow-2xl overflow-hidden">
        <div className="h-2 w-full sadu-trim" />

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-semibold text-[#FBBF24]">
                {isAr ? 'حكاية مجلس الدرعية' : 'Chronicles of Diriyah Majlis'}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#FBF7F0] mt-0.5">
                {isAr ? chapter.titleAr : chapter.titleEn}
              </h2>
            </div>
            {/* Character portrait (Blender render) with the original emblem as fallback */}
            {speakerKey(chapter) ? (
              <CustomerPortrait avatarKey={speakerKey(chapter) as string} size="lg" />
            ) : (
            <div className="w-12 h-12 rounded-full bg-[#D99B26]/20 border border-[#FBBF24] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 40 40" className="w-8 h-8">
                <circle cx="20" cy="14" r="7" fill="#E9C46A" />
                <path d="M8 34 C8 24 32 24 32 34 Z" fill="#9E2A2B" />
              </svg>
            </div>
            )}
          </div>

          <div className="rounded-xl bg-[#1C1410] border border-[#D99B26]/30 p-4 space-y-3">
            <div className="text-xs font-bold text-[#E9C46A]">
              {isAr ? chapter.speakerAr : chapter.speakerEn}
              <span className="mx-1.5 text-white/40">·</span>
              <span className="font-normal text-[#D4A373]">
                {isAr ? chapter.roleAr : chapter.roleEn}
              </span>
            </div>

            {lines.map((line, i) => (
              <p key={i} className="text-sm text-[#FBF7F0]/95 leading-relaxed">
                “{line}”
              </p>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-[#D99B26]/15 border border-[#D99B26]/35 px-4 py-2.5">
            <span className="text-xs font-semibold text-[#FDE68A]">
              {isAr ? 'مكافأة إتمام الفصل:' : 'Chapter Completion Reward:'}
            </span>
            <div className="flex items-center gap-3 text-xs tabular-nums font-bold">
              <span className="inline-flex items-center gap-1 text-[#38BDF8]">
                <Gem className="w-3.5 h-3.5" /> +{chapter.rewardDiamonds}
              </span>
              <span className="inline-flex items-center gap-1 text-[#FBBF24]">
                <Zap className="w-3.5 h-3.5 fill-current" /> +{chapter.rewardEnergy}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onClose(chapter.id)}
            className="mt-5 w-full py-3 px-5 rounded-xl bg-[#D97724] hover:bg-[#E08738] text-white font-bold text-sm shadow-lg transition-colors cursor-pointer"
          >
            {isAr ? 'استلام المكافأة ومتابعة الحكاية' : 'Claim Reward & Continue Story'}
          </button>
        </div>
      </div>
    </div>
  );
};
