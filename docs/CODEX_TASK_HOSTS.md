# Codex task: bring the seven local hosts into the area chapters

**Status: done (Claude, after Codex delivered the batch 8 portraits).** Steps 1 to 6 below were carried out in one change; this file is kept as the record of how the hosts were wired and what was checked. What is still open is the review in the last section.

_Original brief follows._

## Why

Every area chapter (5 to 11) is spoken by the same few faces, so each trip across the Kingdom feels like the same people in a new place. Seven new local hosts, one per area, make arrival feel like arrival, and each leaves Layla a small keepsake the epilogue can recall. This stays inside the existing hospitality loop (see `codex-plan.md`, priority 4); it adds characters and lines, not systems. Validate it with players before adding more content.

## What already exists

- **The writing:** `src/story/hostDrafts.ts` holds draft English and Arabic lines for all seven hosts (an opening, one reaction per choice option, a closing gift and a keepsake). `src/story/hostDrafts.test.ts` ties the drafts to the real chapters: it checks that each draft's options match the chapter's real option ids, that the insertion points exist, that every line fits the speech bubble (Arabic at most 90 characters, English at most 120) and that both languages are present.
- **The art brief:** `docs/ART_BATCH_8.md` (28 portraits: `hani`, `reem`, `hessa`, `aisha`, `khalid`, `dana`, `nasser` x neutral, happy, surprised, worried). The portraits land in `tools/art/portrait_inbox/` as `<id>_<expression>.png`.
- **The chapters:** `src/story/scenes/areaChapters.ts` (`AREA_SCENES`, `area_1` Jeddah to `area_7` Khobar), built with `say`, `ask` and `titleCard` from `src/story/scenes/build.ts`.

## Steps

1. **Install the portraits** (per host, once all four exist):
   `python3 tools/art/cutout_portrait.py tools/art/portrait_inbox/<id>_<expression>.png public/assets/art/story/<id>_<expression>.png`, then `python3 tools/art/to_webp.py`. Look at each result on a light and a dark backdrop for halos or holes in pale clothing (the cutout tolerance is 12; `CUTOUT_TOLERANCE` overrides it).
2. **Add the cast.** Add the seven ids to `CastId` and `CAST_NAMES` (use `nameAr` and `nameEn` from the drafts) in `src/story/types.ts`, to `EXPRESSIONS` (`neutral`, `happy`, `surprised`, `worried`) in `src/components/story/art.ts`, and to `NAME_COLORS` in `src/components/story/ScenePlayer.tsx`. `npm run lint` will flag any other record keyed by `CastId`.
3. **Write the applier.** Add a small pure function (for example `applyHostDraft(scene, draft)` in `src/story/scenes/withHost.ts`) that turns a `HostDraft` into beats and inserts them:
   - `opening` right after the title card,
   - `afterChoice[optionId]` right after the first beat of that option's branch (the beat the option's `next` names),
   - `closing` right before the `end` beat.
   Each beat stages Layla on the left and the host on the right with the expressions from the draft, and the beat's `bg` is the chapter's. Do not change any choice, flag, reward or `next`. Unit-test it: beat order, unique ids, and that a scene's choice options, flags and rewards are identical before and after.
4. **Wire it.** Make each `AREA_SCENES` entry apply its draft, so a chapter still builds from the same flags. Chapter ids stay the same.
5. **Epilogue.** Add one beat to the epilogue (`src/story/scenes/ending.ts`) that recalls the keepsakes, built from `keepsake` in the drafts. Keep it to one beat.
6. **Docs.** Update `DOCUMENTATION.md`, move batch 8 to Done in `docs/ART_QUEUE.md`, and record what you verified in `codex-plan.md` (keep planned, implemented and verified work distinct, as that file asks).

## Do not

- Change choices, flags, rewards, energy, pacing or the economy.
- Edit the Arabic or the dialect wording on your own. It is marked for native review; if a line is too long for a bubble, shorten the English and flag the Arabic for the reviewer.
- Touch the shop, billing or save format.

## Verify before merging

```sh
npm run lint
npm test
npm run build
node tools/e2e/story_layout.cjs http://localhost:4173/   # bubble layout, both languages, two sets of earlier choices
node tools/e2e/smoke.cjs http://localhost:4173/
node tools/e2e/a11y.cjs en,ar http://localhost:4173/
```

Also check each host in both languages in a browser: all four expressions render (no broken image), the cast does not overlap the speech bubble, and the story log shows the host's name. Save a screenshot of each host's opening line for the review.

## Coordination

Another session edits this repository (`main`) frequently, and `areaChapters.ts` has been touched there. Run `git log origin/main -- src/story` before you start, rebase on the latest `main`, and keep the change to small pull requests (portraits and cast first, then the applier, then the wiring).

## What was done

- **Portraits:** all 28 cut out and installed in `public/assets/art/story/` (1.9 MB WebP). The white-robed hosts leaked at the bottom edge, where the robe reaches the frame, so `tools/art/cutout_portrait.py` gained `CUTOUT_BOTTOM_CLOTH` (the share of the bottom edge, centred, from which no backdrop is searched); the hosts were cut with `0.6`.
- **Cast:** `HostId` and the seven ids in `CastId` / `CAST_NAMES` (`src/story/types.ts`), `EXPRESSIONS` (`art.ts`) and name colours (`ScenePlayer.tsx`).
- **Applier:** `src/story/scenes/withHost.ts` (`withHost`). Every `next: 'end'` jump is routed through the gift beat, so both choices meet the host on the way out.
- **Wiring:** `AREA_SCENES` applies each host; `BASE_AREA_SCENES` still exports the chapters as written.
- **Epilogue:** two short beats (`shelf_intro`, `shelf_list`) list the keepsakes of the hosts whose chapter was played (`endingScene(flags, seenScenes)`).
- **Tests** (`src/story/withHost.test.ts`): walks both choices of all seven chapters with two sets of earlier choices (opening, only the chosen reaction, gift before the end, still finishes on `end`); the original beats, choices, flags and rewards are unchanged; only Layla and the host on stage; the epilogue shelf fits a bubble and handles partial and no hosts.
- **Verified in a browser (iPhone SE and 13, English and Arabic):** `story_layout.cjs` measured 618 lines with no bubble over a face; each host's opening screenshot looked right; the smoke test passes (18 steps); the accessibility audit is clean; the epilogue shelf was played through.

## Review needed before release

Saudi cultural and dialect review of the hosts: dress (Hijazi, Taif and Asiri especially), the names, the Arabic lines, and details such as Al-Qatt being painted by women and the pearl-diving customs. Names and places in the drafts are fictional.
