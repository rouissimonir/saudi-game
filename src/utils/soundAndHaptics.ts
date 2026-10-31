import { GameState } from '../game/rules';
import { loadSave, persistSave, removeSave } from './saveStorage';
import { assetUrl } from './assetUrl';
import { VoiceCharacter, VoiceEvent, VoiceProfile, pickVoiceLine, voiceFileUrl } from '../game/voiceLines';
import { loadHapticsEnabled, triggerDeviceHaptic } from './haptics';


/** D Hijaz maqam (D Eb F# G A Bb C# D) in Hz, one octave. */
export const HIJAZ_SCALE_HZ = [293.66, 311.13, 369.99, 392.0, 440.0, 466.16, 554.37, 587.33];

/** Looping oud phrase as indices into HIJAZ_SCALE_HZ; -1 is a rest. Ends on the tonic. */
export const AMBIENT_PHRASE = [0, 2, 3, 2, 1, 0, -1, 4, 3, 2, 3, 5, 4, 3, 2, 1, 0, -1, 0, 1, 2, 3, 4, 7, 5, 4, 3, 2, 1, 0, -1, -1];
const AMBIENT_STEP_MS = 520;
const AMBIENT_URL = assetUrl('assets/audio/ambient.mp3');
const ORDER_COMPLETE_URL = assetUrl('assets/audio/order_complete.mp3');
const LEVEL_UP_URL = assetUrl('assets/audio/level_up.mp3');
const MUTE_KEY = 'qahwa_sound_muted';

export function loadMuted(): boolean {
  try { return localStorage.getItem(MUTE_KEY) === 'true'; } catch { return false; }
}

export function saveMuted(muted: boolean): void {
  try { localStorage.setItem(MUTE_KEY, String(muted)); } catch { /* The setting remains active for this session. */ }
}

export interface AudioFileReport {
  url: string;
  ok: boolean;
  stage: 'decoded' | 'not found' | 'error';
  detail: string;
}

export interface AudioDiagnostics {
  contextState: string;
  muted: boolean;
  audioSession: string;
  lastVoicePlayback: string;
  files: AudioFileReport[];
}

class NotFoundError extends Error {}

