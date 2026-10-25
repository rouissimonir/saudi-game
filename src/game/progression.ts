/**
 * Long-term progression: endless renovation areas, generated orders, the level curve, coin and gem sinks,
 * offline energy and daily quests. Pure functions over GameState; nothing here runs at import time that
 * depends on rules.ts values, so the two modules can import each other safely.
 */
import {
  ChainId,
  CustomerOrder,
  GameState,
  INITIAL_RENOVATION_ZONES,
  ITEM_CATALOG,
  CHAIN_PROGRESSION,
  MajlisRegion,
  RenovationZone,
  StoryChapter,
  STORY_CHAPTERS,
  findNearestEmptyCell,
} from './rules';

// ---------------------------------------------------------------------------
// Random numbers (deterministic, stored in state so saves replay identically)
// ---------------------------------------------------------------------------

export function nextRandom(seed: number): { value: number; seed: number } {
  let t = (seed + 0x6d2b79f5) >>> 0;
  let r = Math.imul(t ^ (t >>> 15), 1 | t);
  r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
  return { value: ((r ^ (r >>> 14)) >>> 0) / 4294967296, seed: t };
}

// ---------------------------------------------------------------------------
// Level curve: each level needs 60 more XP than the last (100, 160, 220, ...)
// ---------------------------------------------------------------------------

export function xpToReachLevel(level: number): number {
  const n = Math.max(0, level - 1);
  return 100 * n + 30 * n * (n - 1);
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xpToReachLevel(level + 1) <= xp) level += 1;
  return level;
}

/** Energy granted per level gained. A top-up, not a full refill, so energy still matters. */
export const LEVEL_UP_ENERGY = 15;
export const LEVEL_UP_GEMS = 5;

// ---------------------------------------------------------------------------
// Energy: one point every ENERGY_REGEN_MS, also while the app is closed
// ---------------------------------------------------------------------------

export const ENERGY_REGEN_MS = 60_000;

export function applyEnergyRegen(state: GameState, now: number): GameState {
  const last = state.lastEnergyTick || now;
  if (state.energy >= state.maxEnergy) {
    // Keep the clock roughly current while full (at most once a minute, so we do not re-save every tick).
    return now - last >= ENERGY_REGEN_MS || !state.lastEnergyTick ? { ...state, lastEnergyTick: now } : state;
  }
  const gained = Math.floor((now - last) / ENERGY_REGEN_MS);
  if (gained <= 0) return state.lastEnergyTick ? state : { ...state, lastEnergyTick: now };
  const energy = Math.min(state.maxEnergy, state.energy + gained);
  return { ...state, energy, lastEnergyTick: energy >= state.maxEnergy ? now : last + gained * ENERGY_REGEN_MS };
}

export function msUntilNextEnergy(state: GameState, now: number): number | null {
  if (state.energy >= state.maxEnergy) return null;
  const last = state.lastEnergyTick || now;
  return Math.max(0, ENERGY_REGEN_MS - ((now - last) % ENERGY_REGEN_MS));
}

export const ENERGY_GEM_PACK = { gems: 20, energy: 50 };
export function buyEnergyWithGems(state: GameState): { state: GameState; bought: boolean } {
  if (state.diamonds < ENERGY_GEM_PACK.gems) return { state, bought: false };
  return {
    state: { ...state, diamonds: state.diamonds - ENERGY_GEM_PACK.gems, energy: state.energy + ENERGY_GEM_PACK.energy },
    bought: true,
  };
}

/** A late-game coin sink: coins buy a little energy, and each purchase on the same day costs more. */
export const ENERGY_COIN_PACK = { coins: 400, energy: 30, stepPerPurchase: 300 };

export function coinEnergyPrice(state: GameState, dayKey: string): number {
  const bought = state.coinEnergyToday?.dayKey === dayKey ? state.coinEnergyToday.count : 0;
  return ENERGY_COIN_PACK.coins + ENERGY_COIN_PACK.stepPerPurchase * bought;
}

export function buyEnergyWithCoins(state: GameState, dayKey: string): { state: GameState; bought: boolean } {
  const price = coinEnergyPrice(state, dayKey);
  if (state.coins < price) return { state, bought: false };
  const count = state.coinEnergyToday?.dayKey === dayKey ? state.coinEnergyToday.count : 0;
  return {
    state: {
      ...state,
      coins: state.coins - price,
      energy: state.energy + ENERGY_COIN_PACK.energy,
      coinEnergyToday: { dayKey, count: count + 1 },
    },
    bought: true,
  };
}

// ---------------------------------------------------------------------------
// Coin sinks: generator upgrades and clearing sand tiles
// ---------------------------------------------------------------------------

export const GENERATOR_MAX_LEVEL = 5;
const GENERATOR_UPGRADE_COST = [0, 250, 600, 1400, 3200];

