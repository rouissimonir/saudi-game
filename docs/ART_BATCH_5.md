# Art batch 5: restoration stages for the other seven areas

Three painted restoration stages per area, 21 images, like Diriyah's in batch 4. The Majlis view crossfades between them as wings are restored. Each prompt is complete on its own.

**Alignment matters most.** Stage 2 is an edit of stage 1, and stage 3 an edit of stage 2. Keep the camera, framing and every building exactly where it was, and change only the state of repair. Batch 4's stage 3 drifted slightly (the fountain moved); please avoid that here.

---

## Task for Codex, batch 5 (copy this whole section into Codex)

> You are working in the `rouissimonir/saudi-game` repository. Check out the branch `art/codex`, creating it from `main` if it does not exist.
> Generate the 21 images in `docs/ART_BATCH_5.md` using your image generation tool, area by area.
>
> **Order for each area:** generate `<area>_1.png`, then make `<area>_2.png` as an edit of stage 1, then `<area>_3.png` as an edit of stage 2. The camera, framing and buildings must stay identical; only the state of repair changes.
>
> **References:** attach the files named in each section. They are in the repository.
>
> **Output:** PNG, landscape 16:9 (for example 1536x864), saved to `tools/art/background_inbox/majlis/` with the exact file names given.
>
> **Check:** look at each image before saving. Regenerate if any of these fail:
> - It matches the painted style of the references.
> - The three stages of an area line up exactly. Overlay them to check.
> - There are no people, text, letters, logos or watermarks.
>
> **Finish:** commit the 21 PNGs with the message "Add art batch 5" and push the `art/codex` branch. You may commit area by area. Do not change any other files.

---

## Jeddah Al-Balad (`jeddah`)

**The four wings to show, left to right:** (1) the **Naseef House Rawshan**: a carved wooden balcony over the old lanes; (2) the **Coral-Stone Courtyard**: a sea-stone courtyard that keeps the coffee cool; (3) the **Al-Alawi Souq Corner**: a spice and cardamom stall in the busiest souq; (4) the **Sea-Breeze Rooftop**: an open rooftop majlis in the Red Sea breeze.

### `jeddah_1.png`: stage 1, run down

**Attach:**
1. `public/assets/art/story/bg_jeddah.webp`: this area painted for the story. Match its place, architecture and light.
2. `tools/art/background_inbox/majlis_diriyah_1.png`: the Diriyah ruin stage, for the diorama framing and level of decay.

**Prompt:**

> Reference 1 shows this place, Jeddah Al-Balad, painted for the same game: match its architecture, colours and light. Reference 2 shows how another area's Majlis restoration banner is composed: a wide, gently elevated three-quarter diorama view with the wings side by side. Match that framing and painting style.
>
> Paint a wide 16:9 diorama view, at golden hour with the low sun on the left, of a coffee majlis compound in historic Jeddah Al-Balad by the Red Sea: tall coral-stone Hijazi houses with ornate carved wooden rawasheen balconies in teak brown and rawasheen green, latticed mashrabiya screens, a souq lane with hanging lanterns, and a glimpse of the sea, run down and neglected. The wings, left to right: the Naseef House Rawshan (a carved wooden balcony over the old lanes); the Coral-Stone Courtyard (a sea-stone courtyard that keeps the coffee cool); the Al-Alawi Souq Corner (a spice and cardamom stall in the busiest souq); the Sea-Breeze Rooftop (an open rooftop majlis in the Red Sea breeze). Each wing is clearly separate and readable. All of them are shabby: cracked plaster, faded and torn fabrics, broken wooden parts, empty counters, dust and debris. The setting itself stays beautiful. Sad but full of potential.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, warm and rich, premium mobile-game art. Not photoreal, not 3D. No people, text, letters, logos or watermarks.

### `jeddah_2.png`: stage 2, half restored

**Attach:** your `jeddah_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image. Change only the state of repair: the Naseef House Rawshan and the Coral-Stone Courtyard (the two left-most wings) are now fully restored, freshly plastered and painted, with new fabrics and woodwork and warm lantern light, looking welcoming and cared for. The Al-Alawi Souq Corner, Sea-Breeze Rooftop on the right stay exactly as they are, still run down, with a few new building materials and a ladder beside them as if work is about to start.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, the landscape, the sky and the golden-hour light, and the painted style. Do not change the aspect ratio. Match the original seamlessly.

### `jeddah_3.png`: stage 3, fully restored

**Attach:** your `jeddah_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image. Change only the state of repair: every wing is now fully restored and lively, including the Al-Alawi Souq Corner, Sea-Breeze Rooftop, with fresh paint, gleaming brass dallahs and coffee cups ready for guests, strings of warm lanterns, potted plants and flowers. Remove the ladder and building materials. The two left wings stay as restored as before.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, the landscape, the sky and the golden-hour light, and the painted style. Do not change the aspect ratio. Match the original seamlessly.

