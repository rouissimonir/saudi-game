import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AREA_SCENES } from './scenes/areaChapters';
import { HOST_DRAFTS, hostDraftFor } from './hostDrafts';

const ARABIC = /[؀-ۿ]/;
const MAX_AR = 90; // the longest line in the existing area chapters is 87 characters
const MAX_EN = 120; // and 119

test('there is one draft per area chapter, each with its own host', () => {
  assert.deepEqual(HOST_DRAFTS.map((d) => d.chapterId).sort(), Object.keys(AREA_SCENES).sort());
  assert.equal(new Set(HOST_DRAFTS.map((d) => d.host)).size, HOST_DRAFTS.length);
  assert.equal(hostDraftFor('area_3')?.host, 'hessa');
});

test('each draft plugs into its chapter: the choice options, insertion points and end beat exist', () => {
  for (const draft of HOST_DRAFTS) {
    const beats = AREA_SCENES[draft.chapterId]({}).beats;
    const ids = new Set(beats.map((b) => b.id));
    const choice = beats.find((b) => b.choice)?.choice;
    assert.ok(choice, `${draft.chapterId} has a choice`);
    assert.deepEqual(Object.keys(draft.afterChoice).sort(), choice.map((o) => o.id).sort(), `${draft.chapterId}: draft covers exactly the real options`);
    for (const o of choice) assert.ok(ids.has(o.next), `${draft.chapterId}: ${o.id} continues at an existing beat (${o.next})`);
    assert.ok(ids.has('end'), `${draft.chapterId} has an end beat to insert before`);
  }
});

test('draft lines are complete, fit the speech bubble and never reuse a beat id', () => {
  for (const draft of HOST_DRAFTS) {
    const existing = new Set(AREA_SCENES[draft.chapterId]({}).beats.map((b) => b.id));
    const lines = [...draft.opening, ...Object.values(draft.afterChoice), draft.closing];
    const seen = new Set<string>();
    for (const l of lines) {
      const where = `${draft.chapterId}/${l.id}`;
      assert.ok(l.speaker === 'layla' || l.speaker === draft.host, `${where}: only Layla and the host speak`);
      assert.ok(l.ar.length > 0 && l.en.length > 0, `${where}: both languages`);
      assert.ok(ARABIC.test(l.ar) && !ARABIC.test(l.en), `${where}: Arabic is Arabic, English is English`);
      assert.ok(l.ar.length <= MAX_AR, `${where}: Arabic is ${l.ar.length} characters (max ${MAX_AR})`);
      assert.ok(l.en.length <= MAX_EN, `${where}: English is ${l.en.length} characters (max ${MAX_EN})`);
      assert.ok(!existing.has(l.id) && !seen.has(l.id), `${where}: beat id is unique in the chapter`);
      seen.add(l.id);
    }
    assert.equal(draft.opening[0].speaker, draft.host, `${draft.chapterId}: the host speaks first`);
    assert.ok(draft.keepsake.ar && draft.keepsake.en, `${draft.chapterId}: has a keepsake`);
  }
});
