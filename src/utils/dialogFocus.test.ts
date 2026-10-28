import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextDialogFocus } from './dialogFocus';

test('Tab wraps from the last control to the first, and Shift+Tab from the first to the last', () => {
  assert.equal(nextDialogFocus(4, 3, false), 0);
  assert.equal(nextDialogFocus(4, 0, true), 3);
});

test('Tab inside the dialog moves normally', () => {
  assert.equal(nextDialogFocus(4, 1, false), null);
  assert.equal(nextDialogFocus(4, 2, true), null);
});

test('focus outside the dialog is brought in at the right end', () => {
  assert.equal(nextDialogFocus(4, -1, false), 0);
  assert.equal(nextDialogFocus(4, -1, true), 3);
});

test('a single control keeps focus; an empty dialog is left to the browser', () => {
  assert.equal(nextDialogFocus(1, 0, false), 0);
  assert.equal(nextDialogFocus(1, 0, true), 0);
  assert.equal(nextDialogFocus(0, -1, false), null);
});