---

## AlUla Oasis (`alula`)

**The four wings to show, left to right:** (1) the **Sandstone Terrace**: a terrace at the foot of the rose-red cliffs; (2) the **Palm Grove Majlis**: a majlis among palms and flowing springs; (3) the **Stargazing Deck**: night coffee under the clear AlUla sky; (4) the **Old Town Lantern Lane**: lanterns lighting the mud-brick old town.

### `alula_1.png`: stage 1, run down

**Attach:**
1. `public/assets/art/story/bg_alula.webp`: this area painted for the story. Match its place, architecture and light.
2. `tools/art/background_inbox/majlis_diriyah_1.png`: the Diriyah ruin stage, for the diorama framing and level of decay.

**Prompt:**

> Reference 1 shows this place, AlUla Oasis, painted for the same game: match its architecture, colours and light. Reference 2 shows how another area's Majlis restoration banner is composed: a wide, gently elevated three-quarter diorama view with the wings side by side. Match that framing and painting style.
>
> Paint a wide 16:9 diorama view, at golden hour with the low sun on the left, of a coffee majlis compound in the AlUla oasis at the foot of towering rose-red sandstone cliffs, with date palms, flowing springs and the mud-brick old town, run down and neglected. The wings, left to right: the Sandstone Terrace (a terrace at the foot of the rose-red cliffs); the Palm Grove Majlis (a majlis among palms and flowing springs); the Stargazing Deck (night coffee under the clear AlUla sky); the Old Town Lantern Lane (lanterns lighting the mud-brick old town). Each wing is clearly separate and readable. All of them are shabby: cracked plaster, faded and torn fabrics, broken wooden parts, empty counters, dust and debris. The setting itself stays beautiful. Sad but full of potential.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, warm and rich, premium mobile-game art. Not photoreal, not 3D. No people, text, letters, logos or watermarks.

### `alula_2.png`: stage 2, half restored

**Attach:** your `alula_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image. Change only the state of repair: the Sandstone Terrace and the Palm Grove Majlis (the two left-most wings) are now fully restored, freshly plastered and painted, with new fabrics and woodwork and warm lantern light, looking welcoming and cared for. The Stargazing Deck, Old Town Lantern Lane on the right stay exactly as they are, still run down, with a few new building materials and a ladder beside them as if work is about to start.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, the landscape, the sky and the golden-hour light, and the painted style. Do not change the aspect ratio. Match the original seamlessly.

### `alula_3.png`: stage 3, fully restored

**Attach:** your `alula_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image. Change only the state of repair: every wing is now fully restored and lively, including the Stargazing Deck, Old Town Lantern Lane, with fresh paint, gleaming brass dallahs and coffee cups ready for guests, strings of warm lanterns, potted plants and flowers. Remove the ladder and building materials. The two left wings stay as restored as before.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, the landscape, the sky and the golden-hour light, and the painted style. Do not change the aspect ratio. Match the original seamlessly.

---

## Taif Rose Gardens (`taif`)

**The four wings to show, left to right:** (1) the **Rose Distillery**: copper stills distilling Taif rose water; (2) the **Al-Hada Breeze Majlis**: a cool mountain majlis on the Al-Hada peaks; (3) the **Pomegranate Terrace**: terraces of Taif pomegranates and grapes; (4) the **Rose Market**: rose and perfume stalls in full season.

### `taif_1.png`: stage 1, run down

**Attach:**
1. `public/assets/art/story/bg_taif.webp`: this area painted for the story. Match its place, architecture and light.
2. `tools/art/background_inbox/majlis_diriyah_1.png`: the Diriyah ruin stage, for the diorama framing and level of decay.

**Prompt:**

> Reference 1 shows this place, Taif Rose Gardens, painted for the same game: match its architecture, colours and light. Reference 2 shows how another area's Majlis restoration banner is composed: a wide, gently elevated three-quarter diorama view with the wings side by side. Match that framing and painting style.
>
> Paint a wide 16:9 diorama view, at golden hour with the low sun on the left, of a coffee majlis compound in the Taif highlands in the Al-Hada mountains: stone farmhouses, terraced fields of pink damask roses, pomegranate trees, and misty blue-green mountains behind, run down and neglected. The wings, left to right: the Rose Distillery (copper stills distilling Taif rose water); the Al-Hada Breeze Majlis (a cool mountain majlis on the Al-Hada peaks); the Pomegranate Terrace (terraces of Taif pomegranates and grapes); the Rose Market (rose and perfume stalls in full season). Each wing is clearly separate and readable. All of them are shabby: cracked plaster, faded and torn fabrics, broken wooden parts, empty counters, dust and debris. The setting itself stays beautiful. Sad but full of potential.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, warm and rich, premium mobile-game art. Not photoreal, not 3D. No people, text, letters, logos or watermarks.

