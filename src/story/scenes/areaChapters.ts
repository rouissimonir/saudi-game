import { Scene } from '../types';
import { ask, say, titleCard } from './build';

/**
 * The area chapters (5–11), hand-written as one journey across the Kingdom. Rashid follows Layla from city to city:
 * whether he drifts towards partnership or rivalry follows how she treated him at the ghabga (`rashid_ch4`), comes
 * to a head in Riyadh (`riyadh`) and is settled in Khobar. Each chapter also remembers earlier choices.
 * Dialect wording needs native review before launch.
 */
type Flags = Record<string, string>;
const ally = (f: Flags) => f.rashid_ch4 === 'welcome';

export function jeddahScene(f: Flags): Scene {
  const bg = 'jeddah';
  return {
    id: 'chapter:area_1',
    titleAr: 'الفصل الخامس: رواشين جدة',
    titleEn: 'Chapter 5: The Rawasheen of Jeddah',
    beats: [
      titleCard(bg, 'الفصل الخامس: رواشين جدة', 'Chapter 5: The Rawasheen of Jeddah'),
      say('home', bg, ['layla', 'happy'], ['faisal', 'happy'], 'faisal',
        'هذي البلد! بيت جدّتي هنا، وروشانه الخشبي ينتظرنا من سنين.',
        "This is Al-Balad! My grandmother's house is here, and its wooden rawshan has been waiting for years.",
        { camera: 'zoom-in' }),
      say('breeze', bg, ['layla', 'surprised'], ['faisal', 'happy'], 'layla',
        'نسيم البحر وريحة الهيل من السوق… جدة غير!',
        'The sea breeze and cardamom drifting from the souq… Jeddah is something else!'),
      say('rashid', bg, ['layla', ally(f) ? 'happy' : 'worried'], ['faisal', ally(f) ? 'surprised' : 'worried'], 'faisal',
        ally(f)
          ? 'وتصدقين؟ راشد كلّم تجار سوق العلوي عنّا… من بعد الغبقة صار يمدحنا!'
          : 'بس انتبهي… راشد فتح كشك قهوة عند مدخل السوق، قبلنا بأسبوع.',
        ally(f)
          ? "And believe it or not, Rashid told the Al-Alawi merchants about us… since the ghabga he can't stop praising us!"
          : 'But watch out… Rashid opened a coffee kiosk at the souq entrance, a week before us.',
        ally(f) ? {} : { camera: 'shake' }),
      ask(bg, ['layla', 'neutral'], ['faisal', 'neutral'], 'من وين نبدأ في جدة؟', 'Where do we start in Jeddah?',
        ['souq', 'ركن قهوة في سوق العلوي', 'A coffee corner in Al-Alawi souq', ['jeddah', 'souq'], { coins: 120 }, 'souq_say'],
        ['rawshan', 'نرمّم روشان بيت جدّة فيصل', "Restore Faisal's family rawshan first", ['jeddah', 'rawshan'], { gems: 6 }, 'rawshan_say']),
      say('souq_say', bg, ['layla', 'happy'], ['faisal', 'happy'], 'layla',
        'جدة تحب الكرم… نصبّ القهوة لكل من يمرّ في السوق!',
        'Jeddah loves generosity… we pour coffee for everyone who walks through the souq!'),
      say('souq_faisal', bg, ['layla', 'happy'], ['faisal', 'happy'], 'faisal',
        f.menu === 'fusion' ? 'وأقدّم لاتيه الزعفران في فنجان حجازي!' : 'وأقدّم قهوة الهيل مع المعمول الحجازي!',
        f.menu === 'fusion' ? "And I'll serve the saffron latte in a Hijazi cup!" : "And I'll serve cardamom qahwa with Hijazi ma'amoul!",
        { next: 'end' }),
      say('rawshan_say', bg, ['layla', 'happy'], ['faisal', 'surprised'], 'layla',
        'البيت قبل السوق. نرجّع روشان جدّتك، ونخلّيه مجلس للعايلة والجيران.',
        "Home before the souq. We restore your grandmother's rawshan and make it a majlis for family and neighbours."),
      say('rawshan_faisal', bg, ['layla', 'happy'], ['faisal', 'happy'], 'faisal',
        'جدّتي بتبكي من الفرحة… شكراً يا ليلى.',
        'My grandmother will cry with joy… thank you, Layla.'),
      say('end', bg, ['layla', 'happy'], ['faisal', 'happy'], 'layla',
        'من الدرعية لجدة… والمجلس يكبر!',
        'From Diriyah to Jeddah… the Majlis keeps growing!'),
    ],
  };
}

