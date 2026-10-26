import { Scene } from '../types';
import { say, titleCard } from './build';

const BG = 'sadu';

/**
 * Chapter 2, hand-written: Faisal's Sadu coffee corner is a hit and the critic Lama is coming tonight. Faisal reports
 * what Rashid did after chapter 1 (flag `rashid_ch1`); Layla picks what to serve Lama, which sets `menu` for
 * chapter 4. Dialect wording needs native review before launch.
 */
export function chapter2Scene(flags: Record<string, string>): Scene {
  const hosted = flags.rashid_ch1 === 'host';
  return {
    id: 'chapter:chap_2',
    titleAr: 'الفصل الثاني: سحر السدو النجدي',
    titleEn: 'Chapter 2: Threads of Najdi Sadu',
    beats: [
      titleCard(BG, 'الفصل الثاني: سحر السدو النجدي', 'Chapter 2: Threads of Najdi Sadu'),
      say('buzz', BG, ['layla', 'happy'], ['faisal', 'happy'], 'faisal',
        'ليلى! الدلة النجدية جنب الـ V60… الشباب والشيّاب صاروا يجون سوا!',
        'Layla! The Najdi dallah next to the V60… the young crowd and the elders are coming together!',
        { camera: 'zoom-in' }),
      say('sadu', BG, ['layla', 'happy'], ['faisal', 'neutral'], 'layla',
        'ونقوش السدو رجّعت روح المجلس. جدّتي ما وقفت تبتسم من الصبح.',
        "And the Sadu weaving brought the Majlis's soul back. Grandma hasn't stopped smiling all morning."),
      say('rashid_news', BG, ['layla', 'worried'], ['faisal', 'worried'], 'faisal',
        hosted
          ? 'بس تدرين؟ راشد رجع الصبح يبي فنجال ثاني… وسألني من وين نجيب البن!'
          : 'بس انتبهي… شفت رجال راشد يقيسون الزقاق اللي قدام المجلس.',
        hosted
          ? 'But guess what? Rashid came back this morning for a second cup… and asked where we buy our beans!'
          : "But careful… I saw Rashid's men measuring the lane in front of the Majlis.",
        { camera: 'shake' }),
      say('lama', BG, ['layla', 'surprised'], ['faisal', 'surprised'], 'faisal',
        'والأهم: لمى، أشهر ناقدة قهوة في الخليج، جاية الليلة تقيّمنا على الهواء!',
        "And the big news: Lama, the most famous coffee critic in the Gulf, is coming tonight to review us live!"),
      {
        id: 'answer',
        bg: BG,
        cast: [
          { id: 'layla', pos: 'left', expr: 'neutral' },
          { id: 'faisal', pos: 'right', expr: 'neutral' },
        ],
        textAr: 'وش تقدّمين للمى؟',
        textEn: 'What will you serve Lama?',
        choice: [
          {
            id: 'heritage',
            textAr: 'قهوة سعودية بالهيل مع تمر سكري',
            textEn: 'Saudi cardamom qahwa with Sukkari dates',
            flag: ['menu', 'heritage'],
            reward: { gems: 5 },
            next: 'heritage_say',
          },
          {
            id: 'fusion',
            textAr: 'لاتيه الزعفران من ابتكار فيصل',
            textEn: "Faisal's saffron latte creation",
            flag: ['menu', 'fusion'],
            reward: { coins: 100 },
            next: 'fusion_say',
          },
        ],
      },
      say('heritage_say', BG, ['layla', 'happy'], ['faisal', 'neutral'], 'layla',
        'نقدّم لها اللي ما تلقاه بأي مكان ثاني: قهوة جدّي بالهيل، والتمر السكري.',
        "We'll give her what she can't find anywhere else: Grandpa's cardamom qahwa and Sukkari dates."),
      say('heritage_faisal', BG, ['layla', 'happy'], ['faisal', 'happy'], 'faisal',
        'الأصالة دايماً تفوز! أجهّز الدلة الكبيرة.',
        "Heritage always wins! I'll get the big dallah ready.",
        { next: 'end' }),
      say('fusion_say', BG, ['layla', 'happy'], ['faisal', 'surprised'], 'layla',
        'خلّنا نفاجئها! لاتيه الزعفران حقّك يا فيصل، بلمسة هيل.',
        "Let's surprise her! Your saffron latte, Faisal, with a touch of cardamom."),
      say('fusion_faisal', BG, ['layla', 'happy'], ['faisal', 'happy'], 'faisal',
        'تثقين فيني؟! وعد، بتكون أحلى لاتيه ذاقتها.',
        "You trust me with it?! I promise, it'll be the best latte she's ever had."),
      say('end', BG, ['layla', 'happy'], ['faisal', 'happy'], 'layla',
        'يلا نجهّز المجلس… الليلة ليلتنا!',
        "Let's get the Majlis ready… tonight is our night!"),
    ],
  };
}
