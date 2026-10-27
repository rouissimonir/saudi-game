import { findCellsForOrder, type GameState } from './rules';

// These flags travel with existing saves and do not interfere with the main story.
export const TASTING_TRAYS = [
  [
    { id: 'traditional', items: ['qahwa_2', 'sweets_2'], en: 'Coffee and dates', ar: 'قهوة وتمر', noteEn: 'Faisal welcomes everyone with a familiar coffee-and-dates gathering.', noteAr: 'فيصل يرحّب بالجميع بلمّة القهوة والتمر المألوفة.' },
    { id: 'modern', items: ['barista_2', 'sweets_2'], en: 'Specialty coffee and dates', ar: 'قهوة مختصة وتمر', noteEn: 'Faisal brings specialty coffee to the gathering alongside dates.', noteAr: 'فيصل يضيف القهوة المختصة إلى اللمّة مع التمر.' },
  ],
  [
    { id: 'sweet', items: ['barista_2', 'sweets_1'], en: 'Coffee and fresh dates', ar: 'قهوة وتمر طازج', noteEn: 'Fresh dates bring Noura memories of gatherings past.', noteAr: 'التمر الطازج يذكّر نورة بلمّات سابقة.' },
    { id: 'fragrant', items: ['qahwa_2', 'oud_1'], en: 'Coffee and oud', ar: 'قهوة وعود', noteEn: 'The scent of oud makes Noura’s welcome feel warmer.', noteAr: 'ريحة العود تضيف دفئاً لضيافة نورة.' },
  ],
] as const;

export const TASTING_STYLES = [
  { id: 'warm', en: 'Warm brass', ar: 'نحاس دافئ', color: '#D4A373' },
  { id: 'green', en: 'Oasis green', ar: 'أخضر الواحة', color: '#2A9D8F' },
  { id: 'rose', en: 'Rose clay', ar: 'طين وردي', color: '#C67860' },
] as const;

export const TASTING_REWARD = { coins: 150, gems: 5 } as const;

/** Tell returning players which part of the gathering remains, regardless of tray order. */
export function tastingNextStep(flags: Record<string, string>): 'first-tray' | 'second-tray' | 'corner' | 'welcome' | 'memory' {
  if (flags.tasting_complete) return 'memory';
  if (!flags.tasting_tray_0) return 'first-tray';
  if (!flags.tasting_tray_1) return 'second-tray';
  if (!flags.tasting_style) return 'corner';
  return 'welcome';
}


/** The gathering can be revisited without changing the save or granting another reward. */
export function gatheringReaction(flags: Record<string, string>, guest: 'faisal' | 'noura'): { ar: string; en: string } | null {
  if (!flags.tasting_complete) return null;
  if (guest === 'faisal' && flags.tasting_tray_0 === 'traditional') return { ar: 'فيصل: القهوة والتمر أحلى بداية للّمة. يا هلا بالجميع!', en: 'Faisal: Coffee and dates are a lovely start to our gathering. Welcome, everyone!' };
  if (guest === 'faisal' && flags.tasting_tray_0 === 'modern') return { ar: 'فيصل: القهوة المختصة مع التمر عطت لمّتنا نكهة جديدة. يا هلا!', en: 'Faisal: Specialty coffee and dates bring something new to our gathering. Welcome!' };
  if (guest === 'noura' && flags.tasting_tray_1 === 'sweet') return { ar: 'نورة: التمر الطازج يذكّرني بلمّاتنا. تفضّلوا!', en: 'Noura: Fresh dates remind me of our gatherings. Please, help yourselves!' };
  if (guest === 'noura' && flags.tasting_tray_1 === 'fragrant') return { ar: 'نورة: ريحة العود مع القهوة تكمّل دفء المجلس. تفضّلوا!', en: 'Noura: The scent of oud and coffee makes the majlis feel warm. Please, come in!' };
  return null;
}

export function prepareTastingTray(state: GameState, tray: 0 | 1, choice: number): GameState {
  const flags = state.storyFlags ?? {};
  const key = `tasting_tray_${tray}`;
  const recipe = TASTING_TRAYS[tray][choice];
  if (!recipe || flags[key]) return state;
  const indices = findCellsForOrder(state.board, [...recipe.items]);
  if (!indices) return state;
  return {
    ...state,
    board: state.board.map(cell => indices.includes(cell.index) ? { ...cell, itemId: null } : cell),
    selectedCellIndex: null,
    storyFlags: { ...flags, [key]: recipe.id },
  };
}

export function setTastingStyle(state: GameState, style: string): GameState {
  const flags = state.storyFlags ?? {};
  if (!flags.tasting_tray_0 || !flags.tasting_tray_1 || !TASTING_STYLES.some(s => s.id === style)) return state;
  return { ...state, storyFlags: { ...flags, tasting_style: style } };
}

export function hostTasting(state: GameState): GameState {
  const flags = state.storyFlags ?? {};
  if (!flags.tasting_tray_0 || !flags.tasting_tray_1 || !flags.tasting_style || flags.tasting_complete) return state;
  return { ...state, coins: state.coins + TASTING_REWARD.coins, diamonds: state.diamonds + TASTING_REWARD.gems, storyFlags: { ...flags, tasting_complete: 'yes' } };
}
