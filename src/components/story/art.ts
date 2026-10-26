import { CastId, Expression } from '../../story/types';
import { assetUrl } from '../../utils/assetUrl';

/** Painted expressions per character (docs/ASSETS.md, section 3c); anything else falls back to neutral. */
const EXPRESSIONS: Partial<Record<CastId, Expression[]>> = {
  layla: ['neutral', 'happy', 'surprised', 'worried', 'angry'],
  noura: ['neutral', 'happy', 'surprised', 'worried'],
  rashid: ['neutral', 'angry', 'surprised'],
  faisal: ['neutral', 'happy', 'surprised', 'worried'],
  tariq: ['neutral', 'happy', 'surprised', 'worried'],
  lama: ['neutral', 'happy', 'surprised', 'worried'],
  sultan: ['neutral', 'happy', 'surprised', 'worried'],
};

export function actorSrc(id: CastId, expr: Expression): string {
  const rendered = EXPRESSIONS[id];
  if (rendered) return assetUrl(`assets/art/story/${id}_${rendered.includes(expr) ? expr : 'neutral'}.webp`);
  return assetUrl(`assets/art/characters/${id}.webp`);
}
