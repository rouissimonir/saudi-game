# Story background prompts (for Codex or any image tool)

Everything needed to repaint the three prologue backdrops so they match the painted characters. Each prompt below is
complete on its own: copy it as-is. Character prompts are in `docs/PORTRAIT_PROMPTS.md`.

---

## Task for Codex, batch 1 (done: street, courtyard, dallah)

> You are working in the `rouissimonir/saudi-game` repository on branch `feature/painted-backgrounds`.
>
> Generate the 3 story backgrounds listed in `docs/BACKGROUND_PROMPTS.md` using your image generation tool.
>
> **References:** for every image, attach the reference files named in its section. They are in the repository.
>
> **Output:**
> - PNG, tall portrait.
> - Use 9:16 (for example 1080x1920) if your tool supports it, otherwise the tallest portrait size available (for example 1024x1536).
> - Saved to `tools/art/background_inbox/` with the exact file names given.
>
> **Check:** look at each image before saving. Regenerate if any of these fail:
> - It matches the painted style of the style references.
> - There are no people, animals, text, letters, logos or watermarks.
> - The lower third is calm and uncluttered, because characters and the dialogue box cover it.
> - The important details sit inside the central 80% of the width.
> - The light comes from a low sun on the left.
>
> **Finish:** commit the 3 PNGs with the message "Add painted story backgrounds" and push the branch. Do not change any other files.

---

## How the backgrounds are used (already reflected in every prompt below)

- **Screen:** the phone screen is tall (9:16). The image fills it edge to edge, and the sides may be cropped on some phones.
- **Camera:** the scene camera slowly pans and zooms up to about 10%, so nothing important may sit at the very edges.
- **Characters:** painted waist-up portraits stand in front, covering roughly the bottom 65% of the screen on the left, centre or right.
  - Their heads sit at about 35–45% of the height from the top.
  - A dialogue box covers the bottom 28%.
- **Layout rule:** put the scene's main story detail in the upper-middle (about 15–60% of the height). Keep the bottom third simple, such as open ground, floor or rug, with no busy detail.
- **Light:**
  - The characters are lit by warm sunset light from the upper left, with a golden rim.
  - Every outdoor background has a low sun on the left and long soft shadows falling to the right.
  - The indoor background is warm lantern light from the left.
- **Style:**
  - Semi-realistic digital painting matching the characters: soft painterly brushwork, believable perspective and scale, warm and rich colour, gentle atmospheric depth.
  - Not anime, not photoreal, not 3D, not flat vector.
  - Slightly softer detail than the characters, so they stay in front visually.
- **Place:** At-Turaif, the historic district of Diriyah, near Riyadh, Saudi Arabia.
  - Najdi mud-brick architecture: thick earthen walls the colour of warm ochre clay, rows of small triangular openings, stepped triangular crenellations along the rooftops, and wooden palm-trunk beams poking out of the walls.
  - Carved wooden doors painted with simple geometric Najdi patterns.
  - Date palms. No modern objects.

---

## 1. `bg_street.png`: Diriyah street at sunset (Layla arrives home)

**Attach:**
1. `tools/art/portrait_refs/style_layla_neutral.jpg` and `tools/art/portrait_refs/style_layla_happy.jpg`, the painting style and lighting to match.
2. `public/assets/art/story/bg_street.webp`, the current simple 3D version, for layout and colours only (match its idea, not its toy look).

**Prompt:**

> Reference 1 shows the exact painting style and warm sunset lighting to match: semi-realistic digital painting, soft painterly brushwork, warm golden rim light from the left. Reference 2 is a simple 3D mock-up of this scene: use it only for layout and colours, not its blocky toy look.
>
> Paint a tall vertical 9:16 background of a quiet street in At-Turaif, the historic mud-brick district of Diriyah, Saudi Arabia, at sunset, as seen by someone arriving home after years away. Two- and three-storey Najdi mud-brick houses of warm ochre clay line both sides of the street, leading the eye into the distance. Thick earthen walls with rows of small triangular openings, stepped triangular crenellations along the rooftops, wooden palm-trunk beams poking out of the walls, and a carved wooden door painted with simple geometric Najdi patterns on the right-hand house. A few tall date palms rise above the rooftops in the middle distance. A large, low, glowing sun sits just above the rooftops on the left, with long soft shadows falling to the right across the packed-earth street. The sky is a warm gradient from pale gold near the horizon through peach and rose to soft lavender at the top, with a few thin glowing clouds.
>
> Composition: the houses and palms fill the upper-middle of the frame (about 15–60% of the height); the bottom third is open, softly lit sandy street with gentle shadows and no clutter. Keep important details inside the central 80% of the width. Eye-level view, gentle depth and atmospheric haze in the distance.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, believable perspective, warm rich colours, slightly softer detail than a character portrait. Not anime, not photoreal, not 3D, not flat vector. No people, animals, text, letters, signs, logos or watermarks.

