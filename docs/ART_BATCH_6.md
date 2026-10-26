# Art batch 6: night and rain versions of every restoration stage

The Majlis view has three ambiance chips: **Golden Afternoon**, **Lantern Night** and **Courtyard Rain**. The painted banners from batches 4 and 5 are all golden hour, so the other two chips currently change nothing once an area has painted stages. This batch paints the missing two moods so the chips work everywhere.

**48 images:** 8 areas × 3 restoration stages × 2 moods. Every image is an **edit of the finished golden-hour stage picture** that already exists in the repository, never a new painting. That is what keeps the camera, buildings and plants identical, so the game can swap mood and stage freely without anything jumping.

Do **Part A (night)** first for all areas, then **Part B (rain)**. Areas can land one at a time.

---

## Task for Codex, batch 6 (copy this whole section into Codex)

> You are working in the `rouissimonir/saudi-game` repository. Check out the branch `art/codex`, creating it from `main` if it does not exist. Make sure it contains `tools/art/background_inbox/majlis/` (the golden-hour stage images) before you start; if not, merge `main` into it.
> Generate the 48 images in `docs/ART_BATCH_6.md` using your image generation tool, area by area, night first and then rain.
>
> **How:** for each image, attach the single golden-hour stage image named in its section and **edit that image**. Do not paint a new picture and do not chain from another night or rain image: always edit the golden-hour original, so every mood lines up with it exactly.
>
> **Output:** PNG, exactly the same size and 16:9 shape as the image you edit, saved to `tools/art/background_inbox/majlis/` with the exact file names given.
>
> **Check:** look at each image next to its source before saving. Regenerate if any of these fail:
> - Buildings, plants, boats and rocks sit exactly where they do in the source (flip between the two or overlay them).
> - The state of repair matches the source. Night and rain must never repair or damage anything.
> - The mood is clearly the one asked for, with the lighting rules of that stage.
> - There are no people, text, letters, logos or watermarks.
>
> **Finish:** commit the PNGs with the message "Add art batch 6" and push the `art/codex` branch. You may commit area by area. Do not change any other files.

---

## Shared direction

- **Style:** semi-realistic digital painting, soft painterly brushwork, warm and rich, slightly stylised like premium mobile-game art. Not photoreal, not 3D. The same painting style as the source image.
- **Light tells the story of the restoration.** Restored wings are the warm, lit, dry ones. Run-down wings are dark or soaked. A viewer should be able to tell how far along the restoration is from the light alone.
- **Night palette:** deep blue-violet sky, moon and stars, warm amber lantern light against cool shadows. **Rain palette:** soft grey-violet clouds, wet shining surfaces, warm lantern light reflected in puddles.
- **Never change** what is built, grown or placed. Only light, sky, weather and the effects of wet or glow.

File names: `<area>_<stage>_night.png` and `<area>_<stage>_rain.png`, for example `jeddah_2_night.png`.

---

# Part A: Night

## Historic Diriyah (`diriyah`), night

**The place:** Najdi mud-brick compound in At-Turaif: archway gatehouse, Sadu coffee room, coffee bar, courtyard fountain.

**Night look for this area:** a clear star-filled desert night above the palms; the brass lanterns and the fountain are the warm light sources; mud-brick walls glow amber where lamplight touches them.

### `diriyah_1_night.png`: stage 1, run down, night

**Attach and edit:** `tools/art/background_inbox/majlis_diriyah_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Historic Diriyah, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now deep night. The scene stays run down: every wing must stay exactly as damaged as in the image, and nothing may be repaired. Only one or two faint, flickering old lamps are still alight, so the place feels forgotten but not lifeless. Light is cold and moonlit (blue-violet), with deep soft shadows, so the ruin reads as sad and still worth saving. The night look: a clear star-filled desert night above the palms; the brass lanterns and the fountain are the warm light sources; mud-brick walls glow amber where lamplight touches them.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `diriyah_2_night.png`: stage 2, half restored, night

**Attach and edit:** `tools/art/background_inbox/majlis_diriyah_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Historic Diriyah, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now night. Keep the state of repair exactly as in the image: the restored wings stay restored and the run-down wings stay run down. The restored wings glow warm, with lantern and window light spilling out onto the ground in front of them. The run-down wings stay dark, lit only by the moon, with at most a work lamp hanging by any ladder or building materials. The night look: a clear star-filled desert night above the palms; the brass lanterns and the fountain are the warm light sources; mud-brick walls glow amber where lamplight touches them.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `diriyah_3_night.png`: stage 3, fully restored, night

