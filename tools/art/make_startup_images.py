"""Make the iOS launch images shown while the game opens from the Home Screen.

iOS ignores the manifest's background colour and shows a blank screen until the page paints, unless the page names a
launch image for the exact device size. This writes one image per iPhone size (public/icons/splash/) in the game's
brown with the painted app icon, and prints the <link> tags for index.html.

    python3 tools/art/make_startup_images.py            # write the images and print the tags
    python3 tools/art/make_startup_images.py --tags     # print the tags only
"""
import os
import sys

from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
ICON = os.path.join(ROOT, 'public', 'icons', 'icon-512.png')
OUT = os.path.join(ROOT, 'public', 'icons', 'splash')

# (css width, css height, pixel ratio): every iPhone with a distinct portrait screen
DEVICES = [
    (320, 568, 2),   # SE 1st gen
    (375, 667, 2),   # SE 2nd/3rd gen, 8
    (414, 736, 3),   # 8 Plus
    (375, 812, 3),   # X, XS, 11 Pro, 12/13 mini
    (414, 896, 2),   # XR, 11
    (414, 896, 3),   # XS Max, 11 Pro Max
    (390, 844, 3),   # 12, 13, 14, 12/13 Pro
    (428, 926, 3),   # 12/13 Pro Max, 14 Plus
    (393, 852, 3),   # 14 Pro, 15, 15 Pro, 16
    (430, 932, 3),   # 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus
    (402, 874, 3),   # 16 Pro
    (440, 956, 3),   # 16 Pro Max
]
TOP, MID, BOTTOM = (0x2A, 0x1B, 0x12), (0x3A, 0x24, 0x17), (0x1E, 0x13, 0x0D)  # the splash in index.html


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make(w, h):
    img = Image.new('RGB', (w, h))
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / (h - 1)
        d.line([(0, y), (w, y)], fill=lerp(TOP, MID, t / 0.55) if t < 0.55 else lerp(MID, BOTTOM, (t - 0.55) / 0.45))
    side = round(min(w, h) * 0.34)
    icon = Image.open(ICON).convert('RGB').resize((side, side), Image.LANCZOS)
    mask = Image.new('L', (side, side), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, side - 1, side - 1), radius=round(side * 0.22), fill=255)
    img.paste(icon, ((w - side) // 2, round(h * 0.36 - side / 2)), mask)
    return img.quantize(colors=96, method=Image.MEDIANCUT, dither=Image.NONE)


def tag(w, h, r):
    return (f'<link rel="apple-touch-startup-image" media="(device-width: {w}px) and (device-height: {h}px) and '
            f'(-webkit-device-pixel-ratio: {r}) and (orientation: portrait)" href="icons/splash/ios-{w * r}x{h * r}.png" />')


if __name__ == '__main__':
    if '--tags' not in sys.argv:
        os.makedirs(OUT, exist_ok=True)
        total = 0
        for w, h, r in DEVICES:
            path = os.path.join(OUT, f'ios-{w * r}x{h * r}.png')
            make(w * r, h * r).save(path, optimize=True)
            total += os.path.getsize(path)
        print(f'{len(DEVICES)} images, {total // 1024} KB')
    print('\n'.join(tag(*d) for d in DEVICES))
