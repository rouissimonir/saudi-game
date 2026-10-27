import type { RenovationZone } from './rules';

/** A small replayable family comment on a restored wing and the player's current style. */
export function majlisReaction(zone: RenovationZone, position: number): { guest: 'noura' | 'faisal'; ar: string; en: string } | null {
  const style = zone.styles[zone.selectedStyle];
  if (zone.unlockedLevel <= 0 || !style) return null;
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
