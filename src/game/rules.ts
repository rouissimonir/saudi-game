import {
  advanceArea as _advanceArea,
  generateOrder,
  generatorLuckyChance,
  levelFromXp,
  LEVEL_UP_ENERGY,
  LEVEL_UP_GEMS,
  styleChangeCost,
} from './progression';

export type Language = 'ar' | 'en';

export type ChainId = 'qahwa' | 'barista' | 'sweets' | 'oud' | 'chest';
export type ChainCategory = ChainId;

export type MajlisRegion = 'diriyah' | 'jeddah' | 'alula';
export type MajlisAmbiance = 'afternoon' | 'ramadan_night' | 'courtyard_rain';

export interface ItemDefinition {
  id: string;
  chain: ChainId | 'generator';
  level: number;
  maxLevel: number;
  isGenerator?: boolean;
  isChest?: boolean;
  spawnsChain?: ChainId;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  sellValue: number;
  mergeXp: number;
  accentColor: string;
}

export interface BoardCell {
  index: number;
  row: number;
  col: number;
  itemId: string | null;
  sandLocked: boolean;
}

export interface CustomerOrder {
  id: string;
  customerId: string;
  customerNameAr: string;
  customerNameEn: string;
  customerRoleAr: string;
  customerRoleEn: string;
  quoteAr: string;
  quoteEn: string;
  requiredItemIds: string[];
  rewardCoins: number;
  rewardStars: number;
  rewardXp: number;
  isVip?: boolean;
}

export interface RenovationZone {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  unlockedLevel: number; // 0 = ruined/unbuilt, 1 = restored, 2 = luxury upgrade
  selectedStyle: number; // 0, 1, 2
  starCostLevel1: number;
  starCostLevel2: number;
  coinBonusPerOrder: number;
  styles: {
    nameAr: string;
    nameEn: string;
    swatch: string;
  }[];
  storyChapterIndex: number;
}

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  titleAr: string;
  titleEn: string;
  speakerAr: string;
  speakerEn: string;
  roleAr: string;
  roleEn: string;
  dialogueAr: string[];
  dialogueEn: string[];
  rewardDiamonds: number;
  rewardEnergy: number;
}

export interface LiveOpsMilestone {
  id: string;
  pointsRequired: number;
  titleAr: string;
  titleEn: string;
  rewardType: 'energy' | 'coins' | 'diamonds' | 'stars';
  rewardAmount: number;
  claimed: boolean;
}

export interface BonusBubble {
  itemId: string;
  gemCost: number;
}

export interface LeaderboardEntry {
  id: string;
  nameAr: string;
  nameEn: string;
  cityAr: string;
  cityEn: string;
  prestigePoints: number;
  badgeAr: string;
  badgeEn: string;
  styleTagAr?: string;
  styleTagEn?: string;
  votes?: number;
  isPlayer?: boolean;
}

export interface WheelWedge {
  id: string;
  labelAr: string;
  labelEn: string;
  rewardType: 'energy' | 'coins' | 'diamonds' | 'scissors' | 'joker' | 'chest';
  amount: number;
  color: string;
}

export const LUCKY_WHEEL_WEDGES: WheelWedge[] = [
  {
    id: 'w_energy',
    labelAr: '+45 طاقة فورية',
    labelEn: '+45 Instant Energy',
    rewardType: 'energy',
    amount: 45,
    color: '#F59E0B',
  },
  {
    id: 'w_coins',
    labelAr: '+120 ريال ذهبي',
    labelEn: '+120 Gold Riyals',
    rewardType: 'coins',
    amount: 120,
    color: '#10B981',
  },
  {
    id: 'w_joker',
    labelAr: '+1 فنجال الجوكر الذهبي',
    labelEn: '+1 Royal Joker Finjan',
    rewardType: 'joker',
    amount: 1,
    color: '#8B5CF6',
  },
  {
    id: 'w_gems',
    labelAr: '+25 جوهرة ملكية',
    labelEn: '+25 Royal Gems',
    rewardType: 'diamonds',
    amount: 25,
    color: '#0EA5E9',
  },
  {
    id: 'w_scissors',
    labelAr: '+1 المقص الذهبي',
    labelEn: '+1 Golden Scissors',
    rewardType: 'scissors',
    amount: 1,
    color: '#EC4899',
  },
  {
    id: 'w_chest',
    labelAr: 'صندوق ضيافة السدو',
    labelEn: 'Majlis Sadu Chest',
    rewardType: 'chest',
    amount: 1,
    color: '#D97724',
  },
];

export interface GameState {
  board: BoardCell[];
  selectedCellIndex: number | null;
  energy: number;
  maxEnergy: number;
  powerMultiplier: 1 | 2 | 4;
  inventory: string[];
  inventoryCapacity: number;
  bonusBubble: BonusBubble | null;
  prestigePoints: number;
  scissorsCount: number;
  jokerCount: number;
  freeSpinsAvailable: number;
  mazayenVotesRemaining: number;
  votedRivalIds: string[];
  activeRegion: MajlisRegion;
  ambiance: MajlisAmbiance;
  coins: number; // Saudi Riyals / Gold Qirsh
  diamonds: number; // Royal Emeralds / Diamonds
  stars: number; // Renovation Stars
  xp: number;
  level: number;
  comboCount: number;
  lastMergeAt: number;
  ordersCompleted: number;
  totalMerges: number;
  activeOrders: CustomerOrder[];
  renovationZones: RenovationZone[];
  discoveredItemIds: string[];
  completedStoryIds: string[];
  activeStoryId: string | null;
  liveOpsPoints: number;
  liveOpsMilestones: LiveOpsMilestone[];
  vipPassActive: boolean;
  loginStreak: number;
  lastLoginDay: string;
  tutorialDismissed: boolean;
  pourTokens: number;
  /** Which renovation area the player is in (0 = Diriyah). Endless. */
  areaIndex: number;
  rngSeed: number;
  generatorLevels: Record<ChainId, number>;
  totalSpawns: number;
  wingUpgrades: number;
  sandTilesBought: number;
  coinEnergyToday: { dayKey: string; count: number } | null;
  lastEnergyTick: number;
  dailyQuests: {
    dayKey: string;
    baseline: Record<'merge' | 'spawn' | 'order' | 'renovate', number>;
    claimed: string[];
    bonusClaimed: boolean;
  } | null;
  lastMergedItemId: string | null;
}

export const KSA_LEADERBOARD_RIVALS: LeaderboardEntry[] = [
  {
    id: 'riv_1',
    nameAr: 'مجلس العوجا الملكي',
    nameEn: 'Al-Awja Royal Diwan',
    cityAr: 'الدرعية',
    cityEn: 'Diriyah',
    prestigePoints: 620,
    badgeAr: 'أسطورة الضيافة',
    badgeEn: 'Hospitality Legend',
    styleTagAr: 'طراز طين الدرعية والذهب',
    styleTagEn: 'Diriyah Adobe & Gold',
    votes: 148,
  },
  {
    id: 'riv_2',
    nameAr: 'محمصة خطوة جمل',
    nameEn: 'Camel Step Roasters',
    cityAr: 'الرياض',
    cityEn: 'Riyadh',
    prestigePoints: 440,
    badgeAr: 'بطل التحميص',
    badgeEn: 'Roast Master',
    styleTagAr: 'ترافرتين وقهوة مختصة V60',
    styleTagEn: 'Travertine & Specialty V60',
    votes: 112,
  },
  {
    id: 'riv_3',
    nameAr: 'مقهى البلد التاريخي',
    nameEn: 'Al-Balad Heritage Café',
    cityAr: 'جدة',
    cityEn: 'Jeddah',
    prestigePoints: 280,
    badgeAr: 'سيد الرواشين',
    badgeEn: 'Rawasheen Artisan',
    styleTagAr: 'رواشين حجازية وفوانيس نحاس',
    styleTagEn: 'Hijazi Rawasheen & Brass',
    votes: 89,
  },
  {
    id: 'riv_4',
    nameAr: 'ديوانية واحة العلا',
    nameEn: 'AlUla Oasis Lounge',
    cityAr: 'العلا',
    cityEn: 'AlUla',
    prestigePoints: 160,
    badgeAr: 'نجم الصحراء',
    badgeEn: 'Desert Star',
    styleTagAr: 'حجر العلا الوردي وسدو بدوي',
    styleTagEn: 'AlUla Rose Sandstone & Sadu',
    votes: 64,
  },
  {
    id: 'riv_5',
    nameAr: 'قهوة السيف بالخبر',
    nameEn: 'Al-Seef Specialty Qahwa',
    cityAr: 'الخبر',
    cityEn: 'Al-Khobar',
    prestigePoints: 75,
    badgeAr: 'باريستا صاعد',
    badgeEn: 'Rising Barista',
    styleTagAr: 'إطلالة الخليج والرخام',
    styleTagEn: 'Arabian Gulf Marble Lounge',
    votes: 41,
  },
];

