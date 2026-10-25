import React, { useLayoutEffect, useRef } from 'react';
import { Language, MergeParticleBurst, MergeParticleShape } from '../game/rules';

interface MergeParticleOverlayProps {
  bursts: MergeParticleBurst[];
  lang: Language;
}

function ParticleGlyph({
  shape,
  color,
  size,
}: {
  shape: MergeParticleShape;
  color: string;
  size: number;
}) {
  if (shape === 'star8') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)]"
      >
        <polygon
          points="12,1 15,8 22,5 19,12 22,19 15,16 12,23 9,16 2,19 5,12 2,5 9,8"
          fill={color}
          stroke="#FFFDF9"
          strokeWidth="1.4"
        />
        <circle cx="12" cy="12" r="3.2" fill="#FFFDF9" />
      </svg>
    );
  }

  if (shape === 'diamond') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.45)]"
      >
        <polygon
          points="10,1 19,10 10,19 1,10"
          fill={color}
          stroke="#FFFDF9"
          strokeWidth="1.5"
        />
        <polygon points="10,5 15,10 10,15 5,10" fill="#FFFDF9" opacity="0.7" />
      </svg>
    );
  }

  if (shape === 'spark') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        className="drop-shadow-[0_0_6px_rgba(253,224,71,0.95)]"
      >
        <path
          d="M10,0 Q11.5,8.5 20,10 Q11.5,11.5 10,20 Q8.5,11.5 0,10 Q8.5,8.5 10,0 Z"
          fill={color}
          stroke="#FFFDF9"
          strokeWidth="1"
        />
      </svg>
    );
  }

  return (
    <span
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        boxShadow: `0 0 10px ${color}, inset 0 1px 2px #FFFFFF`,
      }}
      className="block rounded-full border border-white/90"
    />
  );
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Animates one element with the Web Animations API using concrete values. CSS keyframes that read custom
 * properties (var(--dx)) cannot run on the compositor, so 12-36 particles per merge used to recalculate
 * styles on the main thread every frame; concrete keyframes are composited and leave the main thread free.
 */
function useBurstAnimation(keyframes: Keyframe[], options: KeyframeAnimationOptions) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof el.animate !== 'function') return;
    const anim = el.animate(keyframes, { fill: 'both', ...options });
    return () => anim.cancel();
    // Each node animates once for its lifetime; bursts get fresh keys.
  }, []);
  return ref;
}

const CENTER = 'translate(-50%, -50%)';

