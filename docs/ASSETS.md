# Assets guide: art, music and voice

## 1. What exists today

| Asset | Status | Where |
| --- | --- | --- |
| Hero 3D renders (dallah, finjan, V60, mabkhara, dates, chest, beans) | Generated with Blender, 512x512 transparent PNG | `public/assets/art/*.png` |
| Title-screen emblem | Uses `dallah.png` | `src/App.tsx` |
| The 30 merge-board item icons | Generated with Blender, 256x256 transparent PNG, shown by `ItemArtwork` (old SVG kept as fallback) | `public/assets/art/items/<itemId>.png` |
| Character portraits (Noura, Faisal, Tariq, Lama, Sultan, Jury) | Stylized 3D busts rendered with Blender, 256px transparent PNG; shown in the order strip and story dialogue (SVG kept as fallback) | `public/assets/art/characters/<name>.png` |
| Sound effects | Synthesized in code | `src/utils/soundAndHaptics.ts` |
| Background music | Synthesized oud loop, **or** your file (see below) | `public/assets/audio/ambient.mp3` |
| Voice lines | None | n/a |

### Regenerating or extending the Blender art
The renders are procedural, so there are no `.blend` files to maintain.

```bash
python3 -m venv .venv-bpy
.venv-bpy/bin/pip install bpy          # Blender as a Python module (needs a matching Python; 5.2 wheel = Python 3.13)
SAMPLES=96 ONLY=dallah,chest .venv-bpy/bin/python tools/blender/make_art.py -- public/assets/art
```
Each prop is a function in `tools/blender/make_art.py`. Add a function, add it to the list at the bottom, run it. About 10 to 15 seconds per prop on CPU.

The 30 item icons come from `tools/blender/make_items.py` (one function per item id; same camera, light and palette for all, auto-framed so each icon fills its tile):

The six characters come from `tools/blender/make_characters.py` (ONLY=noura,tariq works the same way). The jury is a gold star medal with a ribbon, matching its star badge in the original art, not a person.

```bash
cd tools/blender
SAMPLES=64 SIZE=256 .venv-bpy/bin/python make_items.py -- ../../public/assets/art/items            # all 30
SAMPLES=64 SIZE=256 ONLY=qahwa_3,oud_5 .venv-bpy/bin/python make_items.py -- ../../public/assets/art/items  # just some
```

Limits: these are clean stylized 3D props, not painterly game-art. Some are simple (for example the agarwood chips and the paper filter) and are good candidates for an artist to redo. The character busts are deliberately toy-like (big heads, simple faces): that style is achievable procedurally, but it is not a replacement for a real character artist, and they have one pose and one expression each. For emotional poses, full-body art or a distinctive style you need an illustrator. Please also have someone from the community review the characters' clothing and headwear for cultural accuracy before launch.

## 2. Drop-in rules for art you provide

- **Format:** PNG with transparent background, 512x512 (square, object centered with ~8% padding). WebP is fine if you tell me.
- **Item icons** (already filled with Blender renders; replace any you like): one file per item id, `public/assets/art/items/<itemId>.png`.
  - Generators: `gen_qahwa`, `gen_barista`, `gen_sweets`, `gen_oud`
  - Chains (levels 1 to 6): `qahwa_1`..`qahwa_6`, `barista_1`..`barista_6`, `sweets_1`..`sweets_6`, `oud_1`..`oud_6`
  - Chests: `chest_1`, `chest_2`
  - Item names for each level are in `DOCUMENTATION.md` section 2.A.
- **Characters:** `public/assets/art/characters/<name>.png`, square bust portrait with a transparent background, centred with the face in the upper half (they are cropped to a circle): `noura`, `faisal`, `tariq`, `lama`, `sultan`, `ghabga` (the jury).
- Items in the same chain should share one light direction and one palette so the evolution reads at a glance.
- **Items need no code change:** `ItemArtwork` loads `public/assets/art/items/<itemId>.png` automatically, so replacing a file replaces the icon. If a file is missing the game falls back to the old SVG for that item only.
- **Characters need no code change either:** `CustomerPortrait` loads `public/assets/art/characters/<name>.png` (names: `noura`, `faisal`, `tariq`, `lama`, `sultan`, `ghabga`) and falls back to the SVG if a file is missing. The circle backdrop colours are in `PORTRAIT_BACKDROP` in `CompetitorModalsAndPortraits.tsx`.

## 3. Music and sound: what to ask for

- **Background loop:** 60 to 120 seconds, seamless loop, mp3 at 128 to 192 kbps (under about 2 MB). Calm Khaleeji or Hijaz-maqam oud with light percussion, no vocals.
- **Drop-in:** save it as `public/assets/audio/ambient.mp3`. The game plays it automatically and falls back to the built-in synth loop if the file is missing.
- **Search terms:** "oud taqsim", "maqam hijaz", "khaleeji instrumental", "arabic lounge", "majlis ambience".
- **Optional later:** a short win jingle, a level-up fanfare and merge chimes (I can wire them in place of the synthesized ones).

## 4. Voice lines: brief for a voice actor

Short 2 to 3 second lines, one file per line, mp3 or wav, clean studio recording, no music.
- Noura (grandmother, Najdi dialect): "يا هلا والله بضيوفنا"
- Faisal (barista, Hijazi dialect), Tariq (sheikh, Najdi), Lama (creator, young Riyadh dialect): one greeting and one "order served" line each.
- Ask for a signed licence that covers game use and app-store distribution, in writing.

## 5. Where to find assets

**I could not open any of these from my sandbox (outbound access is blocked), so none of the links below have been checked.** They are well-known sites; confirm each link and, above all, each item's licence yourself.

| Need | Source | Typical licence |
| --- | --- | --- |
| 2D game art, UI kits | https://kenney.nl/assets | CC0 (free, no credit needed) |
| 2D/3D/music/SFX, mixed | https://opengameart.org/ | varies per item (CC0, CC-BY, GPL) |
| Free 3D models | https://quaternius.com/ | CC0 |
| 3D models and HDRIs | https://polyhaven.com/ | CC0 |
| Materials and textures | https://ambientcg.com/ | CC0 |
| Paid or free asset packs | https://itch.io/game-assets | varies per pack |
| Sound effects | https://freesound.org/ (filter by licence) | CC0 or CC-BY |
| Sound effects | https://mixkit.co/free-sound-effects/ | Mixkit licence |
| Music | https://pixabay.com/music/ | Pixabay Content licence |
| Music | https://incompetech.com/ | CC-BY (credit required) |
| Music | https://freemusicarchive.org/ | varies per track |
| Sadu patterns reference | https://commons.wikimedia.org/ (search "Sadu") | varies, check each file |
| Hire artists | https://www.fiverr.com/ , https://www.upwork.com/ | per contract |
| Hire voice actors | https://www.voices.com/ , Fiverr voice-over category | per contract |
| Blender itself | https://www.blender.org/download/ | GPL |

Search keywords that work well: "Arabic", "Khaleeji", "Saudi", "oud", "dallah", "majlis", "Sadu".

## 6. Licence checklist before shipping
1. Keep a list of every third-party file with its source URL and licence.
2. CC-BY needs visible credit; add an in-app Credits screen if you use any.
3. Avoid "non-commercial" (CC-BY-NC) assets: not allowed in a paid or ad-supported app.
4. For anything made by a person, get a written licence or work-for-hire agreement that includes app-store distribution.
5. Do not use AI-generated or scraped images or music unless the tool's terms allow commercial use.
