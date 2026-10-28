import { Beat, Scene } from '../types';
import { say } from './build';
import type { DraftLine, HostDraft } from '../hostDrafts';

const toBeat = (line: DraftLine, bg: string, host: HostDraft['host']): Beat =>
  say(line.id, bg, ['layla', line.layla], [host, line.host], line.speaker, line.ar, line.en);

/**
 * Adds a local host to an area chapter (docs/ART_BATCH_8.md, src/story/hostDrafts.ts) without touching its story:
 * - the host's opening comes right after the title card;
 * - the reaction to each choice comes right after the first beat of that choice's branch;
 * - the closing gift comes before the chapter's `end` beat, and every jump to `end` is routed through it, so both
 *   branches meet the host on the way out.
 * Choices, flags, rewards and the existing lines are left exactly as they were.
 */
export function withHost(scene: Scene, draft: HostDraft | undefined): Scene {
  if (!draft) return scene;
  const bg = scene.beats[0].bg;
  const reactionAfter = new Map<string, DraftLine>();
  for (const option of scene.beats.find((b) => b.choice)?.choice ?? []) {
    const line = draft.afterChoice[option.id];
    if (line) reactionAfter.set(option.next, line);
  }
  const beats: Beat[] = [];
  for (const original of scene.beats) {
    const beat: Beat = original.next === 'end' ? { ...original, next: draft.closing.id } : original;
    const reaction = reactionAfter.get(beat.id);
    if (reaction && beat.next !== undefined) {
      // The branch's first beat jumps elsewhere: hand its jump to the reaction so the host is still heard first.
      beats.push({ ...beat, next: undefined }, { ...toBeat(reaction, bg, draft.host), next: beat.next });
    } else {
      beats.push(beat);
      if (reaction) beats.push(toBeat(reaction, bg, draft.host));
    }
    if (beat.id === 'title') for (const line of draft.opening) beats.push(toBeat(line, bg, draft.host));
  }
  const end = beats.findIndex((b) => b.id === 'end');
  beats.splice(end, 0, toBeat(draft.closing, bg, draft.host));
  return { ...scene, beats };
}
