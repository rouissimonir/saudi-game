# Growth plan: toward the Saudi Casual top 10

A top-10 chart position comes from revenue, retention and ratings together. This page records what the latest polish pass added to the game, what each part is for, and what must still happen outside the code. Nothing here is a promise of a chart position.

## Shipped in the polish pass (3 November 2026)

| # | Change | Why it matters | Where |
| --- | --- | --- | --- |
| 1 | Crash recovery screen (and "use previous backup" after a repeat crash) | A render error used to leave a blank page; a crash on launch is the fastest way to lose a player and a review | `src/components/ErrorBoundary.tsx` |
| 2 | Idle hint: after 8 s idle a mergeable pair (or a generator) pulses, for players under 120 merges | First-session stalls are the biggest early churn | `src/App.tsx`, `BoardCell.tsx` |
| 3 | Welcome back: after 20+ min away, energy regained and guests waiting | A reason to feel good about returning | `src/game/welcomeBack.ts` |
| 4 | Achievements: 18 lifetime goals paying gems and coins | Long-term goals beyond daily quests | `src/game/achievements.ts` |
| 5 | First-find card with one-tap claim | Makes collecting visible and rewarding | `src/App.tsx` |
| 6 | Coins and gems count up and bump when they grow | Gains feel earned | `GameChrome.tsx` (`CountUp`) |
| 7 | Quests: Claim all and a "new quests in 5h 12m" timer | Fewer taps, and a return time | `progression.ts`, `ProgressionModals.tsx` |
| 8 | Tidy board | Board congestion is a known friction; groups matching pieces | `src/game/tidyBoard.ts` |
| 9 | Music on/off separate from effects and voices | Common request; keeps voices without the loop | `soundAndHaptics.ts` |
| 10 | Starting a new game now needs a second confirmation | One tap used to erase all progress | `src/App.tsx` |
| 11 | Clean Arabic and English labels (no "(Resume)" mixes) | Polish | `src/App.tsx` |
| 12 | 44 px touch areas for the toolbar, links and modal buttons | Reliable taps on phones | `src/index.css` (`hit-44`) |
| 13 | Energy sheet shows when energy will be full | Tells players when to come back | `progression.ts` |
| 14 | Order cards wrap on 320 px phones | No clipped rewards | `src/App.tsx` |
| 15 | Order-ready ding, light haptic and card bounce | A small reward each time | `soundAndHaptics.ts` |
| 16 | Opt-in reminders (energy full, next daily gift, 3-day comeback), never 22:00 to 08:00 | The strongest retention tool on mobile | `src/game/reminders.ts`, `src/utils/notifications.ts` |
| 17 | Invite a friend (share sheet) with a Hospitality Ambassador achievement | Word of mouth in WhatsApp and Snapchat | `src/utils/share.ts` |
| 18 | One-time App Store rating prompt, off until `VITE_RATE_PROMPT=1` | Ratings drive conversion on the store page | `src/game/ratePrompt.ts` |
| 19 | The serve pill, serve effects, Majlis header and zoom lock (earlier in the same week) | Compact, readable phone UI | see `codex-plan.md` |
| 20 | Browser checks for every item run on GitHub for each pull request and push | Keeps the above from regressing | `.github/workflows/phone-checks.yml` |

## Needs a real iPhone before you rely on it

- **Reminders:** the planning is unit-tested and the ask is browser-tested, but the system permission prompt and delivery need a device. Check: accept the prompt, spend energy, close the app, and see the "energy full" notification arrive; switch reminders off in the menu and confirm nothing arrives.
- **Share sheet:** opens from the menu on a device; today it shares the web link (`INVITE_URL` in `src/utils/share.ts`); change it to the App Store link at launch.
- **Rating prompt:** add `VITE_RATE_PROMPT: '1'` to `env:` in the release build workflow when the app is live on the App Store; it opens the review form for app id `6827965054`.

## Not code, and decisive

1. **Revenue.** Real purchases do not exist yet (see `docs/MONETIZATION_DISCOVERY.md`). Without a verified purchase, restore and fulfillment flow there is no grossing. Decide the first offers, then build and test them in the Apple sandbox on a device.
2. **Arabic review.** All Arabic text and voice lines still need a native Saudi reviewer (`docs/ARABIC_REVIEW.md`). The new texts in this pass (reminders, achievements, prompts) are picked up when you run `npm run review:export`; regenerate the review sheet before it goes to a reviewer (it was not regenerated here, so existing row ids stay stable).
3. **Measurement.** There is no analytics. Decide a privacy-conscious way to measure first-session completion, day-1 and day-7 return and purchase conversion before tuning anything.
4. **App Store page.** Screenshots, preview video, Arabic and English keywords, a privacy policy and support URL. Set `ITSAppUsesNonExemptEncryption` in `Info.plist` only after the owner confirms the encryption declaration, so builds stop waiting at "Missing Compliance".
5. **Playtests.** Moderated first-session sessions with Saudi players on real iPhones, small and large screens (`docs/PRODUCT_DIRECTION.md`).
6. **Content depth.** Chart games keep players with weekly events, new areas and seasonal content. The festival system exists; plan a cadence.
