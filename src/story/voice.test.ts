import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Scene } from './types';
import { storyVoiceId, withStoryVoices } from './voice';
import { STORY_CLIP_IDS } from './voiceIndex';

const scene = (): Scene => ({
  id: 'chapter:test',
  titleAr: 't',
  titleEn: 't',
  beats: [
    { id: 'a', bg: 'street', cast: [], speaker: 'faisal', textAr: 'أهلاً', textEn: 'Hello' },
    { id: 'b', bg: 'street', cast: [], textAr: 'عنوان', textEn: 'Title' },
    { id: 'c', bg: 'street', cast: [], speaker: 'layla', textAr: 'تمام', textEn: 'Fine', voice: 'pro_layla_1' },
  ],
});

test('a clip id depends on who speaks and what is said, and is stable', () => {
  assert.equal(storyVoiceId('faisal', 'أهلاً'), storyVoiceId('faisal', 'أهلاً'));
  assert.notEqual(storyVoiceId('faisal', 'أهلاً'), storyVoiceId('noura', 'أهلاً'));
  assert.notEqual(storyVoiceId('faisal', 'أهلاً'), storyVoiceId('faisal', 'أهلا'));
  assert.match(storyVoiceId('faisal', 'أهلاً'), /^faisal_[0-9a-f]{8}$/);
  assert.match(storyVoiceId(undefined, 'عنوان'), /^narr_[0-9a-f]{8}$/);
});

test('only lines with a recording get a voice; hand-written voice ids are kept', () => {
  const clips = new Set([storyVoiceId('faisal', 'أهلاً'), storyVoiceId('layla', 'تمام')]);
  const out = withStoryVoices(scene(), clips);
  assert.equal(out.beats[0].voice, storyVoiceId('faisal', 'أهلاً'));
  assert.equal(out.beats[1].voice, undefined, 'unrecorded narration stays silent');
  assert.equal(out.beats[2].voice, 'pro_layla_1', 'an explicit id wins');
  assert.equal(scene().beats[0].voice, undefined, 'the input scene is not changed');
});

test('a scene with no recordings is returned untouched', () => {
  const s = scene();
  assert.equal(withStoryVoices(s, new Set()), s);
});

test('every clip in the index exists on disk, and the line list has no duplicate ids', () => {
  for (const id of STORY_CLIP_IDS) assert.ok(existsSync(join('public', 'assets', 'audio', 'story', `${id}.mp3`)), `${id}.mp3 is listed but missing`);
  const lines: { id: string }[] = JSON.parse(readFileSync(join('tools', 'voice', 'story_lines.json'), 'utf8')).lines;
  assert.equal(new Set(lines.map((l) => l.id)).size, lines.length);
  assert.ok(lines.length > 0);
});
