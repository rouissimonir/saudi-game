# Story portrait prompts (for Codex or any image tool)

Everything needed to paint the remaining story portraits so they match painted Layla. Each prompt below is complete
on its own: copy it as-is. Art direction background is in `docs/ASSETS.md`, section 3c.

---

## Task for Codex (copy this whole section into Codex)

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

## Without Codex (ChatGPT or another tool by hand)

1. Use the same prompts and attachments, in the same order. Neutral first, then edit it for each expression.
2. Download each result as PNG.
3. Upload the files to `tools/art/portrait_inbox/` on the `feature/illustrated-portraits` branch with the exact names above. On GitHub: open the branch, choose Add file, then Upload files.

## After the images arrive

Claude cuts out the backdrop and installs each portrait:
- `python3 tools/art/cutout_portrait.py tools/art/portrait_inbox/<name>.png public/assets/art/story/<name>.png`
- then `python3 tools/art/to_webp.py`

It also adds the new expressions to `EXPRESSIONS` in `src/components/story/ScenePlayer.tsx`, then checks the prologue in the browser.
