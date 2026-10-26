import { Beat, CastId, Expression, StageActor } from '../types';

type Actor = [CastId, Expression];

/** One line of a hand-written scene: Layla (or whoever) on the left, the other character on the right. */
export function say(
  id: string,
  bg: string,
  left: Actor,
  right: Actor | null,
  speaker: CastId | null,
  textAr: string,
  textEn: string,
  extra: Partial<Beat> = {}
): Beat {
  const cast: StageActor[] = [{ id: left[0], pos: 'left', expr: left[1] }];
  if (right) cast.push({ id: right[0], pos: 'right', expr: right[1] });
  return { id, bg, cast, ...(speaker ? { speaker } : {}), textAr, textEn, ...extra };
}

/** The narrated title card that opens every chapter. */
export function titleCard(bg: string, textAr: string, textEn: string): Beat {
  return { id: 'title', bg, camera: 'pan-down', cast: [], textAr, textEn };
}
