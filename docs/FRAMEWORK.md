# Development framework

This is the operating system for the project. New work should fit a phase, follow the principles, and leave a note in the deferred repository if it is deliberately not being done now.

## Product thesis

Parents of Key Stage 1 children already want to help. What they lack is the **current school method**, in plain language, just before a short activity they can actually finish.

The product is therefore two stages, always in this order:

1. **Teach the parent the idea** — what it is, how school typically teaches it, the words to use, and the mistakes to avoid.
2. **A small home pack** — one 10–15 minute activity using household objects, plus a tiny check that the child can show understanding.

We are not building a child-facing lesson platform, a homework-doer, or a scraper of school websites.

## Non-negotiable principles

1. **Parent first.** If a tired adult cannot finish the briefing on a phone after work, it is too long.
2. **Method over answers.** We coach the parent to prompt, not to supply the answer.
3. **Household resources only.** No printer required. No worksheet pack in the first slice.
4. **Official sources, not invented curricula.** England National Curriculum programmes of study, DfE / NCETM ready-to-progress criteria, and later Oak National Academy. Attribute Open Government Licence material.
5. **Do not teach a rival phonics or maths scheme.** Align to public outcomes. Use scheme names as optional tags later, never scrape or reproduce commercial worksheets.
6. **A wrong method is worse than no help.** Content ships as `draft` until a human has reviewed it.
7. **Short and stoppable.** Every home pack has a stop rule. Fifteen focused minutes beats a battle.
8. **Do not widen gaps.** Language stays everyday. Activities work in a kitchen, on a walk, or on a sofa. No assumption of quiet study space or extra kit.
9. **England KS1 first.** Other nations, key stages, and subjects wait in `docs/DEFERRED.md`.
10. **Remap, do not hard-wire 2014.** The 2014 National Curriculum is current; a replacement is due for first teaching in 2028. Topics carry source links and outcome codes so they can be remapped.

## Content pipeline

```
source material → topic map → draft pack → human review → published
                              ↑
                     language log / send to the team inbox
```

If a sentence is hard to picture, the parent (or we) flags it at the end of Stage 1 or Stage 2. Testers send the note with no GitHub account. It lands in `language_notes` for **review**, not as an automatic rewrite.

A note is a signal that a tired parent could not picture something. We do not paste the suggested sentence. Treat each open row as:

1. **Find the stuck picture.** Which words failed, in which sentence?
2. **Keep the school method.** If the suggestion would teach a rival method, drop a needed term, or make the maths vaguer, skip it and write why on the row (`npx tsx scripts/language-notes.ts decline <id> <reason>`).
3. **Rewrite in everyday words.** Use the note’s *intent*. Use their wording only when it is already a sentence a tired parent would say.
4. **Close the row with a note.** `done <id> <what we changed>` after the topic file changes; `declined <id> <why we skipped>`. The reason lives on the row (`review_note`), not only in the PR.

Needed classroom words (for example *number bond*, once explained) stay. Jargon we never needed (*layer*, *how the fact is built*) goes.

| Stage | What happens | Exit test |
|---|---|---|
| Source | Capture statutory bullets and ready-to-progress codes, with URLs | Every topic cites at least one official source |
| Topic map | One idea a parent can hold in their head | Title is something a parent would say out loud |
| Draft pack | Write parent briefing + home pack against the content model | `npm run validate:content` passes |
| Human review | Teacher or subject-specialist reads for method accuracy | `reviewStatus` becomes `reviewed` |
| Published | Topic appears in the parent app | Parent can finish briefing and start the activity the same evening |

A topic is **not done** when the page renders. It is done when a parent can explain the idea in their own words and run the activity without a fight.

### Definition of done for one topic

- Mapped to statutory outcomes and, where they exist, ready-to-progress codes
- Parent briefing covers: plain English, how school teaches it, say this, avoid this, misconceptions
- Home pack covers: setup, one activity, three-item check, stretch, stop rule
- Household items only
- Estimated times filled in (`parentMinutes` ≤ 8, `homeMinutes` ≤ 15)
- Sources attributed
- `reviewStatus` is honest (`draft` until reviewed)

## Architecture

Content is the product. The app is a thin reader.

```
src/content/schema.ts          typed contract for every topic
src/content/england/...        topic files, one idea each
scripts/validate-content.ts    fails the build-quality gate if a pack is incomplete
src/app                        parent-facing Next.js reader
src/lib/progress.ts            local-only “I have got this” state
```

Later ingestion (Oak API, a new National Curriculum) should write into the same schema. Do not grow a second content format.

### Technical choices for the first slice

| Choice | Why |
|---|---|
| Next.js App Router + TypeScript, static export | Room to grow routes, and it can ship to GitHub Pages with no server |
| Topics as TypeScript modules | Typed, reviewable, no CMS yet |
| localStorage progress | No accounts, no child data |
| No auth, no analytics, no child UI | Smaller safeguarding surface |

## Phases

### Phase 0 — Framework (this work)

- Write this document and the deferred-ideas repository
- Freeze the content model
- Stand up the parent reader

### Phase 1 — First slice: Year 1 maths

Ten topics covering the Year 1 ready-to-progress spine plus the home topics parents ask about most (halves, coins, time).

Success looks like:

- A parent can open the app, pick a topic, finish the briefing, and run the pack
- Content validates
- Every topic is still honest about `draft` vs `reviewed`

### Phase 2 — Prove the slice

- Human review of the ten packs
- Try them with a small group of Year 1 families
- Watch for: briefing too long, activity needs kit we promised not to need, method clashes with a common school scheme

### Phase 3 — Year 2 maths

Same model. Do not add new product surfaces until Year 1 packs have been reviewed.

### Phase 4 — Phonics / early reading track

Separate spine. Must align to the child’s school phonics programme, not invent a fifth one. See deferred ideas.

### Later phases

KS2 maths, science packs, school-scheme tags, Oak import, 2028 curriculum remap. All listed in `docs/DEFERRED.md`.

## What we will not do in Phase 1

- Crawl school websites
- Reproduce White Rose, Power Maths, Read Write Inc, or Little Wandle materials
- Build child logins or quizzes that store pupil data
- Cover Wales, Scotland, or Northern Ireland
- Auto-generate packs from an LLM without the schema and a human review step

## How work gets added

1. If it serves Phase 1, implement it against this framework.
2. If it is a good idea for later, add a dated entry to `docs/DEFERRED.md` instead of building it.
3. Promoting a deferred idea means moving it into a phase above and writing a short “why now” note here.

## Source attribution

National Curriculum programmes of study and DfE primary maths guidance are Crown copyright, licensed under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). Packs that quote or adapt them should keep the source list on the topic. Do not claim endorsement by the Department for Education, NCETM, or Oak National Academy.
