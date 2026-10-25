"""Procedural Khaleeji music: a seamless Hijaz-maqam oud loop plus two short stingers.

Uses numpy only (physical-model plucked strings, synthesized darbuka, convolution reverb) and ffmpeg for mp3.

    python3 tools/audio/make_music.py public/assets/audio
"""
import os, subprocess, sys, tempfile, wave
import numpy as np

FS = 44100
NOTE_BASE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def hz(name):
    """'F#4' -> Hz. Accepts # and b."""
    n = NOTE_BASE[name[0]]
    i = 1
    while name[i] in '#b':
        n += 1 if name[i] == '#' else -1
        i += 1
    octave = int(name[i:])
    return 440.0 * 2 ** ((n - 9 + 12 * (octave - 4)) / 12)


# ---------------------------------------------------------------- instruments
def pluck(freq, dur, tau=0.9, bright=0.55, pick=0.16, seed=0):
    """Karplus-Strong plucked string, block-vectorised, retuned by linear resampling."""
    P = FS / freq
    N = int(round(P - 0.5))  # the 2-tap averaging filter adds half a sample of delay: loop length is N + 0.5
    eff = N + 0.5
    total = int(dur * FS)
    rng = np.random.default_rng(seed)
    exc = rng.standard_normal(N)
    smooth = np.empty(N); acc = 0.0
    for i in range(N):  # one-pole lowpass on the excitation = brightness
        acc += bright * (exc[i] - acc); smooth[i] = acc
    smooth -= np.roll(smooth, max(1, int(pick * N)))  # pick-position comb
    smooth -= smooth.mean()
    nper = int(np.ceil(total * eff / P / N)) + 2
    out = np.zeros((nper + 1) * N + 1)
    out[1:N + 1] = smooth  # index shift of 1 so out[-1] reads a zero
    decay = np.exp(-N / (FS * tau))
    for k in range(1, nper):
        s = 1 + k * N
        out[s:s + N] = decay * 0.5 * (out[s - N:s] + out[s - N - 1:s - 1])
    sig = out[1:]
    t = np.arange(total) * (eff / P)
    y = np.interp(t, np.arange(len(sig)), sig)
    y *= np.minimum(1.0, (total - np.arange(total)) / (0.03 * FS))  # fade the tail
    return y / (np.max(np.abs(y)) + 1e-9)


def oud_note(name, dur, vel=1.0, seed=0, tau=0.9):
    f = hz(name)
    a = pluck(f * 2 ** (2 / 1200), dur, tau=tau, seed=seed)       # paired courses, detuned a few cents
    b = pluck(f * 2 ** (-2.5 / 1200), dur, tau=tau, seed=seed + 101)
    y = 0.55 * a + 0.45 * b
    click = np.random.default_rng(seed + 7).standard_normal(int(0.004 * FS)) * np.exp(-np.arange(int(0.004 * FS)) / (0.001 * FS))
    y[:len(click)] += 0.25 * click
    return y * vel


def fft_filter(x, curve):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / FS)
    return np.fft.irfft(X * curve(f), len(x))


def oud_body(f):
    g = 1.0 + 0.7 * np.exp(-((f - 190) / 90) ** 2) + 0.35 * np.exp(-((f - 2400) / 900) ** 2) + 0.5 * np.exp(-((f - 4200) / 1400) ** 2)
    return g / (1 + (f / 7500) ** 4)


def darbuka(kind, vel=1.0):
    n = int(0.5 * FS); t = np.arange(n) / FS
    if kind == 'dum':
        fr = 58 + 85 * np.exp(-t / 0.045)
        body = np.sin(2 * np.pi * np.cumsum(fr) / FS) * np.exp(-t / 0.16)
        tick = np.random.default_rng(3).standard_normal(n) * np.exp(-t / 0.006) * 0.15
        y = body + tick
    else:
        noise = np.diff(np.random.default_rng(5 if kind == 'tek' else 6).standard_normal(n + 1))  # highpass
        y = noise * np.exp(-t / (0.028 if kind == 'tek' else 0.02)) * 0.5
        y += np.sin(2 * np.pi * 820 * t) * np.exp(-t / 0.012) * 0.35
        if kind == 'ka':
            y *= 0.45
    return y * vel


def reverb_ir(rt60=1.9, seed=11):
    n = int(2.6 * FS); t = np.arange(n) / FS
    ir = np.zeros((2, n))
    for c in range(2):
        r = np.random.default_rng(seed + c).standard_normal(n) * np.exp(-6.9 * t / rt60)
        acc = 0.0
        for i in range(0, n, 1):  # gentle lowpass so the tail is warm, not hissy
            acc += 0.35 * (r[i] - acc); r[i] = acc
        ir[c] = r
    pre = int(0.018 * FS)
    ir = np.concatenate([np.zeros((2, pre)), ir], axis=1)
    return ir / np.sqrt((ir ** 2).sum(axis=1, keepdims=True)) * 0.9


