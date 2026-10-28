/**
 * Reads back a filled Arabic review sheet (docs/ARABIC_REVIEW.md), checks every reviewed row against the game's
 * current text, and optionally applies the accepted changes to the source.
 *
 *   npx tsx tools/review/check_review.ts <filled.csv>                       dry run: validate and report, change nothing
 *   npx tsx tools/review/check_review.ts <filled.csv> --report out.md       also write the report as Markdown
 *   npx tsx tools/review/check_review.ts <filled.csv> --write --source "Saudi reviewer, Name, 2026-10-30"
 *
 * Only rows with Verdict = Fix and a Suggested Arabic are applied, and only if they pass every check. A change is applied
 * wherever the old Arabic is a whole string literal; text built from parts is reported for editing by hand. Every applied
 * change is appended to docs/arabic-review/changes_log.csv with its source, so who changed what is on record.
 */
import { appendFileSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { collectRows } from './collect';
import { checkRow, decide, parseCsv, replaceLiteral, type Finding, type SheetRow } from './lib';

const args = process.argv.slice(2);
const flag = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const valueFlags = new Set(['--report', '--source']);
const path = args.find((a, i) => !a.startsWith('--') && !valueFlags.has(args[i - 1]));
if (!path) { console.error('usage: npx tsx tools/review/check_review.ts <filled.csv> [--report out.md] [--write --source "who and when"]'); process.exit(2); }
const write = args.includes('--write');
const source = flag('--source');
if (write && !source) { console.error('--write needs --source "who reviewed it and when", so the change log records where it came from'); process.exit(2); }

const table = parseCsv(readFileSync(path, 'utf8'));
const header = table[0].map((h) => h.trim().toLowerCase());
const col = (starts: string) => header.findIndex((h) => h.startsWith(starts));
const c = { id: col('id'), section: col('section'), ar: col('arabic'), verdict: col('verdict'), suggestion: col('suggested'), note: col('reviewer note') };
if (Object.values(c).some((i) => i < 0)) { console.error('the sheet must keep the original column headings (ID, Section, Arabic, Verdict, Suggested Arabic, Reviewer note)'); process.exit(2); }

const current = new Map(collectRows().map((r) => [r.id, r]));
interface Item { row: SheetRow; where: string; findings: Finding[]; decision: ReturnType<typeof decide> }
const items: Item[] = [];
for (const cells of table.slice(1)) {
  const row: SheetRow = { id: cells[c.id]?.trim() ?? '', section: cells[c.section]?.trim() ?? '', ar: cells[c.ar] ?? '', verdict: cells[c.verdict] ?? '', suggestion: cells[c.suggestion] ?? '', note: cells[c.note] ?? '' };
  if (!row.verdict.trim() && !row.suggestion.trim() && !row.note.trim()) continue;
  const cur = current.get(row.id) ?? null;
  items.push({ row, where: cur?.where ?? '', findings: checkRow(row, cur), decision: decide(row) });
}

const blocked = (i: Item) => i.decision === 'invalid' || i.findings.some((f) => f.level === 'error');
const toApply = items.filter((i) => i.decision === 'apply' && !blocked(i));
const withNotes = items.filter((i) => i.row.note.trim());

// Source files a string can live in
const sources: string[] = ['index.html', 'tools/store/compose.cjs'];
(function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\./.test(name)) sources.push(p);
  }
})('src');

const contents = new Map(sources.filter(existsSync).map((p) => [p, readFileSync(p, 'utf8')]));
const applied: { item: Item; files: string[]; count: number }[] = [];
const manual: Item[] = [];
for (const item of toApply) {
  let count = 0;
  const files: string[] = [];
  for (const [p, text] of contents) {
    const r = replaceLiteral(text, item.row.ar, item.row.suggestion.trim());
    if (r.count) { count += r.count; files.push(p); if (write) contents.set(p, r.text); }
  }
  if (count) applied.push({ item, files, count }); else manual.push(item);
}