**Attach and edit:** `tools/art/background_inbox/majlis_diriyah_3.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Historic Diriyah, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now night. Keep the state of repair exactly as in the image: everything is restored. Every wing glows warmly and festively, with strings of lanterns, lit windows and soft pools of golden light on the ground, a welcoming place full of life that is simply waiting for its guests. The night look: a clear star-filled desert night above the palms; the brass lanterns and the fountain are the warm light sources; mud-brick walls glow amber where lamplight touches them.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

## Jeddah Al-Balad (`jeddah`), night

**The place:** coral-stone Hijazi houses with carved rawasheen balconies, souq lane, Red Sea behind.

**Night look for this area:** a calm moonlit Red Sea behind the rooftops with small harbour lights twinkling on the water; lantern light glows through the carved rawasheen lattices and mashrabiya screens.

### `jeddah_1_night.png`: stage 1, run down, night

**Attach and edit:** `tools/art/background_inbox/majlis/jeddah_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Jeddah Al-Balad, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now deep night. The scene stays run down: every wing must stay exactly as damaged as in the image, and nothing may be repaired. Only one or two faint, flickering old lamps are still alight, so the place feels forgotten but not lifeless. Light is cold and moonlit (blue-violet), with deep soft shadows, so the ruin reads as sad and still worth saving. The night look: a calm moonlit Red Sea behind the rooftops with small harbour lights twinkling on the water; lantern light glows through the carved rawasheen lattices and mashrabiya screens.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `jeddah_2_night.png`: stage 2, half restored, night

**Attach and edit:** `tools/art/background_inbox/majlis/jeddah_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Jeddah Al-Balad, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now night. Keep the state of repair exactly as in the image: the restored wings stay restored and the run-down wings stay run down. The restored wings glow warm, with lantern and window light spilling out onto the ground in front of them. The run-down wings stay dark, lit only by the moon, with at most a work lamp hanging by any ladder or building materials. The night look: a calm moonlit Red Sea behind the rooftops with small harbour lights twinkling on the water; lantern light glows through the carved rawasheen lattices and mashrabiya screens.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `jeddah_3_night.png`: stage 3, fully restored, night

**Attach and edit:** `tools/art/background_inbox/majlis/jeddah_3.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Jeddah Al-Balad, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now night. Keep the state of repair exactly as in the image: everything is restored. Every wing glows warmly and festively, with strings of lanterns, lit windows and soft pools of golden light on the ground, a welcoming place full of life that is simply waiting for its guests. The night look: a calm moonlit Red Sea behind the rooftops with small harbour lights twinkling on the water; lantern light glows through the carved rawasheen lattices and mashrabiya screens.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

## AlUla (`alula`), night

**The place:** sandstone cliffs, palm oasis with streams, mud-brick old town on the right.

**Night look for this area:** a deep night with the Milky Way over the sandstone cliffs, the cliffs lit by cool moonlight, the oasis streams catching the lantern glow.

### `alula_1_night.png`: stage 1, run down, night

**Attach and edit:** `tools/art/background_inbox/majlis/alula_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of AlUla, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now deep night. The scene stays run down: every wing must stay exactly as damaged as in the image, and nothing may be repaired. Only one or two faint, flickering old lamps are still alight, so the place feels forgotten but not lifeless. Light is cold and moonlit (blue-violet), with deep soft shadows, so the ruin reads as sad and still worth saving. The night look: a deep night with the Milky Way over the sandstone cliffs, the cliffs lit by cool moonlight, the oasis streams catching the lantern glow.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `alula_2_night.png`: stage 2, half restored, night

**Attach and edit:** `tools/art/background_inbox/majlis/alula_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of AlUla, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now night. Keep the state of repair exactly as in the image: the restored wings stay restored and the run-down wings stay run down. The restored wings glow warm, with lantern and window light spilling out onto the ground in front of them. The run-down wings stay dark, lit only by the moon, with at most a work lamp hanging by any ladder or building materials. The night look: a deep night with the Milky Way over the sandstone cliffs, the cliffs lit by cool moonlight, the oasis streams catching the lantern glow.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `alula_3_night.png`: stage 3, fully restored, night

