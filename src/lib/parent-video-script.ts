import type { SayThisItem, Topic } from "@/content/schema";
import { shapeProsody, type ProsodyRole } from "@/lib/parent-video-prosody";

/** Gaps between clips — enough air for tone changes without dragging. */
export const PAUSE = {
  short: 0.22,
  sentence: 0.36,
  item: 0.5,
  aside: 0.58,
  section: 0.7,
} as const;

export type GuidePose = "present" | "point" | "listen";

export type VideoVisual =
  | { kind: "ten-frame"; filled: number; other?: number; caption: string }
  | { kind: "part-whole"; whole: number; left: number; right: number; caption: string }
  | { kind: "list"; items: string[]; highlight: number };

export type VideoBeat = {
  spoken: string;
  line: string;
  pauseAfter: number;
  /** Delivery intent — Kokoro approximates via punctuation + speed (no SSML). */
  prosody?: ProsodyRole;
  visual?: VideoVisual;
  guide?: GuidePose;
};

export type VideoScene = {
  id: string;
  kicker: string;
  heading: string;
  beats: VideoBeat[];
};

export type ParentVideoScript = {
  topicId: string;
  title: string;
  scenes: VideoScene[];
};

function sayThisText(item: SayThisItem): string {
  return typeof item === "string" ? item : item.prompt;
}

/**
 * Fixed linking lines as separate spoken clips.
 * Each entry is its own TTS call so asides and handoffs get a tone change.
 */
export const SCRIPT_LINKS = {
  open: [
    "This is a quick parent briefing.",
    "Not a film for your child to watch!",
    "You learn the method here.",
    "Then you work from the written page, beside your child.",
  ],
  draft: [
    "This pack is still a draft.",
    "If anything clashes with how your school teaches…",
    "Follow the school.",
  ],
  plain: ["Here’s the idea."],
  school: ["And here’s how school typically teaches it."],
  mix: ["Here’s one mix-up to watch for."],
  tonight: [
    "Tonight’s activity.",
    "This is the task outline — look at the written instructions for the full task.",
  ],
  criteria: ["Here’s what you’re aiming for."],
  page: [
    "When you’re ready to sit down together…",
    "Open the written page.",
    "Keep it beside you for the steps, the words to say, and the live checks.",
    "Don’t run the session from this film alone — return to the written pack when you sit down with your child.",
  ],
  youtube: [
    "Found this on YouTube?",
    "Use the link in the video description to open that page.",
  ],
  close: [
    "If you teach Year 1…",
    "Tell us whether the method matches your school.",
    "The written pack is the source.",
  ],
} as const;

/** Every fixed linking clip — used by the held-out judge. */
export const SCRIPT_LINK_LINES: readonly string[] = Object.values(SCRIPT_LINKS).flat();

const MATH_FACT =
  /\d+\s+(?:and\s+\d+\s+make|plus|take away)\s+\d+(?:\s+equals\s+\d+)?/i;

/**
 * Kokoro has no SSML. Punctuation shapes pitch and pause:
 * full stops between example sums, ellipsis before asides, questions for lift.
 */
export function forTheEar(text: string): string {
  return text
    .replace(/(\d)\s*[+＋]\s*(\d)\s*=\s*(\d)/g, "$1 and $2 make $3")
    .replace(/(\d)\s*[−–]\s*(\d)\s*=\s*(\d)/g, "$1 take away $2 equals $3")
    .replace(/(\d)\s*[+＋]\s*(\d)/g, "$1 plus $2")
    .replace(/(\d)\s*[−–]\s*(\d)/g, "$1 take away $2")
    .replace(/ — /g, " — ")
    .replace(/ – /g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?…])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Keep teaching clips short: first thoughts only, still taken from the pack. */
export function takeSentences(text: string, max: number): string[] {
  return splitSentences(text).slice(0, Math.max(0, max));
}

function endSentence(text: string): string {
  const trimmed = text.trim().replace(/[,:;]+$/, "");
  if (!trimmed) return trimmed;
  if (/[.!?…]$/.test(trimmed)) return trimmed;
  return `${trimmed}.`;
}