### `taif_2.png`: stage 2, half restored

**Attach:** your `taif_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image. Change only the state of repair: the Rose Distillery and the Al-Hada Breeze Majlis (the two left-most wings) are now fully restored, freshly plastered and painted, with new fabrics and woodwork and warm lantern light, looking welcoming and cared for. The Pomegranate Terrace, Rose Market on the right stay exactly as they are, still run down, with a few new building materials and a ladder beside them as if work is about to start.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, the landscape, the sky and the golden-hour light, and the painted style. Do not change the aspect ratio. Match the original seamlessly.

### `taif_3.png`: stage 3, fully restored

**Attach:** your `taif_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image. Change only the state of repair: every wing is now fully restored and lively, including the Pomegranate Terrace, Rose Market, with fresh paint, gleaming brass dallahs and coffee cups ready for guests, strings of warm lanterns, potted plants and flowers. Remove the ladder and building materials. The two left wings stay as restored as before.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, the landscape, the sky and the golden-hour light, and the painted style. Do not change the aspect ratio. Match the original seamlessly.

---

## Abha & the Sarawat Mountains (`abha`)

**The four wings to show, left to right:** (1) the **Al-Qatt Painted Wall**: a wall painted in the Asiri Al-Qatt art; (2) the **Stone Tower Café**: an old stone tower turned mountain café; (3) the **Cloud Terrace**: a terrace above the clouds of Al-Soudah; (4) the **Coffee Bean Terraces**: khawlani coffee terraces on the slopes.

### `abha_1.png`: stage 1, run down

**Attach:**
1. `public/assets/art/story/bg_abha.webp`: this area painted for the story. Match its place, architecture and light.
2. `tools/art/background_inbox/majlis_diriyah_1.png`: the Diriyah ruin stage, for the diorama framing and level of decay.

**Prompt:**

> Reference 1 shows this place, Abha & the Sarawat Mountains, painted for the same game: match its architecture, colours and light. Reference 2 shows how another area's Majlis restoration banner is composed: a wide, gently elevated three-quarter diorama view with the wings side by side. Match that framing and painting style.
>
> Paint a wide 16:9 diorama view, at golden hour with the low sun on the left, of a coffee majlis compound in a mountain village in the Sarawat range near Abha: Asiri stone-and-mud tower houses whose window frames are painted in colourful Al-Qatt geometric bands, juniper trees, and a sea of clouds in the valley below, run down and neglected. The wings, left to right: the Al-Qatt Painted Wall (a wall painted in the Asiri Al-Qatt art); the Stone Tower Café (an old stone tower turned mountain café); the Cloud Terrace (a terrace above the clouds of Al-Soudah); the Coffee Bean Terraces (khawlani coffee terraces on the slopes). Each wing is clearly separate and readable. All of them are shabby: cracked plaster, faded and torn fabrics, broken wooden parts, empty counters, dust and debris. The setting itself stays beautiful. Sad but full of potential.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, warm and rich, premium mobile-game art. Not photoreal, not 3D. No people, text, letters, logos or watermarks.

### `abha_2.png`: stage 2, half restored

**Attach:** your `abha_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image. Change only the state of repair: the Al-Qatt Painted Wall and the Stone Tower Café (the two left-most wings) are now fully restored, freshly plastered and painted, with new fabrics and woodwork and warm lantern light, looking welcoming and cared for. The Cloud Terrace, Coffee Bean Terraces on the right stay exactly as they are, still run down, with a few new building materials and a ladder beside them as if work is about to start.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, the landscape, the sky and the golden-hour light, and the painted style. Do not change the aspect ratio. Match the original seamlessly.

### `abha_3.png`: stage 3, fully restored

**Attach:** your `abha_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image. Change only the state of repair: every wing is now fully restored and lively, including the Cloud Terrace, Coffee Bean Terraces, with fresh paint, gleaming brass dallahs and coffee cups ready for guests, strings of warm lanterns, potted plants and flowers. Remove the ladder and building materials. The two left wings stay as restored as before.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, the landscape, the sky and the golden-hour light, and the painted style. Do not change the aspect ratio. Match the original seamlessly.

