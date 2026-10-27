# Qahwa & Majlis Merge (قهوة ومجلس: دمج وحكاية)
**Complete Product, Architecture, Competitor Benchmark & Future Roadmap Documentation**

---

## 1. Executive Summary & KSA iOS Market Thesis

**Qahwa & Majlis Merge (قهوة ومجلس)** is a bilingual (Arabic RTL / English LTR) **Khaleeji Narrative Merge-2 & Specialty Coffee Estate Renovation Game** built with React, TypeScript, Tailwind CSS and a Capacitor iOS project. The native project has been generated and synced, but an Xcode build and device testing are still needed.

### Why This Niche Was Selected (#1 Ranked MENA Opportunity)
1. **Zero Local Studio Competition in a Top-Grossing Genre:**
   - Seven foreign Merge-2 games (*Gossip Harbor* #10, *Tasty Travels* #19, *Travel Town* #29, *Hollywood Merge* #49, *Merge Cooking* #63, *Foodstars* #65, *Seaside Escape* #66) are charting inside the **Saudi Arabia iOS Top 70 Grossing** leaderboard.
   - **0%** of those titles are built by Arab studios or feature Khaleeji culture, Saudi specialty coffee (*Qahwa*), or Najdi/Hijazi architecture.
2. **Proven Saudi VC & Consumer Appetite for Cultural Games:**
   - Saudi venture firm **Impact46** recently led a **$53M+ investment** in *Kammelna* (#8 Top Grossing KSA), while solo-developed *Mazayen* (لعبة مزاين) surged to **#37 Top Grossing in Saudi Arabia**, out-grossing *MONOPOLY GO!* (#38) and *Clash Royale* (#41).
3. **Client-side play and native packaging potential:**
   - The game uses client-side rules and supports offline web play. Native packaging, performance and offline behavior must still be tested in a Capacitor iOS build on real devices.

---

## 2. Complete Inventory of Features Built (v1 → v3)

### Faisal's coffee tasting
- A permanent, untimed occasion opens from the merge board. Players choose and prepare two trays from unlocked board items, select a look for a coffee corner, and host Faisal and Noura. Choices and the one-time reward are saved with story flags and included in save transfers.
- The Majlis shows an illustrated corner with the chosen items and guests after the gathering. Tap it to revisit the dialogue or change the corner's look for free. This is a separate scene card; it does not change the existing renovation bar or its bonuses.
- The gathering can be completed from any area, including older saves. The visual uses existing item and character art and respects the reduced-motion setting.
- After the gathering, Faisal and Noura each recall the selected tray on their next fulfilled order. Each reaction is recorded once, survives save transfers, and can be reread in the tasting corner.
- New players are introduced to the tasting and festival after completing or dismissing the merge-and-serve coach. Festival points still accumulate during the coach, and the daily login gift is offered afterward without being claimed early.

### Taif rose welcome
- After the Taif chapter, the Majlis offers an optional welcome: prepare rose perfume for the setting and either dates or a specialty coffee. The selected items are consumed once, and a memory stays available after travel. Players already past Taif can access it too.
- Noura remembers the chapter's drink choice when available. The harvest detail is based on [Visit Saudi's rose-water guide](https://www.visitsaudi.com/en/taif/stories/rosewater-in-saudi-arabia) and [Saudipedia](https://saudipedia.com/en/how-is-taif-rose-water-made); the dialogue and dialect still need Saudi review.

### A. Core Merge-2 Board & 4 Cultural Merge Chains (30 Items Total)
- **7×7 Warm Sand-Parchment & Roasted Walnut Merge Board:**
  - High-contrast checkerboard tiles (`#FBF5E8` / `#F3E5AB`) inspired by *Gossip Harbor* and *Travel Town* so colorful coffee, V60, Oud, and Kunafa illustrations pop.
  - Supports pointer drag, tap-to-select and tap-to-merge/move/swap, and a one-tap auto-merge (`دمج تلقائي ذكي`). Auto-merge protects quantities needed for individual guest orders and the focused hospitality recipe; players can still merge manually.
  - **Sand-Locked Desert Dune Tiles (`خلايا رمال النفود`):** 10 perimeter tiles start locked under desert sand with a lock badge; merging a matching unlocked item onto a sand-locked tile clears the sand and upgrades the item.
  - **Order-Ready Mint Highlighting (`#DCFCE7`):** Any board tile needed by an active customer order automatically displays a green checkmark badge and emerald border.

- **4 Cultural & Specialty Generators + 26 Collectible Items:**
  1. **Chain 1 — Saudi Khawlani Qahwa (`gen_qahwa` → `qahwa_1`..`qahwa_6`):**
     - *Generator:* Khawlani Coffee Sack (`خيشة البن الخولاني`)
     - *Evolution (`Lv.1 → Lv.6`):* Green Khawlani Beans → Blonde Cardamom Roast → Brass Mortar & Mihmas (`نجر ومحماس`) → Gilded Raslan Dallah (`دلة رسلان مذهّبة`) → Saffron Finjan Trio → **Royal Diriyah Dallah & Oud Set (`صينية الضيافة الملكية بالعود`)**.
  2. **Chain 2 — Specialty Barista & V60 (`gen_barista` → `barista_1`..`barista_6`):**
     - *Generator:* Riyadh Specialty Roaster (`محطة تحميص الرياض المختصة`)
     - *Evolution (`Lv.1 → Lv.6`):* Unbleached V60 Filter → Ceramic V60 Dripper → Iced Riyadh Spanish Latte (`سبانش لاتيه بارد`) → Camel-Milk Pistachio Cortado (`كورتادو فستق بحليب الإبل`) → Taif Rose Chemex Cold Brew → **Grand Khaleeji Roastery Flight (`برج تذوق الباريستا الملكي`)**.
  3. **Chain 3 — Royal Dates & Majlis Sweets (`gen_sweets` → `sweets_1`..`sweets_6`):**
     - *Generator:* AlUla Date & Sweets Basket (`سلة تمور العلا والحلويات`)
     - *Evolution (`Lv.1 → Lv.6`):* Fresh Sukkari Rutab → Tahini & Almond Stuffed Dates → Qassim Kleija & Pistachio Maamoul (`كليجا قصيمية ومعمول`) → Crispy Luqaimat & Date Syrup → Saffron & Rose Tres Leches (`كيكة الزعفران`) → **Royal Golden Kunafa Tower (`برج الكنافة الملكية`)**.
  4. **Chain 4 — Oud, Bakhoor & Taif Perfumery (`gen_oud` → `oud_1`..`oud_6`):**
     - *Generator:* Royal Oud & Mabkhara Chest (`صندوق العود والمبخرة الملكية`)
     - *Evolution (`Lv.1 → Lv.6`):* Raw Agarwood Oud Chips (`كسر عود كمبودي`) → Brass Charcoal Mabkhara (`مبخرة جمر نحاسية`) → Taif Rose Crystal Tola (`تولة ورد طائفي`) → Aged Royal Dahn Al-Oud (`دهن عود ملكي معتّق`) → Gilded Diriyah Incense Tower → **Royal Bisht & Rare Oud Ceremony Set (`صينية البشت الملكي والعود النادر`)**.
  5. **Chain 5 — Mergeable Majlis Hospitality Chests (`chest_1` → `chest_2`):**
     - **Wooden Sadu Hospitality Chest (`Lv.1`):** Opens immediately for `+60 SAR`, `+12💎`, and `+25⚡ Energy`—or merges with another `Lv.1` chest into:
     - **Gilded Royal Treasure Chest (`Lv.2`):** Opens for **3× rewards** (`+180 SAR`, `+35💎`, `+65⚡ Energy`, `+1 Golden Scissors`, and `+1 Royal Joker`).

---

### B. Top Competitor Features Implemented (*Gossip Harbor*, *Travel Town*, *Mazayen*)
1. **Top-of-Board Horizontal Customer Order Strip:**
   - Pinned directly above the 7×7 grid with custom-illustrated Khaleeji SVG character portraits (**Grandmother Noura**, **Barista Faisal**, **Sheikh Tariq**, **Creator Lama**, **Sultan Al-Diriyah**, and the **Saudi Coffee Festival Jury**).
   - Displays required item icons (tappable to inspect their Merge Chain Tree) and 1-tap glowing green **`Serve! / تقديم!`** buttons.
2. **Timed VIP Royal Convoy Rush Orders (`⚡ موكب ملكي VIP · +صندوق💎`):**
   - VIP orders award bonus Royal Gems (`+10💎`), extra Hospitality Prestige (`+55 pts`), and automatically drop a **Lv.1 Majlis Hospitality Chest (`chest_1`)** onto the board upon completion.
3. **Roastery Overdrive Power Boost Multiplier (`⚡×1 / ⚡×2 / ⚡×4`):**
   - Toggles generator output so players can spend 1, 2, or 4 Energy per tap to spawn `Lv.1`, `Lv.2`, or `Lv.3` items directly.
4. **Board Boosters — Golden Brass Scissors (`المقص الذهبي`) & Royal Joker Finjan (`فنجال الجوكر`):**
   - **Golden Scissors:** Splits any `Lv.2–Lv.6` board item back into two `Lv.(N-1)` items.
   - **Royal Joker:** Upgrades any `Lv.1–Lv.5` board item `+1 Level` without needing a duplicate.
5. **4-Slot Sadu Pantry Storage Bag (`خزانة المؤونة`):**
   - Stores up to 4 non-generator board items when the 7×7 grid gets crowded; tapping any stored item returns it to the nearest empty tile.
6. **Floating Golden Bonus Bubble Deals (`فقاعة البركة الذهبية`):**
   - Merging into `Lv.3+` items spawns a temporary Golden Bonus Bubble above the board that can be unlocked with Royal Gems to duplicate the high-tier item.
7. **Interactive Merge Chain Evolution Tree (`دليل السلاسل الأربع [i]`):**
   - Visual `Lv.1 → Lv.6` progression tree showing the Source Generator, discovery status, and SAR sell value for all 4 chains and chests.

---

### B2. Merge Feel & Progression (v4)
1. **Timed Combo Chain (`كومبو`):** merges within 6 seconds of each other build a combo; from the 3rd merge each merge pays bonus SAR (capped at 20) and extra XP. A draining combo meter shows the remaining window.
2. **Mega Merge (`دمج ثلاثي`):** when a third identical item touches the merge tile it can be absorbed and the result jumps one extra level. The extra item is preserved, and the intermediate result is made instead, when a guest order or focused recipe needs either one.
3. **Level-Up Rewards:** each level grants `+5💎` and tops Energy up by 15 (not a full refill), with a celebratory toast. The XP curve steepens: reaching level *n* needs `100(n-1) + 30(n-1)(n-2)` XP.
4. **Merge Burst FX:** a golden burst on every merge (larger for Lv.4+, green for Mega Merge); honours `prefers-reduced-motion`.

5. **Seven welcome gifts (`غبقة اليوم`):** one reward per calendar day (energy, coins, gems, scissors, joker, a free wheel spin, and a Gilded chest for the seventh gift). Missing a day preserves the player's place; the cycle repeats after gift seven. If the board is full for gift seven, the chest opens immediately and awards all its contents. Existing save progress is retained.
6. **First-Run Coach:** a dismissible banner teaches merging first, then serving an order; existing saves that already merged skip it.

7. **Saudi Cultural Calendar (`تقويم المملكة`):** Founding Day (Feb 21–23) and National Day (Sep 22–24) give ×1.5 order SAR and double prestige; Ramadan (×1.25 / ×1.5) and Eid (×2 SAR) are detected from the Umm al-Qura Hijri calendar. A banner in the merge view shows the active season.
8. **Rub'a al-Finjan Pouring Mini-Game (`تحدي ربع الفنجال`):** each renovation upgrade earns one challenge. Hold to pour and release, or tap to start and tap again to stop, near the 25% mark (±4 perfect, ±10 good) for coins, gems and a Royal Joker. The cup exposes its fill level as a progress indicator. Interrupted or cancelled touches reset the pour without spending the challenge.
9. **Ambient Hijaz Oud Loop:** bundled ambient audio plays while the game is unmuted, with a synthesized oud phrase as a fallback. Muting silences active audio and is remembered between launches; haptics have a separate setting.
10. **Blender-rendered art:** seven hero props (`tools/blender/make_art.py` into `public/assets/art/`, the title emblem uses the dallah) and all 30 board item icons (`tools/blender/make_items.py` into `public/assets/art/items/`, 256px, shown by `ItemArtwork` with the SVG as fallback), plus six 3D character busts (`tools/blender/make_characters.py` into `public/assets/art/characters/`, shown in the order strip and story dialogue). See `docs/ASSETS.md` for extending them and for where to source the remaining art, music and voice.
11. **Generated music:** `tools/audio/make_music.py` renders a seamless 60 s Hijaz oud loop (`ambient.mp3`) plus `order_complete.mp3` and `level_up.mp3` stingers into `public/assets/audio/` (physically-modelled oud, darbuka, reverb; numeric checks in `verify_music.py`). The game loops the file gaplessly via WebAudio and falls back to the synthesized oud and chimes if a file is missing, so any file can be replaced by a human recording.
12. **Character voice lines:** 32 dialect lines for the six characters (`src/game/voiceLines.ts`), spoken when an order is served and when a story chapter opens. Recorded with ElevenLabs Saudi-accent voices into `public/assets/audio/voice/<id>.mp3` (verified word-for-word by speech-to-text, loudness-matched; not yet listened to by a human). Playback uses the file, else the device's Arabic text-to-speech tuned per character, else silence; music ducks while a character speaks. `tools/voice/generate_elevenlabs.py` regenerates the files (see `docs/ASSETS.md`, section 4) and `docs/VOICE_LINES.md` is a recording sheet for a human actor.

### B3. Endless Economy & Phone-First UI (v5)
The engine lives in `src/game/progression.ts` (pure, seeded RNG in `state.rngSeed`, tested in `progression.test.ts`).
1. **Endless areas:** after Diriyah the player travels through Jeddah, AlUla, Taif, Abha, Al-Ahsa, Riyadh and Al-Khobar, each with 4 wings, 3 styles and its own story chapter, then repeats as prestige laps (✦2, ✦3…). Wing star costs rise per area. Restoring every wing shows a **Travel now** card in the Majlis tab (`+25💎 +40⚡`); the Kingdom trail shows finished, current and locked areas.
2. **Generated orders:** served orders are replaced by a new guest whose item levels follow progress (`orderLevelBand`), with stars = value / 18 and occasional VIPs (+1 level, ×2 SAR, +2⭐).
3. **Energy pressure:** 1⚡ per minute, also while closed (timestamp-based). Running out opens the Energy sheet: 50⚡ for 20💎, or 30⚡ for coins at a price that rises by 300 per purchase to a daily maximum of 3,400 and resets the next day.
4. **Coin sinks:** Generator Workshop (5 levels, +7% lucky-spawn chance each, 250→3200 SAR), clearing sand tiles (40×n SAR), and changing a wing style (50×area SAR).
5. **Daily quests:** three per day of different kinds plus a royal chest for finishing all three. Completed, unclaimed rewards are delivered when the next day's quests begin, with a receipt retained in the quest panel. The bonus chest goes to the board or opens for its contents if the board is full.
6. **Phone-first layout:** a single-row HUD (level ring, energy with countdown, SAR, gems, menu), a fixed bottom navigation (Board, Majlis, Quests, Workshop, Shop), floating toasts that never push the board down, and pointer-based drag with a ghost item that works on touch screens. On a 390×664 viewport the whole 7×7 board is visible above the navigation.
7. **Save migration:** older saves are filled in from a fresh state so new fields never break existing players (`saveMigration.test.ts`).
8. **Economy simulator:** `npx tsx tools/sim/playtest.ts [areas] [runs] [--rewards]` runs a greedy continuous-play bot against the rules. The optional scenario claims daily gifts, quests, festival and story rewards, discoveries and a good pour, but does not model human breaks, gems, boosters, wheel spins or player choices. On ten fixed seeds, capping coin energy at 3,400 reduced mean simulated waiting in Riyadh from 175 minutes to zero and in Al-Khobar from 301 to 54 minutes. This is a diagnostic comparison, not a prediction of human pacing; player tests and economy monitoring are still required.
9. **Collection book:** the first time an item appears it can be claimed in the Chains guide for 10 SAR × level, plus gems from Lv.3 (`discoveryReward`). Badges on the Chains button and chain tabs show unclaimed finds; starting items and generators pay nothing.
10. **Installable web app and offline return:** `public/manifest.webmanifest`, icons in `public/icons/` and `public/sw.js` support an offline return after an online launch. The worker caches the game shell and loaded or prefetched public assets, so content that has never been downloaded may still need a connection. Its cache is isolated by deployment path. The build uses a relative base for a domain root or subpath; Capacitor uses bundled assets instead of the web service worker. Native offline behavior still needs testing on an iOS device.
11. **Hosting:** `.github/workflows/deploy-pages.yml` tests, builds and publishes `dist/` to the `gh-pages` branch on every push to `main`. One-time setup: repository Settings → Pages → Source "Deploy from a branch" → `gh-pages` / root. The game is then at `https://<owner>.github.io/<repo>/`.
12. **Rotating festivals (`src/game/events.ts`):** a new three-day festival every three local days (Khawlani Coffee Festival ☕, Date Harvest 🌴, Lantern Nights 🏮, Specialty Coffee Week 🫖). Merges earn the result level in points (double for the featured chain) and every order +10. An eight-step milestone track (30 → 1000 points) pays coins, energy, gems, scissors and jokers. Points reset with each new festival, but earned unclaimed milestones are delivered automatically at rollover, with a persistent receipt in the event panel. The bar shows progress, rewards and time left.
13. **Save transfer and local recovery:** HUD menu → Transfer progress shows a gzip-compressed code (`QM1.…`) to copy or share and loads a pasted code after confirmation. Compression has a JavaScript fallback for WebViews without compression streams. Each successful local save retains the previous valid save as a backup; unreadable primary data can recover from it, and unreadable saves are not automatically replaced. Storage failures show a warning. This is local protection and manual transfer, not a cloud save.
14. **Small phones:** the HUD shrinks and abbreviates large numbers below 360 px, and board toolbar labels collapse to icons, so nothing scrolls sideways at 320 px.
15. **Performance pass:** measured on an iPhone 13 profile with fast-3G throttling and a 4× slower CPU, before → after: title screen 4.7 s → 3.3 s, board 6.1 s → 4.4 s, largest paint 4.4 s → 3.2 s, idle script time 175 → 71 ms per 10 s.
    - Board icons and portraits are WebP (1,441 KB → 192 KB; `tools/art/to_webp.py` converts new Blender renders).
    - Item art preloads after the page is idle instead of competing with startup.
    - Only the Cairo font is requested (with the 900 weight the UI uses) instead of four families.
    - The Majlis, shop, chains/leaderboard, pour and transfer screens are separate chunks fetched when idle (main chunk 70.6 → 57.4 KB gzipped).
    - The per-second clock lives in `useNow()` inside the countdown pills and sheets, so the board no longer re-renders every second.
    - The ambient loop is re-rendered from source at 96 kbps (961 → 721 KB, same music, loop seam verified).
    - A market-research document that was being published under `public/` moved to `docs/research/`.
16. **Second performance pass:**
    - **First paint 3.2 s → 1.5 s:** `index.html` paints a splash (same emblem position as the title) before the code loads. It uses the system font on purpose, so the font download doesn't compete with the game code.
    - **Self-hosted Cairo** (`public/fonts/`, SIL OFL): one variable font for all weights, so there are no third-party connections or render-blocking stylesheet, and it works offline.
    - **Merge particles and shockwave rings use the Web Animations API** with concrete keyframes. CSS keyframes reading `var(--dx)` cannot run on the compositor, so style work per merge fell from about 210 ms to about 130 ms (4× CPU). The burst also honours `prefers-reduced-motion` again.
    - **Memoised `BoardCell`:** a merge or spawn re-renders only the tiles that changed. The rules engine reuses unchanged cell objects, which a test checks.
17. **Preact runtime:** `vite.config.ts` aliases `react`/`react-dom` to `preact/compat` at build time. The source code and TypeScript types stay React, and only the shipped runtime changes. Compared with the React build, measured on the same 3G/4× CPU iPhone profile:
    - The shared runtime chunk went from 68.8 KB to 9.8 KB gzipped.
    - Title ready went from 3.2 s to 2.2 s, largest paint from 3.15 s to 2.0 s, and the board from 4.05 s to 2.7 s.
    - Idle script time went from 49 to 5 ms per 10 s, and JS per merge from 92 to 22 ms.
    - A 17-step smoke test (title, story, login, tap and drag merges, sell, quests, workshop, shop, wheel, chains, energy, festival, pour, Majlis restore, pause, language, Fasih page) passes on both runtimes. To go back to React, delete the five `react*` aliases.
18. **Data Saver audio:** when the browser reports Data Saver or a 2G-class connection, the game plays the synthesized oud loop and never downloads the 721 KB music file. Otherwise the music is fetched once the page is idle after Play, after the short sound effects.
19. **Animated story scenes (Hollywood Merge style), phase 1: the opening prologue.**
    - **What it is:** new players see a short animated scene when they tap Play. Layla comes home to Diriyah at dusk, Grandma Noura shows her the crumbling Majlis, and the developer Rashid offers to buy it. The player chooses a firm answer (+5 gems) or a polite one (+100 SAR), and Noura hands over grandfather's dallah, which flies into the board as the tutorial starts.
    - **How it plays:**
      - Characters are painted waist-up portraits with expressions (docs/ASSETS.md, section 3c).
      - They slide in, breathe, bob while talking and dim when not speaking.
      - Lines type into a speech bubble, and every line is voiced (14 clips, 12 per playthrough). The two scene-setting lines use a narrator, and the player's chosen answer is spoken aloud by Layla.
      - The camera pans, zooms or shakes, with cinematic letterbox bars, and Skip is always available.
      - **Auto** (top corner) advances each finished line after a reading pause that grows with the line's length. It waits at choices, and the setting is remembered (`qahwa_scene_auto`).
      - **History** (next to Auto) opens every line of the scene so far, with speakers in their colours. Auto pauses while it is open, and Escape closes it.
      - Chapter 1 later echoes the choice with one extra line from Noura.
    - **Every story chapter is a scene too:** the 4 Diriyah chapters and one per area, 11 in all.
      - `src/story/chapterScene.ts` turns each chapter into a narrated title card, the speaker's lines opposite Layla (expressions follow the mood of each line), and a closing reply from Layla.
      - The chapter reward is paid when the scene ends or is skipped.
      - **Hand-written chapters** replace the adapter one by one (`HAND_WRITTEN` in `chapterScene.ts`). They add real back-and-forth, Rashid's returns, and choices whose flag and small reward apply once.
        - Chapter 1 (`src/story/scenes/chapter1.ts`): Rashid's opening line depends on the prologue answer (`rivalry`).
        - Showing him the wing (+5 gems) or offering him coffee (+100 SAR) sets `rashid_ch1` for later chapters.
        - Chapter 2 (Faisal, Sadu corner): Faisal reports Rashid's move after chapter 1. Serving Lama classic cardamom qahwa or Faisal's saffron latte sets `menu`.
        - Chapter 3 (Tariq, dallah majlis): Tariq was grandfather's friend and turned Rashid away. He mentions the drink from chapter 2. Asking about the royal blend or pouring him the first cup sets `tariq`.
        - Chapter 4 (Lama, Ramadan lanterns): Lama praises the chapter 2 drink. Rashid arrives softened or hostile, depending on chapter 1. Inviting him in or standing firm sets `rashid_ch4`.
        - Chapters 5–11, the area chapters (`src/story/scenes/areaChapters.ts`), are one journey across the Kingdom: Jeddah, AlUla, Taif, Abha, Al-Ahsa, Riyadh and Khobar.
          - Rashid follows Layla from city to city. He drifts towards partnership or rivalry depending on chapter 4 (`rashid_ch4`).
          - It comes to a head in Riyadh (`riyadh`: share the stand or keep it), and Sultan's honour in Khobar settles it (`finale`).
          - Each chapter also echoes an earlier choice, such as grandfather's clove from Tariq's blend in Taif, or the Abha farmers' thanks in Al-Ahsa.
          - A second lap round the areas uses the generic adapter.
        - **Epilogue** (`src/story/scenes/ending.ts`): plays right after the Khobar finale the first time, and is then rewatchable from the episode list.
          - Noura looks back, and the narrator recaps the decisions this player actually made.
          - The ending is named after the Riyadh choice: "The Majlis of Partnership" or "The Majlis That Stood Firm".
        - The lines are written with `src/story/scenes/build.ts`. Tests walk every choice under several earlier-choice combinations.
      - Every speaker is painted (Faisal, Tariq, Lama and Sultan joined in batch 2).
      - Each chapter has its own painted location: the Sadu corner and Ramadan lanterns for the Diriyah wings, and one per area (Jeddah, AlUla, Taif, Abha, Al-Ahsa, Riyadh, Khobar).
    - **Code:**
      - `src/story/` (types, a pure `engine.ts` reducer, `scenes/prologue.ts`, `flags.ts`).
      - `src/components/story/ScenePlayer.tsx` and its CSS, loaded on demand.
      - Save fields `seenScenes` and `storyFlags`. Saves from before this feature count the prologue as seen.
    - **Story episodes:** the HUD menu opens an episode list (`src/components/story/StoryLog.tsx`).
      - It shows the prologue and all 11 chapters.
      - Finished ones can be rewatched, with no second reward. Upcoming ones show locked, with a blurred speaker.
    - **Painted restoration stages:** in every area (Diriyah, Jeddah, AlUla, Taif, Abha, Al-Ahsa, Riyadh, Khobar), the Majlis view shows a painted banner in place of the vector diorama: ruin, half restored, then fully restored. It crossfades to the next stage as wings are restored (`src/game/majlisStages.ts`). Reaching a new stage shows a short caption ("The Majlis is coming back to life!" or "Fully restored!"). If a story episode opens on the same restore, the banner waits until it closes, so the moment isn't hidden. The Golden Afternoon, Lantern Night and Courtyard Rain chips each pick their own painted mood (`<area>_<stage>.webp`, `_night`, `_rain`) and crossfade between them; the other moods of the current stage are fetched quietly so a tap never waits. An area without painted stages falls back to the diorama. While the board is idle the app quietly fetches the banner for the current area, progress and mood (`bannerKey`), so opening the Majlis tab paints in about 0.4 s on fast 3G instead of 1.1 s; a mood picture that cannot load falls back to that stage's golden-afternoon picture.
    - **Wing pictures:** each wing card on the Majlis screen shows a painted thumbnail of that wing, the run-down version until it is renovated and the restored one afterwards (`public/assets/art/majlis/wings/`). They are cut from the stage pictures by `tools/art/make_wing_thumbs.py`, which holds where each wing sits in its area's painting; re-run it after repainting a stage.
    - **Episode teasers:** on the Majlis screen, each locked wing shows the episode it unlocks ("Restore to unlock Episode N", with the speaker's painted face). The travel card names the next area's episode.
    - **Title key art:** on phones, painted Layla with the dallah fills the title screen (`bg_title.webp`, 89 KB). It fades in after first paint, and the emblem holds its place until then, so nothing shifts.
    - **Loading:** chapter and epilogue scripts live in the lazily loaded scene chunk (App builds scenes through `useLazyScene`), so they add nothing to the first download.
    - **Testing:** `?scene=prologue` forces the prologue on the next Play. `tools/e2e/story_layout.cjs` plays every hand-written scene in both languages on an iPhone SE and flags speech bubbles that would cover faces. `tools/e2e/monkey.cjs` throws hundreds of random taps, button presses and drags at the whole game, then checks the save is still sane (finite, non-negative currencies, intact board). Six runs (5,400 actions, both languages) found no errors.
    - **Art:** `tools/blender/make_story_cast.py` renders Layla, Noura and Rashid with 3–4 expressions each, and `tools/blender/make_scenes.py` renders the backdrops (dusk street, courtyard, dallah close-up) with foreground layers for parallax. Everything is WebP via `tools/art/to_webp.py`: 424 KB in total, preloaded on the title for new players.
    - **Voice:** Layla is "Nora S – Saudi Natural & Calm", Rashid is "Faisal alotaibi – Warm Saudi Voice", and Noura keeps her voice. The files live in `public/assets/audio/story/`, and each was checked word for word with speech-to-text.
    - **Cost to returning players:** none measurable (first paint and title-ready match `main`). The scene chunk is 4.4 KB gzipped plus 4 KB of CSS, and it shows no long tasks while animating at 4× CPU.
    - **Phase 2 (after phone testing):** turn every chapter and area arrival into a scene, add milestone mini-scenes, and give the other characters half-body expression sets.

---

### C. Meta-Renovation, Kingdom Map, LiveOps & Saudi Monetization
1. **Interactive Architectural Diorama (`MajlisRenovationView.tsx`):**
   - 4 upgradable architectural wings (**Najdi Mud-Brick Archway**, **Sadu Majlis & Brass Hearth**, **Specialty V60 & Espresso Bar**, **Courtyard Fountain & Ghabga Lanterns**), each with 2 upgrade tiers and **3 selectable Khaleeji interior design styles**.
   - Upgrading wings increases the permanent **SAR Coin Bonus per Order** and triggers serialized bilingual story chapters, played as animated scenes (`src/story/chapterScene.ts`).
2. **Kingdom Trail (`رحلة المملكة`):**
   - The diorama follows the current area's region: **Historic Diriyah (`الدرعية التاريخية`)**, **Jeddah Al-Balad (`جدة التاريخية - البلد`)** with Hijazi Rawasheen latticework, or **AlUla (`واحة العلا`)** with rose-red monoliths. See B3 for the full eight-area journey.
3. **Dynamic Courtyard Weather & Ambiance Toggle (`أجواء الحوش`):**
   - Toggle between **Golden Afternoon (`عصاري نجد`)**, **Lantern Night (`ليالي الفوانيس`)**, and **Courtyard Rain (`مطر الحوش`)**. Painted scenes show corresponding light and weather effects; rain animation stops under reduced motion. The selection is saved.
4. **Majlis showcase:**
   - Compares the player's prestige against fictional local examples. It is not an online ranking.
5. **Local Majlis choices:**
   - Players choose from fictional designs to earn `+25 coins` and `+20 prestige` per choice. Choices are stored locally and do not reset weekly.
6. **Finjan lucky wheel (`عجلة فنجال الصباح`):**
   - Six wedges award energy, coins, gems, tools, or a chest. The pointer lands on the awarded wedge. A spin requires a free board tile so a chest can always be placed.
7. **Diriyah Souq shop (`ShopAndMadaModal.tsx`):**
   - **Shop tab:**
     - A free daily hospitality gift (+40 energy, +25 coins), once per calendar day (`claimShopGift`, `shopGiftDay`).
     - Existing saves with the Majlis Sheikh pass retain its energy cap and generator benefit.
   - **Milestones tab:** the four Majlis-point rewards.
   - **Purchases:** no real-money offers are shown until a real store purchase flow is implemented and tested. The previous simulated paid buttons have been removed.
   - **Collection:** the item collection lives in the Chains book.
8. **Procedural WebAudio Hijaz Maqam Synthesizer (`soundAndHaptics.ts`):**
   - Uses bundled audio when available and synthesized fallback sounds. Capacitor Haptics provides native impact feedback; browsers use vibration when supported. The menu has a separate persistent haptics toggle.

---

## 3. Codebase Architecture & File Map

```text
/
├── capacitor.config.json                     # Capacitor configuration (sa.qahwamajlis.merge)
├── metadata.json                             # App metadata & capabilities
├── index.html                                # Bilingual Cairo + Plus Jakarta Sans typography & SEO meta tags
├── DOCUMENTATION.md                          # Complete product, engineering & roadmap documentation
└── src/
    ├── App.tsx                               # Main game shell ('title' | 'playing' | 'paused' | 'gameover'), HUD, 7x7 board, Pantry & Boosters
    ├── index.css                             # Tailwind v4 configuration, custom Sadu geometric trim, RTL/LTR typography rules
    ├── game/
    │   ├── rules.ts                          # Pure deterministic Merge-2 engine, 30-item catalog, orders, boosters, wheel & renovation logic
    │   └── rules.test.ts                     # Automated Node test suite (7 test suites covering all pure game mechanics)
    ├── utils/
    │   └── soundAndHaptics.ts                # WebAudio Hijaz Maqam synth, haptic feedback & versioned LocalStorage persistence
    └── components/
        ├── ItemArtwork.tsx                   # 30 bespoke SVG illustrations (4 generators, 24 chain items, 2 treasure chests)
        ├── CompetitorModalsAndPortraits.tsx  # Illustrated Khaleeji character portraits, 4-Chain Evolution Tree, KSA Leaderboard, Mazayen & Spin Wheel
        ├── MajlisRenovationView.tsx          # Interactive architectural SVG diorama, Kingdom Map (Diriyah/Jeddah/AlUla) & Weather Ambiance
        └── ShopAndMadaModal.tsx              # Diriyah Souq: daily gift, existing pass status, Majlis-point milestones
```

### Painted loading

On phones the splash shown in `index.html` while the game code loads, and the title screen while its full-size key art loads, sit on a tiny blurred copy of the title painting (about 0.5 KB as a data URI, `src/utils/titlePlaceholder.ts`). Loading therefore looks like the title that follows, and the full art sharpens in over it. `python3 tools/art/make_title_placeholder.py` regenerates both copies after the key art changes. Measured on a fast-3G, 4x slower CPU profile it moves first paint by about +50 ms (1.34 to 1.39 s) with the title ready at the same time. Desktop is unchanged.

### What ships in the app

Everything under `public/` is copied into the web build and into the iOS app, so it counts toward the download. The built game is about 21 MB. Art that is kept for reference but not loaded by the game lives in `tools/art/archive/` (see its README), not in `public/`. Before adding a large file under `public/`, check that something loads it; `npm run check:ios-assets` (after `npx cap copy ios`) confirms the iOS copy matches the web build.

### Accessibility

`node tools/e2e/a11y.cjs en,ar http://localhost:4173/` (after `npm install --no-save axe-core`) audits the main screens in both languages against WCAG 2.0/2.1/2.2 A and AA. The current build passes on all 18 screen states. Fixed in the last pass: white text on the brand orange was 3.2:1, now 5.0:1 (`#B45309`); faded text on dark and cream surfaces; pinch-zoom is allowed again (the viewport no longer locks the scale, and `touch-action: manipulation` only stops double-tap zoom); a hidden page heading per screen; keyboard access to scrollable lists; and the spoken names of the energy, coin and gem buttons, the boost toggle and VIP guests now include the number or label shown on them (voice-control users say what they see). This does not replace VoiceOver, Switch Control and Voice Control testing on a device, which `codex-plan.md` lists as outstanding.

### App Store screenshots

`store/screenshots/<en|ar>/` holds the five 1290x2796 store screenshots per language, captured from the real game and framed with captions by `tools/store/capture.cjs` and `tools/store/compose.cjs`. See `store/README.md` for the list, how to regenerate them, and the note that the Arabic captions need native review.

### Running Tests & Building for iOS / Android
The repository includes the Capacitor iOS project and matching runtime, CLI and platform packages. The native project uses Swift Package Manager and has been synced on Windows, but has not been built in Xcode. Building and testing locally for iOS requires macOS and Xcode; see the [official setup requirements](https://capacitorjs.com/docs/getting-started/environment-setup).
```bash
# 1. Install the locked dependencies
npm ci

# 2. Run tests and check TypeScript
npm test
npm run lint

# 3. Build production web bundle
npm run build

# 4. Sync the existing iOS project and open it on a Mac
npx cap sync ios
npm run check:ios-assets
npx cap open ios
```
Subsequent web builds need `npm run build` and `npx cap sync ios`; run `npm run check:ios-assets` after syncing to detect missing or stale bundled files and accidental remote server configuration. This check does not replace an Xcode build or offline testing on a physical device. Do not run `cap add ios` again for the existing native project. The haptics plugin is included in the iOS project, but the feedback still needs verification on a physical iPhone. Splash Screen and Status Bar configuration does not install those plugins by itself.

---

## 4. Future Roadmap: Next Features to Build (Phase 3 & Phase 4)

To scale **Qahwa & Majlis Merge** from soft launch in Saudi Arabia & UAE to a **$500k+/month Top-10 Grossing MENA title**, here is the prioritized roadmap for future development:

### Phase 3: Social Guilds, Cloud Save & Native iOS Polish (Next 30 Days)
1. **"Diwan Guilds / Majlis Al-Qabila" (تحالف المجالس والقبائل — Co-op Clans):**
   - Allow 20–30 players to form a **Diwan Clan**, send each other **free +5 Energy Finjans** every 4 hours, and collaborate on weekend **"Royal Banquet Orders" (وليمة القصر الملكي)** where all clan members contribute high-tier `Lv.6` items to unlock a shared Diamond Chest.
2. **Sign in with Apple + Firebase / CloudKit Cross-Device Sync:**
   - Replace local-only `localStorage` with automatic **Sign in with Apple** + Firestore cloud save so players keep their VIP purchases, Gems, and Diriyah estate progress across iPhone and iPad.
3. **Native StoreKit 2 & Apple Pay In-App Purchases (`@capacitor-community/in-app-purchases`):**
   - Bind the 4 SAR bundles (`pack_finjan`, `pack_vip`, `pack_sadu`, `pack_royal`) and the **Golden Bubble Gem Sink** to real App Store Connect consumable/non-consumable SKUs with server-side receipt validation.
4. **iPhone Dynamic Island & Live Activities (iOS 18+):**
   - Following the benchmark set by top Saudi apps like *Miran*, add an iOS Live Activity / Dynamic Island widget showing:
     - **Energy Full Notification:** *"طاقتك ممتلئة (100/100)! الضيوف بانتظار القهوة في مجلس الدرعية"*
     - **Generator Cooldown / VIP Rush Timer** right on the Lock Screen.
5. **Secondary Sub-Generators & Producer Cooldowns:**
   - Make `Lv.6` max-level items (such as the **Royal Diriyah Dallah Set** or **Grand Roastery Flight**) act as temporary **Golden Sub-Generators** that drop 5 bonus coins/gems before turning into a trophy.

### Phase 4: Saudi Cultural Calendar LiveOps & Mini-Games (Days 30–90)
6. **Seasonal Saudi Calendar LiveOps Engine:**
   - **Saudi Founding Day (يوم التأسيس — Feb 22):** Unlock historic First Saudi State Diriyah costumes for Noura, Faisal, and Sheikh Tariq + limited-edition *Kleija & Jareesh* merge chain.
   - **Ramadan & Eid Al-Fitr Season:** 30-day *Suhoor & Ghabga* pass with exclusive crescent lanterns and Oud melodies.
   - **Saudi National Day (اليوم الوطني — Sept 23):** Green & Gold Sadu board skin and double Hospitality Prestige weekend.
   - **Riyadh Season & Winter at Tantora (موسم الرياض وشتاء طنطورة):** Pop-up specialty café trucks in Boulevard City and Maraya AlUla.
7. **Mini-Game Between Renovations: "Finjan Pouring & Latte Art" (تحدي صبّ الفنجال وفن اللاتيه):**
   - Whenever a player completes a major renovation wing, trigger a 15-second tactile mini-game where they tilt the brass Dallah to pour Qahwa to the exact traditional *"Rub'a al-Finjan"* (quarter-cup mark of generosity) or draw a rosetta on a Spanish Latte for bonus Gems.
8. **VIP "Riyadh Roastery Pass" Subscription (SAR 29.99/month):**
   - Recurring auto-renewable subscription granting:
     - Permanent **150 Max Energy** cap (up from 100)
     - **+2 Extra Sadu Pantry Slots** (6 slots total)
     - **Daily Free Royal Joker Shard**
     - Exclusive **Golden Sadu Nameplate** on the Diwan Al-Karam Leaderboard.
9. **Saudi Dialect Voice Acting (تمثيل صوتي باللهجات النجدية والحجازية والجنوبية):**
   - Add warm, authentic 3-second voice lines for Grandmother Noura (*"يا هلا والله بضيوفنا"*), Barista Faisal, and Sheikh Tariq when their orders are served or when story chapters open.


---

## 5. Fasih Kids (فصيح) — Arabic Reading & Tashkeel Coach (Blueprint 3)

A second page in the same Vite project (`fasih.html`, entry `src/fasih/main.tsx`), so one repo and one Capacitor shell can ship both apps.

- **Live reading coach:** the child reads a fully-voweled story line or classical poem aloud (Mutanabbi, Ahmed Shawqi, children's stories). Recognised speech is aligned to the target text *while streaming*: each word turns green (correct), amber (a different word was spoken), red (skipped) or stays neutral until reached. Stars: ≥90% three, ≥70% two, ≥40% one.
- **Tashkeel coach:** pick damma, fatha or kasra for a word's case ending, then see the grammatical reason (e.g. "مفعول به منصوب").
- **Parent report:** weekly-style summary (stars, lessons, Tashkeel accuracy, practice streak) with a one-tap WhatsApp share link.
- **Engine:** `src/fasih/engine.ts` (pure, tested in `src/fasih/engine.test.ts`); content in `src/fasih/content.ts`.
- **Run:** `npm run dev` then open `/fasih.html`; `npm run build` emits both pages.

**Known limits (be honest in store listings):**
1. Speech engines return *undiacritized* text, so the coach detects skipped and mispronounced **words**, not wrong **vowels**; vowels are trained in the Tashkeel coach instead. A true vowel-level ASR needs a custom model.
2. Recognition uses the browser's `SpeechRecognition` (`ar-SA`), which needs network on most engines and is absent in some WebViews. Without it the app falls back to tap-to-mark self-checking. A native iOS build should add a Capacitor speech-recognition plugin.
3. Lesson text and diacritics were written by hand and should be proofread by an Arabic teacher before launch.
