# Deferred ideas repository

Ideas we are deliberately not building yet. Newest entries go at the top of each section. When an idea is promoted, move it to **Promoted** with the date and the reason.

Status key: `parked` (good, later) · `research` (needs a decision) · `rejected` (we looked; no)

---

## Ingestion and curriculum coverage

| ID | Idea | Status | Why wait | Notes |
|---|---|---|---|---|
| DEF-001 | Scrape every school’s published curriculum | parked | Quality is inconsistent; many pages only name a commercial scheme | School matching should be a tag or teacher code, not a crawler |
| DEF-002 | Ingest Oak National Academy API (units, misconceptions, quizzes, transcripts) | parked | Perfect later source; needs an API key and a mapping into our schema | Do this when we are adding volume, not while proving the parent layer |
| DEF-003 | White Rose / Power Maths / NCETM sequence tags | parked | Parents want “what we are doing this week” | Tag topics (`alignsWith: ["white-rose-y1-aut"]`) without reproducing scheme content |
| DEF-004 | Wales, Scotland, Northern Ireland curricula | parked | Four different systems | England KS1 first. Revisit only after the parent loop works |
| DEF-005 | 2028 National Curriculum remap | parked | Final programmes of study due spring 2027; first teaching Sept 2028 | Keep outcome codes and source URLs so remap is data, not a rewrite |
| DEF-006 | KS2 maths | parked | Natural second key stage | Start after Year 1 and Year 2 packs are reviewed |
| DEF-007 | KS3 / GCSE parent packs | parked | Different product: less parent time, more subject depth | Weak evidence for parent-as-teacher at secondary |
| DEF-008 | Science home investigations | parked | Lovely kitchen-table work; school sequences vary widely | After maths spine |
| DEF-009 | English writing and SPaG at KS1 | parked | Terminology is school-specific; easy to teach a clashing method | Last KS1 academic track |
| DEF-010 | EYFS / Reception bridge | parked | Different statutory framework (EYFS, not National Curriculum) | Useful feeder; do not mix into KS1 schema without a phase field |

## Phonics and reading

| ID | Idea | Status | Why wait | Notes |
|---|---|---|---|---|
| DEF-020 | Phonics parent track | parked | Highest demand after maths, strongest evidence — but must follow the school’s validated SSP | Need a “which programme does your school use?” chooser before content |
| DEF-021 | Daily reading prompts (not phonics instruction) | parked | Shared reading is the best-evidenced home activity | Could be a thin companion to maths rather than a full track |
| DEF-022 | Decodable book lists | parked | Copyright and programme-specific | Point to school/library lists; do not host texts |

## Product surfaces

| ID | Idea | Status | Why wait | Notes |
|---|---|---|---|---|
| DEF-030 | Child-facing mode / games | parked | Changes safeguarding, data, and the product thesis | Parent-first is the wedge |
| DEF-031 | Accounts, class codes, teacher dashboard | parked | Coordination is valuable; identity is expensive | Prove packs anonymously first |
| DEF-032 | Printable PDF packs | parked | First slice is screen + household objects | Add a print stylesheet later; PDF generation after that |
| DEF-033 | Short parent videos | research | Some parents prefer watching; a generated proof of concept now exists | Script from the existing briefing fields so video is a render, not a second authoring path. PoC: `facts-within-10` + `/for-schools`. Do not generate classroom footage. Re-render after language fixes. |
| DEF-034 | SMS / WhatsApp “this week’s idea” | parked | EEF texting trials showed small gains | Needs school partnership and phone numbers |
| DEF-035 | Progress that leaves the device | parked | We only store “I have got this” in localStorage | Avoid child-level tracking |
| DEF-036 | Translations / EAL parent briefings | parked | Access matter; do not machine-translate method language without review | |
| DEF-037 | SEND adaptations per topic | parked | Essential, not cosmetic | Add an `adaptations` field to the schema when we have specialist review |
| DEF-038 | Summer / holiday catch-up sequences | parked | Disadvantage gap widens over summer | Sequence existing packs; do not write a parallel curriculum |

## Pedagogy and quality

| ID | Idea | Status | Why wait | Notes |
|---|---|---|---|---|
| DEF-040 | LLM auto-draft from statutory bullets | research | Fast, but a wrong method is worse than no help | If used, draft into the schema only; never publish without human review |
| DEF-041 | Paid teacher review roster | parked | Phase 2 need | Until then every topic stays `draft` |
| DEF-042 | Misconception bank from Oak / NCETM | parked | Oak summaries already list common misconceptions | Import into `commonMisconceptions` |
| DEF-043 | “What if my child finds this easy / hard” branching | parked | Stretch and stop-rule cover the first slice | |

## Commercial and distribution

| ID | Idea | Status | Why wait | Notes |
|---|---|---|---|---|
| DEF-050 | School-licensed edition | parked | Schools already run one-off workshops | Could replace the forgotten workshop with a topic-by-topic feed |
| DEF-051 | Direct-to-parent subscription | parked | No product-market fit data yet | First slice is the experiment |
| DEF-052 | App stores | parked | The web app is enough | |

## Promoted

| ID | Promoted on | Into | Why now |
|---|---|---|---|
| — | — | — | Nothing promoted yet |

## Rejected

| ID | Rejected on | Why |
|---|---|---|
| DEF-060 | 2026-08-26 | Building a child homework auto-completer. Conflicts with principle 2 and EEF evidence on parents doing the thinking. |
| DEF-061 | 2026-08-26 | Ingesting commercial scheme PDFs. Copyright and method-lock-in. |

---

Add a new row when an idea comes up in conversation. Do not open a feature branch for a parked idea unless you are promoting it.
