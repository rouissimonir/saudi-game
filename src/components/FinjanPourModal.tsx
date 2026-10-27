import React, { useEffect, useRef, useState } from 'react';
import {
  Language,
  PourGrade,
  POUR_TARGET_PERCENT,
  POUR_PERFECT_TOLERANCE,
  POUR_GOOD_TOLERANCE,
  POUR_REWARDS,
  gradePour,
  pourPrestige,
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
  overflow: { ar: 'الصبّة أعلى من الربع؛ جرّب الإيقاف مبكراً', en: 'Above the quarter mark; try stopping a little earlier' },
};

export const FinjanPourModal: React.FC<FinjanPourModalProps> = ({ lang, isOpen, tokens, onFinish, onClose }) => {
  const isAr = lang === 'ar';
  const [fill, setFill] = useState(0);
  const [pouring, setPouring] = useState(false);
  const [pourRun, setPourRun] = useState(0);
  const [result, setResult] = useState<PourGrade | null>(null);
  const [practice, setPractice] = useState(tokens <= 0);
  const fillRef = useRef(0);
  const pouringRef = useRef(false);
  const pourGeneration = useRef(0);
  const activePointer = useRef<number | null>(null);
  const keyboardPour = useRef(false);
  const tapPour = useRef(false);

  useEffect(() => {
    if (isOpen) {
      fillRef.current = 0;
      pouringRef.current = false;
      activePointer.current = null;
      keyboardPour.current = false;
      tapPour.current = false;
      setFill(0);
      setPouring(false);
      setResult(null);
      setPractice(tokens <= 0);
    }
  }, [isOpen]);

  const finishPour = () => {
    if (!pouringRef.current) return;
    pouringRef.current = false;
    pourGeneration.current += 1;
    activePointer.current = null;
    keyboardPour.current = false;
    tapPour.current = false;
    setPouring(false);
    const final = fillRef.current;
    setResult(gradePour(final));
    if (!practice) onFinish(final);
  };

  const cancelPour = () => {
    if (!pouringRef.current) return;
    pouringRef.current = false;
    pourGeneration.current += 1;
    activePointer.current = null;
    keyboardPour.current = false;
    tapPour.current = false;
    fillRef.current = 0;
    setFill(0);
    setPouring(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onVisibility = () => { if (document.visibilityState === 'hidden') cancelPour(); };
    window.addEventListener('blur', cancelPour);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('blur', cancelPour);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!pouring) return;
    let raf = 0;
    let last = performance.now();
    const generation = pourGeneration.current;
    const tick = (now: number) => {
      if (!pouringRef.current || generation !== pourGeneration.current) return;
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
  }, [pouring, pourRun]);

  if (!isOpen) return null;

  const startPour = () => {
    if (result || (!practice && tokens <= 0) || pouringRef.current) return false;
    fillRef.current = 0;
    setFill(0);
    pouringRef.current = true;
    pourGeneration.current += 1;
    setPourRun(pourGeneration.current);
    setPouring(true);
    return true;
  };

  const zoneBottom = POUR_TARGET_PERCENT - POUR_GOOD_TOLERANCE;
  const zoneHeight = POUR_GOOD_TOLERANCE * 2;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? 'تحدي ربع الفنجال' : "Rub'a al-Finjan Challenge"}
      data-testid="finjan-pour-modal"
      className="safe-dialog fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
    >
      <div className="w-full max-w-sm max-h-[90dvh] overflow-y-auto rounded-2xl border-2 border-[#D99B26] bg-[#241812] text-[#FBF7F0] shadow-2xl">
        <div className="h-2 w-full sadu-trim" />
        <div className="p-5 text-center">
          <h2 className="text-lg font-bold">{isAr ? 'تحدي ربع الفنجال' : "Rub'a al-Finjan Challenge"}</h2>
          <p className="text-xs text-[#D4A373] mt-1">
            {isAr
              ? 'اضغط مطولاً وأفلت عند علامة الربع، أو اضغط للبدء ثم اضغط للإيقاف.'
              : 'Hold and release at the quarter mark, or tap once to start and again to stop.'}
          </p>
          {!result && <div className="mt-3" data-testid="pour-mode"><div className="flex gap-2 justify-center"><button type="button" disabled={pouring || tokens <= 0} aria-pressed={!practice} onClick={() => setPractice(false)} className={`min-h-11 rounded-lg px-3 text-xs font-bold disabled:opacity-40 ${!practice ? 'bg-[#D99B26] text-[#241812]' : 'bg-white/10'}`}>{isAr ? 'فرصة المكافأة' : 'Reward chance'}</button><button type="button" disabled={pouring} aria-pressed={practice} onClick={() => setPractice(true)} className={`min-h-11 rounded-lg px-3 text-xs font-bold ${practice ? 'bg-[#D99B26] text-[#241812]' : 'bg-white/10'}`}>{isAr ? 'تدريب مجاني' : 'Free practice'}</button></div><p className="mt-1 text-xs text-[#EBD8BA]">{practice ? (isAr ? 'تدرّب بلا مكافأة، ولن تُستخدم فرصتك.' : 'Practice has no reward and does not use your chance.') : (isAr ? `ستُستخدم فرصة واحدة عند إكمال الصب. المتاح: ${tokens}` : `Finishing a pour uses one chance. Available: ${tokens}.`)}</p>{tokens <= 0 && <p className="mt-1 text-xs text-[#EBD8BA]">{isAr ? 'تكسب فرصة مكافأة مع كل ترميم.' : 'Restore a wing to earn another reward chance.'}</p>}</div>}

          <div className="mt-4 flex justify-center">
            <div
              className="relative w-28 h-40 rounded-b-[2.5rem] rounded-t-lg border-4 border-[#E9C46A] bg-[#1C1410] overflow-hidden"
              data-testid="finjan-glass"
              role="progressbar"
              aria-label={isAr ? 'مستوى القهوة' : 'Coffee level'}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(fill)}
              aria-valuetext={isAr ? `${Math.round(fill)}٪، الهدف ${POUR_TARGET_PERCENT}٪` : `${Math.round(fill)}%, target ${POUR_TARGET_PERCENT}%`}
            >
              <div
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3E1F0D] to-[#7C3F1D]"
                style={{ height: `${fill}%` }}
                data-testid="finjan-fill"
              />
              <div aria-hidden="true" className="absolute inset-x-0 bg-[#10B981]/25 border-y border-dashed border-[#10B981]" style={{ bottom: `${zoneBottom}%`, height: `${zoneHeight}%` }} />
              <div aria-hidden="true" className="absolute inset-x-0 border-t-2 border-[#FBBF24]" style={{ bottom: `${POUR_TARGET_PERCENT}%` }} />
            </div>
          </div>
          <p className="text-[10px] text-[#D4A373] mt-1 tabular-nums">
            {isAr ? `الهدف عند علامة الربع (${POUR_TARGET_PERCENT}%)` : `Target ${POUR_TARGET_PERCENT}% ±${POUR_PERFECT_TOLERANCE}`}
          </p>

          {result ? (
            <div className="mt-3" data-testid="finjan-result">
              <p className="text-sm font-extrabold text-[#FDE68A]">{isAr ? GRADE_TEXT[result].ar : GRADE_TEXT[result].en}</p>
              <p className="mt-1 text-xs text-[#EBD8BA]">{isAr ? `صببت ${Math.round(fill)}٪ · الهدف ${POUR_TARGET_PERCENT}٪` : `You poured ${Math.round(fill)}% · target ${POUR_TARGET_PERCENT}%`}</p>
              {practice ? <p data-testid="practice-result" className="text-xs text-[#6EE7B7] mt-1">{isAr ? 'تدريب فقط · لم تُستخدم فرصة ولم تُضف مكافأة' : 'Practice only · no chance used and no reward added'}</p> : <p className="text-xs text-[#6EE7B7] mt-1 tabular-nums">
                +{POUR_REWARDS[result].coins} SAR
                {POUR_REWARDS[result].gems ? ` · +${POUR_REWARDS[result].gems}💎` : ''}
                {POUR_REWARDS[result].joker ? ` · +${POUR_REWARDS[result].joker} ${isAr ? 'جوكر' : 'Joker'}` : ''}
                {` · +${pourPrestige(result)} ${isAr ? 'نقطة سمعة' : 'prestige'}`}
              </p>}
              {practice && <button type="button" onClick={() => { setFill(0); fillRef.current = 0; setResult(null); }} className="mt-3 w-full min-h-11 rounded-xl bg-[#10B981] px-3 py-2 font-bold text-[#052e22]">{isAr ? 'تدرّب مرة أخرى' : 'Practice again'}</button>}
              {practice && tokens > 0 && <button type="button" onClick={() => { setFill(0); fillRef.current = 0; setResult(null); setPractice(false); }} className="mt-2 w-full min-h-11 rounded-xl border border-[#D99B26] px-3 py-2 font-bold">{isAr ? 'استخدم فرصة المكافأة' : 'Use reward chance'}</button>}
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
                disabled={pouring && tapPour.current}
                onPointerDown={(e) => {
                  if (e.button !== 0 || !startPour()) return;
                  activePointer.current = e.pointerId;
                  try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* unavailable for synthetic pointers */ }
                }}
                onPointerUp={(e) => { if (activePointer.current === e.pointerId) finishPour(); }}
                onPointerCancel={(e) => { if (activePointer.current === e.pointerId) cancelPour(); }}
                onLostPointerCapture={(e) => { if (activePointer.current === e.pointerId) cancelPour(); }}
                onKeyDown={(e) => {
                  if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                    e.preventDefault();
                    if (startPour()) keyboardPour.current = true;
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    if (keyboardPour.current) finishPour();
                  }
                }}
                className="w-full rounded-xl bg-[#10B981] hover:bg-[#0EA371] active:scale-[0.98] text-[#052e22] font-extrabold py-3 touch-none select-none"
              >
                {pouring && !tapPour.current ? (isAr ? 'اصبّ... أفلت!' : 'Pouring… release!') : isAr ? 'اضغط مطولاً للصب' : 'Hold to pour'}
              </button>
              <button
                type="button"
                data-testid="finjan-tap"
                disabled={pouring && !tapPour.current}
                onClick={() => {
                  if (tapPour.current && pouringRef.current) finishPour();
                  else if (startPour()) tapPour.current = true;
                }}
                className="w-full min-h-11 rounded-xl border-2 border-[#D99B26] bg-[#3B281A] px-3 py-2 text-sm font-extrabold text-[#FFF4DA] disabled:opacity-40"
              >
                {pouring && tapPour.current ? (isAr ? 'اضغط لإيقاف الصب' : 'Tap to stop pouring') : (isAr ? 'اضغط لبدء الصب' : 'Tap to start pouring')}
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