## 2. `bg_courtyard.png`: the grandfather's crumbling Majlis courtyard

**Attach:**
1. `tools/art/portrait_refs/style_layla_neutral.jpg` and `tools/art/portrait_refs/style_layla_happy.jpg`, the painting style and lighting to match.
2. `public/assets/art/story/bg_courtyard.webp`, the current simple 3D version, for layout and colours only.

**Prompt:**

> Reference 1 shows the exact painting style and warm sunset lighting to match: semi-realistic digital painting, soft painterly brushwork, warm golden rim light from the left. Reference 2 is a simple 3D mock-up of this scene: use it only for layout and colours, not its blocky toy look.
>
> Paint a tall vertical 9:16 background of the inner courtyard of an old family Majlis in At-Turaif, Diriyah, Saudi Arabia, at sunset. Once beautiful, it is now neglected and crumbling, sad but still dignified and clearly worth saving. A tall Najdi mud-brick wall of warm ochre clay fills the back of the courtyard, with rows of small triangular openings, stepped triangular crenellations along the top, a carved wooden door with faded geometric paint, and a small wooden window shutter hanging slightly crooked. Long cracks run across the wall, patches of plaster have fallen away to show the mud bricks beneath, and one corner of the crenellations has broken off. In the middle of the courtyard floor stands a round, dry stone fountain, empty and dusty, with a cracked rim. A few fallen mud bricks and some dry palm fronds lie scattered near the walls. Low warm sunlight comes from the left, casting long soft shadows to the right, with a pale peach and rose sky above the wall.
>
> Composition: the cracked wall and door fill the upper-middle of the frame (about 15–60% of the height). The dry fountain sits low in the centre, and the bottom third is mostly open, softly lit courtyard floor with only small rubble near the sides. Keep important details inside the central 80% of the width. Eye-level view.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, believable perspective, warm rich colours, slightly softer detail than a character portrait. Not anime, not photoreal, not 3D, not flat vector. No people, animals, text, letters, signs, logos or watermarks.

## 3. `bg_dallah.png`: the grandfather's brass dallah (close-up indoors)

**Attach:**
1. `tools/art/portrait_refs/style_layla_neutral.jpg` and `tools/art/portrait_refs/style_layla_happy.jpg`, the painting style and lighting to match.
2. `public/assets/art/story/bg_dallah.webp`, the current simple 3D version, for layout and colours only.

**Prompt:**

> Reference 1 shows the exact painting style and warm lighting to match: semi-realistic digital painting, soft painterly brushwork, warm golden light. Reference 2 is a simple 3D mock-up of this scene: use it only for layout and colours, not its blocky toy look.
>
> Paint a tall vertical 9:16 close-up of a treasured old brass dallah (a traditional Arabic coffee pot with a tall crescent-shaped spout, a domed lid topped with a small finial and a curved handle) inside a traditional Najdi majlis in the evening. The dallah is polished, gleaming warm gold and slightly worn with age, a family heirloom that matters. It stands on a low round wooden tray, with two small handleless finjan coffee cups beside it. The tray rests on a red and black Sadu-patterned rug with cream and gold geometric stripes. Behind it, the softly blurred majlis interior: a warm earthen wall with a carved wooden niche, a floor cushion with Sadu fabric, and glowing brass lanterns giving warm round bokeh lights. Warm lantern light comes from the left, with soft reflections on the brass and a gentle glow.
>
> Composition: the dallah stands slightly left of centre at mid-height (its body between about 35% and 65% of the height) and is the clear focal point. A character may later stand in front of the centre-right, so keep the left side of the dallah clearly visible. The bottom third is the rug and tray edge, simple and not busy. Keep important details inside the central 80% of the width. Shallow depth of field: the dallah is sharp, the background softly blurred.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, warm rich colours. Not anime, not photoreal, not 3D, not flat vector. No people, hands, animals, text, letters, logos or watermarks.

---

## Batch 2: chapter locations

The story chapters still reuse the prologue's street and courtyard. These 9 backgrounds give each chapter its own place.

### Task for Codex, batch 2 (copy this whole subsection into Codex)

