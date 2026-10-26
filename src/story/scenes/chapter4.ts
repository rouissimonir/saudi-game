import { Scene } from '../types';
import { say, titleCard } from './build';

const BG = 'lanterns';

/**
 * Chapter 4, hand-written: the Ramadan ghabga is a sensation. Lama praises whatever Layla served her in chapter 2
 * (flag `menu`), then Rashid arrives; his tone depends on chapter 1 (`rashid_ch1`). Layla invites him to sit or holds
 * her ground, setting `rashid_ch4`. Dialect wording needs native review before launch.
 */
export function chapter4Scene(flags: Record<string, string>): Scene {
  const fusion = flags.menu === 'fusion';
  const hosted = flags.rashid_ch1 === 'host';
  return {
    id: 'chapter:chap_4',
    titleAr: 'الفصل الرابع: ليالي الغبقة تحت الفوانيس',
    titleEn: 'Chapter 4: Ramadan Ghabga Under the Lanterns',
    beats: [
      titleCard(BG, 'الفصل الرابع: ليالي الغبقة تحت الفوانيس', 'Chapter 4: Ramadan Ghabga Under the Lanterns'),
      say('wow', BG, ['layla', 'happy'], ['lama', 'surprised'], 'lama',
        'المكان خيالي! الفوانيس وصوت النجر… الفيديو تعدّى مليونين مشاهدة في ساعة!',
        'This place is magical! The lanterns, the ringing mortar… my video passed two million views in an hour!',
        { camera: 'zoom-in' }),
      say('drink', BG, ['layla', 'happy'], ['lama', 'happy'], 'lama',
        fusion
          ? 'والكل يسأل عن لاتيه الزعفران! صار ترند في الخليج كله.'
          : 'والكل يسأل عن قهوتكم بالهيل! قالوا: هذي قهوة الأجداد صدق.',
        fusion
          ? "And everyone's asking about the saffron latte! It's trending across the Gulf."
          : 'And everyone is asking about your cardamom qahwa! They say it tastes like their grandparents\' coffee.'),
      say('booked', BG, ['layla', 'surprised'], ['lama', 'happy'], 'layla',
        'الحجوزات ممتلئة ثلاث أسابيع… ما كنت أحلم بهذا!',
        "Booked solid for three weeks… I never dreamed of this!"),
      say('rashid', BG, ['layla', hosted ? 'surprised' : 'worried'], ['rashid', hosted ? 'neutral' : 'angry'], 'rashid',
        hosted
          ? 'جيت أشوف بنفسي… وأعترف: قهوتكم أطيب قهوة في الدرعية.'
          : 'استانسي بليلتك. المجلس البلدي يجتمع الأسبوع الجاي.',
        hosted
          ? "I came to see for myself… and I admit it: your coffee is the best in Diriyah."
          : 'Enjoy your night. The council meets next week.',
        { camera: 'shake' }),
      {
        id: 'answer',
        bg: BG,
        cast: [
          { id: 'layla', pos: 'left', expr: 'neutral' },
          { id: 'rashid', pos: 'right', expr: 'neutral' },
        ],
        textAr: 'راشد واقف عند الباب في ليلة الغبقة…',
        textEn: 'Rashid is standing at the door on ghabga night…',
        choice: [
          {
            id: 'welcome',
            textAr: 'اعزميه يجلس معكم على الغبقة',
            textEn: 'Invite him to join the ghabga',
            flag: ['rashid_ch4', 'welcome'],
            reward: { coins: 150 },
            next: 'welcome_say',
          },
          {
            id: 'stand',
            textAr: 'قولي له: المجلس بيكسب بشرف',
            textEn: 'Tell him the Majlis will win fair and square',
            flag: ['rashid_ch4', 'stand'],
            reward: { gems: 8 },
            next: 'stand_say',
          },
        ],
      },
      say('welcome_say', BG, ['layla', 'happy'], ['rashid', 'surprised'], 'layla',
        'رمضان كريم يا راشد. تفضّل اجلس، الغبقة ما تكمل إلا بالضيوف.',
        "Ramadan Kareem, Rashid. Please sit, a ghabga isn't complete without guests."),
      say('welcome_rashid', BG, ['layla', 'happy'], ['rashid', 'surprised'], 'rashid',
        'ما توقعت… طيب. فنجال واحد بس.',
        "I didn't expect that… fine. Just one cup.",
        { next: 'crown' }),
      say('stand_say', BG, ['layla', 'angry'], ['rashid', 'neutral'], 'layla',
        'خلّ المجلس البلدي يجي ويشوف. بنكسب بشرف، مو بالأوراق.',
        "Let the council come and see. We'll win fair and square, not with paperwork."),
      say('stand_rashid', BG, ['layla', 'neutral'], ['rashid', hosted ? 'surprised' : 'angry'], 'rashid',
        hosted ? 'عادل… والمجلس الأفضل يفوز.' : 'نشوف مين يضحك آخر.',
        hosted ? "Fair enough… may the best Majlis win." : "We'll see who laughs last."),
      say('crown', BG, ['layla', 'happy'], ['lama', 'happy'], 'lama',
        'باقي خطوة وحدة: المشربية الملكية. رمّميها، وأعلنكم المجلس الأول في المملكة!',
        'Just one step left: the Royal Mashrabiya balcony. Restore it, and I will crown you the #1 Majlis in the Kingdom!'),
      say('end', BG, ['layla', 'happy'], ['lama', 'happy'], 'layla',
        'المشربية؟ اعتبريها خلصت!',
        'The Mashrabiya? Consider it done!'),
    ],
  };
}