function capitalizeClip(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return trimmed.replace(/^[a-z]/, (ch) => ch.toUpperCase());
}

function looksLikeFactList(text: string): boolean {
  const parts = text.split(/\s*,\s*|\s+—\s+or\s+|\s+or\s+/i).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return false;
  return parts.filter((part) => MATH_FACT.test(part)).length >= 2;
}

/** Pull stacked example sums into their own clips so Kokoro does not squash them. */
export function splitExampleSums(sentence: string): string[] {
  const text = forTheEar(sentence).trim();
  if (!text) return [];

  // "such as …" / "such as: …" — put the link on the first example clip, not a lone "such as."
  const suchAs = text.match(/^(.*?)\bsuch as\b[:\s]+(.+)$/i);
  if (suchAs) {
    const list = suchAs[2].replace(/^:\s*/, "");
    if (looksLikeFactList(list)) {
      const lead = endSentence(suchAs[1].replace(/[,:]+$/, ""));
      const commaParts = list.split(/\s*,\s*/).map((part) => part.trim()).filter(Boolean);
      const parts =
        commaParts.length >= 2 && commaParts.filter((part) => MATH_FACT.test(part)).length >= 2
          ? commaParts
          : list.split(/\s+—\s+or\s+|\s+or\s+/i);
      const facts = parts
        .map((part) => part.trim().replace(/[.!?]+$/, ""))
        .filter((part) => part && MATH_FACT.test(part))
        .map((fact, index) => endSentence(index === 0 ? `Such as: ${fact}` : `Or: ${fact}`));
      if (facts.length >= 2) return [lead, ...facts].filter(Boolean);
    }
  }

  const colon = text.match(/^(.*?):\s*(.+)$/);
  if (colon && looksLikeFactList(colon[2])) {
    const lead = endSentence(colon[1]);
    const facts = colon[2]
      .split(/\s*,\s*/)
      .map((part) => part.trim().replace(/[.!?]+$/, ""))
      .filter((part) => MATH_FACT.test(part))
      .map((fact) => endSentence(fact));
    return [lead, ...facts];
  }

  return [text];
}

/** Split a trailing em-dash remark into its own clip for a tone change. */
export function splitAsideRemark(sentence: string): string[] {
  const text = sentence.trim();
  if (!text.includes(" — ")) return [text];

  const [head, ...rest] = text.split(/\s+—\s+/);
  const aside = rest.join(" — ").trim();
  if (!head?.trim() || !aside || MATH_FACT.test(aside)) return [text];

  return [endSentence(head), endSentence(capitalizeClip(aside))];
}

/** Full path: symbol rewrite → example splits → aside splits → sentence splits. */
export function spokenClips(text: string): string[] {
  return splitSentences(forTheEar(text))
    .flatMap(splitExampleSums)
    .flatMap(splitAsideRemark)
    .map((clip) => clip.trim())
    .filter(Boolean);
}

function makeBeat(
  text: string,
  pauseAfter: number,
  prosody: ProsodyRole,
  extras: Partial<VideoBeat> = {},
): VideoBeat {
  const line = text.trim();
  return {
    spoken: shapeProsody(line, prosody),
    line,
    pauseAfter,
    prosody,
    ...extras,
  };
}

function beatsFromClips(
  clips: string[],
  pauseAfter: number,
  prosody: ProsodyRole,
  extras: Partial<VideoBeat> = {},
): VideoBeat[] {
  return clips.map((clip) => {
    const isExample = /^(Such as:|Or:)/i.test(clip) || MATH_FACT.test(clip);
    const role: ProsodyRole = isExample ? "example" : prosody;
    return makeBeat(clip, isExample ? PAUSE.item : pauseAfter, role, extras);
  });
}

function beatsFromText(
  text: string,
  pauseAfter: number,
  prosody: ProsodyRole,
  extras: Partial<VideoBeat> = {},
): VideoBeat[] {
  return beatsFromClips(spokenClips(text), pauseAfter, prosody, extras);
}

function linkBeats(
  lines: readonly string[],
  pauseAfter: number,
  prosody: ProsodyRole,
  extras: Partial<VideoBeat> = {},
): VideoBeat[] {
  return lines.map((line, index) =>
    makeBeat(line, index === lines.length - 1 ? pauseAfter : PAUSE.aside, prosody, extras),
  );
}

