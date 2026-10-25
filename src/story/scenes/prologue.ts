import { Scene } from '../types';

/**
 * Opening prologue: Layla comes home to Diriyah, finds her grandfather's Majlis crumbling, faces the developer
 * Rashid (choice: firm or polite) and receives the brass dallah that starts the game.
 * Dialect wording needs native review before launch (same as src/game/voiceLines.ts).
 */
export const PROLOGUE: Scene = {
  id: 'prologue',
  titleAr: 'المقدمة: العودة إلى الدرعية',
  titleEn: 'Prologue: Home to Diriyah',
  beats: [
    {
      id: 'arrive',
      bg: 'street',
      camera: 'pan-down',
      cast: [],
      textAr: 'الدرعية… عند الغروب.',
      textEn: 'Diriyah, at sunset.',
    },
    {
      id: 'layla_home',
      bg: 'street',
      cast: [{ id: 'layla', pos: 'center', expr: 'happy' }],
      speaker: 'layla',
      textAr: 'أخيراً رجعت للدرعية! ريحة الطين والنخل… ما تغيّرت أبد.',
      textEn: "Finally back in Diriyah! The smell of mud-brick and palms… it hasn't changed a bit.",
      voice: 'pro_layla_1',
    },
    {
      id: 'noura_welcome',
      bg: 'street',
      cast: [
        { id: 'layla', pos: 'left', expr: 'happy' },
        { id: 'noura', pos: 'right', expr: 'happy' },
      ],
      speaker: 'noura',
      textAr: 'يا هلا ومرحبا يا ليلى! يا بعد عمري، طوّلتي الغيبة.',
      textEn: "Welcome home, Layla, my dear! You've been away far too long.",
      voice: 'pro_noura_1',
    },
    {
      id: 'noura_worry',
      bg: 'street',
      cast: [
        { id: 'layla', pos: 'left', expr: 'neutral' },
        { id: 'noura', pos: 'right', expr: 'worried' },
      ],
      speaker: 'noura',
      textAr: 'بس يا بنتي… مجلس جدّك ما عاد مثل أول. تعالي شوفي.',
      textEn: "But my girl… your grandfather's Majlis isn't what it was. Come and see.",
    },
    {
      id: 'ruin',
      bg: 'courtyard',
      camera: 'zoom-in',
      cast: [{ id: 'layla', pos: 'center', expr: 'surprised' }],
      speaker: 'layla',
      textAr: 'يا الله! الجدران متشققة… والنافورة ناشفة!',
      textEn: 'Oh no! The walls are cracked… and the fountain is dry!',
    },
    {
      id: 'rashid_offer',
      bg: 'courtyard',
      camera: 'shake',
      cast: [
        { id: 'layla', pos: 'left', expr: 'worried' },
        { id: 'rashid', pos: 'right', expr: 'neutral' },
      ],
      speaker: 'rashid',
      textAr: 'مساء الخير. أنا راشد. هالأرض بتصير مجمّع تجاري… وعرضي سخي.',
      textEn: "Good evening. I'm Rashid. This plot will become a shopping mall… and my offer is generous.",
      voice: 'pro_rashid_1',
    },
    {
      id: 'answer',
      bg: 'courtyard',
      cast: [
        { id: 'layla', pos: 'left', expr: 'neutral' },
        { id: 'rashid', pos: 'right', expr: 'neutral' },
      ],
      speaker: 'layla',
      textAr: 'كيف تردّين على راشد؟',
      textEn: 'How will you answer Rashid?',
      choice: [
        {
          id: 'firm',
          textAr: 'إرث جدّي ما ينباع!',
          textEn: "My grandfather's legacy is not for sale!",
          flag: ['rivalry', 'firm'],
          reward: { gems: 5 },
          next: 'rashid_firm',
        },
        {
          id: 'polite',
          textAr: 'مشكور، بس المجلس مو للبيع.',
          textEn: "Thank you, but the Majlis isn't for sale.",
          flag: ['rivalry', 'polite'],
          reward: { coins: 100 },
          next: 'rashid_polite',
        },
      ],
    },
    {
      id: 'rashid_firm',
      bg: 'courtyard',
      camera: 'shake',
      cast: [
        { id: 'layla', pos: 'left', expr: 'neutral' },
        { id: 'rashid', pos: 'right', expr: 'angry' },
      ],
      speaker: 'rashid',
      textAr: 'هه! نشوف وش يقول المجلس البلدي.',
      textEn: "Ha! We'll see what the council has to say.",
      next: 'will',
    },
    {
      id: 'rashid_polite',
      bg: 'courtyard',
      cast: [
        { id: 'layla', pos: 'left', expr: 'neutral' },
        { id: 'rashid', pos: 'right', expr: 'surprised' },
      ],
      speaker: 'rashid',
      textAr: 'أدب ما توقعته… بس لا تنسين: صبري طويل.',
      textEn: 'Politer than I expected… but remember: I am a patient man.',
    },
    {
      id: 'will',
      bg: 'courtyard',
      cast: [
        { id: 'layla', pos: 'left', expr: 'worried' },
        { id: 'noura', pos: 'right', expr: 'neutral' },
      ],
      speaker: 'noura',
      textAr: 'لا تخافين منه. وصية جدّك واضحة: اللي يحيي المجلس ويكرم الضيوف، تبقى له الأرض.',
      textEn: "Don't fear him. Your grandfather's will is clear: whoever revives the Majlis and honours its guests keeps the land.",
      voice: 'pro_noura_2',
    },
    {
      id: 'dallah',
      bg: 'dallah',
      camera: 'push',
      cast: [],
      speaker: 'noura',
      textAr: 'وهذي دلّة جدّك. أول فنجال… منك يا ليلى.',
      textEn: "And this is your grandfather's dallah. The first cup… is yours to pour, Layla.",
      voice: 'pro_noura_3',
    },
    {
      id: 'promise',
      bg: 'dallah',
      cast: [{ id: 'layla', pos: 'center', expr: 'happy' }],
      speaker: 'layla',
      textAr: 'أوعدك يا جدة… بنرجّع المجلس أحلى من أول!',
      textEn: "I promise, Grandma… we'll bring the Majlis back, better than ever!",
      voice: 'pro_layla_2',
      effect: 'dallah-to-board',
    },
  ],
};
