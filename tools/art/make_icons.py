"""App icons from one square painting (docs/ART_BATCH_4.md, app_icon.png).

Writes the four PNGs the manifest and index.html point at, in public/icons/:
  icon-192.png, icon-512.png   the painting, full bleed (launchers round the corners themselves)
  maskable-512.png             the painting scaled into Android's safe zone (centre 80%) on the icon's own edge colour
  apple-touch-icon.png         180x180, opaque (iOS shows transparency as black)

    python3 tools/art/make_icons.py tools/art/background_inbox/app_icon.png
"""
import os
import sys

from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'icons')


def edge_colour(im):
    """Average colour of the outer border, used to fill the maskable icon's padding seamlessly."""
    w, h = im.size
    px = [im.getpixel((x, y)) for x in range(0, w, 8) for y in (0, h - 1)] + [im.getpixel((x, y)) for y in range(0, h, 8) for x in (0, w - 1)]
    return tuple(sum(c[i] for c in px) // len(px) for i in range(3))


def main(src):
    art = Image.open(src).convert('RGB')
    side = min(art.size)
    art = art.crop(((art.width - side) // 2, (art.height - side) // 2, (art.width + side) // 2, (art.height + side) // 2))
    os.makedirs(OUT, exist_ok=True)
    for size in (192, 512):
        art.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, f'icon-{size}.png'), optimize=True)
    art.resize((180, 180), Image.LANCZOS).save(os.path.join(OUT, 'apple-touch-icon.png'), optimize=True)
    maskable = Image.new('RGB', (512, 512), edge_colour(art))
    inner = int(512 * 0.8)
    maskable.paste(art.resize((inner, inner), Image.LANCZOS), ((512 - inner) // 2, (512 - inner) // 2))
    maskable.save(os.path.join(OUT, 'maskable-512.png'), optimize=True)
    print('icons written to public/icons/')


if __name__ == '__main__':
    main(sys.argv[1])