export function alulaScene(f: Flags): Scene {
  const bg = 'alula';
  return {
    id: 'chapter:area_2',
    titleAr: 'الفصل السادس: نجوم العلا',
    titleEn: 'Chapter 6: The Stars of AlUla',
    beats: [
      titleCard(bg, 'الفصل السادس: نجوم العلا', 'Chapter 6: The Stars of AlUla'),
      say('stars', bg, ['layla', 'surprised'], ['lama', 'happy'], 'lama',
        'متابعيني يسألون عن قهوة تحت نجوم العلا! شوفي السما… ولا غيمة.',
        'My followers keep asking for coffee under the AlUla stars! Look at that sky… not a single cloud.',
        { camera: 'zoom-in' }),
      say('jeddah', bg, ['layla', 'happy'], ['lama', 'happy'], 'lama',
        f.jeddah === 'rawshan'
          ? 'وقصة روشان جدّة فيصل في جدة؟ أبكت نص الخليج!'
          : 'وركنكم في سوق العلوي؟ صار أشهر محطة في جدة!',
        f.jeddah === 'rawshan'
          ? "And the story of Faisal's family rawshan in Jeddah? It made half the Gulf cry!"
          : 'And your corner in Al-Alawi souq? It became the most famous stop in Jeddah!'),
      say('deck', bg, ['layla', 'happy'], ['lama', 'neutral'], 'layla',
        'نبني منصة رصد عند سفح الجبال… وقهوة الليل على ضوء الفوانيس.',
        'We build a stargazing deck at the foot of the cliffs… night coffee by lantern light.'),
      ask(bg, ['layla', 'neutral'], ['lama', 'neutral'], 'كيف تكون ليلة الافتتاح؟', 'How should opening night go?',
        ['live', 'بث مباشر للمملكة كلها', 'A live stream for the whole Kingdom', ['alula', 'live'], { coins: 120 }, 'live_say'],
        ['quiet', 'ليلة هادية بدون جوالات', 'A quiet night with phones put away', ['alula', 'quiet'], { energy: 25 }, 'quiet_say']),
      say('live_say', bg, ['layla', 'happy'], ['lama', 'happy'], 'lama',
        'جاهزة! خلّي المملكة كلها تشرب معنا تحت النجوم.',
        "I'm ready! Let the whole Kingdom drink with us under the stars."),
      say('live_layla', bg, ['layla', 'happy'], ['lama', 'surprised'], 'layla',
        'وإذا سألوا عن السر… قولي لهم: القهوة أحلى مع الناس.',
        'And if they ask the secret… tell them coffee tastes better shared.',
        { next: 'end' }),
      say('quiet_say', bg, ['layla', 'happy'], ['lama', 'surprised'], 'layla',
        'الليلة بدون جوالات. بس النجوم، والفناجيل، والسوالف.',
        'Tonight, no phones. Just the stars, the cups and the conversation.'),
      say('quiet_lama', bg, ['layla', 'happy'], ['lama', 'happy'], 'lama',
        'أول مرة من سنين أشوف السما بدون شاشة… شكراً.',
        "For the first time in years I'm seeing the sky without a screen… thank you."),
      say('end', bg, ['layla', 'happy'], ['lama', 'happy'], 'layla',
        'العلا علّمتني: أجمل الأشياء ما تحتاج زحمة.',
        "AlUla taught me: the most beautiful things don't need a crowd."),
    ],
  };
}

