import React, { useState } from 'react';
import { ITEM_CATALOG } from '../game/rules';
import { assetUrl } from '../utils/assetUrl';

/**
 * Warm the browser cache so merge results never flash blank. Runs once the page is idle after load,
 * so the icons never compete with the code and fonts the first screen needs.
 */
export function preloadItemArt(): void {
  if (typeof Image === 'undefined') return;
  const run = () =>
    Object.keys(ITEM_CATALOG).forEach((id) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = assetUrl(`assets/art/items/${id}.webp`);
    });
  const whenIdle = () =>
    typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(run, { timeout: 3000 }) : window.setTimeout(run, 1500);
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });
}

interface ItemArtworkProps {
  itemId: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ItemArtwork: React.FC<ItemArtworkProps> = ({ itemId, size = 'md' }) => {
  const def = ITEM_CATALOG[itemId];
  // Blender-rendered icon in public/assets/art/items/<itemId>.webp; falls back to the built-in SVG if missing
  const [failedId, setFailedId] = useState<string | null>(null);
  const imgFailed = failedId === itemId;
  if (!def) return null;

  const sizeClass =
    size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10 sm:w-11 sm:h-11';

  return (
    <div className={`relative flex items-center justify-center ${sizeClass} select-none pointer-events-none`}>
      {!imgFailed && (
        <img
          src={assetUrl(`assets/art/items/${itemId}.webp`)}
          alt=""
          width={256}
          decoding="async"
          height={256}
          draggable={false}
          onError={() => setFailedId(itemId)}
          className="w-full h-full object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.45)]"
        />
      )}
      {imgFailed && (
      <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)]">
        {/* GENERATOR 1: Khawlani Coffee Sack */}
        {itemId === 'gen_qahwa' && (
          <g>
            <path d="M14 24 C10 34 10 52 18 56 L46 56 C54 52 54 34 50 24 L42 18 L22 18 Z" fill="#8C5A32" stroke="#2A180D" strokeWidth="3" />
            <path d="M20 18 L26 10 L38 10 L44 18 Z" fill="#A47148" stroke="#2A180D" strokeWidth="3" />
            <rect x="20" y="16" width="24" height="5" rx="2.5" fill="#9E2A2B" stroke="#2A180D" strokeWidth="2" />
            <path d="M16 36 L48 36 M16 42 L48 42" stroke="#D99B26" strokeWidth="2.5" strokeDasharray="4 3" />
            <ellipse cx="32" cy="29" rx="7" ry="4.5" fill="#4E6E58" stroke="#1B2A20" strokeWidth="2" />
            <path d="M28 29 Q32 27 36 29" stroke="#D99B26" strokeWidth="1.5" fill="none" />
          </g>
        )}

        {/* GENERATOR 2: Riyadh Specialty Roaster */}
        {itemId === 'gen_barista' && (
          <g>
            <rect x="14" y="14" width="36" height="42" rx="6" fill="#1F2937" stroke="#0F172A" strokeWidth="3" />
            <rect x="18" y="18" width="28" height="12" rx="3" fill="#2A9D8F" stroke="#0F172A" strokeWidth="2" />
            <circle cx="25" cy="24" r="3" fill="#FBF7F0" />
            <circle cx="39" cy="24" r="3" fill="#E9C46A" />
            <path d="M24 34 L40 34 L37 46 L27 46 Z" fill="#D97724" stroke="#0F172A" strokeWidth="2" />
            <rect x="22" y="48" width="20" height="4" rx="2" fill="#94A3B8" />
          </g>
        )}

        {/* GENERATOR 3: AlUla Date & Sweets Basket */}
        {itemId === 'gen_sweets' && (
          <g>
            <path d="M12 28 L52 28 L46 54 L18 54 Z" fill="#C68B59" stroke="#2A180D" strokeWidth="3" />
            <path d="M18 28 C18 12 46 12 46 28" fill="none" stroke="#8C5A32" strokeWidth="4" />
            <ellipse cx="24" cy="26" rx="6" ry="4" fill="#9E2A2B" stroke="#2A180D" strokeWidth="2" />
            <ellipse cx="32" cy="24" rx="7" ry="4.5" fill="#D97724" stroke="#2A180D" strokeWidth="2" />
            <ellipse cx="40" cy="26" rx="6" ry="4" fill="#E9C46A" stroke="#2A180D" strokeWidth="2" />
            <path d="M16 38 L48 38 M18 46 L46 46" stroke="#F4A261" strokeWidth="2.5" strokeDasharray="5 3" />
          </g>
        )}

        {/* GENERATOR 4: Royal Oud & Mabkhara Perfumery Chest */}
        {itemId === 'gen_oud' && (
          <g>
            <rect x="12" y="24" width="40" height="30" rx="5" fill="#4C1D95" stroke="#1E1B4B" strokeWidth="3" />
            <path d="M12 28 L52 28" stroke="#FBBF24" strokeWidth="3" />
            <polygon points="20,24 32,10 44,24" fill="#D97706" stroke="#1E1B4B" strokeWidth="2.5" />
            <circle cx="32" cy="39" r="6" fill="#FBBF24" stroke="#1E1B4B" strokeWidth="2" />
            <path d="M28 8 Q32 3 36 8" stroke="#E9D5FF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* QAHWA CHAIN 1-6 */}
        {itemId === 'qahwa_1' && (
          <g>
            <ellipse cx="26" cy="34" rx="10" ry="13" transform="rotate(-15 26 34)" fill="#6B9080" stroke="#1B2A20" strokeWidth="3" />
            <path d="M24 23 Q28 34 24 45" stroke="#1B2A20" strokeWidth="2.5" fill="none" />
            <ellipse cx="40" cy="36" rx="9" ry="12" transform="rotate(20 40 36)" fill="#84A98C" stroke="#1B2A20" strokeWidth="3" />
            <path d="M40 25 Q37 36 40 46" stroke="#1B2A20" strokeWidth="2.5" fill="none" />
          </g>
        )}

        {itemId === 'qahwa_2' && (
          <g>
            <circle cx="32" cy="36" r="18" fill="#5C3A21" stroke="#2A180D" strokeWidth="3" />
            <ellipse cx="27" cy="33" rx="6" ry="8" transform="rotate(-20 27 33)" fill="#D4A373" stroke="#2A180D" strokeWidth="2" />
            <ellipse cx="37" cy="36" rx="6" ry="8" transform="rotate(15 37 36)" fill="#C68B59" stroke="#2A180D" strokeWidth="2" />
            <ellipse cx="32" cy="26" rx="4" ry="6" fill="#84A98C" stroke="#1B2A20" strokeWidth="2" />
          </g>
        )}

        {itemId === 'qahwa_3' && (
          <g>
            <path d="M18 28 L46 28 L42 54 L22 54 Z" fill="#D99B26" stroke="#2A180D" strokeWidth="3" />
            <rect x="15" y="24" width="34" height="6" rx="3" fill="#F4A261" stroke="#2A180D" strokeWidth="2.5" />
            <rect x="29" y="8" width="6" height="20" rx="3" fill="#E9C46A" stroke="#2A180D" strokeWidth="2.5" />
            <path d="M22 40 L42 40" stroke="#9E2A2B" strokeWidth="3" />
          </g>
        )}

        {itemId === 'qahwa_4' && (
          <g>
            <path d="M24 24 L40 24 L44 52 L20 52 Z" fill="#E9C46A" stroke="#2A180D" strokeWidth="3" />
            <path d="M24 24 L10 18 L18 32 Z" fill="#F4A261" stroke="#2A180D" strokeWidth="2.5" />
            <path d="M40 26 C52 26 52 44 42 46" fill="none" stroke="#D99B26" strokeWidth="4" />
            <path d="M26 24 L32 10 L38 24 Z" fill="#D97724" stroke="#2A180D" strokeWidth="2.5" />
            <circle cx="32" cy="9" r="2.5" fill="#FBF7F0" />
            <path d="M22 38 L42 38" stroke="#9E2A2B" strokeWidth="2.5" />
          </g>
        )}

        {itemId === 'qahwa_5' && (
          <g>
            <ellipse cx="32" cy="48" rx="22" ry="7" fill="#D99B26" stroke="#2A180D" strokeWidth="2.5" />
            <path d="M16 28 L28 28 L26 44 L18 44 Z" fill="#FBF7F0" stroke="#2A180D" strokeWidth="2.5" />
            <path d="M36 28 L48 28 L46 44 L38 44 Z" fill="#FBF7F0" stroke="#2A180D" strokeWidth="2.5" />
            <path d="M26 22 L38 22 L36 40 L28 40 Z" fill="#FFFBEB" stroke="#2A180D" strokeWidth="2.5" />
            <path d="M27 30 L37 30" stroke="#9E2A2B" strokeWidth="2.5" />
            <path d="M30 14 Q32 18 34 14" stroke="#F59E0B" strokeWidth="2.5" fill="none" />
          </g>
        )}

        {itemId === 'qahwa_6' && (
          <g>
            <ellipse cx="32" cy="50" rx="26" ry="8" fill="#B45309" stroke="#2A180D" strokeWidth="3" />
            <path d="M18 22 L30 22 L33 48 L15 48 Z" fill="#FBBF24" stroke="#2A180D" strokeWidth="2.5" />
            <path d="M18 22 L8 16 L14 29 Z" fill="#F59E0B" stroke="#2A180D" strokeWidth="2" />
            <path d="M20 22 L24 10 L28 22 Z" fill="#9E2A2B" stroke="#2A180D" strokeWidth="2" />
            <path d="M38 28 L50 28 L47 48 L41 48 Z" fill="#D97724" stroke="#2A180D" strokeWidth="2.5" />
            <path d="M42 14 C40 19 48 20 44 25" stroke="#E2E8F0" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* BARISTA CHAIN 1-6 */}
        {itemId === 'barista_1' && (
          <g>
            <path d="M16 18 L48 18 L34 48 L30 48 Z" fill="#F1F5F9" stroke="#334155" strokeWidth="3" />
            <path d="M22 26 L42 26" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 2" />
          </g>
        )}

        {itemId === 'barista_2' && (
          <g>
            <path d="M14 18 L50 18 L38 44 L26 44 Z" fill="#38BDF8" stroke="#0F172A" strokeWidth="3" />
            <rect x="20" y="44" width="24" height="6" rx="3" fill="#0284C7" stroke="#0F172A" strokeWidth="2.5" />
            <path d="M50 22 C58 22 58 34 44 36" fill="none" stroke="#38BDF8" strokeWidth="3.5" />
            <path d="M24 24 L30 38 M40 24 L34 38" stroke="#E0F2FE" strokeWidth="2" />
          </g>
        )}

        {itemId === 'barista_3' && (
          <g>
            <path d="M20 18 L44 18 L41 52 L23 52 Z" fill="#FDE68A" stroke="#1E293B" strokeWidth="3" />
            <path d="M20 18 L44 18 L43 32 L21 32 Z" fill="#78350F" />
            <rect x="24" y="22" width="6" height="6" rx="1" fill="#FFFFFF" opacity="0.8" />
            <rect x="33" y="24" width="6" height="6" rx="1" fill="#FFFFFF" opacity="0.8" />
            <line x1="36" y1="8" x2="32" y2="28" stroke="#2A9D8F" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}

        {itemId === 'barista_4' && (
          <g>
            <path d="M18 22 L46 22 L42 50 L22 50 Z" fill="#A7F3D0" stroke="#064E3B" strokeWidth="3" />
            <path d="M18 22 Q32 14 46 22" fill="#34D399" stroke="#064E3B" strokeWidth="2.5" />
            <path d="M21 32 L43 32" stroke="#78350F" strokeWidth="5" />
            <circle cx="32" cy="18" r="3" fill="#D99B26" />
          </g>
        )}

        {itemId === 'barista_5' && (
          <g>
            <path d="M20 14 L44 14 L36 32 L46 52 L18 52 L28 32 Z" fill="#FDA4AF" stroke="#881337" strokeWidth="3" />
            <rect x="25" y="27" width="14" height="10" rx="2" fill="#C68B59" stroke="#2A180D" strokeWidth="2" />
            <circle cx="32" cy="32" r="2.5" fill="#F43F5E" />
          </g>
        )}

        {itemId === 'barista_6' && (
          <g>
            <rect x="8" y="44" width="48" height="8" rx="4" fill="#D4A373" stroke="#2A180D" strokeWidth="2.5" />
            <path d="M12 24 L22 24 L20 44 L14 44 Z" fill="#34D399" stroke="#064E3B" strokeWidth="2" />
            <path d="M27 20 L37 20 L35 44 L29 44 Z" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
            <path d="M42 24 L52 24 L50 44 L44 44 Z" fill="#F472B6" stroke="#881337" strokeWidth="2" />
            <circle cx="32" cy="12" r="4" fill="#FBBF24" stroke="#2A180D" strokeWidth="1.5" />
          </g>
        )}

        {/* SWEETS CHAIN 1-6 */}
        {itemId === 'sweets_1' && (
          <g>
            <ellipse cx="26" cy="36" rx="9" ry="12" transform="rotate(-12 26 36)" fill="#D97724" stroke="#2A180D" strokeWidth="3" />
            <ellipse cx="39" cy="36" rx="9" ry="12" transform="rotate(14 39 36)" fill="#F59E0B" stroke="#2A180D" strokeWidth="3" />
            <circle cx="26" cy="24" r="2.5" fill="#E9C46A" />
            <circle cx="39" cy="24" r="2.5" fill="#E9C46A" />
          </g>
        )}

        {itemId === 'sweets_2' && (
          <g>
            <ellipse cx="32" cy="40" rx="20" ry="10" fill="#78350F" stroke="#2A180D" strokeWidth="3" />
            <ellipse cx="24" cy="35" rx="7" ry="5" fill="#D97724" stroke="#2A180D" strokeWidth="2" />
            <ellipse cx="38" cy="35" rx="7" ry="5" fill="#D97724" stroke="#2A180D" strokeWidth="2" />
            <ellipse cx="24" cy="34" rx="3" ry="2" fill="#FDE68A" />
            <ellipse cx="38" cy="34" rx="3" ry="2" fill="#FDE68A" />
          </g>
        )}

        {itemId === 'sweets_3' && (
          <g>
            <circle cx="28" cy="36" r="14" fill="#D97724" stroke="#2A180D" strokeWidth="3" />
            <path d="M20 36 L36 36 M28 28 L28 44 M22 30 L34 42 M34 30 L22 42" stroke="#78350F" strokeWidth="2" />
            <circle cx="42" cy="38" r="11" fill="#FDE68A" stroke="#2A180D" strokeWidth="2.5" />
            <circle cx="42" cy="38" r="3" fill="#34D399" />
          </g>
        )}

        {itemId === 'sweets_4' && (
          <g>
            <path d="M12 38 L52 38 L44 52 L20 52 Z" fill="#9E2A2B" stroke="#2A180D" strokeWidth="3" />
            <circle cx="24" cy="32" r="7" fill="#F59E0B" stroke="#2A180D" strokeWidth="2" />
            <circle cx="38" cy="32" r="7" fill="#F59E0B" stroke="#2A180D" strokeWidth="2" />
            <circle cx="31" cy="24" r="7" fill="#FBBF24" stroke="#2A180D" strokeWidth="2" />
          </g>
        )}

        {itemId === 'sweets_5' && (
          <g>
            <ellipse cx="32" cy="46" rx="22" ry="8" fill="#FBF7F0" stroke="#2A180D" strokeWidth="2.5" />
            <rect x="18" y="24" width="28" height="20" rx="4" fill="#FACC15" stroke="#2A180D" strokeWidth="3" />
            <path d="M18 28 Q32 34 46 28" fill="none" stroke="#FFFBEB" strokeWidth="4" />
            <circle cx="32" cy="20" r="4" fill="#E11D48" />
          </g>
        )}

        {itemId === 'sweets_6' && (
          <g>
            <ellipse cx="32" cy="50" rx="24" ry="7" fill="#E9C46A" stroke="#2A180D" strokeWidth="3" />
            <rect x="16" y="34" width="32" height="12" rx="3" fill="#EA580C" stroke="#2A180D" strokeWidth="2.5" />
            <rect x="18" y="29" width="28" height="5" rx="2" fill="#FFFBEB" />
            <rect x="20" y="18" width="24" height="11" rx="3" fill="#F97316" stroke="#2A180D" strokeWidth="2.5" />
            <circle cx="32" cy="14" r="4" fill="#10B981" stroke="#064E3B" strokeWidth="2" />
          </g>
        )}

        {/* OUD, BAKHOOR & TAIF PERFUMERY CHAIN 1-6 */}
        {itemId === 'oud_1' && (
          <g>
            <path d="M14 40 L28 24 L48 30 L42 46 L20 48 Z" fill="#78350F" stroke="#2A180D" strokeWidth="3" />
            <path d="M22 36 L38 32 M26 42 L38 39" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {itemId === 'oud_2' && (
          <g>
            <polygon points="16,24 48,24 40,38 24,38" fill="#D97706" stroke="#2A180D" strokeWidth="2.5" />
            <polygon points="24,38 40,38 44,52 20,52" fill="#B45309" stroke="#2A180D" strokeWidth="2.5" />
            <path d="M26 18 Q32 10 38 18" stroke="#A855F7" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        )}

        {itemId === 'oud_3' && (
          <g>
            <path d="M24 26 L40 26 L44 50 L20 50 Z" fill="#F43F5E" stroke="#881337" strokeWidth="2.5" />
            <rect x="28" y="16" width="8" height="10" rx="2" fill="#FBBF24" stroke="#2A180D" strokeWidth="2" />
            <circle cx="32" cy="12" r="4" fill="#FB7185" stroke="#881337" strokeWidth="2" />
            <circle cx="32" cy="38" r="5" fill="#FFE4E6" />
          </g>
        )}

        {itemId === 'oud_4' && (
          <g>
            <polygon points="32,16 46,30 42,52 22,52 18,30" fill="#7E22CE" stroke="#3B0764" strokeWidth="2.5" />
            <circle cx="32" cy="12" r="5" fill="#FBBF24" stroke="#2A180D" strokeWidth="2" />
            <circle cx="32" cy="36" r="6" fill="#FDE68A" stroke="#3B0764" strokeWidth="2" />
          </g>
        )}

        {itemId === 'oud_5' && (
          <g>
            <polygon points="18,22 24,14 32,22 40,14 46,22 42,52 22,52" fill="#F59E0B" stroke="#2A180D" strokeWidth="2.5" />
            <rect x="26" y="30" width="12" height="14" rx="2" fill="#581C87" stroke="#FDE68A" strokeWidth="1.5" />
            <path d="M28 10 Q32 4 36 10" stroke="#C084FC" strokeWidth="2.5" fill="none" />
          </g>
        )}

        {itemId === 'oud_6' && (
          <g>
            <ellipse cx="32" cy="50" rx="25" ry="8" fill="#1E1B4B" stroke="#FBBF24" strokeWidth="2.5" />
            <path d="M16 26 L30 26 L28 48 L14 48 Z" fill="#31102F" stroke="#FBBF24" strokeWidth="2.5" />
            <polygon points="36,22 50,22 46,48 38,48" fill="#FBBF24" stroke="#2A180D" strokeWidth="2" />
            <circle cx="43" cy="15" r="4.5" fill="#A855F7" stroke="#FDE68A" strokeWidth="1.5" />
          </g>
        )}

        {/* MERGEABLE MAJLIS CHESTS 1-2 */}
        {itemId === 'chest_1' && (
          <g>
            <rect x="12" y="24" width="40" height="28" rx="4" fill="#9A3412" stroke="#2A180D" strokeWidth="3" />
            <path d="M12 34 L52 34" stroke="#FBBF24" strokeWidth="3" />
            <rect x="28" y="30" width="8" height="9" rx="2" fill="#FBBF24" stroke="#2A180D" strokeWidth="2" />
          </g>
        )}

        {itemId === 'chest_2' && (
          <g>
            <rect x="10" y="22" width="44" height="30" rx="5" fill="#F59E0B" stroke="#2A180D" strokeWidth="3" />
            <path d="M10 34 L54 34" stroke="#9E2A2B" strokeWidth="4" />
            <circle cx="32" cy="34" r="6" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
            <polygon points="22,22 32,12 42,22" fill="#FDE68A" stroke="#2A180D" strokeWidth="2" />
          </g>
        )}
      </svg>
      )}
    </div>
  );
};
