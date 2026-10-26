# Art queue (Codex)

Images are generated with Codex from the prompt files and pushed to the `art/codex` branch.
Each improvement run checks that branch. When images are there, Claude installs them, verifies the scenes, merges,
and moves the batch to "Done" below.

## Waiting for Codex

| Batch | Prompts | Files | Lands in | Then (Claude) |
|---|---|---|---|---|
| Batch 3 | `docs/ART_BATCH_3.md` | 4: `title_keyart`, `rashid_happy`, `rashid_worried`, `bg_finale` | `tools/art/background_inbox/` (key art, finale), `tools/art/portrait_inbox/` (Rashid) | Rashid: cut out and add `happy`/`worried` to `EXPRESSIONS`, then use them on the ally path (Jeddah, Abha, Riyadh, Khobar). Key art: add it behind the title screen, loaded after first paint. Finale: an ending screen after Khobar with the player's choices |

When a new batch is added:
- **Portraits:** cut out with `tools/art/cutout_portrait.py`, convert, and add the character to `EXPRESSIONS` in `src/components/story/art.ts`.
- **Backgrounds:** resize to 1080x1920, convert (backgrounds use WebP quality 72), and add the key to `PAINTED_BGS` in `src/story/chapterScene.ts`.

## Done

- Prologue cast: Layla (5 expressions), Noura (4), Rashid (3).
- Prologue backgrounds: street, courtyard, dallah.
- Chapter cast (batch 2): Faisal, Tariq, Lama, Sultan (4 expressions each).
- Chapter locations (batch 2): Sadu corner, Ramadan lanterns, Jeddah, AlUla, Taif, Abha, Al-Ahsa, Riyadh, Khobar.