export function taifScene(f: Flags): Scene {
  const bg = 'taif';
  return {
    id: 'chapter:area_3',
    titleAr: 'الفصل السابع: موسم الورد',
    titleEn: 'Chapter 7: Rose Season',
    beats: [
      titleCard(bg, 'الفصل السابع: موسم الورد', 'Chapter 7: Rose Season'),
      say('memory', bg, ['layla', 'happy'], ['noura', 'happy'], 'noura',
        'كنا نطلع الطايف كل صيف، والبيت كله ريحة ورد.',
        'We went up to Taif every summer, and the whole house smelled of roses.',
        { camera: 'zoom-in' }),
      say('secret', bg, ['layla', 'surprised'], ['noura', 'happy'], 'noura',
        'وهنا… في موسم الورد، جدّك طلب يدي. جاب لي فنجال قهوة بماء الورد.',
        'And here… in rose season, your grandfather asked for my hand. He brought me a cup of coffee with rose water.'),
      say('wow', bg, ['layla', 'surprised'], ['noura', 'neutral'], 'layla',
        'يا جدّة! أول مرة أسمع هالقصة!',
        "Grandma! I've never heard that story!"),
      ask(bg, ['layla', 'neutral'], ['noura', 'neutral'], 'وش نقدّم في موسم الورد؟', 'What do we serve for rose season?',
        ['rose', 'قهوة جدّي بماء الورد', "Grandpa's rose-water qahwa", ['taif', 'rose'], { gems: 6 }, 'rose_say'],
        ['pomegranate', 'مشروب ورد ورمان بارد للصغار', 'A cold rose-and-pomegranate drink for the kids', ['taif', 'pomegranate'], { coins: 120 }, 'pom_say']),
      say('rose_say', bg, ['layla', 'happy'], ['noura', 'happy'], 'layla',
        'نقدّم قهوة جدّي بماء الورد… ونسمّيها "فنجال الخطوبة"!',
        'We serve Grandpa\'s rose-water qahwa… and call it "the Proposal Cup"!'),
      say('rose_noura', bg, ['layla', 'happy'], ['noura', 'happy'], 'noura',
        f.tariq === 'blend'
          ? 'وحطّي حبّة القرنفل من خلطته الملكية… مثل ما سواها بالضبط.'
          : 'الله يرحمه… كان بيضحك لو شاف اسمها.',
        f.tariq === 'blend'
          ? 'And add the clove from his royal blend… exactly the way he made it.'
          : 'God rest him… he would have laughed to see that name.',
        { next: 'end' }),
      say('pom_say', bg, ['layla', 'happy'], ['noura', 'surprised'], 'layla',
        'والصغار؟ نسوي لهم ورد ورمان بارد… عشان يحبون الطايف مثلنا.',
        "And for the kids? A cold rose-and-pomegranate drink… so they love Taif like we do."),
      say('pom_noura', bg, ['layla', 'happy'], ['noura', 'happy'], 'noura',
        'فكرة حلوة! الصغار اليوم… ضيوف المجلس بكرة.',
        "Lovely idea! Today's children… are tomorrow's guests of the Majlis."),
      say('end', bg, ['layla', 'happy'], ['noura', 'happy'], 'layla',
        'موسم الورد صار موسمنا.',
        'Rose season has become our season.'),
    ],
  };
}

export function abhaScene(f: Flags): Scene {
  const bg = 'abha';
  return {
    id: 'chapter:area_4',
    titleAr: 'الفصل الثامن: فوق الغيم',
    titleEn: 'Chapter 8: Above the Clouds',
    beats: [
      titleCard(bg, 'الفصل الثامن: فوق الغيم', 'Chapter 8: Above the Clouds'),
      say('farms', bg, ['layla', 'surprised'], ['tariq', 'happy'], 'tariq',
        'هنا على المدرجات الجنوبية ينبت البن الخولاني… أصل كل فنجال شربناه.',
        'Here on the southern terraces grows Khawlani coffee… the origin of every cup we ever drank.',
        { camera: 'zoom-in' }),
      say('clouds', bg, ['layla', 'happy'], ['tariq', 'neutral'], 'layla',
        'الغيم تحتنا يا شيخ… كأننا في مجلس فوق السما!',
        "The clouds are below us, Sheikh… it's like a majlis above the sky!"),
      say('rashid', bg, ['layla', ally(f) ? 'surprised' : 'worried'], ['tariq', ally(f) ? 'happy' : 'worried'], 'tariq',
        ally(f)
          ? 'وراشد عرض سياراته تنقل المحصول للدرعية… صار يحبكم وهو ما يعترف.'
          : 'لكن راشد يبي يشتري محصول المزارع كله قبلنا… بسعر بخس.',
        ally(f)
          ? "And Rashid offered his trucks to carry the harvest to Diriyah… he's fond of you, though he won't admit it."
          : "But Rashid wants to buy the farms' entire harvest before us… at a low price.",
        ally(f) ? {} : { camera: 'shake' }),
      ask(bg, ['layla', 'neutral'], ['tariq', 'neutral'], 'كيف نساعد مزارعين البن؟', 'How do we help the coffee farmers?',
        ['farmers', 'نشتري منهم مباشرة بسعر عادل', 'Buy straight from them at a fair price', ['abha', 'farmers'], { energy: 25 }, 'farm_say'],
        ['train', 'ندرّب شباب القرية على التحميص', 'Train the village youth to roast', ['abha', 'train'], { gems: 6 }, 'train_say']),
      say('farm_say', bg, ['layla', 'happy'], ['tariq', 'happy'], 'layla',
        'نشتري من المزارع مباشرة، وبالسعر اللي يستاهله تعبهم.',
        'We buy straight from the farms, at the price their work deserves.'),
      say('farm_tariq', bg, ['layla', 'happy'], ['tariq', 'happy'], 'tariq',
        'هذا كلام جدّك بالحرف. التاجر الصادق يكبر مع أهله.',
        'Those are your grandfather\'s words exactly. An honest merchant grows with his people.',
        { next: 'end' }),
      say('train_say', bg, ['layla', 'happy'], ['tariq', 'surprised'], 'layla',
        'وليش ما يحمّصون شباب القرية بنهم بأيديهم؟ نعلّمهم، ويصير لهم مجلسهم.',
        'And why shouldn\'t the village youth roast their own beans? We teach them, and they get a majlis of their own.'),
      say('train_tariq', bg, ['layla', 'happy'], ['tariq', 'happy'], 'tariq',
        'تزرعين المستقبل يا بنتي… مثل ما نزرع البن.',
        'You are planting the future, my girl… just as we plant coffee.'),
      say('end', bg, ['layla', 'happy'], ['tariq', 'happy'], 'layla',
        'من المزرعة للفنجال… وكل حبة لها قصة.',
        'From the farm to the cup… every bean has a story.'),
    ],
  };
}

