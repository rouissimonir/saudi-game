import { CastId, Expression } from '../../story/types';
import { assetUrl } from '../../utils/assetUrl';

/** Painted expressions per character (docs/ASSETS.md, section 3c); anything else falls back to neutral. */
const EXPRESSIONS: Partial<Record<CastId, Expression[]>> = {
  layla: ['neutral', 'happy', 'surprised', 'worried', 'angry'],
  noura: ['neutral', 'happy', 'surprised', 'worried'],
  rashid: ['neutral', 'angry', 'surprised'],
};

/** Characters with an illustrated expression set (public/assets/art/characters/illustrated), used until they are painted. */
const ILLUSTRATED = new Set<CastId>(['faisal', 'tariq', 'lama', 'sultan']);

export function actorSrc(id: CastId, expr: Expression): string {
  const rendered = EXPRESSIONS[id];
  if (rendered) return assetUrl(`assets/art/story/${id}_${rendered.includes(expr) ? expr : 'neutral'}.webp`);
  if (ILLUSTRATED.has(id)) return assetUrl(`assets/art/characters/illustrated/${id}_${expr}.webp`);
  return assetUrl(`assets/art/characters/${id}.webp`);
}
