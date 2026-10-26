import { Scene } from '../types';
import { say, titleCard } from './build';

const BG = 'dallah';

/**
 * Chapter 3, hand-written: Sheikh Tariq tastes the coffee, reveals he was grandfather's friend and that Rashid tried
 * to buy into the land, and backs the Majlis in the Heritage Cup. Layla's choice sets `tariq`.
 * Dialect wording needs native review before launch.
 */
export function chapter3Scene(flags: Record<string, string>): Scene {
  const fusion = flags.menu === 'fusion';
  return {
    id: 'chapter:chap_3',
    titleAr: 'الفصل الثالث: سر الخلطة الملكية',
    titleEn: 'Chapter 3: Secret of the Royal Blend',
    beats: [
      titleCard(BG, 'الفصل الثالث: سر الخلطة الملكية', 'Chapter 3: Secret of the Royal Blend'),
      say('taste', BG, ['layla', 'neutral'], ['tariq', 'surprised'], 'tariq',
        'تذوّقت القهوة في مئات المجالس… بس هالفنجال مع الكليجا رجّعني لأيام الصبا.',
        'I have tasted qahwa in hundreds of majlises… but this finjan with kleija took me back to my youth.',
        { camera: 'zoom-in' }),
      say('who', BG, ['layla', 'surprised'], ['tariq', 'happy'], 'layla',
        'تشرّفنا يا شيخ طارق… بس كأنك تعرف المكان من قبل؟',
        "It's an honour, Sheikh Tariq… but you seem to know this place already?"),
      say('friend', BG, ['layla', 'surprised'], ['tariq', 'happy'], 'tariq',
        'جدّك كان رفيق دربي. حمّصنا البن سوا على هالأرض قبل خمسين سنة.',
        'Your grandfather was my oldest friend. We roasted beans together on this very floor fifty years ago.'),
      say('rashid', BG, ['layla', 'worried'], ['tariq', 'worried'], 'tariq',
        'وراشد جاني يبي يشتري حصة في أرضكم… رفضت. هالمجلس ما يتقاس بالفلوس.',
        "And Rashid came to me wanting to buy a share of your land… I refused. This Majlis can't be measured in money.",
        { camera: 'shake' }),
      say('lama_heard', BG, ['layla', 'happy'], ['tariq', 'happy'], 'tariq',
        fusion
          ? 'وسمعت عن لاتيه الزعفران حقّكم… حتى عيال عيالي يتكلمون عنه!'
          : 'وسمعت أن لمى امتدحت قهوتكم بالهيل… وهذا والله الصح.',
        fusion
          ? "And I've heard about your saffron latte… even my grandchildren talk about it!"
          : "And I heard Lama praised your cardamom qahwa… as she should."),
      {
        id: 'answer',
        bg: BG,
        cast: [
          { id: 'layla', pos: 'left', expr: 'neutral' },
          { id: 'tariq', pos: 'right', expr: 'neutral' },
        ],
        textAr: 'كيف تكرمين الشيخ طارق؟',
        textEn: 'How will you honour Sheikh Tariq?',
        choice: [
          {
            id: 'blend',
            textAr: 'اسأليه عن خلطة جدّك الملكية',
            textEn: "Ask him about Grandpa's royal blend",
            flag: ['tariq', 'blend'],
            reward: { gems: 5 },
            next: 'blend_say',
          },
          {
            id: 'cup',
            textAr: 'صبّي له أول فنجال من الدلة',
            textEn: 'Pour him the first finjan from the dallah',
            flag: ['tariq', 'cup'],
            reward: { energy: 20 },
            next: 'cup_say',
          },
        ],
      },
      say('blend_say', BG, ['layla', 'surprised'], ['tariq', 'neutral'], 'layla',
        'يا شيخ… جدّي كان عنده خلطة يسمّيها "الملكية". تعرف سرّها؟',
        'Sheikh… Grandpa had a blend he called "the Royal". Do you know its secret?'),
      say('blend_tariq', BG, ['layla', 'happy'], ['tariq', 'happy'], 'tariq',
        'هيل، وزعفران، وحبّة قرنفل وحدة بس… والباقي محبّة. هذا سرّه.',
        "Cardamom, saffron and a single clove… the rest is love. That's the secret.",
        { next: 'support' }),
      say('cup_say', BG, ['layla', 'happy'], ['tariq', 'neutral'], 'layla',
        'أول فنجال لك يا شيخ… مثل ما كان جدّي يسوّي مع ضيوفه.',
        'The first cup is yours, Sheikh… just as Grandpa did for his guests.'),
      say('cup_tariq', BG, ['layla', 'happy'], ['tariq', 'happy'], 'tariq',
        'نفس الكرم، ونفس اليد. الله يرحمه… شفته فيك اليوم.',
        'The same generosity, the same hand. God rest him… I saw him in you today.'),
      say('support', BG, ['layla', 'happy'], ['tariq', 'happy'], 'tariq',
        'أعلن دعمي لمجلسكم في كأس التراث! رمّموا النافورة وركن العود قبل ليالي الغبقة.',
        'I am backing your Majlis in the Heritage Cup! Restore the fountain and the oud corner before the ghabga nights.'),
      say('end', BG, ['layla', 'happy'], ['tariq', 'happy'], 'layla',
        'وعد يا شيخ… بنكون جاهزين لرمضان!',
        "I promise, Sheikh… we'll be ready for Ramadan!"),
    ],
  };
}
