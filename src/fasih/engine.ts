/** Pure logic for the Fasih Kids reading coach: Arabic normalisation, word alignment, scoring, parent report. */

const TASHKEEL = /[ً-ْٰـ]/g; // harakat, shadda, sukun, dagger alef, tatweel

export function stripTashkeel(text: string): string {
  return text.replace(TASHKEEL, '');
}

/** Normalise what an ASR engine may return versus a fully voweled target. */
export function normalizeArabic(text: string): string {
  return stripTashkeel(text)
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^؀-ۿa-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function editDistance(a: string, b: string): number {
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

/** Words match exactly, or within one letter when long enough that ASR slips are likely. */
export function wordsMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 4 || b.length < 4) return false;
  return editDistance(a, b) <= 1;
}

export type WordStatus = 'correct' | 'wrong' | 'missed' | 'pending';

export interface ReadingResult {
  statuses: WordStatus[];
  correct: number;
  total: number;
  accuracy: number; // 0..1
}

/**
 * Align the child's recognised words to the target text.
 * While `final` is false (streaming), target words after the last touched word stay `pending`.
 */
export function alignReading(targetText: string, spokenText: string, final: boolean): ReadingResult {
  const target = splitWords(normalizeArabic(targetText));
  const spoken = splitWords(normalizeArabic(spokenText));
  const n = target.length;
  const m = spoken.length;

  // Longest common subsequence over fuzzy-equal words
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = wordsMatch(target[i], spoken[j])
        ? lcs[i + 1][j + 1] + 1
        : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const matchedSpoken: (number | null)[] = new Array(n).fill(null);
  const usedSpoken = new Array(m).fill(false);
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (wordsMatch(target[i], spoken[j]) && lcs[i][j] === lcs[i + 1][j + 1] + 1) {
      matchedSpoken[i] = j;
      usedSpoken[j] = true;
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }

  const statuses: WordStatus[] = new Array(n).fill('missed');
  let lastTouched = -1;
  for (let t = 0; t < n; t++) {
    if (matchedSpoken[t] !== null) {
      statuses[t] = 'correct';
      lastTouched = t;
    }
  }

  // Unmatched target words that have an unmatched spoken word in their gap were mispronounced.
  for (let t = 0; t < n; t++) {
    if (statuses[t] === 'correct') continue;
    let lo = -1;
    for (let k = t - 1; k >= 0; k--) {
      if (matchedSpoken[k] !== null) {
        lo = matchedSpoken[k] as number;
        break;
      }
    }
    let hi = m;
    for (let k = t + 1; k < n; k++) {
      if (matchedSpoken[k] !== null) {
        hi = matchedSpoken[k] as number;
        break;
      }
    }
    for (let s = lo + 1; s < hi; s++) {
      if (!usedSpoken[s]) {
        usedSpoken[s] = true;
        statuses[t] = 'wrong';
        lastTouched = Math.max(lastTouched, t);
        break;
      }
    }
  }

  if (!final) {
    for (let t = lastTouched + 1; t < n; t++) statuses[t] = 'pending';
  }

  const correct = statuses.filter((s) => s === 'correct').length;
  return { statuses, correct, total: n, accuracy: n === 0 ? 0 : correct / n };
}

export function starsForAccuracy(accuracy: number): 0 | 1 | 2 | 3 {
  if (accuracy >= 0.9) return 3;
  if (accuracy >= 0.7) return 2;
  if (accuracy >= 0.4) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Progress & parent report
// ---------------------------------------------------------------------------

export interface FasihProgress {
  bestStars: Record<string, number>;
  tashkeelCorrect: number;
  tashkeelAttempts: number;
  lastPracticeDay: string;
  streakDays: number;
}

export function emptyProgress(): FasihProgress {
  return { bestStars: {}, tashkeelCorrect: 0, tashkeelAttempts: 0, lastPracticeDay: '', streakDays: 0 };
}

function dayDiff(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

export function recordPracticeDay(progress: FasihProgress, todayKey: string): FasihProgress {
  if (progress.lastPracticeDay === todayKey) return progress;
  const gap = progress.lastPracticeDay ? dayDiff(progress.lastPracticeDay, todayKey) : Infinity;
  return { ...progress, lastPracticeDay: todayKey, streakDays: gap === 1 ? progress.streakDays + 1 : 1 };
}

export function recordLessonResult(progress: FasihProgress, lessonId: string, stars: number): FasihProgress {
  return { ...progress, bestStars: { ...progress.bestStars, [lessonId]: Math.max(progress.bestStars[lessonId] ?? 0, stars) } };
}

export function recordTashkeelAnswer(progress: FasihProgress, correct: boolean): FasihProgress {
  return {
    ...progress,
    tashkeelAttempts: progress.tashkeelAttempts + 1,
    tashkeelCorrect: progress.tashkeelCorrect + (correct ? 1 : 0),
  };
}

export function buildParentReport(progress: FasihProgress, childName: string): string {
  const lessons = Object.keys(progress.bestStars).length;
  const stars = Object.values(progress.bestStars).reduce((a, b) => a + b, 0);
  const tashkeel =
    progress.tashkeelAttempts === 0
      ? 'لم يبدأ بعد'
      : `${Math.round((progress.tashkeelCorrect / progress.tashkeelAttempts) * 100)}%`;
  return [
    `📚 تقرير فصيح لـ ${childName}`,
    `⭐ النجوم: ${stars}`,
    `✅ الدروس المكتملة: ${lessons}`,
    `🔤 دقة التشكيل: ${tashkeel}`,
    `🔥 أيام التدريب المتتالية: ${progress.streakDays}`,
  ].join('\n');
}

export function whatsappShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
