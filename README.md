# Home Learning

Parent-first home learning packs for English Key Stage 1, starting with Year 1 maths.

You read a short briefing on how school teaches an idea now. Then you get one 10–15 minute activity that uses things already in the house.

## First slice

- England, KS1, Year 1 maths
- Thirteen topics, including the ready-to-progress spine plus halves, quarters, coins, time, number words, and comparing length
- Two stages on every topic: parent briefing, then home pack
- Content stays `draft` until a human has reviewed the method
- One proof-of-concept parent video (`Number facts within 10`) on `/for-schools` — an AI voice reading the written pack, not a child lesson

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run validate:content   # every topic must satisfy the content model
npm run judge:lessons      # held-out second reader on packs, then compiled video scripts
npm run build              # static export into /out
npm run preview            # serve /out locally
```

## GitHub Pages

The app is a static export so it can run on GitHub Pages.

Expected URL after the first successful deploy:

https://jamiefuller320.github.io/Home_learning/

One-time repo setup:

1. In the repo, open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Merge to `main` (that publishes automatically), or run **Deploy to GitHub Pages** from the Actions tab.

The workflow builds with `GITHUB_PAGES=true` so asset paths include the `/Home_learning` project prefix. `.nojekyll` is included so Pages does not ignore the `_next` folder.

To preview that prefix locally:

```bash
npm run preview:pages
```

Then open http://localhost:4173/Home_learning/

## Parent-video proof of concept

The `/for-schools` page and the Number facts within 10 topic can show a generated parent briefing. The voice reads short beats (punctuation plus silence). Slides reuse one adult guide plus ten-frame and part–whole pictures.

```bash
# Needs FAL_KEY, Chrome, and ffmpeg. Does not invent method.
npm run script:parent-video -- counting-within-100   # readable script + spoken-delivery checks
npm run rehearse:parent-video -- counting-within-100 # TTS-only + pace eval
npm run render:parent-video -- counting-within-100   # full film; gated on rehearsal
```

Read the compiled briefing on **Maintainer → Video script**, or dump files under `inbox/parent-video/<id>/`. Fix awkward wording in the topic pack, not in the dump.

## Project map

| Path | What it is |
|---|---|
| `docs/FRAMEWORK.md` | How we build, and what “done” means |
| `docs/DEFERRED.md` | Ideas we are deliberately not building yet |
| `docs/CONTENT_MODEL.md` | Rules for a topic pack |
| `src/content/england/ks1/year-1/maths/` | The first-slice topics |
| `src/app` | Parent-facing reader |
| `/language` | Language-improvement log (unclear phrases → team inbox → rewrite) |

## Licence note

Curriculum wording is adapted from Crown copyright material published by the Department for Education and licensed under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). This project is not affiliated with the DfE, NCETM, or Oak National Academy.
