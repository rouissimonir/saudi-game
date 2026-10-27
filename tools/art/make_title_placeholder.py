"""Make the tiny blurred stand-in for the title key art.

It is shown from the very first paint (inline in index.html, before any script runs) and under the title screen's
full-size art while that loads, so a phone shows the painted sunset instead of a flat colour. About 1 KB.

    python3 tools/art/make_title_placeholder.py

Reads public/assets/art/story/bg_title.webp and rewrites the `data:image/webp;base64,...` URI in index.html and in
src/utils/titlePlaceholder.ts. Re-run after the key art changes.
"""
import base64
import io
import os
import re

from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
SRC = os.path.join(ROOT, 'public', 'assets', 'art', 'story', 'bg_title.webp')
SIZE = (27, 48)  # 9:16, blurred up by the browser


def data_uri():
    img = Image.open(SRC).convert('RGB').resize(SIZE, Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, 'WEBP', quality=55, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


def patch(path, uri):
    text = open(path, encoding='utf-8').read()
    new, n = re.subn(r'data:image/webp;base64,[A-Za-z0-9+/=]*', lambda m: uri, text)
    if n == 0:
        raise SystemExit(f'no placeholder data URI in {path}')
    open(path, 'w', encoding='utf-8').write(new)


if __name__ == '__main__':
    uri = data_uri()
    patch(os.path.join(ROOT, 'index.html'), uri)
    patch(os.path.join(ROOT, 'src', 'utils', 'titlePlaceholder.ts'), uri)
    print(f'placeholder written, {len(uri)} characters')
