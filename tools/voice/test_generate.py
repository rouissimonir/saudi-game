#!/usr/bin/env python3
"""Offline test for generate_elevenlabs.py against a local fake of the ElevenLabs API (no network, no key)."""
import json, os, subprocess, sys, tempfile, threading
from http.server import BaseHTTPRequestHandler, HTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, 'generate_elevenlabs.py')
seen, state = [], {'rate_limited': False}


def make_mp3():
    out = tempfile.mktemp(suffix='.mp3')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'sine=frequency=330:duration=1.0', '-b:a', '64k', out], check=True)
    data = open(out, 'rb').read(); os.unlink(out); return data


MP3 = make_mp3()


class Fake(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def do_GET(self):
        seen.append(('GET', self.path, self.headers.get('xi-api-key'), None))
        body = json.dumps({'voices': [{'voice_id': 'v_noura', 'name': 'Test Voice', 'category': 'premade', 'labels': {'gender': 'female', 'accent': 'saudi', 'language': 'ar'}}]}).encode()
        self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(body)

    def do_POST(self):
        n = int(self.headers.get('Content-Length', 0)); body = json.loads(self.rfile.read(n))
        seen.append(('POST', self.path, self.headers.get('xi-api-key'), body))
        if not state['rate_limited']:
            state['rate_limited'] = True
            self.send_response(429); self.send_header('Retry-After', '0'); self.end_headers(); self.wfile.write(b'{"detail":"slow down"}'); return
        self.send_response(200); self.send_header('Content-Type', 'audio/mpeg'); self.end_headers(); self.wfile.write(MP3)


srv = HTTPServer(('127.0.0.1', 0), Fake)
threading.Thread(target=srv.serve_forever, daemon=True).start()
env = dict(os.environ, ELEVENLABS_BASE_URL=f'http://127.0.0.1:{srv.server_port}', ELEVENLABS_API_KEY='test-key-123')
failures = []


def check(ok, msg):
    print(('PASS ' if ok else 'FAIL ') + msg)
    if not ok: failures.append(msg)


def run(*args):
    return subprocess.run([sys.executable, SCRIPT, *args], env=env, capture_output=True, text=True)


# voices.json with an id for noura only, written to a temp copy so the repo config is untouched
cfg_path = os.path.join(HERE, 'voices.json'); original = open(cfg_path).read()
cfg = json.loads(original)
for v in cfg['voices'].values():
    v['voice_id'] = ''
cfg['voices']['noura']['voice_id'] = 'v_noura'
cfg['voices']['noura'].update(stability=0.5, speed=0.88)
cfg['model_id'] = 'eleven_multilingual_v2'
open(cfg_path, 'w').write(json.dumps(cfg))
out = tempfile.mkdtemp()
try:
    r = run('voices'); check(r.returncode == 0 and 'v_noura' in r.stdout and 'Test Voice' in r.stdout, 'voices lists the account voices')
    check(seen[0][2] == 'test-key-123', 'API key is sent in the xi-api-key header')

    seen.clear()
    r = run('generate', '--only', 'noura', '--limit', '2', '--out', out)
    check(r.returncode == 0, 'generate succeeds (exit %d) %s' % (r.returncode, r.stderr.strip()[-120:]))
    posts = [s for s in seen if s[0] == 'POST']
    check(len(posts) == 3, 'a 429 is retried: 2 lines took 3 POSTs (got %d)' % len(posts))
    p = posts[-1]
    check(p[1].startswith('/v1/text-to-speech/v_noura?output_format=mp3_44100_128'), 'URL uses the voice id and output format: ' + p[1])
    body = p[3]
    check(body['model_id'] == 'eleven_multilingual_v2' and body['text'] == 'تفضّلوا تفضّلوا، القهوة جاهزة والهيل طيّب', 'body has the model and the Arabic text')
    vs = body['voice_settings']
    check(vs['stability'] == 0.5 and vs['speed'] == 0.88 and vs['use_speaker_boost'] is True, 'voice settings come from voices.json')
    files = sorted(f for f in os.listdir(out) if f.endswith('.mp3'))
    check(files == ['noura_greet_1.mp3', 'noura_greet_2.mp3'], 'files are named by line id: %s' % files)
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(out, files[0])], capture_output=True, text=True).stdout)
    check(0.3 < dur < 1.3, 'output is a decodable mp3 (%.2fs after trim and loudness matching)' % dur)

    seen.clear(); r = run('generate', '--only', 'noura', '--limit', '2', '--out', out)
    check(not [s for s in seen if s[0] == 'POST'] and 'skipped 2 unchanged' in r.stdout, 're-run skips unchanged lines (no API calls, no cost)')

    seen.clear(); r = run('generate', '--only', 'noura', '--limit', '1', '--force', '--out', out)
    check(len([s for s in seen if s[0] == 'POST']) == 1, '--force regenerates')

    r = run('generate', '--only', 'faisal', '--out', out)
    check(r.returncode != 0 and 'faisal' in r.stderr, 'a character without a voice_id is refused before any API call')

    r = subprocess.run([sys.executable, SCRIPT, 'generate', '--dry-run', '--limit', '1'], env={k: v for k, v in env.items() if k != 'ELEVENLABS_API_KEY'}, capture_output=True, text=True)
    check(r.returncode == 0, 'dry-run needs no API key')
    r = subprocess.run([sys.executable, SCRIPT, 'voices'], env={k: v for k, v in env.items() if k != 'ELEVENLABS_API_KEY'}, capture_output=True, text=True)
    check(r.returncode != 0 and 'ELEVENLABS_API_KEY' in r.stderr, 'a missing key gives a clear error')
finally:
    open(cfg_path, 'w').write(original)
sys.exit(1 if failures else 0)
