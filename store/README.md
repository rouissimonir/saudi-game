# App Store assets

## Screenshots (`store/screenshots/<en|ar>/01.jpg` to `05.jpg`)

1290x2796 (iPhone 6.7"), one set per language. Apple accepts this size for the 6.7" and 6.9" slots; Google Play takes the same files for phones.

| # | English caption | Arabic caption | Screen |
|---|---|---|---|
| 1 | Merge. Brew. Serve your guests. | ادمج، حضّر، وأكرم ضيوفك. | The merge board with guest orders |
| 2 | A story you play, not just read. | حكاية تعيشها، مو بس تقراها. | The prologue: Layla and Grandmother Noura |
| 3 | Restore the Majlis, wing by wing. | رمّم المجلس جناحاً بعد جناح. | Taif, half restored, with its wing pictures |
| 4 | Travel across the Kingdom. | سافر عبر أرجاء المملكة. | Riyadh restored at night, ready to travel |
| 5 | Every wing tells its tale. | لكل جناح حكايته. | Al-Khobar wing cards |

**Arabic captions are written by a non-native speaker, like the game's dialect lines: have a native speaker review them before upload.**

## Regenerating

The screens are captured from the real game, so re-run after any visible change.

```bash
npm run build && (cd dist && python3 -m http.server 4173) &        # serve a build
node tools/store/capture.cjs en 1,2,3,4,5 http://localhost:4173/ store_raw/
node tools/store/capture.cjs ar 1,2,3,4,5 http://localhost:4173/ store_raw/
node tools/store/compose.cjs store_raw store_out                   # adds the captions and frame
```

`compose.cjs` writes PNGs; `store/screenshots` holds them as JPEG (quality 92) to keep the repository small. Shots 3 to 5 travel through the game's areas the way a player does (a few minutes each). Captions live at the top of `tools/store/compose.cjs`.
