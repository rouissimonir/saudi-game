import React from 'react';
import { CircleHelp } from 'lucide-react';
import type { Language } from '../game/rules';
import { Sheet } from './ProgressionModals';

const STEPS: { icon: string; ar: string; en: string }[] = [
  { icon: '🤝', ar: 'اسحب عنصرين متطابقين ليندمجا في عنصر أعلى. يمكنك أيضاً النقر على الأول ثم الثاني.', en: 'Drag two matching items together to merge them into a higher one. You can also tap one, then the other.' },
  { icon: '⚡', ar: 'انقر على المولّد لإنتاج عناصر جديدة. كل نقرة تستهلك طاقة.', en: 'Tap a generator to make new items. Each tap uses energy.' },
  { icon: '☕', ar: 'حضّر ما يطلبه الضيف ثم اضغط «تقديم» لتربح ريالات ونجوماً.', en: 'Prepare what a guest asks for, then tap Serve to earn coins and stars.' },
  { icon: '🏛️', ar: 'استخدم النجوم لترميم أجنحة المجلس وفتح فصول الحكاية.', en: 'Spend stars to restore the Majlis wings and unlock story chapters.' },
  { icon: '🔋', ar: 'تتجدد الطاقة نقطة كل دقيقة حتى وأنت خارج اللعبة.', en: 'Energy refills one point every minute, even while the game is closed.' },
  { icon: '🧺', ar: 'الازدحام؟ خزّن 4 عناصر في المؤونة، أو استعمل المقص والجوكر، أو اضغط «ترتيب اللوحة».', en: 'Crowded board? Store 4 items in the pantry, use the scissors or joker, or tap Tidy board.' },
];

export const HowToPlayModal: React.FC<{ lang: Language; onClose: () => void }> = ({ lang, onClose }) => {
  const isAr = lang === 'ar';
  return (
    <Sheet testId="how-to-play" title={isAr ? 'كيف ألعب؟' : 'How to play'} closeLabel={isAr ? 'إغلاق' : 'Close'} icon={<CircleHelp className="w-5 h-5 text-[#B45309]" />} onClose={onClose}>
      <ol className="grid gap-2">
        {STEPS.map((step, i) => (
          <li key={i} className="flex items-start gap-3 rounded-2xl border-2 border-[#E7D3AE] bg-white p-3">
            <span aria-hidden="true" className="text-2xl w-9 text-center shrink-0">{step.icon}</span>
            <span className="text-sm font-bold leading-snug text-[#3E2723]">{isAr ? step.ar : step.en}</span>
          </li>
        ))}
      </ol>
    </Sheet>
  );
};
