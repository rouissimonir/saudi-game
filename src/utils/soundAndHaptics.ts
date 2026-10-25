import { GameState } from '../game/rules';
import { normalizeSave } from '../game/normalizeSave';
import { assetUrl } from './assetUrl';
import { VoiceCharacter, VoiceEvent, VoiceProfile, pickVoiceLine, voiceFileUrl } from '../game/voiceLines';

const STORAGE_KEY = 'qahwa_majlis_merge_save_v3';

/** D Hijaz maqam (D Eb F# G A Bb C# D) in Hz, one octave. */
export const HIJAZ_SCALE_HZ = [293.66, 311.13, 369.99, 392.0, 440.0, 466.16, 554.37, 587.33];

/** Looping oud phrase as indices into HIJAZ_SCALE_HZ; -1 is a rest. Ends on the tonic. */
export const AMBIENT_PHRASE = [0, 2, 3, 2, 1, 0, -1, 4, 3, 2, 3, 5, 4, 3, 2, 1, 0, -1, 0, 1, 2, 3, 4, 7, 5, 4, 3, 2, 1, 0, -1, -1];
const AMBIENT_STEP_MS = 520;
const AMBIENT_URL = assetUrl('assets/audio/ambient.mp3');
const ORDER_COMPLETE_URL = assetUrl('assets/audio/order_complete.mp3');
const LEVEL_UP_URL = assetUrl('assets/audio/level_up.mp3');

class SoundAndHapticsManager {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;
  private ambientTimer: number | null = null;
  private ambientStep = 0;

  private ambientWanted = false;
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientGain: GainNode | null = null;
  private duck = 1;
  private fileBuffers = new Map<string, AudioBuffer | 'missing'>();
  private fileLoading = new Map<string, Promise<AudioBuffer | null>>();

