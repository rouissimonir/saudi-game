// Writes tools/voice/story_lines.json: every line the seven local hosts (and Layla, in their scenes) speak in the
// area chapters, from src/story/hostDrafts.ts. This is the one list the story recordings are made from.
// Run: npm run voice:export-hosts   Then record with: npm run voice:generate-hosts
// An edited Arabic line changes its hash, so only that line is billed and re-recorded.
import { writeFileSync } from 'node:fs';
import { HOST_DRAFTS } from '../../src/story/hostDrafts';

export const hostVoiceId = (chapterId: string, lineId: string) => `${chapterId}_${lineId}`;

const lines = HOST_DRAFTS.flatMap((d) =>
  [...d.opening, ...Object.values(d.afterChoice), d.closing].map((l) => ({
    id: hostVoiceId(d.chapterId, l.id),
    character: l.speaker,
    chapter: d.chapterId,
    ar: l.ar,
    en: l.en,
    file: `public/assets/audio/story/${hostVoiceId(d.chapterId, l.id)}.mp3`,
  }))
);
writeFileSync('tools/voice/story_lines.json', JSON.stringify({ lines }, null, 2) + '\n');
console.log(`exported ${lines.length} lines, ${lines.reduce((n, l) => n + l.ar.length, 0)} Arabic characters`);