**Attach and edit:** `tools/art/background_inbox/majlis/alula_3.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of AlUla, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now night. Keep the state of repair exactly as in the image: everything is restored. Every wing glows warmly and festively, with strings of lanterns, lit windows and soft pools of golden light on the ground, a welcoming place full of life that is simply waiting for its guests. The night look: a deep night with the Milky Way over the sandstone cliffs, the cliffs lit by cool moonlight, the oasis streams catching the lantern glow.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

## Taif (`taif`), night

**The place:** terraced rose and pomegranate gardens, stone steps, mountain mist behind.

**Night look for this area:** a clear cool mountain night, a full moon above silver mist rolling through the valley, lantern light warm among the rose terraces.

### `taif_1_night.png`: stage 1, run down, night

**Attach and edit:** `tools/art/background_inbox/majlis/taif_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Taif, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now deep night. The scene stays run down: every wing must stay exactly as damaged as in the image, and nothing may be repaired. Only one or two faint, flickering old lamps are still alight, so the place feels forgotten but not lifeless. Light is cold and moonlit (blue-violet), with deep soft shadows, so the ruin reads as sad and still worth saving. The night look: a clear cool mountain night, a full moon above silver mist rolling through the valley, lantern light warm among the rose terraces.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `taif_2_night.png`: stage 2, half restored, night

**Attach and edit:** `tools/art/background_inbox/majlis/taif_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Taif, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now night. Keep the state of repair exactly as in the image: the restored wings stay restored and the run-down wings stay run down. The restored wings glow warm, with lantern and window light spilling out onto the ground in front of them. The run-down wings stay dark, lit only by the moon, with at most a work lamp hanging by any ladder or building materials. The night look: a clear cool mountain night, a full moon above silver mist rolling through the valley, lantern light warm among the rose terraces.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `taif_3_night.png`: stage 3, fully restored, night

**Attach and edit:** `tools/art/background_inbox/majlis/taif_3.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Taif, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now night. Keep the state of repair exactly as in the image: everything is restored. Every wing glows warmly and festively, with strings of lanterns, lit windows and soft pools of golden light on the ground, a welcoming place full of life that is simply waiting for its guests. The night look: a clear cool mountain night, a full moon above silver mist rolling through the valley, lantern light warm among the rose terraces.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

## Abha (`abha`), night

**The place:** Asiri painted houses with bright geometric bands, terraced hillside, sea of clouds.

**Night look for this area:** a moonlit sea of clouds far below, bright stars, the painted geometric walls still readable in cool moonlight, lamps glowing warm in the windows.

### `abha_1_night.png`: stage 1, run down, night

**Attach and edit:** `tools/art/background_inbox/majlis/abha_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Abha, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now deep night. The scene stays run down: every wing must stay exactly as damaged as in the image, and nothing may be repaired. Only one or two faint, flickering old lamps are still alight, so the place feels forgotten but not lifeless. Light is cold and moonlit (blue-violet), with deep soft shadows, so the ruin reads as sad and still worth saving. The night look: a moonlit sea of clouds far below, bright stars, the painted geometric walls still readable in cool moonlight, lamps glowing warm in the windows.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `abha_2_night.png`: stage 2, half restored, night

**Attach and edit:** `tools/art/background_inbox/majlis/abha_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Abha, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now night. Keep the state of repair exactly as in the image: the restored wings stay restored and the run-down wings stay run down. The restored wings glow warm, with lantern and window light spilling out onto the ground in front of them. The run-down wings stay dark, lit only by the moon, with at most a work lamp hanging by any ladder or building materials. The night look: a moonlit sea of clouds far below, bright stars, the painted geometric walls still readable in cool moonlight, lamps glowing warm in the windows.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `abha_3_night.png`: stage 3, fully restored, night

**Attach and edit:** `tools/art/background_inbox/majlis/abha_3.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Abha, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now night. Keep the state of repair exactly as in the image: everything is restored. Every wing glows warmly and festively, with strings of lanterns, lit windows and soft pools of golden light on the ground, a welcoming place full of life that is simply waiting for its guests. The night look: a moonlit sea of clouds far below, bright stars, the painted geometric walls still readable in cool moonlight, lamps glowing warm in the windows.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

## Al-Ahsa (`ahsa`), night

**The place:** palm oasis, spring-fed pools and channels, mud-brick pavilions, cave-like rock on the right.

**Night look for this area:** a warm moonlit palm grove, the spring-fed pools reflecting the moon and the lantern glow like dark mirrors, fireflies low over the water.

### `ahsa_1_night.png`: stage 1, run down, night

**Attach and edit:** `tools/art/background_inbox/majlis/ahsa_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Al-Ahsa, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now deep night. The scene stays run down: every wing must stay exactly as damaged as in the image, and nothing may be repaired. Only one or two faint, flickering old lamps are still alight, so the place feels forgotten but not lifeless. Light is cold and moonlit (blue-violet), with deep soft shadows, so the ruin reads as sad and still worth saving. The night look: a warm moonlit palm grove, the spring-fed pools reflecting the moon and the lantern glow like dark mirrors, fireflies low over the water.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `ahsa_2_night.png`: stage 2, half restored, night