  /** Fetch and decode an audio file once; resolves null if it is missing or unreadable. */
  private loadBuffer(url: string): Promise<AudioBuffer | null> {
    const cached = this.fileBuffers.get(url);
    if (cached) return Promise.resolve(cached === 'missing' ? null : cached);
    const inflight = this.fileLoading.get(url);
    if (inflight) return inflight;
    const ctx = this.ensureContext();
    if (!ctx || typeof fetch === 'undefined') return Promise.resolve(null);
    const p = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('missing');
        return r.arrayBuffer();
      })
      .then((data) => ctx.decodeAudioData(data))
      .then((buf) => {
        this.fileBuffers.set(url, buf);
        return buf as AudioBuffer | null;
      })
      .catch(() => {
        // 404, or a dev server answering with index.html: treat as "no file" and use the synth
        this.fileBuffers.set(url, 'missing');
        return null;
      })
      .finally(() => this.fileLoading.delete(url));
    this.fileLoading.set(url, p);
    return p;
  }

  // ------------------------------------------------------------ character voices
  private lastVoiceAt = 0;
  private voiceCounts = new Map<string, number>();

  /** Lower the music while a character talks. */
  private setDuck(on: boolean) {
    this.duck = on ? 0.35 : 1;
    const ctx = this.ctx;
    if (ctx && this.ambientGain) this.ambientGain.gain.setTargetAtTime(0.6 * this.duck, ctx.currentTime, 0.12);
  }

  /**
   * A character speaks a line. Order of preference:
   *  1. a recorded file /assets/audio/voice/<id>.mp3 (drop in a voice actor's takes, no code change)
   *  2. the device's Arabic text-to-speech, tuned per character
   *  3. silence (no Arabic voice available): the game never reads Arabic with a non-Arabic voice
   */
  public playVoice(character: VoiceCharacter, event: VoiceEvent) {
    if (this.muted || typeof window === 'undefined') return;
    const nowMs = Date.now();
    if (nowMs - this.lastVoiceAt < 900) return; // never talk over a line that just started
    this.lastVoiceAt = nowMs;
    const key = `${character}_${event}`;
    const count = this.voiceCounts.get(key) ?? 0;
    this.voiceCounts.set(key, count + 1);
    const { id, line, profile } = pickVoiceLine(character, event, count);

    void this.loadBuffer(voiceFileUrl(id)).then((buf) => {
      if (this.muted) return;
      const ctx = this.ensureContext();
      if (buf && ctx) {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        this.setDuck(true);
        src.onended = () => this.setDuck(false);
        src.start();
        return;
      }
      this.speakArabic(line.ar, profile);
    });
  }

  private storySource: AudioBufferSourceNode | null = null;

  /** Voiced story-scene line (public/assets/audio/story/<id>.mp3). Stops the previous line; silent if the file is missing. */
  public playStoryLine(id: string) {
    this.stopStoryLine();
    if (this.muted || typeof window === 'undefined') return;
    void this.loadBuffer(assetUrl(`assets/audio/story/${id}.mp3`)).then((buf) => {
      const ctx = this.ensureContext();
      if (!buf || !ctx || this.muted) return;
      this.stopStoryLine();
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      this.setDuck(true);
      src.onended = () => {
        if (this.storySource === src) this.storySource = null;
        this.setDuck(false);
      };
      src.start();
      this.storySource = src;
    });
  }

  public stopStoryLine() {
    if (!this.storySource) return;
    try {
      this.storySource.stop();
    } catch {
      // already stopped
    }
    this.storySource = null;
    this.setDuck(false);
  }

  private speakArabic(text: string, profile: VoiceProfile) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return;
    const synth = window.speechSynthesis;
    const arabic = synth.getVoices().filter((v) => /^ar/i.test(v.lang));
    if (arabic.length === 0) return;

    const FEMALE = /laila|layla|hoda|zira|salma|mariam|maryam|noura|fatima|amira|sara|female/i;
    const MALE = /maged|majed|tarik|tareq|hamed|hamza|naayf|shakir|omar|ahmed|\bmale\b/i;
    const wanted = profile.gender === 'female' ? FEMALE : MALE;
    const byGender = arabic.filter((v) => wanted.test(v.name));
    const pool = byGender.length > 0 ? byGender : arabic;
    const voice = pool.find((v) => /ar[-_]SA/i.test(v.lang)) ?? pool[0];

    const utter = new SpeechSynthesisUtterance(text);
    utter.voice = voice;
    utter.lang = voice.lang || 'ar-SA';
    utter.rate = profile.rate;
    // When the device has no voice of the right gender, move the pitch so characters still sound different
    utter.pitch = byGender.length > 0 ? profile.pitch : Math.min(2, Math.max(0.1, profile.pitch * (profile.gender === 'female' ? 1.25 : 0.8)));
    utter.volume = 1;
    utter.onstart = () => this.setDuck(true);
    utter.onend = () => this.setDuck(false);
    utter.onerror = () => this.setDuck(false);
    synth.cancel();
    synth.speak(utter);
  }

  /** Warm the cache so the first stinger plays without a delay. */
  public preloadAudioFiles() {
    if (this.muted) return;
    [ORDER_COMPLETE_URL, LEVEL_UP_URL].forEach((u) => void this.loadBuffer(u));
  }

  private playFile(url: string, volume: number, onMissing: () => void) {
    void this.loadBuffer(url).then((buf) => {
      if (this.muted) return;
      const ctx = this.ensureContext();
      if (!buf || !ctx) {
        onMissing();
        return;
      }
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      src.buffer = buf;
      gain.gain.value = volume;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    });
  }

  /**
   * Background music: loops `public/assets/audio/ambient.mp3` gaplessly when present,
   * otherwise a soft synthesized oud phrase over a low D drone. Safe to call repeatedly.
   */
  public startAmbient() {
    this.ambientWanted = true;
    if (this.muted || typeof window === 'undefined') return;
    if (this.ambientSource || this.ambientTimer !== null || this.ambientScheduled) return;
    this.preloadAudioFiles();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.getVoices();
    // Data Saver or a 2G-class connection: play the synthesized oud loop and skip the 700 KB music file.
    if (prefersLightAudio()) {
      this.startAmbientSynth();
      return;
    }
    // The music must download fully before it can loop gaplessly, so fetch it once the page is idle:
    // on a slow connection the board art, screens and stingers arrive first, the music a moment later.
    this.ambientScheduled = true;
    const begin = () => {
      this.ambientScheduled = false;
      if (this.ambientWanted && !this.muted) this.loadAndLoopAmbient();
    };
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(begin, { timeout: 2500 });
    else window.setTimeout(begin, 1200);
  }

  private ambientScheduled = false;

  private loadAndLoopAmbient() {
    if (this.ambientSource || this.ambientTimer !== null) return;
    void this.loadBuffer(AMBIENT_URL).then((buf) => {
      if (!this.ambientWanted || this.muted || this.ambientSource || this.ambientTimer !== null) return;
      const ctx = this.ensureContext();
      if (!buf || !ctx) {
        this.startAmbientSynth();
        return;
      }
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      src.buffer = buf;
      src.loop = true;
      gain.gain.value = 0.6 * this.duck;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start();
      this.ambientSource = src;
      this.ambientGain = gain;
    });
  }

  private startAmbientSynth() {
    if (this.ambientTimer !== null || typeof window === 'undefined') return;
    if (!this.ensureContext()) return;
    this.ambientStep = 0;
    this.playAmbientStep();
    this.ambientTimer = window.setInterval(() => this.playAmbientStep(), AMBIENT_STEP_MS);
  }

  public stopAmbient() {
    this.ambientWanted = false;
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
      } catch {
        // already stopped
      }
      this.ambientSource = null;
      this.ambientGain = null;
    }
    if (this.ambientTimer !== null) {
      window.clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
  }

  private playAmbientStep() {
    const ctx = this.ensureContext();
    if (!ctx) {
      this.stopAmbient();
      return;
    }
    const now = ctx.currentTime;
    const noteIdx = AMBIENT_PHRASE[this.ambientStep % AMBIENT_PHRASE.length];

    if (this.ambientStep % AMBIENT_PHRASE.length === 0) {
      const drone = ctx.createOscillator();
      const droneGain = ctx.createGain();
      drone.type = 'sine';
      drone.frequency.value = HIJAZ_SCALE_HZ[0] / 4;
      droneGain.gain.setValueAtTime(0.0001, now);
      droneGain.gain.linearRampToValueAtTime(0.035, now + 1.5);
      droneGain.gain.linearRampToValueAtTime(0.0001, now + (AMBIENT_PHRASE.length * AMBIENT_STEP_MS) / 1000);
      drone.connect(droneGain);
      droneGain.connect(ctx.destination);
      drone.start(now);
      drone.stop(now + (AMBIENT_PHRASE.length * AMBIENT_STEP_MS) / 1000 + 0.1);
    }

    if (noteIdx >= 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = HIJAZ_SCALE_HZ[noteIdx] / 2;
      gain.gain.setValueAtTime(0.045 * this.duck, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.15);
    }
    this.ambientStep += 1;
  }

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
   * Ringing Najdi Brass Mortar (نجر) & Oud harmonic chime scaled by item level.
   * High-level merges (Lv.3+) trigger a multi-note Hijaz celebratory arpeggio shimmer.
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

    // High-level merge (Lv.3+) celebratory Hijaz sparkle cascade
    if (level >= 3) {
      const arpeggioCount = level >= 5 ? 5 : level === 4 ? 4 : 3;
      const sparkleRatios = [1.25, 1.5, 2.0, 2.5, 3.0].slice(0, arpeggioCount);
      sparkleRatios.forEach((ratio, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i % 2 === 0 ? 'triangle' : 'sine';
        const startAt = now + 0.06 + i * 0.055;
        osc.frequency.setValueAtTime(baseFreq * ratio, startAt);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * ratio * 1.03, startAt + 0.32);

        gain.gain.setValueAtTime(0.12, startAt);
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startAt);
        osc.stop(startAt + 0.38);
      });
    }
  }

  /**
   * Celebratory Oud & Brass fanfare when fulfilling a customer order or upgrading the Majlis
   */
  public playOrderComplete() {
    this.triggerHaptic('heavy');
    this.playFile(ORDER_COMPLETE_URL, 0.85, () => this.playOrderCompleteSynth());
  }

  /** Bigger fanfare for a level-up; falls back to the order-complete chime. */
  public playLevelUp() {
    this.triggerHaptic('heavy');
    this.playFile(LEVEL_UP_URL, 0.9, () => this.playOrderCompleteSynth());
  }

  private playOrderCompleteSynth() {
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

/** True when the player asked to save data or is on a very slow connection (Network Information API, where supported). */
function prefersLightAudio(): boolean {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(conn && (conn.saveData || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g'));
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
    return normalizeSave(JSON.parse(raw));
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
