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
  | { kind: "list"; items: string[]; highlight: number }
  | { kind: "number-track"; numbers: number[]; highlight: number; caption: string }
  | { kind: "number-line"; start: number; end: number; marks: number[]; highlight?: number; caption: string };

/** Short label for script dumps and the colour-coded viewer. */
export function visualLabel(visual: VideoVisual): string {
  if (visual.kind === "list") return visual.items.join(" · ");
  return visual.caption;
}

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
  /** School-takes-precedence aside — draft status stays a page badge, not spoken. */
  draft: [
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
    "Thanks for watching — enjoy the session together.",
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

type SceneDiagrams = {
  plainLast?: VideoVisual;
  schoolIntro?: VideoVisual;
  schoolLine: (lineIndex: number) => VideoVisual | undefined;
  tonightTitle?: VideoVisual;
  tonightStep?: VideoVisual;
  criteria?: VideoVisual;
};

const TEN_FRAME_DIAGRAMS: SceneDiagrams = {
  plainLast: {
    kind: "ten-frame",
    filled: 6,
    other: 4,
    caption: "6 and 4 making 10, on a ten-frame.",
  },
  schoolIntro: {
    kind: "ten-frame",
    filled: 0,
    caption: "A ten-frame: two rows of five, still empty.",
  },
  schoolLine: (lineIndex) =>
    lineIndex === 0
      ? { kind: "ten-frame", filled: 0, caption: "Two rows of five. The frame is the picture, not the sum." }
      : lineIndex === 1
        ? {
            kind: "ten-frame",
            filled: 6,
            other: 4,
            caption: "A family of facts: 6 and 4, then 4 and 6.",
          }
        : {
            kind: "part-whole",
            whole: 10,
            left: 6,
            right: 4,
            caption: "A number bond: two parts that make a whole.",
          },
  tonightTitle: {
    kind: "ten-frame",
    filled: 6,
    other: 4,
    caption: "Fill 6 of one type. The empty spaces are the other part.",
  },
  tonightStep: {
    kind: "ten-frame",
    filled: 6,
    other: 4,
    caption: "6 and 4 make 10.",
  },
  criteria: {
    kind: "ten-frame",
    filled: 7,
    caption: "7 filled. 3 empty spaces make 10.",
  },
};

function packUsesTenFramePictures(topic: Topic): boolean {
  return topic.glossaryTerms.includes("ten-frame");
}

function firstInt(text: string): number | undefined {
  const match = text.match(/\b(\d{1,3})\b/);
  return match ? Number(match[1]) : undefined;
}

function consecutiveNumbers(start: number, end: number, max = 11): number[] {
  const step = start <= end ? 1 : -1;
  const numbers: number[] = [];
  for (let n = start; n !== end + step; n += step) {
    numbers.push(n);
    if (numbers.length >= max) break;
  }
  return numbers;
}

function parseCountOnRange(text: string): { start: number; end: number } | undefined {
  const match = text.match(/start at (\d+)[.\s]*count on to (\d+)/i);
  if (!match) return undefined;
  return { start: Number(match[1]), end: Number(match[2]) };
}

function packUsesCountingTrack(topic: Topic): boolean {
  const hay = [
    topic.parentBriefing.inPlainEnglish,
    topic.parentBriefing.howSchoolTeachesIt,
    ...topic.homePack.activity.steps,
  ].join("\n");
  return /\bon a track\b/i.test(hay) || /\bhundred square\b/i.test(hay) || /\bcount backwards\b/i.test(hay);
}

function numberLineDiagrams(topic: Topic): SceneDiagrams {
  const guide = topic.homePack.activity.numberLine;
  if (!guide) return listDiagrams(topic);
  const caption = takeSentences(guide.caption, 1)[0] ?? guide.caption;
  const highlight = guide.marks.find((mark) => mark !== guide.start && mark !== guide.end);
  const visual: VideoVisual = {
    kind: "number-line",
    start: guide.start,
    end: guide.end,
    marks: guide.marks,
    highlight,
    caption,
  };
  return {
    plainLast: visual,
    schoolIntro: visual,
    schoolLine: () => visual,
    tonightTitle: visual,
    tonightStep: visual,
    criteria: visual,
  };
}

function countingTrackDiagrams(topic: Topic): SceneDiagrams {
  const schoolText = topic.parentBriefing.howSchoolTeachesIt;
  const middleMatch = schoolText.match(/in the middle[^.]*?\b(\d{1,3})\b/i);
  const schoolStart = middleMatch ? Number(middleMatch[1]) : firstInt(schoolText) ?? 16;
  const schoolNums = consecutiveNumbers(schoolStart, schoolStart + 4);
  const schoolVisual: VideoVisual = {
    kind: "number-track",
    numbers: schoolNums,
    highlight: schoolStart,
    caption: `Start from ${schoolStart}, a number in the middle.`,
  };

  const firstStep = topic.homePack.activity.steps[0] ?? "";
  const tonightStart = firstInt(firstStep) ?? schoolStart;
  const tonightNums = consecutiveNumbers(tonightStart, tonightStart + 10);
  const title = topic.homePack.activity.title;
  const tonightVisual: VideoVisual = {
    kind: "number-track",
    numbers: tonightNums,
    highlight: tonightStart,
    caption: /[.!?]$/.test(title) ? title : `${title}.`,
  };

  const checkRange = parseCountOnRange(topic.homePack.check[0]?.prompt ?? "");
  const criteriaNums = checkRange
    ? consecutiveNumbers(checkRange.start, checkRange.end)
    : tonightNums;
  const criteriaVisual: VideoVisual = {
    kind: "number-track",
    numbers: criteriaNums,
    highlight: criteriaNums[0] ?? tonightStart,
    caption: checkRange
      ? `Start at ${checkRange.start}. Count on to ${checkRange.end}.`
      : takeSentences(topic.parentBriefing.youAreReadyWhen, 1)[0] ?? topic.parentBriefing.youAreReadyWhen,
  };

  return {
    plainLast: schoolVisual,
    schoolIntro: schoolVisual,
    schoolLine: (lineIndex) =>
      lineIndex >= 2
        ? {
            kind: "number-track",
            numbers: schoolNums,
            highlight: schoolStart,
            caption: "Count backwards as well as forwards.",
          }
        : schoolVisual,
    tonightTitle: tonightVisual,
    tonightStep: {
      kind: "number-track",
      numbers: tonightNums,
      highlight: tonightStart,
      caption: "Count on ten more numbers.",
    },
    criteria: criteriaVisual,
  };
}

function listDiagrams(topic: Topic): SceneDiagrams {
  const items = topic.homePack.activity.steps.slice(0, 3).map((step) => {
    const first = takeSentences(step, 1)[0] ?? step;
    return first.length > 90 ? `${first.slice(0, 87)}…` : first;
  });
  const list: VideoVisual | undefined = items.length
    ? { kind: "list", items, highlight: 0 }
    : undefined;
  return {
    schoolLine: () => undefined,
    tonightTitle: list,
    tonightStep: list,
  };
}

function diagramsFor(topic: Topic): SceneDiagrams {
  if (packUsesTenFramePictures(topic)) return TEN_FRAME_DIAGRAMS;
  if (topic.homePack.activity.numberLine) return numberLineDiagrams(topic);
  if (packUsesCountingTrack(topic)) return countingTrackDiagrams(topic);
  return listDiagrams(topic);
}

export function buildParentVideoScript(topic: Topic): ParentVideoScript {
  const briefing = topic.parentBriefing;
  const mix = briefing.commonMisconceptions[0];
  const firstStep = topic.homePack.activity.steps[0];
  const plainLines = takeSentences(briefing.inPlainEnglish, 3);
  const schoolLines = takeSentences(briefing.howSchoolTeachesIt, 4);
  const diagrams = diagramsFor(topic);

  const scenes: VideoScene[] = [
    {
      id: "open",
      kicker: "Home Learning · Year 1 maths",
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
              const showDiagram = Boolean(isLast && clipIndex === clips.length - 1 && diagrams.plainLast);
              return makeBeat(
                clip,
                isExample ? PAUSE.item : PAUSE.sentence,
                isExample ? "example" : "teach",
                {
                  guide: showDiagram ? ("point" as const) : ("present" as const),
                  visual: showDiagram ? diagrams.plainLast : undefined,
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
            guide: diagrams.schoolIntro ? "point" : "present",
            visual: diagrams.schoolIntro,
          }),
          ...schoolLines.flatMap((line, index) => {
            const clips = spokenClips(line);
            return clips.map((clip, clipIndex) => {
              const isExample = MATH_FACT.test(clip);
              const visual = clipIndex === 0 ? diagrams.schoolLine(index) : undefined;
              return makeBeat(clip, isExample ? PAUSE.item : PAUSE.sentence, isExample ? "example" : "teach", {
                // Only point when a diagram is on screen — otherwise the arm aims at empty space.
                guide: visual ? "point" : "present",
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
            guide: "present",
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
            guide: diagrams.tonightTitle ? "point" : "present",
            visual: diagrams.tonightTitle,
          }),
          ...beatsFromText(takeSentences(firstStep, 2).join(" "), PAUSE.sentence, "teach", {
            guide: diagrams.tonightStep ? "point" : "present",
            visual: diagrams.tonightStep,
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
          ...linkBeats(SCRIPT_LINKS.criteria, PAUSE.item, "section", { guide: "present" }),
          ...beatsFromText(briefing.youAreReadyWhen, PAUSE.sentence, "key", {
            guide: diagrams.criteria ? "point" : "present",
            visual: diagrams.criteria,
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
          ...linkBeats(SCRIPT_LINKS.youtube, PAUSE.aside, "handoff", { guide: "present" }),
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
