# Opening voice comparison

Use these existing, unmodified recordings to identify which voice or delivery needs attention. A Saudi Arabic speaker should listen and assess natural pronunciation, dialect, acting and whether the recorded words match the on-screen line. Voice names and speech-to-text results do not establish dialect quality. These are the files used in the game, not recordings of the earlier sample whose identity is unknown.

| Speaker | Listen | On-screen Arabic | Casting record |
| --- | --- | --- | --- |
| Narrator | [Opening line](../public/assets/audio/story/pro_narr_1.mp3) | الدرعية… عند الغروب. | Ahmed, labelled Modern Standard Arabic |
| Layla | [Returning to Diriyah](../public/assets/audio/story/pro_layla_1.mp3) | أخيراً رجعت للدرعية! ريحة الطين والنخل… ما تغيّرت أبد. | Nora S, labelled Saudi Natural & Calm |
| Noura | [Welcoming Layla](../public/assets/audio/story/pro_noura_1.mp3) | يا هلا ومرحبا يا ليلى! يا بعد عمري، طوّلتي الغيبة. | Noorah, labelled Saudi Warm & Clear |
| Rashid | [The offer](../public/assets/audio/story/pro_rashid_1.mp3) | مساء الخير. أنا راشد. هالأرض بتصير مجمّع تجاري… وعرضي سخي. | Faisal alotaibi, labelled Warm Saudi Voice |

For each sample, note whether it is understandable, sounds natural for the character, matches the displayed words, and suits the scene. Record the reviewer and date. If it sounds wrong, identify the exact words and whether the issue is the script, the voice, the pronunciation or the emotion. Review the corrected wording and audition replacement takes before regenerating the rest; ensure the voice and generated audio can be used commercially.

The prologue script has not changed since the commit that completed its voice clips, but that does not verify that the generated recordings read it accurately. The source casting data is in [voices.json](../tools/voice/voices.json); the game falls back to a device voice for some separate guest lines if a recording fails, so the voice heard there may differ by phone.