**Attach and edit:** `tools/art/background_inbox/majlis/ahsa_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Al-Ahsa, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now night. Keep the state of repair exactly as in the image: the restored wings stay restored and the run-down wings stay run down. The restored wings glow warm, with lantern and window light spilling out onto the ground in front of them. The run-down wings stay dark, lit only by the moon, with at most a work lamp hanging by any ladder or building materials. The night look: a warm moonlit palm grove, the spring-fed pools reflecting the moon and the lantern glow like dark mirrors, fireflies low over the water.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `ahsa_3_night.png`: stage 3, fully restored, night

**Attach and edit:** `tools/art/background_inbox/majlis/ahsa_3.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Al-Ahsa, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now night. Keep the state of repair exactly as in the image: everything is restored. Every wing glows warmly and festively, with strings of lanterns, lit windows and soft pools of golden light on the ground, a welcoming place full of life that is simply waiting for its guests. The night look: a warm moonlit palm grove, the spring-fed pools reflecting the moon and the lantern glow like dark mirrors, fireflies low over the water.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

## Riyadh (`riyadh`), night

**The place:** courtyard majlis with the Kingdom Tower skyline behind and fireworks.

**Night look for this area:** full night in the capital, the Kingdom Tower and the skyline brightly lit against a deep blue-violet sky, fireworks bursting, string lights glowing across the courtyard.

### `riyadh_1_night.png`: stage 1, run down, night

**Attach and edit:** `tools/art/background_inbox/majlis/riyadh_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Riyadh, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now deep night. The scene stays run down: every wing must stay exactly as damaged as in the image, and nothing may be repaired. Only one or two faint, flickering old lamps are still alight, so the place feels forgotten but not lifeless. Light is cold and moonlit (blue-violet), with deep soft shadows, so the ruin reads as sad and still worth saving. The night look: full night in the capital, the Kingdom Tower and the skyline brightly lit against a deep blue-violet sky, fireworks bursting, string lights glowing across the courtyard.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `riyadh_2_night.png`: stage 2, half restored, night

**Attach and edit:** `tools/art/background_inbox/majlis/riyadh_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Riyadh, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now night. Keep the state of repair exactly as in the image: the restored wings stay restored and the run-down wings stay run down. The restored wings glow warm, with lantern and window light spilling out onto the ground in front of them. The run-down wings stay dark, lit only by the moon, with at most a work lamp hanging by any ladder or building materials. The night look: full night in the capital, the Kingdom Tower and the skyline brightly lit against a deep blue-violet sky, fireworks bursting, string lights glowing across the courtyard.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `riyadh_3_night.png`: stage 3, fully restored, night

**Attach and edit:** `tools/art/background_inbox/majlis/riyadh_3.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Riyadh, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now night. Keep the state of repair exactly as in the image: everything is restored. Every wing glows warmly and festively, with strings of lanterns, lit windows and soft pools of golden light on the ground, a welcoming place full of life that is simply waiting for its guests. The night look: full night in the capital, the Kingdom Tower and the skyline brightly lit against a deep blue-violet sky, fireworks bursting, string lights glowing across the courtyard.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

## Al-Khobar (`khobar`), night

**The place:** harbour with a wooden dhow, lighthouse, palm waterfront.

**Night look for this area:** a calm moonlit Gulf, the lighthouse lamp lit with a soft beam over the water, lanterns glowing on the dhow and the waterfront, moonlight rippling on the sea.

### `khobar_1_night.png`: stage 1, run down, night

**Attach and edit:** `tools/art/background_inbox/majlis/khobar_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Al-Khobar, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now deep night. The scene stays run down: every wing must stay exactly as damaged as in the image, and nothing may be repaired. Only one or two faint, flickering old lamps are still alight, so the place feels forgotten but not lifeless. Light is cold and moonlit (blue-violet), with deep soft shadows, so the ruin reads as sad and still worth saving. The night look: a calm moonlit Gulf, the lighthouse lamp lit with a soft beam over the water, lanterns glowing on the dhow and the waterfront, moonlight rippling on the sea.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `khobar_2_night.png`: stage 2, half restored, night