export function generatorUpgradeCost(level: number): number | null {
  return level >= GENERATOR_MAX_LEVEL ? null : GENERATOR_UPGRADE_COST[level];
}

/** Chance that a tap spawns one tier higher than normal. */
export function generatorLuckyChance(state: GameState, chain: ChainId): number {
  const level = state.generatorLevels?.[chain] ?? 1;
  return (state.vipPassActive ? 0.35 : 0.18) + 0.07 * (level - 1);
}

export function upgradeGenerator(state: GameState, chain: ChainId): { state: GameState; upgraded: boolean } {
  const level = state.generatorLevels?.[chain] ?? 1;
  const cost = generatorUpgradeCost(level);
  if (cost === null || state.coins < cost) return { state, upgraded: false };
  return {
    state: { ...state, coins: state.coins - cost, generatorLevels: { ...state.generatorLevels, [chain]: level + 1 } },
    upgraded: true,
  };
}

export function sandClearCost(state: GameState): number {
  return 40 * ((state.sandTilesBought ?? 0) + 1);
}

export function buySandTile(state: GameState, cellIndex: number): { state: GameState; bought: boolean } {
  const cell = state.board[cellIndex];
  const cost = sandClearCost(state);
  if (!cell || !cell.sandLocked || state.coins < cost) return { state, bought: false };
  return {
    state: {
      ...state,
      coins: state.coins - cost,
      sandTilesBought: (state.sandTilesBought ?? 0) + 1,
      board: state.board.map((c, i) => (i === cellIndex ? { ...c, sandLocked: false } : c)),
    },
    bought: true,
  };
}

export function styleChangeCost(state: GameState): number {
  return 50 * ((state.areaIndex ?? 0) + 1);
}

// ---------------------------------------------------------------------------
// Areas: an endless tour of Saudi Arabia, four wings each
// ---------------------------------------------------------------------------

interface WingDef {
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
}

interface AreaDef {
  id: string;
  region: MajlisRegion;
  nameAr: string;
  nameEn: string;
  styles: { nameAr: string; nameEn: string; swatch: string }[];
  wings: WingDef[];
  chapter: Omit<StoryChapter, 'id' | 'chapterNumber' | 'rewardDiamonds' | 'rewardEnergy'>;
}

