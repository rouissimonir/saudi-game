"""Cut an illustrated story portrait out of its flat backdrop and size it for the scene player.

The image model paints each portrait on a plain warm-beige backdrop (docs/ASSETS.md, section 3c). This samples
that colour from the border, flood-fills everything connected to the edge that is close to it, feathers the
edge, and writes a 768x1024 PNG with a transparent background. Convert to WebP with tools/art/to_webp.py.

    python3 tools/art/cutout_portrait.py in.png public/assets/art/story/layla_happy.png
"""
import os
import sys
from collections import deque

from PIL import Image, ImageFilter

W, H = 768, 1024
TOLERANCE = int(os.environ.get("CUTOUT_TOLERANCE", "12"))  # max RGB distance from the backdrop colour that still counts as backdrop; the generated backdrops are flat, and 30 let shaded cream fabric leak


def backdrop_colour(img):
    w, h = img.size
    px = img.load()
    samples = [px[x, y] for x in range(0, w, 8) for y in (0, h - 1)] + [px[x, y] for y in range(0, h, 8) for x in (0, w - 1)]
    samples.sort(key=sum)
    return samples[len(samples) // 2]  # median by brightness, robust to a stray edge pixel


def cutout(src, dst):
    img = Image.open(src).convert('RGB').resize((W, H), Image.LANCZOS)
    px = img.load()
    bg = backdrop_colour(img)
    tol2 = TOLERANCE * TOLERANCE
    near = lambda c: (c[0] - bg[0]) ** 2 + (c[1] - bg[1]) ** 2 + (c[2] - bg[2]) ** 2 <= tol2

    mask = Image.new('L', (W, H), 255)
    m = mask.load()
    queue = deque((x, y) for x in range(W) for y in (0, H - 1))
    queue.extend((x, y) for y in range(H) for x in (0, W - 1))
    while queue:
        x, y = queue.popleft()
        if m[x, y] == 0 or not near(px[x, y]):
            continue
        m[x, y] = 0
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < W and 0 <= ny < H and m[nx, ny]:
                queue.append((nx, ny))

    # Shrink by a pixel to drop the beige fringe, then soften so the edge blends over any backdrop.
    mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    out = img.convert('RGBA')
    out.putalpha(mask)
    out.save(dst, optimize=True)
    print(f'{src} -> {dst} (backdrop {bg})')


if __name__ == '__main__':
    cutout(sys.argv[1], sys.argv[2])