export function ahsaScene(f: Flags): Scene {
  const bg = 'ahsa';
  return {
    id: 'chapter:area_5',
    titleAr: 'الفصل التاسع: الواحة الكبرى',
    titleEn: 'Chapter 9: The Great Oasis',
    beats: [
      titleCard(bg, 'الفصل التاسع: الواحة الكبرى', 'Chapter 9: The Great Oasis'),
      say('dates', bg, ['layla', 'happy'], ['noura', 'happy'], 'noura',
        'خلاص الأحساء أطيب تمر مع القهوة… هذا اللي كان أبوي يقوله.',
        'Al-Ahsa\'s Khalas dates are the best with coffee… that\'s what my father always said.',
        { camera: 'zoom-in' }),
      say('palms', bg, ['layla', 'surprised'], ['noura', 'happy'], 'layla',
        'ملايين النخل يا جدّة… وعيون ماء في وسط الصحرا!',
        'Millions of palms, Grandma… and springs in the middle of the desert!'),
      say('journey', bg, ['layla', 'happy'], ['noura', 'neutral'], 'noura',
        f.abha === 'farmers'
          ? 'ومزارعين أبها يسلّمون عليك… قالوا: ما أحد عاملنا بعدلك.'
          : 'وشباب أبها حمّصوا أول دفعة بأيديهم… أرسلوها لنا هدية.',
        f.abha === 'farmers'
          ? 'And the Abha farmers send their greetings… they said no one ever treated them so fairly.'
          : 'And the Abha youngsters roasted their first batch themselves… they sent it to us as a gift.'),
      ask(bg, ['layla', 'neutral'], ['noura', 'neutral'], 'وش نسوي في القيصرية؟', 'What do we do in the Qaisariya souq?',
        ['dibs', 'نشارك سر دبس التمر', 'Share the secret of date syrup', ['ahsa', 'dibs'], { gems: 6 }, 'dibs_say'],
        ['tasting', 'مجلس لتذوّق أنواع التمر', 'Host a date-tasting majlis', ['ahsa', 'tasting'], { coins: 120 }, 'tasting_say']),
      say('dibs_say', bg, ['layla', 'happy'], ['noura', 'surprised'], 'layla',
        'سر دبس جدّتك؟ نشاركه مع أهل الأحساء… الأسرار الحلوة تنقال.',
        "Your grandmother's date-syrup secret? We share it with Al-Ahsa… sweet secrets are meant to be told."),
      say('dibs_noura', bg, ['layla', 'happy'], ['noura', 'happy'], 'noura',
        'صدقتي. السر اللي ما ينقال… يموت مع صاحبه.',
        "You're right. A secret never told… dies with its keeper.",
        { next: 'end' }),
      say('tasting_say', bg, ['layla', 'happy'], ['noura', 'happy'], 'layla',
        'نسوي مجلس تذوّق: خلاص ورزيز وشيشي… وكل ضيف يختار تمرته مع قهوته.',
        'A tasting majlis: Khalas, Ruzeiz and Sheshi… every guest picks a date for their coffee.'),
      say('tasting_noura', bg, ['layla', 'happy'], ['noura', 'happy'], 'noura',
        'أبوي كان بيفرح… التمر والقهوة، والناس حولها.',
        'My father would have loved it… dates and coffee, with people all around.'),
      say('end', bg, ['layla', 'happy'], ['noura', 'happy'], 'layla',
        'كل واحة… مجلس ينتظر أحد يفتحه.',
        'Every oasis… is a majlis waiting for someone to open it.'),
    ],
  };
}