**Attach and edit:** `tools/art/background_inbox/majlis/khobar_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Al-Khobar, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now night. Keep the state of repair exactly as in the image: the restored wings stay restored and the run-down wings stay run down. The restored wings glow warm, with lantern and window light spilling out onto the ground in front of them. The run-down wings stay dark, lit only by the moon, with at most a work lamp hanging by any ladder or building materials. The night look: a calm moonlit Gulf, the lighthouse lamp lit with a soft beam over the water, lanterns glowing on the dhow and the waterfront, moonlight rippling on the sea.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `khobar_3_night.png`: stage 3, fully restored, night

**Attach and edit:** `tools/art/background_inbox/majlis/khobar_3.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Al-Khobar, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now night. Keep the state of repair exactly as in the image: everything is restored. Every wing glows warmly and festively, with strings of lanterns, lit windows and soft pools of golden light on the ground, a welcoming place full of life that is simply waiting for its guests. The night look: a calm moonlit Gulf, the lighthouse lamp lit with a soft beam over the water, lanterns glowing on the dhow and the waterfront, moonlight rippling on the sea.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

# Part B: Rain

## Historic Diriyah (`diriyah`), rain

**The place:** Najdi mud-brick compound in At-Turaif: archway gatehouse, Sadu coffee room, coffee bar, courtyard fountain.

**Rain look for this area:** rain on sun-baked mud brick, walls darken to a rich brown, water runs off the palm-trunk roof spouts, the courtyard floor shines with puddles, palms sway.

### `diriyah_1_rain.png`: stage 1, run down, rain

**Attach and edit:** `tools/art/background_inbox/majlis_diriyah_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Historic Diriyah, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. The scene stays run down: every wing must stay exactly as damaged as in the image, and nothing may be repaired. Heavy grey-violet rain clouds replace the golden sky, rain falls in visible streaks, surfaces are wet and dark, puddles gather, and water drips through broken roofs and gaps. The mood is sad and moody, but the setting is still beautiful. The rain look: rain on sun-baked mud brick, walls darken to a rich brown, water runs off the palm-trunk roof spouts, the courtyard floor shines with puddles, palms sway.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `diriyah_2_rain.png`: stage 2, half restored, rain

**Attach and edit:** `tools/art/background_inbox/majlis_diriyah_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Historic Diriyah, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. Keep the state of repair exactly as in the image: the restored wings stay restored and the run-down wings stay run down. The restored wings are dry under their roofs and glow warm, with lantern light reflected in nearby puddles. The run-down wings are soaked, dark and dripping, with a tarp or a few planks only partly covering them. The rain look: rain on sun-baked mud brick, walls darken to a rich brown, water runs off the palm-trunk roof spouts, the courtyard floor shines with puddles, palms sway.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `diriyah_3_rain.png`: stage 3, fully restored, rain

**Attach and edit:** `tools/art/background_inbox/majlis_diriyah_3.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Historic Diriyah, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. Keep the state of repair exactly as in the image: everything is restored. Rain falls softly outside while every roof and awning keeps the wings dry and glowing with warm lantern light, which reflects in the puddles. It feels like a cosy shelter in the rain, a place guests will be glad to step into out of the rain. The rain look: rain on sun-baked mud brick, walls darken to a rich brown, water runs off the palm-trunk roof spouts, the courtyard floor shines with puddles, palms sway.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

## Jeddah Al-Balad (`jeddah`), rain

**The place:** coral-stone Hijazi houses with carved rawasheen balconies, souq lane, Red Sea behind.

**Rain look for this area:** warm Red Sea rain, coral-stone lanes slick and dark, rain streaming off the rawasheen balconies, the sea grey-pink under heavy clouds.

### `jeddah_1_rain.png`: stage 1, run down, rain

**Attach and edit:** `tools/art/background_inbox/majlis/jeddah_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Jeddah Al-Balad, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. The scene stays run down: every wing must stay exactly as damaged as in the image, and nothing may be repaired. Heavy grey-violet rain clouds replace the golden sky, rain falls in visible streaks, surfaces are wet and dark, puddles gather, and water drips through broken roofs and gaps. The mood is sad and moody, but the setting is still beautiful. The rain look: warm Red Sea rain, coral-stone lanes slick and dark, rain streaming off the rawasheen balconies, the sea grey-pink under heavy clouds.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `jeddah_2_rain.png`: stage 2, half restored, rain

