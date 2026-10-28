# Phone browser checks

These Playwright checks simulate a phone browser; they do not replace an Xcode build or real-iPhone testing.

Install project dependencies and a Playwright Chromium browser once:

```sh
npm ci
npx playwright install chromium
```

Build and start the preview in one terminal:

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

In another terminal, run the broader smoke test and the transfer-code race check. If the preview selected a different port, pass its printed URL after `--`:

```sh
npm run test:phone:smoke -- http://127.0.0.1:4173/
npm run test:phone:transfer -- http://127.0.0.1:4173/
npm run test:phone:pour -- http://127.0.0.1:4173/
npm run test:phone:gathering -- http://127.0.0.1:4173/
npm run test:phone:restoration -- http://127.0.0.1:4173/
npm run test:phone:guest-majlis -- http://127.0.0.1:4173/
npm run test:phone:restored-places -- http://127.0.0.1:4173/
npm run test:phone:board-layout -- http://127.0.0.1:4173/
```

These scripts use fresh browser contexts and exit nonzero on a failure. To use a compatible local Chromium executable instead of Playwright's browser, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its absolute path. The transfer check simulates a denied clipboard and checks text selection, then delays decompression and changes the input to check that the old code cannot be confirmed.

The pour check simulates a window interruption, verifies no reward or chance is consumed, then checks an immediate restart, completed pour and free practice. It does not simulate native iOS lifecycle events.

The gathering check uses a fresh game and plays one specific route through the first order and gathering without modifying the save; generator outcomes vary, and the result does not measure player enjoyment or native iOS performance.

The restoration check starts from a fresh game, selects a free style, restores a wing, checks the visible family reaction and verifies saved progress. It is not a cultural or usability review.

The guest Majlis check uses a synthetic save to verify that the order guide follows the saved wing style after reload and does not show another guest's reaction.

The restored-places check uses a synthetic completed area, travels through the UI, and checks that the selected styles and artwork remain available after reload without granting a second reward. Set `RESTORED_PLACES_SCREENSHOT` to a file path to capture the phone viewport for visual review.

The board-layout check verifies that the guest dock, full board and initial coach are visible at two iPhone 13 Pro-width portrait viewports, and that the guest dock and board remain visible after the coach and after a touch merge and guest order. It also checks the board and guest dock at 844 × 390 landscape. It does not simulate real Safari chrome or safe areas.

For the optional accessibility audit, install `axe-core` without saving it to the project (`npm install --no-save axe-core`), then run `node tools/e2e/a11y.cjs en,ar http://127.0.0.1:4173/`. The audit reports the screens reached and exits nonzero for reported violations or navigation errors. Story choices and event screens depend on the run; inspect the listed screens to see what was covered. Automated checks do not replace device accessibility testing.
