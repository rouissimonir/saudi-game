"""Round order-strip avatars cropped from the painted story portraits, so customers match the story cast.

Finds the top of the head in public/assets/art/story/<id>_neutral.webp, crops a square around the face and writes
public/assets/art/avatars/<id>.webp (256x256, transparent). Re-run after a neutral portrait changes.

    python3 tools/art/make_avatars.py
"""
import os

from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'assets', 'art')
CAST = ['noura', 'faisal', 'tariq', 'lama', 'sultan']
SIZE, CROP = 256, 340  # output size; crop side in the 768x1024 portrait (about one head and shoulders)


def opaque(band):
    return max(band.getextrema()) > 200


def avatar(cid):
    im = Image.open(os.path.join(ROOT, 'story', f'{cid}_neutral.webp')).convert('RGBA')
    alpha = im.getchannel('A')
    w, h = im.size
    top = next(y for y in range(h) if opaque(alpha.crop((0, y, w, y + 1))))
    band = alpha.crop((0, top, w, top + 260))
    cols = [x for x in range(w) if opaque(band.crop((x, 0, x + 1, band.height)))]
    cx = (cols[0] + cols[-1]) // 2
    y0 = max(0, top - 24)
    face = im.crop((cx - CROP // 2, y0, cx + CROP // 2, y0 + CROP)).resize((SIZE, SIZE), Image.LANCZOS)
    os.makedirs(os.path.join(ROOT, 'avatars'), exist_ok=True)
    face.save(os.path.join(ROOT, 'avatars', f'{cid}.webp'), 'WEBP', quality=84, method=6, alpha_quality=90)


if __name__ == '__main__':
    for cid in CAST:
        avatar(cid)
    print('avatars:', ', '.join(CAST))
