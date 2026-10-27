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
```

Both scripts use fresh browser contexts and exit nonzero on a failure. To use a compatible local Chromium executable instead of Playwright's browser, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its absolute path. The transfer check simulates a denied clipboard and checks text selection, then delays decompression and changes the input to check that the old code cannot be confirmed.
