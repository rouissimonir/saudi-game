/**
 * Collects every Arabic string in the game with its English meaning and where it lives. Used by export_arabic.ts (the
 * reviewer's sheet) and check_review.ts (to check a filled sheet against the current text).
 *
 * Sections: Story (every scene line and choice, under two sets of earlier choices), Voice (the recorded lines), Data
 * (names and descriptions in the game tables), UI (text written as `isAr ? 'ar' : 'en'` in the screens) and Store
 * (screenshot captions, the page description).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { PROLOGUE } from '../../src/story/scenes/prologue';
import { chapter1Scene } from '../../src/story/scenes/chapter1';
import { chapter2Scene } from '../../src/story/scenes/chapter2';
import { chapter3Scene } from '../../src/story/scenes/chapter3';
import { chapter4Scene } from '../../src/story/scenes/chapter4';
import { AREA_SCENES } from '../../src/story/scenes/areaChapters';
import { endingScene } from '../../src/story/scenes/ending';
import { CAST_NAMES, type Scene } from '../../src/story/types';
import { VOICE_LINES, VOICE_PROFILES } from '../../src/game/voiceLines';

export interface Row { section: string; where: string; who: string; ar: string; en: string }

const FLAG_SETS: Record<string, string>[] = [
  { rivalry: 'firm', rashid_ch1: 'proud', menu: 'heritage', tariq: 'blend', rashid_ch4: 'stand', jeddah: 'souq', alula: 'live', taif: 'rose', abha: 'train', ahsa: 'dibs', riyadh: 'own', finale: 'grandpa' },
  { rivalry: 'polite', rashid_ch1: 'host', menu: 'fusion', tariq: 'cup', rashid_ch4: 'welcome', jeddah: 'rawshan', alula: 'quiet', taif: 'pomegranate', abha: 'farmers', ahsa: 'tasting', riyadh: 'partner', finale: 'team' },
];

export function collectRows(): (Row & { id: string; hint: string })[] {
  const rows: Row[] = [];
  const seen = new Map<string, Row>();
  function add(row: Row) {
    const key = `${row.ar}\u0000${row.en}`;
    const existing = seen.get(key);
    if (existing) {
      if (!existing.where.split(' | ').includes(row.where) && existing.where.split(' | ').length < 4) existing.where += ` | ${row.where}`;
      return;
    }
    seen.set(key, row);
    rows.push(row);
  }

  // Story
  function story(scene: Scene) {
    for (const b of scene.beats) {
      const who = b.speaker ? CAST_NAMES[b.speaker].en : 'narration';
      if (b.textAr) add({ section: 'Story', where: `${scene.id} / ${b.id}`, who, ar: b.textAr, en: b.textEn });
      for (const o of b.choice ?? []) add({ section: 'Story', where: `${scene.id} / ${b.id} / choice ${o.id}`, who: 'player choice', ar: o.textAr, en: o.textEn });
    }
  }
  story(PROLOGUE);
  for (const flags of FLAG_SETS) {
    for (const build of [chapter1Scene, chapter2Scene, chapter3Scene, chapter4Scene, ...Object.values(AREA_SCENES)]) story(build(flags));
    story(endingScene(flags));
  }

  // Voice
  for (const [character, events] of Object.entries(VOICE_LINES)) {
    const dialect = VOICE_PROFILES[character as keyof typeof VOICE_PROFILES].dialect;
    for (const [event, lines] of Object.entries(events)) lines.forEach((l, i) => add({ section: 'Voice', where: `${character}_${event}_${i + 1}.mp3`, who: `${character} (${dialect})`, ar: l.ar, en: l.en }));
  }

  // Source files
  const STR = String.raw`(?:'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)"|\x60((?:\\.|[^\x60\\])*)\x60)`;
  const unescape = (s: string) => s.replace(/\\(['"`\\])/g, '$1').replace(/\\n/g, ' ');
  const pick = (m: RegExpMatchArray, from: number) => unescape(m[from] ?? m[from + 1] ?? m[from + 2] ?? '');
  const ARABIC = /[\u0600-\u06FF]/;
  function files(dir: string, out: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) files(p, out);
      else if (/\.(ts|tsx)$/.test(name) && !/\.test\./.test(name)) out.push(p);
    }
    return out;
  }
  const lineOf = (text: string, index: number) => text.slice(0, index).split('\n').length;

  for (const file of files('src')) {
    if (/src\/story\/(scenes|hostDrafts)/.test(file) || file.endsWith('voiceLines.ts') || file.endsWith('story/types.ts')) continue; // already covered above
    const text = readFileSync(file, 'utf8');
    // UI: isAr ? 'ar' : 'en'
    for (const m of text.matchAll(new RegExp(String.raw`isAr\s*\?\s*${STR}\s*:\s*${STR}`, 'g'))) {
      const ar = pick(m, 1), en = pick(m, 4);
      if (ARABIC.test(ar)) add({ section: 'UI', where: `${file}:${lineOf(text, m.index!)}`, who: 'screen text', ar, en });
    }
    // Data: fooAr: '...' followed by fooEn: '...'
    for (const m of text.matchAll(new RegExp(String.raw`(\w+?)Ar:\s*${STR},\s*(?:\w+:\s*[^,\n]+,\s*)*?\1En:\s*${STR}`, 'g'))) {
      const ar = pick(m, 2), en = pick(m, 5);
      if (ARABIC.test(ar)) add({ section: 'Data', where: `${file}:${lineOf(text, m.index!)}`, who: m[1], ar, en });
    }
    // Data: dialogueAr: [ ... ] / dialogueEn: [ ... ]
    for (const m of text.matchAll(/dialogueAr:\s*\[([\s\S]*?)\],\s*dialogueEn:\s*\[([\s\S]*?)\]/g)) {
      const strings = (block: string) => Array.from(block.matchAll(new RegExp(STR, 'g'))).map((x) => pick(x, 1));
      const ar = strings(m[1]), en = strings(m[2]);
      ar.forEach((a, i) => add({ section: 'Data', where: `${file}:${lineOf(text, m.index!)}`, who: `chapter dialogue ${i + 1}`, ar: a, en: en[i] ?? '' }));
    }
  }

  // Store
  const compose = readFileSync('tools/store/compose.cjs', 'utf8');
  const caps = /const CAPTIONS = (\{[\s\S]*?\n\});/.exec(compose);
  if (caps) {
    const c = new Function(`return ${caps[1]}`)() as Record<'en' | 'ar', string[][]>;
    c.ar.forEach((pair, i) => add({ section: 'Store', where: `screenshot ${i + 1} caption`, who: 'App Store screenshot', ar: pair.join(' '), en: c.en[i].join(' ') }));
  }
  const html = readFileSync('index.html', 'utf8');
  const desc = /name="description" content="([^"]+)"/.exec(html);
  if (desc) add({ section: 'Store', where: 'index.html description / og:description', who: 'page and share description', ar: desc[1], en: '' });



  // Notes that help the reviewer
  const MARKERS = ['مو ', 'وش ', 'ليش', 'شلون', 'يبي', 'يبون', 'حنا', 'الحين', 'للحين', 'جدّي', 'بنت', 'ويش', 'زين', 'يلا', 'هالـ', 'هذي', 'هالمجلس', 'أبي'];
  const hint = (r: Row) => {
    const notes: string[] = [];
    if (MARKERS.some((m) => r.ar.includes(m.trim()) && r.ar.includes(m))) notes.push('colloquial');
    if (/[A-Za-z]{2,}/.test(r.ar)) notes.push('has Latin letters');
    if (r.ar.length > 85) notes.push('long for a bubble');
    if (!r.en && r.section !== 'Store') notes.push('no English given');
    return notes.join('; ');
  };
  
  
  const order = ['Story', 'Voice', 'Data', 'UI', 'Store'];
  rows.sort((a, b) => order.indexOf(a.section) - order.indexOf(b.section));
  const counters: Record<string, number> = {};
  const PREFIX: Record<string, string> = { Story: 'STY', Voice: 'VOX', Data: 'DAT', UI: 'UI', Store: 'APP' };
  return rows.map((r) => {
    const n = (counters[r.section] = (counters[r.section] ?? 0) + 1);
    return { ...r, id: `${PREFIX[r.section]}${String(n).padStart(3, '0')}`, hint: hint(r) };
  });
}
