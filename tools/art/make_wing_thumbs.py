"""Cut a thumbnail of each Majlis wing out of the painted restoration stages.

The Majlis view shows a small picture on every wing card: the run-down wing (cut from stage 1) until it is
renovated, then the restored wing (cut from the last stage). The wings sit in the same place in every stage of an
area, so one crop rectangle per wing serves both. The centres below are where each wing is in the picture
(fractions of its width and height, wings in the order of the area's wing list in src/game/progression.ts and
src/game/rules.ts). Re-run after repainting a stage:

    python3 tools/art/make_wing_thumbs.py

Writes public/assets/art/majlis/wings/<area>_<wing>_ruin.webp and _done.webp (480x210).
"""
import os

from PIL import Image

STAGES = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'assets', 'art', 'majlis')
OUT = os.path.join(STAGES, 'wings')

# (x, y) centre of each wing, left to right as listed in the area's wing order
RECTS = {
    'diriyah': [(0.125, 0.57), (0.375, 0.64), (0.76, 0.58), (0.58, 0.88)],
    'jeddah': [(0.17, 0.45), (0.43, 0.58), (0.64, 0.84), (0.86, 0.40)],
    'alula': [(0.12, 0.62), (0.42, 0.60), (0.66, 0.78), (0.88, 0.66)],
    'taif': [(0.14, 0.58), (0.45, 0.56), (0.84, 0.30), (0.85, 0.82)],
    'abha': [(0.10, 0.64), (0.38, 0.44), (0.62, 0.60), (0.86, 0.82)],
    # Al-Ahsa has four wings in the game; the painting shows three, so the souq is cut from the market-like space between the spring and the press
    'ahsa': [(0.12, 0.60), (0.30, 0.56), (0.50, 0.60), (0.88, 0.52)],
    'riyadh': [(0.12, 0.66), (0.40, 0.55), (0.64, 0.52), (0.88, 0.56)],
    # Khobar also has four wings; the Pearl Divers' Majlis is cut from the stone quay and steps by the water
    'khobar': [(0.16, 0.58), (0.30, 0.80), (0.50, 0.56), (0.84, 0.56)],
}
CROP_W = 0.36  # fraction of the picture's width
SIZE = (480, 210)  # 16:7


def crop(img, cx, cy):
    w, h = img.size
    cw = int(w * CROP_W)
    ch = int(cw * SIZE[1] / SIZE[0])
    x0 = int(min(max(cx * w - cw / 2, 0), w - cw))
    y0 = int(min(max(cy * h - ch / 2, 0), h - ch))
    return img.crop((x0, y0, x0 + cw, y0 + ch)).resize(SIZE, Image.LANCZOS)


def main():
    os.makedirs(OUT, exist_ok=True)
    total = count = 0
    for area, centres in RECTS.items():
        for state, stage in (('ruin', 1), ('done', 3)):
            img = Image.open(os.path.join(STAGES, f'{area}_{stage}.webp')).convert('RGB')
            for i, (cx, cy) in enumerate(centres):
                path = os.path.join(OUT, f'{area}_{i}_{state}.webp')
                crop(img, cx, cy).save(path, 'WEBP', quality=72, method=6)
                total += os.path.getsize(path)
                count += 1
    print(f'{count} thumbnails, {total // 1024} KB')


if __name__ == '__main__':
    main()
