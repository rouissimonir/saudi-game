# Story portrait prompts (for Codex or any image tool)

Everything needed to paint the remaining story portraits so they match painted Layla. Each prompt below is complete
on its own: copy it as-is. Art direction background is in `docs/ASSETS.md`, section 3c.

---

## Task for Codex, batch 1 (done: Layla angry, Noura, Rashid)

> You are working in the `rouissimonir/saudi-game` repository on branch `feature/illustrated-portraits`.
> Generate the 8 story portraits listed in `docs/PORTRAIT_PROMPTS.md` using your image generation tool.
>
> **Order:**
> 1. Generate `noura_neutral` and `rashid_neutral` first.
> 2. Generate each expression as an **edit of that character's neutral image**, never from scratch, so the face stays identical.
> 3. `layla_angry` is an edit of `tools/art/portrait_refs/style_layla_neutral.jpg`.
>
> **References:** for every image, attach the reference files named in its section. They are in the repository.
>
> **Output:**
> - PNG, vertical 3:4 portrait (for example 1536x2048, or the largest 3:4 size available).
> - Saved to `tools/art/portrait_inbox/` with the exact file names given.
>
> **Check:** look at each image before saving. Regenerate if any of these fail:
> - The face matches the character's neutral.
> - The clothing and colours match the description.
> - The background is plain flat beige with no objects, text or shadows.
> - The framing is waist-up with the hands visible at the bottom.
> - There are no extra fingers or distorted hands.
>
> **Finish:** commit the 8 PNGs with the message "Add painted story portraits" and push the branch. Do not change any other files.

---

## Shared rules (already included in every prompt below)

- **Style:**
  - Semi-realistic digital painting, like the story art in mobile games such as Hollywood Merge.
  - Believable human proportions, soft painterly shading, clean edges.
  - Not anime, not photoreal, not 3D.
  - Must match `tools/art/portrait_refs/style_layla_neutral.jpg` exactly in rendering, colour warmth and finish.
- **Light:** soft warm key light from the upper left and a gentle golden rim light, as at sunset.
- **Framing:**
  - Vertical 3:4, waist-up, centred.
  - Hands resting together in front at the waist.
  - Top of the head covering about 8% below the top edge.
  - The frame ends just below the hands, and the figure fills most of the width.
- **Background:** completely plain, flat, light warm beige (about RGB 224, 195, 168), with no texture, objects, text or shadows, so it can be cut out cleanly.
- **Culture:** modest Saudi dress, respectful and accurate. Hair stays covered as described.

---

## 1. `noura_neutral.png`

**Attach:**
1. `tools/art/portrait_refs/style_layla_neutral.jpg`, the style to match.
2. `public/assets/art/story/noura_neutral.webp`, a simple 3D toy render of Noura, for outfit and colours only.

**Prompt:**

> Reference 1 shows the exact art style to match: a semi-realistic painted portrait with soft painterly shading, believable proportions, clean edges, warm golden rim light from the left and a plain flat warm-beige background. Reference 2 is a simple 3D toy render of Grandma Noura. Use it only for her outfit, colours and glasses, not its toy proportions.
>
> Paint Grandma Noura, a Saudi grandmother in her early 70s, in exactly the style of reference 1. She has warm light-tan skin, a kind, softly lined face with gentle laugh lines, warm dark-brown eyes behind round, thin gold-rimmed glasses, a little soft white hair just visible at the forehead, and a calm, affectionate neutral expression with a faint closed-lip smile. She wears a rose-red shayla draped over her head and shoulders, covering her hair and neck, with a thin gold band across the forehead, and a black abaya with thin gold trim running down the front opening. Modest, dignified and culturally accurate.
>
> Composition: vertical 3:4 portrait, waist-up, centred, body turned very slightly to the right, face looking at the viewer, hands resting together in front at the waist. The top of her scarf sits about 8% below the top edge, and the frame ends just below her hands. Her figure fills most of the frame width.
>
> Lighting: soft warm key light from the upper left with a gentle golden rim light, as at sunset.
>
> Background: completely plain, flat, light warm beige with no texture, objects, text or shadows.

## 2. `noura_happy.png`

**Attach:** your chosen `noura_neutral.png`.

**Prompt:**

> Edit the provided image of Grandma Noura. Change only her facial expression to happy: a warm, open, grandmotherly smile showing a little of her upper teeth, cheeks lifted, laugh lines deepened, eyes crinkled and bright with joy behind her glasses, as if welcoming her granddaughter home.
>
> Keep exactly the same: her face and identity, skin tone, round gold-rimmed glasses, the rose-red shayla with the thin gold band, the black abaya with gold trim, her pose with hands together at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

