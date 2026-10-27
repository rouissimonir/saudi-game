import type { GameState } from './rules';
import { TASTING_TRAYS } from './tasting';
import { TAIF_WELCOMES, taifWelcomeAvailable } from './taifWelcome';

export type HospitalityFocus = { kind: 'tasting' | 'taif'; items: readonly string[]; nameAr: string; nameEn: string };

/** Resolve only known, unfinished recipes; old saves and obsolete focus IDs remain harmless. */
export function hospitalityFocus(state: GameState): HospitalityFocus | null {
  const value = state.storyFlags?.hospitality_focus;
  for (const [index, choices] of TASTING_TRAYS.entries()) {
    const recipe = choices.find(choice => value === `tasting:${choice.id}`);
    if (recipe && !state.storyFlags?.[`tasting_tray_${index}`] && !state.storyFlags?.tasting_complete) {
      return { kind: 'tasting', items: recipe.items, nameAr: recipe.ar, nameEn: recipe.en };
    }
  }
  const welcome = TAIF_WELCOMES.find(choice => value === `taif:${choice.id}`);
  if (welcome && !state.storyFlags?.taif_welcome && taifWelcomeAvailable(state)) {
    return { kind: 'taif', items: welcome.items, nameAr: welcome.nameAr, nameEn: welcome.nameEn };
  }
  return null;
}

/** Store a recipe ID, never player-provided item lists or translated text. */
export function setHospitalityFocus(state: GameState, focus: HospitalityFocus | null): GameState {
  const flags = { ...state.storyFlags };
  if (!focus) {
    if (!flags.hospitality_focus) return state;
    delete flags.hospitality_focus;
  } else {
    const sameItems = (items: readonly string[]) => items.length === focus.items.length && items.every((item, i) => item === focus.items[i]);
    const recipe = focus.kind === 'tasting' ? TASTING_TRAYS.flat().find(item => sameItems(item.items)) : TAIF_WELCOMES.find(item => sameItems(item.items));
    if (!recipe) return state;
    flags.hospitality_focus = `${focus.kind}:${recipe.id}`;
    if (!hospitalityFocus({ ...state, storyFlags: flags })) return state;
  }
  return { ...state, storyFlags: flags };
}