> You are working in the `rouissimonir/saudi-game` repository. Check out the branch `art/codex`, creating it from `main` if it does not exist.
> Generate the 9 backgrounds in the "Batch 2" section of `docs/BACKGROUND_PROMPTS.md` using your image generation tool.
>
> **References:** for every image, attach `tools/art/portrait_refs/style_layla_neutral.jpg` (style) and `public/assets/art/story/bg_courtyard.webp` (an already-painted background, for matching finish and detail level).
>
> **Output:** PNG, tall portrait, 9:16 (for example 1080x1920) or the tallest portrait size available, saved to `tools/art/background_inbox/` with the exact file names given.
>
> **Check:** look at each image before saving. Regenerate if any of these fail:
> - The style matches the references.
> - There are no people, animals, text, letters, logos or watermarks.
> - The lower third is calm and uncluttered.
> - The important details sit inside the central 80% of the width.
> - The main light comes from the left.
>
> **Finish:** commit the 9 PNGs with the message "Add painted chapter backgrounds" and push the `art/codex` branch. Do not change any other files.

### `bg_sadu.png`: Chapter 2 (Faisal): the Majlis's new Sadu coffee corner

**Attach:** `tools/art/portrait_refs/style_layla_neutral.jpg` and `public/assets/art/story/bg_courtyard.webp`.

**Prompt:**

> Reference 1 shows the exact painting style and lighting to match: semi-realistic digital painting, soft painterly brushwork, warm golden rim light from the left. Reference 2 is an already-painted background from the same game: match its finish and level of detail.
>
> Paint a tall vertical 9:16 background of the inside of a traditional Najdi majlis being turned into a cosy specialty-coffee corner in the evening. Warm earthen walls of ochre clay with small triangular niches; long floor cushions and wall hangings woven in red, black, cream and gold Najdi Sadu patterns; a low wooden counter with a gleaming brass dallah, a modern pour-over coffee stand and glass jars of coffee beans and cardamom; a carved wooden door half-open on the left letting in golden evening light. Warm, inviting, a blend of heritage and modern café.
>
> Composition: the coffee counter and Sadu wall hangings fill the upper-middle; the bottom third is a plain Sadu rug and floor. Keep important details inside the central 80% of the width, and keep the bottom third simple because characters and a dialogue box cover it. Eye-level view, gentle atmospheric depth.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, believable perspective, warm rich colours, slightly softer detail than a character portrait. Not anime, not photoreal, not 3D, not flat vector. No people, animals, text, letters, signs, logos or watermarks.

### `bg_lanterns.png`: Chapter 4 (Lama): Ramadan ghabga night under the lanterns

**Attach:** `tools/art/portrait_refs/style_layla_neutral.jpg` and `public/assets/art/story/bg_courtyard.webp`.

**Prompt:**

> Reference 1 shows the exact painting style and lighting to match: semi-realistic digital painting, soft painterly brushwork, warm golden rim light from the left. Reference 2 is an already-painted background from the same game: match its finish and level of detail.
>
> Paint a tall vertical 9:16 background of the restored Majlis courtyard on a Ramadan night, decorated for a ghabga gathering. Najdi mud-brick walls of warm ochre clay with triangular openings and stepped crenellations; strings of glowing brass and coloured-glass lanterns hung across the courtyard; a crescent moon in a deep indigo-to-violet sky on the left; low majlis seating with Sadu cushions along the walls, a table of dates, dallahs and sweets near the back. Festive, warm and magical, lit mostly by warm lantern light from the left.
>
> Composition: the lanterns, walls and moon fill the upper-middle; the bottom third is open courtyard floor softly lit by the lanterns. Keep important details inside the central 80% of the width, and keep the bottom third simple because characters and a dialogue box cover it. Eye-level view, gentle atmospheric depth.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, believable perspective, warm rich colours, slightly softer detail than a character portrait. Not anime, not photoreal, not 3D, not flat vector. No people, animals, text, letters, signs, logos or watermarks.

### `bg_jeddah.png`: Chapter 5 (Faisal): the Rawasheen of Jeddah Al-Balad

**Attach:** `tools/art/portrait_refs/style_layla_neutral.jpg` and `public/assets/art/story/bg_courtyard.webp`.

**Prompt:**

