import { findCellsForOrder, type GameState } from './rules';

/** The rose perfume is for scenting the setting, never an ingredient in a drink. */
export const TAIF_WELCOMES = [
  { id: 'dates', items: ['oud_3', 'sweets_2'], nameAr: 'ورد وتمر', nameEn: 'Rose scent and dates' },
  { id: 'coffee', items: ['oud_3', 'barista_3'], nameAr: 'ورد وقهوة مختصة', nameEn: 'Rose scent and specialty coffee' },
] as const;

/** Remember both the chapter's drink and the separate welcome prepared afterward. */
export function taifWelcomeReflection(welcome: string | undefined, storyChoice: string | undefined): { ar: string; en: string } | null {
  if (welcome !== 'dates' && welcome !== 'coffee') return null;
  const welcomeLine = welcome === 'dates'
    ? { ar: 'نورة: ريحة الورد مع التمر خلت ضيافتنا دافئة.', en: 'Noura: The scent of roses and the dates made our welcome feel warm.' }
    : { ar: 'نورة: ريحة الورد مع القهوة المختصة خلت ضيافتنا دافئة.', en: 'Noura: The scent of roses and the specialty coffee made our welcome feel warm.' };
  const storyLine = storyChoice === 'rose'
    ? { ar: ' وأذكر فنجال جدّك بماء الورد.', en: ' I still remember your grandfather’s rose-water coffee.' }
    : storyChoice === 'pomegranate'
      ? { ar: ' وأذكر مشروب الورد والرمان اللي اخترتيه للصغار.', en: ' I still remember the rose-and-pomegranate drink you chose for the children.' }
      : { ar: '', en: '' };
  return { ar: welcomeLine.ar + storyLine.ar, en: welcomeLine.en + storyLine.en };
}

export function taifWelcomeAvailable(state: GameState): boolean {
  return state.areaIndex > 3 || (state.areaIndex === 3 && state.completedStoryIds.includes('area_3'));
}

export function prepareTaifWelcome(state: GameState, choice: number): GameState {
  const recipe = TAIF_WELCOMES[choice];
  if (!taifWelcomeAvailable(state) || !recipe || state.storyFlags?.taif_welcome) return state;
  const cells = findCellsForOrder(state.board, [...recipe.items]);
  if (!cells) return state;
  return {
    ...state,
    board: state.board.map(cell => cells.includes(cell.index) ? { ...cell, itemId: null } : cell),
    selectedCellIndex: null,
    coins: state.coins + 150,
    energy: state.energy + 20,
    storyFlags: { ...state.storyFlags, taif_welcome: recipe.id },
  };
}
