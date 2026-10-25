import { GameState } from '../game/rules';
import { Beat, ChoiceOption, Scene, SceneReward } from './types';

/** Progress through one playing of a scene. Pure data, so the player UI and the tests share one reducer. */
export interface ScenePlay {
  sceneId: string;
  beatIndex: number;
  flags: Record<string, string>;
  reward: Required<SceneReward>;
  done: boolean;
}

export function startScene(scene: Scene): ScenePlay {
  return { sceneId: scene.id, beatIndex: 0, flags: {}, reward: { coins: 0, gems: 0, energy: 0 }, done: scene.beats.length === 0 };
}

export function currentBeat(scene: Scene, play: ScenePlay): Beat | null {
  return play.done ? null : scene.beats[play.beatIndex] ?? null;
}

function indexOfBeat(scene: Scene, id: string): number {
  const i = scene.beats.findIndex((b) => b.id === id);
  if (i < 0) throw new Error(`Scene ${scene.id}: unknown beat "${id}"`);
  return i;
}

function goTo(play: ScenePlay, scene: Scene, index: number): ScenePlay {
  return index >= scene.beats.length ? { ...play, done: true } : { ...play, beatIndex: index };
}

/** Beats that can follow the current one (both branches at a choice), so their voice clips can load ahead. */
export function upcomingBeats(scene: Scene, play: ScenePlay): Beat[] {
  const beat = currentBeat(scene, play);
  if (!beat) return [];
  const ids = beat.choice ? beat.choice.map((o) => o.next) : [beat.next ?? scene.beats[play.beatIndex + 1]?.id];
  return ids.flatMap((id) => scene.beats.find((b) => b.id === id) ?? []);
}

/** Next beat; a beat with a choice waits for `choose`. */
export function advance(scene: Scene, play: ScenePlay): ScenePlay {
  const beat = currentBeat(scene, play);
  if (!beat || beat.choice) return play;
  return goTo(play, scene, beat.next ? indexOfBeat(scene, beat.next) : play.beatIndex + 1);
}

export function choose(scene: Scene, play: ScenePlay, optionId: string): ScenePlay {
  const beat = currentBeat(scene, play);
  const option = beat?.choice?.find((o) => o.id === optionId);
  if (!option) return play;
  return goTo(applyChoice(play, option), scene, indexOfBeat(scene, option.next));
}

function applyChoice(play: ScenePlay, option: ChoiceOption): ScenePlay {
  const r = option.reward ?? {};
  return {
    ...play,
    flags: { ...play.flags, [option.flag[0]]: option.flag[1] },
    reward: {
      coins: play.reward.coins + (r.coins ?? 0),
      gems: play.reward.gems + (r.gems ?? 0),
      energy: play.reward.energy + (r.energy ?? 0),
    },
  };
}

/**
 * Skip to the end. Choices still not made take their first option, so later scenes can always read the flag
 * and a skipping player gets the same small reward as one who chose.
 */
export function skip(scene: Scene, play: ScenePlay): ScenePlay {
  let p = play;
  for (let guard = 0; !p.done && guard < scene.beats.length * 2; guard++) {
    const beat = currentBeat(scene, p);
    p = beat?.choice ? choose(scene, p, beat.choice[0].id) : advance(scene, p);
  }
  return { ...p, done: true };
}

/** Records the finished scene on the save: marks it seen, keeps its flags and pays its rewards once. */
export function applySceneResult(state: GameState, play: ScenePlay): GameState {
  const seen = state.seenScenes ?? [];
  if (seen.includes(play.sceneId)) return state;
  return {
    ...state,
    seenScenes: [...seen, play.sceneId],
    storyFlags: { ...state.storyFlags, ...play.flags },
    coins: state.coins + play.reward.coins,
    diamonds: state.diamonds + play.reward.gems,
    energy: state.energy + play.reward.energy,
  };
}