## 3. `noura_surprised.png`

**Attach:** your chosen `noura_neutral.png`.

**Prompt:**

> Edit the provided image of Grandma Noura. Change only her facial expression to surprised: eyes wide open behind her glasses, eyebrows raised high, lips parted in a small open "oh", a look of sudden astonishment.
>
> Keep exactly the same: her face and identity, skin tone, round gold-rimmed glasses, the rose-red shayla with the thin gold band, the black abaya with gold trim, her pose with hands together at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

## 4. `noura_worried.png`

**Attach:** your chosen `noura_neutral.png`.

**Prompt:**

> Edit the provided image of Grandma Noura. Change only her facial expression to worried: the inner ends of her eyebrows drawn up and together, a crease between the brows, sad, anxious eyes behind her glasses, lips pressed together with the corners turned slightly down, the look of a grandmother sharing bad news about the family home.
>
> Keep exactly the same: her face and identity, skin tone, round gold-rimmed glasses, the rose-red shayla with the thin gold band, the black abaya with gold trim, her pose with hands together at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

## 5. `rashid_neutral.png`

**Attach:**
1. `tools/art/portrait_refs/style_layla_neutral.jpg`, the style to match.
2. `public/assets/art/story/rashid_neutral.webp`, a simple 3D toy render of Rashid, for outfit and colours only.

**Prompt:**

> Reference 1 shows the exact art style to match: a semi-realistic painted portrait with soft painterly shading, believable proportions, clean edges, warm golden rim light from the left and a plain flat warm-beige background. Reference 2 is a simple 3D toy render of Rashid, a rival property developer. Use it only for his outfit and colours, not its toy proportions.
>
> Paint Rashid, a Saudi businessman in his early 40s, in exactly the style of reference 1. He has warm medium-tan skin, sharp dark-brown eyes, thick dark eyebrows, a neatly trimmed black moustache and short black goatee, and a composed, slightly smug neutral expression with a faint confident half-smile. He wears a crisp white ghutra with a black agal, a white thobe, a charcoal-grey bisht with thin silver trim over it, and a gold wristwatch on his left wrist. Polished, wealthy and culturally accurate.
>
> Composition: vertical 3:4 portrait, waist-up, centred, body turned very slightly to the left, face looking at the viewer, hands resting together in front at the waist. The top of his ghutra sits about 8% below the top edge, and the frame ends just below his hands. His figure fills most of the frame width.
>
> Lighting: soft warm key light from the upper left with a gentle golden rim light, as at sunset.
>
> Background: completely plain, flat, light warm beige with no texture, objects, text or shadows.

## 6. `rashid_angry.png`

**Attach:** your chosen `rashid_neutral.png`.

**Prompt:**

> Edit the provided image of Rashid. Change only his facial expression to cold anger: eyebrows drawn down hard and together, eyes narrowed in contempt, nostrils slightly flared, a tight scowl under the moustache, the look of a rich man who has just been told no.
>
> Keep exactly the same: his face and identity, skin tone, moustache and goatee, the white ghutra with the black agal, the white thobe, the charcoal bisht with silver trim, the gold watch, his pose with hands together at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

## 7. `rashid_surprised.png`

**Attach:** your chosen `rashid_neutral.png`.

**Prompt:**

> Edit the provided image of Rashid. Change only his facial expression to taken aback: eyebrows raised, eyes widened, mouth slightly open, the look of a confident man caught off guard by unexpected politeness.
>
> Keep exactly the same: his face and identity, skin tone, moustache and goatee, the white ghutra with the black agal, the white thobe, the charcoal bisht with silver trim, the gold watch, his pose with hands together at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

## 8. `layla_angry.png`

**Attach:** `tools/art/portrait_refs/style_layla_neutral.jpg`. This is Layla herself; edit this exact image.

**Prompt:**

> Edit the provided image of Layla. Change only her facial expression to fierce, defiant anger: eyebrows lowered and drawn together in a firm frown, eyes narrowed and intense, staring straight at the viewer, jaw set and lips pressed in a tight line, the look of someone declaring "my grandfather's legacy is not for sale!" Strong but still dignified.
>
> Keep exactly the same: her face and identity, skin tone, the emerald-green silk hijab with the thin gold band across the forehead, the cream abaya with gold trim, the small gold pendant, her pose with hands clasped at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

---

## Batch 2: Faisal, Tariq, Lama and Sultan (for the chapter scenes)

These four speak in the story chapters. Until they are painted, the chapter scenes show their cute illustrated busts, which clash with painted Layla.

