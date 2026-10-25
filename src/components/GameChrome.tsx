import React, { useState } from 'react';
import { Castle, Coins, Gem, Gift, Grid3x3, Hammer, Languages, Menu, Pause, ScrollText, ShoppingBag, Star, Trophy, Volume2, VolumeX, X, Zap } from 'lucide-react';
import { Language } from '../game/rules';
import { formatCountdown } from './ProgressionModals';

/** Compact single-row resource bar: keeps the board above the fold on phones. */
export const GameHud: React.FC<{
  lang: Language;
  level: number;
  levelProgress: number; // 0..1 towards the next level
  energy: number;
  maxEnergy: number;
  energyCountdownMs: number | null;
  coins: number;
  gems: number;
  muted: boolean;
  freeSpins: number;
  onEnergy: () => void;
  onCoins: () => void;
  onGems: () => void;
  onSpin: () => void;
  onRank: () => void;
  onToggleLanguage: () => void;
  onToggleMute: () => void;
  onPause: () => void;
}> = (p) => {
  const isAr = p.lang === 'ar';
  const [menuOpen, setMenuOpen] = useState(false);
  const ring = 2 * Math.PI * 17;
  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-b from-[#5C3A21] to-[#432815] border-b-[3px] border-[#C68B59] shadow-md">
      <div className="h-1 w-full sadu-trim" />
      <div className="max-w-[460px] mx-auto px-2 py-1.5 flex items-center gap-1.5" data-testid="game-hud">
        <div className="relative w-11 h-11 shrink-0" aria-label={`${isAr ? 'المستوى' : 'Level'} ${p.level}`}>
          <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
            <circle cx="20" cy="20" r="17" fill="none" stroke="#2A180D" strokeWidth="4" />
            <circle cx="20" cy="20" r="17" fill="none" stroke="#FDE047" strokeWidth="4" strokeLinecap="round" strokeDasharray={ring} strokeDashoffset={ring * (1 - p.levelProgress)} />
          </svg>
          <div className="absolute inset-[5px] rounded-full bg-gradient-to-b from-[#38BDF8] to-[#0284C7] flex items-center justify-center text-white text-sm font-black tabular-nums">{p.level}</div>
        </div>

        <button type="button" onClick={p.onEnergy} data-testid="hud-energy" aria-label={isAr ? 'الطاقة' : 'Energy'} className="hud-pill rounded-full flex-1 min-w-0 h-10 pl-1 pr-2 flex items-center gap-1">
          <span className="w-7 h-7 rounded-full bg-gradient-to-b from-[#FDE047] to-[#F59E0B] border border-[#B45309] flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-[#78350F] fill-[#78350F]" />
          </span>
          <span className="flex flex-col leading-none min-w-0">
            <span className="text-sm font-black tabular-nums text-[#3E2723]">{Math.round(p.energy)}</span>
            <span className="text-[9px] font-bold tabular-nums text-[#92400E] truncate">
              {p.energyCountdownMs === null ? (isAr ? 'ممتلئة' : 'full') : formatCountdown(p.energyCountdownMs)}
            </span>
          </span>
        </button>

        <button type="button" onClick={p.onCoins} aria-label={isAr ? 'الريالات' : 'Coins'} className="hud-pill rounded-full flex-1 min-w-0 h-10 pl-1 pr-2 flex items-center gap-1">
          <span className="w-7 h-7 rounded-full bg-gradient-to-b from-[#FBBF24] to-[#D97706] border border-[#92400E] flex items-center justify-center shrink-0">
            <Coins className="w-4 h-4 text-[#FFFBEB]" />
          </span>
          <span className="text-sm font-black tabular-nums text-[#3E2723] truncate">{Math.round(p.coins)}</span>
        </button>

        <button type="button" onClick={p.onGems} aria-label={isAr ? 'الجواهر' : 'Gems'} className="hud-pill rounded-full flex-1 min-w-0 h-10 pl-1 pr-2 flex items-center gap-1">
          <span className="w-7 h-7 rounded-full bg-gradient-to-b from-[#38BDF8] to-[#0284C7] border border-[#0369A1] flex items-center justify-center shrink-0">
            <Gem className="w-4 h-4 text-white" />
          </span>
          <span className="text-sm font-black tabular-nums text-[#3E2723] truncate">{Math.round(p.gems)}</span>
        </button>

        <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-label={isAr ? 'القائمة' : 'Menu'} aria-expanded={menuOpen} className="relative w-10 h-10 rounded-full hud-pill flex items-center justify-center shrink-0">
          {menuOpen ? <X className="w-5 h-5 text-[#5C3A21]" /> : <Menu className="w-5 h-5 text-[#5C3A21]" />}
          {p.freeSpins > 0 && !menuOpen && <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-[#10B981] border-2 border-white" />}
        </button>
      </div>

      {menuOpen && (
        <div className="absolute end-2 top-full mt-1 w-56 rounded-2xl bg-[#FFFDF9] border-2 border-[#D97706] shadow-2xl p-2 grid gap-1 text-[#3E2723]" data-testid="hud-menu">
          {[
            { icon: <Gift className="w-4 h-4 text-[#D97706]" />, label: isAr ? 'عجلة فنجال الصباح' : 'Morning wheel', badge: p.freeSpins > 0, on: p.onSpin },
            { icon: <Trophy className="w-4 h-4 text-[#D97706]" />, label: isAr ? 'ديوان الكرم' : 'Leaderboard', on: p.onRank },
            { icon: <Languages className="w-4 h-4" />, label: isAr ? 'English' : 'العربية', on: p.onToggleLanguage },
            { icon: p.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />, label: p.muted ? (isAr ? 'تشغيل الصوت' : 'Sound on') : isAr ? 'كتم الصوت' : 'Mute', on: p.onToggleMute },
            { icon: <Pause className="w-4 h-4" />, label: isAr ? 'إيقاف مؤقت' : 'Pause', on: p.onPause },
          ].map((row) => (
            <button
              key={row.label}
              type="button"
              onClick={() => {
                setMenuOpen(false);
                row.on();
              }}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold hover:bg-[#FEF3C7] text-start"
            >
              {row.icon}
              <span className="flex-1">{row.label}</span>
              {row.badge && <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export type NavTab = 'merge' | 'majlis' | 'quests' | 'workshop' | 'shop';

export const BottomNav: React.FC<{
  lang: Language;
  active: 'merge' | 'majlis';
  stars: number;
  canRenovate: boolean;
  questBadge: number;
  onSelect: (tab: NavTab) => void;
}> = ({ lang, active, stars, canRenovate, questBadge, onSelect }) => {
  const isAr = lang === 'ar';
  const items: { id: NavTab; label: string; icon: React.ReactNode; badge?: React.ReactNode }[] = [
    { id: 'merge', label: isAr ? 'الطاولة' : 'Board', icon: <Grid3x3 className="w-5 h-5" /> },
    {
      id: 'majlis',
      label: isAr ? 'المجلس' : 'Majlis',
      icon: <Castle className="w-5 h-5" />,
      badge: (
        <span className={`absolute -top-1 -end-2 min-w-[22px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center gap-0.5 border border-white ${canRenovate ? 'bg-[#10B981] text-white animate-pulse' : 'bg-[#FB923C] text-white'}`}>
          <Star className="w-2.5 h-2.5 fill-white" />
          {stars}
        </span>
      ),
    },
    {
      id: 'quests',
      label: isAr ? 'المهام' : 'Quests',
      icon: <ScrollText className="w-5 h-5" />,
      badge: questBadge > 0 ? <span className="absolute -top-1 -end-1.5 w-[18px] h-[18px] rounded-full bg-[#EF4444] text-white text-[10px] font-black flex items-center justify-center border border-white">{questBadge}</span> : undefined,
    },
    { id: 'workshop', label: isAr ? 'الورشة' : 'Workshop', icon: <Hammer className="w-5 h-5" /> },
    { id: 'shop', label: isAr ? 'المتجر' : 'Shop', icon: <ShoppingBag className="w-5 h-5" /> },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-gradient-to-t from-[#432815] to-[#5C3A21] border-t-[3px] border-[#C68B59] pb-[env(safe-area-inset-bottom)]" data-testid="bottom-nav" aria-label={isAr ? 'التنقل' : 'Navigation'}>
      <div className="max-w-[460px] mx-auto grid grid-cols-5">
        {items.map((it) => {
          const on = it.id === active;
          return (
            <button key={it.id} type="button" onClick={() => onSelect(it.id)} data-testid={`nav-${it.id}`} aria-current={on ? 'page' : undefined} className={`flex flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-extrabold ${on ? 'text-[#FDE047]' : 'text-[#F5EBD9]/85'}`}>
              <span className={`relative w-10 h-8 rounded-xl flex items-center justify-center ${on ? 'bg-[#FBBF24]/20' : ''}`}>
                {it.icon}
                {it.badge}
              </span>
              {it.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
