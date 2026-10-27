# Qahwa & Majlis: iPhone playtest protocol

Status: ready to run; no participant results have been collected by this document. Use with [codex-plan.md](../codex-plan.md) and [product direction](PRODUCT_DIRECTION.md).

## Purpose

Find out whether people enjoy the merge-and-hospitality loop, understand what to do without coaching, and feel that the guests and Majlis reflect their choices. Discover what frustrates them and whether Saudi cultural details feel authentic. This is an exploratory usability study, not evidence of ranking, retention, or market size.

## Before recruiting

- Build the current commit on macOS using Xcode and install it on actual iPhones. Record the commit, build number, iOS version and device model. Do not label browser simulation as a device test.
- Recruit a small, varied exploratory group of Arabic-speaking Saudi players, including both people familiar with merge games and people new to them. Include different iPhone sizes and, where participants already use them, accessibility settings. A small group reveals problems but cannot estimate population rates reliably.
- Run sessions in the participant's preferred language. Ask permission before recording audio, video, or collecting a transfer code. Explain that participation is voluntary, the game is being tested rather than the participant, and they may stop or skip a question. Avoid collecting names or contact details in the observation sheet; use participant IDs and store any recordings separately according to the team's retention policy.
- Prepare a fresh-install build and a separate test device or disposable test save for recovery and later-area scenarios. Never reset or replace a participant's real progress. Do not test a transfer or reset with a personal save.
- Use two roles where possible: a moderator and an observer. Set a practical session limit with the participant. Do not require completion if a task is slow, energy is exhausted, or the participant wants to stop.

## First session: let the player lead

Start a fresh game. Say: “Please explore as you normally would. Tell me what you expect and what you are trying to do.” Do not explain the mechanics or point out the gathering. Observe what they choose to do first; let them read, skip, or linger naturally. Only provide a hint if they are stuck or ask for help, and record the exact hint and time before giving it.

| Moment | Observe without prompting | Record |
| --- | --- | --- |
| Start and first merge | Whether the player notices the coach, understands tap or drag, and can see the board. | First merge time; mis-taps or blocked gestures; hint needed. |
| First guest | Whether the player understands the requested items and the serve action. | Time to first served order; visits to the guide; hint needed. |
| Majlis restoration | Whether the player notices the restoration invitation and understands stars and styles. | Time to first wing; whether the scene and selected details are noticed; choice explanation. |
| Tasting | Whether the player discovers it independently, chooses a tray, follows ingredient guidance, and understands items are used. | Discovery time, entry point, trays prepared, any abandonment or confusion, and hint needed. |
| Welcome | Whether the player chooses a corner, welcomes guests, sees their reactions, and understands the reward. | Time to welcome, what they notice unprompted, and whether they revisit the corner. |
| Pacing and board | Notice pauses, energy shortages, boost changes, congestion, accidental actions, and use of pantry or recovery. | Observed issue, elapsed time, context, and the participant's own explanation. |

At the end, ask open questions: “What stood out?”, “What would you want to do next?”, “Was anything confusing or repetitive?”, and “How did the setting and characters feel to you?” Ask what they remember about the trays and guests before showing them again. If they did not discover a feature, offer a short directed task afterward and mark it as **prompted**, not discovered.

## Return, continuity, and device checks

In a separate moderated return session, with consent and the same disposable test save, ask the player to resume without being told where they left off. Observe whether a focused order or recipe is recognized, whether the gathering's next-step prompt helps, and whether the player notices a guest's later memory. An invited return is not a measure of voluntary retention.

Separately, perform native QA on a test save: background and resume during a drag and pour; terminate and relaunch after a merge, tray preparation and reward; rotate during play; check safe areas, offline launch, audio, haptics, VoiceOver and reduced motion. Record expected and observed results and device details. Avoid treating a browser result as proof of native behavior. Save export/import, invalid-code handling and recovery must use disposable saves; verify the confirmation before replacing anything.

For later pacing, use a clearly identified test save in a separate session. Let the player choose boosts, orders and breaks. Note actual energy waits and their reactions; compare against the simulator only after recording differences in the scenario. Do not present simulated minutes as predicted human play time.

## Cultural and language review

Ask Saudi cultural and Arabic-language reviewers to inspect the relevant text, voice, clothing, architecture, food, coffee, oud and Taif rose welcome in context. Record the exact screen, language, concern, proposed change and reviewer rationale. Distinguish an individual preference from a factual or cultural issue, and retain the original wording for comparison. Review the Taif rose perfume as a scent for the room, separate from drinks.

## Observation record

Copy this block for each session; keep free text free of identifying information.

```text
Participant ID / session date:
Build commit / build number / device / iOS / language:
Merge-game familiarity / accessibility settings voluntarily disclosed:
Fresh or test save / session length / consent and recording choice:
First merge time / first order time / first wing time / tasting discovery / welcome time:
Hints given (time, exact hint, situation):
Unprompted choices and notable reactions:
Problems (step, expected, observed, frequency, impact):
Energy waits / boost use / board congestion / interruptions:
What the player remembered and wanted to do next:
Prompted tasks and results, clearly separated:
Technical failures and reproduction steps:
Cultural or language comments (reviewer/context):
Follow-up questions / missing evidence:
```

## Decide what to change

After the sessions, group observations by concrete player problem and distinguish observed behavior from interpretation. For each proposed change, record who encountered it, the trigger, evidence, severity, alternative explanations, and a testable hypothesis. Prioritize lost progress or blocked play, then recurring confusion and frustration, then opportunities to deepen hospitality. Re-test the changed flow with new participants where possible; do not tune the economy or claim retention improvement from a handful of moderated sessions.
