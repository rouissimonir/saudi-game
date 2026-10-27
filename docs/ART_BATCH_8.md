# Art batch 8: a local host for every area (28 portraits)

Every area chapter today is spoken by the same few faces (Faisal, Noura, Lama, Tariq, Sultan), so travelling across the Kingdom does not feel like arriving somewhere new. This batch paints **seven new local hosts, one per area**, each with four expressions, in the same painted style as Layla and the rest of the cast. **28 images.**

| Area | Host | Who they are |
|---|---|---|
| Jeddah Al-Balad | **Abu Hani** (`hani`) | the spice merchant of the Al-Alawi souq |
| AlUla | **Reem** (`reem`) | a young heritage guide at the AlUla oasis |
| Taif | **Hessa** (`hessa`) | the rose-water distiller of the Taif rose gardens |
| Abha | **Aisha** (`aisha`) | the Al-Qatt wall painter of the Sarawat mountains |
| Al-Ahsa | **Abu Khalid** (`khalid`) | the date farmer of the Al-Ahsa oasis |
| Riyadh | **Dana** (`dana`) | a festival producer of Riyadh Season |
| Al-Khobar | **Captain Nasser** (`nasser`) | a retired pearl-diving captain of the Gulf |

The existing cast stays. These hosts are new supporting characters: Claude will rewrite each area chapter so the local host opens it, with the existing cast still appearing around them.

**Cultural review before release.** Dress, headwear and details here are written from general knowledge. Names are fictional. Please have Saudi reviewers check, in particular, the Hijazi (Jeddah), Taif and Asiri (Abha, Al-Qatt) dress details, and the names.

---

## Task for Codex, batch 8 (copy this whole section into Codex)

> You are working in the `rouissimonir/saudi-game` repository. Check out the branch `art/codex`, creating it from `main` if it does not exist.
> Generate the 28 portraits in `docs/ART_BATCH_8.md` using your image generation tool, one character at a time.
>
> **Order for each character:** generate `<id>_neutral.png` first. Then make each expression as an **edit of that neutral image**, never from scratch, so the face stays identical across all four.
>
> **References:** attach the files named in each section. They are in the repository. Reference 1 is always the game's painting style. Reference 2 is another painted character from the game, there **only for painting finish, never for the face or clothes**.
>
> **Output:** PNG, vertical 3:4 portrait (for example 1536x2048, or the largest 3:4 size available), saved to `tools/art/portrait_inbox/` with the exact file names given.
>
> **Check:** look at each image before saving. Regenerate if any of these fail:
> - The face matches that character's neutral (compare all four side by side).
> - The clothing, colours and held object match the description.
> - The style matches `tools/art/portrait_refs/style_layla_neutral.jpg`.
> - The background is plain flat beige with no objects, text or shadows. Any screen, badge or label is blank.
> - The framing is waist-up with the hands and the held object visible at the bottom.
> - There are no extra fingers or distorted hands.
>
> **Finish:** commit the 28 PNGs with the message "Add art batch 8" and push the `art/codex` branch. You may commit character by character. Do not change any other files.

---

## Shared rules (already included in every prompt below)

- **Style:** semi-realistic digital painting, like the story art in mobile games such as Hollywood Merge. Believable human proportions, soft painterly shading, clean edges. Not anime, not photoreal, not 3D. It must match `tools/art/portrait_refs/style_layla_neutral.jpg` in rendering, colour warmth and finish.
- **Light:** soft warm key light from the upper left and a gentle golden rim light, as at sunset.
- **Framing:** vertical 3:4, waist-up, centred. Top of the head about 8% below the top edge. The frame ends just below the hands. The figure fills most of the width.
- **Background:** completely plain, flat, light warm beige (about RGB 224, 195, 168), no texture, objects, text or shadows, so it can be cut out cleanly.
- **Culture:** modest Saudi dress, respectful and accurate. Hair stays covered as described. No text or lettering anywhere, including on clothes, badges and screens.

---

## Abu Hani (`hani`), Jeddah Al-Balad

**Role:** the spice merchant of the Al-Alawi souq.

### `hani_neutral.png`

**Attach:**
1. `tools/art/portrait_refs/style_layla_neutral.jpg`, the style to match.
2. `public/assets/art/story/tariq_neutral.webp`, another painted character of the game, for painting finish only. Do not copy the face or clothes.

