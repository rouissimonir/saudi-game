import { StoryChapter } from '../game/rules';

/**
 * Lets story choices echo in later chapters. Chapter 1 gains one line from Noura that remembers how Layla
 * answered Rashid in the prologue; saves without the flag see the chapter unchanged.
 */
export function withStoryFlags(chapter: StoryChapter | null, flags: Record<string, string>): StoryChapter | null {
  if (!chapter || chapter.id !== 'chap_1' || !flags.rivalry) return chapter;
  const line =
    flags.rivalry === 'firm'
      ? {
          ar: 'وبعد ما رديتي على راشد بذاك الحزم، صار يدوّر على أي ثغرة… خلّينا نسبقه!',
          en: "And after you stood up to Rashid like that, he's hunting for any loophole… let's stay one step ahead!",
        }
      : {
          ar: 'راشد ما نسى ردّك المؤدب، بس لا يغرّك هدوءه… خلّينا نسبقه!',
          en: "Rashid hasn't forgotten your polite answer, but don't let his calm fool you… let's stay one step ahead!",
        };
  return { ...chapter, dialogueAr: [...chapter.dialogueAr, line.ar], dialogueEn: [...chapter.dialogueEn, line.en] };
}
