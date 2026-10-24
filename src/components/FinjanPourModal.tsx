import React, { useEffect, useRef, useState } from 'react';
import {
  Language,
  PourGrade,
  POUR_TARGET_PERCENT,
  POUR_PERFECT_TOLERANCE,
  POUR_GOOD_TOLERANCE,
  POUR_REWARDS,
  gradePour,
} from '../game/rules';

interface FinjanPourModalProps {
  lang: Language;
  isOpen: boolean;
  tokens: number;
  onFinish: (fillPercent: number) => void;
  onClose: () => void;
}

const FILL_PER_SECOND = 38;

const GRADE_TEXT: Record<PourGrade, { ar: string; en: string }> = {
  perfect: { ar: 'ربع الفنجال تماماً! كرم أصيل', en: "A perfect Rub'a al-Finjan! True generosity" },
  good: { ar: 'صبّة طيبة، قريبة من الربع', en: 'A good pour, close to a quarter' },
  short: { ar: 'قليل! الضيف ينتظر المزيد', en: 'Too little! Your guest wants more' },
  overflow: { ar: 'فاض الفنجال! الربع يكفي', en: 'It overflowed! A quarter is enough' },
};

export const FinjanPourModal: React.FC<FinjanPourModalProps> = ({ lang, isOpen, tokens, onFinish, onClose }) => {
  const isAr = lang === 'ar';
  const [fill, setFill] = useState(0);
  const [pouring, setPouring] = useState(false);
  const [result, setResult] = useState<PourGrade | null>(null);
  const fillRef = useRef(0);
  const pouringRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      fillRef.current = 0;
      pouringRef.current = false;
      setFill(0);
      setPouring(false);
      setResult(null);
    }
  }, [isOpen]);

  const finishPour = () => {
    if (!pouringRef.current) return;
    pouringRef.current = false;
    setPouring(false);
    const final = fillRef.current;
    setResult(gradePour(final));
    onFinish(final);
  };

  useEffect(() => {
    if (!pouring) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      fillRef.current = Math.min(100, fillRef.current + FILL_PER_SECOND * dt);
      setFill(fillRef.current);
      if (fillRef.current >= 100) {
        finishPour();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pouring]);

  if (!isOpen) return null;

  const startPour = () => {
    if (result || tokens <= 0) return;
    fillRef.current = 0;
    setFill(0);
    pouringRef.current = true;
    setPouring(true);
  };

  const zoneBottom = POUR_TARGET_PERCENT - POUR_GOOD_TOLERANCE;
  const zoneHeight = POUR_GOOD_TOLERANCE * 2;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? 'تحدي ربع الفنجال' : "Rub'a al-Finjan Challenge"}
      data-testid="finjan-pour-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
    >
      <div className="w-full max-w-sm rounded-2xl border-2 border-[#D99B26] bg-[#241812] text-[#FBF7F0] shadow-2xl overflow-hidden">
        <div className="h-2 w-full sadu-trim" />
        <div className="p-5 text-center">
          <h2 className="text-lg font-bold">{isAr ? 'تحدي ربع الفنجال' : "Rub'a al-Finjan Challenge"}</h2>
          <p className="text-xs text-[#D4A373] mt-1">
            {isAr
              ? 'اضغط مطولاً لصب القهوة وأفلت عند علامة الربع. الكرم أن تصبّ قليلاً وتعيد التعبئة.'
              : 'Hold to pour, release at the quarter mark. Generosity means pouring a little and refilling often.'}
          </p>

          <div className="mt-4 flex justify-center">
            <div
              className="relative w-28 h-40 rounded-b-[2.5rem] rounded-t-lg border-4 border-[#E9C46A] bg-[#1C1410] overflow-hidden"
              data-testid="finjan-glass"
            >
              <div
                className="absolute inset-x-0 bg-[#10B981]/25 border-y border-dashed border-[#10B981]"
                style={{ bottom: `${zoneBottom}%`, height: `${zoneHeight}%` }}
              />
              <div
                className="absolute inset-x-0 border-t-2 border-[#FBBF24]"
                style={{ bottom: `${POUR_TARGET_PERCENT}%` }}
              />
              <div
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3E1F0D] to-[#7C3F1D]"
                style={{ height: `${fill}%` }}
                data-testid="finjan-fill"
              />
            </div>
          </div>
          <p className="text-[10px] text-[#D4A373] mt-1 tabular-nums">
            {isAr ? `الهدف عند علامة الربع (${POUR_TARGET_PERCENT}%)` : `Target ${POUR_TARGET_PERCENT}% ±${POUR_PERFECT_TOLERANCE}`}
          </p>

          {result ? (
            <div className="mt-3" data-testid="finjan-result">
              <p className="text-sm font-extrabold text-[#FDE68A]">{isAr ? GRADE_TEXT[result].ar : GRADE_TEXT[result].en}</p>
              <p className="text-xs text-[#6EE7B7] mt-1 tabular-nums">
                +{POUR_REWARDS[result].coins} SAR
                {POUR_REWARDS[result].gems ? ` · +${POUR_REWARDS[result].gems}💎` : ''}
                {POUR_REWARDS[result].joker ? ` · +${POUR_REWARDS[result].joker} ${isAr ? 'جوكر' : 'Joker'}` : ''}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full rounded-xl bg-[#D97724] hover:bg-[#EA8A35] text-white font-extrabold py-2.5"
              >
                {isAr ? 'تمام' : 'Done'}
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <button
                type="button"
                data-testid="finjan-hold"
                onPointerDown={startPour}
                onPointerUp={finishPour}
                onPointerLeave={finishPour}
                onPointerCancel={finishPour}
                onKeyDown={(e) => {
                  if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                    e.preventDefault();
                    startPour();
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    finishPour();
                  }
                }}
                className="w-full rounded-xl bg-[#10B981] hover:bg-[#0EA371] active:scale-[0.98] text-[#052e22] font-extrabold py-3 touch-none select-none"
              >
                {pouring ? (isAr ? 'اصبّ... أفلت!' : 'Pouring… release!') : isAr ? 'اضغط مطولاً للصب' : 'Hold to pour'}
              </button>
              <button type="button" onClick={onClose} className="text-xs text-[#D4A373] underline">
                {isAr ? 'لاحقاً' : 'Later'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