const AREAS: AreaDef[] = [
  {
    id: 'diriyah',
    region: 'diriyah',
    nameAr: 'الدرعية التاريخية',
    nameEn: 'Historic Diriyah',
    styles: [],
    wings: [],
    chapter: STORY_CHAPTERS_PLACEHOLDER(),
  },
  {
    id: 'jeddah',
    region: 'jeddah',
    nameAr: 'جدة التاريخية (البلد)',
    nameEn: 'Jeddah Al-Balad',
    styles: [
      { nameAr: 'خشب التك الحجازي', nameEn: 'Hijazi Teak', swatch: '#8B5A2B' },
      { nameAr: 'أخضر الرواشين', nameEn: 'Rawasheen Green', swatch: '#2F6B4F' },
      { nameAr: 'أزرق البحر الأحمر', nameEn: 'Red Sea Blue', swatch: '#1F6F8B' },
    ],
    wings: [
      { nameAr: 'روشان بيت نصيف', nameEn: 'Naseef House Rawshan', descAr: 'شرفة خشبية منقوشة تطل على الأزقة القديمة.', descEn: 'A carved wooden balcony over the old lanes.' },
      { nameAr: 'فناء الحجر المنقبي', nameEn: 'Coral-Stone Courtyard', descAr: 'فناء من حجر البحر يبرد القهوة ويجمع الجيران.', descEn: 'A sea-stone courtyard that keeps the coffee cool.' },
      { nameAr: 'ركن سوق العلوي', nameEn: 'Al-Alawi Souq Corner', descAr: 'بسطة البهارات والهيل وسط أشهر أسواق البلد.', descEn: 'A spice and cardamom stall in the busiest souq.' },
      { nameAr: 'سطح نسيم البحر', nameEn: 'Sea-Breeze Rooftop', descAr: 'جلسة سطح مفتوحة على نسيم البحر الأحمر.', descEn: 'An open rooftop majlis in the Red Sea breeze.' },
    ],
    chapter: {
      titleAr: 'الفصل الخامس: رواشين جدة',
      titleEn: 'Chapter 5: The Rawasheen of Jeddah',
      speakerAr: 'فيصل الباريستا',
      speakerEn: 'Barista Faisal',
      roleAr: 'خبير القهوة المختصة',
      roleEn: 'Specialty Coffee Master',
      dialogueAr: ['جدتي من البلد! بيتها القديم بروشانه الخشبي ينتظرنا.', 'نرمّم الروشان ونفتح ركن قهوة في سوق العلوي، وأهل جدة يحبون الكرم.'],
      dialogueEn: ["My grandmother is from Al-Balad! Her old house with its wooden rawshan is waiting.", "Let's restore the rawshan and open a coffee corner in Al-Alawi souq; Jeddah loves generosity."],
    },
  },
  {
    id: 'alula',
    region: 'alula',
    nameAr: 'واحة العلا',
    nameEn: 'AlUla Oasis',
    styles: [
      { nameAr: 'حجر رملي وردي', nameEn: 'Rose Sandstone', swatch: '#C8664F' },
      { nameAr: 'ظل النخيل', nameEn: 'Palm Shade', swatch: '#5E7D3A' },
      { nameAr: 'ليل الصحراء', nameEn: 'Desert Night', swatch: '#2B2D5C' },
    ],
    wings: [
      { nameAr: 'مصطبة الحجر الرملي', nameEn: 'Sandstone Terrace', descAr: 'مصطبة عند سفح الجبال الوردية.', descEn: 'A terrace at the foot of the rose-red cliffs.' },
      { nameAr: 'مجلس بستان النخيل', nameEn: 'Palm Grove Majlis', descAr: 'جلسة بين النخيل والعيون الجارية.', descEn: 'A majlis among palms and flowing springs.' },
      { nameAr: 'منصة رصد النجوم', nameEn: 'Stargazing Deck', descAr: 'قهوة الليل تحت سماء العلا الصافية.', descEn: 'Night coffee under the clear AlUla sky.' },
      { nameAr: 'درب البلدة القديمة', nameEn: 'Old Town Lantern Lane', descAr: 'فوانيس تضيء طريق البلدة الطينية.', descEn: 'Lanterns lighting the mud-brick old town.' },
    ],
    chapter: {
      titleAr: 'الفصل السادس: نجوم العلا',
      titleEn: 'Chapter 6: The Stars of AlUla',
      speakerAr: 'لمى',
      speakerEn: 'Creator Lama',
      roleAr: 'صانعة محتوى',
      roleEn: 'Lifestyle Creator',
      dialogueAr: ['متابعيني يسألون عن قهوة تحت نجوم العلا!', 'لو جهزنا منصة رصد النجوم، بنصير حديث المملكة كلها.'],
      dialogueEn: ['My followers keep asking for coffee under the AlUla stars!', 'If we build a stargazing deck, the whole Kingdom will be talking about us.'],
    },
  },
  {
    id: 'taif',
    region: 'diriyah',
    nameAr: 'حدائق ورد الطائف',
    nameEn: 'Taif Rose Gardens',
    styles: [
      { nameAr: 'وردي طائفي', nameEn: 'Taif Rose', swatch: '#D45D79' },
      { nameAr: 'رمان الهدا', nameEn: 'Al-Hada Pomegranate', swatch: '#9E2A2B' },
      { nameAr: 'غيم الشفا', nameEn: 'Al-Shafa Mist', swatch: '#8FA9B8' },
    ],
    wings: [
      { nameAr: 'معمل تقطير الورد', nameEn: 'Rose Distillery', descAr: 'قدور النحاس تقطّر ماء الورد الطائفي.', descEn: 'Copper stills distilling Taif rose water.' },
      { nameAr: 'مجلس نسمات الهدا', nameEn: 'Al-Hada Breeze Majlis', descAr: 'جلسة جبلية باردة في قمم الهدا.', descEn: 'A cool mountain majlis on the Al-Hada peaks.' },
      { nameAr: 'مصطبة الرمان', nameEn: 'Pomegranate Terrace', descAr: 'مدرجات الرمان والعنب الطائفي.', descEn: 'Terraces of Taif pomegranates and grapes.' },
      { nameAr: 'سوق الورد', nameEn: 'Rose Market', descAr: 'بسطات الورد والعطور في موسمها.', descEn: 'Rose and perfume stalls in full season.' },
    ],
    chapter: {
      titleAr: 'الفصل السابع: موسم الورد',
      titleEn: 'Chapter 7: Rose Season',
      speakerAr: 'الجدة نورة',
      speakerEn: 'Grandmother Noura',
      roleAr: 'حارسة إرث العائلة',
      roleEn: 'Matriarch & Heritage Keeper',
      dialogueAr: ['كنا نطلع للطائف كل صيف، وريحة الورد تملأ البيت.', 'جهزوا قهوة بماء الورد، والضيوف بيجون من كل مكان.'],
      dialogueEn: ['We went up to Taif every summer, and the house smelled of roses.', 'Make coffee with rose water, and guests will come from everywhere.'],
    },
  },
  {
    id: 'abha',
    region: 'jeddah',
    nameAr: 'أبها وجبال السروات',
    nameEn: 'Abha & the Sarawat Mountains',
    styles: [
      { nameAr: 'ألوان القط العسيري', nameEn: 'Al-Qatt Colours', swatch: '#E0A33A' },
      { nameAr: 'حجر السروات', nameEn: 'Sarawat Stone', swatch: '#7A6A58' },
      { nameAr: 'خضرة الضباب', nameEn: 'Misty Green', swatch: '#4E8A6B' },
    ],
    wings: [
      { nameAr: 'جدار القط العسيري', nameEn: 'Al-Qatt Painted Wall', descAr: 'جدار ملوّن بفن القط العسيري.', descEn: 'A wall painted in the Asiri Al-Qatt art.' },
      { nameAr: 'حصن الحجر', nameEn: 'Stone Tower Café', descAr: 'برج حجري قديم صار مقهى جبلياً.', descEn: 'An old stone tower turned mountain café.' },
      { nameAr: 'شرفة السحاب', nameEn: 'Cloud Terrace', descAr: 'جلسة فوق الغيم في قمم السودة.', descEn: 'A terrace above the clouds of Al-Soudah.' },
      { nameAr: 'مدرجات البن', nameEn: 'Coffee Bean Terraces', descAr: 'مدرجات البن الخولاني على سفوح الجبال.', descEn: 'Khawlani coffee terraces on the slopes.' },
    ],
    chapter: {
      titleAr: 'الفصل الثامن: فوق الغيم',
      titleEn: 'Chapter 8: Above the Clouds',
      speakerAr: 'الشيخ طارق',
      speakerEn: 'Sheikh Tariq',
      roleAr: 'كبير المجلس',
      roleEn: 'Head of the Majlis',
      dialogueAr: ['البن الخولاني ينبت هنا على سفوح الجنوب.', 'نرمم الحصن ونقدم القهوة من مزرعتها مباشرة.'],
      dialogueEn: ['Khawlani coffee grows here on the southern slopes.', "Let's restore the tower and serve coffee straight from the farm."],
    },
  },
  {
    id: 'ahsa',
    region: 'alula',
    nameAr: 'واحة الأحساء',
    nameEn: 'Al-Ahsa Oasis',
    styles: [
      { nameAr: 'ذهب التمر', nameEn: 'Date Gold', swatch: '#B7791F' },
      { nameAr: 'طين القيصرية', nameEn: 'Qaisariya Clay', swatch: '#A0694B' },
      { nameAr: 'ماء العيون', nameEn: 'Spring Water', swatch: '#3C8DAD' },
    ],
    wings: [
      { nameAr: 'عين الواحة', nameEn: 'Oasis Spring', descAr: 'جلسة عند عين ماء تحيط بها النخيل.', descEn: 'A majlis beside a palm-ringed spring.' },
      { nameAr: 'سوق القيصرية', nameEn: 'Qaisariya Souq', descAr: 'أقدم أسواق الأحساء وممراته المقببة.', descEn: "Al-Ahsa's oldest souq and its vaulted lanes." },
      { nameAr: 'بيت الدبس', nameEn: 'Date Syrup House', descAr: 'معصرة دبس التمر الخلاص.', descEn: 'A press for Khalas date syrup.' },
      { nameAr: 'كهوف جبل القارة', nameEn: 'Al-Qarah Caves', descAr: 'قهوة باردة في كهوف جبل القارة.', descEn: 'Cool coffee inside the Al-Qarah caves.' },
    ],
    chapter: {
      titleAr: 'الفصل التاسع: أكبر واحة',
      titleEn: 'Chapter 9: The Great Oasis',
      speakerAr: 'الجدة نورة',
      speakerEn: 'Grandmother Noura',
      roleAr: 'حارسة إرث العائلة',
      roleEn: 'Matriarch & Heritage Keeper',
      dialogueAr: ['تمر الخلاص من الأحساء أطيب تمر مع القهوة.', 'نفتح ركناً في القيصرية ونعلّم الناس سر الدبس.'],
      dialogueEn: ['Khalas dates from Al-Ahsa are the best with coffee.', "Let's open a corner in Qaisariya and share the secret of date syrup."],
    },
  },
  {
    id: 'riyadh',
    region: 'diriyah',
    nameAr: 'بوليفارد الرياض',
    nameEn: 'Riyadh Boulevard',
    styles: [
      { nameAr: 'نيون الموسم', nameEn: 'Season Neon', swatch: '#7C3AED' },
      { nameAr: 'خرسانة حديثة', nameEn: 'Modern Concrete', swatch: '#6B7280' },
      { nameAr: 'ذهب الرياض', nameEn: 'Riyadh Gold', swatch: '#D4A017' },
    ],
    wings: [
      { nameAr: 'محمصة البوليفارد', nameEn: 'Boulevard Roastery', descAr: 'محمصة مختصة وسط موسم الرياض.', descEn: 'A specialty roastery in the heart of Riyadh Season.' },
      { nameAr: 'جلسة السطح', nameEn: 'Rooftop Lounge', descAr: 'إطلالة على أضواء المدينة.', descEn: 'A view over the city lights.' },
      { nameAr: 'جدار الفن', nameEn: 'Art Wall', descAr: 'جدارية لفنانين سعوديين شباب.', descEn: 'A mural by young Saudi artists.' },
      { nameAr: 'مسرح المهرجان', nameEn: 'Festival Stage', descAr: 'منصة عروض القهوة الحية.', descEn: 'A stage for live coffee shows.' },
    ],
    chapter: {
      titleAr: 'الفصل العاشر: موسم الرياض',
      titleEn: 'Chapter 10: Riyadh Season',
      speakerAr: 'فيصل الباريستا',
      speakerEn: 'Barista Faisal',
      roleAr: 'خبير القهوة المختصة',
      roleEn: 'Specialty Coffee Master',
      dialogueAr: ['عرضوا علينا ركناً في بوليفارد الرياض!', 'نجمع بين قهوة الجدّات والقهوة المختصة قدام آلاف الزوار.'],
      dialogueEn: ['They offered us a stand at Riyadh Boulevard!', "We'll pair grandma's qahwa with specialty coffee for thousands of visitors."],
    },
  },
  {
    id: 'khobar',
    region: 'jeddah',
    nameAr: 'كورنيش الخبر',
    nameEn: 'Al-Khobar Corniche',
    styles: [
      { nameAr: 'لؤلؤ الخليج', nameEn: 'Gulf Pearl', swatch: '#E8E1D5' },
      { nameAr: 'أزرق الخليج', nameEn: 'Gulf Blue', swatch: '#1E5F8C' },
      { nameAr: 'خشب السفن', nameEn: 'Dhow Timber', swatch: '#7B4B2A' },
    ],
    wings: [
      { nameAr: 'كشك الكورنيش', nameEn: 'Corniche Kiosk', descAr: 'كشك قهوة على شاطئ الخليج.', descEn: 'A coffee kiosk on the Gulf shore.' },
      { nameAr: 'مجلس الغواصين', nameEn: "Pearl Divers' Majlis", descAr: 'تكريم لتراث الغوص على اللؤلؤ.', descEn: 'A tribute to pearl-diving heritage.' },
      { nameAr: 'سطح السفينة', nameEn: 'Dhow Deck', descAr: 'جلسة على سفينة خشبية تقليدية.', descEn: 'A majlis aboard a traditional dhow.' },
      { nameAr: 'مقهى المنارة', nameEn: 'Lighthouse Café', descAr: 'قهوة الغروب عند المنارة.', descEn: 'Sunset coffee by the lighthouse.' },
    ],
    chapter: {
      titleAr: 'الفصل الحادي عشر: لؤلؤ الخليج',
      titleEn: 'Chapter 11: Pearl of the Gulf',
      speakerAr: 'السلطان',
      speakerEn: 'Sultan Al-Diriyah',
      roleAr: 'ضيف الشرف',
      roleEn: 'Guest of Honour',
      dialogueAr: ['أجدادنا غاصوا في هذا البحر بحثاً عن اللؤلؤ.', 'اجعلوا مجلس الغواصين يحكي قصتهم مع كل فنجال.'],
      dialogueEn: ['Our ancestors dived these waters for pearls.', "Let the divers' majlis tell their story with every cup."],
    },
  },
];