def convolve(x, ir):
    size = 1 << int(np.ceil(np.log2(len(x) + ir.shape[1])))
    X = np.fft.rfft(x, size)
    return np.stack([np.fft.irfft(X * np.fft.rfft(ir[c], size), size)[:len(x) + ir.shape[1]] for c in range(2)])


# ---------------------------------------------------------------- score
BPM = 80
BEAT = 60.0 / BPM
PHRASES = [
    "D4:2 F#4:1 G4:1  A4:1.5 G4:.5 F#4:1 Eb4:1  D4:2 Eb4:.5 D4:.5 C4:1  D4:3 _:1",
    "A4:1 Bb4:1 A4:.5 G4:.5 F#4:1  G4:1 A4:1 Bb4:2  C5:1.5 Bb4:.5 A4:1 G4:1  F#4:1 Eb4:1 D4:2",
    "D5:2 C5:1 Bb4:1  A4:1 Bb4:.5 A4:.5 G4:1 F#4:1  G4:1 F#4:.5 Eb4:.5 D4:2  Eb4:1 F#4:1 G4:2",
    "A4:2 G4:1 F#4:1  Eb4:1.5 D4:.5 C4:1 D4:1  Eb4:1 D4:1 C4:1 Bb3:1  A3:2 D4:2",
    "F#4:1 G4:1 A4:2  G4:1 F#4:1 Eb4:1 D4:1  Eb4:.5 D4:.5 C4:1 D4:2  D4:3 _:1",
]
BASS = ["D3", "A2", "D3", "G2"]  # one bass pluck every 2 beats, cycling


def parse(phrase):
    out, t = [], 0.0
    for tok in phrase.split():
        name, d = tok.split(':'); d = float(d)
        if name != '_':
            out.append((name, t, d))
        t += d
    return out


