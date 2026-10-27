# Art queue (Codex)

Images are generated with Codex from the prompt files and pushed to the `art/codex` branch.
Each improvement run checks that branch. When images are there, Claude installs them, verifies the scenes, merges,
and moves the batch to "Done" below.

## Waiting for Codex

| Batch | Prompts | Files | Lands in | Then (Claude) |
|---|---|---|---|---|
| Batch 8 | `docs/ART_BATCH_8.md` | 28 portraits: seven new local hosts (`hani`, `reem`, `hessa`, `aisha`, `khalid`, `dana`, `nasser`) x neutral, happy, surprised, worried | `tools/art/portrait_inbox/` | Cut out and install each (`cutout_portrait.py`, `to_webp.py`), add the ids to `CastId`, `EXPRESSIONS` and the name colours, rewrite each area chapter so its local host opens it, check bubble layout, check both languages. Needs Saudi cultural review before release. The scripts are already drafted (`src/story/hostDrafts.ts`); the wiring task is `docs/CODEX_TASK_HOSTS.md` |

When a new batch is added:
- **Portraits:** cut out with `tools/art/cutout_portrait.py`, convert, and add the character to `EXPRESSIONS` in `src/components/story/art.ts`.
- **Backgrounds:** resize to 1080x1920, convert (backgrounds use WebP quality 72), and add the key to `PAINTED_BGS` in `src/story/chapterScene.ts`.

## Done

- All 30 painted board icons from Codex (qahwa, barista, sweets, oud chains, 2 chests, 4 generators), installed with `tools/art/install_item_icons.py`. No Blender renders remain in `public/assets/art/items/`.
- Painted qahwa chain icons (`qahwa_1`..`qahwa_6`), Codex's icon trial, replacing the Blender renders.
- Batch 7: wing pictures for Al-Ahsa's Qaisariya Souq and Al-Khobar's Pearl Divers' Majlis (run-down and restored), used by `make_wing_thumbs.py` instead of the crop.
- Batch 6: night and rain versions of every Majlis restoration stage, 48 images (`public/assets/art/majlis/<area>_<n>_night.webp`, `_rain.webp`), wired to the ambiance chips.
- Batch 5: Majlis restoration stages 1–3 for Jeddah, AlUla, Taif, Abha, Al-Ahsa, Riyadh and Khobar (`public/assets/art/majlis/`).
- Prologue cast: Layla (5 expressions), Noura (4), Rashid (3).
- Prologue backgrounds: street, courtyard, dallah.
- Chapter cast (batch 2): Faisal, Tariq, Lama, Sultan (4 expressions each).
- Chapter locations (batch 2): Sadu corner, Ramadan lanterns, Jeddah, AlUla, Taif, Abha, Al-Ahsa, Riyadh, Khobar.
- Batch 4: Diriyah Majlis restoration stages 1–3 (Majlis view banner, `public/assets/art/majlis/`) and the painted app icon (`public/icons/`).
- Batch 3: title key art (`bg_title`, on the title screen on phones), Rashid happy and worried (ally path), finale background (epilogue).