export const ITEM_CATALOG: Record<string, ItemDefinition> = {
  // GENERATORS (4 Cultural & Specialty Generators)
  gen_qahwa: {
    id: 'gen_qahwa',
    chain: 'generator',
    level: 1,
    maxLevel: 1,
    isGenerator: true,
    spawnsChain: 'qahwa',
    nameAr: 'خيشة البن الخولاني',
    nameEn: 'Khawlani Coffee Sack',
    descAr: 'مولّد رئيسي: انقر لإنتاج حبات البن الخولاني الأصيل.',
    descEn: 'Generator: Tap to spawn authentic Jazan Khawlani coffee items.',
    sellValue: 0,
    mergeXp: 0,
    accentColor: '#D99B26',
  },
  gen_barista: {
    id: 'gen_barista',
    chain: 'generator',
    level: 1,
    maxLevel: 1,
    isGenerator: true,
    spawnsChain: 'barista',
    nameAr: 'محطة تحميص الرياض المختصة',
    nameEn: 'Riyadh Specialty Roaster',
    descAr: 'مولّد رئيسي: انقر لإنتاج أدوات القهوة المختصة واللاتيه.',
    descEn: 'Generator: Tap to spawn V60 pour-over & specialty café drinks.',
    sellValue: 0,
    mergeXp: 0,
    accentColor: '#2A9D8F',
  },
  gen_sweets: {
    id: 'gen_sweets',
    chain: 'generator',
    level: 1,
    maxLevel: 1,
    isGenerator: true,
    spawnsChain: 'sweets',
    nameAr: 'سلة تمور العلا والحلويات',
    nameEn: 'AlUla Date & Sweets Basket',
    descAr: 'مولّد رئيسي: انقر لإنتاج التمور الفاخرة وحلويات المجلس.',
    descEn: 'Generator: Tap to spawn Sukkari dates & Khaleeji pastries.',
    sellValue: 0,
    mergeXp: 0,
    accentColor: '#E76F51',
  },
  gen_oud: {
    id: 'gen_oud',
    chain: 'generator',
    level: 1,
    maxLevel: 1,
    isGenerator: true,
    spawnsChain: 'oud',
    nameAr: 'صندوق العود والمبخرة الملكية',
    nameEn: 'Royal Oud & Mabkhara Chest',
    descAr: 'مولّد العطور: انقر لإنتاج كسر العود الكمبودي وتولات الورد الطائفي.',
    descEn: 'Perfumery Generator: Tap to spawn Cambodian Oud, Bakhoor & Taif Rose.',
    sellValue: 0,
    mergeXp: 0,
    accentColor: '#A855F7',
  },

  // CHAIN 1: SAUDI QAHWA & DALLAH (Levels 1-6)
  qahwa_1: {
    id: 'qahwa_1',
    chain: 'qahwa',
    level: 1,
    maxLevel: 6,
    nameAr: 'بن خولاني أخضر',
    nameEn: 'Green Khawlani Beans',
    descAr: 'حبات بن جبلي طازجة من مدرجات جازان.',
    descEn: 'Fresh mountain coffee beans harvested from Jazan terraces.',
    sellValue: 2,
    mergeXp: 2,
    accentColor: '#84A98C',
  },
  qahwa_2: {
    id: 'qahwa_2',
    chain: 'qahwa',
    level: 2,
    maxLevel: 6,
    nameAr: 'بن أشقر محمّص بالهيل',
    nameEn: 'Blonde Cardamom Roast',
    descAr: 'تحميصة ذهبية شقراء معطّرة بحبات الهيل الفاخر.',
    descEn: 'Light golden Saudi roast infused with fragrant green cardamom pods.',
    sellValue: 5,
    mergeXp: 5,
    accentColor: '#D4A373',
  },
  qahwa_3: {
    id: 'qahwa_3',
    chain: 'qahwa',
    level: 3,
    maxLevel: 6,
    nameAr: 'نجر ومحماس نحاسي',
    nameEn: 'Brass Mortar & Mihmas',
    descAr: 'نجر نجدي أصيل يدقّ البن والهيل بصوت الضيافة العريق.',
    descEn: 'Traditional ringing Najdi brass mortar used to pound fresh spices.',
    sellValue: 12,
    mergeXp: 12,
    accentColor: '#E9C46A',
  },
  qahwa_4: {
    id: 'qahwa_4',
    chain: 'qahwa',
    level: 4,
    maxLevel: 6,
    nameAr: 'دلة رسلان مذهّبة',
    nameEn: 'Gilded Raslan Dallah',
    descAr: 'دلة نحاسية مصقولة بالذهب لحفظ القهوة السعودية الساخنة.',
    descEn: 'Hand-engraved brass and gold Dallah coffee pot of classic hospitality.',
    sellValue: 28,
    mergeXp: 25,
    accentColor: '#F4A261',
  },
  qahwa_5: {
    id: 'qahwa_5',
    chain: 'qahwa',
    level: 5,
    maxLevel: 6,
    nameAr: 'فناجيل السيف والزعفران',
    nameEn: 'Saffron Finjan Trio',
    descAr: 'فناجيل خزف بنقش السيفين والنخلة تفوح بالزعفران والقرنفل.',
    descEn: 'Porcelain finjan cups steaming with saffron-laced Saudi Qahwa.',
    sellValue: 65,
    mergeXp: 55,
    accentColor: '#E76F51',
  },
  qahwa_6: {
    id: 'qahwa_6',
    chain: 'qahwa',
    level: 6,
    maxLevel: 6,
    nameAr: 'صينية الضيافة الملكية بالعود',
    nameEn: 'Royal Diriyah Dallah & Oud Set',
    descAr: 'أعلى مستوى! طقم ضيافة ملكي متكامل مع مبخرة العود الكمبودي.',
    descEn: 'Max Level! Masterpiece royal presentation tray with Dallah & Bakhoor censer.',
    sellValue: 150,
    mergeXp: 120,
    accentColor: '#F59E0B',
  },

  // CHAIN 2: SPECIALTY BARISTA & V60 (Levels 1-6)
  barista_1: {
    id: 'barista_1',
    chain: 'barista',
    level: 1,
    maxLevel: 6,
    nameAr: 'فلتر ترشيح ورقي',
    nameEn: 'Unbleached V60 Filter',
    descAr: 'ورق ترشيح نقي لاستخلاص إيحاءات القهوة المختصة.',
    descEn: 'Crisp conical paper filter folded for clean pour-over extraction.',
    sellValue: 2,
    mergeXp: 2,
    accentColor: '#94A3B8',
  },
  barista_2: {
    id: 'barista_2',
    chain: 'barista',
    level: 2,
    maxLevel: 6,
    nameAr: 'قمع تقطير V60 سيراميك',
    nameEn: 'Ceramic V60 Dripper',
    descAr: 'قمع تقطير حلزوني يبرز حمضية الفواكه والياسمين.',
    descEn: 'Spiral-ribbed artisan ceramic dripper for specialty single-origin brews.',
    sellValue: 5,
    mergeXp: 5,
    accentColor: '#38BDF8',
  },
  barista_3: {
    id: 'barista_3',
    chain: 'barista',
    level: 3,
    maxLevel: 6,
    nameAr: 'سبانش لاتيه بارد بالثلج',
    nameEn: 'Iced Riyadh Spanish Latte',
    descAr: 'المشروب الأول في مقاهي الرياض! إسبريسو غني مع حليب مكثف محلى.',
    descEn: 'Riyadh’s #1 café obsession: velvety double espresso over sweet condensed milk.',
    sellValue: 12,
    mergeXp: 12,
    accentColor: '#0EA5E9',
  },
  barista_4: {
    id: 'barista_4',
    chain: 'barista',
    level: 4,
    maxLevel: 6,
    nameAr: 'كورتادو فستق بحليب الإبل',
    nameEn: 'Camel-Milk Pistachio Cortado',
    descAr: 'ابتكار سعودي عصري يجمع رغوة حليب الإبل وكريمة الفستق الحلبي.',
    descEn: 'Signature Khaleeji fusion: silky steamed camel milk with roasted pistachio crema.',
    sellValue: 28,
    mergeXp: 25,
    accentColor: '#10B981',
  },
  barista_5: {
    id: 'barista_5',
    chain: 'barista',
    level: 5,
    maxLevel: 6,
    nameAr: 'كيمكس كولد برو بالورد الطائفي',
    nameEn: 'Taif Rose Chemex Cold Brew',
    descAr: 'قهوة مقطرة على البارد لمدة 18 ساعة مع قطرات ماء الورد الطائفي.',
    descEn: 'Crystal Chemex carafe infused with fragrant mountain Taif rose petals.',
    sellValue: 65,
    mergeXp: 55,
    accentColor: '#EC4899',
  },
  barista_6: {
    id: 'barista_6',
    chain: 'barista',
    level: 6,
    maxLevel: 6,
    nameAr: 'برج تذوق الباريستا الملكي',
    nameEn: 'Grand Khaleeji Roastery Flight',
    descAr: 'أعلى مستوى! لوحة تذوق فاخرة لأندر محاصيل القهوة المختصة في المملكة.',
    descEn: 'Max Level! Championship barista tasting flight of rare micro-lot pours.',
    sellValue: 150,
    mergeXp: 120,
    accentColor: '#8B5CF6',
  },

  // CHAIN 3: ROYAL DATES & KHALEEJI SWEETS (Levels 1-6)
  sweets_1: {
    id: 'sweets_1',
    chain: 'sweets',
    level: 1,
    maxLevel: 6,
    nameAr: 'رطب سكري طازج',
    nameEn: 'Fresh Sukkari Rutab',
    descAr: 'حبات رطب ذهبية طرية تذوب في الفم.',
    descEn: 'Sun-ripened golden Sukkari dates straight from Qassim palms.',
    sellValue: 2,
    mergeXp: 2,
    accentColor: '#FBBF24',
  },
  sweets_2: {
    id: 'sweets_2',
    chain: 'sweets',
    level: 2,
    maxLevel: 6,
    nameAr: 'تمر محشي بالطحينة واللوز',
    nameEn: 'Tahini & Almond Stuffed Dates',
    descAr: 'تمر ملكي محشو باللوز المحمص مع دبس التمر والطحينة.',
    descEn: 'Plump dates stuffed with roasted Marcona almonds and sesame tahini.',
    sellValue: 5,
    mergeXp: 5,
    accentColor: '#FB923C',
  },
  sweets_3: {
    id: 'sweets_3',
    chain: 'sweets',
    level: 3,
    maxLevel: 6,
    nameAr: 'كليجا قصيمية ومعمول فستق',
    nameEn: 'Qassim Kleija & Pistachio Maamoul',
    descAr: 'أقراص كليجا مقرمشة بالدبس والليمون الأسود والهيل.',
    descEn: 'Warm spiced date-molasses cookies paired with crumbly pistachio maamoul.',
    sellValue: 12,
    mergeXp: 12,
    accentColor: '#F97316',
  },
  sweets_4: {
    id: 'sweets_4',
    chain: 'sweets',
    level: 4,
    maxLevel: 6,
    nameAr: 'لقيمات مقرمشة بدبس التمر',
    nameEn: 'Crispy Luqaimat & Date Syrup',
    descAr: 'لقيمات ذهبية مغطاة بدبس التمر الحساوي وحبات السمسم.',
    descEn: 'Golden saffron dumplings drizzled with Al-Ahsa date syrup and sesame.',
    sellValue: 28,
    mergeXp: 25,
    accentColor: '#EA580C',
  },
  sweets_5: {
    id: 'sweets_5',
    chain: 'sweets',
    level: 5,
    maxLevel: 6,
    nameAr: 'كيكة الحليب بالزعفران والورد',
    nameEn: 'Saffron & Rose Tres Leches',
    descAr: 'كيكة الزعفران الخليجية الشهيرة الغارقة بالحليب الفاخر.',
    descEn: 'Velvety sponge soaked in saffron-infused milk and topped with rose petals.',
    sellValue: 65,
    mergeXp: 55,
    accentColor: '#E11D48',
  },
  sweets_6: {
    id: 'sweets_6',
    chain: 'sweets',
    level: 6,
    maxLevel: 6,
    nameAr: 'برج الكنافة الملكية بالقشطة والفستق',
    nameEn: 'Royal Golden Kunafa Tower',
    descAr: 'أعلى مستوى! كنافة ذهبية محشوة بالقشطة الطازجة والفستق الحلبي.',
    descEn: 'Max Level! Showstopping spun-pastry Kunafa crowned with clotted cream & pistachios.',
    sellValue: 150,
    mergeXp: 120,
    accentColor: '#EC4899',
  },

  // CHAIN 4: OUD, BAKHOOR & TAIF ROSE PERFUMERY (Levels 1-6)
  oud_1: {
    id: 'oud_1',
    chain: 'oud',
    level: 1,
    maxLevel: 6,
    nameAr: 'كسر عود كمبودي خام',
    nameEn: 'Raw Agarwood Oud Chips',
    descAr: 'رقائق عود طبيعي غنية بالدهن العطري الفاخر.',
    descEn: 'Resin-rich natural agarwood chips ready for the Majlis censer.',
    sellValue: 3,
    mergeXp: 3,
    accentColor: '#A16207',
  },
  oud_2: {
    id: 'oud_2',
    chain: 'oud',
    level: 2,
    maxLevel: 6,
    nameAr: 'مبخرة جمر نحاسية',
    nameEn: 'Brass Charcoal Mabkhara',
    descAr: 'مبخرة تقليدية مرصعة بالنحاس تفوح بدخان البخور الزكي.',
    descEn: 'Traditional studded brass incense burner glowing with aromatic embers.',
    sellValue: 7,
    mergeXp: 7,
    accentColor: '#D97706',
  },
  oud_3: {
    id: 'oud_3',
    chain: 'oud',
    level: 3,
    maxLevel: 6,
    nameAr: 'تولة ورد طائفي ملكي',
    nameEn: 'Taif Rose Crystal Tola',
    descAr: 'عطر الورد الطائفي المقطّر من بساتين الهدا والشفا.',
    descEn: 'Pure first-flush Taif rose attar decanted in a cut-crystal tola vial.',
    sellValue: 16,
    mergeXp: 15,
    accentColor: '#F43F5E',
  },
  oud_4: {
    id: 'oud_4',
    chain: 'oud',
    level: 4,
    maxLevel: 6,
    nameAr: 'دهن عود ملكي معتّق',
    nameEn: 'Aged Royal Dahn Al-Oud',
    descAr: 'زجاجة كريستال مذهّبة من دهن العود المعتق لتطييب كبار الضيوف.',
    descEn: 'Decades-aged royal oud oil presented to honor distinguished Majlis guests.',
    sellValue: 36,
    mergeXp: 32,
    accentColor: '#9333EA',
  },
  oud_5: {
    id: 'oud_5',
    chain: 'oud',
    level: 5,
    maxLevel: 6,
    nameAr: 'مبخرة قصر الدرعية المذهّبة',
    nameEn: 'Gilded Diriyah Incense Tower',
    descAr: 'مبخرة ملكية منحوتة على طراز شرفات الدرعية التاريخية.',
    descEn: 'Monumental gold-leaf censer sculpted with Najdi palace crenellations.',
    sellValue: 80,
    mergeXp: 70,
    accentColor: '#C084FC',
  },
  oud_6: {
    id: 'oud_6',
    chain: 'oud',
    level: 6,
    maxLevel: 6,
    nameAr: 'صينية البشت الملكي والعود النادر',
    nameEn: 'Royal Bisht & Rare Oud Ceremony Set',
    descAr: 'أعلى مستوى! طقم مراسم ملكي يجمع البشت المقصّب بالذهب ودهن العود النادر.',
    descEn: 'Max Level! Ceremonial gold-threaded Hasawi Bisht paired with imperial Oud.',
    sellValue: 190,
    mergeXp: 150,
    accentColor: '#F59E0B',
  },

  // CHAIN 5: MERGEABLE MAJLIS TREASURE CHESTS (Levels 1-2)
  chest_1: {
    id: 'chest_1',
    chain: 'chest',
    level: 1,
    maxLevel: 2,
    isChest: true,
    nameAr: 'صندوق ضيافة السدو (مستوى 1)',
    nameEn: 'Wooden Sadu Hospitality Chest (Lv.1)',
    descAr: 'افتحه الآن لربح الطاقة والريالات، أو ادمج صندوقين لترقيته لصندوق ملكي مضاعف!',
    descEn: 'Open now for Energy & Riyals, or merge 2 into a Gilded Royal Chest for 3x rewards!',
    sellValue: 25,
    mergeXp: 15,
    accentColor: '#D97724',
  },
  chest_2: {
    id: 'chest_2',
    chain: 'chest',
    level: 2,
    maxLevel: 2,
    isChest: true,
    nameAr: 'صندوق الكنز الملكي المذهّب (مستوى 2)',
    nameEn: 'Gilded Royal Treasure Chest (Lv.2)',
    descAr: 'أعلى مستوى! افتحه للحصول على 180 ريال، 35 جوهرة، 65 طاقة، وفنجال الجوكر!',
    descEn: 'Max Level! Burst open for +180 SAR, +35 Gems, +65 Energy & +1 Royal Joker!',
    sellValue: 90,
    mergeXp: 50,
    accentColor: '#FBBF24',
  },
};