export class SoundAndHapticsManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted = false;
  private audioGeneration = 0;
  private voiceSource: AudioBufferSourceNode | null = null;
  private speaking = false;
  public get muted(): boolean { return this.isMuted; }
  public set muted(value: boolean) {
    if (this.isMuted === value) return;
    this.isMuted = value;
    if (this.ctx && this.masterGain) this.masterGain.gain.setValueAtTime(value ? 0 : 1, this.ctx.currentTime);
    if (value) {
      this.audioGeneration++;
      this.stopStoryLine();
      if (this.voiceSource) {
        try { this.voiceSource.stop(); } catch { /* already stopped */ }
        this.voiceSource = null;
      }
      if (this.voiceElement) {
        try { this.voiceElement.pause(); } catch { /* already stopped */ }
        this.voiceElement = null;
      }
      if (this.speaking && typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
      this.speaking = false;
      this.setDuck(false);
      this.stopAmbient();
    }
  }
  public hapticsEnabled = loadHapticsEnabled();
  private ambientTimer: number | null = null;
  private ambientStep = 0;

  private ambientWanted = false;
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientGain: GainNode | null = null;
  private duck = 1;
  private fileBuffers = new Map<string, AudioBuffer | 'missing'>();
  private fileLoading = new Map<string, Promise<AudioBuffer | null>>();

  /** Why each audio file loaded or failed; read by the in-game Audio check so a phone failure is visible. */
  private reports = new Map<string, AudioFileReport>();
  /** Files the server answered with 404: genuinely absent, as opposed to present but unreadable. */
  private notFound = new Set<string>();
  private lastPlayback = 'none yet';

  private report(url: string, r: Omit<AudioFileReport, 'url'>) {
    this.reports.set(url, { url, ...r });
  }

  /** Read a file as bytes. fetch first; XMLHttpRequest as a second try, because some WebViews serve app files to one and not the other. */
  private async readBytes(url: string): Promise<ArrayBuffer> {
    let fetchError = '';
    try {
      const r = await fetch(url);
      if (r.status === 404) {
        this.notFound.add(url);
        throw new NotFoundError();
      }
      if (!r.ok) throw new Error(`fetch status ${r.status}`);
      const data = await r.arrayBuffer();
      if (data.byteLength === 0) throw new Error('fetch returned 0 bytes');
      return data;
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      fetchError = e instanceof Error ? e.message : String(e);
    }
    if (typeof XMLHttpRequest === 'undefined') throw new Error(`fetch failed: ${fetchError}`);
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = 'arraybuffer';
      xhr.onload = () => {
        const data = xhr.response as ArrayBuffer | null;
        if ((xhr.status === 200 || xhr.status === 0) && data && data.byteLength > 0) resolve(data);
        else reject(new Error(`fetch failed: ${fetchError}; xhr status ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error(`fetch failed: ${fetchError}; xhr network error`));
      xhr.send();
    });
  }

  /** Decode with both the promise and the callback form of decodeAudioData, so older WebKit also works. */
  private decode(ctx: AudioContext, data: ArrayBuffer): Promise<AudioBuffer> {
    return new Promise<AudioBuffer>((resolve, reject) => {
      const maybe = ctx.decodeAudioData(data, resolve, (err) => reject(err ?? new Error('decodeAudioData failed')));
      if (maybe && typeof maybe.then === 'function') maybe.then(resolve, reject);
    });
  }

  /** Fetch and decode an audio file once; resolves null if it is missing or unreadable (the reason is kept in `reports`). */
  private loadBuffer(url: string): Promise<AudioBuffer | null> {
    const cached = this.fileBuffers.get(url);
    if (cached) return Promise.resolve(cached === 'missing' ? null : cached);
    const inflight = this.fileLoading.get(url);
    if (inflight) return inflight;
    const ctx = this.ensureContext();
    if (!ctx || typeof fetch === 'undefined') return Promise.resolve(null);
    const p = this.readBytes(url)
      .then(async (data) => {
        const bytes = data.byteLength;
        try {
          const buf = await this.decode(ctx, data);
          this.report(url, { ok: true, stage: 'decoded', detail: `${bytes} bytes` });
          this.fileBuffers.set(url, buf);
          return buf as AudioBuffer | null;
        } catch (e) {
          throw new Error(`decode failed (${bytes} bytes): ${e instanceof Error ? e.message : String(e)}`);
        }
      })
      .catch((e: unknown) => {
        const notFound = e instanceof NotFoundError;
        this.report(url, { ok: false, stage: notFound ? 'not found' : 'error', detail: notFound ? '404' : e instanceof Error ? e.message : String(e) });
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
    const generation = this.audioGeneration;
    const url = voiceFileUrl(id);

    void this.loadBuffer(url).then((buf) => {
      if (this.muted || generation !== this.audioGeneration) return;
      const ctx = this.ensureContext();
      if (buf && ctx) {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(this.output(ctx));
        this.setDuck(true);
        src.onended = () => { if (this.voiceSource === src) { this.voiceSource = null; this.setDuck(false); } };
        src.start();
        this.voiceSource = src;
        this.lastPlayback = `${id}: recorded file (Web Audio)`;
        return;
      }
      if (this.notFound.has(url)) {
        // Only a file that genuinely is not shipped falls back to the phone's formal-Arabic voice.
        this.lastPlayback = `${id}: file not found, device Arabic voice`;
        this.speakArabic(line.ar, profile);
        return;
      }
      // The file is shipped but Web Audio could not load or play it. Try a plain audio element before giving up;
      // never read a dialect line with the device's formal-Arabic voice.
      this.playWithElement(url, id);
    });
  }

  private voiceElement: HTMLAudioElement | null = null;

  /** Second route for a shipped file that Web Audio could not load: an <audio> element. */
  private playWithElement(url: string, id: string) {
    if (typeof Audio === 'undefined') {
      this.lastPlayback = `${id}: recorded file could not be loaded; silent`;
      return;
    }
    try {
      const el = new Audio(url);
      const done = () => { if (this.voiceElement === el) { this.voiceElement = null; this.setDuck(false); } };
      el.onended = done;
      el.onerror = () => { done(); this.lastPlayback = `${id}: <audio> element error; silent`; };
      this.voiceElement = el;
      this.setDuck(true);
      const started = el.play();
      this.lastPlayback = `${id}: recorded file (<audio> element)`;
      if (started && typeof started.catch === 'function') {
        started.catch((e: unknown) => { done(); this.lastPlayback = `${id}: <audio> play() rejected (${e instanceof Error ? e.name : String(e)}); silent`; });
      }
    } catch (e) {
      this.lastPlayback = `${id}: <audio> element failed (${e instanceof Error ? e.message : String(e)}); silent`;
    }
  }

  /** Snapshot for the Audio check screen. */
  public getAudioDiagnostics(): AudioDiagnostics {
    const audioSession = typeof navigator !== 'undefined' ? (navigator as unknown as { audioSession?: { type?: string } }).audioSession?.type : undefined;
    return {
      contextState: this.ctx ? this.ctx.state : 'not created',
      muted: this.muted,
      audioSession: audioSession ?? 'n/a',
      lastVoicePlayback: this.lastPlayback,
      files: [...this.reports.values()],
    };
  }

  /**
   * Load and play one real character line, then describe what happened. Used by the menu's Audio check:
   * if this says "loaded and played" but nothing is heard, the phone is silencing Web Audio (Ring/Silent switch or volume).
   */
  public async runAudioSelfTest(): Promise<string> {
    if (typeof window === 'undefined') return 'No window.';
    this.unlockAudio();
    const id = 'noura_served_1';
    const url = voiceFileUrl(id);
    const ctx = this.ensureContext();
    const lines: string[] = [];
    if (!ctx) lines.push('Web Audio could not be created (muted or unsupported).');
    else {
      lines.push(`Audio context: ${ctx.state}`);
      this.fileBuffers.delete(url);
      const buf = await this.loadBuffer(url);
      if (buf) {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(this.output(ctx));
        src.start();
        lines.push(`${id}: loaded (${buf.duration.toFixed(1)} s) and played with Web Audio.`);
        lines.push('If you heard nothing: turn the Ring/Silent switch to ring and raise the media volume.');
      } else {
        const r = this.reports.get(url);
        lines.push(`${id}: FAILED to load. ${r ? `${r.stage}: ${r.detail}` : 'no report'}`);
      }
    }
    const d = this.getAudioDiagnostics();
    lines.push(`Audio session: ${d.audioSession}`);
    lines.push(`Last character line: ${d.lastVoicePlayback}`);
    const failed = d.files.filter((f) => !f.ok);
    lines.push(`Files loaded: ${d.files.length - failed.length}, failed: ${failed.length}`);
    failed.slice(0, 4).forEach((f) => lines.push(`  ${f.url.split('/').slice(-2).join('/')} - ${f.stage}: ${f.detail}`));
    return lines.join('\n');
  }

  private storySource: AudioBufferSourceNode | null = null;
  private storyRequest = 0;

  /** Fetch and decode a story line ahead of its beat, so it starts with its text even on a slow connection. */
  public preloadStoryLine(id: string) {
    if (this.muted || typeof window === 'undefined') return;
    this.trackStoryLoad(this.loadBuffer(assetUrl(`assets/audio/story/${id}.mp3`)));
  }

  /** Story lines still downloading; the 700 KB music waits for them so a voice never queues behind it. */
  private storyLoads = new Set<Promise<unknown>>();

  private trackStoryLoad<T>(p: Promise<T>): Promise<T> {
    this.storyLoads.add(p);
    void p.finally(() => this.storyLoads.delete(p));
    return p;
  }

  /** Voiced story-scene line (public/assets/audio/story/<id>.mp3). Stops the previous line; silent if the file is missing. */
  public playStoryLine(id: string) {
    this.stopStoryLine();
    if (this.muted || typeof window === 'undefined') return;
    const request = this.storyRequest;
    void this.trackStoryLoad(this.loadBuffer(assetUrl(`assets/audio/story/${id}.mp3`))).then((buf) => {
      if (request !== this.storyRequest) return;
      const ctx = this.ensureContext();
      if (!buf || !ctx || this.muted) return;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.output(ctx));
      this.setDuck(true);
      src.onended = () => {
        if (this.storySource === src) {
          this.storySource = null;
          this.setDuck(false);
        }
      };
      src.start();
      this.storySource = src;
    });
  }

  public stopStoryLine() {
    this.storyRequest += 1;
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
    utter.onstart = () => { this.speaking = true; this.setDuck(true); };
    utter.onend = () => { this.speaking = false; this.setDuck(false); };
    utter.onerror = () => { this.speaking = false; this.setDuck(false); };
    synth.cancel();
    this.speaking = true;
    synth.speak(utter);
  }

  /** Warm the cache so the first stinger plays without a delay. */
  public preloadAudioFiles() {
    if (this.muted) return;
    [ORDER_COMPLETE_URL, LEVEL_UP_URL].forEach((u) => void this.loadBuffer(u));
  }

  private playFile(url: string, volume: number, onMissing: () => void) {
    const generation = this.audioGeneration;
    void this.loadBuffer(url).then((buf) => {
      if (this.muted || generation !== this.audioGeneration) return;
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
      gain.connect(this.output(ctx));
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
      if (this.storyLoads.size) {
        void Promise.allSettled([...this.storyLoads]).then(begin);
        return;
      }
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
      gain.connect(this.output(ctx));
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
      droneGain.connect(this.output(ctx));
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
      gain.connect(this.output(ctx));
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
    // iOS can also leave a context 'interrupted' (a call, Siri, another app); resume that too.
    if (this.ctx && this.ctx.state !== 'running' && this.ctx.state !== 'closed' && typeof this.ctx.resume === 'function') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /** Call synchronously from a player gesture so iOS can activate Web Audio. */
  public unlockAudio(): void {
    this.ensureContext();
  }

  /** A shared output makes the mute control silence already-playing Web Audio nodes immediately. */
  private output(ctx: AudioContext): AudioNode {
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 1;
      this.masterGain.connect(ctx.destination);
    }
    return this.masterGain;
  }

  public triggerHaptic(intensity: 'light' | 'medium' | 'heavy' = 'light') {
    triggerDeviceHaptic(intensity, this.hapticsEnabled);
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
    gain.connect(this.output(ctx));
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
      gain.connect(this.output(ctx));
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
        gain.connect(this.output(ctx));
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
      gain.connect(this.output(ctx));
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
    gain.connect(this.output(ctx));
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

export function saveGameState(state: GameState): boolean {
  return persistSave(state);
}

export function loadSavedGameState(): GameState | null {
  return loadSave().state;
}

export function clearSavedGameState(): boolean {
  return removeSave();
}
