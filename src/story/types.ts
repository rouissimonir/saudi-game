/**
 * Animated story scenes (Hollywood Merge-style): a scene is a list of beats; each beat stages up to three
 * characters with an expression, shows one line in a speech bubble (optionally voiced), moves the camera and can
 * offer a two-option choice whose flag later scenes can read.
 */

export type CastId = 'layla' | 'noura' | 'rashid' | 'faisal' | 'lama' | 'tariq' | 'sultan' | 'ghabga';
export type Expression = 'neutral' | 'happy' | 'surprised' | 'worried' | 'angry';
export type StagePos = 'left' | 'center' | 'right';
export type CameraMove = 'none' | 'pan-down' | 'zoom-in' | 'push' | 'shake';
export type BeatEffect = 'dallah-to-board';

export interface StageActor {
  id: CastId;
  pos: StagePos;
  expr: Expression;
}

export interface SceneReward {
  coins?: number;
  gems?: number;
  energy?: number;
}

export interface ChoiceOption {
  id: string;
  textAr: string;
  textEn: string;
  /** Story flag this choice sets, e.g. ['rivalry', 'firm']. */
  flag: [string, string];
  reward?: SceneReward;
  /** Beat id to continue with. */
  next: string;
}

export interface Beat {
  id: string;
  /** Background key, resolved to public/assets/art/story/bg_<key>.webp (plus an optional _fg layer). */
  bg: string;
  camera?: CameraMove;
  cast: StageActor[];
  /** Who is talking; omitted for narration. */
  speaker?: CastId;
  textAr: string;
  textEn: string;
  /** Voice clip id, resolved to public/assets/audio/story/<id>.mp3. */
  voice?: string;
  choice?: [ChoiceOption, ChoiceOption];
  /** Beat id to jump to instead of the next one (used to rejoin after a choice branch). */
  next?: string;
  effect?: BeatEffect;
}

export interface Scene {
  id: string;
  titleAr: string;
  titleEn: string;
  beats: Beat[];
}

export const CAST_NAMES: Record<CastId, { ar: string; en: string }> = {
  layla: { ar: 'ليلى', en: 'Layla' },
  noura: { ar: 'الجدة نورة', en: 'Grandma Noura' },
  rashid: { ar: 'راشد', en: 'Rashid' },
  faisal: { ar: 'فيصل', en: 'Faisal' },
  lama: { ar: 'لمى', en: 'Lama' },
  tariq: { ar: 'الشيخ طارق', en: 'Sheikh Tariq' },
  sultan: { ar: 'سلطان', en: 'Sultan' },
  ghabga: { ar: 'لجنة الغبقة', en: 'The Ghabga Jury' },
};
