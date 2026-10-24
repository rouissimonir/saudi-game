/**
 * Character voice lines. Text is written in Saudi dialect (Najdi, Hijazi, Riyadh youth) for a voice actor or
 * for the device's Arabic text-to-speech. Recorded files at /assets/audio/voice/<id>.mp3 override synthesis.
 * Dialect wording needs native review before launch.
 */

export type VoiceCharacter = 'noura' | 'faisal' | 'tariq' | 'lama' | 'sultan' | 'ghabga';
export type VoiceEvent = 'greet' | 'served' | 'vip';

export interface VoiceLine {
  ar: string;
  en: string;
}

export interface VoiceProfile {
  nameEn: string;
  dialect: string;
  gender: 'female' | 'male';
  /** SpeechSynthesis tuning so one device voice can still sound like different people. */
  pitch: number;
  rate: number;
  direction: string;
}

export const VOICE_PROFILES: Record<VoiceCharacter, VoiceProfile> = {
  noura: { nameEn: 'Grandmother Noura', dialect: 'Najdi', gender: 'female', pitch: 0.92, rate: 0.82, direction: 'Warm, unhurried grandmother; smiling voice, slight huskiness.' },
  faisal: { nameEn: 'Barista Faisal', dialect: 'Hijazi', gender: 'male', pitch: 1.05, rate: 1.0, direction: 'Friendly, upbeat young barista; quick and proud of his craft.' },
  tariq: { nameEn: 'Sheikh Tariq', dialect: 'Najdi', gender: 'male', pitch: 0.8, rate: 0.85, direction: 'Calm, dignified host in his fifties; measured, generous.' },
  lama: { nameEn: 'Creator Lama', dialect: 'Riyadh youth', gender: 'female', pitch: 1.18, rate: 1.08, direction: 'Energetic young content creator; bubbly, casual, a little breathless.' },
  sultan: { nameEn: 'Sultan Al-Diriyah', dialect: 'Najdi (formal)', gender: 'male', pitch: 0.7, rate: 0.8, direction: 'Stately ruler; deep, slow, ceremonial warmth.' },
  ghabga: { nameEn: 'Coffee Festival Jury', dialect: 'Modern Standard Arabic', gender: 'male', pitch: 0.95, rate: 0.95, direction: 'Polished festival announcer; clear and encouraging.' },
};

