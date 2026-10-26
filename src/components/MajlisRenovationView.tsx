import React from 'react';
import { Star, Check, CloudRain, Moon, Sun, MapPin, Lock, Plane, Coins, Gem, Zap } from 'lucide-react';
import {
  Language,
  MajlisAmbiance,
  MajlisRegion,
  RenovationZone,
  STORY_CHAPTERS,
  StoryChapter,
} from '../game/rules';
import { AREA_COUNT_BEFORE_PRESTIGE, AREA_REWARD, areaChapterId, areaInfo, findStoryChapter } from '../game/progression';
import { speakerCharacter } from '../game/voiceLines';
import { PAINTED_STAGES, restorationStage } from '../game/majlisStages';
import { assetUrl } from '../utils/assetUrl';

interface MajlisRenovationViewProps {
  lang: Language;
  zones: RenovationZone[];
  stars: number;
  activeRegion: MajlisRegion;
  ambiance: MajlisAmbiance;
  completedStoryIds: string[];
  areaIndex: number;
  areaComplete: boolean;
  styleCost: number;
  coins: number;
  onUpgradeZone: (zoneId: string, styleIndex?: number) => void;
  onAdvanceArea: () => void;
  onChangeAmbiance: (ambiance: MajlisAmbiance) => void;
  onOpenStory: (storyId: string) => void;
}

/** "Chapter 2: Threads of Najdi Sadu" -> "Threads of Najdi Sadu". */
const shortTitle = (t: string) => t.replace(/^[^:：]{1,40}[:：]\s*/, '');

