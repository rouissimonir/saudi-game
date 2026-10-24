import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  stripTashkeel,
  normalizeArabic,
  wordsMatch,
  alignReading,
  starsForAccuracy,
  emptyProgress,
  recordPracticeDay,
  recordLessonResult,
  recordTashkeelAnswer,
  buildParentReport,
  whatsappShareUrl,
} from './engine';

const LINE = 'الشَّمْسُ تُشْرِقُ كُلَّ صَبَاحٍ';

test('tashkeel is stripped and alef/ya/ta-marbuta variants normalise', () => {
  assert.equal(stripTashkeel(LINE), 'الشمس تشرق كل صباح');
  assert.equal(normalizeArabic('أَحْمَدُ إِلَى المَدْرَسَةِ'), 'احمد الي المدرسه');
});

test('words match exactly or within one letter for longer words only', () => {
  assert.equal(wordsMatch('صباح', 'صباح'), true);
  assert.equal(wordsMatch('تشرق', 'تشرف'), true);
  assert.equal(wordsMatch('كل', 'كن'), false);
});

test('a perfect reading is all correct and earns 3 stars', () => {
  const r = alignReading(LINE, 'الشمس تشرق كل صباح', true);
  assert.deepEqual(r.statuses, ['correct', 'correct', 'correct', 'correct']);
  assert.equal(r.accuracy, 1);
  assert.equal(starsForAccuracy(r.accuracy), 3);
});

test('skipped and mispronounced words are told apart', () => {
  const skipped = alignReading(LINE, 'الشمس كل صباح', true);
  assert.deepEqual(skipped.statuses, ['correct', 'missed', 'correct', 'correct']);

  const wrong = alignReading(LINE, 'الشمس تغرب كل صباح', true);
  assert.deepEqual(wrong.statuses, ['correct', 'wrong', 'correct', 'correct']);
});

test('streaming results leave unread words pending, final results mark them missed', () => {
  const live = alignReading(LINE, 'الشمس تشرق', false);
  assert.deepEqual(live.statuses, ['correct', 'correct', 'pending', 'pending']);
  const done = alignReading(LINE, 'الشمس تشرق', true);
  assert.deepEqual(done.statuses, ['correct', 'correct', 'missed', 'missed']);
  assert.equal(starsForAccuracy(done.accuracy), 1);
});

test('empty speech yields no stars and does not crash', () => {
  const r = alignReading(LINE, '', true);
  assert.equal(r.correct, 0);
  assert.equal(starsForAccuracy(r.accuracy), 0);
  assert.equal(alignReading('', 'شيء', true).accuracy, 0);
});

test('practice streak grows on consecutive days and resets after a gap; best stars never go down', () => {
  let p = recordPracticeDay(emptyProgress(), '2026-05-01');
  assert.equal(p.streakDays, 1);
  p = recordPracticeDay(p, '2026-05-01');
  assert.equal(p.streakDays, 1);
  p = recordPracticeDay(p, '2026-05-02');
  assert.equal(p.streakDays, 2);
  p = recordPracticeDay(p, '2026-05-05');
  assert.equal(p.streakDays, 1);

  p = recordLessonResult(p, 'l1', 3);
  p = recordLessonResult(p, 'l1', 1);
  assert.equal(p.bestStars.l1, 3);
});

test('parent report summarises progress and builds a WhatsApp link', () => {
  let p = recordLessonResult(emptyProgress(), 'l1', 3);
  p = recordLessonResult(p, 'l2', 2);
  p = recordTashkeelAnswer(p, true);
  p = recordTashkeelAnswer(p, false);
  const report = buildParentReport(p, 'سارة');
  assert.match(report, /سارة/);
  assert.match(report, /النجوم: 5/);
  assert.match(report, /الدروس المكتملة: 2/);
  assert.match(report, /50%/);
  assert.ok(whatsappShareUrl(report).startsWith('https://wa.me/?text=%F0%9F'));
});
