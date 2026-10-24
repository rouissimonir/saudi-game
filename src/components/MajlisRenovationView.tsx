import React from 'react';
import { Star, Check, CloudRain, Moon, Sun, MapPin } from 'lucide-react';
import {
  Language,
  MajlisAmbiance,
  MajlisRegion,
  RenovationZone,
  STORY_CHAPTERS,
} from '../game/rules';

interface MajlisRenovationViewProps {
  lang: Language;
  zones: RenovationZone[];
  stars: number;
  activeRegion: MajlisRegion;
  ambiance: MajlisAmbiance;
  completedStoryIds: string[];
  onUpgradeZone: (zoneId: string, styleIndex?: number) => void;
  onChangeRegion: (region: MajlisRegion) => void;
  onChangeAmbiance: (ambiance: MajlisAmbiance) => void;
  onOpenStory: (storyId: string) => void;
}

export const MajlisRenovationView: React.FC<MajlisRenovationViewProps> = ({
  lang,
  zones,
  stars,
  activeRegion,
  ambiance,
  onUpgradeZone,
  onChangeRegion,
  onChangeAmbiance,
  onOpenStory,
}) => {
  const isAr = lang === 'ar';

  const archZone = zones.find((z) => z.id === 'zone_arch')!;
  const saduZone = zones.find((z) => z.id === 'zone_sadu')!;
  const barZone = zones.find((z) => z.id === 'zone_bar')!;
  const courtZone = zones.find((z) => z.id === 'zone_courtyard')!;

  const totalLevels = zones.reduce((acc, z) => acc + z.unlockedLevel, 0);
  const maxLevels = zones.length * 2;
  const prestigePercent = Math.round((totalLevels / maxLevels) * 100);

  const regions: { id: MajlisRegion; nameAr: string; nameEn: string; subAr: string; subEn: string }[] = [
    {
      id: 'diriyah',
      nameAr: 'الدرعية التاريخية',
      nameEn: 'Historic Diriyah',
      subAr: 'عمارة الطين النجدية والشرفات',
      subEn: 'Najdi Mud-Brick & Crenellations',
    },
    {
      id: 'jeddah',
      nameAr: 'جدة التاريخية (البلد)',
      nameEn: 'Jeddah Al-Balad',
      subAr: 'الرواشين الحجازية وخشب التك',
      subEn: 'Hijazi Rawasheen Latticework',
    },
    {
      id: 'alula',
      nameAr: 'واحة العلا الصخرية',
      nameEn: 'AlUla Sandstone Oasis',
      subAr: 'جبال الحجر الوردي والنخيل',
      subEn: 'Rose-Red Monoliths & Palms',
    },
  ];

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
        {/* 3 Saudi Heritage Regions */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-[#E9C46A] inline-flex items-center gap-1 shrink-0 px-1">
            <MapPin className="w-3.5 h-3.5 text-[#FBBF24]" />
            {isAr ? 'خريطة مجالس المملكة:' : 'Kingdom Map:'}
          </span>
          {regions.map((r) => {
            const active = activeRegion === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onChangeRegion(r.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                  active
                    ? 'bg-[#D97724] text-white border-[#FBBF24] shadow'
                    : 'bg-[#1C1410] text-[#D4A373] border-white/10 hover:text-white'
                }`}
              >
                {isAr ? r.nameAr : r.nameEn}
              </button>
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
            <h2 className="text-sm sm:text-base font-bold text-[#FBF7F0]">
              {activeRegion === 'diriyah'
                ? isAr
                  ? 'قصر ومجلس الدرعية للقهوة المختصة'
                  : 'Diriyah Heritage Majlis & Roastery'
                : activeRegion === 'jeddah'
                ? isAr
                  ? 'مقهى رواشين جدة التاريخية (البلد)'
                  : 'Al-Balad Hijazi Rawasheen Café (Jeddah)'
                : isAr
                ? 'ديوانية صخور العلا والواحة الملكية'
                : 'AlUla Sandstone Canyon Lounge'}
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

            {/* Regional Silhouette Horizon (AlUla Monoliths or Jeddah Coral Towers) */}
            {activeRegion === 'alula' && (
              <path
                d="M0,240 L60,110 L130,110 L165,240 L610,240 L645,95 L735,95 L780,240 Z"
                fill="#7C2D12"
                opacity="0.45"
              />
            )}
            {activeRegion === 'jeddah' && (
              <g opacity="0.35">
                <rect x="260" y="45" width="75" height="195" fill="#451A03" />
                <rect x="270" y="65" width="55" height="35" fill="#92400E" />
                <rect x="270" y="115" width="55" height="35" fill="#92400E" />
              </g>
            )}

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
                fill={archZone.styles[archZone.selectedStyle].swatch}
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
                fill={saduZone.unlockedLevel > 0 ? saduZone.styles[saduZone.selectedStyle].swatch : '#334155'}
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
                stroke={barZone.unlockedLevel > 0 ? barZone.styles[barZone.selectedStyle].swatch : '#475569'}
                strokeWidth="3"
              />
              <rect
                x="535"
                y="185"
                width="235"
                height="55"
                rx="4"
                fill={barZone.unlockedLevel > 0 ? barZone.styles[barZone.selectedStyle].swatch : '#475569'}
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
                fill={courtZone.unlockedLevel > 0 ? courtZone.styles[courtZone.selectedStyle].swatch : '#334155'}
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
      </div>

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