/** A small "next episode" teaser: the speaker's painted face, the episode number and title. */
const EpisodeTeaser: React.FC<{ chapter: StoryChapter; isAr: boolean; locked: boolean }> = ({ chapter, isAr, locked }) => {
  const who = speakerCharacter(chapter.speakerEn);
  return (
    <div className="flex items-center gap-2 rounded-lg bg-[#D99B26]/10 border border-[#D99B26]/25 px-2 py-1.5" data-testid={`teaser-${chapter.id}`}>
      {who && <img src={assetUrl(`assets/art/avatars/${who}.webp`)} alt="" loading="lazy" className="w-8 h-8 rounded-full object-cover border border-[#D99B26]/60 shrink-0" />}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-[10px] font-bold text-[#FBBF24]">
          {locked && <Lock className="w-3 h-3" />}
          {locked ? (isAr ? `رمّم لتفتح الحلقة ${chapter.chapterNumber}` : `Restore to unlock Episode ${chapter.chapterNumber}`) : isAr ? `الحلقة ${chapter.chapterNumber}` : `Episode ${chapter.chapterNumber}`}
        </span>
        <span className="block text-xs font-semibold text-[#FBF7F0] truncate">{shortTitle(isAr ? chapter.titleAr : chapter.titleEn)}</span>
      </span>
    </div>
  );
};

/**
 * Painted restoration banner (docs/ART_BATCH_4.md): shows the stage for the current progress and crossfades from the
 * previous one when a wing is restored. Only the current and previous stages are loaded.
 */
const MajlisStageBanner: React.FC<{ areaId: string; stage: number; stages: number; isAr: boolean }> = ({ areaId, stage, stages, isAr }) => {
  const [shown, setShown] = React.useState({ current: stage, previous: stage });
  React.useEffect(() => {
    setShown((s) => (s.current === stage ? s : { current: stage, previous: s.current }));
  }, [stage]);
  const src = (n: number) => assetUrl(`assets/art/majlis/${areaId}_${n}.webp`);
  return (
    <div className="relative w-full aspect-video bg-[#2A1B12] overflow-hidden" data-testid="majlis-stage" data-stage={stage}>
      {shown.previous !== shown.current && <img src={src(shown.previous)} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      <img
        key={shown.current}
        src={src(shown.current)}
        alt={isAr ? `مرحلة الترميم ${stage} من ${stages}` : `Restoration stage ${stage} of ${stages}`}
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover animate-[stage-in_1.2s_ease-out_both]"
      />
    </div>
  );
};

export const MajlisRenovationView: React.FC<MajlisRenovationViewProps> = ({
  lang,
  zones,
  stars,
  activeRegion,
  ambiance,
  areaIndex,
  areaComplete,
  styleCost,
  coins,
  onUpgradeZone,
  onAdvanceArea,
  onChangeAmbiance,
  onOpenStory,
}) => {
  const isAr = lang === 'ar';

  // Later areas use generated wing ids, so fall back to wing order for the diorama slots.
  const archZone = zones.find((z) => z.id === 'zone_arch') ?? zones[0];
  const saduZone = zones.find((z) => z.id === 'zone_sadu') ?? zones[1] ?? zones[0];
  const barZone = zones.find((z) => z.id === 'zone_bar') ?? zones[2] ?? zones[0];
  const courtZone = zones.find((z) => z.id === 'zone_courtyard') ?? zones[3] ?? zones[0];
  const swatch = (z: RenovationZone, fallback = '#8B5A2B') => z.styles[z.selectedStyle]?.swatch ?? fallback;

  const area = areaInfo(areaIndex);
  const nextArea = areaInfo(areaIndex + 1);
  const nextChapter = findStoryChapter(areaChapterId(areaIndex + 1));
  const paintedStages = PAINTED_STAGES[area.id] ?? 0;
  const stage = restorationStage(
    zones.reduce((n, z) => n + z.unlockedLevel, 0),
    zones.length * 2,
    paintedStages
  );
  const lapStart = area.lap * AREA_COUNT_BEFORE_PRESTIGE;
  const journey = Array.from({ length: AREA_COUNT_BEFORE_PRESTIGE }, (_, i) => ({ index: lapStart + i, ...areaInfo(lapStart + i) }));

  const totalLevels = zones.reduce((acc, z) => acc + z.unlockedLevel, 0);
  const maxLevels = zones.length * 2;
  const prestigePercent = Math.round((totalLevels / maxLevels) * 100);

  const ambiances: { id: MajlisAmbiance; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    {
      id: 'afternoon',
      labelAr: 'عصاري نجد',
      labelEn: 'Golden Afternoon',
      icon: <Sun className="w-3.5 h-3.5 text-[#FBBF24]" />,
    },
    {
      id: 'ramadan_night',
      labelAr: 'ليالي الفوانيس',
      labelEn: 'Lantern Night',
      icon: <Moon className="w-3.5 h-3.5 text-[#38BDF8]" />,
    },
    {
      id: 'courtyard_rain',
      labelAr: 'مطر الحوش',
      labelEn: 'Courtyard Rain',
      icon: <CloudRain className="w-3.5 h-3.5 text-[#60A5FA]" />,
    },
  ];

  const skyGradient =
    ambiance === 'afternoon'
      ? 'from-[#7C2D12] via-[#B45309] to-[#451A03]'
      : ambiance === 'courtyard_rain'
      ? 'from-[#0F172A] via-[#1E293B] to-[#1C1917]'
      : 'from-[#0F172A] via-[#1E1B2E] to-[#2A1B12]';

  return (
    <div className="flex flex-col gap-4">
      {/* Multi-Location Kingdom Map & Weather Ambiance Bar */}
      <div className="rounded-2xl border border-[#D99B26]/35 bg-[#241812] p-3 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Restoration journey across the Kingdom: finished, current and locked areas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5" data-testid="area-journey">
          <span className="text-xs font-bold text-[#E9C46A] inline-flex items-center gap-1 shrink-0 px-1">
            <MapPin className="w-3.5 h-3.5 text-[#FBBF24]" />
            {isAr ? 'رحلة المملكة:' : 'Kingdom trail:'}
          </span>
          {journey.map((stop) => {
            const done = stop.index < areaIndex;
            const current = stop.index === areaIndex;
            return (
              <span
                key={stop.index}
                aria-current={current ? 'step' : undefined}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border inline-flex items-center gap-1 ${
                  current
                    ? 'bg-[#D97724] text-white border-[#FBBF24] shadow'
                    : done
                    ? 'bg-[#14532D]/60 text-[#BBF7D0] border-[#34D399]/40'
                    : 'bg-[#1C1410] text-[#D4A373]/60 border-white/10'
                }`}
              >
                {done ? <Check className="w-3 h-3" /> : !current && <Lock className="w-3 h-3" />}
                {isAr ? stop.nameAr : stop.nameEn}
              </span>
            );
          })}
        </div>

        {/* Dynamic Weather & Ambiance Toggle */}
        <div className="flex items-center gap-1.5 self-end lg:self-auto">
          <span className="text-[11px] text-[#D4A373] me-1">
            {isAr ? 'أجواء الحوش:' : 'Ambiance:'}
          </span>
          {ambiances.map((a) => {
            const active = ambiance === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onChangeAmbiance(a.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#2E1E16] border-[#FBBF24] text-[#FBF7F0]'
                    : 'bg-[#1C1410] border-white/10 text-[#D4A373] hover:text-white'
                }`}
              >
                {a.icon}
                <span>{isAr ? a.labelAr : a.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Architectural Diorama of the Selected Saudi Region & Ambiance */}
      <div className="relative rounded-2xl border border-[#D99B26]/35 bg-[#19110D] overflow-hidden shadow-xl">
        {/* Top Prestige Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#241812]/95 border-b border-[#D99B26]/20">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#FBF7F0]" data-testid="area-name">
              {isAr ? `${area.nameAr} · المنطقة ${areaIndex + 1}` : `${area.nameEn} · Area ${areaIndex + 1}`}
            </h2>
            <p className="text-xs text-[#D4A373]">
              {isAr
                ? `نسبة الإعمار الملكي: ${prestigePercent}% · مكافأة الطلبات +${zones.reduce((s, z) => s + z.unlockedLevel * z.coinBonusPerOrder, 0)} ريال`
                : `Estate Restoration: ${prestigePercent}% · Order Bonus +${zones.reduce((s, z) => s + z.unlockedLevel * z.coinBonusPerOrder, 0)} SAR`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs tabular-nums font-bold px-2.5 py-1 rounded-lg bg-[#D99B26]/20 text-[#FBBF24] border border-[#D99B26]/40">
              <Star className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" />
              <span>{stars} {isAr ? 'نجمة متاحة' : 'Stars Ready'}</span>
            </span>
          </div>
        </div>

        {/* Live SVG Isometric/Diorama Scene that visually transforms by Region, Ambiance & Upgrades */}
        {paintedStages ? (
          <MajlisStageBanner areaId={area.id} stage={stage} stages={paintedStages} isAr={isAr} />
        ) : (
        <div className={`relative w-full h-56 sm:h-64 bg-gradient-to-b ${skyGradient} flex items-center justify-center overflow-hidden`}>
          <svg viewBox="0 0 800 320" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Sky Celestial Body (Afternoon Sun vs Crescent Moon vs Rain Clouds) */}
            {ambiance === 'afternoon' ? (
              <circle cx="680" cy="60" r="34" fill="#FBBF24" opacity="0.9" />
            ) : (
              <g>
                <circle cx="680" cy="56" r="28" fill="#FDE68A" opacity="0.9" />
                <circle cx="692" cy="48" r="24" fill="#131629" />
                <circle cx="120" cy="45" r="2" fill="#FBF7F0" opacity="0.7" />
                <circle cx="240" cy="30" r="1.5" fill="#FBF7F0" opacity="0.5" />
                <circle cx="420" cy="50" r="2" fill="#FDE68A" opacity="0.8" />
                <circle cx="550" cy="28" r="1.8" fill="#FBF7F0" opacity="0.6" />
              </g>
            )}

            {/* Landmark horizon for the current area, so every stop on the trail is recognisable */}
            <AreaSkyline areaId={area.id} />

            {/* Courtyard Floor */}
            <polygon points="0,240 800,240 800,320 0,320" fill="#3B281E" />
            <line x1="0" y1="240" x2="800" y2="240" stroke="#D99B26" strokeWidth="2" opacity="0.5" />

            {/* ZONE 1: Architectural Facade (Left-Center) */}
            <g opacity={archZone.unlockedLevel > 0 ? 1 : 0.45}>
              <rect
                x="40"
                y="70"
                width="210"
                height="170"
                fill={swatch(archZone)}
                stroke="#2A180D"
                strokeWidth="3"
              />
              {/* Najdi White Crenellations OR Hijazi Rawasheen Lattice */}
              {activeRegion === 'jeddah' ? (
                <g>
                  <rect x="55" y="82" width="180" height="48" rx="4" fill="#78350F" stroke="#FBBF24" strokeWidth="2" />
                  <line x1="55" y1="106" x2="235" y2="106" stroke="#FDE68A" strokeWidth="1.5" />
                </g>
              ) : (
                <polygon
                  points="40,70 55,52 70,70 85,52 100,70 115,52 130,70 145,52 160,70 175,52 190,70 205,52 220,70 235,52 250,70"
                  fill="#FBF7F0"
                />
              )}
              {/* Triangular Najdi Windows */}
              <polygon points="75,105 85,88 95,105" fill="#1C1410" />
              <polygon points="135,105 145,88 155,105" fill="#1C1410" />
              <polygon points="195,105 205,88 215,105" fill="#1C1410" />
              {/* Carved Tamarisk Door */}
              <path
                d="M110,240 L110,150 Q145,125 180,150 L180,240 Z"
                fill="#5C3A21"
                stroke="#FBBF24"
                strokeWidth={archZone.unlockedLevel === 2 ? '3' : '1.5'}
              />
              {archZone.unlockedLevel === 2 && (
                <circle cx="145" cy="185" r="8" fill="#FBBF24" />
              )}
            </g>

            {/* ZONE 2: Sadu Majlis & Brass Hearth (Center-Right) */}
            <g opacity={saduZone.unlockedLevel > 0 ? 1 : 0.35}>
              <rect
                x="275"
                y="185"
                width="240"
                height="55"
                rx="6"
                fill={saduZone.unlockedLevel > 0 ? swatch(saduZone) : '#334155'}
                stroke="#2A180D"
                strokeWidth="2.5"
              />
              <line x1="280" y1="212" x2="510" y2="212" stroke="#FBBF24" strokeWidth="4" strokeDasharray="10 6" />
              <rect x="290" y="155" width="60" height="32" rx="5" fill="#9E2A2B" stroke="#FBBF24" strokeWidth="1.5" />
              <rect x="365" y="155" width="60" height="32" rx="5" fill="#9E2A2B" stroke="#FBBF24" strokeWidth="1.5" />
              <rect x="440" y="155" width="60" height="32" rx="5" fill="#9E2A2B" stroke="#FBBF24" strokeWidth="1.5" />
              {saduZone.unlockedLevel >= 1 && (
                <g>
                  <rect x="370" y="232" width="50" height="22" rx="3" fill="#D99B26" stroke="#2A180D" strokeWidth="2" />
                  <path d="M388,210 L402,210 L405,232 L385,232 Z" fill="#FBBF24" stroke="#2A180D" strokeWidth="1.5" />
                </g>
              )}
            </g>

            {/* ZONE 3: Specialty V60 & Espresso Bar (Right Side) */}
            <g opacity={barZone.unlockedLevel > 0 ? 1 : 0.35}>
              <rect
                x="545"
                y="120"
                width="215"
                height="120"
                rx="8"
                fill="#241812"
                stroke={barZone.unlockedLevel > 0 ? swatch(barZone) : '#475569'}
                strokeWidth="3"
              />
              <rect
                x="535"
                y="185"
                width="235"
                height="55"
                rx="4"
                fill={barZone.unlockedLevel > 0 ? swatch(barZone) : '#475569'}
                stroke="#1C1410"
                strokeWidth="2"
              />
              {barZone.unlockedLevel >= 1 && (
                <g>
                  <rect x="570" y="145" width="55" height="40" rx="4" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2" />
                  <circle cx="597" cy="160" r="6" fill="#D97724" />
                  <polygon points="655,155 685,155 675,185 665,185" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
                  <text x="652" y="142" fill="#FBBF24" fontSize="13" fontWeight="bold">
                    QAHWA LAB
                  </text>
                </g>
              )}
            </g>

            {/* ZONE 4: Courtyard Fountain & Ghabga Lanterns */}
            <g opacity={courtZone.unlockedLevel > 0 ? 1 : 0.3}>
              <line x1="290" y1="0" x2="290" y2="55" stroke="#D99B26" strokeWidth="2" />
              <polygon points="280,55 300,55 295,82 285,82" fill={courtZone.unlockedLevel > 0 ? '#FBBF24' : '#64748B'} />
              <line x1="410" y1="0" x2="410" y2="45" stroke="#D99B26" strokeWidth="2" />
              <polygon points="400,45 420,45 415,72 405,72" fill={courtZone.unlockedLevel > 0 ? '#FBBF24' : '#64748B'} />
              <line x1="510" y1="0" x2="510" y2="60" stroke="#D99B26" strokeWidth="2" />
              <polygon points="500,60 520,60 515,87 505,87" fill={courtZone.unlockedLevel > 0 ? '#FBBF24' : '#64748B'} />

              <ellipse
                cx="210"
                cy="282"
                rx="68"
                ry="22"
                fill={courtZone.unlockedLevel > 0 ? swatch(courtZone) : '#334155'}
                stroke="#FBBF24"
                strokeWidth="3"
              />
              {courtZone.unlockedLevel >= 1 && (
                <path
                  d="M210,280 Q195,245 180,268 M210,280 Q225,245 240,268 M210,280 L210,242"
                  stroke="#E0F2FE"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
            </g>

            {/* Courtyard Rain Effect Overlay when ambiance === 'courtyard_rain' */}
            {ambiance === 'courtyard_rain' && (
              <g stroke="#93C5FD" strokeWidth="1.8" strokeLinecap="round" opacity="0.65">
                <line x1="90" y1="20" x2="75" y2="55" />
                <line x1="190" y1="45" x2="175" y2="80" />
                <line x1="310" y1="25" x2="295" y2="60" />
                <line x1="440" y1="60" x2="425" y2="95" />
                <line x1="560" y1="30" x2="545" y2="65" />
                <line x1="690" y1="50" x2="675" y2="85" />
                <line x1="150" y1="140" x2="135" y2="175" />
                <line x1="350" y1="130" x2="335" y2="165" />
                <line x1="610" y1="145" x2="595" y2="180" />
              </g>
            )}
          </svg>
        </div>
        )}
      </div>

      {areaComplete && (
        <div data-testid="advance-area" className="rounded-2xl border-2 border-[#34D399] bg-gradient-to-r from-[#064E3B] to-[#065F46] p-4 flex flex-col sm:flex-row items-center gap-3 shadow-xl">
          <div className="flex-1 text-center sm:text-start">
            <p className="text-xs font-bold text-[#A7F3D0]">{isAr ? `اكتمل ترميم ${area.nameAr}!` : `${area.nameEn} is fully restored!`}</p>
            <p className="text-base font-black text-white">{isAr ? `انطلق إلى ${nextArea.nameAr}` : `Travel to ${nextArea.nameEn}`}</p>
            <p className="text-xs font-bold text-[#FDE68A] inline-flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-0.5">+{AREA_REWARD.gems}<Gem className="w-3.5 h-3.5" /></span>
              <span className="inline-flex items-center gap-0.5">+{AREA_REWARD.energy}<Zap className="w-3.5 h-3.5 fill-current" /></span>
              <span>{isAr ? '+ فصل جديد من القصة' : '+ a new story chapter'}</span>
            </p>
            {nextChapter && (
              <div className="mt-2 max-w-xs mx-auto sm:mx-0">
                <EpisodeTeaser chapter={nextChapter} isAr={isAr} locked={false} />
              </div>
            )}
          </div>
          <button type="button" onClick={onAdvanceArea} className="rounded-2xl btn-3d-green text-white font-extrabold px-5 py-3 inline-flex items-center gap-2 animate-pulse">
            <Plane className="w-5 h-5" />
            {isAr ? 'سافر الآن' : 'Travel now'}
          </button>
        </div>
      )}

      {/* 4 Architectural Renovation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {zones.map((zone) => {
          const isMax = zone.unlockedLevel >= 2;
          const nextCost = zone.unlockedLevel === 0 ? zone.starCostLevel1 : zone.starCostLevel2;
          const canAfford = stars >= nextCost && !isMax;
          const chapter = STORY_CHAPTERS[zone.storyChapterIndex];

          return (
            <div
              key={zone.id}
              className="rounded-xl border border-[#D99B26]/25 bg-[#241812] p-4 flex flex-col justify-between gap-3 shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-[#FBF7F0]">
                      {isAr ? zone.nameAr : zone.nameEn}
                    </h3>
                    <p className="text-xs text-[#D4A373] mt-0.5">
                      {isAr ? `المستوى ${zone.unlockedLevel} / 2` : `Tier ${zone.unlockedLevel} / 2`} · +
                      {zone.coinBonusPerOrder} {isAr ? 'ريال لكل طلب' : 'SAR/Order'}
                    </p>
                  </div>
                  {chapter && zone.unlockedLevel > 0 && (
                    <button
                      type="button"
                      onClick={() => onOpenStory(chapter.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#D99B26]/15 hover:bg-[#D99B26]/30 text-[#FBBF24] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {isAr ? `قصة الفصل ${chapter.chapterNumber}` : `Story Ch.${chapter.chapterNumber}`}
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#E5DEC9]/80 mt-2 leading-relaxed">
                  {isAr ? zone.descAr : zone.descEn}
                </p>

                {chapter && zone.unlockedLevel === 0 && (
                  <div className="mt-2.5">
                    <EpisodeTeaser chapter={chapter} isAr={isAr} locked />
                  </div>
                )}

                {/* 3 Khaleeji Interior Design Style Swatches */}
                <div className="mt-3">
                  <span className="text-[11px] text-[#D4A373] block mb-1.5">
                    {isAr ? 'اختر طراز التصميم الخليجي:' : 'Select Khaleeji Design Style:'}
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {zone.styles.map((st, sIdx) => {
                      const active = zone.selectedStyle === sIdx;
                      return (
                        <button
                          key={st.nameEn}
                          type="button"
                          onClick={() => onUpgradeZone(zone.id, sIdx)}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer truncate ${
                            active
                              ? 'border-[#FBBF24] bg-[#D99B26]/20 text-[#FBF7F0]'
                              : 'border-white/10 bg-[#1C1410]/70 text-[#E5DEC9]/70 hover:text-white'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full shrink-0 border border-black/40"
                            style={{ backgroundColor: st.swatch }}
                          />
                          <span className="truncate">{isAr ? st.nameAr : st.nameEn}</span>
                          {!active && zone.unlockedLevel > 0 && (
                            <span className={`ms-auto shrink-0 inline-flex items-center gap-0.5 text-[10px] ${coins >= styleCost ? 'text-[#FBBF24]' : 'text-white/35'}`}>
                              {styleCost}
                              <Coins className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                {isMax ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#34D399]">
                    <Check className="w-4 h-4" />
                    <span>{isAr ? 'مكتمل التطوير الملكي' : 'Fully Restored to Royal Tier'}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => onUpgradeZone(zone.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      canAfford
                        ? 'bg-[#D97724] hover:bg-[#E08738] text-white shadow-lg'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    <span>
                      {zone.unlockedLevel === 0
                        ? isAr
                          ? 'ترميم الجناح الآن'
                          : 'Restore Wing Now'
                        : isAr
                        ? 'ترقية ملكية فاخرة'
                        : 'Royal Upgrade'}
                    </span>
                    <span className="inline-flex items-center gap-1 tabular-nums bg-black/25 px-2 py-0.5 rounded">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{nextCost}</span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Silhouette layer behind the courtyard (viewBox 800×320, horizon at y=240), one per area on the Kingdom trail. */
const AreaSkyline: React.FC<{ areaId: string }> = ({ areaId }) => {
  switch (areaId) {
    case 'jeddah':
      // Coral-stone tower houses with wooden rawasheen
      return (
        <g opacity="0.35">
          <rect x="260" y="45" width="75" height="195" fill="#451A03" />
          <rect x="270" y="65" width="55" height="35" fill="#92400E" />
          <rect x="270" y="115" width="55" height="35" fill="#92400E" />
          <rect x="345" y="85" width="55" height="155" fill="#451A03" />
          <rect x="352" y="100" width="40" height="28" fill="#92400E" />
        </g>
      );
    case 'alula':
      // Rose-red sandstone monoliths (Jabal AlFil on the right)
      return (
        <g>
          <path d="M0,240 L60,110 L130,110 L165,240 L610,240 L645,95 L735,95 L780,240 Z" fill="#7C2D12" opacity="0.45" />
          <path d="M655,150 Q640,190 650,240 L662,240 Q655,195 670,160 Z" fill="#451A03" opacity="0.5" />
        </g>
      );
    case 'taif':
      // Green terraced hills dotted with Taif roses
      return (
        <g>
          <path d="M0,240 Q120,150 260,200 T520,175 T800,190 L800,240 Z" fill="#365314" opacity="0.55" />
          <path d="M0,240 Q160,195 330,222 T800,215 L800,240 Z" fill="#4D7C0F" opacity="0.6" />
          {[60, 140, 215, 300, 390, 470, 560, 650, 735].map((x, i) => (
            <circle key={x} cx={x} cy={225 - (i % 3) * 6} r="5" fill="#F472B6" opacity="0.85" />
          ))}
        </g>
      );
    case 'abha':
      // Asir mountains, colourful stone houses and the cable car
      return (
        <g>
          <path d="M0,240 L110,90 L210,170 L330,60 L470,180 L590,85 L800,200 L800,240 Z" fill="#44403C" opacity="0.55" />
          <line x1="330" y1="60" x2="590" y2="85" stroke="#E7E5E4" strokeWidth="1.5" opacity="0.6" />
          <rect x="448" y="70" width="16" height="12" rx="2" fill="#DC2626" opacity="0.8" />
          {[
            { x: 40, h: 46, c: '#DC2626' },
            { x: 70, h: 60, c: '#2563EB' },
            { x: 600, h: 54, c: '#EAB308' },
            { x: 632, h: 40, c: '#16A34A' },
          ].map((b) => (
            <g key={b.x} opacity="0.75">
              <rect x={b.x} y={240 - b.h} width="28" height={b.h} fill="#78716C" />
              <rect x={b.x} y={240 - b.h} width="28" height="7" fill={b.c} />
              <rect x={b.x + 9} y={240 - b.h + 16} width="10" height="12" fill={b.c} />
            </g>
          ))}
        </g>
      );
    case 'ahsa':
      // Date-palm oasis with Jabal Al-Qarah behind
      return (
        <g>
          <path d="M80,240 Q120,150 200,160 Q260,140 300,240 Z" fill="#78350F" opacity="0.4" />
          {[330, 400, 470, 540, 610, 690, 760].map((x, i) => {
            const top = 150 + (i % 2) * 18;
            return (
              <g key={x} opacity="0.6">
                <path d={`M${x},240 Q${x + 4},${top + 40} ${x + 2},${top}`} stroke="#3F2A14" strokeWidth="5" fill="none" />
                <path d={`M${x + 2},${top} q-26,4 -40,22 M${x + 2},${top} q26,4 40,22 M${x + 2},${top} q-18,-14 -34,-12 M${x + 2},${top} q18,-14 34,-12`} stroke="#166534" strokeWidth="6" fill="none" strokeLinecap="round" />
              </g>
            );
          })}
        </g>
      );
    case 'riyadh':
      // Kingdom Centre (bottle-opener arch) and Al Faisaliah (pyramid with globe)
      return (
        <g opacity="0.45">
          <path d="M300,240 L318,50 L346,50 L364,240 Z M322,95 Q332,70 342,95 L340,120 L324,120 Z" fill="#1E293B" fillRule="evenodd" />
          <path d="M470,240 L500,80 L530,240 Z" fill="#1E293B" />
          <circle cx="500" cy="112" r="10" fill="#FBBF24" opacity="0.9" />
          <rect x="390" y="160" width="40" height="80" fill="#334155" />
          <rect x="560" y="180" width="50" height="60" fill="#334155" />
          <rect x="230" y="190" width="45" height="50" fill="#334155" />
        </g>
      );
    case 'khobar':
      // Arabian Gulf corniche: the water tower and a dhow on the sea
      return (
        <g>
          <rect x="0" y="205" width="800" height="35" fill="#0E7490" opacity="0.45" />
          <path d="M0,215 q20,-6 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0" stroke="#A5F3FC" strokeWidth="1.5" fill="none" opacity="0.5" />
          <g opacity="0.55">
            <rect x="606" y="120" width="10" height="90" fill="#E2E8F0" />
            <ellipse cx="611" cy="112" rx="34" ry="16" fill="#E2E8F0" />
            <rect x="590" y="96" width="42" height="6" rx="3" fill="#F8FAFC" />
          </g>
          <g opacity="0.6">
            <path d="M120,212 L210,212 L196,226 L134,226 Z" fill="#78350F" />
            <path d="M165,212 L165,160 L200,205 Z" fill="#FEF3C7" />
          </g>
        </g>
      );
    default:
      // Diriyah: At-Turaif mud-brick towers on the ridge
      return (
        <g opacity="0.35">
          <path d="M0,240 L0,200 Q200,175 400,195 T800,190 L800,240 Z" fill="#78350F" />
          {[480, 540, 610, 690].map((x, i) => (
            <g key={x}>
              <rect x={x} y={150 + (i % 2) * 15} width="34" height={90 - (i % 2) * 15} fill="#92400E" />
              <polygon points={`${x},${150 + (i % 2) * 15} ${x + 8},${140 + (i % 2) * 15} ${x + 17},${150 + (i % 2) * 15} ${x + 26},${140 + (i % 2) * 15} ${x + 34},${150 + (i % 2) * 15}`} fill="#FBF7F0" />
            </g>
          ))}
        </g>
      );
  }
};
