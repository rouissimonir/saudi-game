import type { Expression, HostId } from './types';

/**
 * DRAFT scripts for the seven local hosts of the area chapters (docs/ART_BATCH_8.md). Nothing here is shown in the
 * game yet: the hosts have no portraits, so they are not in `CastId`, and no chapter reads this file. It exists so the
 * writing can be reviewed (and the Arabic checked by a native speaker) before the art lands, and so wiring them in is
 * mechanical (docs/CODEX_TASK_HOSTS.md).
 *
 * Each host opens "their" area chapter (5 to 11) and then the existing speaker (Faisal, Lama, Noura, Tariq, Sultan)
 * carries on as before. A draft never changes a choice: `afterChoice` is keyed by the chapter's real option ids, so the
 * story flags the later chapters read (`jeddah`, `alula`, ...) stay exactly as they are.
 *
 * Where the pieces go in the existing chapter (src/story/scenes/areaChapters.ts):
 * - `opening`: right after the title card, before the chapter's first beat.
 * - `afterChoice[optionId]`: right after the first beat of that option's branch (the beat the option's `next` names).
 * - `closing`: right before the chapter's final `end` beat.
 *
 * Hosts only use the four painted expressions (neutral, happy, surprised, worried). Dialect wording and every cultural
 * detail (Hijazi, Taif and Asiri especially) need native review before launch. Names and places are fictional.
 */
export type { HostId };
export type HostExpression = Exclude<Expression, 'angry'>;

export interface DraftLine {
  /** Beat id, unique within the chapter once inserted. */
  id: string;
  speaker: 'layla' | HostId;
  /** Layla's expression and the host's expression on stage while this line is shown. */
  layla: HostExpression;
  host: HostExpression;
  ar: string;
  en: string;
}

export interface HostDraft {
  host: HostId;
  nameAr: string;
  nameEn: string;
  /** Chapter id, as in AREA_SCENES. */
  chapterId: string;
  opening: DraftLine[];
  /** Keyed by the chapter's real choice option ids. */
  afterChoice: Record<string, DraftLine>;
  closing: DraftLine;
  /** A small gift the host leaves with Layla; the epilogue can recall all seven. */
  keepsake: { ar: string; en: string };
  /** The keepsake in a few words, for the epilogue's shelf of gifts. */
  shelf: { ar: string; en: string };
}

