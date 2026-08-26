# Home Learning

Parent-first home learning packs for English Key Stage 1, starting with Year 1 maths.

You read a short briefing on how school teaches an idea now. Then you get one 10–15 minute activity that uses things already in the house.

## First slice

- England, KS1, Year 1 maths
- Ten topics, including the ready-to-progress spine plus halves, coins and time
- Two stages on every topic: parent briefing, then home pack
- Content stays `draft` until a human has reviewed the method

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run validate:content   # every topic must satisfy the content model
npm run build
```

## Project map

| Path | What it is |
|---|---|
| `docs/FRAMEWORK.md` | How we build, and what “done” means |
| `docs/DEFERRED.md` | Ideas we are deliberately not building yet |
| `docs/CONTENT_MODEL.md` | Rules for a topic pack |
| `src/content/england/ks1/year-1/maths/` | The first-slice topics |
| `src/app` | Parent-facing reader |

## Licence note

Curriculum wording is adapted from Crown copyright material published by the Department for Education and licensed under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). This project is not affiliated with the DfE, NCETM, or Oak National Academy.
