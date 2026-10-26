# Art queue (Codex)

Images are generated with Codex from the prompt files and pushed to the `art/codex` branch.
Each improvement run checks that branch. When images are there, Claude installs them, verifies the scenes, merges,
and moves the batch to "Done" below.

## Waiting for Codex

| Batch | Prompts | Files | Lands in | Then (Claude) |
|---|---|---|---|---|
| Batch 5 | `docs/ART_BATCH_5.md` | 21: `<area>_1`–`3` for jeddah, alula, taif, abha, ahsa, riyadh, khobar | `tools/art/background_inbox/majlis/` | Check each area's stages line up, convert to `public/assets/art/majlis/<area>_<n>.webp` (1280x720, quality 72), and add the area to `PAINTED_STAGES` in `src/game/majlisStages.ts`. Areas can land one at a time |

When a new batch is added:
- **Portraits:** cut out with `tools/art/cutout_portrait.py`, convert, and add the character to `EXPRESSIONS` in `src/components/story/art.ts`.
- **Backgrounds:** resize to 1080x1920, convert (backgrounds use WebP quality 72), and add the key to `PAINTED_BGS` in `src/story/chapterScene.ts`.

## Done

- Prologue cast: Layla (5 expressions), Noura (4), Rashid (3).
- Prologue backgrounds: street, courtyard, dallah.
- Chapter cast (batch 2): Faisal, Tariq, Lama, Sultan (4 expressions each).
- Chapter locations (batch 2): Sadu corner, Ramadan lanterns, Jeddah, AlUla, Taif, Abha, Al-Ahsa, Riyadh, Khobar.
- Batch 4: Diriyah Majlis restoration stages 1–3 (Majlis view banner, `public/assets/art/majlis/`) and the painted app icon (`public/icons/`).
- Batch 3: title key art (`bg_title`, on the title screen on phones), Rashid happy and worried (ally path), finale background (epilogue).
