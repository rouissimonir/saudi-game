import type { Beat, Scene } from './types';
import { STORY_CLIP_IDS } from './voiceIndex';

/**
 * Voice clips for story scenes. A line's clip id comes from who says it and its Arabic text, so:
 *  - the same line shared by two chapters or choice branches uses one clip;
 *  - editing a line changes its id, so a stale recording can never play over new text;
 *  - nothing in the scripts needs a hand-written `voice` field (the prologue's explicit ids still win).
 * `npm run voice:story` lists every line and which ones have a file; `tools/voice/generate_elevenlabs.py --set story`
 * records the missing ones into public/assets/audio/story/<id>.mp3.
 */

/** Speakers without a CastId (title cards, choice prompts) are voiced by the narrator. */
export const NARRATOR = 'narr';

/** `<speaker>_<8 hex>`: FNV-1a over speaker and text. The export tool uses this same function. */
export function storyVoiceId(speaker: string | undefined, textAr: string): string {
  const who = speaker ?? NARRATOR;
  const s = `${who}|${textAr}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `${who}_${(h >>> 0).toString(16).padStart(8, '0')}`;
}

const CLIPS: ReadonlySet<string> = new Set(STORY_CLIP_IDS);

/** Gives every beat whose line has a recording its `voice` id. Beats without a recording stay silent, as before. */
export function withStoryVoices(scene: Scene, clips: ReadonlySet<string> = CLIPS): Scene {
  let changed = false;
  const beats = scene.beats.map((beat): Beat => {
    if (beat.voice) return beat;
    const id = storyVoiceId(beat.speaker, beat.textAr);
    if (!clips.has(id)) return beat;
    changed = true;
    return { ...beat, voice: id };
  });
  return changed ? { ...scene, beats } : scene;
}