> Reference 1 shows the exact painting style and lighting to match: semi-realistic digital painting, soft painterly brushwork, warm golden rim light from the left. Reference 2 is an already-painted background from the same game: match its finish and level of detail.
>
> Paint a tall vertical 9:16 background of a lane in historic Jeddah Al-Balad at golden hour. Tall coral-stone Hijazi houses with ornate carved wooden rawasheen balconies painted in teak brown and rawasheen green, latticed mashrabiya screens, white plaster trim; a glimpse of the old souq with hanging lanterns down the lane; a soft sea-breeze sky in peach and pale turquoise; low sun from the left casting long soft shadows to the right.
>
> Composition: the rawasheen balconies fill the upper-middle; the bottom third is the quiet stone-paved lane. Keep important details inside the central 80% of the width, and keep the bottom third simple because characters and a dialogue box cover it. Eye-level view, gentle atmospheric depth.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, believable perspective, warm rich colours, slightly softer detail than a character portrait. Not anime, not photoreal, not 3D, not flat vector. No people, animals, text, letters, signs, logos or watermarks.

### `bg_alula.png`: Chapter 6 (Lama): the Stars of AlUla

**Attach:** `tools/art/portrait_refs/style_layla_neutral.jpg` and `public/assets/art/story/bg_courtyard.webp`.

**Prompt:**

> Reference 1 shows the exact painting style and lighting to match: semi-realistic digital painting, soft painterly brushwork, warm golden rim light from the left. Reference 2 is an already-painted background from the same game: match its finish and level of detail.
>
> Paint a tall vertical 9:16 background of AlUla oasis at dusk, as the first stars appear. Towering rose-red sandstone cliffs and wind-carved rock formations, a band of date palms and a mud-brick old town with small lantern lights at their foot, and a deep blue-violet sky filling with stars and the faint Milky Way, with a last warm glow of sunset on the left horizon.
>
> Composition: the cliffs, palms and starry sky fill the upper-middle; the bottom third is a smooth sandy terrace. Keep important details inside the central 80% of the width, and keep the bottom third simple because characters and a dialogue box cover it. Eye-level view, gentle atmospheric depth.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, believable perspective, warm rich colours, slightly softer detail than a character portrait. Not anime, not photoreal, not 3D, not flat vector. No people, animals, text, letters, signs, logos or watermarks.

### `bg_taif.png`: Chapter 7 (Noura): Rose Season in Taif

**Attach:** `tools/art/portrait_refs/style_layla_neutral.jpg` and `public/assets/art/story/bg_courtyard.webp`.

**Prompt:**

> Reference 1 shows the exact painting style and lighting to match: semi-realistic digital painting, soft painterly brushwork, warm golden rim light from the left. Reference 2 is an already-painted background from the same game: match its finish and level of detail.
>
> Paint a tall vertical 9:16 background of the Taif rose gardens in the mountains during rose season, in soft morning sunlight. Terraced fields of pink Taif damask roses in full bloom, a small stone farmhouse with copper rose-water stills by its door, pomegranate trees, and misty blue-green Al-Hada mountains in the background under a pale sky; gentle sun from the left.
>
> Composition: the rose terraces and mountains fill the upper-middle; the bottom third is a calm stone path through low rose bushes. Keep important details inside the central 80% of the width, and keep the bottom third simple because characters and a dialogue box cover it. Eye-level view, gentle atmospheric depth.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, believable perspective, warm rich colours, slightly softer detail than a character portrait. Not anime, not photoreal, not 3D, not flat vector. No people, animals, text, letters, signs, logos or watermarks.

### `bg_abha.png`: Chapter 8 (Tariq): Above the Clouds in Abha

**Attach:** `tools/art/portrait_refs/style_layla_neutral.jpg` and `public/assets/art/story/bg_courtyard.webp`.

**Prompt:**

> Reference 1 shows the exact painting style and lighting to match: semi-realistic digital painting, soft painterly brushwork, warm golden rim light from the left. Reference 2 is an already-painted background from the same game: match its finish and level of detail.
>
> Paint a tall vertical 9:16 background of a village in the Sarawat mountains near Abha, above the clouds. Traditional Asiri stone-and-mud tower houses with walls painted in colourful Al-Qatt geometric bands (yellow, red, green, blue) around the windows, juniper trees, and a sea of white clouds filling the valley below with green mountain peaks rising through it; soft late-afternoon sun from the left.
>
> Composition: the painted houses and cloud sea fill the upper-middle; the bottom third is a quiet stone terrace. Keep important details inside the central 80% of the width, and keep the bottom third simple because characters and a dialogue box cover it. Eye-level view, gentle atmospheric depth.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, believable perspective, warm rich colours, slightly softer detail than a character portrait. Not anime, not photoreal, not 3D, not flat vector. No people, animals, text, letters, signs, logos or watermarks.

