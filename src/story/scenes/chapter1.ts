import { Scene } from '../types';

/**
 * Chapter 1, hand-written: the first wing is restored, Noura hands Layla grandfather's mud-brick key, and Rashid
 * returns. His opening line depends on how Layla answered him in the prologue (flag `rivalry`); the choice here
 * sets `rashid_ch1` for later chapters. Dialect wording needs native review before launch.
 */
export function chapter1Scene(flags: Record<string, string>): Scene {
  const firm = flags.rivalry === 'firm';
  return {
    id: 'chapter:chap_1',
    titleAr: 'الفصل الأول: مفتاح قصر الطين في الدرعية',
    titleEn: 'Chapter 1: The Mud-Brick Key of Diriyah',
    beats: [
      {
        id: 'title',
        bg: 'courtyard',
        camera: 'pan-down',
        cast: [],
        textAr: 'الفصل الأول: مفتاح قصر الطين',
        textEn: 'Chapter 1: The Mud-Brick Key',
      },
      {
        id: 'wing',
        bg: 'courtyard',
        camera: 'zoom-in',
        cast: [
          { id: 'layla', pos: 'left', expr: 'happy' },
          { id: 'noura', pos: 'right', expr: 'happy' },
        ],
        speaker: 'noura',
        textAr: 'شوفي يا ليلى! أول جناح رجع يلمع… جدّك كان يستقبل الضيوف من هالمدخل.',
        textEn: 'Look, Layla! The first wing shines again… your grandfather welcomed guests through this very archway.',
      },
      {
        id: 'memory',
        bg: 'courtyard',
        cast: [
          { id: 'layla', pos: 'left', expr: 'surprised' },
          { id: 'noura', pos: 'right', expr: 'happy' },
        ],
        speaker: 'layla',
        textAr: 'ريحة البن الخولاني والهيل… كأنه ما راح!',
        textEn: "The scent of Khawlani coffee and cardamom… it's as if he never left!",
      },
      {
        id: 'key',
        bg: 'courtyard',
        cast: [
          { id: 'layla', pos: 'left', expr: 'happy' },
          { id: 'noura', pos: 'right', expr: 'neutral' },
        ],
        speaker: 'noura',
        textAr: 'وهذا مفتاحه، مفتاح قصر الطين. ما يفتح الباب بس… يفتح قلوب أهل الحي.',
        textEn: "And this is his key, the mud-brick key. It doesn't just open the door… it opens the neighbourhood's hearts.",
      },
      {
        id: 'rashid',
        bg: 'courtyard',
        camera: 'shake',
        cast: [
          { id: 'layla', pos: 'left', expr: 'worried' },
          { id: 'rashid', pos: 'right', expr: firm ? 'angry' : 'neutral' },
        ],
        speaker: 'rashid',
        textAr: firm
          ? 'مفتاح؟ ورقة من المجلس البلدي أقوى من أي مفتاح، يا ليلى.'
          : 'مبروك على الترميم… بس الموسم قصير، والمجلس البلدي ما ينتظر أحد.',
        textEn: firm
          ? 'A key? One permit from the council beats any key, Layla.'
          : 'Congratulations on the repairs… but the season is short, and the council waits for no one.',
      },
      {
        id: 'answer',
        bg: 'courtyard',
        cast: [
          { id: 'layla', pos: 'left', expr: 'neutral' },
          { id: 'rashid', pos: 'right', expr: 'neutral' },
        ],
        textAr: 'كيف تتعاملين مع راشد؟',
        textEn: 'How will you handle Rashid?',
        choice: [
          {
            id: 'proud',
            textAr: 'ورّيه الجناح المرمّم بكل فخر',
            textEn: 'Show him the restored wing with pride',
            flag: ['rashid_ch1', 'proud'],
            reward: { gems: 5 },
            next: 'proud_say',
          },
          {
            id: 'host',
            textAr: 'ضيّفيه فنجال قهوة',
            textEn: 'Offer him a cup of coffee',
            flag: ['rashid_ch1', 'host'],
            reward: { coins: 100 },
            next: 'host_say',
          },
        ],
      },
      {
        id: 'proud_say',
        bg: 'courtyard',
        cast: [
          { id: 'layla', pos: 'left', expr: 'angry' },
          { id: 'rashid', pos: 'right', expr: 'neutral' },
        ],
        speaker: 'layla',
        textAr: 'شوف بعينك… كل حجر هنا رجع بإيدينا. وبنكمّل!',
        textEn: "See for yourself… every stone here came back by our own hands. And we're not stopping!",
      },
      {
        id: 'proud_rashid',
        bg: 'courtyard',
        cast: [
          { id: 'layla', pos: 'left', expr: 'neutral' },
          { id: 'rashid', pos: 'right', expr: 'surprised' },
        ],
        speaker: 'rashid',
        textAr: 'ما توقعت تنجزين بهالسرعة… نشوف إلى متى.',
        textEn: "I didn't expect you to work this fast… we'll see how long it lasts.",
        next: 'noura_end',
      },
      {
        id: 'host_say',
        bg: 'courtyard',
        cast: [
          { id: 'layla', pos: 'left', expr: 'happy' },
          { id: 'rashid', pos: 'right', expr: 'neutral' },
        ],
        speaker: 'layla',
        textAr: 'حيّاك الله، تفضّل فنجالك. المجلس مفتوح للكل… حتى لك.',
        textEn: "You're welcome here, have a cup. The Majlis is open to everyone… even you.",
      },
      {
        id: 'host_rashid',
        bg: 'courtyard',
        cast: [
          { id: 'layla', pos: 'left', expr: 'happy' },
          { id: 'rashid', pos: 'right', expr: 'surprised' },
        ],
        speaker: 'rashid',
        textAr: 'القهوة… طيبة. لا تحسبين هالشي بيغيّر رأيي.',
        textEn: "The coffee is… good. Don't think that changes my mind.",
      },
      {
        id: 'noura_end',
        bg: 'courtyard',
        cast: [
          { id: 'layla', pos: 'left', expr: 'neutral' },
          { id: 'noura', pos: 'right', expr: 'happy' },
        ],
        speaker: 'noura',
        textAr: 'خلّيه يقول اللي يبي. وصية جدّك واضحة: نحيي المجلس ونكرم الضيوف، والأرض تبقى لنا.',
        textEn: "Let him talk. Your grandfather's will is clear: we revive the Majlis and honour our guests, and the land stays ours.",
      },
      {
        id: 'promise',
        bg: 'courtyard',
        cast: [
          { id: 'layla', pos: 'left', expr: 'happy' },
          { id: 'noura', pos: 'right', expr: 'happy' },
        ],
        speaker: 'layla',
        textAr: 'والجناح الجاي… بيكون أحلى!',
        textEn: 'And the next wing… will be even better!',
      },
    ],
  };
}
