import { Capacitor } from '@capacitor/core';
import type { Language } from '../game/rules';

/** Where friends land today: the playable web version. Swap for the App Store link once the app is live. */
export const INVITE_URL = 'https://rouissimonir.github.io/saudi-game/';

export function inviteText(lang: Language): { title: string; text: string } {
  return lang === 'ar'
    ? { title: 'قهوة ومجلس', text: 'جرّبت لعبة «قهوة ومجلس»: ادمج القهوة والعود، استقبل ضيوفك وأعِد عمار مجالس المملكة ☕' }
    : { title: 'Qahwa & Majlis', text: 'I am playing Qahwa & Majlis: merge coffee and oud, welcome guests and restore the majlises of the Kingdom ☕' };
}

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

/** Opens the system share sheet (the installed app), the browser's share sheet, or copies the link as a last resort. */
export async function shareInvite(lang: Language): Promise<ShareResult> {
  const { title, text } = inviteText(lang);
  try {
    if (Capacitor.isNativePlatform()) {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title, text, url: INVITE_URL, dialogTitle: title });
      return 'shared';
    }
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({ title, text, url: INVITE_URL });
      return 'shared';
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(`${text} ${INVITE_URL}`);
      return 'copied';
    }
    return 'failed';
  } catch (error) {
    const message = error instanceof Error ? `${error.name} ${error.message}` : String(error);
    return /abort|cancel/i.test(message) ? 'cancelled' : 'failed';
  }
}