---

## Al-Ahsa Oasis (`ahsa`)

_Correction: in the game Al-Ahsa has four wings, with the **Qaisariya Souq** between the spring and the press. The painting as delivered shows three; the souq is shown by the market-like space between them, which is acceptable. Its own wing picture came in batch 7._

**The 3 wings to show, left to right:** (1) the **Oasis Spring**: a majlis beside a palm-ringed spring; (2) the **Date Syrup House**: a press for Khalas date syrup; (3) the **Al-Qarah Caves**: cool coffee inside the Al-Qarah caves.

### `ahsa_1.png`: stage 1, run down

**Attach:**
1. `public/assets/art/story/bg_ahsa.webp`: this area painted for the story. Match its place, architecture and light.
2. `tools/art/background_inbox/majlis_diriyah_1.png`: the Diriyah ruin stage, for the diorama framing and level of decay.

**Prompt:**

> Reference 1 shows this place, Al-Ahsa Oasis, painted for the same game: match its architecture, colours and light. Reference 2 shows how another area's Majlis restoration banner is composed: a wide, gently elevated three-quarter diorama view with the wings side by side. Match that framing and painting style.
>
> Paint a wide 16:9 diorama view, at golden hour with the low sun on the left, of a coffee majlis compound in the Al-Ahsa oasis: endless rows of date palms, a clear spring-fed water channel, mud-brick farm buildings, and the flat-topped Al-Qarah mountain with its cave entrances, run down and neglected. The wings, left to right: the Oasis Spring (a majlis beside a palm-ringed spring); the Date Syrup House (a press for Khalas date syrup); the Al-Qarah Caves (cool coffee inside the Al-Qarah caves). Each wing is clearly separate and readable. All of them are shabby: cracked plaster, faded and torn fabrics, broken wooden parts, empty counters, dust and debris. The setting itself stays beautiful. Sad but full of potential.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, warm and rich, premium mobile-game art. Not photoreal, not 3D. No people, text, letters, logos or watermarks.

### `ahsa_2.png`: stage 2, half restored

**Attach:** your `ahsa_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image. Change only the state of repair: the Oasis Spring and the Date Syrup House (the two left-most wings) are now fully restored, freshly plastered and painted, with new fabrics and woodwork and warm lantern light, looking welcoming and cared for. The Al-Qarah Caves on the right stays exactly as it is, still run down, with a few new building materials and a ladder beside it as if work is about to start.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, the landscape, the sky and the golden-hour light, and the painted style. Do not change the aspect ratio. Match the original seamlessly.

### `ahsa_3.png`: stage 3, fully restored

**Attach:** your `ahsa_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image. Change only the state of repair: every wing is now fully restored and lively, including the Al-Qarah Caves, with fresh paint, gleaming brass dallahs and coffee cups ready for guests, strings of warm lanterns, potted plants and flowers. Remove the ladder and building materials. The two left wings stay as restored as before.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, the landscape, the sky and the golden-hour light, and the painted style. Do not change the aspect ratio. Match the original seamlessly.

---

## Riyadh Boulevard (`riyadh`)

**The four wings to show, left to right:** (1) the **Boulevard Roastery**: a specialty roastery in the heart of Riyadh Season; (2) the **Rooftop Lounge**: a view over the city lights; (3) the **Art Wall**: a mural by young Saudi artists; (4) the **Festival Stage**: a stage for live coffee shows.

### `riyadh_1.png`: stage 1, run down

**Attach:**
1. `public/assets/art/story/bg_riyadh.webp`: this area painted for the story. Match its place, architecture and light.
2. `tools/art/background_inbox/majlis_diriyah_1.png`: the Diriyah ruin stage, for the diorama framing and level of decay.

**Prompt:**

> Reference 1 shows this place, Riyadh Boulevard, painted for the same game: match its architecture, colours and light. Reference 2 shows how another area's Majlis restoration banner is composed: a wide, gently elevated three-quarter diorama view with the wings side by side. Match that framing and painting style.
>
> Paint a wide 16:9 diorama view, at golden hour with the low sun on the left, of a coffee majlis compound in Riyadh Boulevard at dusk during Riyadh Season: a modern plaza mixing Najdi mud-brick details with glass and steel, festival lights, and the city skyline with the Kingdom Centre in the distance, run down and neglected. The wings, left to right: the Boulevard Roastery (a specialty roastery in the heart of Riyadh Season); the Rooftop Lounge (a view over the city lights); the Art Wall (a mural by young Saudi artists); the Festival Stage (a stage for live coffee shows). Each wing is clearly separate and readable. All of them are shabby: cracked plaster, faded and torn fabrics, broken wooden parts, empty counters, dust and debris. The setting itself stays beautiful. Sad but full of potential.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, warm and rich, premium mobile-game art. Not photoreal, not 3D. No people, text, letters, logos or watermarks.

