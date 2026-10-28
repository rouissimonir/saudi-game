import { Scene } from '../types';
import { paintedBg } from '../chapterScene';
import { say, titleCard } from './build';
import { HOST_DRAFTS } from '../hostDrafts';

type Flags = Record<string, string>;

/** One recap line per story decision the player made; decisions they never reached are left out. */
function recap(f: Flags): { ar: string; en: string }[] {
  const lines: { ar: string; en: string }[] = [];
  if (f.rivalry)
    lines.push(f.rivalry === 'firm'
      ? { ar: 'يوم وصلتي، وقفتي في وجه راشد: "إرث جدّي ما ينباع!"', en: 'The day you arrived, you stood up to Rashid: "My grandfather\'s legacy is not for sale!"' }
      : { ar: 'يوم وصلتي، رديتي على راشد بأدب… وبحزم.', en: 'The day you arrived, you answered Rashid politely… and firmly.' });
  if (f.menu)
    lines.push(f.menu === 'fusion'
      ? { ar: 'قدّمتي للمى لاتيه الزعفران… وصار ترند في الخليج.', en: "You served Lama Faisal's saffron latte… and it trended across the Gulf." }
      : { ar: 'قدّمتي للمى قهوة جدّك بالهيل… وذاق الخليج طعم الأصالة.', en: "You served Lama Grandpa's cardamom qahwa… and the Gulf tasted heritage." });
  if (f.tariq)
    lines.push(f.tariq === 'blend'
      ? { ar: 'وعرفتي من الشيخ طارق سر الخلطة الملكية.', en: 'Sheikh Tariq trusted you with the secret of the Royal Blend.' }
      : { ar: 'وصبّيتي للشيخ طارق أول فنجال… فشاف جدّك فيك.', en: 'You poured Sheikh Tariq the first cup… and he saw your grandfather in you.' });
  if (f.abha)
    lines.push(f.abha === 'farmers'
      ? { ar: 'في أبها، اشتريتي من المزارعين بالعدل.', en: 'In Abha, you paid the coffee farmers fairly.' }
      : { ar: 'في أبها، علّمتي شباب القرية يحمّصون بنهم.', en: 'In Abha, you taught the village youth to roast their own beans.' });
  if (f.riyadh)
    lines.push(f.riyadh === 'partner'
      ? { ar: 'وفي الرياض، فتحتي باب المجلس حتى لراشد.', en: 'And in Riyadh, you opened the Majlis door even to Rashid.' }
      : { ar: 'وفي الرياض، خلّيتي القهوة هي اللي تحكم.', en: 'And in Riyadh, you let the coffee decide.' });
  return lines;
}

/** The keepsakes of the local hosts the player actually met (their area chapter was played), as two short beats. */
function shelf(bg: string, seenScenes?: string[]) {
  const met = HOST_DRAFTS.filter((d) => !seenScenes || seenScenes.includes(`chapter:${d.chapterId}`));
  if (met.length === 0) return [];
  return [
    say('shelf_intro', bg, ['layla', 'happy'], null, null,
      'رفّ المجلس مليان هدايا من المدن اللي مرّيتي فيها…',
      'The Majlis shelf is full of gifts from the cities you visited…',
      { cast: [{ id: 'layla', pos: 'center', expr: 'happy' }] }),
    say('shelf_list', bg, ['layla', 'happy'], null, null,
      met.map((d) => d.shelf.ar).join('، ') + '.',
      met.map((d) => d.shelf.en).join(', ') + '.',
      { cast: [{ id: 'layla', pos: 'center', expr: 'happy' }] }),
  ];
}

/**
 * The epilogue after the Khobar finale: Noura looks back, the narrator recaps the player's own choices, and the ending
 * is named after the Riyadh decision. Uses the finale backdrop once painted (docs/ART_BATCH_3.md), the lanterns until then.
 */
export function endingScene(f: Flags, seenScenes?: string[]): Scene {
  const bg = paintedBg('finale', 'lanterns');
  const partner = f.riyadh === 'partner';
  const name = partner
    ? { ar: 'مجلس الشراكة', en: 'The Majlis of Partnership' }
    : { ar: 'المجلس الصامد', en: 'The Majlis That Stood Firm' };
  return {
    id: 'ending',
    titleAr: 'الخاتمة: حكاية مجلسك',
    titleEn: 'Epilogue: Your Majlis Story',
    beats: [
      titleCard(bg, 'الخاتمة: حكاية مجلسك', 'Epilogue: Your Majlis Story'),
      say('noura', bg, ['layla', 'happy'], ['noura', 'happy'], 'noura',
        'شوفي وين وصلتي يا ليلى… من مجلس طين متشقق، لأول مجلس في المملكة.',
        'Look how far you have come, Layla… from a cracked mud-brick majlis to the first Majlis of the Kingdom.',
        { camera: 'zoom-in' }),
      ...recap(f).map((line, i) =>
        say(`recap_${i}`, bg, ['layla', 'happy'], null, null, line.ar, line.en, { cast: [{ id: 'layla', pos: 'center', expr: 'happy' }] })
      ),
      ...shelf(bg, seenScenes),
      say('ending_name', bg, ['layla', 'happy'], ['noura', 'happy'], null,
        `نهايتك: ${name.ar}`,
        `Your ending: ${name.en}`,
        { camera: 'push' }),
      say('last', bg, ['layla', 'happy'], ['noura', 'happy'], 'layla',
        'ودلّة جدّي… للحين تصبّ أول فنجال.',
        "And Grandpa's dallah… still pours the first cup."),
    ],
  };
}