// Area 0 reuses the original Diriyah wings and chapters; its "chapter" entry is never shown.
function STORY_CHAPTERS_PLACEHOLDER(): AreaDef['chapter'] {
  return { titleAr: '', titleEn: '', speakerAr: '', speakerEn: '', roleAr: '', roleEn: '', dialogueAr: [], dialogueEn: [] };
}

export const AREA_COUNT_BEFORE_PRESTIGE = AREAS.length;

export function areaInfo(areaIndex: number): { nameAr: string; nameEn: string; region: MajlisRegion; lap: number } {
  const def = AREAS[areaIndex % AREAS.length];
  const lap = Math.floor(areaIndex / AREAS.length);
  const suffix = lap > 0 ? ` ✦${lap + 1}` : '';
  return { nameAr: def.nameAr + suffix, nameEn: def.nameEn + suffix, region: def.region, lap };
}

/** The renovation wings for an area. Costs rise with every area so later areas take longer. */
export function buildAreaZones(areaIndex: number): RenovationZone[] {
  if (areaIndex === 0) return INITIAL_RENOVATION_ZONES.map((z) => ({ ...z, styles: [...z.styles] }));
  const def = AREAS[areaIndex % AREAS.length];
  const source = def.wings.length ? def : AREAS[1 + (areaIndex % (AREAS.length - 1))];
  return source.wings.map((w, i) => ({
    id: `area${areaIndex}_wing${i}`,
    nameAr: w.nameAr,
    nameEn: w.nameEn,
    descAr: w.descAr,
    descEn: w.descEn,
    unlockedLevel: 0,
    selectedStyle: 0,
    starCostLevel1: 4 + 2 * areaIndex + 2 * i,
    starCostLevel2: 6 + 3 * areaIndex + 3 * i,
    coinBonusPerOrder: 5 + 5 * i + 3 * areaIndex,
    storyChapterIndex: -1,
    styles: source.styles.map((s) => ({ ...s })),
  }));
}

