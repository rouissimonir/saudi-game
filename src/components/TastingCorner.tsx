import React, { useState } from 'react';
import { gatheringReaction, TASTING_STYLES, TASTING_TRAYS } from '../game/tasting';
import type { Language } from '../game/rules';
import { CustomerPortrait } from './CustomerPortrait';
import { ItemArtwork } from './ItemArtwork';
import { tastingGuestMemory } from '../game/guestMemories';

/** The completed gathering remains a small, replayable part of the player's Majlis. */
export function TastingCorner({ flags, lang }: { flags: Record<string, string>; lang: Language }) {
  const [guest, setGuest] = useState<'faisal' | 'noura' | null>(null);
  const ar = lang === 'ar';
  const style = TASTING_STYLES.find(s => s.id === flags.tasting_style);
  if (!style) return null;
  const trays = TASTING_TRAYS.map((choices, i) => choices.find(c => c.id === flags[`tasting_tray_${i}`]));
  const reaction = guest ? gatheringReaction(flags, guest) : null;
  const memory = guest ? tastingGuestMemory(flags, guest) : null;
  return <section data-testid="tasting-corner-scene" aria-label={ar ? 'ركن القهوة' : 'Coffee corner'} className="relative overflow-hidden rounded-xl border border-[#D99B26]/40 bg-gradient-to-b from-[#69442D] via-[#503123] to-[#2B1B14] px-3 pt-3 pb-2">
    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2 opacity-70" style={{ backgroundColor: style.color }} />
    <div className="flex items-end justify-center gap-3 min-h-16">
      {flags.tasting_complete && <button type="button" data-testid="gathering-noura" onClick={() => setGuest('noura')} aria-pressed={guest === 'noura'} aria-label={ar ? 'حديث نورة' : 'Read Noura’s words'} className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDE68A] motion-safe:animate-[stage-in_700ms_ease-out_both]"><CustomerPortrait avatarKey="noura" size="lg" /></button>}
      <div className="flex flex-col items-center" aria-hidden="true"><span className="text-xl">🏮</span><div className="flex items-center justify-center gap-1 rounded-full border-2 border-[#E9C46A] bg-[#6D482E] px-3 py-1 shadow-lg">{trays.flatMap((tray, i) => tray ? tray.items.map(id => <ItemArtwork key={`${i}-${id}`} itemId={id} size="xs" />) : [])}</div><div className="h-2 w-24 rounded-b-lg" style={{ backgroundColor: style.color }} /></div>
      {flags.tasting_complete && <button type="button" data-testid="gathering-faisal" onClick={() => setGuest('faisal')} aria-pressed={guest === 'faisal'} aria-label={ar ? 'حديث فيصل' : 'Read Faisal’s words'} className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDE68A] motion-safe:animate-[stage-in_900ms_ease-out_both]"><CustomerPortrait avatarKey="faisal" size="lg" /></button>}
    </div>
    <p className="mt-2 text-center text-xs font-bold text-[#FDECCB]">{ar ? style.ar : style.en} · {trays.filter(Boolean).map(tray => ar ? tray!.ar : tray!.en).join(' · ')}</p>
    {flags.tasting_complete && <p className="mt-1 text-center text-xs text-[#FDECCB]">{ar ? 'اضغطي على فيصل أو نورة لاستعادة اللمّة' : 'Tap Faisal or Noura to revisit the gathering'}</p>}
    {reaction && <p data-testid="gathering-reaction" aria-live="polite" className="mt-2 rounded-lg border border-[#D99B26]/50 bg-[#1C1410]/80 p-2 text-sm leading-relaxed text-[#FFF4DA]">{ar ? reaction.ar : reaction.en}</p>}
    {memory && <div data-testid="corner-guest-memory" aria-live="polite" className="mt-2 rounded-lg border border-[#8B5E3C] bg-[#302116] p-2 text-sm leading-relaxed text-[#FDECCB]"><p className="mb-1 text-xs font-bold text-[#FBBF24]">{ar ? 'ذكرى زيارة لاحقة' : 'A later visit remembered'}</p><p>{ar ? memory.textAr : memory.textEn}</p></div>}
  </section>;
}