const lines: string[] = [];
const out = (s = '') => { lines.push(s); console.log(s); };
const verdicts = (d: string) => items.filter((i) => i.decision === d).length;
out(`# Arabic review check: ${path}`);
out('');
out(`${items.length} rows have reviewer input: ${verdicts('apply')} Fix, ${verdicts('keep')} OK, ${verdicts('skip')} skipped, ${verdicts('invalid')} invalid. ${withNotes.length} have a note.`);
out(`${applied.length} changes can be applied, ${manual.length} are valid but must be edited by hand, ${items.filter((i) => i.decision === 'apply' && blocked(i)).length + verdicts('invalid')} are blocked by a check.`);
const section = (title: string, list: Item[], show: (i: Item) => string) => { if (!list.length) return; out(''); out(`## ${title} (${list.length})`); for (const i of list) out(show(i)); };
section('Blocked by a check: fix these in the sheet', items.filter((i) => blocked(i)), (i) => `- **${i.row.id}** ${i.findings.filter((f) => f.level === 'error').map((f) => f.message).join('; ') || (i.decision === 'invalid' ? 'verdict and suggestion contradict each other' : '')}\n  - now: ${i.row.ar}\n  - suggested: ${i.row.suggestion.trim()}`);
section('Valid but built from parts or not found as a whole string: edit by hand', manual, (i) => `- **${i.row.id}** (${i.where})\n  - now: ${i.row.ar}\n  - suggested: ${i.row.suggestion.trim()}`);
section(write ? 'Applied' : 'Would be applied', applied.map((a) => a.item), (i) => {
  const a = applied.find((x) => x.item === i)!;
  const warn = i.findings.filter((f) => f.level !== 'error').map((f) => `${f.level}: ${f.message}`);
  return `- **${i.row.id}** in ${a.files.join(', ')} (${a.count}x)\n  - before: ${i.row.ar}\n  - after: ${i.row.suggestion.trim()}${i.row.note.trim() ? `\n  - reviewer: ${i.row.note.trim()}` : ''}${warn.length ? `\n  - ${warn.join('\n  - ')}` : ''}`;
});
const rerecord = applied.filter((a) => a.item.row.section === 'Voice');
if (rerecord.length) { out(''); out(`## Voice lines to re-record (${rerecord.length})`); for (const a of rerecord) out(`- ${a.item.where}`); }
section('Reviewer notes and questions (no change made)', withNotes.filter((i) => i.decision !== 'apply' || blocked(i)), (i) => `- **${i.row.id}** ${i.row.note.trim()}`);

if (write && applied.length) {
  for (const [p, text] of contents) if (text !== readFileSync(p, 'utf8')) writeFileSync(p, text);
  const log = 'docs/arabic-review/changes_log.csv';
  const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;
  if (!existsSync(log)) writeFileSync(log, '﻿' + ['Date', 'Commit', 'ID', 'Section', 'Where', 'Before', 'After', 'Source', 'Reviewer note'].map(cell).join(',') + '\r\n');
  const commit = (() => { try { return execSync('git rev-parse --short HEAD').toString().trim(); } catch { return ''; } })();
  for (const a of applied) appendFileSync(log, [new Date().toISOString().slice(0, 10), commit, a.item.row.id, a.item.row.section, a.item.where, a.item.row.ar, a.item.row.suggestion.trim(), source!, a.item.row.note.trim()].map(cell).join(',') + '\r\n');
  out('');
  out(`Wrote ${applied.length} changes to ${new Set(applied.flatMap((a) => a.files)).size} files and logged them in ${log} (source: ${source}).`);
  out('Next: npm run review:export (refresh the sheet), npm test, the story-layout, accessibility and smoke checks, and re-record any voice lines listed above.');
} else if (!write) {
  out('');
  out('Dry run: nothing was changed. Add --write --source "who and when" to apply the changes listed above.');
}
const reportPath = flag('--report');
if (reportPath) writeFileSync(reportPath, lines.join('\n') + '\n');
process.exitCode = items.some((i) => blocked(i)) ? 1 : 0;
