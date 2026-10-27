# Art archive (not shipped)

Files that are kept for reference but are **not** part of the game bundle, so they do not add to the app's download or the iOS build. Anything under `public/` is copied into the app; this folder is not.

- `illustrated_portraits/`: an earlier set of expression portraits (Noura, Faisal, Tariq, Lama, Sultan) and its 1.5 MB source sheets. Replaced by the painted portraits in `public/assets/art/story/`. `tools/export_illustrated_portraits.cjs` writes here.
- `props/`: loose Blender prop renders (beans, chest, dallah, dates, finjan, mabkhara, v60) that nothing in the game loads. The board icons live in `public/assets/art/items/`.

To bring a file back into the game, move it under `public/assets/art/` and reference it from the code.
