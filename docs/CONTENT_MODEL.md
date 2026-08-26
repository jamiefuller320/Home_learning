# Content model

Every published idea is a **topic**. A topic is one thing a parent can learn and then practise with their child the same day.

Topics live in `src/content/england/ks1/year-1/maths/topics/` and must satisfy `src/content/schema.ts`. Run `npm run validate:content` after any edit.

## Identity

| Field | Rules |
|---|---|
| `id` | Stable, lowercase, hyphenated. Never recycle. |
| `slug` | URL piece. Same stability rule as `id`. |
| `title` | Parent-facing, spoken English. “Number bonds to 10”, not “1NF-1”. |
| `jurisdiction` | `england` for the first slice |
| `keyStage` | `ks1` |
| `year` | `1` |
| `subject` | `maths` |
| `reviewStatus` | `draft` until a human has signed it off |

## Curriculum mapping

| Field | Rules |
|---|---|
| `statutoryOutcomes` | Quoted or closely paraphrased National Curriculum bullets |
| `readyToProgress` | DfE codes where they exist (`1NPV-1`, `1NF-1`, …). Optional for topics that are statutory but not ready-to-progress. |
| `sources` | At least one official URL, plus the licence note |

Do not invent outcome codes. If a topic is a parent-friendly split of a larger bullet, say so in `whyThisMatters`.

## Parent briefing

Keep the whole briefing under about eight minutes of reading. Use short paragraphs. Write as you would say it to a tired parent: no “when they land”, “on the board”, or other classroom shorthand.

| Field | Purpose |
|---|---|
| `inPlainEnglish` | The idea, with no classroom jargon first |
| `howSchoolTeachesIt` | Concrete–pictorial–abstract, part-whole, number lines, and so on, in everyday words |
| `sayThis` | Prompts the parent can read out |
| `avoidThis` | Methods or phrases that clash with current classroom practice |
| `commonMisconceptions` | Child (or parent) mix-ups, why they happen, what to do instead |
| `youAreReadyWhen` | One sentence the parent can test themselves with |

## Home pack

| Field | Purpose |
|---|---|
| `householdItems` | Things already at home. If it is not on this list, the activity cannot need it. Name sizes when kit varies (egg boxes are 6, 10 or 12 holes; you need 10 cells open) |
| `setup` | How to clear a corner of the table |
| `activity` | Exactly one activity. Steps a parent can follow without scrolling back |
| `check` | Three tiny probes: `prompt`, `looksLike`, `notYet` |
| `stretch` | Optional extra if the child is still keen |
| `stopRule` | When to stop, including “this is becoming a row” |

## Time budgets

- `parentMinutes`: 5–8
- `homeMinutes`: 10–15

If you cannot fit the idea into those budgets, split the topic.

## Review status

`draft` means “structurally complete, not yet teacher-checked”. The app shows that badge on purpose. Do not mark `reviewed` without a named review in the topic file comment or a later review log.
