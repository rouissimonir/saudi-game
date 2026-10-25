# Art queue (Codex)

Images are generated with Codex from the prompt files and pushed to the `art/codex` branch.
Each improvement run checks that branch. When images are there, Claude installs them, verifies the scenes, merges,
and moves the batch to "Done" below.

## Waiting for Codex

| Batch | Prompts | Files | Lands in | Then (Claude) |
|---|---|---|---|---|
| Chapter cast | `docs/PORTRAIT_PROMPTS.md`, batch 2 | 16: `faisal_*`, `tariq_*`, `lama_*`, `sultan_*` (neutral, happy, surprised, worried) | `tools/art/portrait_inbox/` | Cut out with `tools/art/cutout_portrait.py`, convert, and add each character to `EXPRESSIONS` in `src/components/story/ScenePlayer.tsx` (remove them from `ILLUSTRATED`) |
| Chapter locations | `docs/BACKGROUND_PROMPTS.md`, batch 2 | 9: `bg_sadu`, `bg_lanterns`, `bg_jeddah`, `bg_alula`, `bg_taif`, `bg_abha`, `bg_ahsa`, `bg_riyadh`, `bg_khobar` | `tools/art/background_inbox/` | Resize to 1080x1920, convert, and add each key to `PAINTED_BGS` in `src/story/chapterScene.ts` |

## Done

- Prologue cast: Layla (5 expressions), Noura (4), Rashid (3).
- Prologue backgrounds: street, courtyard, dallah.