export const CHAIN_PROGRESSION: Record<ChainId, string[]> = {
  qahwa: ['qahwa_1', 'qahwa_2', 'qahwa_3', 'qahwa_4', 'qahwa_5', 'qahwa_6'],
  barista: ['barista_1', 'barista_2', 'barista_3', 'barista_4', 'barista_5', 'barista_6'],
  sweets: ['sweets_1', 'sweets_2', 'sweets_3', 'sweets_4', 'sweets_5', 'sweets_6'],
  oud: ['oud_1', 'oud_2', 'oud_3', 'oud_4', 'oud_5', 'oud_6'],
  chest: ['chest_1', 'chest_2'],
};

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'chap_1',
    chapterNumber: 1,
    titleAr: 'الفصل الأول: مفتاح قصر الطين في الدرعية',
    titleEn: 'Chapter 1: The Mud-Brick Key of Diriyah',
    speakerAr: 'الجدة نورة (أم طارق)',
    speakerEn: 'Grandmother Noura',
    roleAr: 'حارسة إرث العائلة',
    roleEn: 'Matriarch & Heritage Keeper',
    dialogueAr: [
      'يا هلا بعودتك يا ليلى! هذا المجلس الطيني في الدرعية بناه جدك قبل ستين عاماً، وكانت رائحة البن الخولاني والهيل تجمع أهل الحي كل مسية.',
      'المستثمر المنافس "راشد" يحاول شراء الأرض لتحويلها إلى مجمع تجاري بلا روح... لكن وصية جدك واضحة: من يُحيي المجلس ويجمع النجوم، يملك القصر!',
    ],
    dialogueEn: [
      'Welcome home, Layla! Your grandfather built this mud-brick Majlis in Diriyah sixty years ago, where the aroma of Khawlani Qahwa gathered the whole neighborhood.',
      'Rival developer Rashid is pressuring the council to buy the plot—but your grandfather’s will is clear: if we restore the café and welcome guests, the estate remains ours!',
    ],
    rewardDiamonds: 25,
    rewardEnergy: 30,
  },
  {
    id: 'chap_2',
    chapterNumber: 2,
    titleAr: 'الفصل الثاني: سحر السدو النجدي',
    titleEn: 'Chapter 2: Threads of Najdi Sadu',
    speakerAr: 'فيصل الباريستا',
    speakerEn: 'Barista Faisal',
    roleAr: 'بطل التحميص المختص في الرياض',
    roleEn: 'Riyadh Specialty Coffee Champion',
    dialogueAr: [
      'ليلى، دمجك بين الدلة النجدية ومشروبات الـ V60 والسبانش لاتيه جذب شباب الرياض وكبار الشخصيات معاً!',
      'فرشنا المجلس بنقوش السدو الأصيلة، لكن سمعت أن الناقدة الشهيرة "لمى" في طريقها لتقييم المقهى الليلة على سناب شات وتيك توك!',
    ],
    dialogueEn: [
      'Layla, your blend of traditional Najdi Dallah hospitality and specialty V60 pour-overs has drawn both young Riyadh creatives and elders alike!',
      'With the authentic Sadu cushions in place, word is out that top lifestyle critic Lama is visiting tonight to review us live!',
    ],
    rewardDiamonds: 35,
    rewardEnergy: 40,
  },
  {
    id: 'chap_3',
    chapterNumber: 3,
    titleAr: 'الفصل الثالث: سر الخلطة الملكية',
    titleEn: 'Chapter 3: Secret of the Royal Blend',
    speakerAr: 'الشيخ طارق آل منصور',
    speakerEn: 'Sheikh Tariq Al-Mansour',
    roleAr: 'المستثمر الخفي وعميد التجار',
    roleEn: 'Mystery Patron & Guild Elder',
    dialogueAr: [
      'تذوقت القهوة في مئات المجالس من الرياض إلى العلا ودبي، لكن هذا الفنجال مع الكليجا القصيمية أعاد لي ذكريات الصبا.',
      'أعلنت دعمي الرسمي لمجلسكم في مسابقة التراث! واصلوا تطوير نافورة الحوش وركن العود استعداداً لليالي الغبقة الرمضانية.',
    ],
    dialogueEn: [
      'I have tasted Qahwa in hundreds of salons from Riyadh to AlUla and Dubai, yet this single Finjan paired with Qassim Kleija brought back my youth.',
      'I am backing your Majlis officially in the Heritage Cup! Keep restoring the courtyard fountain and Oud corner before Ramadan Ghabga nights begin.',
    ],
    rewardDiamonds: 50,
    rewardEnergy: 50,
  },
  {
    id: 'chap_4',
    chapterNumber: 4,
    titleAr: 'الفصل الرابع: ليالي الغبقة في العلا',
    titleEn: 'Chapter 4: Ramadan Ghabga Under the Lanterns',
    speakerAr: 'لمى (تذوّق وقهوة)',
    speakerEn: 'Lama (Lifestyle & Café Critic)',
    roleAr: 'مؤثرة القهوة الأولى في الخليج',
    roleEn: 'Top GCC Coffee & Culture Creator',
    dialogueAr: [
      'المكان خيالي! الفوانيس النحاسية مع صوت النجر ورائحة الورد الطائفي جعلت الفيديو يتجاوز مليونين مشاهدة في ساعة واحدة!',
      'الحجوزات ممتلئة بالكامل لثلاثة أسابيع قادمة. لم يتبقَ سوى تزيين الشرفة الملكية بالمشربية لإعلان الافتتاح الكبير.',
    ],
    dialogueEn: [
      'This courtyard is breathtaking! The brass lanterns, ringing mortar, and Taif rose cold brew pushed my review past 2 million views in an hour!',
      'Reservations are booked solid for three weeks. One final renovation—the Royal Mashrabiya Balcony—will crown your Majlis #1 in the Kingdom!',
    ],
    rewardDiamonds: 75,
    rewardEnergy: 60,
  },
];