**Prompt:**

> Reference 1 shows the exact art style to match: a semi-realistic painted portrait with soft painterly shading, believable proportions, clean edges, warm golden rim light from the left and a plain flat warm-beige background. Reference 2 is another character from the same game, shown only so the finish matches: use nothing from it but the painting quality.
>
> Paint Abu Hani, the spice merchant of the Al-Alawi souq, in exactly the style of reference 1. Abu Hani is a warm, dignified Saudi man in his early 60s from Jeddah, with olive-tan skin, kind dark-brown eyes with deep laugh lines, thick grey eyebrows and a neatly trimmed silver-white beard and moustache. Abu Hani wears a clean white thobe under a light-grey embroidered waistcoat (sidri) with fine silver thread at the edges, a white ghutra held with a black agal, and a string of amber prayer beads wound once around his left hand. Modern, warm and culturally accurate. A calm, friendly, neutral expression with a faint smile.
>
> Composition: vertical 3:4 portrait, waist-up, centred, body turned very slightly to the left, face looking at the viewer, his hands resting together in front at the waist, the prayer beads hanging between them. The top of the head sits about 8% below the top edge, and the frame ends just below the hands. The figure fills most of the frame width.
>
> Lighting: soft warm key light from the upper left with a gentle golden rim light, as at sunset.
>
> Background: completely plain, flat, light warm beige with no texture, objects, text or shadows. No text or lettering anywhere.

### `hani_happy.png`

**Attach:** your chosen `hani_neutral.png`.

**Prompt:**

> Edit the provided image of Abu Hani. Change only the facial expression to happy: a big, warm, generous smile showing his teeth, eyes crinkled, the look of a merchant whose best customer just walked in.
> Keep exactly the same: his face and identity, the silver-white beard, the white thobe and grey embroidered waistcoat, the white ghutra with the black agal, the amber prayer beads, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `hani_surprised.png`

**Attach:** your chosen `hani_neutral.png`.

**Prompt:**

> Edit the provided image of Abu Hani. Change only the facial expression to surprised: eyebrows high, eyes wide, mouth slightly open, as if a customer just asked for a spice he has never heard of.
> Keep exactly the same: his face and identity, the silver-white beard, the white thobe and grey embroidered waistcoat, the white ghutra with the black agal, the amber prayer beads, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `hani_worried.png`

**Attach:** your chosen `hani_neutral.png`.

**Prompt:**

> Edit the provided image of Abu Hani. Change only the facial expression to worried: brows drawn together and a downturned mouth, a worried look, as if the sacks in his stall are running low.
> Keep exactly the same: his face and identity, the silver-white beard, the white thobe and grey embroidered waistcoat, the white ghutra with the black agal, the amber prayer beads, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.
---

## Reem (`reem`), AlUla

**Role:** a young heritage guide at the AlUla oasis.

### `reem_neutral.png`

**Attach:**
1. `tools/art/portrait_refs/style_layla_neutral.jpg`, the style to match.
2. `public/assets/art/story/lama_neutral.webp`, another painted character of the game, for painting finish only. Do not copy the face or clothes.

**Prompt:**

> Reference 1 shows the exact art style to match: a semi-realistic painted portrait with soft painterly shading, believable proportions, clean edges, warm golden rim light from the left and a plain flat warm-beige background. Reference 2 is another character from the same game, shown only so the finish matches: use nothing from it but the painting quality.
>
> Paint Reem, a young heritage guide at the AlUla oasis, in exactly the style of reference 1. Reem is a confident Saudi woman of about 30, with warm tan skin, bright hazel-brown eyes, defined dark eyebrows and a calm, intelligent expression. Reem wears a long sand-coloured linen tunic with rolled sleeves and a thin terracotta border at the hem, a black headscarf neatly wrapped and covering all her hair, a canvas satchel strap across one shoulder, and a small brown notebook held in both hands. Modern, warm and culturally accurate. A calm, friendly, neutral expression with a faint smile.
>
> Composition: vertical 3:4 portrait, waist-up, centred, body turned very slightly to the left, face looking at the viewer, her hands holding the small closed notebook together in front at the waist. The top of the head sits about 8% below the top edge, and the frame ends just below the hands. The figure fills most of the frame width.
>
> Lighting: soft warm key light from the upper left with a gentle golden rim light, as at sunset.
>
> Background: completely plain, flat, light warm beige with no texture, objects, text or shadows. No text or lettering anywhere.

