# Illustrated character portraits

Generated with the built-in `image_gen` tool from the six original assets in the parent `characters` folder. Existing files are preserved. These are optional new assets; existing game image paths are unchanged.

- Noura, Faisal, Tariq, Lama, Sultan: neutral, happy, surprised, worried, angry.
- Ghabga: one neutral gold star medal. The reference is a jury emblem, not a person, so facial expressions do not apply.
- Runtime exports: 512 × 512 transparent WebP, quality 88, alpha quality 100. See `manifest.json` for filenames.
- `sources/`: original generated PNG sheets, retained for future higher-resolution exports. Each portrait sheet has three columns and two rows: neutral, happy, surprised, worried, angry, repeated neutral. The duplicate neutral is not exported.

## Generation prompt set

Common direction: identity-preserving illustration for a polished mobile Hollywood Merge-like merge story game. Warm painterly 2D shading, expressive faces and crisp phone-readable silhouettes. Exact three-column, two-row square sheet, transparent background, six chest-up busts entirely inside their cells, identical frontal pose, scale, face, clothes and lighting. Change only expression in this order: neutral, happy, surprised, worried, angry, neutral. No text, labels, grid lines, background or props. Each original portrait is its character identity reference. Noura's generated sheet is the style and grid reference for the other four people.

Character-specific identity constraints:

- **Noura:** elderly round face, brown eyes, grey fringe, round gold glasses, maroon headscarf, black abaya with gold trim. Preserve her reference face and colors; no redesign.
- **Faisal:** young adult Saudi man, warm tan skin, brown eyes, thick brows, dark brown quiff, trimmed dark beard and moustache, teal shirt, brown leather barista apron with gold button. No scarf or glasses.
- **Tariq:** dignified older Saudi man, tan skin, brown eyes, grey brows, full grey-white beard and moustache, white ghutra with black agal, white thobe, black bisht with gold trim. No glasses.
- **Lama:** young Saudi woman, warm beige skin, dark brown eyes, defined brows, lashes, rosy-red lips, coral silk hijab with thin gold trim, plum abaya with gold edging, small gold earrings and gold brooch. No glasses or visible hair.
- **Sultan:** stately middle-aged Saudi man, tan skin, dark eyes, strong brows, dark full beard with two small grey streaks, dark moustache, red-and-white checked shemagh with black agal, white thobe, brown bisht with heavy gold trim and round gold medallion. No glasses.
- **Ghabga** (single square image): redraw the supplied festival-jury emblem as a polished hand-painted 2D badge. Upright five-point gold star medal, raised round gold center, two green ribbon tails with cream stripes. Preserve proportions and colors, show the entire emblem with transparent padding. Warm highlights, readable at 44px. No human, face, eyes, lettering, extra symbols, background, border, sparkles or external shadow.

## Re-export

`tools/export_illustrated_portraits.cjs` accepts the original generated-images directory and a Sharp module path. It copies generated sources, splits the expression cells, exports WebP, and verifies size and alpha. It does not modify the original reference assets.
