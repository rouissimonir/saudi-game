import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkRow, decide, parseCsv, placeholders, replaceLiteral, type SheetRow } from './lib';

const row = (over: Partial<SheetRow> = {}): SheetRow => ({ id: 'STY001', section: 'Story', ar: 'مرحبا بك يا ليلى', verdict: 'Fix', suggestion: 'يا هلا بك يا ليلى', note: '', ...over });
const current = { ar: 'مرحبا بك يا ليلى', section: 'Story' };
const errors = (r: SheetRow, c: typeof current | null = current) => checkRow(r, c).filter((f) => f.level === 'error').map((f) => f.message);

test('parseCsv handles a BOM, CRLF, quoted commas, doubled quotes and line breaks in cells', () => {
  const rows = parseCsv('﻿"a","b, c","say ""hi"""\r\n"x","line 1\nline 2",""\r\n');
  assert.deepEqual(rows, [['a', 'b, c', 'say "hi"'], ['x', 'line 1\nline 2', '']]);
});

test('decide: Fix with a suggestion applies, OK keeps, anything else is skipped, contradictions are invalid', () => {
  assert.equal(decide(row()), 'apply');
  assert.equal(decide(row({ verdict: 'fix' })), 'apply');
  assert.equal(decide(row({ verdict: 'OK', suggestion: '' })), 'keep');
  assert.equal(decide(row({ verdict: '', suggestion: '' })), 'skip');
  assert.equal(decide(row({ verdict: 'OK' })), 'invalid');
  assert.equal(decide(row({ suggestion: '' })), 'invalid');
});

test('a clean suggestion passes', () => assert.deepEqual(errors(row()), []));

test('checkRow rejects a missing ID, stale text, identical text, non-Arabic, changed placeholders and backslashes', () => {
  assert.match(errors(row(), null)[0], /does not exist/);
  assert.match(errors(row({ ar: 'نص قديم' }))[0], /changed since/);
  assert.match(errors(row({ suggestion: 'مرحبا بك يا ليلى' }))[0], /identical/);
  assert.match(errors(row({ suggestion: 'hello there' }))[0], /no Arabic/);
  assert.match(errors(row({ ar: 'مرحبا ${name}', suggestion: 'يا هلا' }), { ar: 'مرحبا ${name}', section: 'Story' })[0], /placeholders changed/);
  assert.deepEqual(errors(row({ ar: 'مرحبا ${name}', suggestion: 'يا هلا ${name}' }), { ar: 'مرحبا ${name}', section: 'Story' }), []);
  assert.match(errors(row({ suggestion: 'يا هلا\\n' }))[0], /backslash/);
});

test('a story line longer than a speech bubble is an error; the same length on screen text is only advice', () => {
  const long = 'ا'.repeat(95);
  assert.match(errors(row({ suggestion: long }))[0], /too long for a speech bubble/);
  const ui = checkRow(row({ section: 'UI', suggestion: long }), { ar: 'مرحبا بك يا ليلى', section: 'UI' });
  assert.equal(ui.filter((f) => f.level === 'error').length, 0);
  assert.ok(ui.some((f) => f.level === 'warn'));
});

test('voice lines carry a re-recording notice', () => {
  const f = checkRow(row({ section: 'Voice' }), { ar: 'مرحبا بك يا ليلى', section: 'Voice' });
  assert.ok(f.some((x) => x.level === 'info' && /re-recording/.test(x.message)));
});

test('placeholders are compared as a sorted multiset', () => assert.deepEqual(placeholders('${b} و ${a} و ${b}'), ['${a}', '${b}', '${b}']));

test('replaceLiteral replaces whole literals only, escapes the quote and leaves partial matches alone', () => {
  const src = `a: 'مرحبا بك', b: "مرحبا بك", c: \`مرحبا بك\`, d: 'قال مرحبا بك لها', e: 'مرحبا بك'`;
  const r = replaceLiteral(src, 'مرحبا بك', "يا هلا 'بك'");
  assert.equal(r.count, 4);
  assert.ok(r.text.includes(`a: 'يا هلا \\'بك\\''`));
  assert.ok(r.text.includes(`b: "يا هلا 'بك'"`));
  assert.ok(r.text.includes('d: \'قال مرحبا بك لها\''), 'the partial match is untouched');
});

test('replaceLiteral finds a literal whose apostrophes were escaped in the source', () => {
  const r = replaceLiteral(`x: 'it\\'s here'`, "it's here", 'جديد');
  assert.equal(r.count, 1);
  assert.equal(r.text, `x: 'جديد'`);
});

test('replaceLiteral reports zero when the text is not a literal anywhere', () => assert.equal(replaceLiteral(`x: 'abc'`, 'مرحبا', 'جديد').count, 0));