**Attach and edit:** `tools/art/background_inbox/majlis/jeddah_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Jeddah Al-Balad, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. Keep the state of repair exactly as in the image: the restored wings stay restored and the run-down wings stay run down. The restored wings are dry under their roofs and glow warm, with lantern light reflected in nearby puddles. The run-down wings are soaked, dark and dripping, with a tarp or a few planks only partly covering them. The rain look: warm Red Sea rain, coral-stone lanes slick and dark, rain streaming off the rawasheen balconies, the sea grey-pink under heavy clouds.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `jeddah_3_rain.png`: stage 3, fully restored, rain

**Attach and edit:** `tools/art/background_inbox/majlis/jeddah_3.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Jeddah Al-Balad, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. Keep the state of repair exactly as in the image: everything is restored. Rain falls softly outside while every roof and awning keeps the wings dry and glowing with warm lantern light, which reflects in the puddles. It feels like a cosy shelter in the rain, a place guests will be glad to step into out of the rain. The rain look: warm Red Sea rain, coral-stone lanes slick and dark, rain streaming off the rawasheen balconies, the sea grey-pink under heavy clouds.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

## AlUla (`alula`), rain

**The place:** sandstone cliffs, palm oasis with streams, mud-brick old town on the right.

**Rain look for this area:** a rare desert downpour, dramatic storm clouds over the red cliffs, rock faces darkened and glistening, thin waterfalls trickling down the stone, the oasis streams swollen.

### `alula_1_rain.png`: stage 1, run down, rain

**Attach and edit:** `tools/art/background_inbox/majlis/alula_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of AlUla, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. The scene stays run down: every wing must stay exactly as damaged as in the image, and nothing may be repaired. Heavy grey-violet rain clouds replace the golden sky, rain falls in visible streaks, surfaces are wet and dark, puddles gather, and water drips through broken roofs and gaps. The mood is sad and moody, but the setting is still beautiful. The rain look: a rare desert downpour, dramatic storm clouds over the red cliffs, rock faces darkened and glistening, thin waterfalls trickling down the stone, the oasis streams swollen.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `alula_2_rain.png`: stage 2, half restored, rain

**Attach and edit:** `tools/art/background_inbox/majlis/alula_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of AlUla, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. Keep the state of repair exactly as in the image: the restored wings stay restored and the run-down wings stay run down. The restored wings are dry under their roofs and glow warm, with lantern light reflected in nearby puddles. The run-down wings are soaked, dark and dripping, with a tarp or a few planks only partly covering them. The rain look: a rare desert downpour, dramatic storm clouds over the red cliffs, rock faces darkened and glistening, thin waterfalls trickling down the stone, the oasis streams swollen.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `alula_3_rain.png`: stage 3, fully restored, rain

**Attach and edit:** `tools/art/background_inbox/majlis/alula_3.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of AlUla, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. Keep the state of repair exactly as in the image: everything is restored. Rain falls softly outside while every roof and awning keeps the wings dry and glowing with warm lantern light, which reflects in the puddles. It feels like a cosy shelter in the rain, a place guests will be glad to step into out of the rain. The rain look: a rare desert downpour, dramatic storm clouds over the red cliffs, rock faces darkened and glistening, thin waterfalls trickling down the stone, the oasis streams swollen.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

## Taif (`taif`), rain

**The place:** terraced rose and pomegranate gardens, stone steps, mountain mist behind.

**Rain look for this area:** a soft mountain drizzle, low cloud swallows the peaks, rain beads on the rose petals and pomegranates, stone steps wet and shining.

### `taif_1_rain.png`: stage 1, run down, rain

**Attach and edit:** `tools/art/background_inbox/majlis/taif_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Taif, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. The scene stays run down: every wing must stay exactly as damaged as in the image, and nothing may be repaired. Heavy grey-violet rain clouds replace the golden sky, rain falls in visible streaks, surfaces are wet and dark, puddles gather, and water drips through broken roofs and gaps. The mood is sad and moody, but the setting is still beautiful. The rain look: a soft mountain drizzle, low cloud swallows the peaks, rain beads on the rose petals and pomegranates, stone steps wet and shining.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `taif_2_rain.png`: stage 2, half restored, rain

**Attach and edit:** `tools/art/background_inbox/majlis/taif_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Taif, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. Keep the state of repair exactly as in the image: the restored wings stay restored and the run-down wings stay run down. The restored wings are dry under their roofs and glow warm, with lantern light reflected in nearby puddles. The run-down wings are soaked, dark and dripping, with a tarp or a few planks only partly covering them. The rain look: a soft mountain drizzle, low cloud swallows the peaks, rain beads on the rose petals and pomegranates, stone steps wet and shining.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `taif_3_rain.png`: stage 3, fully restored, rain

**Attach and edit:** `tools/art/background_inbox/majlis/taif_3.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Taif, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. Keep the state of repair exactly as in the image: everything is restored. Rain falls softly outside while every roof and awning keeps the wings dry and glowing with warm lantern light, which reflects in the puddles. It feels like a cosy shelter in the rain, a place guests will be glad to step into out of the rain. The rain look: a soft mountain drizzle, low cloud swallows the peaks, rain beads on the rose petals and pomegranates, stone steps wet and shining.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