export function areaChapterId(areaIndex: number): string {
  return `area_${areaIndex}`;
}

/** Story lookup covering both the original Diriyah chapters and the per-area chapters. */
export function findStoryChapter(id: string | null): StoryChapter | null {
  if (!id) return null;
  const fixed = STORY_CHAPTERS.find((c) => c.id === id);
  if (fixed) return fixed;
  const m = /^area_(\d+)$/.exec(id);
  if (!m) return null;
  const areaIndex = Number(m[1]);
  const def = AREAS[areaIndex % AREAS.length];
  if (!def.chapter.titleEn) return null;
  const lap = Math.floor(areaIndex / AREAS.length);
  return {
    id,
    chapterNumber: STORY_CHAPTERS.length + areaIndex,
    ...def.chapter,
    titleAr: lap ? `${def.chapter.titleAr} ✦${lap + 1}` : def.chapter.titleAr,
    titleEn: lap ? `${def.chapter.titleEn} ✦${lap + 1}` : def.chapter.titleEn,
    rewardDiamonds: 30 + 5 * areaIndex,
    rewardEnergy: 40,
  };
}

export function isAreaComplete(state: GameState): boolean {
  return state.renovationZones.length > 0 && state.renovationZones.every((z) => z.unlockedLevel >= 2);
}

