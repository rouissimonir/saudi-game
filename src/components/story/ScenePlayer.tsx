import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Coins, FastForward, Gem, Pause, Play, ScrollText, X, Zap } from 'lucide-react';
import { Language } from '../../game/rules';
import { advance, autoDelayMs, choose, currentBeat, ScenePlay, skip, startScene, upcomingBeats } from '../../story/engine';
import { SCENES } from '../../story/scenes';
import { CAST_NAMES, CastId, Expression, Scene, StagePos } from '../../story/types';
import { assetUrl } from '../../utils/assetUrl';
import { actorSrc } from './art';
import './ScenePlayer.css';

export { StoryLog } from './StoryLog';
// Chapter and epilogue scripts live in this lazy chunk; App builds scenes through these.
export { chapterScene } from '../../story/chapterScene';
export { endingScene } from '../../story/scenes/ending';
export type { StoryLogEntry } from './StoryLog';

/**
 * Backdrops that also have a transparent foreground layer for parallax. The painted backdrops
 * (docs/BACKGROUND_PROMPTS.md) are a single layer; the Blender ones in tools/blender/make_scenes.py had one.
 */
const FG_LAYERS = new Set<string>();
const NAME_COLORS: Partial<Record<CastId, string>> = {
  layla: '#047857', noura: '#9F1239', rashid: '#334155', faisal: '#0F766E', tariq: '#57534E', lama: '#BE185D', sultan: '#92400E',
};
const TYPE_MS = 26;

const bgSrc = (key: string, layer: '' | '_fg' = '') => assetUrl(`assets/art/story/bg_${key}${layer}.webp`);

/** Warm the cache with every image a scene uses, so beats never pop in blank, plus the first line's voice. */
export function preloadScene(sceneOrId: string | Scene): void {
  const scene = typeof sceneOrId === 'string' ? SCENES[sceneOrId] : sceneOrId;
  if (!scene || typeof Image === 'undefined') return;
  const urls = new Set<string>([assetUrl('assets/art/story/dallah.webp')]);
  for (const b of scene.beats) {
    urls.add(bgSrc(b.bg));
    if (FG_LAYERS.has(b.bg)) urls.add(bgSrc(b.bg, '_fg'));
    for (const c of b.cast) urls.add(actorSrc(c.id, c.expr));
  }
  urls.forEach((u) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = u;
  });
  const first = scene.beats[0]?.voice;
  if (first && typeof fetch !== 'undefined') void fetch(assetUrl(`assets/audio/story/${first}.mp3`), { priority: 'low' } as RequestInit).catch(() => {});
}

/** Auto mode is remembered between scenes and visits. */
const AUTO_KEY = 'qahwa_scene_auto';
const loadAuto = () => {
  try {
    return localStorage.getItem(AUTO_KEY) === '1';
  } catch {
    return false;
  }
};

const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Audio and haptics come from the app, so this chunk does not pull in the sound manager (and the rules it imports). */
export interface SceneSound {
  playLine: (id: string) => void;
  stopLine: () => void;
  preloadLine: (id: string) => void;
  haptic: (strength: 'light' | 'medium') => void;
  chime: () => void;
}

interface ScenePlayerProps {
  sceneId: string;
  /** A scene built at runtime (story chapters); otherwise `sceneId` is looked up in SCENES. */
  scene?: Scene;
  lang: Language;
  sound: SceneSound;
  onFinish: (play: ScenePlay) => void;
}

/**
 * Full-screen animated story scene: cinematic letterbox, backdrop with camera moves and parallax, characters that
 * enter, breathe, bob while talking and change expression, a typewriter speech bubble, two-option choices and Skip.
 * Tap anywhere: finish the line, then go to the next beat.
 */