export const ORDER_TEMPLATES: Omit<CustomerOrder, 'id'>[] = [
  {
    customerId: 'noura',
    customerNameAr: 'الجدة نورة',
    customerNameEn: 'Grandmother Noura',
    customerRoleAr: 'تجهيز قهوة العصر',
    customerRoleEn: 'Afternoon Majlis Hostess',
    quoteAr: 'نحتاج بن محمص بالهيل وتمر محشي بالطحينة لضيوف العصر يا بنيتي.',
    quoteEn: 'We need Blonde Cardamom Roast and Tahini Stuffed Dates for afternoon guests.',
    requiredItemIds: ['qahwa_2', 'sweets_2'],
    rewardCoins: 35,
    rewardStars: 2,
    rewardXp: 25,
  },
  {
    customerId: 'faisal',
    customerNameAr: 'فيصل الباريستا',
    customerNameEn: 'Barista Faisal',
    customerRoleAr: 'طلبية القهوة المختصة',
    customerRoleEn: 'Specialty Bar Order',
    quoteAr: 'الزبائن يطلبون سبانش لاتيه بارد مع قمع V60 سيراميك فوراً!',
    quoteEn: 'Regulars are lining up for an Iced Spanish Latte and Ceramic V60!',
    requiredItemIds: ['barista_3', 'barista_2'],
    rewardCoins: 45,
    rewardStars: 2,
    rewardXp: 35,
  },
  {
    customerId: 'tariq',
    customerNameAr: 'الشيخ طارق',
    customerNameEn: 'Sheikh Tariq',
    customerRoleAr: 'موكب كبار الشخصيات VIP',
    customerRoleEn: 'VIP Royal Convoy',
    quoteAr: 'أكرمونا بدلة رسلان مذهبة مع مبخرة جمر نحاسية وكليجا قصيمية.',
    quoteEn: 'Honor our Diwan with a Gilded Raslan Dallah and Brass Mabkhara.',
    requiredItemIds: ['qahwa_4', 'oud_2'],
    rewardCoins: 95,
    rewardStars: 3,
    rewardXp: 65,
    isVip: true,
  },
  {
    customerId: 'lama',
    customerNameAr: 'المؤثرة لمى',
    customerNameEn: 'Creator Lama',
    customerRoleAr: 'تغطية تيك توك وسناب',
    customerRoleEn: 'Viral Café Review',
    quoteAr: 'أبي أصور كورتادو حليب الإبل مع تولة الورد الطائفي الملكي!',
    quoteEn: 'Filming a reel! Bring the Camel-Milk Cortado & Taif Rose Crystal Tola!',
    requiredItemIds: ['barista_4', 'oud_3'],
    rewardCoins: 120,
    rewardStars: 4,
    rewardXp: 85,
    isVip: true,
  },
  {
    customerId: 'sultan',
    customerNameAr: 'الأمير سلطان',
    customerNameEn: 'Sultan Al-Diriyah',
    customerRoleAr: 'أمسية التراث الملكية',
    customerRoleEn: 'Royal Heritage Gala',
    quoteAr: 'نريد فناجيل السيف والزعفران مع دهن العود الملكي المعتّق.',
    quoteEn: 'Serve the Saffron Finjan Trio alongside Aged Royal Dahn Al-Oud.',
    requiredItemIds: ['qahwa_5', 'oud_4'],
    rewardCoins: 185,
    rewardStars: 5,
    rewardXp: 140,
    isVip: true,
  },
  {
    customerId: 'ghabga',
    customerNameAr: 'وفد مهرجان القهوة',
    customerNameEn: 'Saudi Coffee Festival Jury',
    customerRoleAr: 'التحكيم النهائي',
    customerRoleEn: 'Championship Tasting',
    quoteAr: 'أبهروا اللجنة بكيمكس الورد الطائفي ونجر ومحماس نحاسي أصيل.',
    quoteEn: 'Impress the jury with Taif Rose Cold Brew and a Brass Mortar & Mihmas.',
    requiredItemIds: ['barista_5', 'qahwa_3'],
    rewardCoins: 165,
    rewardStars: 5,
    rewardXp: 125,
    isVip: true,
  },
];

export const INITIAL_RENOVATION_ZONES: RenovationZone[] = [
  {
    id: 'zone_arch',
    nameAr: 'بوابة القصر النجدي الطينية',
    nameEn: 'Najdi Mud-Brick Archway',
    descAr: 'المدخل التراثي المزخرف بالشرفات النجدية البيضاء والأبواب الخشبية المنقوشة.',
    descEn: 'Historic adobe entrance adorned with white gypsum crenellations and carved tamarisk doors.',
    unlockedLevel: 1,
    selectedStyle: 0,
    starCostLevel1: 2,
    starCostLevel2: 4,
    coinBonusPerOrder: 5,
    storyChapterIndex: 0,
    styles: [
      { nameAr: 'طين الدرعية العتيق', nameEn: 'Classic Diriyah Adobe', swatch: '#C68B59' },
      { nameAr: 'جبس الرياض الملكي', nameEn: 'Royal Gypsum & Gold', swatch: '#E9C46A' },
      { nameAr: 'حجر العلا الوردي', nameEn: 'AlUla Rose Sandstone', swatch: '#E07A5F' },
    ],
  },
  {
    id: 'zone_sadu',
    nameAr: 'مجلس السدو والمنقد النحاسي',
    nameEn: 'Sadu Majlis & Brass Hearth',
    descAr: 'جلسة أرضية وثيرة منسوجة بالسدو البدوي الأصيل حول منقد القهوة.',
    descEn: 'Plush floor seating woven in geometric Bedouin Sadu patterns around a brass hearth.',
    unlockedLevel: 0,
    selectedStyle: 0,
    starCostLevel1: 2,
    starCostLevel2: 5,
    coinBonusPerOrder: 10,
    storyChapterIndex: 1,
    styles: [
      { nameAr: 'سدو عنابي تقليدي', nameEn: 'Crimson Desert Sadu', swatch: '#9E2A2B' },
      { nameAr: 'حرير أخضر زمردي', nameEn: 'Emerald Oasis Silk', swatch: '#2A9D8F' },
      { nameAr: 'مخمل كحلي مذهّب', nameEn: 'Midnight Gold Velvet', swatch: '#1D3557' },
    ],
  },
  {
    id: 'zone_bar',
    nameAr: 'بار القهوة المختصة والتحميص',
    nameEn: 'Specialty V60 & Espresso Bar',
    descAr: 'بار رخامي حديث يجمع مكائن الإسبريسو الإيطالية وأقماع التقطير مع الدلال.',
    descEn: 'Travertine marble counter uniting artisanal V60 pour-over stations with brass Dallahs.',
    unlockedLevel: 0,
    selectedStyle: 0,
    starCostLevel1: 3,
    starCostLevel2: 6,
    coinBonusPerOrder: 15,
    storyChapterIndex: 2,
    styles: [
      { nameAr: 'رخام ترافرتين دافئ', nameEn: 'Warm Travertine & Brass', swatch: '#D4A373' },
      { nameAr: 'خشب الجوز والنيون', nameEn: 'Walnut & Riyadh Neon', swatch: '#10B981' },
      { nameAr: 'نحاس مطروق فاخر', nameEn: 'Hammered Artisan Copper', swatch: '#F4A261' },
    ],
  },
  {
    id: 'zone_courtyard',
    nameAr: 'نافورة الحوش وفوانيس الغبقة',
    nameEn: 'Courtyard Fountain & Lanterns',
    descAr: 'نافورة مياه أندلسية-حجازية تحيط بها أشجار النخيل وفوانيس رمضان.',
    descEn: 'Trickling tiled courtyard fountain framed by date palms and glowing brass lanterns.',
    unlockedLevel: 0,
    selectedStyle: 0,
    starCostLevel1: 4,
    starCostLevel2: 7,
    coinBonusPerOrder: 20,
    storyChapterIndex: 3,
    styles: [
      { nameAr: 'فسيفساء الفيروز', nameEn: 'Turquoise Zellige Tile', swatch: '#06B6D4' },
      { nameAr: 'فوانيس الغبقة الذهبية', nameEn: 'Golden Ghabga Lanterns', swatch: '#F59E0B' },
      { nameAr: 'حديقة الورد الطائفي', nameEn: 'Taif Rose Sanctuary', swatch: '#EC4899' },
    ],
  },
];

export const INITIAL_LIVEOPS_MILESTONES: LiveOpsMilestone[] = [
  {
    id: 'm_1',
    pointsRequired: 20,
    titleAr: 'دلة طاقة الصباح (+25 طاقة)',
    titleEn: 'Morning Qahwa Boost (+25 Energy)',
    rewardType: 'energy',
    rewardAmount: 25,
    claimed: false,
  },
  {
    id: 'm_2',
    pointsRequired: 60,
    titleAr: 'صرة ريالات ذهبية (+100 ريال)',
    titleEn: 'Merchant Coin Pouch (+100 SAR)',
    rewardType: 'coins',
    rewardAmount: 100,
    claimed: false,
  },
  {
    id: 'm_3',
    pointsRequired: 120,
    titleAr: 'نجوم إعمار الدرعية (+3 نجوم)',
    titleEn: 'Diriyah Architect Stars (+3 Stars)',
    rewardType: 'stars',
    rewardAmount: 3,
    claimed: false,
  },
  {
    id: 'm_4',
    pointsRequired: 220,
    titleAr: 'صندوق زمرد الغبقة الملكي (+50 جوهرة)',
    titleEn: 'Royal Ghabga Chest (+50 Gems)',
    rewardType: 'diamonds',
    rewardAmount: 50,
    claimed: false,
  },
];

export function createInitialGameState(): GameState {
  const board: BoardCell[] = [];
  for (let i = 0; i < 49; i++) {
    board.push({
      index: i,
      row: Math.floor(i / 7),
      col: i % 7,
      itemId: null,
      sandLocked: false,
    });
  }

  // 4 Cultural & Specialty Generators in Top Row
  board[1].itemId = 'gen_qahwa';
  board[2].itemId = 'gen_oud';
  board[3].itemId = 'gen_barista';
  board[5].itemId = 'gen_sweets';

  // Starter items on board including a Wooden Sadu Chest (chest_1) and Oud chips!
  board[15].itemId = 'qahwa_1';
  board[16].itemId = 'qahwa_1';
  board[17].itemId = 'sweets_1';
  board[18].itemId = 'sweets_1';
  board[19].itemId = 'oud_1';
  board[20].itemId = 'oud_1';
  board[22].itemId = 'barista_1';
  board[23].itemId = 'barista_1';
  board[24].itemId = 'barista_2';
  board[25].itemId = 'qahwa_2';
  board[26].itemId = 'chest_1';

  const sandPlacements: [number, string][] = [
    [0, 'qahwa_2'],
    [6, 'sweets_2'],
    [7, 'barista_2'],
    [13, 'oud_2'],
    [35, 'barista_3'],
    [41, 'sweets_3'],
    [42, 'qahwa_3'],
    [44, 'barista_3'],
    [46, 'oud_3'],
    [48, 'qahwa_4'],
  ];

  for (const [idx, itemId] of sandPlacements) {
    board[idx].itemId = itemId;
    board[idx].sandLocked = true;
  }

  return {
    board,
    selectedCellIndex: null,
    energy: 85,
    maxEnergy: 100,
    powerMultiplier: 1,
    inventory: [],
    inventoryCapacity: 4,
    bonusBubble: null,
    prestigePoints: 110,
    scissorsCount: 2,
    jokerCount: 1,
    freeSpinsAvailable: 1,
    mazayenVotesRemaining: 3,
    votedRivalIds: [],
    activeRegion: 'diriyah',
    ambiance: 'ramadan_night',
    coins: 120,
    diamonds: 45,
    stars: 2,
    xp: 0,
    level: 1,
    comboCount: 0,
    lastMergeAt: 0,
    ordersCompleted: 0,
    totalMerges: 0,
    activeOrders: [
      { ...ORDER_TEMPLATES[0], id: 'ord_init_1' },
      { ...ORDER_TEMPLATES[1], id: 'ord_init_2' },
      { ...ORDER_TEMPLATES[2], id: 'ord_init_3' },
    ],
    renovationZones: INITIAL_RENOVATION_ZONES.map((z) => ({ ...z, styles: [...z.styles] })),
    discoveredItemIds: [
      'gen_qahwa',
      'gen_barista',
      'gen_sweets',
      'gen_oud',
      'qahwa_1',
      'qahwa_2',
      'barista_1',
      'barista_2',
      'sweets_1',
      'oud_1',
      'chest_1',
    ],
    completedStoryIds: [],
    activeStoryId: null,
    liveOpsPoints: 15,
    liveOpsMilestones: INITIAL_LIVEOPS_MILESTONES.map((m) => ({ ...m })),
    vipPassActive: false,
    loginStreak: 0,
    lastLoginDay: '',
    tutorialDismissed: false,
    pourTokens: 0,
    areaIndex: 0,
    rngSeed: 20261025,
    generatorLevels: { qahwa: 1, barista: 1, sweets: 1, oud: 1, chest: 1 },
    totalSpawns: 0,
    wingUpgrades: 0,
    sandTilesBought: 0,
    coinEnergyToday: null,
    lastEnergyTick: 0,
    dailyQuests: null,
    lastMergedItemId: null,
  };
}

