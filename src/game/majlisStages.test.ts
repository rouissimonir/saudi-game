import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MOOD_SUFFIXES, bannerKey, moodSuffix, restorationStage } from './majlisStages';
import { guestMajlisReaction, majlisReaction, restoredDetailReaction } from './majlisReactions';
import { createInitialGameState, upgradeRenovationZone } from './rules';
import { normalizeSave } from './normalizeSave';

test('restoration stages: ruin until two wings are done, half restored after, fully restored only at the end', () => {
  // Diriyah: 4 wings x 2 tiers = 8 levels, 3 painted stages
  const stages = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((l) => restorationStage(l, 8, 3));
  assert.deepEqual(stages, [1, 1, 1, 1, 2, 2, 2, 2, 3]);
  assert.equal(restorationStage(9, 8, 3), 3);
  assert.equal(restorationStage(5, 8, 1), 1);
  assert.equal(restorationStage(-1, 8, 3), 1);
});

test('every painted stage has its image, and every area is covered', async () => {
  const { existsSync } = await import('node:fs');
  const { PAINTED_STAGES } = await import('./majlisStages');
  const { areaInfo, AREA_COUNT_BEFORE_PRESTIGE } = await import('./progression');
  for (let i = 0; i < AREA_COUNT_BEFORE_PRESTIGE; i++) assert.ok(PAINTED_STAGES[areaInfo(i).id], `${areaInfo(i).id} has painted stages`);
  for (const [id, n] of Object.entries(PAINTED_STAGES)) {
    for (let i = 1; i <= n; i++) {
      for (const m of MOOD_SUFFIXES) assert.ok(existsSync(`public/assets/art/majlis/${id}_${i}${m}.webp`), `${id}_${i}${m}.webp`);
    }
  }
});

test('family comments follow the restored wing and its selected style', () => {
  const zone = createInitialGameState().renovationZones[1];
  assert.equal(majlisReaction({ ...zone, unlockedLevel: 0 }, 1), null);
  const first = majlisReaction({ ...zone, unlockedLevel: 1, selectedStyle: 0 }, 1)!;
  const changed = majlisReaction({ ...zone, unlockedLevel: 1, selectedStyle: 1 }, 1)!;
  assert.equal(first.guest, 'noura');
  assert.ok(first.en.includes(zone.nameEn) && first.en.includes(zone.styles[0].nameEn));
  assert.ok(changed.ar.includes(zone.styles[1].nameAr));
  assert.notEqual(first.en, changed.en);
  assert.equal(majlisReaction({ ...zone, unlockedLevel: 1, selectedStyle: 99 }, 1), null);
  assert.equal(majlisReaction({ ...zone, unlockedLevel: 1 }, 4), null);
  const style = zone.styles[1];
  assert.deepEqual(restoredDetailReaction({ nameAr: zone.nameAr, nameEn: zone.nameEn, styleAr: style.nameAr, styleEn: style.nameEn, swatch: style.swatch }, 1), changed);
});

test('guest order comments reflect saved restoration choices only for the matching family member', () => {
  const initial = createInitialGameState();
  initial.renovationZones = initial.renovationZones.map(zone => ({ ...zone, unlockedLevel: 0 }));
  assert.equal(guestMajlisReaction(initial, 'noura'), null);
  const result = upgradeRenovationZone(initial, 'zone_sadu');
  assert.equal(result.upgraded, true);
  const loaded = normalizeSave(JSON.parse(JSON.stringify(result.state)))!;
  const reaction = guestMajlisReaction(loaded, 'noura');
  assert.ok(reaction?.en.includes(loaded.renovationZones[1].styles[0].nameEn));
  assert.equal(guestMajlisReaction(loaded, 'faisal'), null);
  assert.equal(guestMajlisReaction(loaded, 'other'), null);
  loaded.renovationZones[1].selectedStyle = 1;
  assert.ok(guestMajlisReaction(loaded, 'noura')?.ar.includes(loaded.renovationZones[1].styles[1].nameAr));
  assert.equal(loaded.coins, result.state.coins);
});

test('a restored wing keeps its pending reveal in the save without a second reward', () => {
  const initial = createInitialGameState();
  const result = upgradeRenovationZone(initial, 'zone_sadu');
  assert.equal(result.upgraded, true);
  const loaded = normalizeSave(JSON.parse(JSON.stringify(result.state)))!;
  assert.equal(loaded.storyFlags.restoration_reveal_area, '0');
  assert.equal(loaded.storyFlags.restoration_reveal_wing, 'zone_sadu');
  assert.equal(loaded.stars, initial.stars - initial.renovationZones[1].starCostLevel1);
  assert.equal(loaded.wingUpgrades, 1);
});

test('each Majlis ambiance chip maps to its painted mood', () => {
  assert.equal(moodSuffix('afternoon'), '');
  assert.equal(moodSuffix('ramadan_night'), '_night');
  assert.equal(moodSuffix('courtyard_rain'), '_rain');
});

test('every wing of every area has a run-down and a restored picture', async () => {
  const { existsSync } = await import('node:fs');
  const { areaInfo, buildAreaZones, AREA_COUNT_BEFORE_PRESTIGE } = await import('./progression');
  for (let a = 0; a < AREA_COUNT_BEFORE_PRESTIGE; a++) {
    const id = areaInfo(a).id;
    const wings = buildAreaZones(a).length;
    assert.ok(wings >= 3, `${id} has wings`);
    for (let i = 0; i < wings; i++) {
      for (const state of ['ruin', 'done']) assert.ok(existsSync(`public/assets/art/majlis/wings/${id}_${i}_${state}.webp`), `${id}_${i}_${state}.webp`);
    }
  }
});

test('the banner picture to prefetch follows the area, the wings restored and the mood', () => {
  const wings = (levels: number[]) => levels.map((unlockedLevel) => ({ unlockedLevel }));
  assert.equal(bannerKey('diriyah', wings([0, 0, 0, 0]), 'afternoon'), 'diriyah_1');
  assert.equal(bannerKey('diriyah', wings([2, 2, 0, 0]), 'ramadan_night'), 'diriyah_2_night');
  assert.equal(bannerKey('khobar', wings([2, 2, 2, 2]), 'courtyard_rain'), 'khobar_3_rain');
  assert.equal(bannerKey('nowhere', wings([2]), 'afternoon'), null);
});