### `reem_happy.png`

**Attach:** your chosen `reem_neutral.png`.

**Prompt:**

> Edit the provided image of Reem. Change only the facial expression to happy: a bright, proud smile, eyes lit with enthusiasm, as if she just showed a visitor her favourite view of the oasis.
> Keep exactly the same: her face and identity, the sand-coloured tunic with the terracotta border, the black headscarf, the satchel strap, the notebook, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `reem_surprised.png`

**Attach:** your chosen `reem_neutral.png`.

**Prompt:**

> Edit the provided image of Reem. Change only the facial expression to surprised: eyebrows raised and eyes wide, lips parted, as if she just spotted something unexpected on the cliff path.
> Keep exactly the same: her face and identity, the sand-coloured tunic with the terracotta border, the black headscarf, the satchel strap, the notebook, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `reem_worried.png`

**Attach:** your chosen `reem_neutral.png`.

**Prompt:**

> Edit the provided image of Reem. Change only the facial expression to worried: slightly furrowed brows and pressed lips, a worried look, as if the weather has turned on her tour.
> Keep exactly the same: her face and identity, the sand-coloured tunic with the terracotta border, the black headscarf, the satchel strap, the notebook, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.
---

## Hessa (`hessa`), Taif

**Role:** the rose-water distiller of the Taif rose gardens.

### `hessa_neutral.png`

**Attach:**
1. `tools/art/portrait_refs/style_layla_neutral.jpg`, the style to match.
2. `public/assets/art/story/noura_neutral.webp`, another painted character of the game, for painting finish only. Do not copy the face or clothes.

**Prompt:**

> Reference 1 shows the exact art style to match: a semi-realistic painted portrait with soft painterly shading, believable proportions, clean edges, warm golden rim light from the left and a plain flat warm-beige background. Reference 2 is another character from the same game, shown only so the finish matches: use nothing from it but the painting quality.
>
> Paint Hessa, the rose-water distiller of the Taif rose gardens, in exactly the style of reference 1. Hessa is a gentle, capable Saudi woman of about 45 from the Taif highlands, with light-wheat skin, soft brown eyes, warm rosy cheeks and a patient, kind expression. Hessa wears a dark forest-green abaya with delicate pink rose embroidery on the cuffs and edges, a rose-pink headscarf with a small floral print that covers all her hair, and a small crystal rose-water bottle held in both hands. Modern, warm and culturally accurate. A calm, friendly, neutral expression with a faint smile.
>
> Composition: vertical 3:4 portrait, waist-up, centred, body turned very slightly to the left, face looking at the viewer, her hands holding the small crystal bottle together in front at the waist. The top of the head sits about 8% below the top edge, and the frame ends just below the hands. The figure fills most of the frame width.
>
> Lighting: soft warm key light from the upper left with a gentle golden rim light, as at sunset.
>
> Background: completely plain, flat, light warm beige with no texture, objects, text or shadows. No text or lettering anywhere.

### `hessa_happy.png`

**Attach:** your chosen `hessa_neutral.png`.

**Prompt:**

> Edit the provided image of Hessa. Change only the facial expression to happy: a soft, delighted smile and bright eyes, the look of a distiller who just caught the perfect scent.
> Keep exactly the same: her face and identity, the green abaya with pink rose embroidery, the rose-pink printed headscarf, the crystal bottle, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `hessa_surprised.png`

**Attach:** your chosen `hessa_neutral.png`.

**Prompt:**

> Edit the provided image of Hessa. Change only the facial expression to surprised: eyebrows lifted and eyes wide, a small gasp, as if the first petals of the season arrived a week early.
> Keep exactly the same: her face and identity, the green abaya with pink rose embroidery, the rose-pink printed headscarf, the crystal bottle, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `hessa_worried.png`

**Attach:** your chosen `hessa_neutral.png`.

**Prompt:**

> Edit the provided image of Hessa. Change only the facial expression to worried: brows slightly knitted and a worried frown, as if a late frost has threatened the roses.
> Keep exactly the same: her face and identity, the green abaya with pink rose embroidery, the rose-pink printed headscarf, the crystal bottle, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.
---

## Aisha (`aisha`), Abha

**Role:** the Al-Qatt wall painter of the Sarawat mountains.