/**
 * Cycles the Generator Power Boost Multiplier (1x -> 2x -> 4x -> 1x) like Gossip Harbor / Travel Town!
 */
export function cyclePowerMultiplier(state: GameState): GameState {
  const nextMult: 1 | 2 | 4 =
    state.powerMultiplier === 1 ? 2 : state.powerMultiplier === 2 ? 4 : 1;
  return {
    ...state,
    powerMultiplier: nextMult,
  };
}

/**
 * Moves an unlocked non-generator item from the 7x7 board into the Sadu Pantry Storage Bag.
 */
export function storeBoardItemInInventory(
  state: GameState,
  cellIndex: number
): { state: GameState; stored: boolean; reason?: string } {
  const cell = state.board[cellIndex];
  if (!cell || !cell.itemId || cell.sandLocked) {
    return { state, stored: false, reason: 'INVALID_CELL' };
  }
  const def = ITEM_CATALOG[cell.itemId];
  if (!def || def.isGenerator) {
    return { state, stored: false, reason: 'CANNOT_STORE_GENERATOR' };
  }
  if (state.inventory.length >= state.inventoryCapacity) {
    return { state, stored: false, reason: 'INVENTORY_FULL' };
  }

  const nextBoard = state.board.map((c, idx) =>
    idx === cellIndex ? { ...c, itemId: null } : c
  );

  return {
    state: {
      ...state,
      board: nextBoard,
      inventory: [...state.inventory, cell.itemId],
      selectedCellIndex: null,
    },
    stored: true,
  };
}

/**
 * Retrieves an item from the Sadu Pantry Storage Bag back onto the nearest empty board cell.
 */
export function retrieveInventoryItemToBoard(
  state: GameState,
  inventoryIndex: number
): { state: GameState; retrieved: boolean; targetCellIndex: number | null } {
  const itemId = state.inventory[inventoryIndex];
  if (!itemId) {
    return { state, retrieved: false, targetCellIndex: null };
  }
  const emptyIdx = findNearestEmptyCell(state.board, 24);
  if (emptyIdx === null) {
    return { state, retrieved: false, targetCellIndex: null };
  }

  const nextBoard = state.board.map((c, idx) =>
    idx === emptyIdx ? { ...c, itemId } : c
  );
  const nextInventory = state.inventory.filter((_, idx) => idx !== inventoryIndex);

  return {
    state: {
      ...state,
      board: nextBoard,
      inventory: nextInventory,
      selectedCellIndex: emptyIdx,
    },
    retrieved: true,
    targetCellIndex: emptyIdx,
  };
}

/**
 * Unlocks the floating Golden Bonus Bubble using Gems, spawning the bonus item onto the board!
 */
export function unlockBonusBubbleWithGems(
  state: GameState
): { state: GameState; unlocked: boolean; spawnedCellIndex: number | null } {
  if (!state.bonusBubble) {
    return { state, unlocked: false, spawnedCellIndex: null };
  }
  if (state.diamonds < state.bonusBubble.gemCost) {
    return { state, unlocked: false, spawnedCellIndex: null };
  }
  const emptyIdx = findNearestEmptyCell(state.board, 24);
  if (emptyIdx === null) {
    return { state, unlocked: false, spawnedCellIndex: null };
  }

  const spawnedId = state.bonusBubble.itemId;
  const nextBoard = state.board.map((c, idx) =>
    idx === emptyIdx ? { ...c, itemId: spawnedId } : c
  );

  return {
    state: {
      ...state,
      board: nextBoard,
      diamonds: state.diamonds - state.bonusBubble.gemCost,
      bonusBubble: null,
      selectedCellIndex: emptyIdx,
    },
    unlocked: true,
    spawnedCellIndex: emptyIdx,
  };
}

/**
 * BOARD BOOSTER 1: Golden Brass Scissors (المقص الذهبي)
 * Splits any Lv.2-Lv.6 non-generator item into TWO Lv.(N-1) items!
 */
export function useGoldenScissors(
  state: GameState,
  cellIndex: number
): { state: GameState; split: boolean; lowerItemId?: string; reason?: string } {
  if (state.scissorsCount <= 0) {
    return { state, split: false, reason: 'NO_SCISSORS' };
  }
  const cell = state.board[cellIndex];
  if (!cell || !cell.itemId || cell.sandLocked) {
    return { state, split: false, reason: 'INVALID_CELL' };
  }
  const def = ITEM_CATALOG[cell.itemId];
  if (!def || def.isGenerator || def.chain === 'generator' || def.level <= 1) {
    return { state, split: false, reason: 'CANNOT_SPLIT_LEVEL_1' };
  }
  const emptyIdx = findNearestEmptyCell(state.board, cellIndex);
  if (emptyIdx === null) {
    return { state, split: false, reason: 'BOARD_FULL' };
  }

  const chainList = CHAIN_PROGRESSION[def.chain];
  const lowerItemId = chainList[def.level - 2];
  if (!lowerItemId) {
    return { state, split: false, reason: 'INVALID_CHAIN' };
  }

  const nextBoard = state.board.map((c, idx) => {
    if (idx === cellIndex || idx === emptyIdx) {
      return { ...c, itemId: lowerItemId };
    }
    return c;
  });

  return {
    state: {
      ...state,
      board: nextBoard,
      scissorsCount: state.scissorsCount - 1,
      selectedCellIndex: cellIndex,
    },
    split: true,
    lowerItemId,
  };
}

/**
 * BOARD BOOSTER 2: Royal Joker Finjan (فنجال الجوكر الذهبي)
 * Upgrades any Lv.1-Lv.5 non-generator item directly to Lv.(N+1) without needing a pair!
 */
export function useJokerUpgrade(
  state: GameState,
  cellIndex: number
): { state: GameState; upgraded: boolean; upgradedItemId?: string; reason?: string } {
  if (state.jokerCount <= 0) {
    return { state, upgraded: false, reason: 'NO_JOKER' };
  }
  const cell = state.board[cellIndex];
  if (!cell || !cell.itemId || cell.sandLocked) {
    return { state, upgraded: false, reason: 'INVALID_CELL' };
  }
  const def = ITEM_CATALOG[cell.itemId];
  if (!def || def.isGenerator || def.chain === 'generator' || def.level >= def.maxLevel) {
    return { state, upgraded: false, reason: 'ALREADY_MAX_LEVEL' };
  }

  const nextItemId = getNextMergedItemId(cell.itemId);
  if (!nextItemId) {
    return { state, upgraded: false, reason: 'INVALID_NEXT_ITEM' };
  }

  const nextBoard = state.board.map((c, idx) =>
    idx === cellIndex ? { ...c, itemId: nextItemId } : c
  );

  const discovered = state.discoveredItemIds.includes(nextItemId)
    ? state.discoveredItemIds
    : [...state.discoveredItemIds, nextItemId];

  return {
    state: {
      ...state,
      board: nextBoard,
      jokerCount: state.jokerCount - 1,
      prestigePoints: state.prestigePoints + 20,
      discoveredItemIds: discovered,
      selectedCellIndex: cellIndex,
    },
    upgraded: true,
    upgradedItemId: nextItemId,
  };
}

/**
 * Opens a Mergeable Majlis Treasure Chest (chest_1 or chest_2) on the board!
 */
export function openBoardChest(
  state: GameState,
  cellIndex: number
): { state: GameState; opened: boolean; tier?: number } {
  const cell = state.board[cellIndex];
  if (!cell || !cell.itemId || cell.sandLocked) {
    return { state, opened: false };
  }
  const def = ITEM_CATALOG[cell.itemId];
  if (!def || !def.isChest) {
    return { state, opened: false };
  }

  const isRoyal = def.level >= 2;
  const coinsGain = isRoyal ? 180 : 60;
  const gemsGain = isRoyal ? 35 : 12;
  const energyGain = isRoyal ? 65 : 25;

  const nextBoard = state.board.map((c, idx) =>
    idx === cellIndex ? { ...c, itemId: null } : c
  );

  return {
    state: {
      ...state,
      board: nextBoard,
      coins: state.coins + coinsGain,
      diamonds: state.diamonds + gemsGain,
      energy: state.energy + energyGain,
      scissorsCount: state.scissorsCount + (isRoyal ? 1 : 0),
      jokerCount: state.jokerCount + (isRoyal ? 1 : 0),
      prestigePoints: state.prestigePoints + (isRoyal ? 45 : 15),
      selectedCellIndex: null,
    },
    opened: true,
    tier: def.level,
  };
}

/**
 * Spins the Daily "Finjan Al-Sabah" Lucky Dallah Wheel!
 */
export function spinLuckyWheel(
  state: GameState,
  deterministicIndex?: number
): { state: GameState; spun: boolean; wedge: WheelWedge | null; reason?: string } {
  const isFree = state.freeSpinsAvailable > 0;
  const gemCost = isFree ? 0 : 15;
  if (!isFree && state.diamonds < gemCost) {
    return { state, spun: false, wedge: null, reason: 'NO_GEMS' };
  }

  const idx =
    deterministicIndex !== undefined
      ? deterministicIndex % LUCKY_WHEEL_WEDGES.length
      : Math.floor(Math.random() * LUCKY_WHEEL_WEDGES.length);
  const wedge = LUCKY_WHEEL_WEDGES[idx];

  let nextBoard = state.board;
  if (wedge.rewardType === 'chest') {
    const emptyIdx = findNearestEmptyCell(state.board, 24);
    if (emptyIdx !== null) {
      nextBoard = state.board.map((c, i) =>
        i === emptyIdx ? { ...c, itemId: 'chest_1' } : c
      );
    }
  }

  return {
    state: {
      ...state,
      board: nextBoard,
      freeSpinsAvailable: isFree ? state.freeSpinsAvailable - 1 : 0,
      diamonds:
        state.diamonds -
        gemCost +
        (wedge.rewardType === 'diamonds' ? wedge.amount : 0),
      energy:
        state.energy + (wedge.rewardType === 'energy' ? wedge.amount : 0),
      coins: state.coins + (wedge.rewardType === 'coins' ? wedge.amount : 0),
      scissorsCount:
        state.scissorsCount +
        (wedge.rewardType === 'scissors' ? wedge.amount : 0),
      jokerCount:
        state.jokerCount + (wedge.rewardType === 'joker' ? wedge.amount : 0),
      prestigePoints: state.prestigePoints + 15,
    },
    spun: true,
    wedge,
  };
}

