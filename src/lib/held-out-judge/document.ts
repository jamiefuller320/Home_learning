import { sortTopicsByPrerequisites } from "@/content/england/ks1/year-1/maths/curriculum";
import type { Topic } from "@/content/schema";
import { sayThisListenFor, sayThisPrompt } from "@/lib/say-this";
import {
  SCRIPT_LINKS,
  splitSentences,
  type ParentVideoScript,
  type VideoBeat,
} from "@/lib/parent-video-script";
import { CLASSROOM_TERMS } from "./rules";
import type { JudgeDocument, JudgeSpan, JudgeSpanRole } from "./types";

const SCRIPT_LINK_VALUES = new Set(Object.values(SCRIPT_LINKS).map((line) => normalize(line)));

export function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

export function introducingTopicId(termId: string, topics: Topic[]): string | undefined {
  return sortTopicsByPrerequisites(topics).find((topic) => topic.glossaryTerms.includes(termId))?.id;
}

export function unlockedTermIdsFor(topic: Topic, topics: Topic[]): string[] {
  const byId = new Map(topics.map((item) => [item.id, item]));
  const unlocked = new Set<string>();

  function walk(id: string) {
    const node = byId.get(id);
    if (!node) return;
    for (const prerequisiteId of node.prerequisites) {
      walk(prerequisiteId);
      const prerequisite = byId.get(prerequisiteId);
      prerequisite?.glossaryTerms.forEach((termId) => unlocked.add(termId));
    }
  }

  walk(topic.id);
  return [...unlocked];
}

export type TermMention = {
  termId: string;
  phrase: string;
  index: number;
};

export function findTermMentions(text: string): TermMention[] {
  const haystack = text.toLowerCase();
  const mentions: TermMention[] = [];
  const claimed = new Set<number>();

  const phrases = CLASSROOM_TERMS.flatMap((term) =>
    term.phrases.map((phrase) => ({ termId: term.id, phrase, everyday: Boolean(term.everyday) })),
  ).sort((a, b) => b.phrase.length - a.phrase.length);

  for (const item of phrases) {
    if (item.everyday && item.phrase.length < 5) continue;
    let from = 0;
    const needle = item.phrase.toLowerCase();
    while (from < haystack.length) {
      const index = haystack.indexOf(needle, from);
      if (index < 0) break;
      const before = haystack[index - 1] ?? " ";
      const after = haystack[index + needle.length] ?? " ";
      const boundary = !/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after);
      const overlap = Array.from({ length: needle.length }, (_, offset) => index + offset).some((pos) =>
        claimed.has(pos),
      );
      if (boundary && !overlap) {
        mentions.push({ termId: item.termId, phrase: item.phrase, index });
        for (let pos = index; pos < index + needle.length; pos += 1) claimed.add(pos);
      }
      from = index + needle.length;
    }
  }

  return mentions.sort((a, b) => a.index - b.index);
}

export function termIdsInText(text: string): string[] {
  return [...new Set(findTermMentions(text).map((mention) => mention.termId))];
}

function pushSpan(
  spans: JudgeSpan[],
  fieldPath: string,
  text: string,
  role: JudgeSpanRole,
  split = false,
) {
  const pieces = split ? splitSentences(text) : [text];
  for (const piece of pieces) {
    const trimmed = piece.trim();
    if (!trimmed) continue;
    spans.push({
      id: `${fieldPath}#${spans.length}`,
      fieldPath,
      text: trimmed,
      order: spans.length,
      role,
    });
  }
}

export function topicCorpus(topic: Topic): string {
  return [
    topic.title,
    topic.summary,
    topic.whyThisMatters,
    topic.parentBriefing.inPlainEnglish,
    topic.parentBriefing.howSchoolTeachesIt,
    ...topic.parentBriefing.sayThis.map(sayThisPrompt),
    ...topic.parentBriefing.avoidThis,
    topic.parentBriefing.youAreReadyWhen,
    ...topic.householdItems,
    topic.homePack.setup,
    topic.homePack.activity.title,
    ...topic.homePack.activity.steps,
    topic.homePack.activity.tip ?? "",
    ...topic.homePack.check.flatMap((item) => [item.prompt, item.looksLike, item.notYet, item.nudge ?? ""]),
    topic.homePack.stretch ?? "",
    topic.homePack.stopRule,
  ].join("\n");
}