/** Move to the next area once every wing is fully restored. Stars carry over. */
export const AREA_REWARD = { gems: 25, energy: 40 };

export function advanceArea(state: GameState): { state: GameState; advanced: boolean } {
  if (!isAreaComplete(state)) return { state, advanced: false };
  const next = (state.areaIndex ?? 0) + 1;
  const info = areaInfo(next);
  return {
    state: {
      ...state,
      areaIndex: next,
      renovationZones: buildAreaZones(next),
      activeRegion: info.region,
      activeStoryId: findStoryChapter(areaChapterId(next)) ? areaChapterId(next) : state.activeStoryId,
      diamonds: state.diamonds + AREA_REWARD.gems,
      energy: state.energy + AREA_REWARD.energy,
    },
    advanced: true,
  };
}

/** 0 at the start of the game, +1 per completed area, plus the fraction of wing levels done in the current one. */
export function progressScore(state: GameState): number {
  const zones = state.renovationZones;
  const done = zones.reduce((a, z) => a + z.unlockedLevel, 0);
  return (state.areaIndex ?? 0) + (zones.length ? done / (zones.length * 2) : 0);
}

// ---------------------------------------------------------------------------
// Generated orders
// ---------------------------------------------------------------------------

const CUSTOMERS: Record<string, { nameAr: string; nameEn: string; roleAr: string; roleEn: string; lines: [string, string][] }> = {
  noura: {
    nameAr: 'الجدة نورة', nameEn: 'Grandmother Noura', roleAr: 'ضيافة المجلس', roleEn: 'Majlis Hostess',
    lines: [['يا بنيتي، جهزوا لنا {items} لضيوف العصر.', 'Dear, please prepare {items} for our afternoon guests.'], ['الضيوف وصلوا! نبي {items} الحين.', 'Guests are here! We need {items} now.']],
  },
  faisal: {
    nameAr: 'فيصل الباريستا', nameEn: 'Barista Faisal', roleAr: 'القهوة المختصة', roleEn: 'Specialty Bar',
    lines: [['عندي زبون يطلب {items}، تقدرون تجهزونه؟', 'A regular is asking for {items}, can you make it?'], ['الطابور طويل! أحتاج {items} بسرعة.', 'The queue is long! I need {items} fast.']],
  },
  lama: {
    nameAr: 'لمى', nameEn: 'Creator Lama', roleAr: 'صانعة محتوى', roleEn: 'Lifestyle Creator',
    lines: [['أبي أصوّر {items} لمتابعيني!', 'I want to film {items} for my followers!'], ['وش رأيكم نجرب {items}؟', 'How about we try {items}?']],
  },
  tariq: {
    nameAr: 'الشيخ طارق', nameEn: 'Sheikh Tariq', roleAr: 'كبير المجلس', roleEn: 'Head of the Majlis',
    lines: [['أكرمونا بـ{items} لمجلس الليلة.', "Honour tonight's majlis with {items}."], ['ضيوفي من كبار القوم، جهزوا {items}.', 'My guests are dignitaries; prepare {items}.']],
  },
  sultan: {
    nameAr: 'السلطان', nameEn: 'Sultan Al-Diriyah', roleAr: 'موكب ملكي VIP', roleEn: 'Royal VIP Convoy',
    lines: [['الدرعية تستقبل وفداً كريماً، جهزوا {items}.', 'Diriyah welcomes noble guests; prepare {items}.']],
  },
  ghabga: {
    nameAr: 'لجنة مهرجان القهوة', nameEn: 'Coffee Festival Jury', roleAr: 'لجنة التحكيم', roleEn: 'Festival Jury',
    lines: [['اللجنة تنتظر تذوق {items}.', 'The jury awaits a tasting of {items}.']],
  },
};