/**
 * Votes on a rival café in the Weekly "Mazayen Al-Majlis" Showcase Contest!
 */
export function voteMazayenEntry(
  state: GameState,
  rivalId: string
): { state: GameState; voted: boolean } {
  if (
    state.mazayenVotesRemaining <= 0 ||
    state.votedRivalIds.includes(rivalId)
  ) {
    return { state, voted: false };
  }
  return {
    state: {
      ...state,
      mazayenVotesRemaining: state.mazayenVotesRemaining - 1,
      votedRivalIds: [...state.votedRivalIds, rivalId],
      coins: state.coins + 25,
      prestigePoints: state.prestigePoints + 20,
      liveOpsPoints: state.liveOpsPoints + 10,
    },
    voted: true,
  };
}

export function canMergeItems(itemIdA: string | null, itemIdB: string | null): boolean {
  if (!itemIdA || !itemIdB) return false;
  if (itemIdA !== itemIdB) return false;
  const def = ITEM_CATALOG[itemIdA];
  if (!def || def.isGenerator) return false;
  return def.level < def.maxLevel;
}

export function getNextMergedItemId(itemId: string): string | null {
  const def = ITEM_CATALOG[itemId];
  if (!def || def.isGenerator || def.chain === 'generator') return null;
  const chainList = CHAIN_PROGRESSION[def.chain];
  const nextIndex = def.level;
  if (nextIndex < 0 || nextIndex >= chainList.length) return null;
  return chainList[nextIndex];
}

export function findNearestEmptyCell(board: BoardCell[], originIndex: number): number | null {
  const originRow = Math.floor(originIndex / 7);
  const originCol = originIndex % 7;

  let bestIndex: number | null = null;
  let bestDist = Infinity;

  for (const cell of board) {
    if (cell.itemId === null && !cell.sandLocked) {
      const dist = Math.hypot(cell.row - originRow, cell.col - originCol);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = cell.index;
      }
    }
  }
  return bestIndex;
}

/**
 * Spawns a new item from a generator tile onto the nearest empty cell, respecting Power Boost (x1, x2, x4)!
 */
export function spawnFromGenerator(
  state: GameState,
  generatorCellIndex: number,
  deterministicRoll?: number
): { state: GameState; spawnedCellIndex: number | null; spawnedItemId: string | null; reason?: string } {
  const cell = state.board[generatorCellIndex];
  if (!cell || !cell.itemId) {
    return { state, spawnedCellIndex: null, spawnedItemId: null, reason: 'EMPTY_CELL' };
  }
  const genDef = ITEM_CATALOG[cell.itemId];
  if (!genDef || !genDef.isGenerator || !genDef.spawnsChain) {
    return { state, spawnedCellIndex: null, spawnedItemId: null, reason: 'NOT_GENERATOR' };
  }

  const mult = state.powerMultiplier || 1;
  const energyCost = Math.min(mult, Math.max(1, state.energy));
  if (state.energy <= 0) {
    return { state, spawnedCellIndex: null, spawnedItemId: null, reason: 'NO_ENERGY' };
  }
  const emptyIdx = findNearestEmptyCell(state.board, generatorCellIndex);
  if (emptyIdx === null) {
    return { state, spawnedCellIndex: null, spawnedItemId: null, reason: 'BOARD_FULL' };
  }

  const roll = deterministicRoll !== undefined ? deterministicRoll : Math.random();
  const luckyThreshold = 1 - generatorLuckyChance(state, genDef.spawnsChain);
  const chainList = CHAIN_PROGRESSION[genDef.spawnsChain];

  // Base index from multiplier: 1x -> idx 0 (Lv.1), 2x -> idx 1 (Lv.2), 4x -> idx 2 (Lv.3)
  let tierIndex = energyCost === 4 ? 2 : energyCost === 2 ? 1 : 0;
  if (roll >= luckyThreshold && tierIndex < chainList.length - 1) {
    tierIndex += 1;
  }
  const spawnedItemId = chainList[tierIndex];

  const nextBoard = state.board.map((c, idx) =>
    idx === emptyIdx ? { ...c, itemId: spawnedItemId } : c
  );

  const discovered = state.discoveredItemIds.includes(spawnedItemId)
    ? state.discoveredItemIds
    : [...state.discoveredItemIds, spawnedItemId];

  return {
    state: {
      ...state,
      board: nextBoard,
      energy: state.energy - energyCost,
      selectedCellIndex: emptyIdx,
      discoveredItemIds: discovered,
      totalSpawns: (state.totalSpawns ?? 0) + 1,
    },
    spawnedCellIndex: emptyIdx,
    spawnedItemId,
  };
}

export const COMBO_WINDOW_MS = 6000;
export const MAX_COMBO_BONUS_COINS = 20;

export interface LevelUpReward {
  fromLevel: number;
  toLevel: number;
  gems: number;
  energy: number;
}

export function getComboBonusCoins(combo: number): number {
  return combo >= 3 ? Math.min(MAX_COMBO_BONUS_COINS, (combo - 2) * 2) : 0;
}

export function getLevelFromXp(xp: number): number {
  return levelFromXp(xp);
}

function getAdjacentMatchIndex(board: BoardCell[], targetIndex: number, excludeIndex: number, itemId: string): number | null {
  const target = board[targetIndex];
  const neighbours = [
    [target.row - 1, target.col],
    [target.row + 1, target.col],
    [target.row, target.col - 1],
    [target.row, target.col + 1],
  ];
  for (const [r, c] of neighbours) {
    const cell = board.find((b) => b.row === r && b.col === c);
    if (cell && cell.index !== excludeIndex && !cell.sandLocked && cell.itemId === itemId) {
      return cell.index;
    }
  }
  return null;
}

export function mergeOrMoveCells(
  state: GameState,
  fromIndex: number,
  toIndex: number,
  now: number = Date.now()
): {
  state: GameState;
  action: 'MERGED' | 'MOVED' | 'SWAPPED' | 'INVALID';
  mergedItemId?: string;
  comboCount?: number;
  comboBonusCoins?: number;
  megaMerge?: boolean;
  levelUp?: LevelUpReward;
} {
  if (fromIndex === toIndex) {
    return { state, action: 'INVALID' };
  }
  const fromCell = state.board[fromIndex];
  const toCell = state.board[toIndex];
  if (!fromCell || !toCell || !fromCell.itemId) {
    return { state, action: 'INVALID' };
  }
  if (fromCell.sandLocked) {
    return { state, action: 'INVALID' };
  }

  if (canMergeItems(fromCell.itemId, toCell.itemId)) {
    const nextItemId = getNextMergedItemId(fromCell.itemId);
    if (!nextItemId) return { state, action: 'INVALID' };

    // Mega Merge: a third matching item touching the merge tile is absorbed for a free extra level.
    const megaSourceIndex = getAdjacentMatchIndex(state.board, toIndex, fromIndex, fromCell.itemId);
    const megaItemId = megaSourceIndex !== null ? getNextMergedItemId(nextItemId) : null;
    const megaMerge = megaSourceIndex !== null && megaItemId !== null;
    const resultItemId = megaMerge ? (megaItemId as string) : nextItemId;
    const nextDef = ITEM_CATALOG[resultItemId];

    const comboCount =
      state.lastMergeAt > 0 && now - state.lastMergeAt <= COMBO_WINDOW_MS ? state.comboCount + 1 : 1;
    const comboBonusCoins = getComboBonusCoins(comboCount);

    const gainedXp = (nextDef ? nextDef.mergeXp : 5) + Math.min(comboCount - 1, 10);
    const newXp = state.xp + gainedXp;
    const newLevel = getLevelFromXp(newXp);

    let levelUp: LevelUpReward | undefined;
    if (newLevel > state.level) {
      levelUp = {
        fromLevel: state.level,
        toLevel: newLevel,
        gems: LEVEL_UP_GEMS * (newLevel - state.level),
        energy: LEVEL_UP_ENERGY * (newLevel - state.level),
      };
    }

    const nextBoard = state.board.map((cell, idx) => {
      if (idx === fromIndex || (megaMerge && idx === megaSourceIndex)) {
        return { ...cell, itemId: null };
      }
      if (idx === toIndex) {
        return { ...cell, itemId: resultItemId, sandLocked: false };
      }
      return cell;
    });

    const discovered = new Set(state.discoveredItemIds);
    discovered.add(nextItemId);
    discovered.add(resultItemId);

    const bonusCoins = (nextDef && nextDef.level >= 4 ? nextDef.level * 3 : 0) + comboBonusCoins;

    // Spawn a Gossip-Harbor style Golden Bonus Bubble when merging into Level 3+!
    const nextBubble: BonusBubble | null =
      nextDef && nextDef.level >= 3
        ? { itemId: resultItemId, gemCost: nextDef.level * 4 }
        : state.bonusBubble;

    return {
      state: {
        ...state,
        board: nextBoard,
        selectedCellIndex: toIndex,
        xp: newXp,
        level: newLevel,
        coins: state.coins + bonusCoins,
        diamonds: state.diamonds + (levelUp ? levelUp.gems : 0),
        energy: levelUp ? state.energy + levelUp.energy : state.energy,
        comboCount,
        lastMergeAt: now,
        totalMerges: state.totalMerges + 1,
        prestigePoints: state.prestigePoints + (nextDef ? nextDef.level * 3 : 3),
        liveOpsPoints: state.liveOpsPoints + (nextDef ? nextDef.level * 2 : 2),
        discoveredItemIds: Array.from(discovered),
        lastMergedItemId: resultItemId,
        bonusBubble: nextBubble,
      },
      action: 'MERGED',
      mergedItemId: resultItemId,
      comboCount,
      comboBonusCoins,
      megaMerge,
      levelUp,
    };
  }

  if (toCell.sandLocked) {
    return { state, action: 'INVALID' };
  }

  if (toCell.itemId === null) {
    const nextBoard = state.board.map((cell, idx) => {
      if (idx === fromIndex) return { ...cell, itemId: null };
      if (idx === toIndex) return { ...cell, itemId: fromCell.itemId };
      return cell;
    });
    return {
      state: {
        ...state,
        board: nextBoard,
        selectedCellIndex: toIndex,
      },
      action: 'MOVED',
    };
  }

  const nextBoard = state.board.map((cell, idx) => {
    if (idx === fromIndex) return { ...cell, itemId: toCell.itemId };
    if (idx === toIndex) return { ...cell, itemId: fromCell.itemId };
    return cell;
  });

  return {
    state: {
      ...state,
      board: nextBoard,
      selectedCellIndex: toIndex,
    },
    action: 'SWAPPED',
  };
}

