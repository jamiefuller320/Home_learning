import type { Topic } from "@/content/schema";
import { sayThisListenFor, sayThisPrompt } from "@/lib/say-this";
import { splitGlossaryText } from "./index";
import { introducingTopicId, unlockedTermIdsFor } from "./unlock";

export type GlossaryMentionTreatment = "introduce" | "recall" | "plain";

/**
 * Parent-facing fields in reading order (summary → briefing → tasks → check).
 * Only strings that `GlossaryText` actually renders.
 */
export function lessonGlossaryFieldTexts(topic: Topic): string[] {
  const briefing = topic.parentBriefing;
  const pack = topic.homePack;

  return [
    topic.summary,
    topic.whyThisMatters,
    briefing.inPlainEnglish,
    briefing.howSchoolTeachesIt,
    ...briefing.sayThis.map(sayThisPrompt),
    ...briefing.sayThis.map((item) => sayThisListenFor(item) ?? ""),
    ...briefing.avoidThis,
    ...briefing.commonMisconceptions.flatMap((item) => [item.misconception, item.why, item.instead]),
    briefing.youAreReadyWhen,
    pack.setup,
    ...pack.activity.steps,
    pack.activity.tip ?? "",
    pack.stretch ?? "",
    pack.stopRule,
    ...pack.check.flatMap((item) => [item.prompt, item.looksLike, item.notYet, item.nudge ?? ""]),
  ].filter((text) => text.length > 0);
}

export function firstIntroductionInLesson(
  topic: Topic,
  termId: string,
): { text: string; occurrence: number } | undefined {
  for (const text of lessonGlossaryFieldTexts(topic)) {
    const hasTerm = splitGlossaryText(text).some((part) => part.termId === termId);
    if (hasTerm) {
      return { text, occurrence: 0 };
    }
  }
  return undefined;
}

/**
 * First mention in the introducing lesson: colour, no link.
 * Later mentions in that lesson: plain (stay with the explanation).
 * Subsequent lessons that already know the term: glossary link.
 */
export function glossaryMentionTreatment(
  termId: string,
  fieldText: string,
  occurrenceInField: number,
  topic: Topic,
  topics: Topic[],
): GlossaryMentionTreatment {
  const introducer = introducingTopicId(termId, topics);
  if (introducer === topic.id) {
    const first = firstIntroductionInLesson(topic, termId);
    if (first && first.text === fieldText && first.occurrence === occurrenceInField) {
      return "introduce";
    }
    return "plain";
  }

  const unlocked = unlockedTermIdsFor(topic, topics);
  if (unlocked.includes(termId) || topic.glossaryTerms.includes(termId)) {
    return "recall";
  }

  return "plain";
}
