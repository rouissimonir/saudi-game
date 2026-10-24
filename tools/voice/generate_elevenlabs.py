#!/usr/bin/env python3
"""Generate the character voice lines with ElevenLabs text-to-speech (standard library only).

Setup (the key is read from the environment and never written to disk):
    export ELEVENLABS_API_KEY=...            # from elevenlabs.io > Profile > API keys
    python3 tools/voice/generate_elevenlabs.py voices            # list voices on your account (pick one per character)
    python3 tools/voice/generate_elevenlabs.py library           # browse Arabic voices in the shared Voice Library
    # put the chosen voice_id values in tools/voice/voices.json, then:
    python3 tools/voice/generate_elevenlabs.py generate --dry-run
    python3 tools/voice/generate_elevenlabs.py generate --limit 1      # try a single line first
    python3 tools/voice/generate_elevenlabs.py generate                # all lines

Lines come from tools/voice/lines.json (refresh with `npm run voice:export`). Output goes to
public/assets/audio/voice/<id>.mp3, where the game picks it up automatically. Lines whose text, voice and
settings have not changed since the last run are skipped (see manifest.json), so re-running is cheap.
Licensing: generated audio may only be used commercially on a plan that allows it, and each library voice has its
own licence; check both before shipping.
"""
import argparse, hashlib, json, os, shutil, subprocess, sys, tempfile, time
import urllib.error, urllib.parse, urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
BASE = os.environ.get('ELEVENLABS_BASE_URL', 'https://api.elevenlabs.io').rstrip('/')
DEFAULT_OUT = os.path.join(ROOT, 'public', 'assets', 'audio', 'voice')
LINES = os.path.join(ROOT, 'tools', 'voice', 'lines.json')
CONFIG = os.path.join(ROOT, 'tools', 'voice', 'voices.json')


def fail(msg, code=2):
    print('error: ' + msg, file=sys.stderr)
    sys.exit(code)


def api_key():
    key = os.environ.get('ELEVENLABS_API_KEY', '').strip()
    if not key:
        fail('ELEVENLABS_API_KEY is not set (export it in your shell; do not paste it into chat or commit it).')
    return key


def call(method, path, body=None, retries=4):
    """HTTP call with retry/backoff on 429 and 5xx. Returns (bytes, content_type)."""
    url = BASE + path
    data = json.dumps(body).encode('utf-8') if body is not None else None
    headers = {'xi-api-key': api_key(), 'Accept': 'audio/mpeg, application/json'}
    if data is not None:
        headers['Content-Type'] = 'application/json'
    for attempt in range(retries + 1):
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read(), r.headers.get('Content-Type', '')
        except urllib.error.HTTPError as e:
            detail = e.read().decode('utf-8', 'replace')[:400]
            if e.code in (429, 500, 502, 503, 504) and attempt < retries:
                wait = float(e.headers.get('Retry-After') or 2 ** attempt)
                print(f'  HTTP {e.code}, retrying in {wait:g}s ...', file=sys.stderr)
                time.sleep(wait)
                continue
            if e.code in (401, 403):
                fail(f'ElevenLabs rejected the key or plan (HTTP {e.code}): {detail}', 3)
            fail(f'HTTP {e.code} from {path}: {detail}', 4)
        except urllib.error.URLError as e:
            fail(f'cannot reach {BASE} ({e.reason}). If this runs in a restricted sandbox, allow api.elevenlabs.io.', 5)


def cmd_voices(args):
    data, _ = call('GET', '/v1/voices')
    voices = json.loads(data).get('voices', [])
    print(f'{len(voices)} voices on this account:')
    for v in voices:
        labels = v.get('labels') or {}
        print(f"  {v['voice_id']}  {v.get('name', '?'):28s} {v.get('category', ''):12s} "
              f"{labels.get('gender', ''):7s} {labels.get('accent', ''):12s} {labels.get('language', '')}")


def cmd_library(args):
    q = urllib.parse.urlencode({'language': args.language, 'page_size': args.limit, **({'gender': args.gender} if args.gender else {})})
    data, _ = call('GET', '/v1/shared-voices?' + q)
    voices = json.loads(data).get('voices', [])
    print(f'{len(voices)} shared-library voices (language={args.language}). Add one to your account on the ElevenLabs site first,')
    print('then its voice_id appears under `voices`. Check each voice licence for commercial use.')
    for v in voices:
        print(f"  {v.get('voice_id', '?')}  {v.get('name', '?'):26s} {v.get('gender', ''):7s} {v.get('accent', ''):12s} {v.get('use_case', '')}  {v.get('description', '')[:60]}")


