import React from 'react';
import { assetUrl } from '../utils/assetUrl';

/**
 * Illustrated Khaleeji Character Portraits for the Gossip Harbor / Travel Town Customer Order Strip
 */
export const PORTRAIT_BACKDROP: Record<string, string> = {
  noura: '#5A1E1E',
  faisal: '#1E3A4A',
  tariq: '#3A2616',
  lama: '#4A1F44',
  sultan: '#3E2412',
  ghabga: '#1E1B4B',
};

export const CustomerPortrait: React.FC<{
  avatarKey?: 'noura' | 'faisal' | 'tariq' | 'lama' | 'sultan' | 'ghabga' | string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ avatarKey = 'noura', size = 'md' }) => {
  const dim = size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-14 h-14' : 'w-11 h-11';
  // Blender-rendered bust in public/assets/art/characters/<key>.webp; falls back to the built-in SVG if missing
  const [failedKey, setFailedKey] = React.useState<string | null>(null);
  const useImage = failedKey !== avatarKey && avatarKey in PORTRAIT_BACKDROP;

  return (
    <div
      style={useImage ? { backgroundColor: PORTRAIT_BACKDROP[avatarKey] } : undefined}
      className={`${dim} rounded-full overflow-hidden border-2 border-[#D99B26] bg-[#2B1D14] shrink-0 shadow-inner flex items-center justify-center`}
    >
      {useImage && (
        <img
          src={assetUrl(`assets/art/characters/${avatarKey}.webp`)}
          alt=""
          width={256}
          decoding="async"
          height={256}
          draggable={false}
          onError={() => setFailedKey(avatarKey)}
          className="w-full h-full object-cover scale-[1.12] translate-y-[6%]"
        />
      )}
      {!useImage && (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        {avatarKey === 'noura' && (
          <g>
            <rect width="64" height="64" fill="#3B2316" />
            <circle cx="32" cy="32" r="28" fill="#5A1E1E" />
            <path d="M12,64 C12,34 52,34 52,64 Z" fill="#1F1612" />
            <circle cx="32" cy="27" r="13" fill="#E6B89C" />
            <path
              d="M17,24 C22,12 42,12 47,24 C49,34 48,48 48,60 L16,60 C16,48 15,34 17,24 Z"
              fill="none"
              stroke="#FBBF24"
              strokeWidth="2.5"
            />
            <circle cx="27" cy="27" r="3.8" fill="none" stroke="#FBBF24" strokeWidth="1.6" />
            <circle cx="37" cy="27" r="3.8" fill="none" stroke="#FBBF24" strokeWidth="1.6" />
            <line x1="30.8" y1="27" x2="33.2" y2="27" stroke="#FBBF24" strokeWidth="1.6" />
            <path d="M28,33 Q32,36 36,33" fill="none" stroke="#7F3D27" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )}

        {avatarKey === 'faisal' && (
          <g>
            <rect width="64" height="64" fill="#1E293B" />
            <circle cx="32" cy="32" r="28" fill="#2A9D8F" opacity="0.3" />
            <path d="M12,64 C14,42 50,42 52,64 Z" fill="#334155" />
            <path d="M22,46 L42,46 L45,64 L19,64 Z" fill="#9A3412" />
            <circle cx="32" cy="26" r="12" fill="#DCA788" />
            <path d="M19,22 C20,12 44,12 45,22 Z" fill="#1E1B18" />
            <path d="M22,28 C22,37 42,37 42,28" fill="none" stroke="#1E1B18" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="28" cy="25" r="1.6" fill="#1E1B18" />
            <circle cx="36" cy="25" r="1.6" fill="#1E1B18" />
            <path d="M29,31 Q32,33 35,31" fill="none" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {avatarKey === 'tariq' && (
          <g>
            <rect width="64" height="64" fill="#281B12" />
            <path d="M8,64 C12,42 52,42 56,64 Z" fill="#1C1410" stroke="#FBBF24" strokeWidth="2" />
            <path d="M16,22 C16,10 48,10 48,22 L52,56 L12,56 Z" fill="#F8FAFC" />
            <circle cx="32" cy="28" r="11" fill="#D49B78" />
            <rect x="18" y="14" width="28" height="4.5" rx="2.2" fill="#111827" stroke="#FBBF24" strokeWidth="0.8" />
            <path d="M23,30 C23,39 41,39 41,30" fill="none" stroke="#1F2937" strokeWidth="3.5" />
            <circle cx="28" cy="26" r="1.5" fill="#111827" />
            <circle cx="36" cy="26" r="1.5" fill="#111827" />
          </g>
        )}

        {avatarKey === 'lama' && (
          <g>
            <rect width="64" height="64" fill="#311B2E" />
            <circle cx="32" cy="32" r="27" fill="#9D174D" opacity="0.35" />
            <path d="M14,64 C14,36 50,36 50,64 Z" fill="#3B1D38" stroke="#F4A261" strokeWidth="1.5" />
            <circle cx="32" cy="26" r="11.5" fill="#E8B89A" />
            <path d="M18,22 C20,11 44,11 46,24" fill="none" stroke="#F4A261" strokeWidth="3" />
            <circle cx="28" cy="25" r="1.7" fill="#1F1612" />
            <circle cx="36" cy="25" r="1.7" fill="#1F1612" />
            <path d="M29,31 Q32,34 35,31" fill="none" stroke="#9E2A2B" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {avatarKey === 'sultan' && (
          <g>
            <rect width="64" height="64" fill="#2D1B10" />
            <path d="M14,22 C14,9 50,9 50,22 L54,58 L10,58 Z" fill="#DC2626" />
            <path d="M16,22 C16,11 48,11 48,22 L50,56 L14,56 Z" fill="#FEF2F2" opacity="0.75" />
            <circle cx="32" cy="28" r="11" fill="#C98E6B" />
            <rect x="18" y="13" width="28" height="5" rx="2.5" fill="#111827" />
            <path d="M23,31 C24,39 40,39 41,31" fill="none" stroke="#374151" strokeWidth="3.5" />
            <circle cx="28" cy="26" r="1.5" fill="#111827" />
            <circle cx="36" cy="26" r="1.5" fill="#111827" />
          </g>
        )}

        {avatarKey === 'ghabga' && (
          <g>
            <rect width="64" height="64" fill="#1E1B4B" />
            <circle cx="32" cy="32" r="24" fill="#FBBF24" opacity="0.2" />
            <path d="M32,12 L37,24 L50,25 L40,34 L43,47 L32,40 L21,47 L24,34 L14,25 L27,24 Z" fill="#FBBF24" stroke="#FFF" strokeWidth="1.5" />
          </g>
        )}
      </svg>
      )}
    </div>
  );
};

/**
 * Visual Merge Chain Evolution Tree Modal (Now includes all 4 Cultural & Specialty Chains + Chests!)
 */
