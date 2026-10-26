import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { AREA_BG, chapterBg, chapterScene } from './chapterScene';
import { STORY_CHAPTERS } from '../game/rules';
import { findStoryChapter, areaChapterId, AREA_COUNT_BEFORE_PRESTIGE } from '../game/progression';
import { speakerCharacter } from '../game/voiceLines';
import { advance, skip, startScene } from './engine';

const allChapters = () => [
  ...STORY_CHAPTERS,
  ...Array.from({ length: AREA_COUNT_BEFORE_PRESTIGE }, (_, i) => findStoryChapter(areaChapterId(i))).filter((c) => c !== null),
];

// Every chapter speaker is painted; expressions without a painting fall back to neutral in the player.
function artExists(id: string, expr: string): boolean {
  return existsSync(`public/assets/art/story/${id}_${expr}.webp`) || existsSync(`public/assets/art/story/${id}_neutral.webp`);
}

test('every story chapter becomes a playable scene with art and backdrops that exist', () => {
  const chapters = allChapters();
  assert.ok(chapters.length >= 11, `expected the 4 Diriyah chapters plus the area chapters, got ${chapters.length}`);
  for (const chapter of chapters) {
    const scene = chapterScene(chapter, speakerCharacter(chapter.speakerEn));
    assert.equal(scene.beats.length, chapter.dialogueEn.length + 2, chapter.id);
    for (const b of scene.beats) {
      assert.ok(existsSync(`public/assets/art/story/bg_${b.bg}.webp`), `${chapter.id}: missing backdrop ${b.bg}`);
      for (const a of b.cast) assert.ok(artExists(a.id, a.expr), `${chapter.id}: missing art for ${a.id}_${a.expr}`);
      assert.ok(b.textAr && b.textEn, `${chapter.id}/${b.id}: empty line`);
    }
    // Plays through to the end, and skipping lands in the same place.
    let p = startScene(scene);
    for (let i = 0; i < scene.beats.length; i++) p = advance(scene, p);
    assert.ok(p.done, chapter.id);
    assert.ok(skip(scene, startScene(scene)).done);
  }
});

test('the speaker of a chapter is on stage opposite Layla and Layla has the last word', () => {
  const chap2 = STORY_CHAPTERS.find((c) => c.id === 'chap_2')!;
  const scene = chapterScene(chap2, speakerCharacter(chap2.speakerEn));
  assert.deepEqual(scene.beats[1].cast.map((a) => a.id), ['layla', 'faisal']);
  assert.equal(scene.beats[1].speaker, 'faisal');
  assert.equal(scene.beats.at(-1)!.speaker, 'layla');
});

test('each chapter gets its own painted backdrop', () => {
  assert.equal(AREA_BG.length, AREA_COUNT_BEFORE_PRESTIGE);
  assert.equal(chapterBg('chap_3'), 'dallah');
  assert.equal(chapterBg('chap_2'), 'sadu');
  assert.equal(chapterBg('area_1'), 'jeddah');
  assert.equal(chapterBg('area_9'), 'jeddah'); // second lap reuses the area's backdrop
  for (const id of ['chap_1', 'chap_2', 'chap_4', 'area_1', 'area_7', 'area_9']) {
    assert.ok(existsSync(`public/assets/art/story/bg_${chapterBg(id)}.webp`), id);
  }
});