### Task for Codex, batch 2 (copy this whole subsection into Codex)

> You are working in the `rouissimonir/saudi-game` repository. Check out the branch `art/codex`, creating it from `main` if it does not exist.
> Generate the 16 portraits in the "Batch 2" section of `docs/PORTRAIT_PROMPTS.md` using your image generation tool.
>
> **Order:** generate each character's `_neutral` first, then each of their expressions as an **edit of that neutral image**, never from scratch.
>
> **References:** attach the files named in each section. They are in the repository.
>
> **Output:** PNG, vertical 3:4 portrait (for example 1536x2048, or the largest 3:4 size available), saved to `tools/art/portrait_inbox/` with the exact file names given.
>
> **Check:** look at each image before saving. Regenerate if any of these fail:
> - The face matches the character's neutral.
> - The clothing and colours match the description.
> - The style matches `tools/art/portrait_refs/style_layla_neutral.jpg`.
> - The background is plain flat beige with no objects, text or shadows.
> - The framing is waist-up with the hands visible at the bottom.
> - There are no extra fingers or distorted hands.
>
> **Finish:** commit the 16 PNGs with the message "Add painted portraits for the chapter cast" and push the `art/codex` branch. Do not change any other files.

### `faisal_neutral.png`

**Attach:**
1. `tools/art/portrait_refs/style_layla_neutral.jpg`, the style to match.
2. `public/assets/art/characters/faisal.webp`, a simple 3D toy render of Barista Faisal, for outfit and colours only.

**Prompt:**

> Reference 1 shows the exact art style to match: a semi-realistic painted portrait with soft painterly shading, believable proportions, clean edges, warm golden rim light from the left and a plain flat warm-beige background. Reference 2 is a simple 3D toy render of the character: use it only for outfit and colours, not its toy proportions.
>
> Paint Barista Faisal, a friendly young Saudi barista in his mid-20s, in exactly the style of reference 1. He has warm tan skin, lively brown eyes, thick dark eyebrows, dark-brown hair styled in a neat short quiff, a trimmed short dark beard and moustache, and a relaxed, friendly neutral expression with a faint smile. He wears a teal button-up shirt with the sleeves rolled to the forearms and a brown leather barista apron with a small gold button at the chest. No head covering and no glasses. Modern, warm and culturally accurate.
>
> Composition: vertical 3:4 portrait, waist-up, centred, body turned very slightly to the left, face looking at the viewer, hands resting together in front at the waist. The top of his hair sits about 8% below the top edge, and the frame ends just below the hands. The figure fills most of the frame width.
>
> Lighting: soft warm key light from the upper left with a gentle golden rim light, as at sunset.
>
> Background: completely plain, flat, light warm beige with no texture, objects, text or shadows.

### `faisal_happy.png`

**Attach:** your chosen `faisal_neutral.png`.

**Prompt:**

> Edit the provided image of Barista Faisal. Change only the facial expression to happy: a big, warm, proud grin showing his teeth, cheeks lifted, eyes bright, the look of a barista whose new drink is a hit.
>
> Keep exactly the same: his face and identity, skin tone, quiff hairstyle, beard and moustache, the teal shirt and brown leather apron with the gold button, the pose with hands together at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `faisal_surprised.png`

**Attach:** your chosen `faisal_neutral.png`.

**Prompt:**

> Edit the provided image of Barista Faisal. Change only the facial expression to surprised: eyes wide, eyebrows raised high, mouth open in an excited "oh!", amazed by good news.
>
> Keep exactly the same: his face and identity, skin tone, quiff hairstyle, beard and moustache, the teal shirt and brown leather apron with the gold button, the pose with hands together at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `faisal_worried.png`

**Attach:** your chosen `faisal_neutral.png`.

**Prompt:**

> Edit the provided image of Barista Faisal. Change only the facial expression to worried: eyebrows drawn up and together, eyes uneasy, lips pressed tight with the corners down, nervous about a famous critic visiting.
>
> Keep exactly the same: his face and identity, skin tone, quiff hairstyle, beard and moustache, the teal shirt and brown leather apron with the gold button, the pose with hands together at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `tariq_neutral.png`

**Attach:**
1. `tools/art/portrait_refs/style_layla_neutral.jpg`, the style to match.
2. `public/assets/art/characters/tariq.webp`, a simple 3D toy render of Sheikh Tariq, for outfit and colours only.

**Prompt:**

