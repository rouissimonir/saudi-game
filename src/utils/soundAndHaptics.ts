import { GameState } from '../game/rules';

const STORAGE_KEY = 'qahwa_majlis_merge_save_v3';

class SoundAndHapticsManager {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public triggerHaptic(intensity: 'light' | 'medium' | 'heavy' = 'light') {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const ms = intensity === 'heavy' ? 35 : intensity === 'medium' ? 18 : 8;
      try {
        navigator.vibrate(ms);
      } catch {
        // Ignore on unsupported browsers
      }
    }
  }

  /**
   * Light Dallah / Roastery pop when spawning from a generator
   */
  public playSpawn() {
    this.triggerHaptic('light');
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const pitchJitter = 1 + (Math.random() * 0.12 - 0.06);
    osc.frequency.setValueAtTime(320 * pitchJitter, now);
    osc.frequency.exponentialRampToValueAtTime(540 * pitchJitter, now + 0.09);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Ringing Najdi Brass Mortar (نجر) & Oud harmonic chime scaled by item level
   */
  public playMerge(level: number = 2) {
    this.triggerHaptic(level >= 4 ? 'heavy' : 'medium');
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Hijaz Maqam-inspired frequencies
    const hijazScale = [293.66, 311.13, 369.99, 392.0, 440.0, 466.16, 554.37, 587.33];
    const baseFreq = hijazScale[Math.min(level, hijazScale.length - 1)];

    [1, 1.5].forEach((mult, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq * mult, now + idx * 0.04);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * mult * 1.04, now + 0.25 + idx * 0.04);

      gain.gain.setValueAtTime(idx === 0 ? 0.18 : 0.1, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28 + idx * 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + 0.3 + idx * 0.04);
    });
  }

  /**
   * Celebratory Oud & Brass fanfare when fulfilling a customer order or upgrading the Majlis
   */
  public playOrderComplete() {
    this.triggerHaptic('heavy');
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [293.66, 369.99, 440.0, 587.33]; // D Hijaz chord arpeggio
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0.16, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.36);
    });
  }

  public playError() {
    this.triggerHaptic('light');
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }
}

export const soundFX = new SoundAndHapticsManager();

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadSavedGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed && Array.isArray(parsed.board) && parsed.board.length === 49) {
      return { ...parsed, lastMergeAt: parsed.lastMergeAt ?? 0, comboCount: parsed.comboCount ?? 0 };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearSavedGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
