import type { GameState } from './rules';

export type TastingGuest = 'faisal' | 'noura';
export type GuestMemory = { guest: TastingGuest; textAr: string; textEn: string };

/** Record each guest's first visit after the gathering, keeping the chosen tray as the memory. */
export function recordTastingVisit(state: GameState, customerId: string): { state: GameState; guest: TastingGuest | null } {
  if (customerId !== 'faisal' && customerId !== 'noura') return { state, guest: null };
  const flags = state.storyFlags ?? {};
  const key = `tasting_visit_${customerId}`;
  if (!flags.tasting_complete || flags[key]) return { state, guest: null };
  const choice = customerId === 'faisal' ? flags.tasting_tray_0 : flags.tasting_tray_1;
  if (customerId === 'faisal' ? choice !== 'traditional' && choice !== 'modern' : choice !== 'sweet' && choice !== 'fragrant') return { state, guest: null };
  return { state: { ...state, storyFlags: { ...flags, [key]: choice } }, guest: customerId };
}

/** Text is derived from the recorded choice, so redesigning the corner does not rewrite the memory. */
export function tastingGuestMemory(flags: Record<string, string>, guest: TastingGuest): GuestMemory | null {
  const choice = flags[`tasting_visit_${guest}`];
  if (guest === 'faisal' && choice === 'traditional') return { guest, textAr: 'فيصل: للحين أذكر صينية القهوة والتمر في لمّتنا. ودي أكررها لضيوف اليوم.', textEn: 'Faisal: I still remember our coffee and dates. I would love to share them with today’s guests.' };
  if (guest === 'faisal' && choice === 'modern') return { guest, textAr: 'فيصل: صينية القهوة المختصة والتمر عجبت ضيوفنا. عطتني فكرة لتقديم جديد.', textEn: 'Faisal: Our guests enjoyed the specialty coffee and dates. It gave me an idea for a new serving.' };
  if (guest === 'noura' && choice === 'fragrant') return { guest, textAr: 'نورة: ما نسيت ريحة العود يوم اجتمعنا. خلت المجلس أدفى.', textEn: 'Noura: I remember the scent of oud when we gathered. It made the majlis feel warmer.' };
  if (guest === 'noura' && choice === 'sweet') return { guest, textAr: 'نورة: التمر الطازج يوم تذوق فيصل ذكّرني بلمّاتنا القديمة.', textEn: 'Noura: The fresh dates at Faisal’s tasting reminded me of our gatherings long ago.' };
  return null;
}
