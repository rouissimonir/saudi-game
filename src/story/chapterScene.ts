import type { StoryChapter } from '../game/rules';
import { Beat, CastId, Expression, Scene } from './types';

/** Backdrop per chapter; area chapters default to the street until they get their own painted backdrops. */
const CHAPTER_BG: Record<string, string> = {
  chap_1: 'courtyard',
  chap_2: 'courtyard',
  chap_3: 'dallah',
  chap_4: 'courtyard',
};

/** Layla answers the last line, so every chapter ends on her resolve rather than on a monologue. */
const LAYLA_REPLIES: { ar: string; en: string }[] = [
  { ar: 'اعتمدوا عليّ… يلا نشتغل!', en: "Count on me… let's get to work!" },
  { ar: 'فكرة حلوة! خلّوها عليّ.', en: "What a lovely idea! Leave it to me." },
  { ar: 'جدّي كان بيفخر فينا اليوم.', en: 'Grandpa would be proud of us today.' },
  { ar: 'خطوة خطوة… والمجلس يرجع أحلى!', en: 'Step by step… the Majlis comes back even better!' },
];

const WORRY = /راشد|Rashid|خطر|danger|تهديد|threat|council|المجلس البلدي/i;
const SURPRISE = /[!؟?]\s*$|wow|يا سلام|ما شاء الله|secret|سر/i;

function speakerExpr(line: string, index: number, last: boolean): Expression {
  if (WORRY.test(line)) return 'worried';
  if (index === 0 || last) return 'happy';
  return SURPRISE.test(line) ? 'surprised' : 'neutral';
}

/**
 * Turns a story chapter into an animated scene: a narrated title card, the speaker's lines opposite Layla
 * (expressions follow the mood of each line), then Layla's reply. Hand-written scenes can replace any chapter later.
 */
export function chapterScene(chapter: StoryChapter, speaker: CastId | null): Scene {
  const bg = CHAPTER_BG[chapter.id] ?? 'street';
  const who: CastId = speaker && speaker !== 'layla' ? speaker : 'noura';
  const count = Math.min(chapter.dialogueAr.length, chapter.dialogueEn.length);
  const beats: Beat[] = [
    { id: 'title', bg, camera: 'pan-down', cast: [], textAr: chapter.titleAr, textEn: chapter.titleEn },
  ];
  for (let i = 0; i < count; i++) {
    const last = i === count - 1;
    const expr = speakerExpr(chapter.dialogueEn[i], i, last);
    beats.push({
      id: `line_${i}`,
      bg,
      camera: i === 0 ? 'zoom-in' : expr === 'worried' ? 'shake' : undefined,
      cast: [
        { id: 'layla', pos: 'left', expr: expr === 'worried' ? 'worried' : i === 0 ? 'happy' : 'neutral' },
        { id: who, pos: 'right', expr },
      ],
      speaker: who,
      textAr: chapter.dialogueAr[i],
      textEn: chapter.dialogueEn[i],
    });
  }
  const reply = LAYLA_REPLIES[chapter.chapterNumber % LAYLA_REPLIES.length];
  beats.push({
    id: 'reply',
    bg,
    cast: [
      { id: 'layla', pos: 'left', expr: 'happy' },
      { id: who, pos: 'right', expr: 'happy' },
    ],
    speaker: 'layla',
    textAr: reply.ar,
    textEn: reply.en,
  });
  return { id: `chapter:${chapter.id}`, titleAr: chapter.titleAr, titleEn: chapter.titleEn, beats };
}
