"""Numeric checks for the generated music (no listening required): tuning, duration, clipping, loudness and loop seam.

    python3 tools/audio/verify_music.py public/assets/audio
"""
import os, subprocess, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_music as M

FS = M.FS
out = sys.argv[1] if len(sys.argv) > 1 else 'public/assets/audio'
failures = []


def check(ok, msg):
    print(('PASS ' if ok else 'FAIL ') + msg)
    if not ok:
        failures.append(msg)


def f0(y, fmin, fmax):
    seg = y[int(0.04 * FS):int(0.6 * FS)]; seg = seg - seg.mean()
    n = 1 << int(np.ceil(np.log2(len(seg) * 2)))
    ac = np.fft.irfft(np.abs(np.fft.rfft(seg, n)) ** 2, n)[:len(seg)]; ac /= ac[0]
    lo, hi = int(FS / fmax), int(FS / fmin)
    k = lo + int(np.argmax(ac[lo:hi])); a, b, c = ac[k - 1], ac[k], ac[k + 1]
    return FS / (k + 0.5 * (a - c) / (a - 2 * b + c))


worst = max(abs(1200 * np.log2(f0(M.pluck(M.hz(n), 1.2, seed=1), 40, 1400) / M.hz(n)))
            for n in ['D2', 'A2', 'D3', 'G2', 'Bb3', 'C4', 'D4', 'Eb4', 'F#4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'F#5'])
check(worst < 2.0, 'plucked strings are in tune (worst error %.2f cents)' % worst)


def decode(name):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(out, name), '-f', 'f32le', '-ac', '2', '-ar', str(FS), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<f4').reshape(-1, 2).T


for name, lo, hi in (('ambient.mp3', 59.9, 60.2), ('order_complete.mp3', 2.0, 3.5), ('level_up.mp3', 3.0, 4.5)):
    x = decode(name); dur = x.shape[1] / FS
    rms = 20 * np.log10(np.sqrt((x ** 2).mean())); peak = np.abs(x).max()
    check(lo <= dur <= hi, '%s duration %.2fs' % (name, dur))
    check(peak < 0.999, '%s no clipping (peak %.1f dBFS)' % (name, 20 * np.log10(peak)))
    check(-26 < rms < -14, '%s loudness %.1f dBFS RMS' % (name, rms))

m = decode('ambient.mp3').mean(0)
step = abs(m[0] - m[-1]); typical = np.sqrt(np.mean(np.diff(m) ** 2))
check(step < 3 * typical, 'ambient loop seam is smooth (jump %.4f vs typical step %.4f)' % (step, typical))
sys.exit(1 if failures else 0)
