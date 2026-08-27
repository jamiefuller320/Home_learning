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

/** Fixed linking lines, written for the ear. They do not invent method. */
export const SCRIPT_LINKS = {
  open:
    "This is a parent briefing... not a lesson for your child to watch. You learn the method. Then you sit down together, with things from the house.",
  draft:
    "This pack is still a draft. If it clashes with how your school teaches... follow the school. We need teachers to check the method.",
  plain: "In plain English.",
  school: "How school typically teaches it.",
  say: "Words that help.",
  avoid: "What to avoid.",
  mix: "A common mix-up.",
  ready: "You are ready when this is true.",
  tonight: "Tonight’s pack, very briefly. Do not do it from the film. Use the written steps.",
  close:
    "If you teach Year 1... we would like you to watch this, and tell us whether the method matches your school. The words on the page are the source. This film is only a reading of them.",
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

function beatsFromText(
  text: string,
  pauseAfter: number,
  extras: Partial<VideoBeat> = {},
): VideoBeat[] {
  return splitSentences(text).map((line) => ({
    spoken: forTheEar(line),
    line,
    pauseAfter,
    ...extras,
  }));
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

export function buildParentVideoScript(topic: Topic): ParentVideoScript {
  const briefing = topic.parentBriefing;
  const mix = briefing.commonMisconceptions[0];
  const firstStep = topic.homePack.activity.steps[0];
  const sayThis = briefing.sayThis.map(sayThisText);

  const schoolSentences = splitSentences(briefing.howSchoolTeachesIt);
  const plainSentences = splitSentences(briefing.inPlainEnglish);

  const scenes: VideoScene[] = [
    {
      id: "open",
      kicker: "Home Learning · Year 1 maths · draft",
      heading: topic.title,
      beats: withFinalPause(
        [
          { spoken: `${topic.title}.`, line: topic.summary, pauseAfter: PAUSE.item, guide: "present" },
          ...beatsFromText(topic.summary, PAUSE.sentence, { guide: "present" }),
          ...beatsFromText(SCRIPT_LINKS.open, PAUSE.sentence, { guide: "listen" }),
        ],
        PAUSE.section,
      ),
    },
    {
      id: "why",
      kicker: "Why this matters",
      heading: "Why school cares about this now",
      beats: withFinalPause(beatsFromText(topic.whyThisMatters, PAUSE.sentence, { guide: "present" }), PAUSE.section),
    },
    {
      id: "plain",
      kicker: "Stage 1 · For you",
      heading: "In plain English",
      beats: withFinalPause(
        [
          { spoken: SCRIPT_LINKS.plain, line: SCRIPT_LINKS.plain, pauseAfter: PAUSE.item, guide: "present" },
          ...plainSentences.map((line, index) => ({
            spoken: forTheEar(line),
            line,
            pauseAfter: PAUSE.sentence,
            guide: index === plainSentences.length - 1 ? ("point" as const) : ("present" as const),
            visual:
              index === plainSentences.length - 1
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
      kicker: "Stage 1 · For you",
      heading: "How school typically teaches it",
      beats: withFinalPause(
        [
          {
            spoken: SCRIPT_LINKS.school,
            line: SCRIPT_LINKS.school,
            pauseAfter: PAUSE.item,
            guide: "point",
            visual: {
              kind: "ten-frame",
              filled: 0,
              caption: "A ten-frame: two rows of five, still empty.",
            },
          },
          ...schoolSentences.map((line, index) => {
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
      id: "say",
      kicker: "Say this",
      heading: "Read these out",
      beats: withFinalPause(
        [
          { spoken: SCRIPT_LINKS.say, line: SCRIPT_LINKS.say, pauseAfter: PAUSE.item, guide: "listen" },
          ...sayThis.map((line, index) => ({
            spoken: forTheEar(line),
            line,
            pauseAfter: PAUSE.item,
            guide: "listen" as const,
            visual: { kind: "list" as const, items: sayThis, highlight: index },
          })),
        ],
        PAUSE.section,
      ),
    },
    {
      id: "avoid",
      kicker: "Avoid this",
      heading: "These clash with Year 1",
      beats: withFinalPause(
        [
          { spoken: SCRIPT_LINKS.avoid, line: SCRIPT_LINKS.avoid, pauseAfter: PAUSE.item, guide: "present" },
          ...briefing.avoidThis.map((line, index) => ({
            spoken: forTheEar(line),
            line,
            pauseAfter: PAUSE.item,
            guide: "present" as const,
            visual: { kind: "list" as const, items: briefing.avoidThis, highlight: index },
          })),
        ],
        PAUSE.section,
      ),
    },
    {
      id: "mix",
      kicker: "Common mix-up",
      heading: mix.misconception,
      beats: withFinalPause(
        [
          { spoken: SCRIPT_LINKS.mix, line: SCRIPT_LINKS.mix, pauseAfter: PAUSE.item, guide: "listen" },
          ...beatsFromText(mix.misconception, PAUSE.sentence, { guide: "listen" }),
          ...beatsFromText(`Why: ${mix.why}`, PAUSE.sentence, { guide: "present" }),
          ...beatsFromText(`Instead: ${mix.instead}`, PAUSE.sentence, { guide: "point" }),
        ],
        PAUSE.section,
      ),
    },
    {
      id: "ready",
      kicker: "You are ready when",
      heading: briefing.youAreReadyWhen,
      beats: withFinalPause(
        [
          { spoken: SCRIPT_LINKS.ready, line: SCRIPT_LINKS.ready, pauseAfter: PAUSE.item, guide: "point" },
          ...beatsFromText(briefing.youAreReadyWhen, PAUSE.sentence, {
            guide: "point",
            visual: {
              kind: "ten-frame",
              filled: 7,
              caption: "7 filled. 3 empty spaces make 10.",
            },
          }),
          ...beatsFromText(SCRIPT_LINKS.draft, PAUSE.sentence, { guide: "listen" }),
        ],
        PAUSE.section,
      ),
    },
    {
      id: "tonight",
      kicker: "Stage 2 · Together",
      heading: topic.homePack.activity.title,
      beats: withFinalPause(
        [
          ...beatsFromText(SCRIPT_LINKS.tonight, PAUSE.sentence, { guide: "present" }),
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
          ...beatsFromText(firstStep, PAUSE.sentence, {
            guide: "point",
            visual: {
              kind: "ten-frame",
              filled: 6,
              other: 4,
              caption: "6 and 4 make 10.",
            },
          }),
          ...beatsFromText(topic.homePack.stopRule, PAUSE.sentence, { guide: "listen" }),
        ],
        PAUSE.section,
      ),
    },
    {
      id: "close",
      kicker: "For schools",
      heading: "Does this match how you teach it?",
      beats: withFinalPause(beatsFromText(SCRIPT_LINKS.close, PAUSE.sentence, { guide: "present" }), PAUSE.short),
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