function ParticleNode({ p }: { p: MergeParticleBurst['particles'][number] }) {
  const { dxPx: dx, dyPx: dy, rotationDeg: rot } = p;
  const ref = useBurstAnimation(
    [
      { offset: 0, opacity: 0, transform: `${CENTER} translate3d(0px, 0px, 0px) scale(0.2) rotate(0deg)` },
      { offset: 0.16, opacity: 1, transform: `${CENTER} translate3d(${dx * 0.42}px, ${dy * 0.42 - 6}px, 0px) scale(1.28) rotate(${rot * 0.4}deg)` },
      { offset: 0.68, opacity: 0.96, transform: `${CENTER} translate3d(${dx * 0.92}px, ${dy * 0.92 + 4}px, 0px) scale(1) rotate(${rot * 0.85}deg)` },
      { offset: 1, opacity: 0, transform: `${CENTER} translate3d(${dx}px, ${dy + 18}px, 0px) scale(0.15) rotate(${rot}deg)` },
    ],
    { duration: p.durationMs, delay: p.delayMs, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
  );
  return (
    <div ref={ref} className="merge-particle-node" style={{ opacity: 0 }}>
      <ParticleGlyph shape={p.shape} color={p.color} size={p.sizePx} />
    </div>
  );
}

function ShockwaveRing({ style, scale, delayMs, durationMs }: { style: React.CSSProperties; scale: number; delayMs: number; durationMs: number }) {
  const ref = useBurstAnimation(
    [
      { offset: 0, opacity: 0.95, transform: `${CENTER} scale(0.18)` },
      { offset: 0.55, opacity: 0.65 },
      { offset: 1, opacity: 0, transform: `${CENTER} scale(${scale})` },
    ],
    { duration: durationMs, delay: delayMs, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
  );
  return <div ref={ref} className="merge-shockwave-ring rounded-full" style={{ ...style, opacity: 0 }} />;
}

export const MergeParticleOverlay: React.FC<MergeParticleOverlayProps> = ({
  bursts,
  lang,
}) => {
  if (bursts.length === 0) return null;
  const isAr = lang === 'ar';
  const reduced = prefersReducedMotion();

  return (
    <div
      data-testid="merge-particle-overlay"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-40 overflow-visible"
    >
      {bursts.map((burst, burstIdx) => {
        // Account for RTL grid column order (in RTL, col 0 is on the right edge)
        const visualX = isAr ? 100 - burst.xPercent : burst.xPercent;
        const visualY = burst.yPercent;

        // Clamp callout horizontal & vertical coordinates so edge tiles never clip their banner
        const calloutX = Math.max(22, Math.min(78, visualX));
        const calloutY = Math.max(16, Math.min(84, visualY));
        const isLatestBurst = burstIdx === bursts.length - 1;

        return (
          <div key={burst.id} className="absolute inset-0 pointer-events-none">
            {/* 1. Anchor Origin at Exact Merged Tile Center */}
            <div
              style={{
                left: `${visualX}%`,
                top: `${visualY}%`,
              }}
              className="absolute w-0 h-0 pointer-events-none"
            >
              {/* Core Circular Luminous Flash */}
              <div
                className="merge-core-glow rounded-full"
                style={{
                  width: burst.isHighLevel ? '120px' : '64px',
                  height: burst.isHighLevel ? '120px' : '64px',
                  background: `radial-gradient(circle, #FFFDF9 0%, ${burst.secondaryColor} 46%, transparent 74%)`,
                }}
              />

              {/* Rotating 8-Point Najdi Starburst Rays for High-Level Merges (Lv.3+) */}
              {burst.isHighLevel && (
                <div
                  data-testid="high-level-sunburst"
                  className="merge-sunburst-rays"
                  style={{
                    width:
                      burst.tier === 'masterpiece'
                        ? '185px'
                        : burst.tier === 'royal'
                        ? '156px'
                        : '128px',
                    height:
                      burst.tier === 'masterpiece'
                        ? '185px'
                        : burst.tier === 'royal'
                        ? '156px'
                        : '128px',
                  }}
                >
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    <defs>
                      <radialGradient id={`rayGrad_${burst.id}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#FFFDF9" stopOpacity="0.98" />
                        <stop offset="48%" stopColor={burst.secondaryColor} stopOpacity="0.85" />
                        <stop offset="100%" stopColor={burst.primaryColor} stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <g fill={`url(#rayGrad_${burst.id})`}>
                      <polygon points="60,2 68,50 60,60 52,50" />
                      <polygon points="60,118 68,70 60,60 52,70" />
                      <polygon points="2,60 50,68 60,60 50,52" />
                      <polygon points="118,60 70,68 60,60 70,52" />
                      <polygon points="16,16 55,50 60,60 50,55" />
                      <polygon points="104,104 65,70 60,60 70,65" />
                      <polygon points="104,16 70,55 60,60 65,50" />
                      <polygon points="16,104 50,65 60,60 55,70" />
                    </g>
                  </svg>
                </div>
              )}

              {/* Concentric Expanding Shockwave Rings */}
              {!reduced &&
                Array.from({ length: burst.ringCount }).map((_, ringIdx) => {
                  const ringSize = burst.isHighLevel ? 84 + ringIdx * 20 : 56;
                  const ringScale =
                    burst.tier === 'masterpiece'
                      ? 3.1 - ringIdx * 0.35
                      : burst.tier === 'royal'
                      ? 2.65 - ringIdx * 0.3
                      : burst.tier === 'epic'
                      ? 2.2 - ringIdx * 0.25
                      : 1.65;
                  return (
                    <ShockwaveRing
                      key={`ring_${ringIdx}`}
                      scale={ringScale}
                      delayMs={ringIdx * 90}
                      durationMs={burst.isHighLevel ? 950 + ringIdx * 120 : 620}
                      style={{
                        width: `${ringSize}px`,
                        height: `${ringSize}px`,
                        border: ringIdx === 0 ? `3.5px solid ${burst.secondaryColor}` : `2.5px dashed ${burst.primaryColor}`,
                        boxShadow: `0 0 18px ${burst.primaryColor}`,
                      }}
                    />
                  );
                })}

              {/* 360-Degree Radial Particle Fountain */}
              {!reduced && burst.particles.map((p) => <ParticleNode key={p.id} p={p} />)}
            </div>

            {/* 2. Floating Calligraphic Praise Banner & XP Pill (Shown for latest active merge) */}
            {isLatestBurst && (
              <div
                style={{
                  left: `${calloutX}%`,
                  top: `${calloutY}%`,
                }}
                className="merge-callout-badge z-50"
              >
                {burst.isHighLevel ? (
                  <div
                    data-testid="high-level-merge-banner"
                    className={`px-3.5 py-1.5 rounded-2xl border-2 shadow-[0_8px_24px_rgba(44,30,20,0.55)] flex flex-col items-center whitespace-nowrap ${
                      burst.tier === 'masterpiece'
                        ? 'bg-gradient-to-r from-[#4C1D95] via-[#7C2D12] to-[#4C1D95] border-[#FDE047] text-[#FEF9C3]'
                        : burst.tier === 'royal'
                        ? 'bg-gradient-to-r from-[#78350F] via-[#B45309] to-[#78350F] border-[#FDE047] text-[#FFFBEB]'
                        : 'bg-gradient-to-r from-[#065F46] via-[#059669] to-[#065F46] border-[#A7F3D0] text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black tracking-wide">
                      <span>{isAr ? burst.calloutAr : burst.calloutEn}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-black/35 text-[#FDE047] text-[10px] font-black tabular-nums">
                        {burst.isMaxLevel ? 'MAX' : `L${burst.level}`}
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-extrabold text-[#FDE68A] flex items-center gap-1 mt-0.5">
                      <span>{isAr ? burst.itemNameAr : burst.itemNameEn}</span>
                      <span>·</span>
                      <span>+{burst.xpGained} XP</span>
                    </div>
                  </div>
                ) : (
                  <div className="px-2.5 py-0.5 rounded-full bg-[#3E2723]/95 border border-[#FBBF24] text-[#FEF3C7] text-[11px] font-black shadow-md whitespace-nowrap">
                    +{burst.xpGained} XP
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
