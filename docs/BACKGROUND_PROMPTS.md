# Story background prompts (for Codex or any image tool)

Everything needed to repaint the three prologue backdrops so they match the painted characters. Each prompt below is
complete on its own: copy it as-is. Character prompts are in `docs/PORTRAIT_PROMPTS.md`.

---

## Task for Codex (copy this whole section into Codex)

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

## Without Codex (ChatGPT or another tool by hand)

1. Use the same prompts and attachments.
2. Download each result as PNG.
3. Upload the files to `tools/art/background_inbox/` on the `feature/painted-backgrounds` branch with the exact names above. On GitHub: open the branch, choose Add file, then Upload files.

## After the images arrive

Claude installs them:
- Resizes and crops each to 1080x1920 at `public/assets/art/story/bg_<scene>.png`, then runs `python3 tools/art/to_webp.py`.
- The painted backgrounds are a single layer, so it removes the old 3D foreground layers (`bg_street_fg`, `bg_courtyard_fg`) and empties `FG_LAYERS` in `src/components/story/ScenePlayer.tsx`.
- Checks the prologue in the browser and opens a PR.