export function riyadhScene(f: Flags): Scene {
  const bg = 'riyadh';
  const friendly = ally(f);
  return {
    id: 'chapter:area_6',
    titleAr: 'الفصل العاشر: موسم الرياض',
    titleEn: 'Chapter 10: Riyadh Season',
    beats: [
      titleCard(bg, 'الفصل العاشر: موسم الرياض', 'Chapter 10: Riyadh Season'),
      say('stand', bg, ['layla', 'surprised'], ['faisal', 'happy'], 'faisal',
        'عطونا ركن في البوليفارد! آلاف الزوار كل ليلة!',
        'They gave us a stand on the Boulevard! Thousands of visitors every night!',
        { camera: 'zoom-in' }),
      say('plan', bg, ['layla', 'happy'], ['faisal', 'happy'], 'layla',
        'قهوة جدّتي جنب القهوة المختصة… الرياض كلها بتذوق الدرعية.',
        "Grandma's qahwa next to specialty coffee… all of Riyadh will taste Diriyah."),
      say('rashid', bg, ['layla', friendly ? 'surprised' : 'worried'], ['rashid', friendly ? 'happy' : 'angry'], 'rashid',
        friendly
          ? 'ليلى… من ليلة الغبقة وأنا أفكر. خلّينا نشتغل سوا: كشكي جنبك، وقهوتك هي النجمة.'
          : 'ركني قبال ركنك بالضبط. الليلة الناس بتختار… وبتختارني.',
        friendly
          ? "Layla… I've been thinking since ghabga night. Let's work together: my kiosk next to yours, and your coffee is the star."
          : "My stand is right across from yours. Tonight the people choose… and they'll choose me.",
        { camera: 'shake' }),
      ask(bg, ['layla', 'neutral'], ['rashid', 'neutral'], 'راشد ينتظر ردّك…', 'Rashid is waiting for your answer…',
        ['partner', friendly ? 'نشتغل سوا' : 'اعرضي عليه يشاركك الركن', friendly ? "Let's work together" : 'Offer to share your stand', ['riyadh', 'partner'], { coins: 150 }, 'partner_say'],
        ['own', 'المجلس يبقى لنا… والقهوة تحكم', 'The Majlis stays ours… let the coffee decide', ['riyadh', 'own'], { gems: 8 }, 'own_say']),
      say('partner_say', bg, ['layla', 'happy'], ['rashid', 'surprised'], 'layla',
        'جدّي كان يقول: المجلس يتّسع للكل. تعال، الركن يكفينا.',
        'Grandpa used to say: a majlis has room for everyone. Come, the stand is big enough for us both.'),
      say('partner_rashid', bg, ['layla', 'happy'], ['rashid', 'happy'], 'rashid',
        'ما توقعت هالكرم… أوعدك ما تندمين.',
        "I didn't expect such generosity… I promise you won't regret it.",
        { next: 'end' }),
      say('own_say', bg, ['layla', 'angry'], ['rashid', 'neutral'], 'layla',
        'المجلس يبقى لأهله. وخلّ الناس تذوق وتحكم.',
        'The Majlis stays with its family. Let people taste, and judge.'),
      say('own_rashid', bg, ['layla', 'neutral'], ['rashid', friendly ? 'worried' : 'angry'], 'rashid',
        friendly ? 'فهمت… واحترم قرارك.' : 'طيب. نشوف طابور مين أطول.',
        friendly ? 'I understand… and I respect your decision.' : "Fine. We'll see whose queue is longer."),
      say('end', bg, ['layla', 'happy'], ['faisal', 'happy'], 'faisal',
        'يلا يا ليلى… الطابور وصل لآخر البوليفارد!',
        "Come on, Layla… the queue reaches the end of the Boulevard!"),
    ],
  };
}

