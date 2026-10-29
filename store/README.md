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

## Sizes

`<lang>/01.jpg` to `05.jpg` are 1290x2796 (6.7" and 6.9" iPhones). `<lang>/iphone-6.3/` holds the same shots at 1179x2556, the size App Store Connect's 6.1" / 6.3" slot accepts (`python3 tools/store/resize_for_6_3.py`). Upload the set whose size the slot lists.

## Header artwork (optional)

App Store Connect's optional "Header" slot takes wide landscape art (3840x1646 or 5244x2950 at the time of writing; read the sizes printed under the upload box). `node tools/store/make_header.cjs` writes `header_en_3840x1646.png` and `header_ar_3840x1646.png` (brand panel plus three painted places, mirrored for Arabic). The PNGs (about 5 MB each) are not committed; regenerate them. Check the slot's Preview and "Explore templates", because Apple may crop the header on some devices. Upload the Arabic file to the Arabic localization and the English file to English (U.S.).

## Regenerating

The screens are captured from the real game, so re-run after any visible change.

```bash
npm run build && (cd dist && python3 -m http.server 4173) &        # serve a build
node tools/store/capture.cjs en 1,2,3,4,5 http://localhost:4173/ store_raw/
node tools/store/capture.cjs ar 1,2,3,4,5 http://localhost:4173/ store_raw/
node tools/store/compose.cjs store_raw store_out                   # adds the captions and frame
```

`compose.cjs` writes PNGs; `store/screenshots` holds them as JPEG (quality 92) to keep the repository small. Shots 3 to 5 travel through the game's areas the way a player does (a few minutes each). Captions live at the top of `tools/store/compose.cjs`.
