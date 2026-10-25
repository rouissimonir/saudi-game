"""Convert board item icons and character portraits from PNG (what the Blender scripts render) to WebP.

The game loads `public/assets/art/items/<id>.webp` and `public/assets/art/characters/<name>.webp`.
WebP at quality 84 is ~87% smaller than the PNG renders with no visible difference at board size.

Usage: python3 tools/art/to_webp.py [--keep-png]
"""
import glob
import os
import sys

from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'assets', 'art')

def main() -> None:
    keep = '--keep-png' in sys.argv
    before = after = 0
    for folder in ('items', 'characters'):
        for png in sorted(glob.glob(os.path.join(ROOT, folder, '*.png'))):
            webp = png[:-4] + '.webp'
            Image.open(png).save(webp, 'WEBP', quality=84, method=6, alpha_quality=90)
            before += os.path.getsize(png)
            after += os.path.getsize(webp)
            if not keep:
                os.remove(png)
    print(f'{before // 1024} KB PNG -> {after // 1024} KB WebP')

if __name__ == '__main__':
    main()