### `bg_ahsa.png`: Chapter 9 (Noura): the Great Oasis of Al-Ahsa

**Attach:** `tools/art/portrait_refs/style_layla_neutral.jpg` and `public/assets/art/story/bg_courtyard.webp`.

**Prompt:**

> Reference 1 shows the exact painting style and lighting to match: semi-realistic digital painting, soft painterly brushwork, warm golden rim light from the left. Reference 2 is an already-painted background from the same game: match its finish and level of detail.
>
> Paint a tall vertical 9:16 background of the Al-Ahsa oasis, among the largest palm oases in the world, in warm late-afternoon light. Endless rows of tall date palms heavy with golden dates, a clear spring-fed water channel reflecting the sky, a traditional mud-brick farm house with a wooden door, and the flat-topped Al-Qarah mountain in the hazy distance; low sun from the left.
>
> Composition: the palms, water channel and distant mountain fill the upper-middle; the bottom third is a calm sandy path beside the channel. Keep important details inside the central 80% of the width, and keep the bottom third simple because characters and a dialogue box cover it. Eye-level view, gentle atmospheric depth.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, believable perspective, warm rich colours, slightly softer detail than a character portrait. Not anime, not photoreal, not 3D, not flat vector. No people, animals, text, letters, signs, logos or watermarks.

### `bg_riyadh.png`: Chapter 10 (Faisal): Riyadh Season

**Attach:** `tools/art/portrait_refs/style_layla_neutral.jpg` and `public/assets/art/story/bg_courtyard.webp`.

**Prompt:**

> Reference 1 shows the exact painting style and lighting to match: semi-realistic digital painting, soft painterly brushwork, warm golden rim light from the left. Reference 2 is an already-painted background from the same game: match its finish and level of detail.
>
> Paint a tall vertical 9:16 background of modern Riyadh at night during Riyadh Season. The glowing skyline with Kingdom Centre's arch and the Al Faisaliah tower, festival lights and gentle fireworks in a deep blue sky, and in the foreground a stylish open-air café terrace that mixes Najdi mud-brick details and Sadu cushions with warm string lights; festive and modern, warm light from the left.
>
> Composition: the skyline, fireworks and terrace details fill the upper-middle; the bottom third is the calm terrace floor. Keep important details inside the central 80% of the width, and keep the bottom third simple because characters and a dialogue box cover it. Eye-level view, gentle atmospheric depth.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, believable perspective, warm rich colours, slightly softer detail than a character portrait. Not anime, not photoreal, not 3D, not flat vector. No people, animals, text, letters, signs, logos or watermarks.

### `bg_khobar.png`: Chapter 11 (Sultan): Pearl of the Gulf in Khobar

**Attach:** `tools/art/portrait_refs/style_layla_neutral.jpg` and `public/assets/art/story/bg_courtyard.webp`.

**Prompt:**

> Reference 1 shows the exact painting style and lighting to match: semi-realistic digital painting, soft painterly brushwork, warm golden rim light from the left. Reference 2 is an already-painted background from the same game: match its finish and level of detail.
>
> Paint a tall vertical 9:16 background of the Al Khobar corniche on the Arabian Gulf at sunset. Calm turquoise-to-gold sea, a traditional wooden dhow with a furled sail near the shore, the long curve of the corniche with palm trees, and a hint of an old pearl-diving heritage pier; a glowing low sun over the sea on the left with long reflections.
>
> Composition: the sea, dhow and corniche fill the upper-middle; the bottom third is the calm paved promenade. Keep important details inside the central 80% of the width, and keep the bottom third simple because characters and a dialogue box cover it. Eye-level view, gentle atmospheric depth.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, believable perspective, warm rich colours, slightly softer detail than a character portrait. Not anime, not photoreal, not 3D, not flat vector. No people, animals, text, letters, signs, logos or watermarks.

---

## Without Codex (ChatGPT or another tool by hand)

1. Use the same prompts and attachments.
2. Download each result as PNG.
3. Upload the files to `tools/art/background_inbox/` on the `art/codex` branch with the exact names above. On GitHub: open the branch, choose Add file, then Upload files.

## After the images arrive

Claude installs them:
- Resizes and crops each to 1080x1920 at `public/assets/art/story/bg_<scene>.png`, then runs `python3 tools/art/to_webp.py`.
- The painted backgrounds are a single layer, so it removes the old 3D foreground layers (`bg_street_fg`, `bg_courtyard_fg`) and empties `FG_LAYERS` in `src/components/story/ScenePlayer.tsx`.
- Checks the prologue in the browser and opens a PR.
