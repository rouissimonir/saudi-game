import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advance, applySceneResult, choose, currentBeat, skip, startScene } from './engine';
import { Scene } from './types';
import { createInitialGameState } from '../game/rules';
import { normalizeSave } from '../game/normalizeSave';

const scene: Scene = {
  id: 'demo',
  titleAr: 'تجربة',
  titleEn: 'Demo',
  beats: [
    { id: 'a', bg: 'street', cast: [], textAr: 'أ', textEn: 'A' },
    {
      id: 'ask', bg: 'street', cast: [], textAr: 'ب', textEn: 'B',
      choice: [
        { id: 'firm', textAr: 'ح', textEn: 'Firm', flag: ['rivalry', 'firm'], reward: { gems: 5 }, next: 'firm1' },
        { id: 'polite', textAr: 'ل', textEn: 'Polite', flag: ['rivalry', 'polite'], reward: { coins: 100 }, next: 'polite1' },
      ],
    },
    { id: 'firm1', bg: 'street', cast: [], textAr: 'ج', textEn: 'Firm reply', next: 'end' },
    { id: 'polite1', bg: 'street', cast: [], textAr: 'د', textEn: 'Polite reply' },
    { id: 'end', bg: 'street', cast: [], textAr: 'هـ', textEn: 'End' },
  ],
};

test('advance walks the beats and waits at a choice until one is made', () => {
  let p = startScene(scene);
  assert.equal(currentBeat(scene, p)?.id, 'a');
  p = advance(scene, p);
  assert.equal(currentBeat(scene, p)?.id, 'ask');
  assert.equal(advance(scene, p), p, 'cannot advance past an unanswered choice');
});

test('each choice sets its flag, pays its reward and follows its own branch before rejoining', () => {
  const atChoice = advance(scene, startScene(scene));
  let firm = choose(scene, atChoice, 'firm');
  assert.equal(currentBeat(scene, firm)?.id, 'firm1');
  assert.deepEqual(firm.flags, { rivalry: 'firm' });
  assert.equal(firm.reward.gems, 5);
  firm = advance(scene, firm);
  assert.equal(currentBeat(scene, firm)?.id, 'end', 'firm branch skips the polite reply');
  assert.ok(advance(scene, firm).done);

  const polite = choose(scene, atChoice, 'polite');
  assert.equal(currentBeat(scene, polite)?.id, 'polite1');
  assert.equal(polite.reward.coins, 100);
  assert.equal(currentBeat(scene, advance(scene, polite))?.id, 'end');
});

test('skip finishes the scene and still takes the first option of an unanswered choice', () => {
  const p = skip(scene, startScene(scene));
  assert.ok(p.done);
  assert.deepEqual(p.flags, { rivalry: 'firm' });
  assert.equal(p.reward.gems, 5);
});

test('finishing a scene marks it seen, keeps the flags and pays the reward only once', () => {
  const s0 = createInitialGameState();
  assert.deepEqual(s0.seenScenes, [], 'new players have not seen the prologue');
  const played = skip(scene, startScene(scene));
  const s1 = applySceneResult(s0, played);
  assert.deepEqual(s1.seenScenes, ['demo']);
  assert.equal(s1.storyFlags.rivalry, 'firm');
  assert.equal(s1.diamonds, s0.diamonds + 5);
  assert.equal(applySceneResult(s1, played), s1, 'replaying from the menu pays nothing again');
});

test('saves from before story scenes skip the prologue; new saves keep their seen list', () => {
  const legacy: Record<string, unknown> = { ...createInitialGameState() };
  delete legacy.seenScenes;
  delete legacy.storyFlags;
  const loaded = normalizeSave(legacy);
  assert.ok(loaded);
  assert.deepEqual(loaded.seenScenes, ['prologue']);
  assert.deepEqual(loaded.storyFlags, {});
  const fresh = normalizeSave({ ...createInitialGameState() });
  assert.deepEqual(fresh?.seenScenes, []);
});

test('every scene is well formed: unique beat ids, jumps land on real beats, choices have two options', async () => {
  const { SCENES } = await import('./scenes');
  for (const scene of Object.values(SCENES)) {
    const ids = scene.beats.map((b) => b.id);
    assert.equal(new Set(ids).size, ids.length, `${scene.id}: duplicate beat ids`);
    for (const b of scene.beats) {
      if (b.next) assert.ok(ids.includes(b.next), `${scene.id}/${b.id}: next "${b.next}" missing`);
      for (const o of b.choice ?? []) assert.ok(ids.includes(o.next), `${scene.id}/${b.id}: choice next "${o.next}" missing`);
      assert.ok(b.textAr.trim() && b.textEn.trim(), `${scene.id}/${b.id}: missing text`);
      if (b.speaker) assert.ok(b.cast.length === 0 || b.cast.some((c) => c.id === b.speaker) || b.speaker === 'noura', `${scene.id}/${b.id}: speaker off stage`);
    }
    // both branches of the prologue reach the end
    const end = scene.beats[scene.beats.length - 1].id;
    for (const b of scene.beats.filter((x) => x.choice)) {
      for (const o of b.choice!) {
        let p = choose(scene, { sceneId: scene.id, beatIndex: ids.indexOf(b.id), flags: {}, reward: { coins: 0, gems: 0, energy: 0 }, done: false }, o.id);
        let guard = 0;
        while (!p.done && currentBeat(scene, p)?.id !== end && guard++ < 50) p = advance(scene, p);
        assert.equal(currentBeat(scene, p)?.id, end, `${scene.id}: branch ${o.id} never reaches the end`);
      }
    }
  }
});

test('chapter 1 remembers the prologue choice with one extra line; other chapters and old saves are unchanged', async () => {
  const { withStoryFlags } = await import('./flags');
  const { STORY_CHAPTERS } = await import('../game/rules');
  const ch1 = STORY_CHAPTERS[0];
  const firm = withStoryFlags(ch1, { rivalry: 'firm' })!;
  const polite = withStoryFlags(ch1, { rivalry: 'polite' })!;
  assert.equal(firm.dialogueEn.length, ch1.dialogueEn.length + 1);
  assert.match(firm.dialogueEn.at(-1)!, /stood up to Rashid/);
  assert.match(polite.dialogueEn.at(-1)!, /polite answer/);
  assert.equal(firm.dialogueAr.length, ch1.dialogueAr.length + 1);
  assert.equal(withStoryFlags(ch1, {}), ch1);
  assert.equal(withStoryFlags(STORY_CHAPTERS[1], { rivalry: 'firm' }), STORY_CHAPTERS[1]);
});

test('every prologue line is voiced and its audio file exists', async () => {
  const { existsSync } = await import('node:fs');
  const { PROLOGUE } = await import('./scenes/prologue');
  for (const b of PROLOGUE.beats) {
    assert.ok(b.voice, `beat "${b.id}" has no voice clip`);
    assert.ok(existsSync(`public/assets/audio/story/${b.voice}.mp3`), `missing public/assets/audio/story/${b.voice}.mp3`);
  }
});