> Reference 1 shows the exact art style to match: a semi-realistic painted portrait with soft painterly shading, believable proportions, clean edges, warm golden rim light from the left and a plain flat warm-beige background. Reference 2 is a simple 3D toy render of the character: use it only for outfit and colours, not its toy proportions.
>
> Paint Sheikh Tariq Al-Mansour, a dignified Saudi elder in his late 60s and an old friend of the family, in exactly the style of reference 1. He has warm tan skin with gentle age lines, wise, kind brown eyes, grey eyebrows, a full, neatly kept grey-white beard and moustache, and a calm, knowing neutral expression with a slight smile. He wears a crisp white ghutra with a black agal, a white thobe, and a black bisht with fine gold trim. No glasses. Wise, respected and culturally accurate.
>
> Composition: vertical 3:4 portrait, waist-up, centred, body turned very slightly to the right, face looking at the viewer, hands resting together in front at the waist. The top of his ghutra sits about 8% below the top edge, and the frame ends just below the hands. The figure fills most of the frame width.
>
> Lighting: soft warm key light from the upper left with a gentle golden rim light, as at sunset.
>
> Background: completely plain, flat, light warm beige with no texture, objects, text or shadows.

### `tariq_happy.png`

**Attach:** your chosen `tariq_neutral.png`.

**Prompt:**

> Edit the provided image of Sheikh Tariq. Change only the facial expression to happy: a warm, fatherly smile that reaches his eyes, cheeks lifted under the beard, eyes crinkled with pride.
>
> Keep exactly the same: his face and identity, skin tone, grey-white beard and moustache, the white ghutra with the black agal, the white thobe and the black bisht with gold trim, the pose with hands together at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `tariq_surprised.png`

**Attach:** your chosen `tariq_neutral.png`.

**Prompt:**

> Edit the provided image of Sheikh Tariq. Change only the facial expression to surprised: eyebrows raised, eyes widened, mouth slightly open beneath the moustache, genuinely impressed.
>
> Keep exactly the same: his face and identity, skin tone, grey-white beard and moustache, the white ghutra with the black agal, the white thobe and the black bisht with gold trim, the pose with hands together at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `tariq_worried.png`

**Attach:** your chosen `tariq_neutral.png`.

**Prompt:**

> Edit the provided image of Sheikh Tariq. Change only the facial expression to worried: brows drawn together and up, eyes heavy with concern, mouth set in a thin, troubled line under the beard.
>
> Keep exactly the same: his face and identity, skin tone, grey-white beard and moustache, the white ghutra with the black agal, the white thobe and the black bisht with gold trim, the pose with hands together at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `lama_neutral.png`

**Attach:**
1. `tools/art/portrait_refs/style_layla_neutral.jpg`, the style to match.
2. `public/assets/art/characters/lama.webp`, a simple 3D toy render of Lama, for outfit and colours only.

**Prompt:**

> Reference 1 shows the exact art style to match: a semi-realistic painted portrait with soft painterly shading, believable proportions, clean edges, warm golden rim light from the left and a plain flat warm-beige background. Reference 2 is a simple 3D toy render of the character: use it only for outfit and colours, not its toy proportions.
>
> Paint Lama, a stylish Saudi lifestyle and café critic in her late 20s, in exactly the style of reference 1. She has warm beige skin, expressive dark-brown eyes with defined eyebrows and long lashes, rosy lips, and a poised, confident neutral expression with a slight, evaluating smile. She wears a coral silk hijab with a thin gold trim that fully covers her hair, ears and neck, a plum abaya with gold edging, small gold earrings and a small gold brooch. No glasses and no visible hair. Elegant, modern and culturally accurate.
>
> Composition: vertical 3:4 portrait, waist-up, centred, body turned very slightly to the left, face looking at the viewer, hands resting together in front at the waist. The top of her hijab sits about 8% below the top edge, and the frame ends just below the hands. The figure fills most of the frame width.
>
> Lighting: soft warm key light from the upper left with a gentle golden rim light, as at sunset.
>
> Background: completely plain, flat, light warm beige with no texture, objects, text or shadows.

### `lama_happy.png`

**Attach:** your chosen `lama_neutral.png`.

**Prompt:**

> Edit the provided image of Lama. Change only the facial expression to happy: a delighted, open smile showing a little of her teeth, eyes sparkling, as if she has just tasted the best coffee of her life.
>
> Keep exactly the same: her face and identity, skin tone, the coral silk hijab with gold trim, the plum abaya with gold edging, the gold earrings and brooch, the pose with hands together at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `lama_surprised.png`

**Attach:** your chosen `lama_neutral.png`.

**Prompt:**

