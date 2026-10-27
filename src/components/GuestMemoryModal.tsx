import React from 'react';
import type { Language } from '../game/rules';
import type { GuestMemory } from '../game/guestMemories';
import { CustomerPortrait } from './CustomerPortrait';

export function GuestMemoryModal({ memory, reward, lang, onClose }: { memory: GuestMemory; reward: { coins: number; stars: number; gems: number; chest: boolean }; lang: Language; onClose: () => void }) {
  const ar = lang === 'ar';
  return <div role="dialog" aria-modal="true" aria-label={ar ? 'ذكرى من المجلس' : 'A Majlis memory'} dir={ar ? 'rtl' : 'ltr'} className="safe-dialog fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
    <div className="w-full max-w-sm rounded-2xl border-2 border-[#D99B26] bg-[#241812] p-5 text-[#FBF7F0] shadow-2xl" data-testid="guest-memory">
      <div className="flex items-center gap-3"><CustomerPortrait avatarKey={memory.guest} size="lg" /><div><div className="text-xs font-bold text-[#FBBF24]">{ar ? 'ذكرى من جلسة التذوق' : 'A memory from the tasting'}</div><h2 className="font-black">{memory.guest === 'faisal' ? (ar ? 'فيصل' : 'Faisal') : (ar ? 'نورة' : 'Noura')}</h2></div></div>
      <p className="mt-4 text-sm leading-relaxed text-[#FDECCB]">{ar ? memory.textAr : memory.textEn}</p>
      <p data-testid="guest-memory-reward" className="mt-3 rounded-xl border border-[#D99B26]/40 bg-[#39271B] p-2 text-sm font-bold text-[#FDE68A]">{ar ? 'مكافأة الضيافة' : 'Hospitality reward'}: +{reward.coins} 🪙 · +{reward.stars} ⭐{reward.gems > 0 && ` · +${reward.gems} 💎`}{reward.chest && (ar ? ' · صندوق ضيافة على اللوحة' : ' · hospitality chest on the board')}</p>
      <p className="mt-3 text-xs text-[#D4B483]">{ar ? 'يمكنك قراءة هذه الذكرى مجدداً في ركن التذوق.' : 'You can revisit this memory in the tasting corner.'}</p>
      <button type="button" onClick={onClose} className="mt-4 w-full rounded-xl btn-3d-amber px-4 py-3 font-black text-[#241812]">{ar ? 'متابعة' : 'Continue'}</button>
    </div>
  </div>;
}