function last<T>(items: T[]): T | undefined {
  return items[items.length - 1];
}

function withFinalPause(beats: VideoBeat[], pauseAfter: number): VideoBeat[] {
  const end = last(beats);
  if (!end) return beats;
  end.pauseAfter = pauseAfter;
  return beats;
}

function checkBeats(topic: Topic): VideoBeat[] {
  const item = topic.homePack.check[0];
  if (!item) return [];
  return [
    ...linkBeats(["One check from the page."], PAUSE.aside, "aside", { guide: "listen" }),
    ...beatsFromClips(spokenClips(item.prompt), PAUSE.item, "key", { guide: "listen" }),
    ...linkBeats(["Here’s what you want to see."], PAUSE.aside, "key", { guide: "listen" }),
    ...beatsFromClips(spokenClips(item.looksLike), PAUSE.item, "key", { guide: "listen" }),
  ];
}

export function buildParentVideoScript(topic: Topic): ParentVideoScript {
  const briefing = topic.parentBriefing;
  const mix = briefing.commonMisconceptions[0];
  const firstStep = topic.homePack.activity.steps[0];
  const plainLines = takeSentences(briefing.inPlainEnglish, 3);
  const schoolLines = takeSentences(briefing.howSchoolTeachesIt, 4);

  const scenes: VideoScene[] = [
    {
      id: "open",
      kicker: "Home Learning · Year 1 maths · draft",
      heading: topic.title,
      beats: withFinalPause(
        [
          makeBeat(topic.title, PAUSE.item, "title", { guide: "present" }),
          ...linkBeats([SCRIPT_LINKS.open[0]], PAUSE.aside, "section", { guide: "listen" }),
          ...linkBeats([SCRIPT_LINKS.open[1]], PAUSE.aside, "key", { guide: "listen" }),
          ...linkBeats(SCRIPT_LINKS.open.slice(2), PAUSE.sentence, "teach", { guide: "listen" }),
          ...linkBeats(SCRIPT_LINKS.draft, PAUSE.sentence, "aside", { guide: "listen" }),
        ],
        PAUSE.section,
      ),
    },
    {
      id: "plain",
      kicker: "The idea",
      heading: "In plain English",
      beats: withFinalPause(
        [
          ...linkBeats(SCRIPT_LINKS.plain, PAUSE.item, "section", { guide: "present" }),
          ...plainLines.flatMap((line, index) => {
            const clips = spokenClips(line);
            const isLast = index === plainLines.length - 1;
            return clips.map((clip, clipIndex) => {
              const isExample = MATH_FACT.test(clip) || /^(Such as:|Or:)/i.test(clip);
              return makeBeat(
                clip,
                isExample ? PAUSE.item : PAUSE.sentence,
                isExample ? "example" : "teach",
                {
                  guide: isLast && clipIndex === clips.length - 1 ? ("point" as const) : ("present" as const),
                  visual:
                    isLast && clipIndex === clips.length - 1
                      ? {
                          kind: "ten-frame" as const,
                          filled: 6,
                          other: 4,
                          caption: "6 and 4 making 10, on a ten-frame.",
                        }
                      : undefined,
                },
              );
            });
          }),
        ],
        PAUSE.section,
      ),
    },
    {
      id: "school",
      kicker: "At school",
      heading: "How school typically teaches it",
      beats: withFinalPause(
        [
          ...linkBeats(SCRIPT_LINKS.school, PAUSE.item, "section", {
            guide: "point",
            visual: {
              kind: "ten-frame",
              filled: 0,
              caption: "A ten-frame: two rows of five, still empty.",
            },
          }),
          ...schoolLines.flatMap((line, index) => {
            const clips = spokenClips(line);
            return clips.map((clip, clipIndex) => {
              const isExample = MATH_FACT.test(clip);
              const visual: VideoVisual | undefined =
                clipIndex === 0 && index === 0
                  ? { kind: "ten-frame", filled: 0, caption: "Two rows of five. The frame is the picture, not the sum." }
                  : clipIndex === 0 && index === 1
                    ? {
                        kind: "ten-frame",
                        filled: 6,
                        other: 4,
                        caption: "A family of facts: 6 and 4, then 4 and 6.",
                      }
                    : clipIndex === 0 && index >= 2
                      ? {
                          kind: "part-whole",
                          whole: 10,
                          left: 6,
                          right: 4,
                          caption: "A number bond: two parts that make a whole.",
                        }
                      : undefined;
              return makeBeat(clip, isExample ? PAUSE.item : PAUSE.sentence, isExample ? "example" : "teach", {
                guide: "point",
                visual,
              });
            });
          }),
        ],
        PAUSE.section,
      ),
    },
    {
      id: "mix",
      kicker: "Watch for this",
      heading: mix.misconception,
      beats: withFinalPause(
        [
          ...linkBeats(SCRIPT_LINKS.mix, PAUSE.item, "section", { guide: "listen" }),
          ...beatsFromText(takeSentences(mix.misconception, 1).join(" "), PAUSE.sentence, "teach", {
            guide: "listen",
          }),
          ...beatsFromText(takeSentences(mix.instead, 1).join(" "), PAUSE.sentence, "key", {
            guide: "point",
          }),
        ],
        PAUSE.section,
      ),
    },
    {
      id: "tonight",
      kicker: "Tonight · outline",
      heading: topic.homePack.activity.title,
      beats: withFinalPause(
        [
          ...linkBeats(SCRIPT_LINKS.tonight, PAUSE.sentence, "section", { guide: "present" }),
          makeBeat(topic.homePack.activity.title, PAUSE.item, "title", {
            guide: "point",
            visual: {
              kind: "ten-frame",
              filled: 6,
              other: 4,
              caption: "Fill 6 of one type. The empty spaces are the other part.",
            },
          }),
          ...beatsFromText(takeSentences(firstStep, 2).join(" "), PAUSE.sentence, "teach", {
            guide: "point",
            visual: {
              kind: "ten-frame",
              filled: 6,
              other: 4,
              caption: "6 and 4 make 10.",
            },
          }),
          ...beatsFromText(takeSentences(topic.homePack.stopRule, 1).join(" "), PAUSE.sentence, "aside", {
            guide: "listen",
          }),
        ],
        PAUSE.section,
      ),
    },
    {
      id: "criteria",
      kicker: "Tonight · criteria",
      heading: "What good looks like",
      beats: withFinalPause(
        [
          ...linkBeats(SCRIPT_LINKS.criteria, PAUSE.item, "section", { guide: "point" }),
          ...beatsFromText(briefing.youAreReadyWhen, PAUSE.sentence, "key", {
            guide: "point",
            visual: {
              kind: "ten-frame",
              filled: 7,
              caption: "7 filled. 3 empty spaces make 10.",
            },
          }),
          ...checkBeats(topic),
        ],
        PAUSE.section,
      ),
    },
    {
      id: "page",
      kicker: "Use the page",
      heading: "Open the written pack when you start",
      beats: withFinalPause(
        [
          ...linkBeats(SCRIPT_LINKS.page, PAUSE.aside, "handoff", { guide: "present" }),
          ...linkBeats(SCRIPT_LINKS.youtube, PAUSE.aside, "handoff", { guide: "point" }),
        ],
        PAUSE.section,
      ),
    },
    {
      id: "close",
      kicker: "For schools",
      heading: "Does this match how you teach it?",
      beats: withFinalPause(
        linkBeats(SCRIPT_LINKS.close, PAUSE.sentence, "aside", { guide: "present" }),
        PAUSE.short,
      ),
    },
  ];

  return { topicId: topic.id, title: topic.title, scenes };
}

export function spokenCorpus(script: ParentVideoScript): string {
  return script.scenes
    .flatMap((scene) => scene.beats.map((beat) => beat.spoken))
    .join("\n");
}

export function allBeats(script: ParentVideoScript): VideoBeat[] {
  return script.scenes.flatMap((scene) => scene.beats);
}

/** Exported for tests: prompts belong on the page, not as a film checklist. */
export function sayThisLines(topic: Topic): string[] {
  return topic.parentBriefing.sayThis.map(sayThisText);
}