### `aisha_neutral.png`

**Attach:**
1. `tools/art/portrait_refs/style_layla_neutral.jpg`, the style to match.
2. `public/assets/art/story/noura_neutral.webp`, another painted character of the game, for painting finish only. Do not copy the face or clothes.

**Prompt:**

> Reference 1 shows the exact art style to match: a semi-realistic painted portrait with soft painterly shading, believable proportions, clean edges, warm golden rim light from the left and a plain flat warm-beige background. Reference 2 is another character from the same game, shown only so the finish matches: use nothing from it but the painting quality.
>
> Paint Aisha, the Al-Qatt wall painter of the Sarawat mountains, in exactly the style of reference 1. Aisha is a strong, warm Saudi woman of about 50 from the Sarawat highlands, with sun-weathered olive-brown skin, expressive dark eyes, fine smile lines and a calm, artistic presence. Aisha wears a loose dress in bold geometric bands of red, yellow, blue and green in the style of Al-Qatt Al-Asiri, a bright headscarf covering all her hair under a wide woven straw sun hat, and a thin paintbrush held in her right hand with a small clay paint pot in her left. Modern, warm and culturally accurate. A calm, friendly, neutral expression with a faint smile.
>
> Composition: vertical 3:4 portrait, waist-up, centred, body turned very slightly to the left, face looking at the viewer, her hands together in front at the waist, holding the brush and the small clay pot. The top of the head sits about 8% below the top edge, and the frame ends just below the hands. The figure fills most of the frame width.
>
> Lighting: soft warm key light from the upper left with a gentle golden rim light, as at sunset.
>
> Background: completely plain, flat, light warm beige with no texture, objects, text or shadows. No text or lettering anywhere.

### `aisha_happy.png`

**Attach:** your chosen `aisha_neutral.png`.

**Prompt:**

> Edit the provided image of Aisha. Change only the facial expression to happy: a broad, joyful smile and sparkling eyes, the pride of an artist whose wall pattern has just come together.
> Keep exactly the same: her face and identity, the geometric-banded dress, the bright headscarf and woven straw hat, the paintbrush and clay pot, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `aisha_surprised.png`

**Attach:** your chosen `aisha_neutral.png`.

**Prompt:**

> Edit the provided image of Aisha. Change only the facial expression to surprised: eyebrows raised and eyes wide, mouth open a little, as if a wall she painted last year has been revealed by the rain.
> Keep exactly the same: her face and identity, the geometric-banded dress, the bright headscarf and woven straw hat, the paintbrush and clay pot, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `aisha_worried.png`

**Attach:** your chosen `aisha_neutral.png`.

**Prompt:**

> Edit the provided image of Aisha. Change only the facial expression to worried: a worried look with knitted brows, as if the clouds above the mountain are about to wash her fresh paint away.
> Keep exactly the same: her face and identity, the geometric-banded dress, the bright headscarf and woven straw hat, the paintbrush and clay pot, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.
---

## Abu Khalid (`khalid`), Al-Ahsa

**Role:** the date farmer of the Al-Ahsa oasis.

### `khalid_neutral.png`

**Attach:**
1. `tools/art/portrait_refs/style_layla_neutral.jpg`, the style to match.
2. `public/assets/art/story/tariq_neutral.webp`, another painted character of the game, for painting finish only. Do not copy the face or clothes.

**Prompt:**

> Reference 1 shows the exact art style to match: a semi-realistic painted portrait with soft painterly shading, believable proportions, clean edges, warm golden rim light from the left and a plain flat warm-beige background. Reference 2 is another character from the same game, shown only so the finish matches: use nothing from it but the painting quality.
>
> Paint Abu Khalid, the date farmer of the Al-Ahsa oasis, in exactly the style of reference 1. Abu Khalid is a sturdy, good-humoured Saudi man in his mid-50s from Al-Ahsa, with sun-darkened skin, dark eyes, thick black eyebrows streaked with grey and a short grey-flecked beard, with strong, weathered hands. Abu Khalid wears a clean white thobe with the sleeves neatly folded to the forearms, a plain white shemagh worn loosely without an agal, a simple brown leather belt, and a small woven palm basket of golden khalas dates held in both hands. Modern, warm and culturally accurate. A calm, friendly, neutral expression with a faint smile.
>
> Composition: vertical 3:4 portrait, waist-up, centred, body turned very slightly to the left, face looking at the viewer, his hands holding the small basket of dates together in front at the waist. The top of the head sits about 8% below the top edge, and the frame ends just below the hands. The figure fills most of the frame width.
>
> Lighting: soft warm key light from the upper left with a gentle golden rim light, as at sunset.
>
> Background: completely plain, flat, light warm beige with no texture, objects, text or shadows. No text or lettering anywhere.