export function khobarScene(f: Flags): Scene {
  const bg = 'khobar';
  const partner = f.riyadh === 'partner';
  return {
    id: 'chapter:area_7',
    titleAr: 'الفصل الحادي عشر: لؤلؤة الخليج',
    titleEn: 'Chapter 11: Pearl of the Gulf',
    beats: [
      titleCard(bg, 'الفصل الحادي عشر: لؤلؤة الخليج', 'Chapter 11: Pearl of the Gulf'),
      say('pearls', bg, ['layla', 'surprised'], ['sultan', 'happy'], 'sultan',
        'أجدادنا غاصوا في هالبحر يدوّرون اللؤلؤ… وأنتِ لقيتي لؤلؤة من نوع ثاني.',
        'Our ancestors dived these waters searching for pearls… and you found a pearl of another kind.',
        { camera: 'zoom-in' }),
      say('honour', bg, ['layla', 'surprised'], ['sultan', 'happy'], 'sultan',
        'من الدرعية لجدة والعلا والطايف وأبها والأحساء والرياض… أحييتي روح المجلس في كل المملكة.',
        'From Diriyah to Jeddah, AlUla, Taif, Abha, Al-Ahsa and Riyadh… you revived the spirit of the Majlis across the Kingdom.'),
      say('rashid', bg, ['layla', 'happy'], ['rashid', partner ? 'happy' : 'worried'], 'rashid',
        partner
          ? 'وأنا… كنت أبي أشتري المجلس. اليوم أنا فخور إني صرت جزء منه.'
          : 'جيت أعترف قدام الكل: وصية جدّك كانت صح. المجلس ما ينباع.',
        partner
          ? 'And I… I wanted to buy the Majlis. Today I am proud to be part of it.'
          : "I came to admit it in front of everyone: your grandfather's will was right. The Majlis is not for sale."),
      say('sultan_award', bg, ['layla', 'happy'], ['sultan', 'neutral'], 'sultan',
        'باسم أهل الخليج، أعلن مجلسكم أول مجالس المملكة. لمن تهدين هالتكريم؟',
        'On behalf of the people of the Gulf, I name yours the first Majlis of the Kingdom. To whom do you dedicate this honour?'),
      ask(bg, ['layla', 'neutral'], ['sultan', 'neutral'], 'لمن تهدين التكريم؟', 'Who is the honour for?',
        ['grandpa', 'لجدّي، صاحب المجلس الأول', 'For Grandpa, who built the first Majlis', ['finale', 'grandpa'], { gems: 10 }, 'grandpa_say'],
        ['team', 'للفريق: جدّتي وفيصل وكل من ساعد', 'For the team: Grandma, Faisal and everyone who helped', ['finale', 'team'], { coins: 200 }, 'team_say']),
      say('grandpa_say', bg, ['layla', 'happy'], ['sultan', 'happy'], 'layla',
        'لجدّي… اللي بنى أول مجلس بإيديه، وعلّمنا إن القهوة تجمع القلوب.',
        'For my grandfather… who built the first Majlis with his own hands, and taught us that coffee brings hearts together.',
        { next: 'end' }),
      say('team_say', bg, ['layla', 'happy'], ['sultan', 'happy'], 'layla',
        'لجدّتي نورة، ولفيصل، وللشيخ طارق ولمى… ولكل من صبّ فنجال معنا.',
        'For Grandma Noura, for Faisal, for Sheikh Tariq and Lama… and for everyone who poured a cup with us.'),
      say('end', bg, ['layla', 'happy'], ['sultan', 'happy'], 'sultan',
        'وهذي بداية الحكاية، مو نهايتها. ارفعوا الفناجيل!',
        'And this is the beginning of the story, not its end. Raise your cups!'),
    ],
  };
}

/** The hand-written area chapters by chapter id (area_1 is Jeddah … area_7 is Khobar). */
export const AREA_SCENES: Record<string, (flags: Flags) => Scene> = {
  area_1: jeddahScene,
  area_2: alulaScene,
  area_3: taifScene,
  area_4: abhaScene,
  area_5: ahsaScene,
  area_6: riyadhScene,
  area_7: khobarScene,
};
