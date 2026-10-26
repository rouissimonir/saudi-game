# Art batch 4: the Diriyah Majlis in three restoration stages, and the app icon

Four images, each prompt complete on its own. The three Majlis stages must line up exactly, so each one is an **edit
of the previous stage**, never a new image.

---

## Task for Codex, batch 4 (copy this whole section into Codex)

> You are working in the `rouissimonir/saudi-game` repository. Check out the branch `art/codex`, creating it from `main` if it does not exist.
> Generate the 4 images in `docs/ART_BATCH_4.md` using your image generation tool.
>
> **Order:**
> 1. Generate `majlis_diriyah_1.png` first.
> 2. Make `majlis_diriyah_2.png` as an edit of stage 1.
> 3. Make `majlis_diriyah_3.png` as an edit of stage 2.
>
> The camera, building positions and composition must stay identical across the three. Only the state of repair changes.
>
> **References:** attach the files named in each section. They are in the repository.
>
> **Output:** PNG, saved to `tools/art/background_inbox/` with the exact file names and sizes given.
>
> **Check:** look at each image before saving. Regenerate if any of these fail:
> - It matches the painted style of the references.
> - The three stages line up: same camera, same buildings in the same places.
> - There are no people, text, letters, logos or watermarks.
>
> **Finish:** commit the 4 PNGs with the message "Add art batch 4" and push the `art/codex` branch. Do not change any other files.

---

## Shared direction for the three Majlis stages

- **Use:** the restoration view of the game, a wide banner above the four wing cards. It crossfades from stage 1 to 2 to 3 as the player restores wings.
- **Size:** landscape 16:9 (for example 1536x864).
- **View:** a gentle three-quarter elevated view, like a diorama, of grandfather's Majlis compound in At-Turaif, Diriyah, at golden hour, with the low sun on the left.
- **The four wings to show, left to right:**
  1. A Najdi mud-brick **archway gatehouse** with stepped triangular crenellations.
  2. A **Sadu coffee room**, with an open side and woven Sadu hangings visible inside.
  3. A small **coffee bar** under a wooden-beam shade, with a brass dallah on the counter.
  4. An open **courtyard** with a round stone fountain in the centre.
- **Surroundings:** date palms behind, and a soft peach-and-gold sky.
- **Style:** semi-realistic digital painting matching the references, soft painterly brushwork, warm and rich, slightly stylised like premium mobile-game art. Not photoreal, not 3D. No people, text or watermarks.

## 1. `majlis_diriyah_1.png`: stage 1, the ruin

**Attach:**
1. `public/assets/art/story/bg_courtyard.webp`: the crumbling courtyard from the story, for the style and the state of decay.
2. `tools/art/portrait_refs/style_layla_neutral.jpg`: the game's painting style.

**Prompt:**

> Reference 1 is a painted background from the same game showing this Majlis courtyard crumbling; match its painting style and level of decay. Reference 2 shows the game's semi-realistic painted style.
>
> Paint a wide 16:9 diorama view, from a gentle three-quarter elevated angle at golden hour with the low sun on the left, of grandfather's old Majlis compound in At-Turaif, Diriyah, abandoned and crumbling. From left to right: a Najdi mud-brick archway gatehouse with broken stepped crenellations and long cracks; a Sadu coffee room with its roof beams sagging and the woven hangings torn and faded; a small coffee bar under a collapsed wooden-beam shade, its counter empty and dusty; and an open courtyard with a dry, cracked round stone fountain, rubble and dry palm fronds on the ground. Date palms stand behind under a soft peach-and-gold sky. Sad but beautiful, clearly worth saving.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, warm colours, premium mobile-game art. Not photoreal, not 3D. No people, text, letters, logos or watermarks.

## 2. `majlis_diriyah_2.png`: stage 2, half restored

**Attach:** your `majlis_diriyah_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image. Change only the state of repair: the archway gatehouse on the left and the Sadu coffee room next to it are now fully restored, with fresh smooth clay plaster, crisp white stepped crenellations, a newly carved and painted wooden door, and bright new red, black and gold Sadu hangings with warm lantern light glowing inside. The coffee bar and the courtyard fountain on the right stay exactly as they are, still broken and dusty, with a few new mud bricks and a wooden ladder stacked beside them as if work is about to start.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, the palms, the sky and golden-hour light, and the painted style. Do not change the aspect ratio. Match the original seamlessly.

## 3. `majlis_diriyah_3.png`: stage 3, fully restored

**Attach:** your `majlis_diriyah_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image. Change only the state of repair: now everything is fully restored and welcoming. The coffee bar has a new wooden-beam shade, a polished counter with a gleaming brass dallah, finjan cups and jars of coffee beans. The courtyard is swept clean and freshly paved, the round stone fountain is flowing again with sparkling water, potted plants line the walls, and strings of brass lanterns glow across the courtyard. The archway and the Sadu room stay as restored as before. Remove the ladder and stacked bricks.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, the palms, the sky and golden-hour light, and the painted style. Do not change the aspect ratio. Match the original seamlessly.

## 4. `app_icon.png`: the app icon

**Save size:** square 1024x1024.

**Attach:**
1. `public/assets/art/story/bg_dallah.webp`: grandfather's brass dallah from the story.
2. `tools/art/portrait_refs/style_layla_neutral.jpg`: the game's painting style.

**Prompt:**

> Reference 1 shows grandfather's polished brass dallah from the same game; match its shape (tall crescent spout, domed lid with a small finial, curved handle) and warm gold finish. Reference 2 shows the game's painted style.
>
> Paint a square 1:1 mobile app icon: grandfather's gleaming brass dallah, large and centred, filling about 70% of the icon, with a soft curl of steam rising from its spout. Behind it, a rich warm background: a deep coffee-brown to burnt-orange radial glow with a subtle eight-point Najdi star pattern in faint gold. A thin gold rim light outlines the dallah so it stands out. Bold, simple and readable even at a tiny size, like a polished mobile-game app icon. Keep all important detail inside the central 80% (the corners will be rounded off).
>
> Style: semi-realistic painted, glossy, premium. No text, letters, logos, borders or watermarks.