def render_ambient(seconds_tail=3.2):
    beats = 16 * len(PHRASES)
    L = int(beats * BEAT * FS)
    T = L + int(seconds_tail * FS)
    rng = np.random.default_rng(42)
    oud = np.zeros(T); bass = np.zeros(T); perc = np.zeros(T); drone = np.zeros((2, T))

    def put(buf, y, start_s):
        i = int(start_s * FS)
        if i < 0:  # jitter or a grace note landing before time zero: drop the part that falls off the front
            y, i = y[-i:], 0
        n = min(len(y), T - i)
        if n > 0:
            buf[i:i + n] += y[:n]

    seed = 0
    for p, ph in enumerate(PHRASES):
        for k, (name, tb, d) in enumerate(parse(ph)):
            start = (p * 16 + tb) * BEAT + rng.normal(0, 0.008)
            dur = min(3.2, max(1.0, d * BEAT * 2.2))
            vel = 0.75 + 0.25 * rng.random() + (0.1 if tb % 4 == 0 else 0)
            if d >= 1.0 and k % 3 == 1:  # grace note a semitone-ish above, as oud players ornament
                g = hz(name) * 2 ** (1 / 12)
                put(oud, pluck(g, 0.25, tau=0.3, seed=seed + 900) * 0.4, start - 0.07)
            put(oud, oud_note(name, dur, vel, seed=seed, tau=0.8 + 0.15 * rng.random()), start)
            seed += 1
    for i in range(beats // 2):
        put(bass, oud_note(BASS[i % 4], 2.8, 0.9, seed=2000 + i, tau=1.2), i * 2 * BEAT)

    # maqsum: Dum Tek _ Tek Dum _ Tek _  (eighth notes), with a soft 'ka' ghost note
    eighth = BEAT / 2
    pattern = ['dum', 'tek', None, 'tek', 'dum', None, 'tek', 'ka']
    for bar in range(beats // 4):
        for i, hit in enumerate(pattern):
            if hit:
                put(perc, darbuka(hit, (1.0 if hit == 'dum' else 0.8 if hit == 'tek' else 0.5) * (0.9 + 0.1 * rng.random())), bar * 4 * BEAT + i * eighth + rng.normal(0, 0.004))

    # drone: D and A, slowly breathing, softly detuned between channels
    t = np.arange(T) / FS
    for c, det in enumerate((1.0, 1.0012)):
        d = np.zeros(T)
        for fr, amp in ((hz('D2'), 1.0), (hz('A2'), 0.55), (hz('D3'), 0.4)):
            for h, ha in ((1, 1.0), (2, 0.5), (3, 0.25)):
                d += amp * ha * np.sin(2 * np.pi * fr * det * h * t + c)
        d *= 0.7 + 0.3 * np.sin(2 * np.pi * t / (beats * BEAT / 5) + c)
        drone[c] = fft_filter(d, lambda f: 1 / (1 + (f / 500) ** 4))
    drone /= np.max(np.abs(drone)) + 1e-9

    oud = fft_filter(oud, oud_body); bass = fft_filter(bass, lambda f: oud_body(f) / (1 + (f / 900) ** 4))
    dry = oud + 0.45 * bass + 0.35 * perc
    wet = convolve(dry, reverb_ir())[:, :T]
    stereo = np.zeros((2, T))
    stereo += np.stack([dry * 0.9, dry * 0.9]) * 0.7
    stereo[0] += 0.12 * oud * 1.0; stereo[1] += 0.06 * oud  # slight left lean for the lead
    stereo += wet * 0.55
    stereo += drone * 0.06
    # wrap the tail onto the head so the loop is seamless
    loop = stereo[:, :L].copy()
    tail = stereo[:, L:L + (T - L)]
    loop[:, :tail.shape[1]] += tail
    fade = int(0.002 * FS)  # 2 ms fade-in: no click where the loop wraps onto the opening attack
    loop[:, :fade] *= np.linspace(0, 1, fade)
    return loop


def render_stinger(notes, tail=1.6, chord=None, drum=True, level=1.0):
    """notes: [(name, start_s, dur_s)] played as oud pluck + bell partials; chord: names sustained at the end."""
    end = max(s + d for _, s, d in notes) + tail
    T = int(end * FS); mix = np.zeros(T)

    def put(y, s):
        i = int(s * FS)
        if i < 0:
            y, i = y[-i:], 0
        n = min(len(y), T - i)
        if n > 0:
            mix[i:i + n] += y[:n]

    for j, (name, s, d) in enumerate(notes):
        put(oud_note(name, d + 0.6, 0.9, seed=300 + j, tau=0.7), s)
        f = hz(name) * 2
        tt = np.arange(int(0.9 * FS)) / FS
        put(0.12 * np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.25), s)  # bright bell partial
    if chord:
        s0 = max(s for _, s, _ in notes) + 0.12
        for j, name in enumerate(chord):
            put(oud_note(name, 1.8, 1.0, seed=500 + j, tau=1.0), s0 + 0.02 * j)
            tt = np.arange(int(1.4 * FS)) / FS
            put(0.14 * np.sin(2 * np.pi * hz(name) * 2 * tt) * np.exp(-tt / 0.5), s0 + 0.02 * j)
    if drum:
        put(darbuka('dum', 0.9), 0.0)
        put(darbuka('tek', 0.7), notes[-1][1])
    mix = fft_filter(mix, oud_body)
    wet = convolve(mix, reverb_ir(1.5))[:, :T]
    st = np.stack([mix, mix]) * 0.8 + wet * 0.5
    return st * level


# ---------------------------------------------------------------- output
def finalize(st, target_rms_db=-19.0, peak_db=-2.0):
    rms = np.sqrt(np.mean(st ** 2))
    st = st * (10 ** (target_rms_db / 20) / (rms + 1e-9))
    st = np.tanh(st * 1.2) / 1.2  # soft limiter
    peak = np.max(np.abs(st))
    lim = 10 ** (peak_db / 20)
    if peak > lim:
        st = st * (lim / peak)
    return st


def write_mp3(st, path, kbps=160):
    pcm = (np.clip(st.T, -1, 1) * 32767).astype('<i2')
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
        wavname = tmp.name
    with wave.open(wavname, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(FS); w.writeframes(pcm.tobytes())
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wavname, '-codec:a', 'libmp3lame', '-b:a', f'{kbps}k', path], check=True)
    os.unlink(wavname)


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else 'public/assets/audio'
    os.makedirs(out, exist_ok=True)
    only = os.environ.get('ONLY', 'ambient,order_complete,level_up').split(',')
    if 'ambient' in only:
        amb = finalize(render_ambient(), -20.0)
        write_mp3(amb, os.path.join(out, 'ambient.mp3'), 96)  # background loop: 96 kbps is transparent here and 25% smaller
        np.save(os.path.join(out, '..', '_ambient_preview.npy'), amb) if os.environ.get('KEEP') else None
        print('ambient', amb.shape[1] / FS, 's')
    if 'order_complete' in only:
        st = render_stinger([('D4', 0.0, 0.25), ('F#4', 0.2, 0.25), ('A4', 0.4, 0.25), ('D5', 0.6, 0.6)], chord=['D4', 'A4', 'D5'])
        write_mp3(finalize(st, -17.0), os.path.join(out, 'order_complete.mp3'), 128); print('order_complete', st.shape[1] / FS)
    if 'level_up' in only:
        run = [(n, i * 0.12, 0.2) for i, n in enumerate(['D4', 'Eb4', 'F#4', 'G4', 'A4', 'Bb4', 'C5', 'D5'])]
        st = render_stinger(run + [('F#5', 1.05, 0.8)], tail=2.0, chord=['D4', 'A4', 'D5', 'F#5'])
        write_mp3(finalize(st, -16.5), os.path.join(out, 'level_up.mp3'), 128); print('level_up', st.shape[1] / FS)
