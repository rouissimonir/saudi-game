# Qahwa & Majlis Merge (قهوة ومجلس: دمج وحكاية)
**Complete Product, Architecture, Competitor Benchmark & Future Roadmap Documentation**

---

## 1. Executive Summary & KSA iOS Market Thesis

**Qahwa & Majlis Merge (قهوة ومجلس)** is a bilingual (Arabic RTL / English LTR) **Khaleeji Narrative Merge-2 & Specialty Coffee Estate Renovation Game** built with **React 19, TypeScript, Tailwind CSS, and Capacitor iOS/Android**.

### Why This Niche Was Selected (#1 Ranked MENA Opportunity)
1. **Zero Local Studio Competition in a Top-Grossing Genre:**
   - Seven foreign Merge-2 games (*Gossip Harbor* #10, *Tasty Travels* #19, *Travel Town* #29, *Hollywood Merge* #49, *Merge Cooking* #63, *Foodstars* #65, *Seaside Escape* #66) are charting inside the **Saudi Arabia iOS Top 70 Grossing** leaderboard.
   - **0%** of those titles are built by Arab studios or feature Khaleeji culture, Saudi specialty coffee (*Qahwa*), or Najdi/Hijazi architecture.
2. **Proven Saudi VC & Consumer Appetite for Cultural Games:**
   - Saudi venture firm **Impact46** recently led a **$53M+ investment** in *Kammelna* (#8 Top Grossing KSA), while solo-developed *Mazayen* (لعبة مزاين) surged to **#37 Top Grossing in Saudi Arabia**, out-grossing *MONOPOLY GO!* (#38) and *Clash Royale* (#41).
3. **100% Deterministic Client-Side & Capacitor Native Packaging:**
   - Unlike voice-AI or live-multiplayer apps that suffer from API latency or cold-start liquidity risks, a Merge-2 + Meta-Renovation game runs at **60fps offline**, uses deterministic state rules, and packages into an Xcode `.ipa` / Android `.aab` via Capacitor.

---

## 2. Complete Inventory of Features Built (v1 → v3)

### A. Core Merge-2 Board & 4 Cultural Merge Chains (30 Items Total)
- **7×7 Warm Sand-Parchment & Roasted Walnut Merge Board:**
  - High-contrast checkerboard tiles (`#FBF5E8` / `#F3E5AB`) inspired by *Gossip Harbor* and *Travel Town* so colorful coffee, V60, Oud, and Kunafa illustrations pop.
  - Supports **HTML5 Drag-and-Drop**, **Tap-to-Select + Tap-to-Merge/Move/Swap**, and **1-Tap Smart Auto-Merge (`دمج تلقائي ذكي`)**.
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
2. **Mega Merge (`دمج ثلاثي`):** when a third identical item touches the merge tile it is absorbed and the result jumps one extra level.
3. **Level-Up Rewards:** every 100 XP grants `+5💎` per level gained and refills Energy to max, with a celebratory toast.
4. **Merge Burst FX:** a golden burst on every merge (larger for Lv.4+, green for Mega Merge); honours `prefers-reduced-motion`.

5. **7-Day Daily Login Streak (`غبقة اليوم`):** one reward per calendar day (Energy, SAR, Gems, Scissors, Joker, a free wheel spin, and a Gilded chest on Day 7). Missing a day resets the streak; the cycle repeats after Day 7. If the board is full on Day 7 the chest converts to 180 SAR.
6. **First-Run Coach:** a dismissible banner teaches merging first, then serving an order; existing saves that already merged skip it.

7. **Saudi Cultural Calendar (`تقويم المملكة`):** Founding Day (Feb 21–23) and National Day (Sep 22–24) give ×1.5 order SAR and double prestige; Ramadan (×1.25 / ×1.5) and Eid (×2 SAR) are detected from the Umm al-Qura Hijri calendar. A banner in the merge view shows the active season.
8. **Rub'a al-Finjan Pouring Mini-Game (`تحدي ربع الفنجال`):** each renovation upgrade earns one challenge. Hold to pour and release near the 25% mark (±4 perfect, ±10 good) for SAR, gems and a Royal Joker.
9. **Ambient Hijaz Oud Loop:** a quiet synthesized oud phrase over a low D drone plays while the game is unmuted; no audio files.
10. **Blender-rendered art:** seven hero props (`tools/blender/make_art.py` into `public/assets/art/`, the title emblem uses the dallah) and all 30 board item icons (`tools/blender/make_items.py` into `public/assets/art/items/`, 256px, shown by `ItemArtwork` with the SVG as fallback), plus six 3D character busts (`tools/blender/make_characters.py` into `public/assets/art/characters/`, shown in the order strip and story dialogue). See `docs/ASSETS.md` for extending them and for where to source the remaining art, music and voice.
11. **Generated music:** `tools/audio/make_music.py` renders a seamless 60 s Hijaz oud loop (`ambient.mp3`) plus `order_complete.mp3` and `level_up.mp3` stingers into `public/assets/audio/` (physically-modelled oud, darbuka, reverb; numeric checks in `verify_music.py`). The game loops the file gaplessly via WebAudio and falls back to the synthesized oud and chimes if a file is missing, so any file can be replaced by a human recording.
12. **Character voice lines:** 32 dialect lines for the six characters (`src/game/voiceLines.ts`), spoken when an order is served and when a story chapter opens. Plays a recorded file `public/assets/audio/voice/<id>.mp3` if present, else the device's Arabic text-to-speech tuned per character, else silence; music ducks while a character speaks. `tools/voice/generate_elevenlabs.py` produces the recorded files with ElevenLabs (see `docs/ASSETS.md`, section 4) and `docs/VOICE_LINES.md` is a recording sheet for a human actor.

---

### C. Meta-Renovation, Kingdom Map, LiveOps & Saudi Monetization
1. **Interactive Architectural Diorama (`MajlisRenovationView.tsx`):**
   - 4 upgradable architectural wings (**Najdi Mud-Brick Archway**, **Sadu Majlis & Brass Hearth**, **Specialty V60 & Espresso Bar**, **Courtyard Fountain & Ghabga Lanterns**), each with 2 upgrade tiers and **3 selectable Khaleeji interior design styles**.
   - Upgrading wings increases the permanent **SAR Coin Bonus per Order** and triggers serialized bilingual story chapters (`StoryDialogueModal.tsx`).
2. **Multi-Location Kingdom Map (`خريطة مجالس المملكة`):**
   - Switch between **Historic Diriyah (`الدرعية التاريخية`)**, **Historic Jeddah Al-Balad (`جدة التاريخية - البلد`)** with Hijazi Rawasheen latticework, and **AlUla Sandstone Oasis (`واحة العلا الصخرية`)** with rose-red desert monoliths.
3. **Dynamic Courtyard Weather & Ambiance Toggle (`أجواء الحوش`):**
   - Toggle between **Golden Afternoon (`عصاري نجد`)**, **Lantern Night (`ليالي الفوانيس`)**, and **Courtyard Rain (`مطر الحوش`)** with live SVG rain streaks and procedural Oud chimes.
4. **"Diwan Al-Karam" Saudi Prestige Leaderboard (`صدارة ديوان الكرم`):**
   - Ranks the player's Majlis against top rival cafés across Diriyah, Riyadh, Jeddah, AlUla, and Al-Khobar.
5. **Weekly "Mazayen Al-Majlis" Showcase Contest (`مسابقة مزاين المجالس`):**
   - Players vote on rival Saudi cafés to earn instant `+25 SAR` and `+20 Prestige Points` per vote.
6. **Daily "Finjan Al-Sabah" Lucky Dallah Spin Wheel (`عجلة فنجال الصباح`):**
   - 6-wedge interactive SVG wheel with 1 free spin (and `15💎` respins) awarding Energy, Gold Riyals, Gems, Golden Scissors, Royal Joker, or a Majlis Sadu Chest.
7. **Saudi Mada / Apple Pay / STC Bank Checkout & Ramadan Ghabga Pass (`ShopAndMadaModal.tsx`):**
   - Localized SAR pricing (`SAR 14.99`, `SAR 29.99`, `SAR 49.99`, `SAR 99.99`) with simulated Apple Pay (Mada `مدى`) and STC Bank payment rails, plus a 4-milestone Ramadan Ghabga Event track and Capacitor iOS export guide.
8. **Procedural WebAudio Hijaz Maqam Synthesizer (`soundAndHaptics.ts`):**
   - Zero external audio file dependencies—synthesizes authentic Hijaz scale Oud & Najdi brass mortar (`نجر`) harmonics and triggers native haptic vibrations.

---

## 3. Codebase Architecture & File Map

```text
/
├── capacitor.config.ts                       # Capacitor iOS & Android native configuration (com.diriyah.qahwamajlis)
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
        ├── StoryDialogueModal.tsx            # Serialized bilingual Khaleeji narrative chapters & reward claims
        └── ShopAndMadaModal.tsx              # Saudi Mada / Apple Pay / STC Bank store, Ramadan Ghabga LiveOps pass, Almanac & Capacitor guide
```

### Running Tests & Building for iOS / Android
```bash
# 1. Run pure game logic unit tests
npx tsx --test src/game/rules.test.ts

# 2. Build production web bundle
npm run build

# 3. Package for iOS App Store via Capacitor
npx cap add ios
npx cap sync ios
npx cap open ios
```

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