export const HOST_DRAFTS: HostDraft[] = [
  {
    host: 'hani',
    nameAr: 'أبو هاني',
    nameEn: 'Abu Hani',
    chapterId: 'area_1',
    opening: [
      {
        id: 'host_welcome', speaker: 'hani', layla: 'happy', host: 'happy',
        ar: 'أهلاً بنت الدرعية! أنا أبو هاني، أبيع الهيل في هالزقاق من أربعين سنة.',
        en: "Welcome, daughter of Diriyah! I'm Abu Hani, and I've sold cardamom in this lane for forty years.",
      },
      {
        id: 'host_worry', speaker: 'hani', layla: 'neutral', host: 'worried',
        ar: 'بس الزقاق ما عاد يفوح قهوة مثل أول… الناس مشغولة، والبيوت القديمة تنتظر.',
        en: "But the lane doesn't smell of coffee like it used to… people are busy, and the old houses are waiting.",
      },
      {
        id: 'host_promise', speaker: 'layla', layla: 'happy', host: 'worried',
        ar: 'نرجّع له ريحته يا عم أبو هاني. هذا وعد.',
        en: "We'll bring its smell back, Uncle Abu Hani. That's a promise.",
      },
    ],
    afterChoice: {
      souq: {
        id: 'host_souq', speaker: 'hani', layla: 'happy', host: 'happy',
        ar: 'ركن في سوق العلوي؟ أعطيك أحسن مكان قدام دكاني، والهيل علي!',
        en: "A corner in Al-Alawi souq? I'll give you the best spot in front of my shop, and the cardamom is on me!",
      },
      rawshan: {
        id: 'host_rawshan', speaker: 'hani', layla: 'happy', host: 'surprised',
        ar: 'هالروشان؟ أبوي كان يقعد تحته يشرب شاهي. رجّعيه وأنا أول ضيف!',
        en: 'That rawshan? My father used to sit under it drinking tea. Bring it back and I will be your first guest!',
      },
    },
    closing: {
      id: 'host_gift', speaker: 'hani', layla: 'happy', host: 'happy',
      ar: 'خذي هالعلبة، أول هيل الموسم. وإذا مرّ يوم وطعم القهوة ضاع، تذكّري زقاق البلد.',
      en: "Take this tin, the season's first cardamom. And if coffee ever loses its taste, remember the lane of Al-Balad.",
    },
    keepsake: { ar: 'علبة هيل من أول الموسم', en: "a tin of the season's first cardamom" },
    shelf: { ar: 'هيل أبو هاني', en: "Hani's cardamom" },
  },
  {
    host: 'reem',
    nameAr: 'ريم',
    nameEn: 'Reem',
    chapterId: 'area_2',
    opening: [
      {
        id: 'host_welcome', speaker: 'reem', layla: 'happy', host: 'happy',
        ar: 'مرحبا ليلى! أنا ريم، مرشدة التراث هنا. هالجبال تشوف المسافرين من آلاف السنين.',
        en: "Hello, Layla! I'm Reem, a heritage guide here. These cliffs have watched travellers for thousands of years.",
      },
      {
        id: 'host_caravans', speaker: 'reem', layla: 'surprised', host: 'neutral',
        ar: 'كل قافلة كانت توقف هنا تشرب وتستريح. الواحة دايماً كانت مجلساً مفتوحاً.',
        en: 'Every caravan stopped here to drink and rest. This oasis has always been an open majlis.',
      },
      {
        id: 'host_wonder', speaker: 'layla', layla: 'surprised', host: 'happy',
        ar: 'مجلس مفتوح من آلاف السنين… وحنا نحسب نفسنا أول من فكّر فيه!',
        en: 'An open majlis for thousands of years… and we thought we invented it!',
      },
    ],
    afterChoice: {
      live: {
        id: 'host_live', speaker: 'reem', layla: 'happy', host: 'surprised',
        ar: 'بث مباشر؟ حطّوا الكاميرات عند المنصة… بس لا تقربون الصخور المنقوشة، هذي أمانة.',
        en: "A live stream? Set the cameras at the deck… but keep clear of the carved rocks, they're a trust.",
      },
      quiet: {
        id: 'host_quiet', speaker: 'reem', layla: 'happy', host: 'happy',
        ar: 'ليلة هادية؟ هذا اللي كانت تسويه القوافل: نجمة، وفنجال، وسالفة.',
        en: 'A quiet night? That is what the caravans did: a star, a cup and a story.',
      },
    },
    closing: {
      id: 'host_gift', speaker: 'reem', layla: 'happy', host: 'happy',
      ar: 'هذا دفتري، كتبت فيه الأسماء اللي سمّاها الأجداد للنجوم. كمّليه أنتِ.',
      en: 'This is my notebook, with the names the ancestors gave the stars. You finish it.',
    },
    keepsake: { ar: 'دفتر بأسماء النجوم القديمة', en: 'a notebook of old star names' },
    shelf: { ar: 'دفتر ريم', en: "Reem's notebook" },
  },
  {
    host: 'hessa',
    nameAr: 'حصة',
    nameEn: 'Hessa',
    chapterId: 'area_3',
    opening: [
      {
        id: 'host_welcome', speaker: 'hessa', layla: 'happy', host: 'happy',
        ar: 'يا هلا! أنا حصة. أقطّر ماء الورد من صغري، في قدر أمي النحاس.',
        en: "Welcome! I'm Hessa. I've distilled rose water since I was a girl, in my mother's copper still.",
      },
      {
        id: 'host_season', speaker: 'hessa', layla: 'surprised', host: 'worried',
        ar: 'الورد يتفتح كم أسبوع بس، ويذبل بسرعة. نقطفه بدري ونقطّره نفس اليوم.',
        en: 'The roses bloom for only a few weeks, and fade fast. We pick them early and distil them the same day.',
      },
      {
        id: 'host_scent', speaker: 'layla', layla: 'happy', host: 'happy',
        ar: 'يعني ريحة الفنجال… هي ريحة صباح واحد.',
        en: 'So the scent in a cup is the scent of one single morning.',
      },
    ],
    afterChoice: {
      rose: {
        id: 'host_rose', speaker: 'hessa', layla: 'happy', host: 'happy',
        ar: 'فنجال الخطوبة؟ أعطيك أول قطرات التقطير. هذي ما تنباع… تنقدَّم.',
        en: 'The Proposal Cup? I will give you the first drops from the still. Those are not sold, they are served.',
      },
      pomegranate: {
        id: 'host_pomegranate', speaker: 'hessa', layla: 'happy', host: 'surprised',
        ar: 'ورد ورمان للصغار! أنا أقطف لهم الرمان بنفسي من مدرّجي.',
        en: 'Rose and pomegranate for the kids! I will pick the pomegranates for them myself from my terrace.',
      },
    },
    closing: {
      id: 'host_gift', speaker: 'hessa', layla: 'happy', host: 'happy',
      ar: 'هذي قارورة من أول تقطير الموسم. رشّي منها على ضيوفك، وخلّي الورد يتكلم عنّا.',
      en: "A bottle from the season's first distilling. Sprinkle a little on your guests, and let the roses speak for us.",
    },
    keepsake: { ar: 'قارورة ماء ورد من أول تقطير', en: 'a bottle of first-distilling rose water' },
    shelf: { ar: 'ورد حصة', en: "Hessa's rose water" },
  },
  {
    host: 'aisha',
    nameAr: 'عائشة',
    nameEn: 'Aisha',
    chapterId: 'area_4',
    opening: [
      {
        id: 'host_welcome', speaker: 'aisha', layla: 'happy', host: 'happy',
        ar: 'أهلاً فوق الغيم. أنا عائشة، أرسم القَطّ على جدران البيوت مثل ما علّمتني أمي.',
        en: "Welcome above the clouds. I'm Aisha. I paint Al-Qatt on house walls, the way my mother taught me.",
      },
      {
        id: 'host_lines', speaker: 'aisha', layla: 'surprised', host: 'neutral',
        ar: 'نرسم البيت قبل ما يجي الضيوف، والخطوط تقول لهم: أنتم من أهلنا.',
        en: "We paint the house before the guests arrive, and the lines tell them: you are family.",
      },
      {
        id: 'host_invite', speaker: 'layla', layla: 'happy', host: 'happy',
        ar: 'ارسمي لنا جداراً في المجلس، ويحس الدرعية إن الجبال بيتها.',
        en: 'Paint us a wall of the Majlis, and Diriyah will feel the mountains are home.',
      },
    ],
    afterChoice: {
      farmers: {
        id: 'host_farmers', speaker: 'aisha', layla: 'happy', host: 'happy',
        ar: 'تشترون من المزارعين مباشرة؟ أرسم لهم باب المخزن… بركة وخير.',
        en: "You'll buy straight from the farmers? I'll paint their storehouse door, for blessing and plenty.",
      },
      train: {
        id: 'host_train', speaker: 'aisha', layla: 'happy', host: 'surprised',
        ar: 'والشباب يتعلمون؟ ابعثي لي البنات بعد: أعلّمهم الرسم وهم ينتظرون البن يتحمّص.',
        en: "And the youth are learning? Send me the girls too: I'll teach them to paint while the beans roast.",
      },
    },
    closing: {
      id: 'host_gift', speaker: 'aisha', layla: 'happy', host: 'happy',
      ar: 'خذي هالفرشاة. إذا طلعتي من مجلس ناقصه لون، ارسميه.',
      en: 'Take this brush. If you ever leave a majlis missing a colour, paint it in.',
    },
    keepsake: { ar: 'فرشاة رسم القَطّ', en: 'a painting brush for Al-Qatt' },
    shelf: { ar: 'فرشاة عائشة', en: "Aisha's brush" },
  },
  {
    host: 'khalid',
    nameAr: 'أبو خالد',
    nameEn: 'Abu Khalid',
    chapterId: 'area_5',
    opening: [
      {
        id: 'host_welcome', speaker: 'khalid', layla: 'happy', host: 'happy',
        ar: 'تفضّلي يا بنتي! أنا أبو خالد، أسقي هالنخل من نفس عين أبوي وجدّي.',
        en: "Welcome, my girl! I'm Abu Khalid. I water these palms from the same spring as my father and grandfather.",
      },
      {
        id: 'host_patience', speaker: 'khalid', layla: 'neutral', host: 'worried',
        ar: 'النخلة تعلّمك الصبر. تاخذ سنين لين تثمر، وتعطي أجيال. وهالسنة الماي يبي حسابه.',
        en: 'A palm teaches patience: years before it fruits, then it gives for generations. And this year the water needs counting.',
      },
      {
        id: 'host_turns', speaker: 'khalid', layla: 'surprised', host: 'neutral',
        ar: 'نقسمه بالدور مثل ما كان أهلنا. الكل ياخذ حقه، والكل يترك للثاني.',
        en: 'We share it in turns, as our elders did. Everyone takes their share, and everyone leaves some for the next.',
      },
    ],
    afterChoice: {
      dibs: {
        id: 'host_dibs', speaker: 'khalid', layla: 'happy', host: 'surprised',
        ar: 'سر الدبس تنقالينه؟ جدّتك سخية. بس بشرط: اللي يتعلمه يعزم جيرانه.',
        en: 'Share the date-syrup secret? Your grandmother is generous. One condition: whoever learns it invites the neighbours.',
      },
      tasting: {
        id: 'host_tasting', speaker: 'khalid', layla: 'happy', host: 'happy',
        ar: 'مجلس تمر! أجيب لك من كل نخلة وكل موسم، وقارني بين الخلاص والرزيز.',
        en: 'A date majlis! I will bring you dates from every palm and every season, and you compare Khalas and Ruzeiz.',
      },
    },
    closing: {
      id: 'host_gift', speaker: 'khalid', layla: 'happy', host: 'happy',
      ar: 'هذي سلّة خلاص من أول الصرام. التمر قبل القهوة… ولا تنسين تاكلين منه.',
      en: "A basket of Khalas from the first harvest. Dates come before the coffee… and don't forget to eat some.",
    },
    keepsake: { ar: 'سلّة خلاص من أول الصرام', en: 'a basket of first-harvest Khalas dates' },
    shelf: { ar: 'تمر أبو خالد', en: "Khalid's dates" },
  },
  {
    host: 'dana',
    nameAr: 'دانة',
    nameEn: 'Dana',
    chapterId: 'area_6',
    opening: [
      {
        id: 'host_welcome', speaker: 'dana', layla: 'happy', host: 'happy',
        ar: 'أنتِ ليلى؟ أنا دانة، منتجة الفعاليات. عندي لك أحلى ركن، بس عندي مشكلة.',
        en: "You're Layla? I'm Dana, the event producer. I've got you the best stand, but I also have a problem.",
      },
      {
        id: 'host_problem', speaker: 'dana', layla: 'surprised', host: 'worried',
        ar: 'الشاشات والأضواء تسرق الليل. وزوارنا يبون شي حقيقي يمسكونه بإيديهم: فنجال.',
        en: 'Screens and lights steal the night. Our visitors want something real to hold in their hands: a cup.',
      },
      {
        id: 'host_cup', speaker: 'layla', layla: 'happy', host: 'happy',
        ar: 'نعطيهم فنجال بحجم الدرعية.',
        en: "We'll hand them a cup as big as Diriyah.",
      },
    ],
    afterChoice: {
      partner: {
        id: 'host_partner', speaker: 'dana', layla: 'happy', host: 'surprised',
        ar: 'شراكة مع راشد؟! ممتاز. أصلاً كنت أبي أحطكم على المسرح مع بعض.',
        en: 'A partnership with Rashid?! Perfect. I was hoping to put you on the same stage.',
      },
      own: {
        id: 'host_own', speaker: 'dana', layla: 'neutral', host: 'neutral',
        ar: 'مجلس مستقل؟ عادي، الطابور يحكم. أجهّز لكم ماي وكراسي للصف.',
        en: 'Staying independent? Fine by me, the queue will decide. I will set out water and chairs for the line.',
      },
    },
    closing: {
      id: 'host_gift', speaker: 'dana', layla: 'happy', host: 'happy',
      ar: 'هذي بطاقة تفتح كل الأبواب. البوليفارد يسكر آخر الليل، بس المجلس ما يسكر.',
      en: 'An all-access pass. The Boulevard closes at the end of the night, but the Majlis never does.',
    },
    keepsake: { ar: 'بطاقة دخول لكل الأبواب', en: 'an all-access pass' },
    shelf: { ar: 'بطاقة دانة', en: "Dana's pass" },
  },
  {
    host: 'nasser',
    nameAr: 'النوخذة ناصر',
    nameEn: 'Captain Nasser',
    chapterId: 'area_7',
    opening: [
      {
        id: 'host_welcome', speaker: 'nasser', layla: 'happy', host: 'happy',
        ar: 'حيّاك الله يا ليلى! أنا النوخذة ناصر، قدت سفينة غوص أربعين موسم.',
        en: "God welcome you, Layla! I'm Captain Nasser. I led a pearl-diving ship for forty seasons.",
      },
      {
        id: 'host_cup', speaker: 'nasser', layla: 'surprised', host: 'neutral',
        ar: 'وإذا طلع الغواص من القاع، أول شي ينتظره على السفينة فنجال قهوة.',
        en: 'And when a diver came up from the seabed, the first thing waiting on deck was a cup of coffee.',
      },
      {
        id: 'host_order', speaker: 'layla', layla: 'surprised', host: 'happy',
        ar: 'يعني الفنجال بعد اللؤلؤة؟',
        en: 'So the cup came after the pearl?',
      },
    ],
    afterChoice: {
      grandpa: {
        id: 'host_grandpa', speaker: 'nasser', layla: 'happy', host: 'happy',
        ar: 'جدّك؟ عرفته! كان يرسل البن من نجد لسفننا. رجّال كريم.',
        en: 'Your grandfather? I knew him. He sent coffee beans from Najd to our ships. A generous man.',
      },
      team: {
        id: 'host_team', speaker: 'nasser', layla: 'happy', host: 'happy',
        ar: 'للفريق! اللؤلؤة الحقيقية دايماً الرجال على السفينة، ومن ينتظرنا عند الشاطئ.',
        en: 'For the team! The real pearl is always the crew on the deck, and those who wait for us on the shore.',
      },
    },
    closing: {
      id: 'host_gift', speaker: 'nasser', layla: 'happy', host: 'happy',
      ar: 'خذي هالمحارة، فيها لؤلؤة صغيرة. اللؤلؤة ما تنباع… تنهدى.',
      en: 'Take this small shell, with a little pearl inside. A pearl is not sold, it is given.',
    },
    keepsake: { ar: 'محارة فيها لؤلؤة صغيرة', en: 'a small shell with a pearl inside' },
    shelf: { ar: 'لؤلؤة ناصر', en: "Nasser's pearl" },
  },
];

export function hostDraftFor(chapterId: string): HostDraft | undefined {
  return HOST_DRAFTS.find((d) => d.chapterId === chapterId);
}