def file_hash(text, voice, cfg):
    blob = json.dumps({'t': text, 'v': voice, 'm': cfg['model_id'], 'f': cfg['output_format']}, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(blob.encode('utf-8')).hexdigest()[:16]


def normalise(src, dst):
    """Trim edge silence and match loudness so every character sits at a similar level (needs ffmpeg)."""
    af = ('silenceremove=start_periods=1:start_threshold=-50dB:start_duration=0.02,areverse,'
          'silenceremove=start_periods=1:start_threshold=-50dB:start_duration=0.02,areverse,'
          'loudnorm=I=-18:TP=-2:LRA=7')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', af, '-ar', '44100', '-b:a', '128k', dst], check=True)


def cmd_generate(args):
    plan = json.load(open(LINES, encoding='utf-8'))['lines']
    cfg = json.load(open(CONFIG, encoding='utf-8'))
    only = set(args.only.split(',')) if args.only else None
    todo = [l for l in plan if not only or l['character'] in only]
    if args.limit:
        todo = todo[:args.limit]
    missing = sorted({l['character'] for l in todo if not cfg['voices'].get(l['character'], {}).get('voice_id')})
    if missing and not args.dry_run:
        fail('no voice_id set in tools/voice/voices.json for: ' + ', '.join(missing))
    os.makedirs(args.out, exist_ok=True)
    manifest_path = os.path.join(args.out, 'manifest.json')
    manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}
    do_norm = (not args.no_normalize) and shutil.which('ffmpeg') is not None
    if not args.no_normalize and not do_norm:
        print('note: ffmpeg not found, skipping loudness matching and silence trim', file=sys.stderr)

    chars = made = skipped = 0
    for l in todo:
        v = cfg['voices'].get(l['character'], {})
        out_path = os.path.join(args.out, l['id'] + '.mp3')
        h = file_hash(l['ar'], v.get('voice_id', ''), cfg)
        if not args.force and os.path.exists(out_path) and manifest.get(l['id'], {}).get('hash') == h:
            skipped += 1
            continue
        chars += len(l['ar'])
        if args.dry_run:
            print(f"would generate {l['id']:20s} ({len(l['ar']):2d} chars) voice={v.get('voice_id') or '<unset>'}  {l['ar']}")
            made += 1
            continue
        body = {
            'text': l['ar'],
            'model_id': cfg['model_id'],
            'voice_settings': {'stability': v['stability'], 'similarity_boost': v['similarity_boost'],
                               'style': v['style'], 'use_speaker_boost': True, 'speed': v['speed']},
        }
        path = f"/v1/text-to-speech/{v['voice_id']}?output_format={cfg['output_format']}"
        audio, ctype = call('POST', path, body)
        if 'audio' not in ctype and not audio[:3] in (b'ID3', b'\xff\xfb', b'\xff\xf3', b'\xff\xf2'):
            fail(f"unexpected response for {l['id']} (content-type {ctype!r}): {audio[:200]!r}")
        if do_norm:
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp:
                tmp.write(audio)
            try:
                normalise(tmp.name, out_path)
            finally:
                os.unlink(tmp.name)
        else:
            open(out_path, 'wb').write(audio)
        manifest[l['id']] = {'hash': h, 'chars': len(l['ar']), 'voice_id': v['voice_id']}
        json.dump(manifest, open(manifest_path, 'w'), indent=2, ensure_ascii=False)
        made += 1
        print(f"generated {l['id']}")
    verb = 'would generate' if args.dry_run else 'generated'
    print(f'{verb} {made} lines ({chars} characters billed), skipped {skipped} unchanged')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    sub.add_parser('voices', help='list voices on your account').set_defaults(fn=cmd_voices)
    lib = sub.add_parser('library', help='browse shared-library voices')
    lib.add_argument('--language', default='ar'); lib.add_argument('--gender', choices=['male', 'female']); lib.add_argument('--limit', type=int, default=30)
    lib.set_defaults(fn=cmd_library)
    g = sub.add_parser('generate', help='generate the mp3 files')
    g.add_argument('--only', help='comma list of characters, e.g. noura,tariq')
    g.add_argument('--limit', type=int, help='only the first N lines (cheap trial)')
    g.add_argument('--dry-run', action='store_true'); g.add_argument('--force', action='store_true')
    g.add_argument('--no-normalize', action='store_true'); g.add_argument('--out', default=DEFAULT_OUT)
    g.set_defaults(fn=cmd_generate)
    args = ap.parse_args()
    args.fn(args)


if __name__ == '__main__':
    main()
