# Codex plan: Qahwa & Majlis

Last updated: 2026-10-27

## Goal and product identity

Build a leading Capacitor iOS merge game around Saudi hospitality: players prepare coffee and treats, welcome guests, personalize a majlis, and see their choices remembered. Aim for the top 10 in a clearly defined App Store category and market without sacrificing that identity. A ranking is an outcome to verify after release, not something source code or automated tests can establish. The exact chart, country, metric, and measurement period still need to be chosen.

The source of truth for the design direction and pacing investigation is [docs/PRODUCT_DIRECTION.md](docs/PRODUCT_DIRECTION.md). Treat competitor rankings and other market claims in older documentation as historical and unverified until independently rechecked.

## Work completed so far

- **Hospitality and continuity:** Faisal's untimed coffee tasting lets players prepare trays, choose a coffee-corner style, and host Faisal and Noura. Their later guest orders can record a memory of the chosen tray, with the earned order reward displayed in the memory dialog. The corner and reactions can be revisited; after welcoming the guests, the scene is brought into view with its dialogue. The optional Taif rose welcome adds a regional hospitality choice and an enduring memory.
- **A personal majlis:** Renovated wings expose selected-style details and family reactions. An optional first-restoration reveal can be revisited without awarding its reward twice. Existing painted scenes, wing artwork, mood fallbacks, and image prefetching were retained when the latest remote main was merged.
- **Clearer first session and goals:** A dismissible merge-and-serve coach precedes the daily login prompt. Guest order and recipe guides show ingredient locations, next merge steps, rewards, pantry retrieval and optional board focus. The board shows the next gathering step from saved progress. A focused guest order resumes after reload and stops being active when served or cleared. A focused tasting recipe or Taif welcome also resumes, shows board ingredient progress and a ready-to-prepare action, and stops being active once prepared or cleared; preparing an unrelated tray leaves it intact.
- **Board recovery:** Players can undo an eligible sale for a short period; the full-board prompt offers an order-aware spare merge when available and guidance otherwise. A board-view control brings the grid into view. Empty and locked tiles allow vertical page scrolling, while movable items retain touch dragging. Reduced-motion mode suppresses merge flashes and movement while retaining a static reward label.
- **Reliability and native packaging:** Save validation, including guest-order fields and rewards, backup recovery, transfer codes, storage-failure messaging, and wheel payout persistence have automated coverage. A failed save also offers an explicit retry and a transfer-code option. Editing a transfer code cancels any pending validation of the previous input; clipboard failure offers manual-copy guidance and transfer fields permit text selection. The Capacitor iOS project is present with haptics and a local web bundle; the bundle audit checks that built files match, flags unexpected leftover files, and checks that no remote server URL is configured.
- **Pacing research:** Deterministic economy simulations compare unboosted and adaptive-boost strategies. They highlight substantial later-area effort and energy waits, but are not estimates of human enjoyment or proof of appropriate balance. See the product-direction document for assumptions and results.

## Next priorities

1. **Native confidence.** On macOS, build and install the current iOS project in Xcode. Exercise fresh install, update from an older save, offline launch, interruption during a merge and a pour, background/resume, rotation, safe areas, small and large iPhones, VoiceOver, reduced motion, sound, and haptics. Confirm progress survives termination and relaunch; investigate any loss before release. Record device, iOS version, build commit, steps, and result.
2. **Observe the first gathering.** Use the [iPhone playtest protocol](docs/PLAYTEST_IPHONE.md) to run moderated sessions with Arabic-speaking Saudi players on real devices. Watch the first merge, first order, restoration, tasting and return visit without leading participants. Record hesitation, comprehension, emotional reactions, repeated actions, and whether they notice the guest memories and personalized details. Include Saudi cultural and dialect review of the Arabic, Taif references and visual details.
3. **Make pacing decisions from evidence.** Measure actions and time to the first order, wing, gathering and later-area milestones, alongside voluntary return visits and energy waits. Compare with the simulator and player feedback before changing order requirements, energy costs or rewards. Check that the boost tradeoff is understandable and does not create an unfun stall.
4. **Improve the strongest identity moments.** Use playtest findings to deepen the welcome, the visible use of the player's majlis, and relationships that remember meaningful choices. Prototype improvements within the existing hospitality loop; validate discoverability and appeal before expanding content or adding new systems.
5. **Prepare a responsible release.** Decide the target chart and market, establish consent-aware analytics and baseline metrics, complete accessibility and native QA, and validate store assets and localization. Keep fictional showcase entries clearly fictional. Do not enable real-money purchases until a real purchase and restore flow is implemented and verified. Avoid expanding timed tracks or social competition until the single-player loop earns repeat play and live operations can be supported.
6. **Evaluate the outcome.** After an appropriate release and sufficient player data, review retention, player feedback, technical stability, accessibility and independently sourced chart results for the agreed market and category. A top-10 claim requires matching, current evidence; this objective remains open until the evidence supports it.

## Verification and current limits

- The merged build passed `npm run lint`, `npm run build`, and 138 automated tests. After the latest board-recovery change, a simulated full board was shown to free a space through the new action; the iOS asset audit reported 339 matching build files.
- Browser checks covered a small portrait viewport and a short landscape viewport, including board visibility and merging; simulated touch checks covered scrolling from an empty tile and merging movable items. A simulated storage failure kept its warning until an explicit retry successfully saved a merge, which survived reload. Browser checks verified that a focused tasting recipe resumes after reload, stays cleared after cancellation, becomes ready after a missing ingredient is retrieved from the pantry, and survives preparation of a different tray and reload. A browser check verified the corner and welcome prompts persist across reload; a 320 × 568 viewport showed the gathering scene and dialogue together after welcoming guests. A reproducible [transfer-code browser check](tools/e2e/README.md) confirms that a denied clipboard shows manual-copy help and an outdated result cannot be confirmed. An order-guide browser check also verified that a focused guest order resumes and cancellation persists. The phone smoke script passed its listed screen checks without browser errors; an injected failure produced a nonzero exit code. A guest-memory browser check verified that VIP rewards remain visible and match the saved coin and star changes after the toast expires. A phone-browser interruption check covers the pour reset, immediate restart, rewarded completion, and free practice; native lifecycle testing remains needed. A reduced-motion browser check verified the static merge label and suppressed flash. These are browser simulations, not iOS device tests.
- The iOS project has been synced, but an Xcode build, real-device lifecycle tests, cultural review, human playtests, release metrics, and ranking evidence remain outstanding. No top-10 position is claimed.
- Check Git status for the current local and remote branch state. Continue recording meaningful work and validation here; keep planned, implemented, and verified work distinct.

## Useful commands

```sh
npm run lint
npm test
npm run build
npx cap sync ios
npm run check:ios-assets
```

The asset audit checks the synced local bundle; it does not compile or run the native iOS application.