const CHAIN_CUSTOMERS: Record<ChainId, string[]> = {
  qahwa: ['noura', 'tariq'],
  barista: ['faisal', 'lama'],
  sweets: ['noura', 'lama'],
  oud: ['tariq', 'noura'],
  chest: ['noura'],
};
const VIP_CUSTOMERS = ['tariq', 'sultan', 'ghabga'];
/** Energy-value units per star: an order worth 2^level per item pays value / divisor stars. Tuned with tools/sim/playtest.ts. */
export const STAR_VALUE_DIVISOR = 18;

const ORDER_CHAINS: ChainId[] = ['qahwa', 'barista', 'sweets', 'oud'];

/** Highest and lowest item level orders may ask for at this point of the game. */
export function orderLevelBand(state: GameState): { min: number; max: number } {
  const p = progressScore(state);
  // Item levels climb slowly: Lv.6 requests (32 spawns each) only arrive from the fourth area on.
  const max = Math.min(6, 3 + Math.floor(p * 0.8 + 0.4));
  const min = Math.min(max - 1, 1 + Math.floor(p / 2));
  return { min, max };
}

export function generateOrder(state: GameState): { order: CustomerOrder; seed: number } {
  let seed = state.rngSeed ?? 1;
  const rand = () => {
    const r = nextRandom(seed);
    seed = r.seed;
    return r.value;
  };
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length) % arr.length];
  const { min, max } = orderLevelBand(state);
  const p = progressScore(state);
  const taken = new Set(state.activeOrders.map((o) => o.requiredItemIds.slice().sort().join('|')));

  let ids: string[] = [];
  let isVip = false;
  for (let attempt = 0; attempt < 6; attempt++) {
    isVip = p >= 0.3 && rand() < 0.15;
    const roll = rand();
    const count = p < 0.5 ? (roll < 0.55 ? 1 : 2) : roll < 0.35 ? 1 : roll < 0.85 ? 2 : 3;
    ids = [];
    for (let i = 0; i < count; i++) {
      const chain = pick(ORDER_CHAINS);
      // Bias towards the top of the band: the last item of an order is the "hard" one.
      let lvl = min + Math.floor(rand() * (max - min + 1));
      if (i === count - 1 && rand() < 0.5) lvl = Math.min(max, lvl + 1);
      if (isVip) lvl = Math.min(6, lvl + 1);
      const id = CHAIN_PROGRESSION[chain][lvl - 1];
      if (!ids.includes(id)) ids.push(id);
    }
    if (!taken.has(ids.slice().sort().join('|'))) break;
  }

  const firstChain = ITEM_CATALOG[ids[0]].chain as ChainId;
  const customerId = isVip ? pick(VIP_CUSTOMERS) : pick(CHAIN_CUSTOMERS[firstChain] ?? ['noura']);
  const c = CUSTOMERS[customerId];
  const [lineAr, lineEn] = pick(c.lines);
  const namesAr = ids.map((id) => ITEM_CATALOG[id].nameAr).join(' و');
  const namesEn = ids.map((id) => ITEM_CATALOG[id].nameEn).join(' & ');
  const levels = ids.map((id) => ITEM_CATALOG[id].level);
  const levelSum = levels.reduce((a, b) => a + b, 0);
  const value = levels.reduce((a, l) => a + 2 ** l, 0);
  const area = state.areaIndex ?? 0;

  const order: CustomerOrder = {
    id: `ord_${state.ordersCompleted}_${seed % 100000}`,
    customerId,
    customerNameAr: c.nameAr,
    customerNameEn: c.nameEn,
    customerRoleAr: c.roleAr,
    customerRoleEn: c.roleEn,
    quoteAr: lineAr.replace('{items}', namesAr),
    quoteEn: lineEn.replace('{items}', namesEn),
    requiredItemIds: ids,
    rewardCoins: Math.round(value * 4 + 10 + area * 5) * (isVip ? 2 : 1),
    // Stars follow the energy an order really costs (an Lv.n item needs 2^(n-1) Lv.1 spawns).
    rewardStars: Math.max(1, Math.round(value / STAR_VALUE_DIVISOR)) + (isVip ? 2 : 0),
    rewardXp: levelSum * 10,
    isVip,
  };
  return { order, seed };
}

// ---------------------------------------------------------------------------
// Daily quests
// ---------------------------------------------------------------------------

export type QuestKind = 'merge' | 'spawn' | 'order' | 'renovate';