### `khalid_happy.png`

**Attach:** your chosen `khalid_neutral.png`.

**Prompt:**

> Edit the provided image of Abu Khalid. Change only the facial expression to happy: a hearty, generous grin showing his teeth, the pride of a farmer whose harvest is the best in years.
> Keep exactly the same: his face and identity, the grey-flecked beard, the white thobe with folded sleeves, the white shemagh, the brown belt, the basket of golden dates, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `khalid_surprised.png`

**Attach:** your chosen `khalid_neutral.png`.

**Prompt:**

> Edit the provided image of Abu Khalid. Change only the facial expression to surprised: eyebrows high and eyes round, as if the date palms gave twice the usual fruit overnight.
> Keep exactly the same: his face and identity, the grey-flecked beard, the white thobe with folded sleeves, the white shemagh, the brown belt, the basket of golden dates, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `khalid_worried.png`

**Attach:** your chosen `khalid_neutral.png`.

**Prompt:**

> Edit the provided image of Abu Khalid. Change only the facial expression to worried: furrowed brows and a downturned mouth, a worried look, as if the spring has run lower than he ever remembers.
> Keep exactly the same: his face and identity, the grey-flecked beard, the white thobe with folded sleeves, the white shemagh, the brown belt, the basket of golden dates, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.
---

## Dana (`dana`), Riyadh

**Role:** a festival producer of Riyadh Season.

### `dana_neutral.png`

**Attach:**
1. `tools/art/portrait_refs/style_layla_neutral.jpg`, the style to match.
2. `public/assets/art/story/lama_neutral.webp`, another painted character of the game, for painting finish only. Do not copy the face or clothes.

**Prompt:**

> Reference 1 shows the exact art style to match: a semi-realistic painted portrait with soft painterly shading, believable proportions, clean edges, warm golden rim light from the left and a plain flat warm-beige background. Reference 2 is another character from the same game, shown only so the finish matches: use nothing from it but the painting quality.
>
> Paint Dana, a festival producer of Riyadh Season, in exactly the style of reference 1. Dana is a polished, energetic Saudi woman of about 28 from Riyadh, with light-olive skin, large dark eyes, neatly shaped eyebrows and a quick, clever smile. Dana wears a black open abaya with subtle gold piping over a cream blouse, a soft cream headscarf draped loosely and covering all her hair, small rose-gold earrings, a plain blank lanyard badge at her chest, and a slim tablet with a blank dark screen held in both hands. Modern, warm and culturally accurate. A calm, friendly, neutral expression with a faint smile.
>
> Composition: vertical 3:4 portrait, waist-up, centred, body turned very slightly to the left, face looking at the viewer, her hands holding the slim tablet together in front at the waist. The top of the head sits about 8% below the top edge, and the frame ends just below the hands. The figure fills most of the frame width.
>
> Lighting: soft warm key light from the upper left with a gentle golden rim light, as at sunset.
>
> Background: completely plain, flat, light warm beige with no texture, objects, text or shadows. No text or lettering anywhere.

### `dana_happy.png`

**Attach:** your chosen `dana_neutral.png`.

**Prompt:**

> Edit the provided image of Dana. Change only the facial expression to happy: a bright, delighted smile and sparkling eyes, the look of a producer whose show has just sold out.
> Keep exactly the same: her face and identity, the black open abaya with gold piping, the cream blouse and draped headscarf, the rose-gold earrings, the blank lanyard badge, the tablet with the blank screen, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `dana_surprised.png`

**Attach:** your chosen `dana_neutral.png`.

**Prompt:**

> Edit the provided image of Dana. Change only the facial expression to surprised: eyebrows raised and eyes wide, lips parted, as if the lights just failed five minutes before the doors open.
> Keep exactly the same: her face and identity, the black open abaya with gold piping, the cream blouse and draped headscarf, the rose-gold earrings, the blank lanyard badge, the tablet with the blank screen, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `dana_worried.png`