### `riyadh_2.png`: stage 2, half restored

**Attach:** your `riyadh_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image. Change only the state of repair: the Boulevard Roastery and the Rooftop Lounge (the two left-most wings) are now fully restored, freshly plastered and painted, with new fabrics and woodwork and warm lantern light, looking welcoming and cared for. The Art Wall, Festival Stage on the right stay exactly as they are, still run down, with a few new building materials and a ladder beside them as if work is about to start.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, the landscape, the sky and the golden-hour light, and the painted style. Do not change the aspect ratio. Match the original seamlessly.

### `riyadh_3.png`: stage 3, fully restored

**Attach:** your `riyadh_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image. Change only the state of repair: every wing is now fully restored and lively, including the Art Wall, Festival Stage, with fresh paint, gleaming brass dallahs and coffee cups ready for guests, strings of warm lanterns, potted plants and flowers. Remove the ladder and building materials. The two left wings stay as restored as before.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, the landscape, the sky and the golden-hour light, and the painted style. Do not change the aspect ratio. Match the original seamlessly.

---

## Al-Khobar Corniche (`khobar`)

_Correction: in the game Al-Khobar has four wings, with the **Pearl Divers' Majlis** between the kiosk and the dhow. The painting as delivered shows three; the quay by the water stands in for it. Its own wing picture came in batch 7._

**The 3 wings to show, left to right:** (1) the **Corniche Kiosk**: a coffee kiosk on the Gulf shore; (2) the **Dhow Deck**: a majlis aboard a traditional dhow; (3) the **Lighthouse Café**: sunset coffee by the lighthouse.

### `khobar_1.png`: stage 1, run down

**Attach:**
1. `public/assets/art/story/bg_khobar.webp`: this area painted for the story. Match its place, architecture and light.
2. `tools/art/background_inbox/majlis_diriyah_1.png`: the Diriyah ruin stage, for the diorama framing and level of decay.

**Prompt:**

> Reference 1 shows this place, Al-Khobar Corniche, painted for the same game: match its architecture, colours and light. Reference 2 shows how another area's Majlis restoration banner is composed: a wide, gently elevated three-quarter diorama view with the wings side by side. Match that framing and painting style.
>
> Paint a wide 16:9 diorama view, at golden hour with the low sun on the left, of a coffee majlis compound in the Al-Khobar corniche on the Arabian Gulf at sunset: a palm-lined promenade, a traditional wooden dhow moored at a small pier, a white lighthouse, and calm turquoise-gold water, run down and neglected. The wings, left to right: the Corniche Kiosk (a coffee kiosk on the Gulf shore); the Dhow Deck (a majlis aboard a traditional dhow); the Lighthouse Café (sunset coffee by the lighthouse). Each wing is clearly separate and readable. All of them are shabby: cracked plaster, faded and torn fabrics, broken wooden parts, empty counters, dust and debris. The setting itself stays beautiful. Sad but full of potential.
>
> Style: semi-realistic digital painting matching the references, soft painterly brushwork, warm and rich, premium mobile-game art. Not photoreal, not 3D. No people, text, letters, logos or watermarks.

### `khobar_2.png`: stage 2, half restored

**Attach:** your `khobar_1.png`. Edit this exact image.

**Prompt:**

> Edit the provided image. Change only the state of repair: the Corniche Kiosk and the Dhow Deck (the two left-most wings) are now fully restored, freshly plastered and painted, with new fabrics and woodwork and warm lantern light, looking welcoming and cared for. The Lighthouse Café on the right stays exactly as it is, still run down, with a few new building materials and a ladder beside it as if work is about to start.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, the landscape, the sky and the golden-hour light, and the painted style. Do not change the aspect ratio. Match the original seamlessly.

### `khobar_3.png`: stage 3, fully restored

**Attach:** your `khobar_2.png`. Edit this exact image.

**Prompt:**

> Edit the provided image. Change only the state of repair: every wing is now fully restored and lively, including the Lighthouse Café, with fresh paint, gleaming brass dallahs and coffee cups ready for guests, strings of warm lanterns, potted plants and flowers. Remove the ladder and building materials. The two left wings stay as restored as before.
>
> Keep exactly the same: the camera angle, framing and composition, every building's position and shape, the landscape, the sky and the golden-hour light, and the painted style. Do not change the aspect ratio. Match the original seamlessly.

---