export const ScenePlayer: React.FC<ScenePlayerProps> = ({ sceneId, scene: given, lang, sound, onFinish }) => {
  const scene: Scene = given ?? SCENES[sceneId];
  const isAr = lang === 'ar';
  const reduced = useMemo(prefersReducedMotion, []);
  const [play, setPlay] = useState<ScenePlay>(() => startScene(scene));
  const [typed, setTyped] = useState(0);
  const [finale, setFinale] = useState(false);
  const [auto, setAuto] = useState(loadAuto);
  const [history, setHistory] = useState<string[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const finishedRef = useRef(false);
  const beat = currentBeat(scene, play);
  const text = beat ? Array.from(isAr ? beat.textAr : beat.textEn) : [];
  const typing = typed < text.length;

  const finish = useCallback(
    (p: ScenePlay) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      sound.stopLine();
      onFinish(p);
    },
    [onFinish, sound]
  );

  // Each new beat: restart the typewriter and speak its line.
  useEffect(() => {
    if (!beat) return;
    setTyped(reduced ? Number.MAX_SAFE_INTEGER : 0);
    if (beat.voice) sound.playLine(beat.voice);
    else sound.stopLine();
    for (const b of upcomingBeats(scene, play)) if (b.voice) sound.preloadLine(b.voice);
  }, [beat?.id]);

  useEffect(() => {
    if (!typing) return;
    const t = window.setTimeout(() => setTyped((n) => n + 1), TYPE_MS);
    return () => window.clearTimeout(t);
  }, [typed, typing]);

  useEffect(() => () => sound.stopLine(), []);

  // Every line shown so far, for the history panel.
  useEffect(() => {
    if (beat) setHistory((h) => (h[h.length - 1] === beat.id ? h : [...h, beat.id]));
  }, [beat?.id]);

  const next = useCallback(() => {
    if (!beat || finale || historyOpen) return;
    if (typing) {
      setTyped(text.length);
      return;
    }
    if (beat.choice) return;
    const n = advance(scene, play);
    if (!n.done) {
      sound.haptic('light');
      setPlay(n);
      return;
    }
    if (beat.effect === 'dallah-to-board' && !reduced) {
      setFinale(true);
      sound.chime();
      window.setTimeout(() => finish(n), 1100);
    } else {
      finish(n);
    }
  }, [beat, finale, historyOpen, typing, text.length, scene, play, reduced, finish, sound]);

  // Auto mode: once a line has finished typing, move on after a reading pause; choices still wait for the player.
  useEffect(() => {
    if (!auto || historyOpen || typing || !beat || beat.choice || finale) return;
    const t = window.setTimeout(next, autoDelayMs(text.length));
    return () => window.clearTimeout(t);
  }, [auto, historyOpen, typing, beat, finale, next, text.length]);

  const toggleAuto = () => {
    setAuto((on) => {
      try {
        localStorage.setItem(AUTO_KEY, on ? '0' : '1');
      } catch {
        // storage blocked: auto mode lasts for this scene only
      }
      return !on;
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHistoryOpen(false);
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next]);

  if (!beat && !finale) return null;
  const shown = beat ?? scene.beats[scene.beats.length - 1];
  const side = (pos: StagePos): StagePos => (isAr && pos !== 'center' ? (pos === 'left' ? 'right' : 'left') : pos);
  const camera = shown.camera ?? 'none';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? scene.titleAr : scene.titleEn}
      data-testid="scene-player"
      className={`fixed inset-0 z-[60] bg-black flex justify-center select-none ${finale ? 'scene-finale' : ''}`}
      onClick={next}
    >
      <div className="relative h-full w-full max-w-[520px] overflow-hidden">
        {/* Backdrop: keyed by background + camera so each new shot restarts its move */}
        <div key={`${shown.bg}-${camera}-${shown.id}`} className="absolute inset-0">
          <img src={bgSrc(shown.bg)} alt="" decoding="async" className={`absolute inset-0 w-full h-full object-cover scene-cam cam-${camera}`} />
          {FG_LAYERS.has(shown.bg) && (
            <img src={bgSrc(shown.bg, '_fg')} alt="" decoding="async" className={`absolute inset-0 w-full h-full object-cover scene-cam cam-${camera} cam-fg`} />
          )}
        </div>

        {/* Cast */}
        {shown.cast.map((a) => {
          const pos = side(a.pos);
          const talking = shown.speaker === a.id;
          return (
            <div key={a.id} data-testid={`actor-${a.id}`} className={`scene-actor scene-actor-${pos} enter-from-${pos === 'center' ? 'bottom' : pos}`}>
              <div className={`scene-actor-body ${talking && typing ? 'actor-talk' : ''} ${shown.speaker && !talking ? 'actor-dim' : ''}`}>
                <img key={`${a.id}-${a.expr}`} src={actorSrc(a.id, a.expr)} alt={isAr ? CAST_NAMES[a.id].ar : CAST_NAMES[a.id].en} className="scene-actor-img" draggable={false} />
              </div>
            </div>
          );
        })}

        {/* Letterbox */}
        <div className="scene-bar scene-bar-top" />
        <div className="scene-bar scene-bar-bottom" />

        <div className="absolute top-3 start-3 z-20 flex items-center gap-2">
        <button
          type="button"
          data-testid="scene-history"
          aria-label={isAr ? 'سجل الحوار' : 'Dialogue history'}
          onClick={(e) => {
            e.stopPropagation();
            setHistoryOpen(true);
          }}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/45 border border-white/30 text-white backdrop-blur-sm"
        >
          <ScrollText className="w-4 h-4" />
        </button>
        <button
          type="button"
          data-testid="scene-auto"
          aria-pressed={auto}
          onClick={(e) => {
            e.stopPropagation();
            toggleAuto();
          }}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold backdrop-blur-sm ${
            auto ? 'bg-[#D97706] border-[#FBBF24] text-white' : 'bg-black/45 border-white/30 text-white'
          }`}
        >
          {auto ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 rtl:-scale-x-100" />}
          {isAr ? 'تلقائي' : 'Auto'}
        </button>
        </div>

        {historyOpen && (
          <div
            className="absolute inset-0 z-40 bg-black/70 flex items-end"
            data-testid="scene-history-panel"
            onClick={(e) => {
              e.stopPropagation();
              setHistoryOpen(false);
            }}
          >
            <div className="w-full max-h-[72%] rounded-t-3xl bg-[#FFFDF9] border-t-4 border-[#D97706] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <h2 className="text-base font-black text-[#78350F]">{isAr ? 'سجل الحوار' : 'Dialogue history'}</h2>
                <button type="button" onClick={() => setHistoryOpen(false)} aria-label={isAr ? 'إغلاق' : 'Close'} className="w-8 h-8 rounded-full hud-pill flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="px-5 pb-6 space-y-3 overflow-y-auto" ref={(el) => el?.scrollTo(0, el.scrollHeight)}>
                {history.map((id) => {
                  const b = scene.beats.find((x) => x.id === id);
                  if (!b) return null;
                  return (
                    <li key={id} className="text-[14px] leading-relaxed text-[#3E2723]">
                      {b.speaker ? (
                        <span className="block text-xs font-extrabold" style={{ color: NAME_COLORS[b.speaker] ?? '#78350F' }}>
                          {isAr ? CAST_NAMES[b.speaker].ar : CAST_NAMES[b.speaker].en}
                        </span>
                      ) : null}
                      <span className={b.speaker ? 'font-bold' : 'italic text-[#92400E]'}>{isAr ? b.textAr : b.textEn}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}

        <button
          type="button"
          data-testid="scene-skip"
          onClick={(e) => {
            e.stopPropagation();
            finish(skip(scene, play));
          }}
          className="absolute top-3 end-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/45 border border-white/30 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm"
        >
          {isAr ? 'تخطي' : 'Skip'}
          <FastForward className="w-3.5 h-3.5 rtl:-scale-x-100" />
        </button>

        {/* Choices */}
        {beat?.choice && !typing && (
          <div className="absolute inset-x-4 bottom-[calc(9vh+9.5rem)] z-20 flex flex-col gap-2.5" data-testid="scene-choices">
            {beat.choice.map((o, i) => (
              <button
                key={o.id}
                type="button"
                data-testid={`scene-choice-${o.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  sound.haptic('medium');
                  setPlay(choose(scene, play, o.id));
                }}
                className={`scene-choice w-full rounded-2xl px-4 py-3 text-start text-sm font-extrabold shadow-xl border-2 flex items-center justify-between gap-3 ${
                  i === 0 ? 'bg-gradient-to-r from-[#B45309] to-[#D97706] border-[#FDE68A] text-white' : 'bg-gradient-to-r from-[#065F46] to-[#047857] border-[#A7F3D0] text-white'
                }`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span>{isAr ? o.textAr : o.textEn}</span>
                {o.reward && (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[11px]">
                    {o.reward.gems ? <>+{o.reward.gems}<Gem className="w-3 h-3" /></> : null}
                    {o.reward.coins ? <>+{o.reward.coins}<Coins className="w-3 h-3" /></> : null}
                    {o.reward.energy ? <>+{o.reward.energy}<Zap className="w-3 h-3" /></> : null}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Speech bubble */}
        {beat && (
          <div key={beat.id} className="absolute inset-x-3 bottom-[9vh] z-10 scene-bubble" aria-live="polite">
            {beat.speaker && (
              <div className="absolute -top-3.5 start-5 rounded-full px-3 py-0.5 text-xs font-extrabold text-white shadow" style={{ background: NAME_COLORS[beat.speaker] ?? '#78350F' }}>
                {isAr ? CAST_NAMES[beat.speaker].ar : CAST_NAMES[beat.speaker].en}
              </div>
            )}
            <div className={`rounded-3xl border-2 border-[#D97706] bg-[#FFFDF9]/95 shadow-2xl px-5 pt-5 pb-4 min-h-[8.5rem] ${beat.speaker ? '' : 'text-center'}`}>
              <p className={`text-[15px] leading-relaxed text-[#3E2723] ${beat.speaker ? 'font-bold' : 'font-extrabold italic text-[#92400E]'}`} data-testid="scene-text">
                {text.slice(0, typed).join('')}
                <span className="invisible">{text.slice(typed).join('')}</span>
              </p>
              {!typing && !beat.choice && <span className="scene-next-hint absolute bottom-3 end-5 text-[#D97706] text-lg">▾</span>}
            </div>
          </div>
        )}

        {finale && <img src={assetUrl('assets/art/story/dallah.webp')} alt="" className="scene-dallah-fly" />}
      </div>
    </div>
  );
};
