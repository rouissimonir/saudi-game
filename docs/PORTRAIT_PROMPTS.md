# Story portrait prompts

Copy-paste prompts for painting the remaining story portraits in any image tool that accepts reference images:
ChatGPT/Codex image generation, Gemini, or the ElevenLabs flows. Art direction lives in `docs/ASSETS.md`, section 3c.

## How to use

1. For each character, attach **two reference images**:
   - **Style:** Layla's painted portrait, so every character matches her look.
     https://raw.githubusercontent.com/rouissimonir/saudi-game/feature/illustrated-portraits/public/assets/art/story/layla_neutral.webp
   - **Character:** that character's 3D render, for outfit and colours.
     - Noura: https://raw.githubusercontent.com/rouissimonir/saudi-game/main/public/assets/art/story/noura_neutral.webp
     - Rashid: https://raw.githubusercontent.com/rouissimonir/saudi-game/main/public/assets/art/story/rashid_neutral.webp
2. Generate the **neutral** first and keep the best one.
3. Make each expression by **editing that neutral image**, not from scratch, so the face stays the same.
4. Ask for a **vertical 3:4 image** (portrait), as large as the tool allows.
5. Upload the results to `tools/art/portrait_inbox/` on the `feature/illustrated-portraits` branch.
   - On GitHub: open the branch, choose Add file, then Upload files.
   - Name them `<character>_<expression>.png`, for example `noura_happy.png`.

I then cut out the backdrop (`tools/art/cutout_portrait.py`), convert them and put them in the prologue.

## Images still needed

| File | Start from |
|---|---|
| `layla_angry.png` | Layla's painted neutral (style link above) |
| `noura_neutral.png` | the two references |
| `noura_happy.png`, `noura_surprised.png`, `noura_worried.png` | your chosen `noura_neutral` |
| `rashid_neutral.png` | the two references |
| `rashid_angry.png`, `rashid_surprised.png` | your chosen `rashid_neutral` |

## Neutral prompts

**Noura**

> Reference 1 is the art style to match exactly: a semi-realistic painted portrait with soft painterly shading, warm golden rim light from the left and a plain flat warm-beige background. Reference 2 is a simple 3D toy render of Grandma Noura: use it only for her outfit and colours, not its toy proportions.
>
> Paint Grandma Noura in the style of reference 1. She is a Saudi grandmother in her early 70s with warm light-tan skin, a kind, softly lined face, warm dark-brown eyes behind round thin gold-rimmed glasses, a little soft white hair at the forehead, and a calm, affectionate expression with a faint smile. She wears a rose-red shayla over her head and shoulders with a thin gold band across the forehead, and a black abaya with thin gold trim. Modest and culturally accurate.
>
> Vertical 3:4, waist-up, centred, hands resting together in front at the waist, top of the scarf about 8% below the top edge, frame ending just below the hands. Plain flat light warm-beige background with no objects or shadows.

**Rashid**

> Reference 1 is the art style to match exactly: a semi-realistic painted portrait with soft painterly shading, warm golden rim light from the left and a plain flat warm-beige background. Reference 2 is a simple 3D toy render of Rashid: use it only for his outfit and colours, not its toy proportions.
>
> Paint Rashid in the style of reference 1. He is a Saudi businessman in his early 40s with warm medium-tan skin, sharp dark-brown eyes, thick dark eyebrows, a neatly trimmed black moustache and short goatee, and a composed, slightly smug expression with a faint half-smile. He wears a crisp white ghutra with a black agal, a white thobe, a charcoal-grey bisht with thin silver trim, and a gold wristwatch. Polished, wealthy and culturally accurate.
>
> Vertical 3:4, waist-up, centred, hands resting together in front at the waist, top of the ghutra about 8% below the top edge, frame ending just below the hands. Plain flat light warm-beige background with no objects or shadows.

## Expression edits

Attach the chosen neutral image and use this, swapping in the expression line:

> Edit the provided image. Change only the facial expression to: **[expression]**. Keep exactly the same: the face and identity, skin tone, clothing and colours, pose, framing and crop, painting style, lighting and the plain beige background. Keep the 3:4 aspect ratio.

| Expression | Line to paste |
|---|---|
| happy | a warm, open smile with cheeks lifted and eyes bright with joy |
| surprised | eyes wide open, eyebrows raised high, lips parted in a small "oh" |
| worried | inner eyebrows drawn up and together, uneasy eyes, lips pressed with corners slightly down |
| angry (Layla) | fierce, defiant anger: brows lowered in a firm frown, eyes narrowed, jaw set, lips in a tight line; strong but dignified |
| angry (Rashid) | cold anger: brows drawn down, eyes narrowed in contempt, a tight scowl under the moustache |