export interface QuestDef {
  id: string;
  kind: QuestKind;
  target: number;
  reward: { coins: number; gems: number; energy: number };
  titleAr: string;
  titleEn: string;
}

const QUEST_POOL: QuestDef[] = [
  { id: 'merge25', kind: 'merge', target: 25, reward: { coins: 120, gems: 0, energy: 20 }, titleAr: 'ادمج 25 مرة', titleEn: 'Merge 25 times' },
  { id: 'merge60', kind: 'merge', target: 60, reward: { coins: 250, gems: 8, energy: 0 }, titleAr: 'ادمج 60 مرة', titleEn: 'Merge 60 times' },
  { id: 'spawn40', kind: 'spawn', target: 40, reward: { coins: 100, gems: 5, energy: 0 }, titleAr: 'أنتج 40 عنصراً', titleEn: 'Produce 40 items' },
  { id: 'spawn80', kind: 'spawn', target: 80, reward: { coins: 0, gems: 10, energy: 30 }, titleAr: 'أنتج 80 عنصراً', titleEn: 'Produce 80 items' },
  { id: 'order4', kind: 'order', target: 4, reward: { coins: 150, gems: 0, energy: 25 }, titleAr: 'قدّم 4 طلبات', titleEn: 'Serve 4 orders' },
  { id: 'order8', kind: 'order', target: 8, reward: { coins: 300, gems: 10, energy: 0 }, titleAr: 'قدّم 8 طلبات', titleEn: 'Serve 8 orders' },
  { id: 'renovate1', kind: 'renovate', target: 1, reward: { coins: 200, gems: 5, energy: 0 }, titleAr: 'رمّم جناحاً', titleEn: 'Renovate a wing' },
];

export const QUEST_BONUS = { gems: 25, energy: 40 };

function counters(state: GameState): Record<QuestKind, number> {
  return {
    merge: state.totalMerges,
    spawn: state.totalSpawns ?? 0,
    order: state.ordersCompleted,
    renovate: state.wingUpgrades ?? 0,
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Three quests per calendar day, one of each of three different kinds, picked from the day's key. */
export function questsForDay(dayKey: string): QuestDef[] {
  let seed = hashString(dayKey);
  const out: QuestDef[] = [];
  const pool = QUEST_POOL.slice();
  while (out.length < 3 && pool.length) {
    const r = nextRandom(seed);
    seed = r.seed;
    const q = pool.splice(Math.floor(r.value * pool.length), 1)[0];
    if (!out.some((o) => o.kind === q.kind)) out.push(q);
  }
  return out;
}

/** Start a new set of quests when the day changes; progress counts from the moment they start. */
export function ensureDailyQuests(state: GameState, dayKey: string): GameState {
  if (state.dailyQuests && state.dailyQuests.dayKey === dayKey) return state;
  return { ...state, dailyQuests: { dayKey, baseline: counters(state), claimed: [], bonusClaimed: false } };
}

export function questProgress(state: GameState): { quest: QuestDef; progress: number; done: boolean; claimed: boolean }[] {
  const dq = state.dailyQuests;
  if (!dq) return [];
  const now = counters(state);
  return questsForDay(dq.dayKey).map((quest) => {
    const progress = Math.min(quest.target, now[quest.kind] - (dq.baseline[quest.kind] ?? 0));
    return { quest, progress, done: progress >= quest.target, claimed: dq.claimed.includes(quest.id) };
  });
}

export function claimQuest(state: GameState, questId: string): { state: GameState; claimed: boolean } {
  const row = questProgress(state).find((r) => r.quest.id === questId);
  if (!row || !row.done || row.claimed || !state.dailyQuests) return { state, claimed: false };
  const r = row.quest.reward;
  return {
    state: {
      ...state,
      coins: state.coins + r.coins,
      diamonds: state.diamonds + r.gems,
      energy: state.energy + r.energy,
      dailyQuests: { ...state.dailyQuests, claimed: [...state.dailyQuests.claimed, questId] },
    },
    claimed: true,
  };
}

export function claimQuestBonus(state: GameState): { state: GameState; claimed: boolean } {
  const rows = questProgress(state);
  if (!state.dailyQuests || state.dailyQuests.bonusClaimed || rows.length === 0 || !rows.every((r) => r.claimed)) {
    return { state, claimed: false };
  }
  const emptyIdx = findNearestEmptyCell(state.board, 24);
  const board = emptyIdx === null ? state.board : state.board.map((c, i) => (i === emptyIdx ? { ...c, itemId: 'chest_2' } : c));
  return {
    state: {
      ...state,
      board,
      diamonds: state.diamonds + QUEST_BONUS.gems,
      energy: state.energy + QUEST_BONUS.energy,
      dailyQuests: { ...state.dailyQuests, bonusClaimed: true },
    },
    claimed: true,
  };
}
