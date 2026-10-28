import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Beat, Scene } from './types';
import { AREA_SCENES, BASE_AREA_SCENES } from './scenes/areaChapters';
import { HOST_DRAFTS } from './hostDrafts';

const FLAGS: Record<string, string>[] = [{}, { rashid_ch4: 'welcome', jeddah: 'rawshan', abha: 'farmers', riyadh: 'partner', menu: 'fusion', tariq: 'blend' }];

/** The beats a player sees when picking the nth option at the choice: sequential unless a beat jumps. */
function walk(scene: Scene, pick: number): string[] {
  const byId = new Map(scene.beats.map((b, i) => [b.id, i]));
  const seen: string[] = [];
  let i = 0;
  for (let guard = 0; guard < 200 && i < scene.beats.length; guard++) {
    const b: Beat = scene.beats[i];
    seen.push(b.id);
    if (b.choice) i = byId.get(b.choice[pick].next)!;
    else if (b.next) i = byId.get(b.next)!;
    else i += 1;
  }
  return seen;
}

test('every chapter has its host on both choices: opening, the right reaction and the closing gift', () => {
  for (const draft of HOST_DRAFTS) {
    for (const flags of FLAGS) {
      const scene = AREA_SCENES[draft.chapterId](flags);
      const options = scene.beats.find((b) => b.choice)!.choice!;
      for (let pick = 0; pick < 2; pick++) {
        const path = walk(scene, pick);
        const where = `${draft.chapterId} choice ${options[pick].id}`;
        for (const line of draft.opening) assert.ok(path.includes(line.id), `${where}: opening ${line.id}`);
        assert.ok(path.includes(draft.afterChoice[options[pick].id].id), `${where}: reaction`);
        assert.ok(!path.includes(draft.afterChoice[options[1 - pick].id].id), `${where}: only the chosen reaction`);
        assert.ok(path.includes(draft.closing.id), `${where}: closing gift`);
        assert.ok(path.indexOf(draft.closing.id) < path.indexOf('end'), `${where}: gift comes before the end beat`);
        assert.equal(path[path.length - 1], 'end', `${where}: still finishes on the end beat`);
      }
    }
  }
});

test('adding a host leaves the story as it was: the chapter keeps all its beats, choices, flags and rewards', () => {
  for (const id of Object.keys(BASE_AREA_SCENES)) {
    for (const flags of FLAGS) {
      const base = BASE_AREA_SCENES[id](flags);
      const hosted = AREA_SCENES[id](flags);
      const hostIds = new Set(hosted.beats.map((b) => b.id));
      for (const b of base.beats) assert.ok(hostIds.has(b.id), `${id}: ${b.id} kept`);
      const strip = (b: Beat) => ({ id: b.id, textAr: b.textAr, textEn: b.textEn, cast: b.cast, speaker: b.speaker, choice: b.choice });
      const kept = hosted.beats.filter((b) => base.beats.some((o) => o.id === b.id)).map(strip);
      assert.deepEqual(kept, base.beats.map(strip), `${id}: original beats unchanged, in order`);
      assert.equal(new Set(hosted.beats.map((b) => b.id)).size, hosted.beats.length, `${id}: beat ids are unique`);
      assert.equal(hosted.beats.length, base.beats.length + 3 + 2 + 1, `${id}: three opening lines, a reaction for each choice and the gift were added`);
    }
  }
});

test('the host stands opposite Layla and speaks only their own lines', () => {
  for (const draft of HOST_DRAFTS) {
    const scene = AREA_SCENES[draft.chapterId]({});
    const own = new Set([...draft.opening, ...Object.values(draft.afterChoice), draft.closing].map((l) => l.id));
    for (const b of scene.beats.filter((x) => own.has(x.id))) {
      assert.deepEqual(b.cast.map((c) => c.id), ['layla', draft.host], `${b.id}: Layla and the host on stage`);
      assert.ok(b.speaker === 'layla' || b.speaker === draft.host, `${b.id}: speaker`);
      assert.ok(b.cast.every((c) => c.expr !== 'angry'), `${b.id}: only painted expressions`);
    }
  }
});

test('the epilogue shelf lists the keepsakes of the hosts met, in a bubble-sized line', async () => {
  const { endingScene } = await import('./scenes/ending');
  const all = endingScene({}).beats.find((b) => b.id === 'shelf_list')!;
  assert.ok(all.textAr.length <= 90 && all.textEn.length <= 120, `${all.textAr.length} / ${all.textEn.length} characters`);
  for (const d of HOST_DRAFTS) assert.ok(all.textEn.includes(d.shelf.en) && all.textAr.includes(d.shelf.ar), `${d.host} on the shelf`);
  const some = endingScene({}, ['chapter:area_1', 'chapter:area_7']).beats.find((b) => b.id === 'shelf_list')!;
  assert.equal(some.textEn, "Hani's cardamom, Nasser's pearl.");
  assert.equal(endingScene({}, ['prologue']).beats.some((b) => b.id.startsWith('shelf')), false, 'no shelf when no host was met');
});
