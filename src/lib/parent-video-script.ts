import type { SayThisItem, Topic } from "@/content/schema";

export const PAUSE = {
  short: 0.28,
  sentence: 0.42,
  item: 0.58,
  section: 0.75,
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
 * Fixed linking lines, written for the ear.
 * The film is a concise briefing + task outline, not a reading of the page.
 * Say-this / avoid / step-by-step live on the written pack for use beside the child.
 */
export const SCRIPT_LINKS = {
  open:
    "This is a short parent briefing... not a film for your child to watch. You learn the method here. Then you work from the written page, beside your child.",
  draft:
    "This pack is still a draft. If it clashes with how your school teaches... follow the school.",
  plain: "Here is the idea.",
  school: "How school typically teaches it.",
  mix: "One mix-up to watch for.",
  tonight: "Tonight’s activity, in outline only.",
  criteria: "What you are aiming for.",
  page:
    "When you are ready to sit down together... open the written page. Keep it beside you for the steps, the words to say, and the live checks. Do not run the session from this film.",
  youtube:
    "If you found this on YouTube... use the link in the video description to open that page.",
  close:
    "If you teach Year 1... tell us whether the method matches your school. The written pack is the source.",
} as const;

/** Kokoro has no SSML. Punctuation and short clips are the only pacing levers. */
export function forTheEar(text: string): string {
  return text
    .replace(/(\d)\s*[+＋]\s*(\d)\s*=\s*(\d)/g, "$1 and $2 make $3")
    .replace(/(\d)\s*[−–]\s*(\d)\s*=\s*(\d)/g, "$1 take away $2 equals $3")
    .replace(/(\d)\s*[+＋]\s*(\d)/g, "$1 plus $2")
    .replace(/(\d)\s*[−–]\s*(\d)/g, "$1 take away $2")
    .replace(/ make (\d+) or /g, " make $1... or ")
    .replace(/ — /g, "... ")
    .replace(/ – /g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Keep teaching clips short: first thoughts only, still taken from the pack. */
export function takeSentences(text: string, max: number): string[] {
  return splitSentences(text).slice(0, Math.max(0, max));
}

function beatsFromLines(
  lines: string[],
  pauseAfter: number,
  extras: Partial<VideoBeat> = {},
): VideoBeat[] {
  return lines.map((line) => ({
    spoken: forTheEar(line),
    line,
    pauseAfter,
    ...extras,
  }));
}

function beatsFromText(
  text: string,
  pauseAfter: number,
  extras: Partial<VideoBeat> = {},
): VideoBeat[] {
  return beatsFromLines(splitSentences(text), pauseAfter, extras);
}

/** Linking lines keep their ellipsis pauses inside one clip — do not re-split them. */
function linkBeat(text: string, pauseAfter: number, extras: Partial<VideoBeat> = {}): VideoBeat {
  return { spoken: text, line: text, pauseAfter, ...extras };
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

function firstCheckOutline(topic: Topic): string | undefined {
  const item = topic.homePack.check[0];
  if (!item) return undefined;
  return `One check from the page: ${item.prompt} Looking for: ${item.looksLike}`;
}

export function buildParentVideoScript(topic: Topic): ParentVideoScript {
  const briefing = topic.parentBriefing;
  const mix = briefing.commonMisconceptions[0];
  const firstStep = topic.homePack.activity.steps[0];
  const plainLines = takeSentences(briefing.inPlainEnglish, 3);
  const schoolLines = takeSentences(briefing.howSchoolTeachesIt, 3);
  const checkLine = firstCheckOutline(topic);

  const scenes: VideoScene[] = [
    {
      id: "open",
      kicker: "Home Learning · Year 1 maths · draft",
      heading: topic.title,
      beats: withFinalPause(
        [
          { spoken: `${topic.title}.`, line: topic.title, pauseAfter: PAUSE.item, guide: "present" },
          linkBeat(SCRIPT_LINKS.open, PAUSE.sentence, { guide: "listen" }),
          linkBeat(SCRIPT_LINKS.draft, PAUSE.sentence, { guide: "listen" }),
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
          linkBeat(SCRIPT_LINKS.plain, PAUSE.item, { guide: "present" }),
          ...plainLines.map((line, index) => ({
            spoken: forTheEar(line),
            line,
            pauseAfter: PAUSE.sentence,
            guide: index === plainLines.length - 1 ? ("point" as const) : ("present" as const),
            visual:
              index === plainLines.length - 1
                ? {
                    kind: "ten-frame" as const,
                    filled: 6,
                    other: 4,
                    caption: "6 and 4 making 10, on a ten-frame.",
                  }
                : undefined,
          })),
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
          linkBeat(SCRIPT_LINKS.school, PAUSE.item, {
            guide: "point",
            visual: {
              kind: "ten-frame",
              filled: 0,
              caption: "A ten-frame: two rows of five, still empty.",
            },
          }),
          ...schoolLines.map((line, index) => {
            const visual: VideoVisual | undefined =
              index === 0
                ? { kind: "ten-frame", filled: 0, caption: "Two rows of five. The frame is the picture, not the sum." }
                : index === 1
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
                    };
            return {
              spoken: forTheEar(line),
              line,
              pauseAfter: PAUSE.sentence,
              guide: "point" as const,
              visual,
            };
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
          linkBeat(SCRIPT_LINKS.mix, PAUSE.item, { guide: "listen" }),
          ...beatsFromLines(takeSentences(mix.misconception, 1), PAUSE.sentence, { guide: "listen" }),
          ...beatsFromLines(takeSentences(mix.instead, 1), PAUSE.sentence, { guide: "point" }),
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
          linkBeat(SCRIPT_LINKS.tonight, PAUSE.sentence, { guide: "present" }),
          {
            spoken: forTheEar(`${topic.homePack.activity.title}.`),
            line: topic.homePack.activity.title,
            pauseAfter: PAUSE.item,
            guide: "point",
            visual: {
              kind: "ten-frame",
              filled: 6,
              other: 4,
              caption: "Fill 6 of one type. The empty spaces are the other part.",
            },
          },
          ...beatsFromLines(takeSentences(firstStep, 2), PAUSE.sentence, {
            guide: "point",
            visual: {
              kind: "ten-frame",
              filled: 6,
              other: 4,
              caption: "6 and 4 make 10.",
            },
          }),
          ...beatsFromLines(takeSentences(topic.homePack.stopRule, 1), PAUSE.sentence, { guide: "listen" }),
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
          linkBeat(SCRIPT_LINKS.criteria, PAUSE.item, { guide: "point" }),
          ...beatsFromText(briefing.youAreReadyWhen, PAUSE.sentence, {
            guide: "point",
            visual: {
              kind: "ten-frame",
              filled: 7,
              caption: "7 filled. 3 empty spaces make 10.",
            },
          }),
          ...(checkLine ? beatsFromLines([checkLine], PAUSE.item, { guide: "listen" }) : []),
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
          linkBeat(SCRIPT_LINKS.page, PAUSE.sentence, { guide: "present" }),
          linkBeat(SCRIPT_LINKS.youtube, PAUSE.sentence, { guide: "point" }),
        ],
        PAUSE.section,
      ),
    },
    {
      id: "close",
      kicker: "For schools",
      heading: "Does this match how you teach it?",
      beats: withFinalPause([linkBeat(SCRIPT_LINKS.close, PAUSE.sentence, { guide: "present" })], PAUSE.short),
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
