// Writes tools/voice/lines.json (read by generate_elevenlabs.py) and docs/VOICE_LINES.md (a recording sheet
// for a human voice actor) from src/game/voiceLines.ts.  Run: npm run voice:export
import { writeFileSync } from 'node:fs';
import { VOICE_PROFILES, allVoiceLines, voiceFileUrl, VoiceCharacter } from '../../src/game/voiceLines';

const lines = allVoiceLines().map((l) => ({
  id: l.id,
  character: l.character,
  event: l.event,
  ar: l.line.ar,
  en: l.line.en,
  file: voiceFileUrl(l.id).replace(/^\//, 'public/'),
}));
writeFileSync('tools/voice/lines.json', JSON.stringify({ profiles: VOICE_PROFILES, lines }, null, 2) + '\n');

const chars = Object.keys(VOICE_PROFILES) as VoiceCharacter[];
let md = `# Voice recording sheet

Generated from \`src/game/voiceLines.ts\` by \`npm run voice:export\`. **Do not edit by hand**: change the lines in code and re-run.

- ${lines.length} lines, ${lines.reduce((n, l) => n + l.ar.length, 0)} Arabic characters in total.
- Deliver each line as its own file, named exactly as in the **File** column, mp3 (or wav), clean studio recording with no music, about 2 to 4 seconds, trimmed with about 0.1 s of silence at each end.
- Drop the files into \`public/assets/audio/voice/\`. The game uses a recorded file when one exists and falls back to the phone's Arabic voice otherwise. No code change is needed.
- Dialect wording was written by a non-native; **have the voice actor or a native speaker correct any line** that does not sound natural in their dialect, then update the code.
- Get a written licence that covers game use and app-store distribution.
`;
for (const c of chars) {
  const p = VOICE_PROFILES[c];
  md += `\n## ${p.nameEn} (\`${c}\`) · ${p.dialect} · ${p.gender}\n\n_Direction: ${p.direction}_\n\n| File | When | Arabic | English meaning |\n| --- | --- | --- | --- |\n`;
  for (const l of lines.filter((x) => x.character === c)) {
    const when = l.event === 'greet' ? 'Story chapter opens' : l.event === 'served' ? 'Order served' : 'VIP order served';
    md += `| \`${l.id}.mp3\` | ${when} | ${l.ar} | ${l.en} |\n`;
  }
}
writeFileSync('docs/VOICE_LINES.md', md);
console.log(`exported ${lines.length} lines, ${lines.reduce((n, l) => n + l.ar.length, 0)} characters`);