## Abha (`abha`), rain

**The place:** Asiri painted houses with bright geometric bands, terraced hillside, sea of clouds.

**Rain look for this area:** Abha mist and rain, thick fog drifts between the terraces, rain falls through it, the painted geometric bands look even more vivid on wet walls.

### `abha_1_rain.png`: stage 1, run down, rain

**Attach and edit:** `tools/art/background_inbox/majlis/abha_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Abha, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. The scene stays run down: every wing must stay exactly as damaged as in the image, and nothing may be repaired. Heavy grey-violet rain clouds replace the golden sky, rain falls in visible streaks, surfaces are wet and dark, puddles gather, and water drips through broken roofs and gaps. The mood is sad and moody, but the setting is still beautiful. The rain look: Abha mist and rain, thick fog drifts between the terraces, rain falls through it, the painted geometric bands look even more vivid on wet walls.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `abha_2_rain.png`: stage 2, half restored, rain

**Attach and edit:** `tools/art/background_inbox/majlis/abha_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Abha, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. Keep the state of repair exactly as in the image: the restored wings stay restored and the run-down wings stay run down. The restored wings are dry under their roofs and glow warm, with lantern light reflected in nearby puddles. The run-down wings are soaked, dark and dripping, with a tarp or a few planks only partly covering them. The rain look: Abha mist and rain, thick fog drifts between the terraces, rain falls through it, the painted geometric bands look even more vivid on wet walls.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `abha_3_rain.png`: stage 3, fully restored, rain

**Attach and edit:** `tools/art/background_inbox/majlis/abha_3.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Abha, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. Keep the state of repair exactly as in the image: everything is restored. Rain falls softly outside while every roof and awning keeps the wings dry and glowing with warm lantern light, which reflects in the puddles. It feels like a cosy shelter in the rain, a place guests will be glad to step into out of the rain. The rain look: Abha mist and rain, thick fog drifts between the terraces, rain falls through it, the painted geometric bands look even more vivid on wet walls.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

## Al-Ahsa (`ahsa`), rain

**The place:** palm oasis, spring-fed pools and channels, mud-brick pavilions, cave-like rock on the right.

**Rain look for this area:** warm rain on the palm grove, the pools dimpled with raindrop ripples, palm fronds dripping, the pale pavilions glistening, a warm grey-gold sky.

### `ahsa_1_rain.png`: stage 1, run down, rain

**Attach and edit:** `tools/art/background_inbox/majlis/ahsa_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Al-Ahsa, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. The scene stays run down: every wing must stay exactly as damaged as in the image, and nothing may be repaired. Heavy grey-violet rain clouds replace the golden sky, rain falls in visible streaks, surfaces are wet and dark, puddles gather, and water drips through broken roofs and gaps. The mood is sad and moody, but the setting is still beautiful. The rain look: warm rain on the palm grove, the pools dimpled with raindrop ripples, palm fronds dripping, the pale pavilions glistening, a warm grey-gold sky.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `ahsa_2_rain.png`: stage 2, half restored, rain

**Attach and edit:** `tools/art/background_inbox/majlis/ahsa_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Al-Ahsa, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. Keep the state of repair exactly as in the image: the restored wings stay restored and the run-down wings stay run down. The restored wings are dry under their roofs and glow warm, with lantern light reflected in nearby puddles. The run-down wings are soaked, dark and dripping, with a tarp or a few planks only partly covering them. The rain look: warm rain on the palm grove, the pools dimpled with raindrop ripples, palm fronds dripping, the pale pavilions glistening, a warm grey-gold sky.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `ahsa_3_rain.png`: stage 3, fully restored, rain

**Attach and edit:** `tools/art/background_inbox/majlis/ahsa_3.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Al-Ahsa, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. Keep the state of repair exactly as in the image: everything is restored. Rain falls softly outside while every roof and awning keeps the wings dry and glowing with warm lantern light, which reflects in the puddles. It feels like a cosy shelter in the rain, a place guests will be glad to step into out of the rain. The rain look: warm rain on the palm grove, the pools dimpled with raindrop ripples, palm fronds dripping, the pale pavilions glistening, a warm grey-gold sky.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

## Riyadh (`riyadh`), rain

**The place:** courtyard majlis with the Kingdom Tower skyline behind and fireworks.

