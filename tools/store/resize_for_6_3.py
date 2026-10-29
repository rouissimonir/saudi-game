"""Scales the 1290x2796 store screenshots to 1179x2556, the size App Store Connect accepts for the
"iPhone with Dynamic Island (medium display)" slot (6.1" and 6.3" iPhones).

    python3 tools/store/resize_for_6_3.py

Reads store/screenshots/<en|ar>/0N.jpg, writes store/screenshots/<en|ar>/iphone-6.3/0N.jpg.
The aspect ratio is the same, so nothing is cropped or stretched visibly.
"""
import glob
import os
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'store', 'screenshots')
SIZE = (1179, 2556)

for lang in ('en', 'ar'):
    out = os.path.join(ROOT, lang, 'iphone-6.3')
    os.makedirs(out, exist_ok=True)
    for src in sorted(glob.glob(os.path.join(ROOT, lang, '0?.jpg'))):
        im = Image.open(src).convert('RGB')
        assert im.size == (1290, 2796), f'{src} is {im.size}, expected 1290x2796'
        dest = os.path.join(out, os.path.basename(src))
        im.resize(SIZE, Image.LANCZOS).save(dest, 'JPEG', quality=92, optimize=True)
        print(dest, os.path.getsize(dest) // 1024, 'KB')
