import type { SayThisItem, Topic } from "@/content/schema";

export type VideoScene = {
  id: string;
  kicker: string;
  heading: string;
  lines: string[];
  spoken: string;
  tenFrame?: { filled: number };
};

export type ParentVideoScript = {
  topicId: string;
  title: string;
  scenes: VideoScene[];
};

function sayThisText(item: SayThisItem): string {
  return typeof item === "string" ? item : item.prompt;
}

/** Fixed linking lines. They do not invent method. */
export const SCRIPT_LINKS = {
  open:
    "This is a parent briefing, not a lesson for your child to watch. You learn the method. Then you sit down together with things from the house.",
  draft:
    "This pack is still a draft. If it clashes with how your school teaches, follow the school. We need teachers to check the method.",
  plain: "In plain English.",
  school: "How school typically teaches it.",
  say: "Words that help.",
  avoid: "What to avoid.",
  mix: "A common mix-up.",
  ready: "You are ready when this is true.",
  tonight: "Tonight’s pack, very briefly. Do not do it from the film — use the written steps.",
  close:
    "If you teach Year 1, we would like you to watch this and tell us whether the method matches your school. The words on the page are the source. This film is only a reading of them.",
} as const;

export function buildParentVideoScript(topic: Topic): ParentVideoScript {
  const briefing = topic.parentBriefing;
  const mix = briefing.commonMisconceptions[0];
  const firstStep = topic.homePack.activity.steps[0];

  const scenes: VideoScene[] = [
    {
      id: "open",
      kicker: "Home Learning · Year 1 maths · draft",
      heading: topic.title,
      lines: [topic.summary, SCRIPT_LINKS.open],
      spoken: `${topic.title}. ${topic.summary} ${SCRIPT_LINKS.open}`,
    },
    {
      id: "why",
      kicker: "Why this matters",
      heading: "Why school cares about this now",
      lines: [topic.whyThisMatters],
      spoken: topic.whyThisMatters,
    },
    {
      id: "plain",
      kicker: "Stage 1 · For you",
      heading: "In plain English",
      lines: [briefing.inPlainEnglish],
      spoken: `${SCRIPT_LINKS.plain} ${briefing.inPlainEnglish}`,
    },
    {
      id: "school",
      kicker: "Stage 1 · For you",
      heading: "How school typically teaches it",
      lines: [briefing.howSchoolTeachesIt],
      spoken: `${SCRIPT_LINKS.school} ${briefing.howSchoolTeachesIt}`,
      tenFrame: { filled: 6 },
    },
    {
      id: "say",
      kicker: "Say this",
      heading: "Read these out",
      lines: briefing.sayThis.map(sayThisText),
      spoken: `${SCRIPT_LINKS.say} ${briefing.sayThis.map(sayThisText).join(" ")}`,
    },
    {
      id: "avoid",
      kicker: "Avoid this",
      heading: "These clash with Year 1",
      lines: briefing.avoidThis,
      spoken: `${SCRIPT_LINKS.avoid} ${briefing.avoidThis.join(" ")}`,
    },
    {
      id: "mix",
      kicker: "Common mix-up",
      heading: mix.misconception,
      lines: [`Why: ${mix.why}`, `Instead: ${mix.instead}`],
      spoken: `${SCRIPT_LINKS.mix} ${mix.misconception} ${mix.why} ${mix.instead}`,
    },
    {
      id: "ready",
      kicker: "You are ready when",
      heading: briefing.youAreReadyWhen,
      lines: [SCRIPT_LINKS.draft],
      spoken: `${SCRIPT_LINKS.ready} ${briefing.youAreReadyWhen} ${SCRIPT_LINKS.draft}`,
    },
    {
      id: "tonight",
      kicker: "Stage 2 · Together",
      heading: topic.homePack.activity.title,
      lines: [firstStep, topic.homePack.stopRule],
      spoken: `${SCRIPT_LINKS.tonight} ${topic.homePack.activity.title}. ${firstStep} ${topic.homePack.stopRule}`,
    },
    {
      id: "close",
      kicker: "For schools",
      heading: "Does this match how you teach it?",
      lines: [SCRIPT_LINKS.close],
      spoken: SCRIPT_LINKS.close,
    },
  ];

  return { topicId: topic.id, title: topic.title, scenes };
}

export function spokenCorpus(script: ParentVideoScript): string {
  return script.scenes.map((scene) => scene.spoken).join("\n");
}