**Rain look for this area:** rain over the capital, the skyline softened by rain and low cloud with its lights glowing through, wet paving reflecting the lanterns and string lights, the fireworks reduced to a faint glow in the cloud.

### `riyadh_1_rain.png`: stage 1, run down, rain

**Attach and edit:** `tools/art/background_inbox/majlis/riyadh_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Riyadh, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. The scene stays run down: every wing must stay exactly as damaged as in the image, and nothing may be repaired. Heavy grey-violet rain clouds replace the golden sky, rain falls in visible streaks, surfaces are wet and dark, puddles gather, and water drips through broken roofs and gaps. The mood is sad and moody, but the setting is still beautiful. The rain look: rain over the capital, the skyline softened by rain and low cloud with its lights glowing through, wet paving reflecting the lanterns and string lights, the fireworks reduced to a faint glow in the cloud.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `riyadh_2_rain.png`: stage 2, half restored, rain

**Attach and edit:** `tools/art/background_inbox/majlis/riyadh_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Riyadh, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. Keep the state of repair exactly as in the image: the restored wings stay restored and the run-down wings stay run down. The restored wings are dry under their roofs and glow warm, with lantern light reflected in nearby puddles. The run-down wings are soaked, dark and dripping, with a tarp or a few planks only partly covering them. The rain look: rain over the capital, the skyline softened by rain and low cloud with its lights glowing through, wet paving reflecting the lanterns and string lights, the fireworks reduced to a faint glow in the cloud.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `riyadh_3_rain.png`: stage 3, fully restored, rain

**Attach and edit:** `tools/art/background_inbox/majlis/riyadh_3.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Riyadh, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. Keep the state of repair exactly as in the image: everything is restored. Rain falls softly outside while every roof and awning keeps the wings dry and glowing with warm lantern light, which reflects in the puddles. It feels like a cosy shelter in the rain, a place guests will be glad to step into out of the rain. The rain look: rain over the capital, the skyline softened by rain and low cloud with its lights glowing through, wet paving reflecting the lanterns and string lights, the fireworks reduced to a faint glow in the cloud.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

## Al-Khobar (`khobar`), rain

**The place:** harbour with a wooden dhow, lighthouse, palm waterfront.

**Rain look for this area:** Gulf rain, choppy water dimpled with rain, the lighthouse softened in mist but its lamp glowing, the dhow's rigging dripping, the stone quay wet and shining.

### `khobar_1_rain.png`: stage 1, run down, rain

**Attach and edit:** `tools/art/background_inbox/majlis/khobar_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Al-Khobar, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. The scene stays run down: every wing must stay exactly as damaged as in the image, and nothing may be repaired. Heavy grey-violet rain clouds replace the golden sky, rain falls in visible streaks, surfaces are wet and dark, puddles gather, and water drips through broken roofs and gaps. The mood is sad and moody, but the setting is still beautiful. The rain look: Gulf rain, choppy water dimpled with rain, the lighthouse softened in mist but its lamp glowing, the dhow's rigging dripping, the stone quay wet and shining.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `khobar_2_rain.png`: stage 2, half restored, rain

**Attach and edit:** `tools/art/background_inbox/majlis/khobar_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Al-Khobar, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. Keep the state of repair exactly as in the image: the restored wings stay restored and the run-down wings stay run down. The restored wings are dry under their roofs and glow warm, with lantern light reflected in nearby puddles. The run-down wings are soaked, dark and dripping, with a tarp or a few planks only partly covering them. The rain look: Gulf rain, choppy water dimpled with rain, the lighthouse softened in mist but its lamp glowing, the dhow's rigging dripping, the stone quay wet and shining.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.

### `khobar_3_rain.png`: stage 3, fully restored, rain

**Attach and edit:** `tools/art/background_inbox/majlis/khobar_3.png`. Edit this exact image.

**Prompt:**

> Edit the provided image of Al-Khobar, a coffee majlis restoration scene painted at golden hour. Change only the time of day and weather. It is now raining. Keep the state of repair exactly as in the image: everything is restored. Rain falls softly outside while every roof and awning keeps the wings dry and glowing with warm lantern light, which reflects in the puddles. It feels like a cosy shelter in the rain, a place guests will be glad to step into out of the rain. The rain look: Gulf rain, choppy water dimpled with rain, the lighthouse softened in mist but its lamp glowing, the dhow's rigging dripping, the stone quay wet and shining.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, every plant, boat and rock, the painted style and the aspect ratio. Only the lighting, sky, weather and the wet or glowing surfaces that follow from them may change. Match the original seamlessly so the two images overlay exactly. No people, text, letters, logos or watermarks.