export function findBestMergePair(board: BoardCell[]): [number, number] | null {
  const unlockedCells = board.filter((c) => c.itemId !== null && !c.sandLocked);

  for (const src of unlockedCells) {
    for (const target of board) {
      if (target.index !== src.index && target.sandLocked && canMergeItems(src.itemId, target.itemId)) {
        return [src.index, target.index];
      }
    }
  }

  for (let i = 0; i < unlockedCells.length; i++) {
    for (let j = i + 1; j < unlockedCells.length; j++) {
      if (canMergeItems(unlockedCells[i].itemId, unlockedCells[j].itemId)) {
        return [unlockedCells[i].index, unlockedCells[j].index];
      }
    }
  }

  return null;
}

export function sellBoardItem(state: GameState, cellIndex: number): GameState {
  const cell = state.board[cellIndex];
  if (!cell || !cell.itemId || cell.sandLocked) return state;
  const def = ITEM_CATALOG[cell.itemId];
  if (!def || def.isGenerator) return state;

  const nextBoard = state.board.map((c, idx) =>
    idx === cellIndex ? { ...c, itemId: null } : c
  );

  return {
    ...state,
    board: nextBoard,
    coins: state.coins + def.sellValue,
    selectedCellIndex: null,
  };
}

export function findCellsForOrder(board: BoardCell[], requiredItemIds: string[]): number[] | null {
  const usedIndices: number[] = [];
  for (const reqId of requiredItemIds) {
    const match = board.find(
      (c) => !c.sandLocked && c.itemId === reqId && !usedIndices.includes(c.index)
    );
    if (!match) return null;
    usedIndices.push(match.index);
  }
  return usedIndices;
}

export function fulfillCustomerOrder(
  state: GameState,
  orderId: string,
  season: Season | null = null
): { state: GameState; fulfilled: boolean; spawnedChest?: boolean } {
  const order = state.activeOrders.find((o) => o.id === orderId);
  if (!order) return { state, fulfilled: false };

  const matchedIndices = findCellsForOrder(state.board, order.requiredItemIds);
  if (!matchedIndices) return { state, fulfilled: false };

  const prestigeBonus = state.renovationZones.reduce(
    (sum, z) => sum + (z.unlockedLevel > 0 ? z.coinBonusPerOrder * z.unlockedLevel : 0),
    0
  );

  let nextBoard = state.board.map((cell) =>
    matchedIndices.includes(cell.index) ? { ...cell, itemId: null } : cell
  );

  // If VIP Rush Order, drop a Majlis Hospitality Chest (chest_1) onto the freed cell!
  let spawnedChest = false;
  if (order.isVip && matchedIndices.length > 0) {
    const dropCellIdx = matchedIndices[0];
    nextBoard = nextBoard.map((c, idx) =>
      idx === dropCellIdx ? { ...c, itemId: 'chest_1' } : c
    );
    spawnedChest = true;
  }

  const remaining = { ...state, activeOrders: state.activeOrders.filter((o) => o.id !== orderId) };
  const generated = generateOrder(remaining);
  const nextOrders = state.activeOrders.map((o) => (o.id === orderId ? generated.order : o));
  const newXp = state.xp + order.rewardXp;
  const vipGemBonus = order.isVip ? 10 : 0;

  return {
    state: {
      ...state,
      board: nextBoard,
      coins: state.coins + Math.round((order.rewardCoins + prestigeBonus + 8 * (state.areaIndex ?? 0)) * (season ? season.coinMultiplier : 1)),
      rngSeed: generated.seed,
      stars: state.stars + order.rewardStars,
      diamonds: state.diamonds + vipGemBonus,
      xp: newXp,
      level: getLevelFromXp(newXp),
      ordersCompleted: state.ordersCompleted + 1,
      prestigePoints:
        state.prestigePoints + Math.round((order.isVip ? 55 : 35) * (season ? season.prestigeMultiplier : 1)),
      liveOpsPoints: state.liveOpsPoints + (order.isVip ? 25 : 15),
      activeOrders: nextOrders,
      selectedCellIndex: null,
    },
    fulfilled: true,
    spawnedChest,
  };
}

export function upgradeRenovationZone(
  state: GameState,
  zoneId: string,
  styleIndex?: number
): { state: GameState; upgraded: boolean; triggeredStoryId: string | null } {
  const zone = state.renovationZones.find((z) => z.id === zoneId);
  if (!zone) return { state, upgraded: false, triggeredStoryId: null };

  if (styleIndex !== undefined && zone.unlockedLevel > 0 && zone.selectedStyle !== styleIndex) {
    const cost = styleChangeCost(state);
    if (state.coins < cost) return { state, upgraded: false, triggeredStoryId: null };
    return {
      state: {
        ...state,
        coins: state.coins - cost,
        renovationZones: state.renovationZones.map((z) =>
          z.id === zoneId ? { ...z, selectedStyle: styleIndex } : z
        ),
      },
      upgraded: true,
      triggeredStoryId: null,
    };
  }

  if (zone.unlockedLevel >= 2) {
    return { state, upgraded: false, triggeredStoryId: null };
  }

  const cost = zone.unlockedLevel === 0 ? zone.starCostLevel1 : zone.starCostLevel2;
  if (state.stars < cost) {
    return { state, upgraded: false, triggeredStoryId: null };
  }

  const nextLevel = zone.unlockedLevel + 1;
  const storyChap = zone.storyChapterIndex >= 0 ? STORY_CHAPTERS[zone.storyChapterIndex] : undefined;
  const triggeredStoryId =
    storyChap && !state.completedStoryIds.includes(storyChap.id) ? storyChap.id : null;

  return {
    state: {
      ...state,
      stars: state.stars - cost,
      xp: state.xp + 40,
      level: getLevelFromXp(state.xp + 40),
      prestigePoints: state.prestigePoints + 60,
      pourTokens: state.pourTokens + 1,
      wingUpgrades: (state.wingUpgrades ?? 0) + 1,
      liveOpsPoints: state.liveOpsPoints + 25,
      activeStoryId: triggeredStoryId || state.activeStoryId,
      renovationZones: state.renovationZones.map((z) =>
        z.id === zoneId
          ? {
              ...z,
              unlockedLevel: nextLevel,
              selectedStyle: styleIndex !== undefined ? styleIndex : z.selectedStyle,
            }
          : z
      ),
    },
    upgraded: true,
    triggeredStoryId,
  };
}

// ---------------------------------------------------------------------------
// Daily Login Streak ("Ghabga Al-Yawm") & First-Run Coaching
// ---------------------------------------------------------------------------

export interface DailyReward {
  day: number;
  energy: number;
  coins: number;
  gems: number;
  scissors: number;
  joker: number;
  freeSpins: number;
  chest: boolean;
}

export const DAILY_LOGIN_REWARDS: DailyReward[] = [
  { day: 1, energy: 20, coins: 0, gems: 0, scissors: 0, joker: 0, freeSpins: 0, chest: false },
  { day: 2, energy: 0, coins: 100, gems: 0, scissors: 0, joker: 0, freeSpins: 0, chest: false },
  { day: 3, energy: 0, coins: 0, gems: 10, scissors: 0, joker: 0, freeSpins: 0, chest: false },
  { day: 4, energy: 25, coins: 0, gems: 0, scissors: 1, joker: 0, freeSpins: 0, chest: false },
  { day: 5, energy: 0, coins: 150, gems: 0, scissors: 0, joker: 1, freeSpins: 0, chest: false },
  { day: 6, energy: 0, coins: 0, gems: 20, scissors: 0, joker: 0, freeSpins: 1, chest: false },
  { day: 7, energy: 0, coins: 0, gems: 30, scissors: 0, joker: 0, freeSpins: 0, chest: true },
];

