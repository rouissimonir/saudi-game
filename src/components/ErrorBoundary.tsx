import React from 'react';
import { restoreBackupSave } from '../utils/saveStorage';

const CRASH_KEY = 'qahwa_crash_count';

function readLang(): 'ar' | 'en' {
  try { return localStorage.getItem('qahwa_lang') === 'en' ? 'en' : 'ar'; } catch { return 'ar'; }
}

function bumpCrashCount(): number {
  try {
    const n = Number(sessionStorage.getItem(CRASH_KEY) ?? '0') + 1;
    sessionStorage.setItem(CRASH_KEY, String(n));
    return n;
  } catch { return 1; }
}

/**
 * A render error used to leave a blank screen with no way out. This keeps the save untouched (it lives in
 * localStorage, not in memory) and offers Reload; if the game crashes again in the same session it also offers the
 * previous backup save.
 */
export class ErrorBoundary extends React.Component<{ children?: React.ReactNode }, { crashed: boolean; count: number }> {
  state = { crashed: false, count: 0 };

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Game crashed while rendering:', error);
    this.setState({ count: bumpCrashCount() });
  }

  private reload = () => { window.location.reload(); };

  private useBackup = () => {
    restoreBackupSave();
    try { sessionStorage.removeItem(CRASH_KEY); } catch { /* ignore */ }
    window.location.reload();
  };

  render() {
    if (!this.state.crashed) return this.props.children;
    const isAr = readLang() === 'ar';
    return (
      <div role="alert" data-testid="crash-screen" dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen flex items-center justify-center p-6 bg-[#1C1410] text-[#FBF7F0]">
        <div className="w-full max-w-sm rounded-2xl border-2 border-[#D99B26] bg-[#241812] p-5 text-center shadow-2xl">
          <div className="text-4xl" aria-hidden="true">☕</div>
          <h1 className="mt-2 text-lg font-black">{isAr ? 'انسكب الفنجال!' : 'Oops, the finjan spilled!'}</h1>
          <p className="mt-2 text-sm text-[#D4A373]">
            {isAr ? 'حدث خطأ غير متوقع. تقدمك محفوظ على جهازك. أعد تشغيل اللعبة للمتابعة.' : 'Something unexpected happened. Your progress is saved on this device. Reload to keep playing.'}
          </p>
          <button type="button" onClick={this.reload} className="mt-4 min-h-11 w-full rounded-xl bg-[#10B981] px-4 py-2 text-sm font-black text-white">
            {isAr ? 'إعادة تشغيل اللعبة' : 'Reload the game'}
          </button>
          {this.state.count >= 2 && (
            <button type="button" onClick={this.useBackup} data-testid="crash-use-backup" className="mt-2 min-h-11 w-full rounded-xl border border-[#D99B26] px-4 py-2 text-sm font-bold text-[#FBBF24]">
              {isAr ? 'استعادة النسخة الاحتياطية السابقة' : 'Use the previous backup save'}
            </button>
          )}
        </div>
      </div>
    );
  }
}
