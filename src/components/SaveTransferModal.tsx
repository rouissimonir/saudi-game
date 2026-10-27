import React, { useEffect, useState } from 'react';
import { ArrowRightLeft, Check, Copy, Share2, Upload, X } from 'lucide-react';
import { GameState, Language } from '../game/rules';
import { exportSaveCode, importSaveCode } from '../utils/saveTransfer';

/** Move progress to another phone or browser with a copy-and-paste code (no account needed). */
export const SaveTransferModal: React.FC<{
  lang: Language;
  state: GameState;
  onClose: () => void;
  onImport: (state: GameState) => void;
  allowExport?: boolean;
}> = ({ lang, state, onClose, onImport, allowExport = true }) => {
  const isAr = lang === 'ar';
  const [code, setCode] = useState('');
  const [exportError, setExportError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState<GameState | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!allowExport) return;
    let alive = true;
    exportSaveCode(state).then((c) => alive && setCode(c)).catch(() => { if (alive) setExportError(true); });
    return () => {
      alive = false;
    };
    // The code is a snapshot taken when the sheet opens.
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  const share = () => navigator.share?.({ title: isAr ? 'تقدمي في قهوة ومجلس' : 'My Qahwa & Majlis save', text: code }).catch(() => {});

  const check = async () => {
    const parsed = await importSaveCode(input);
    setError(!parsed);
    setPending(parsed);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={isAr ? 'نقل التقدم' : 'Transfer progress'} data-testid="transfer-modal" className="safe-dialog fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 p-3" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border-[3px] border-[#D97706] shadow-2xl overflow-hidden text-[#2C1E14]" onClick={(e) => e.stopPropagation()}>
        <div className="h-2 w-full sadu-trim" />
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h2 className="flex items-center gap-2 text-lg font-black text-[#78350F]">
            <ArrowRightLeft className="w-5 h-5 text-[#B45309]" />
            {isAr ? 'نقل التقدم' : 'Transfer progress'}
          </h2>
          <button type="button" onClick={onClose} aria-label={isAr ? 'إغلاق' : 'Close'} className="w-9 h-9 rounded-full hud-pill flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 pb-4 space-y-3 max-h-[75vh] overflow-y-auto">
          {allowExport && <section className="rounded-2xl border-2 border-[#E7D3AE] bg-white p-3 space-y-2">
            <p className="text-sm font-extrabold">{isAr ? '١. من هذا الجهاز' : '1. From this device'}</p>
            <p className="text-xs text-[#78350F]/80">{isAr ? 'انسخ الرمز وأرسله لنفسك، ثم الصقه في الجهاز الجديد.' : 'Copy the code, send it to yourself, then paste it on the new device.'}</p>
            <textarea readOnly value={code} rows={3} data-testid="transfer-code" className="w-full rounded-xl border border-[#E7D3AE] bg-[#FFFBF2] p-2 text-[10px] font-mono break-all" onFocus={(e) => e.currentTarget.select()} />
            {exportError && <p className="text-xs font-bold text-[#B91C1C]">{isAr ? 'تعذّر إنشاء الرمز. أغلق النافذة وحاول مجدداً.' : 'Could not create the code. Close this window and try again.'}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={copy} disabled={!code} className="flex-1 rounded-xl btn-3d-amber text-[#3B2410] text-sm font-extrabold py-2 inline-flex items-center justify-center gap-1.5 disabled:opacity-40">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ' : 'Copy'}
              </button>
              {'share' in navigator && (
                <button type="button" onClick={share} disabled={!code} className="flex-1 rounded-xl btn-3d-green text-white text-sm font-extrabold py-2 inline-flex items-center justify-center gap-1.5 disabled:opacity-40">
                  <Share2 className="w-4 h-4" />
                  {isAr ? 'مشاركة' : 'Share'}
                </button>
              )}
            </div>
          </section>}

          <section className="rounded-2xl border-2 border-[#E7D3AE] bg-white p-3 space-y-2">
            <p className="text-sm font-extrabold">{isAr ? '٢. إلى هذا الجهاز' : '2. Onto this device'}</p>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setPending(null);
                setError(false);
              }}
              rows={3}
              data-testid="transfer-input"
              placeholder={isAr ? 'الصق الرمز هنا (يبدأ بـ QM1.)' : 'Paste the code here (starts with QM1.)'}
              className="w-full rounded-xl border border-[#E7D3AE] bg-[#FFFBF2] p-2 text-[10px] font-mono break-all"
            />
            {error && <p className="text-xs font-bold text-[#B91C1C]">{isAr ? 'الرمز غير صالح أو ناقص.' : 'That code is not valid or is incomplete.'}</p>}
            {pending ? (
              <div className="rounded-xl bg-[#FEF3C7] border border-[#F59E0B] p-2 space-y-2">
                <p className="text-xs font-bold text-[#78350F]">
                  {isAr
                    ? `سيستبدل تقدمك الحالي بتقدم المستوى ${pending.level} (${pending.coins} ريال، ${pending.diamonds} جوهرة). لا يمكن التراجع.`
                    : `This replaces your current progress with a level ${pending.level} save (${pending.coins} SAR, ${pending.diamonds} gems). This cannot be undone.`}
                </p>
                <button type="button" data-testid="transfer-confirm" onClick={() => onImport(pending)} className="w-full rounded-xl bg-[#B91C1C] text-white text-sm font-extrabold py-2">
                  {isAr ? 'نعم، استبدل التقدم' : 'Yes, replace my progress'}
                </button>
              </div>
            ) : (
              <button type="button" data-testid="transfer-check" onClick={check} disabled={!input.trim()} className="w-full rounded-xl btn-3d-green text-white text-sm font-extrabold py-2 inline-flex items-center justify-center gap-1.5 disabled:opacity-40">
                <Upload className="w-4 h-4" />
                {isAr ? 'تحميل التقدم' : 'Load progress'}
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
