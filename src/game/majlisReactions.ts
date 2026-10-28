import type { GameState, RenovationZone } from './rules';
import type { RestoredPlaceDetail } from './progression';

/** A small replayable family comment on a restored wing and the player's current style. */
export function majlisReaction(zone: RenovationZone, position: number): { guest: 'noura' | 'faisal'; ar: string; en: string } | null {
  const style = zone.styles[zone.selectedStyle];
  if (zone.unlockedLevel <= 0 || !style) return null;
  return restoredDetailReaction({ nameAr: zone.nameAr, nameEn: zone.nameEn, styleAr: style.nameAr, styleEn: style.nameEn, swatch: style.swatch }, position);
}

/** Reuse the same family words for a saved design, without granting rewards or changing it. */
export function restoredDetailReaction(detail: RestoredPlaceDetail, position: number): { guest: 'noura' | 'faisal'; ar: string; en: string } | null {
  const zone = { nameAr: detail.nameAr, nameEn: detail.nameEn };
  const style = { nameAr: detail.styleAr, nameEn: detail.styleEn };
  if (position === 0) return {
    guest: 'noura',
    ar: `نورة: اختيار «${style.nameAr}» لـ«${zone.nameAr}» يشرح الخاطر. الله يحيي ضيوفنا!`,
    en: `Noura: I love your ${style.nameEn} choice for ${zone.nameEn}. Our guests will feel so welcome!`,
  };
  if (position === 1) return {
    guest: 'noura',
    ar: `نورة: «${zone.nameAr}» بطراز «${style.nameAr}» صار له طابعنا. خلّنا نجتمع فيه.`,
    en: `Noura: Your ${style.nameEn} touch gives ${zone.nameEn} its own character. Let's gather here.`,
  };
  if (position === 2) return {
    guest: 'faisal',
    ar: `فيصل: «${style.nameAr}» لمسة جميلة لـ«${zone.nameAr}». أجهّز فنجال قهوة للضيوف؟`,
    en: `Faisal: ${style.nameEn} is a lovely choice for ${zone.nameEn}. Shall I prepare coffee for our guests?`,
  };
  if (position === 3) return {
    guest: 'noura',
    ar: `نورة: أحب لمسة «${style.nameAr}» في «${zone.nameAr}». المكان أحلى مع اللمّة.`,
    en: `Noura: I like the ${style.nameEn} detail in ${zone.nameEn}. It's even lovelier shared together.`,
  };
  return null;
}

/** Find a comment by this guest about a wing the player has actually restored. */
export function guestMajlisReaction(state: Pick<GameState, 'renovationZones'>, guest: string) {
  for (let position = state.renovationZones.length - 1; position >= 0; position--) {
    const zone = state.renovationZones[position];
    const reaction = majlisReaction(zone, position);
    if (reaction?.guest === guest) return reaction;
  }
  return null;
}
