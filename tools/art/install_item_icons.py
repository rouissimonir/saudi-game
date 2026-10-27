"""Install painted board-item icons from an inbox folder into the game.

Codex delivers each chain as 1254x1254 transparent PNGs named by item id (for example qahwa_1.png ... qahwa_6.png in
tools/art/item_inbox/qahwa/). This trims each picture to its painted pixels, adds an even margin, centres it on a square
and writes the 256x256 WebP the board loads (public/assets/art/items/<itemId>.webp, see ItemArtwork).

    python3 tools/art/install_item_icons.py tools/art/item_inbox/qahwa
    python3 tools/art/install_item_icons.py tools/art/item_inbox/qahwa --check     # report only, write nothing

The same item ids as the Blender renders are used, so a painted icon simply replaces its render.
"""
import os
import sys

from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'assets', 'art', 'items')
SIZE = 256
MARGIN = 0.07  # of the icon's longest side, on every side, so items sit like the existing renders do


def fit(img):
    img = img.convert('RGBA')
    alpha = img.getchannel('A').point(lambda a: 255 if a > 8 else 0)
    box = alpha.getbbox()
    if box is None:
        raise ValueError('empty picture')
    img = img.crop(box)
    side = int(max(img.size) * (1 + 2 * MARGIN))
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(img, ((side - img.width) // 2, (side - img.height) // 2), img)
    return canvas.resize((SIZE, SIZE), Image.LANCZOS)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    check = '--check' in sys.argv
    if not args:
        raise SystemExit(__doc__)
    names = sorted(f for f in os.listdir(args[0]) if f.lower().endswith('.png'))
    total = 0
    for name in names:
        item = name[:-4]
        icon = fit(Image.open(os.path.join(args[0], name)))
        path = os.path.join(OUT, item + '.webp')
        if not os.path.exists(path):
            print(f'  {item}: no such item icon in the game (skipped)')
            continue
        if not check:
            icon.save(path, 'WEBP', quality=84, method=6, alpha_quality=90)
            total += os.path.getsize(path)
        print(f'  {item}: ok')
    print(f'{len(names)} pictures' + ('' if check else f', {total // 1024} KB written'))


if __name__ == '__main__':
    main()