export function dayKeyFromDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysBetweenKeys(fromKey: string, toKey: string): number {
  const a = Date.parse(`${fromKey}T00:00:00Z`);
  const b = Date.parse(`${toKey}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** Streak day (1..7) the player would be on if they claimed today, or null if already claimed. */
export function getDailyLoginDay(state: GameState, todayKey: string): number | null {
  if (state.lastLoginDay === todayKey) return null;
  const gap = state.lastLoginDay ? daysBetweenKeys(state.lastLoginDay, todayKey) : Infinity;
  if (gap < 0) return null; // clock moved backwards: never pay twice
  const streak = gap === 1 ? state.loginStreak + 1 : 1;
  return ((streak - 1) % DAILY_LOGIN_REWARDS.length) + 1;
}

export function claimDailyLoginReward(
  state: GameState,
  todayKey: string
): { state: GameState; claimed: boolean; reward: DailyReward | null; day: number } {
  const day = getDailyLoginDay(state, todayKey);
  if (day === null) return { state, claimed: false, reward: null, day: state.loginStreak };
  const reward = DAILY_LOGIN_REWARDS[day - 1];
  const gap = state.lastLoginDay ? daysBetweenKeys(state.lastLoginDay, todayKey) : Infinity;
  const streak = gap === 1 ? state.loginStreak + 1 : 1;

  let board = state.board;
  let bonusCoins = 0;
  if (reward.chest) {
    const emptyIdx = findNearestEmptyCell(board, 24);
    if (emptyIdx !== null) {
      board = board.map((c, i) => (i === emptyIdx ? { ...c, itemId: 'chest_2' } : c));
    } else {
      bonusCoins = 180; // board full: pay out the chest's coins instead of losing it
    }
  }

  return {
    state: {
      ...state,
      board,
      loginStreak: streak,
      lastLoginDay: todayKey,
      energy: state.energy + reward.energy,
      coins: state.coins + reward.coins + bonusCoins,
      diamonds: state.diamonds + reward.gems,
      scissorsCount: state.scissorsCount + reward.scissors,
      jokerCount: state.jokerCount + reward.joker,
      freeSpinsAvailable: state.freeSpinsAvailable + reward.freeSpins,
    },
    claimed: true,
    reward,
    day,
  };
}

export type TutorialStep = 'merge' | 'serve' | null;

export function getTutorialStep(state: GameState): TutorialStep {
  if (state.tutorialDismissed) return null;
  if (state.totalMerges === 0) return 'merge';
  if (state.ordersCompleted === 0) return 'serve';
  return null;
}

// ---------------------------------------------------------------------------
// Saudi Cultural Calendar LiveOps
// ---------------------------------------------------------------------------

export interface Season {
  id: 'founding_day' | 'national_day' | 'ramadan' | 'eid';
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  coinMultiplier: number;
  prestigeMultiplier: number;
}

export const SEASONS: Record<Season['id'], Season> = {
  founding_day: {
    id: 'founding_day',
    nameAr: 'يوم التأسيس',
    nameEn: 'Founding Day',
    descAr: 'ريالات الطلبات ×1.5 وهيبة مضاعفة احتفالاً بالدرعية',
    descEn: 'Order SAR x1.5 and double prestige celebrating Diriyah',
    coinMultiplier: 1.5,
    prestigeMultiplier: 2,
  },
  national_day: {
    id: 'national_day',
    nameAr: 'اليوم الوطني',
    nameEn: 'Saudi National Day',
    descAr: 'ريالات الطلبات ×1.5 وهيبة مضاعفة · الأخضر يعلو',
    descEn: 'Order SAR x1.5 and double prestige · the green rises',
    coinMultiplier: 1.5,
    prestigeMultiplier: 2,
  },
  ramadan: {
    id: 'ramadan',
    nameAr: 'غبقات رمضان',
    nameEn: 'Ramadan Ghabga Nights',
    descAr: 'ريالات الطلبات ×1.25 وهيبة ×1.5 على موائد الغبقة',
    descEn: 'Order SAR x1.25 and prestige x1.5 at the Ghabga tables',
    coinMultiplier: 1.25,
    prestigeMultiplier: 1.5,
  },
  eid: {
    id: 'eid',
    nameAr: 'أيام العيد',
    nameEn: 'Eid Days',
    descAr: 'ريالات الطلبات ×2 في ضيافة العيد',
    descEn: 'Order SAR x2 for Eid hospitality',
    coinMultiplier: 2,
    prestigeMultiplier: 1.5,
  },
};

export function getActiveSeason(date: Date): Season | null {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (month === 2 && day >= 21 && day <= 23) return SEASONS.founding_day;
  if (month === 9 && day >= 22 && day <= 24) return SEASONS.national_day;
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(date);
    const hijriMonth = Number(parts.find((p) => p.type === 'month')?.value);
    const hijriDay = Number(parts.find((p) => p.type === 'day')?.value);
    if (hijriMonth === 9) return SEASONS.ramadan;
    if (hijriMonth === 10 && hijriDay <= 3) return SEASONS.eid;
  } catch {
    // Intl calendar unavailable: fall back to fixed Gregorian seasons only
  }
  return null;
}

// ---------------------------------------------------------------------------
// "Rub'a al-Finjan" Pouring Mini-Game
// ---------------------------------------------------------------------------

export type PourGrade = 'perfect' | 'good' | 'short' | 'overflow';

/** Tradition: a host pours only a quarter of the finjan, so refills show generosity. */
export const POUR_TARGET_PERCENT = 25;
export const POUR_PERFECT_TOLERANCE = 4;
export const POUR_GOOD_TOLERANCE = 10;

export function gradePour(fillPercent: number): PourGrade {
  const off = Math.abs(fillPercent - POUR_TARGET_PERCENT);
  if (off <= POUR_PERFECT_TOLERANCE) return 'perfect';
  if (off <= POUR_GOOD_TOLERANCE) return 'good';
  return fillPercent < POUR_TARGET_PERCENT ? 'short' : 'overflow';
}

export const POUR_REWARDS: Record<PourGrade, { coins: number; gems: number; joker: number }> = {
  perfect: { coins: 100, gems: 8, joker: 1 },
  good: { coins: 50, gems: 3, joker: 0 },
  short: { coins: 20, gems: 0, joker: 0 },
  overflow: { coins: 20, gems: 0, joker: 0 },
};

export function completePour(
  state: GameState,
  fillPercent: number
): { state: GameState; poured: boolean; grade: PourGrade | null } {
  if (state.pourTokens <= 0) return { state, poured: false, grade: null };
  const grade = gradePour(fillPercent);
  const reward = POUR_REWARDS[grade];
  return {
    state: {
      ...state,
      pourTokens: state.pourTokens - 1,
      coins: state.coins + reward.coins,
      diamonds: state.diamonds + reward.gems,
      jokerCount: state.jokerCount + reward.joker,
      prestigePoints: state.prestigePoints + (grade === 'perfect' ? 20 : 5),
    },
    poured: true,
    grade,
  };
}

// ---------------------------------------------------------------------------
// High-Level Merge Particle Burst & Radial Shockwave Generator
// ---------------------------------------------------------------------------

export type MergeBurstTier = 'standard' | 'epic' | 'royal' | 'masterpiece';
export type MergeParticleShape = 'star8' | 'diamond' | 'spark' | 'orb';

export interface MergeParticle {
  id: number;
  dxPx: number;
  dyPx: number;
  sizePx: number;
  delayMs: number;
  durationMs: number;
  color: string;
  shape: MergeParticleShape;
  rotationDeg: number;
}

export interface MergeParticleBurst {
  id: string;
  cellIndex: number;
  row: number;
  col: number;
  xPercent: number;
  yPercent: number;
  itemId: string;
  level: number;
  maxLevel: number;
  chain: ChainId | 'generator';
  tier: MergeBurstTier;
  isHighLevel: boolean;
  isMaxLevel: boolean;
  megaMerge: boolean;
  comboCount: number;
  ringCount: number;
  primaryColor: string;
  secondaryColor: string;
  calloutAr: string;
  calloutEn: string;
  itemNameAr: string;
  itemNameEn: string;
  xpGained: number;
  particles: MergeParticle[];
}

const CHAIN_PARTICLE_PALETTES: Record<ChainId | 'generator', string[]> = {
  qahwa: ['#F59E0B', '#FDE047', '#D97706', '#10B981', '#FFFBEB'],
  barista: ['#38BDF8', '#FBBF24', '#0284C7', '#A7F3D0', '#FFFDF9'],
  sweets: ['#EC4899', '#F59E0B', '#FDE047', '#A855F7', '#FFF1F2'],
  oud: ['#A855F7', '#FBBF24', '#EC4899', '#DDD6FE', '#FEF08A'],
  chest: ['#FBBF24', '#FDE047', '#10B981', '#38BDF8', '#FFFFFF'],
  generator: ['#F59E0B', '#FDE047', '#D97706', '#FFFBEB'],
};

const PARTICLE_SHAPES: MergeParticleShape[] = ['star8', 'diamond', 'spark', 'orb'];

export function buildMergeParticleBurst(
  cellIndex: number,
  mergedItemId: string,
  burstSeq: number = 1,
  options?: { megaMerge?: boolean; comboCount?: number }
): MergeParticleBurst {
  const safeIndex = Math.max(0, Math.min(48, cellIndex));
  const row = Math.floor(safeIndex / 7);
  const col = safeIndex % 7;
  const xPercent = ((col + 0.5) / 7) * 100;
  const yPercent = ((row + 0.5) / 7) * 100;

  const itemDef = ITEM_CATALOG[mergedItemId] ?? ITEM_CATALOG.qahwa_2;
  const isMaxLevel = itemDef.level >= itemDef.maxLevel;
  const megaMerge = Boolean(options?.megaMerge);
  const comboCount = options?.comboCount ?? 1;

  let tier: MergeBurstTier = 'standard';
  if (isMaxLevel || itemDef.level >= 5) {
    tier = 'masterpiece';
  } else if (itemDef.level === 4 || megaMerge) {
    tier = 'royal';
  } else if (itemDef.level === 3) {
    tier = 'epic';
  }

  const isHighLevel = tier !== 'standard';
  const ringCount = tier === 'masterpiece' ? 3 : tier === 'royal' ? 3 : tier === 'epic' ? 2 : 1;
  const particleCount =
    tier === 'masterpiece' ? 36 : tier === 'royal' ? 28 : tier === 'epic' ? 20 : 12;

  const palette = CHAIN_PARTICLE_PALETTES[itemDef.chain] || CHAIN_PARTICLE_PALETTES.qahwa;
  const baseRadius =
    tier === 'masterpiece' ? 128 : tier === 'royal' ? 102 : tier === 'epic' ? 78 : 48;

  const particles: MergeParticle[] = [];
  for (let i = 0; i < particleCount; i++) {
    // Deterministic golden-angle + ring layering for lush, balanced 360-degree bursts
    const ringLayer = i % 3; // 0 = inner, 1 = mid, 2 = outer
    const angleFraction = i / particleCount;
    const jitterDeg = ((i * 37 + burstSeq * 19) % 16) - 8;
    const angleDeg = angleFraction * 360 + jitterDeg;
    const angleRad = (angleDeg * Math.PI) / 180;

    const layerScale = ringLayer === 0 ? 0.55 : ringLayer === 1 ? 0.85 : 1.15;
    const distJitter = ((i * 23) % 18) - 9;
    const distance = Math.max(28, baseRadius * layerScale + distJitter);

    // Slight upward celebratory lift on y-axis
    const dxPx = Math.round(Math.cos(angleRad) * distance);
    const dyPx = Math.round(Math.sin(angleRad) * distance - (isHighLevel ? 8 : 3));

    const sizeBase =
      tier === 'masterpiece' ? 13 : tier === 'royal' ? 11 : tier === 'epic' ? 10 : 7;
    const sizePx = sizeBase + ((i * 5) % 6) - (ringLayer === 2 ? 1 : 0);

    const delayMs = ringLayer * 28 + ((i * 11) % 35);
    const durationMs =
      (tier === 'masterpiece' ? 1320 : tier === 'royal' ? 1180 : tier === 'epic' ? 1040 : 680) +
      ((i * 29) % 220);

    const color = palette[i % palette.length];
    const shape =
      isHighLevel && i % 3 === 0
        ? 'star8'
        : PARTICLE_SHAPES[(i + (isHighLevel ? 0 : 1)) % PARTICLE_SHAPES.length];
    const rotationDeg = (i * 55 + 45) % 360;

    particles.push({
      id: i,
      dxPx,
      dyPx,
      sizePx,
      delayMs,
      durationMs,
      color,
      shape,
      rotationDeg,
    });
  }

  const calloutAr =
    tier === 'masterpiece'
      ? 'تحفة الديوان الملكي! ✨'
      : tier === 'royal'
      ? megaMerge
        ? 'دمج ثلاثي خارق! 🌟'
        : 'إبداع ملكي فاخر! 🌟'
      : tier === 'epic'
      ? 'دمج متقن! ⚡'
      : 'دمج رائع!';

  const calloutEn =
    tier === 'masterpiece'
      ? 'ROYAL MASTERPIECE! ✨'
      : tier === 'royal'
      ? megaMerge
        ? 'TRIPLE MEGA MERGE! 🌟'
        : 'ROYAL HIGH-LEVEL MERGE! 🌟'
      : tier === 'epic'
      ? 'GREAT MERGE! ⚡'
      : 'Nice Merge!';

  return {
    id: `burst_${burstSeq}_${safeIndex}_${mergedItemId}`,
    cellIndex: safeIndex,
    row,
    col,
    xPercent,
    yPercent,
    itemId: mergedItemId,
    level: itemDef.level,
    maxLevel: itemDef.maxLevel,
    chain: itemDef.chain,
    tier,
    isHighLevel,
    isMaxLevel,
    megaMerge,
    comboCount,
    ringCount,
    primaryColor: palette[0],
    secondaryColor: palette[1],
    calloutAr,
    calloutEn,
    itemNameAr: itemDef.nameAr,
    itemNameEn: itemDef.nameEn,
    xpGained: itemDef.mergeXp,
    particles,
  };
}


/** Move to the next renovation area when the current one is complete (see progression.ts). */
export const advanceArea = _advanceArea;