export function projectTopic(topic: Topic, topics: Topic[]): JudgeDocument {
  const spans: JudgeSpan[] = [];
  const briefing = topic.parentBriefing;

  pushSpan(spans, "parentBriefing.inPlainEnglish", briefing.inPlainEnglish, "teaching", true);
  pushSpan(spans, "parentBriefing.howSchoolTeachesIt", briefing.howSchoolTeachesIt, "teaching", true);
  briefing.sayThis.forEach((item, index) => {
    pushSpan(spans, `parentBriefing.sayThis[${index}].prompt`, sayThisPrompt(item), "teaching");
    const listenFor = sayThisListenFor(item);
    if (listenFor) pushSpan(spans, `parentBriefing.sayThis[${index}].listenFor`, listenFor, "teaching");
  });
  briefing.avoidThis.forEach((line, index) => {
    pushSpan(spans, `parentBriefing.avoidThis[${index}]`, line, "caution");
  });
  briefing.commonMisconceptions.forEach((item, index) => {
    pushSpan(spans, `parentBriefing.commonMisconceptions[${index}].misconception`, item.misconception, "teaching");
    pushSpan(spans, `parentBriefing.commonMisconceptions[${index}].why`, item.why, "teaching");
    pushSpan(spans, `parentBriefing.commonMisconceptions[${index}].instead`, item.instead, "teaching");
  });
  pushSpan(spans, "parentBriefing.youAreReadyWhen", briefing.youAreReadyWhen, "teaching");
  topic.householdItems.forEach((item, index) => {
    pushSpan(spans, `householdItems[${index}]`, item, "kit");
  });
  pushSpan(spans, "homePack.setup", topic.homePack.setup, "teaching", true);
  pushSpan(spans, "homePack.activity.title", topic.homePack.activity.title, "teaching");
  topic.homePack.activity.steps.forEach((step, index) => {
    pushSpan(spans, `homePack.activity.steps[${index}]`, step, "teaching");
  });
  if (topic.homePack.activity.tip) {
    pushSpan(spans, "homePack.activity.tip", topic.homePack.activity.tip, "teaching");
  }
  topic.homePack.check.forEach((item, index) => {
    pushSpan(spans, `homePack.check[${index}].prompt`, item.prompt, "teaching");
    pushSpan(spans, `homePack.check[${index}].looksLike`, item.looksLike, "teaching");
    pushSpan(spans, `homePack.check[${index}].notYet`, item.notYet, "teaching");
    if (item.nudge) pushSpan(spans, `homePack.check[${index}].nudge`, item.nudge, "teaching");
  });
  if (topic.homePack.stretch) pushSpan(spans, "homePack.stretch", topic.homePack.stretch, "teaching");
  pushSpan(spans, "homePack.stopRule", topic.homePack.stopRule, "teaching");

  return {
    sourceKind: "topic",
    topicId: topic.id,
    title: topic.title,
    spans,
    unlockedTermIds: unlockedTermIdsFor(topic, topics),
    introducingTermIds: topic.glossaryTerms.filter((termId) => introducingTopicId(termId, topics) === topic.id),
    sourceTermIds: termIdsInText(topicCorpus(topic)),
    avoidThis: briefing.avoidThis,
  };
}

function beatRole(beat: VideoBeat, sceneId: string): JudgeSpanRole {
  if (sceneId === "open" || sceneId === "close") return "script-link";
  if (sceneId === "avoid") return "caution";
  if (SCRIPT_LINK_VALUES.has(normalize(beat.line)) || SCRIPT_LINK_VALUES.has(normalize(beat.spoken))) {
    return "script-link";
  }
  return "teaching";
}

function visualCaption(beat: VideoBeat): string | undefined {
  if (!beat.visual) return undefined;
  if ("caption" in beat.visual) return beat.visual.caption;
  return undefined;
}

export function projectScript(script: ParentVideoScript, topic: Topic, topics: Topic[]): JudgeDocument {
  const spans: JudgeSpan[] = [];

  for (const scene of script.scenes) {
    scene.beats.forEach((beat, index) => {
      const fieldPath = `scenes.${scene.id}.beats[${index}]`;
      pushSpan(spans, `${fieldPath}.spoken`, beat.spoken, beatRole(beat, scene.id));
      const caption = visualCaption(beat);
      if (caption) {
        pushSpan(spans, `${fieldPath}.visual.caption`, caption, "script-visual");
      }
    });
  }

  return {
    sourceKind: "script",
    topicId: topic.id,
    title: topic.title,
    spans,
    unlockedTermIds: unlockedTermIdsFor(topic, topics),
    introducingTermIds: topic.glossaryTerms.filter((termId) => introducingTopicId(termId, topics) === topic.id),
    sourceTermIds: termIdsInText(topicCorpus(topic)),
    avoidThis: topic.parentBriefing.avoidThis,
  };
}