> Edit the provided image of Lama. Change only the facial expression to surprised: eyebrows raised high, eyes wide, lips parted in an impressed "oh", pleasantly astonished.
>
> Keep exactly the same: her face and identity, skin tone, the coral silk hijab with gold trim, the plum abaya with gold edging, the gold earrings and brooch, the pose with hands together at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `lama_worried.png`

**Attach:** your chosen `lama_neutral.png`.

**Prompt:**

> Edit the provided image of Lama. Change only the facial expression to worried: brows drawn together and up, eyes doubtful, lips pressed with the corners slightly down, unsure and hesitant.
>
> Keep exactly the same: her face and identity, skin tone, the coral silk hijab with gold trim, the plum abaya with gold edging, the gold earrings and brooch, the pose with hands together at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `sultan_neutral.png`

**Attach:**
1. `tools/art/portrait_refs/style_layla_neutral.jpg`, the style to match.
2. `public/assets/art/characters/sultan.webp`, a simple 3D toy render of Sultan Al-Diriyah, for outfit and colours only.

**Prompt:**

> Reference 1 shows the exact art style to match: a semi-realistic painted portrait with soft painterly shading, believable proportions, clean edges, warm golden rim light from the left and a plain flat warm-beige background. Reference 2 is a simple 3D toy render of the character: use it only for outfit and colours, not its toy proportions.
>
> Paint Sultan Al-Diriyah, a stately Saudi patron of heritage in his mid-50s, in exactly the style of reference 1. He has warm tan skin, deep dark eyes, strong dark eyebrows, a full dark beard with two small grey streaks and a dark moustache, and a composed, noble neutral expression. He wears a red-and-white checked shemagh with a black agal, a white thobe, a brown bisht with heavy gold embroidered trim, and a round gold medallion on a chain. No glasses. Regal, generous and culturally accurate.
>
> Composition: vertical 3:4 portrait, waist-up, centred, body turned very slightly to the right, face looking at the viewer, hands resting together in front at the waist. The top of his shemagh sits about 8% below the top edge, and the frame ends just below the hands. The figure fills most of the frame width.
>
> Lighting: soft warm key light from the upper left with a gentle golden rim light, as at sunset.
>
> Background: completely plain, flat, light warm beige with no texture, objects, text or shadows.

### `sultan_happy.png`

**Attach:** your chosen `sultan_neutral.png`.

**Prompt:**

> Edit the provided image of Sultan Al-Diriyah. Change only the facial expression to happy: a broad, generous smile under the beard, eyes warm and proud, the look of a host honouring his guests.
>
> Keep exactly the same: his face and identity, skin tone, beard with the grey streaks, the red-and-white shemagh with the black agal, the white thobe, the brown bisht with gold trim and the gold medallion, the pose with hands together at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `sultan_surprised.png`

**Attach:** your chosen `sultan_neutral.png`.

**Prompt:**

> Edit the provided image of Sultan Al-Diriyah. Change only the facial expression to surprised: eyebrows raised, eyes widened, lips parted beneath the moustache, impressed and intrigued.
>
> Keep exactly the same: his face and identity, skin tone, beard with the grey streaks, the red-and-white shemagh with the black agal, the white thobe, the brown bisht with gold trim and the gold medallion, the pose with hands together at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

### `sultan_worried.png`

**Attach:** your chosen `sultan_neutral.png`.

**Prompt:**

> Edit the provided image of Sultan Al-Diriyah. Change only the facial expression to worried: brows furrowed and drawn up, eyes grave with concern, mouth tight beneath the beard.
>
> Keep exactly the same: his face and identity, skin tone, beard with the grey streaks, the red-and-white shemagh with the black agal, the white thobe, the brown bisht with gold trim and the gold medallion, the pose with hands together at the waist, the framing, crop and position in the frame, the semi-realistic painted style, the warm golden rim light, and the plain flat warm-beige background. Keep the 3:4 vertical aspect ratio. Match the original seamlessly.

---

## Without Codex (ChatGPT or another tool by hand)

1. Use the same prompts and attachments, in the same order. Neutral first, then edit it for each expression.
2. Download each result as PNG.
3. Upload the files to `tools/art/portrait_inbox/` on the `feature/illustrated-portraits` branch with the exact names above. On GitHub: open the branch, choose Add file, then Upload files.

## After the images arrive

Claude cuts out the backdrop and installs each portrait:
- `python3 tools/art/cutout_portrait.py tools/art/portrait_inbox/<name>.png public/assets/art/story/<name>.png`
- then `python3 tools/art/to_webp.py`

It also adds the new expressions to `EXPRESSIONS` in `src/components/story/ScenePlayer.tsx`, then checks the prologue in the browser.