**Attach:** your chosen `dana_neutral.png`.

**Prompt:**

> Edit the provided image of Dana. Change only the facial expression to worried: a tight, worried frown with knitted brows, as if the schedule has fallen apart minutes before the show.
> Keep exactly the same: her face and identity, the black open abaya with gold piping, the cream blouse and draped headscarf, the rose-gold earrings, the blank lanyard badge, the tablet with the blank screen, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.
---

## Captain Nasser (`nasser`), Al-Khobar

**Role:** a retired pearl-diving captain of the Gulf.

### `nasser_neutral.png`

**Attach:**
1. `tools/art/portrait_refs/style_layla_neutral.jpg`, the style to match.
2. `public/assets/art/story/tariq_neutral.webp`, another painted character of the game, for painting finish only. Do not copy the face or clothes.

**Prompt:**

> Reference 1 shows the exact art style to match: a semi-realistic painted portrait with soft painterly shading, believable proportions, clean edges, warm golden rim light from the left and a plain flat warm-beige background. Reference 2 is another character from the same game, shown only so the finish matches: use nothing from it but the painting quality.
>
> Paint Captain Nasser, a retired pearl-diving captain of the Gulf, in exactly the style of reference 1. Captain Nasser is a weathered, dignified Saudi man in his early 70s from the Gulf coast, with deeply tanned lined skin, pale-brown eyes that squint slightly from years of sun on the water, bushy white eyebrows and a full white beard. Captain Nasser wears a clean white thobe under a navy-blue open coat, a white ghutra held with a black agal, and a small open wooden box held in both hands, holding a single large natural pearl on dark velvet. Modern, warm and culturally accurate. A calm, friendly, neutral expression with a faint smile.
>
> Composition: vertical 3:4 portrait, waist-up, centred, body turned very slightly to the left, face looking at the viewer, his hands holding the small open box with the pearl together in front at the waist. The top of the head sits about 8% below the top edge, and the frame ends just below the hands. The figure fills most of the frame width.
>
> Lighting: soft warm key light from the upper left with a gentle golden rim light, as at sunset.
>
> Background: completely plain, flat, light warm beige with no texture, objects, text or shadows. No text or lettering anywhere.

### `nasser_happy.png`

**Attach:** your chosen `nasser_neutral.png`.

**Prompt:**

> Edit the provided image of Captain Nasser. Change only the facial expression to happy: a slow, deeply warm smile that crinkles his whole face, the look of a captain remembering his best season.
> Keep exactly the same: his face and identity, the full white beard, the white thobe under the navy coat, the white ghutra with the black agal, the wooden box with the pearl, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `nasser_surprised.png`

**Attach:** your chosen `nasser_neutral.png`.

**Prompt:**

> Edit the provided image of Captain Nasser. Change only the facial expression to surprised: bushy eyebrows lifted high and eyes wide, as if a lost dhow was just spotted on the horizon.
> Keep exactly the same: his face and identity, the full white beard, the white thobe under the navy coat, the white ghutra with the black agal, the wooden box with the pearl, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `nasser_worried.png`

**Attach:** your chosen `nasser_neutral.png`.

**Prompt:**

> Edit the provided image of Captain Nasser. Change only the facial expression to worried: lowered brows and a worried, weathered frown, as if a storm is gathering over the Gulf.
> Keep exactly the same: his face and identity, the full white beard, the white thobe under the navy coat, the white ghutra with the black agal, the wooden box with the pearl, the pose, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

---

## After the images arrive (Claude)

1. Cut out each backdrop and install: `python3 tools/art/cutout_portrait.py tools/art/portrait_inbox/<name>.png public/assets/art/story/<name>.png`, then `python3 tools/art/to_webp.py`.
2. Add the seven ids to `CastId` (`src/story/types.ts`), `EXPRESSIONS` (`src/components/story/art.ts`) and the name colours in `ScenePlayer.tsx`.
3. Rewrite each area chapter in `src/story/scenes/areaChapters.ts` so the local host opens it and carries the local story, keeping Layla and the existing cast; check bubble layout with `tools/e2e/story_layout.cjs`.
4. Give each host a small painted avatar for the guest order strip if they appear as customers (`tools/art/make_avatars.py`).
5. Check every host in both languages in the browser, then merge.
