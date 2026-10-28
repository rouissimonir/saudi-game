/**
 * Exports every Arabic string in the game, with its English meaning and where it lives, as one sheet a Saudi reviewer
 * can fill in (docs/arabic-review/arabic_review.csv, UTF-8 with a BOM so Excel and Google Sheets open it correctly).
 *
 *   npx tsx tools/review/export_arabic.ts
 *
 * The columns Verdict, Suggested Arabic and Reviewer note are for the reviewer; check_review.ts reads them back.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { collectRows } from './collect';

const rows = collectRows();
const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;
const header = ['ID', 'Section', 'Where', 'Who or field', 'Arabic', 'English meaning', 'Auto note', 'Verdict (OK / Fix)', 'Suggested Arabic', 'Reviewer note'];
const lines = [header.map(csvCell).join(',')];
for (const r of rows) lines.push([r.id, r.section, r.where, r.who, r.ar, r.en, r.hint, '', '', ''].map(csvCell).join(','));
mkdirSync('docs/arabic-review', { recursive: true });
writeFileSync('docs/arabic-review/arabic_review.csv', '\ufeff' + lines.join('\r\n') + '\r\n');
const counts = ['Story', 'Voice', 'Data', 'UI', 'Store'].map((s) => `${s}: ${rows.filter((r) => r.section === s).length}`).join(', ');
console.log(`${rows.length} strings (${counts}); ${rows.filter((r) => r.hint.includes('colloquial')).length} flagged colloquial`);
