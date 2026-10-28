/**
 * Pure helpers for reading back a filled Arabic review sheet: CSV parsing, per-row checks and a literal-safe replace.
 * Used by check_review.ts; tested in review.test.ts.
 */

/** Parses CSV text (UTF-8 BOM, CRLF or LF, quoted cells with commas, quotes and newlines). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((x) => x !== '')) rows.push(row);
      row = [];
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); if (row.some((x) => x !== '')) rows.push(row); }
  return rows;
}

export interface Finding { level: 'error' | 'warn' | 'info'; message: string }

const PLACEHOLDER = /\$\{[^}]*\}/g;
export const placeholders = (s: string) => (s.match(PLACEHOLDER) ?? []).sort();
const ARABIC = /[؀-ۿ]/;
/** Longest line the story bubbles and voice sheet have been laid out for (the longest existing line is 87). */
export const MAX_BUBBLE = 90;

export interface SheetRow { id: string; section: string; ar: string; verdict: string; suggestion: string; note: string }

export type Decision = 'apply' | 'keep' | 'skip' | 'invalid';

/** What a reviewer's row asks for: Fix + a suggestion applies; OK keeps; anything else is skipped. */
export function decide(row: SheetRow): Decision {
  const v = row.verdict.trim().toLowerCase();
  if (v === 'ok') return row.suggestion.trim() ? 'invalid' : 'keep';
  if (v === 'fix') return row.suggestion.trim() ? 'apply' : 'invalid';
  return 'skip';
}

/** Checks one reviewed row against the game's current text for that ID (null when the ID no longer exists). */
export function checkRow(row: SheetRow, current: { ar: string; section: string } | null): Finding[] {
  const out: Finding[] = [];
  const v = row.verdict.trim().toLowerCase();
  const s = row.suggestion.trim();
  if (v && !['ok', 'fix'].includes(v)) out.push({ level: 'warn', message: `verdict "${row.verdict}" is not OK or Fix, so the row is skipped` });
  if (v === 'ok' && s) out.push({ level: 'error', message: 'marked OK but also has a suggestion: choose Fix or clear the suggestion' });
  if (v === 'fix' && !s) out.push({ level: 'error', message: 'marked Fix but has no suggested Arabic' });
  if (!s) return out;
  if (!current) { out.push({ level: 'error', message: 'this ID does not exist in the current game text (the sheet is out of date)' }); return out; }
  if (current.ar !== row.ar) out.push({ level: 'error', message: 'the game text for this row has changed since the sheet was made; re-export and re-review it' });
  if (!ARABIC.test(s)) out.push({ level: 'error', message: 'the suggestion has no Arabic letters' });
  if (s === row.ar.trim()) out.push({ level: 'error', message: 'the suggestion is identical to the current text' });
  if (JSON.stringify(placeholders(s)) !== JSON.stringify(placeholders(row.ar))) out.push({ level: 'error', message: `placeholders changed: has ${placeholders(row.ar).join(' ') || 'none'}, suggestion has ${placeholders(s).join(' ') || 'none'}` });
  if (/[\\\n\r]/.test(s)) out.push({ level: 'error', message: 'the suggestion contains a backslash or line break, which cannot go into a source string' });
  if ((row.section === 'Story' || row.section === 'Voice') && s.length > MAX_BUBBLE) out.push({ level: 'error', message: `${s.length} characters is too long for a speech bubble (max ${MAX_BUBBLE})` });
  else if (s.length > row.ar.length * 1.6 + 12) out.push({ level: 'warn', message: `much longer than the current text (${s.length} vs ${row.ar.length} characters): check it still fits` });
  if (/  /.test(s) || s !== s.trim().replace(/\s+$/, '')) out.push({ level: 'warn', message: 'has double or stray spaces' });
  if (/[A-Za-z]{3,}/.test(s) && !/[A-Za-z]{3,}/.test(row.ar)) out.push({ level: 'warn', message: 'introduces Latin letters' });
  if (/[,?;]/.test(s) && !/[,?;]/.test(row.ar)) out.push({ level: 'warn', message: 'uses a Latin comma, question mark or semicolon (Arabic uses ، ؟ ؛)' });
  if (row.section === 'Voice') out.push({ level: 'info', message: 'this line is recorded: the audio file will need re-recording' });
  return out;
}

/**
 * Replaces `original` with `suggestion` wherever `original` is a whole string literal in `source` (so a partial match
 * inside a longer string is left alone), escaping the surrounding quote. Returns the new text and how many were replaced.
 */
export function replaceLiteral(source: string, original: string, suggestion: string): { text: string; count: number } {
  let count = 0;
  const variants = Array.from(new Set([original, original.replace(/'/g, "\\'"), original.replace(/"/g, '\\"')]));
  let text = source;
  for (const needle of variants) {
    let out = '';
    let from = 0;
    for (;;) {
      const i = text.indexOf(needle, from);
      if (i < 0) break;
      const before = text[i - 1];
      const after = text[i + needle.length];
      if ((before === "'" || before === '"' || before === '`') && before === after) {
        const escaped = suggestion.split(before).join(`\\${before}`);
        out += text.slice(from, i) + escaped;
        count++;
      } else out += text.slice(from, i + needle.length);
      from = i + needle.length;
    }
    text = out + text.slice(from);
  }
  return { text, count };
}
