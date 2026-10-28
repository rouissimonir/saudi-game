# Arabic and cultural review packet

The game's Arabic was written by a non-native speaker. `codex-plan.md` lists a Saudi cultural and dialect review as outstanding. This packet makes that review practical: one sheet with every Arabic string in the game, and the questions that only a native reviewer can answer.

**The sheet:** [`docs/arabic-review/arabic_review.csv`](arabic-review/arabic_review.csv), 895 strings. Open it in Excel or Google Sheets (UTF-8 with a BOM, so Arabic displays correctly). Regenerate it after any text change with `npx tsx tools/review/export_arabic.ts`.

| Section | What it holds | Count |
|---|---|---|
| Story | Every line and choice in the prologue, chapters 1 to 11 (under two sets of earlier choices, so both branches appear) and the epilogue, including the seven local hosts | 229 |
| Voice | The 32 recorded lines, each with the dialect its voice was briefed for | 32 |
| Data | Names and descriptions in the game tables: items, wings, areas, styles, guests, quotes | 297 |
| UI | Text on screens, buttons, notices and errors | 331 |
| Store | The App Store screenshot captions and the page description | 6 |

Row IDs are unique and say where a row comes from: `STY001`.. (story), `VOX001`.. (voice), `DAT001`.. (data), `UI001`.. (screens) and `APP001`.. (store).

## How to review

For each row, fill the three right-hand columns:

- **Verdict:** `OK` or `Fix`.
- **Suggested Arabic:** the wording you would use. Keep any `${...}` placeholders exactly as they are; they are filled in by the game.
- **Reviewer note:** why, or a question for the team.

The **Auto note** column only flags things worth a second look: `colloquial` (the line uses spoken-dialect words), `long for a bubble` (over 85 characters; story bubbles are small, so shorter suggestions are welcome), `has Latin letters`.

Row order puts story first because it carries the most voice and tone. If time is short, review **Story and Voice first, then Store, then Data, then UI**.

## Questions only a native reviewer can answer

**Dialect**
1. The story is written in a Khaleeji / Najdi-leaning spoken Arabic ("وش", "ليش", "مو", "الحين", "يبي"). Is that the right register for this audience, or should narration be more formal and only the characters colloquial?
2. Each character was given a dialect for voice casting (see the Voice section): Grandma Noura Najdi, Faisal Hijazi, Sheikh Tariq Najdi, Lama Riyadh youth. Do their *written* lines match, and does anyone read as the wrong region?
3. **The seven local hosts** (Abu Hani, Reem, Hessa, Aisha, Abu Khalid, Dana, Captain Nasser) speak in the same general register. Should each speak their own regional dialect: Hijazi in Jeddah, Hejazi-highland in Taif, Asiri in Abha, Hasawi in Al-Ahsa, Gulf coastal in Al-Khobar? If yes, please supply the lines.
4. Honorifics and kinship terms: "يا بعد عمري", "يا بنتي", "عم أبو هاني", "الجدة نورة", "الشيخ طارق", "النوخذة". Are they natural and respectful in these relationships?

**Cultural detail**
5. **Dress** (the portraits and their descriptions): Abu Hani (white thobe, grey sidri waistcoat, ghutra with agal, prayer beads), Abu Khalid (white shemagh worn without agal, thobe with folded sleeves), Captain Nasser (navy coat over a thobe, ghutra and agal), Reem (black headscarf, linen tunic), Hessa (rose-print headscarf, green embroidered abaya), Aisha (Al-Qatt striped dress and the wide woven straw sun hat), Dana (black open abaya, cream scarf, lanyard). Accurate, respectful, and right for the place?
6. **Al-Qatt Al-Asiri** (Abha): the story says the painting is traditionally done by women, the walls are painted before guests arrive, and the lines say "you are family". Correct?
7. **Taif:** Grandma's story that Grandpa proposed with rose-water coffee, and the drink named "the Proposal Cup" (فنجال الخطوبة). Is the custom plausible and the name appropriate?
8. **Pearl diving** (Al-Khobar): "النوخذة" for the captain, the first cup waiting on deck for a diver who surfaces, and the line that a pearl "is not sold, it is given". Accurate?
9. **Coffee etiquette** in the pour mini-game ("quarter cup" challenge), serving order, the right hand, shaking the cup to say "enough": is it shown and worded correctly?
10. **Occasions:** the Ramadan ghabga chapter, "Founding Day", the "Date Harvest Season" and the other festival names.
11. **Names:** all character names are fictional. Any that read as a real public figure, a tribe, or the wrong region for their character?
12. **Phrases:** "الله يرحمه", "إن شاء الله", "يا هلا" and any proverbs or blessings used. Used in the right places?

**Store and tone**
13. The page and share description, and the five screenshot captions. Natural, not exaggerated, and no claim a Saudi parent or regulator would object to?
14. Anything that could offend, or any ordinary detail of Saudi hospitality that is missing or wrong.

## After the review

Send the filled sheet back. Each row's **Where** column names the file and line (or the scene and beat) to edit, so corrections are mechanical to apply; the story and voice lines also feed the recorded voice sheet (`docs/VOICE_LINES.md`), so an edited voice line means a re-recording. Keep a copy of the reviewer's name, the date and the build commit in the sheet or in `codex-plan.md`, so the review is on record.

### Checking and applying a filled sheet

`npx tsx tools/review/check_review.ts <filled.csv>` reads the sheet back and changes nothing. It reports:

- **Blocked rows**: an ID that no longer exists (the sheet is out of date, so export again), a suggestion identical to the current text, changed `${...}` placeholders, line breaks or backslashes, a story or voice line over 90 characters (it will not fit a speech bubble), or an OK verdict that also has a suggestion.
- **Would be applied**: each Fix with its before and after, the file it lives in, and any warnings (much longer text, Latin letters, stray spaces).
- **Edit by hand**: a valid suggestion whose old text is built from parts rather than a whole string, so it cannot be replaced mechanically.
- **Voice lines to re-record**, and every reviewer note or question that needs an answer rather than an edit.

Read the report, drop or correct any change you disagree with in the sheet, then apply with `--write --source "Saudi reviewer, Name, date"`. Every applied change is appended to `docs/arabic-review/changes_log.csv` (date, commit, ID, before, after, source, note), so who changed what, and who reviewed it, stays on record. `--report out.md` also saves the report. After applying, run `npm run review:export`, `npm test`, the story-layout, accessibility and smoke checks in `tools/e2e/`, and re-record any listed voice lines.

The `--source` text is the honest record of who reviewed. An AI-assisted pass (for example "AI review (Codex)") can catch typos and stiff phrasing, but it is not a native Saudi review: label it as such, and keep the questions above open until a Saudi reviewer answers them.

This packet checks nothing by itself. It does not replace a Saudi reviewer, and no Arabic in the game should be treated as reviewed until the sheet is back.
