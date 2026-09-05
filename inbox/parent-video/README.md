# Parent video pre-production

Human review sits **after script compile and before full render**.

```bash
npm run script:parent-video -- facts-within-10    # dump script.md + delivery checks
# edit topic pack / add human-notes.md here
npm run rehearse:parent-video -- facts-within-10  # TTS-only + pace eval (needs FAL_KEY)
npm run render:parent-video -- facts-within-10    # full slides + film (gated)
```

| File | Purpose |
|---|---|
| `script.md` | Readable spoken beats for review |
| `script.json` | Machine copy of the compiled script |
| `human-notes.md` | Your listen/read notes (learning-loop input) |
| `rehearsal.md` / `rehearsal-report.json` | Auto audio + delivery results |

Do not treat these dumps as a second lesson authoring path. Fix wording in the topic pack, then re-preview.

UI: open **Maintainer → Video script** (`/maintenance/?tab=script&topic=counting-within-100`) for a colour-coded viewer. `/for-schools/script` is the same viewer for school reviewers. Beat comments go to Supabase `language_notes` (`section = parent-video`) and appear in the maintainer inbox.