export const VOICE_LINES: Record<VoiceCharacter, Record<VoiceEvent, VoiceLine[]>> = {
  noura: {
    greet: [
      { ar: 'يا هلا والله بضيوفنا! حيّاكم الله', en: 'A warm welcome to our guests! God keep you.' },
      { ar: 'تفضّلوا تفضّلوا، القهوة جاهزة والهيل طيّب', en: 'Come in, come in, the coffee is ready and the cardamom is fresh.' },
    ],
    served: [
      { ar: 'الله يعطيك العافية يا ولدي، قهوة تسرّ الخاطر', en: 'God give you strength, my child, coffee that gladdens the heart.' },
      { ar: 'ما قصّرت، الله يحفظك ويخلّيك', en: 'You spared nothing. God protect you and keep you.' },
      { ar: 'يا سلام! ريحة الهيل تجنّن', en: 'Oh my! The smell of the cardamom is wonderful.' },
    ],
    vip: [{ ar: 'هلا وغلا بالموكب الكريم! أبشروا بالقهوة', en: 'A hearty welcome to the honoured party! Coffee is on its way.' }],
  },
  faisal: {
    greet: [
      { ar: 'أهلاً وسهلاً! تفضّل، أحلى قهوة مختصة عندي', en: 'Welcome! Come in, the best specialty coffee is right here.' },
      { ar: 'يا مرحبا! جاهز أحضّر لك أحلى كوب', en: 'Hello there! Ready to make you the best cup.' },
    ],
    served: [
      { ar: 'تمام يا غالي! طلبك وصل، بالهنا والشفا', en: 'All done, my friend! Your order is here, enjoy it.' },
      { ar: 'ممتاز! إن شاء الله تعجبك النكهة', en: 'Excellent! I hope you enjoy the flavour.' },
      { ar: 'القهوة تبي لها صبر، وهذي نتيجة الصبر', en: 'Coffee needs patience, and this is the reward for it.' },
    ],
    vip: [{ ar: 'ضيوف كبار اليوم! الليلة نطلع أحلى ما عندنا', en: 'Important guests today! Tonight we bring out our very best.' }],
  },
  tariq: {
    greet: [
      { ar: 'حيّاك الله، مجلسنا مجلسك', en: 'God welcome you, our majlis is your majlis.' },
      { ar: 'أهلاً بالضيف، تفضّل واستأنس', en: 'Welcome, guest. Come in and make yourself at home.' },
    ],
    served: [
      { ar: 'جزاك الله خير، هذا هو الكرم', en: 'May God reward you, this is true generosity.' },
      { ar: 'الله يكثّر من أمثالك، قهوة تستاهل الثناء', en: 'May God increase people like you, coffee worthy of praise.' },
    ],
    vip: [{ ar: 'أكرمتنا يا ابن الحلال، وقهوتك تستاهل الشكر', en: 'You honoured us, noble friend, and your coffee deserves our thanks.' }],
  },
  lama: {
    greet: [
      { ar: 'هاي! أحب هالمكان من أول نظرة', en: "Hi! I love this place at first sight." },
      { ar: 'واو، الديكور خرافي! لازم أصوّره', en: 'Wow, the decor is amazing! I have to film it.' },
    ],
    served: [
      { ar: 'تحفة! بصوّرها وأنزلها ستوري الحين', en: "A masterpiece! I'm filming it for my story right now." },
      { ar: 'هذي أحلى قهوة جرّبتها، والله!', en: "This is the best coffee I've ever tried, honestly!" },
      { ar: 'يا حبيبي، الطعم يجنّن!', en: 'Oh my, the taste is incredible!' },
    ],
    vip: [{ ar: 'ما توقعت! كل هالفخامة عشاننا؟ شكراً من القلب', en: "I didn't expect this! All this luxury for us? Thank you from the heart." }],
  },
  sultan: {
    greet: [
      { ar: 'يا مرحبا بالضيف، الدرعية بيتك', en: 'A great welcome to the guest, Diriyah is your home.' },
      { ar: 'حيّاكم الله في دار الكرم والعزّ', en: 'God welcome you to the house of generosity and pride.' },
    ],
    served: [
      { ar: 'الله يكثّر من أمثالك، هذا هو الكرم النجدي', en: 'May God increase people like you, this is true Najdi generosity.' },
      { ar: 'أحسنت، فنجان يليق بمجالس الدرعية', en: 'Well done, a cup worthy of the majlis of Diriyah.' },
    ],
    vip: [{ ar: 'يا هلا بالركب الكريم، اليوم يومٌ مشهود', en: 'Welcome to the noble convoy, today is a day to remember.' }],
  },
  ghabga: {
    greet: [{ ar: 'لجنة مهرجان القهوة السعودية ترحّب بكم', en: 'The Saudi Coffee Festival jury welcomes you.' }],
    served: [
      { ar: 'تقييم ممتاز! ننتظر إبداعك القادم', en: 'An excellent score! We await your next creation.' },
      { ar: 'ضيافة راقية، تستحق التقدير', en: 'Refined hospitality, worthy of recognition.' },
    ],
    vip: [{ ar: 'لقد أبهرتم اللجنة، مبروك!', en: 'You have impressed the jury, congratulations!' }],
  },
};

export function isVoiceCharacter(id: string): id is VoiceCharacter {
  return id in VOICE_PROFILES;
}

/** Stable id and file name for a line: noura_served_2 -> /assets/audio/voice/noura_served_2.mp3 */
export function voiceLineId(character: VoiceCharacter, event: VoiceEvent, index: number): string {
  return `${character}_${event}_${index + 1}`;
}

export function voiceFileUrl(id: string): string {
  return `/assets/audio/voice/${id}.mp3`;
}

/** Round-robin through a character's lines so repeats are spread out; `counter` is the caller's running count. */
export function pickVoiceLine(
  character: VoiceCharacter,
  event: VoiceEvent,
  counter: number
): { id: string; line: VoiceLine; profile: VoiceProfile } {
  const lines = VOICE_LINES[character][event];
  const index = ((counter % lines.length) + lines.length) % lines.length;
  return { id: voiceLineId(character, event, index), line: lines[index], profile: VOICE_PROFILES[character] };
}

export function allVoiceLines(): { id: string; character: VoiceCharacter; event: VoiceEvent; line: VoiceLine }[] {
  const out: { id: string; character: VoiceCharacter; event: VoiceEvent; line: VoiceLine }[] = [];
  (Object.keys(VOICE_LINES) as VoiceCharacter[]).forEach((character) => {
    (Object.keys(VOICE_LINES[character]) as VoiceEvent[]).forEach((event) => {
      VOICE_LINES[character][event].forEach((line, i) => out.push({ id: voiceLineId(character, event, i), character, event, line }));
    });
  });
  return out;
}

/** Map a story speaker's English name to a voiced character. */
export function speakerCharacter(speakerEn: string): VoiceCharacter | null {
  const name = speakerEn.toLowerCase();
  if (name.includes('noura')) return 'noura';
  if (name.includes('faisal')) return 'faisal';
  if (name.includes('tariq')) return 'tariq';
  if (name.includes('lama')) return 'lama';
  if (name.includes('sultan')) return 'sultan';
  return null;
}
