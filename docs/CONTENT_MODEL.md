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
| `activity` | Exactly one activity. Start with an explicit set-up step. Add a `numberLine` picture when “left / middle / right” is the idea |
| `check` | Three tiny probes: `prompt`, `looksLike`, `notYet`, and a required `nudge` (“Try this”) that says what to try next |
| `stretch` | Optional extra if the child is still keen |
| `stopRule` | When to stop, including “this is becoming a row” |

## Time budgets

- `parentMinutes`: 5–8
- `homeMinutes`: 10–15

If you cannot fit the idea into those budgets, split the topic.

## Optional parent video

`parentVideo` is a concise parent briefing compiled from the pack, not a second lesson and not a full reading of the page.

| Field | Rules |
|---|---|
| `src` | Path under `public/`, usually `/videos/<id>-parent-briefing.mp4` |
| `caption` | Say that the page is the source for live steps; the film is the method + task outline |

Do not invent method in the film. Compile spoken **beats** from existing topic fields (`src/lib/parent-video-script.ts`). Shape the film as: short open → concise teaching (plain English + school method + one mix-up) → outline of tonight’s activity and evaluation criteria → handoff to the written page (and a YouTube-description link reminder). Leave `sayThis`, `avoidThis`, and full step lists on the page so the parent can pause there beside the child.

Write beats for the ear (punctuation, short clips, silence between thoughts). Do not dump a whole page paragraph into one TTS call. Recheck the compiled script with the same held-out judge as the page (`npm run judge:lessons`).

Lesson pictures are ours: a recurring adult guide, a ten-frame, and a part–whole diagram. They must show a fact already in the pack. Do not generate classroom footage, children, or a cartoon teacher.

```bash
# Needs FAL_KEY (Kokoro British voice) plus Chrome and ffmpeg
npm run render:parent-video -- facts-within-10
```

Re-render after a language change.

## Review status

`draft` means “structurally complete, not yet teacher-checked”. The app shows that badge on purpose. Do not mark `reviewed` without a named review in the topic file comment or a later review log.
