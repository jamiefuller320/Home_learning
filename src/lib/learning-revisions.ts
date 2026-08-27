import { year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";
import decisionsFile from "@/content/learning-decisions.json";
import {
  getLearningById,
  learnings,
  type Learning,
  type PhraseLearning,
  type StructureLearning,
} from "@/content/learnings";
import type { Topic } from "@/content/schema";
import { sayThisListenFor, sayThisPrompt } from "@/lib/say-this";

export type RevisionDecision = "accepted" | "declined";

export type LearningDecisionRecord = {
  revisionId: string;
  decision: RevisionDecision;
  decidedAt: string;
  note?: string;
};

export type ProposedRevision = {
  id: string;
  learningId: string;
  learningTitle: string;
  topicId: string;
  topicTitle: string;
  fieldPath: string;
  before: string;
  after: string;
  rationale: string;
  kind: Learning["kind"];
};

export type LearningDecisionsFile = {
  version: number;
  decisions: LearningDecisionRecord[];
};

function hashRevisionId(parts: string[]): string {
  const raw = parts.join("|");
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return `rev-${hash.toString(16)}`;
}

function replaceInsensitive(haystack: string, find: string, replace: string): string | null {
  const index = haystack.toLowerCase().indexOf(find.toLowerCase());
  if (index < 0) return null;
  return `${haystack.slice(0, index)}${replace}${haystack.slice(index + find.length)}`;
}

function walkStringFields(
  topic: Topic,
  visit: (fieldPath: string, value: string) => void,
): void {
  visit("whyThisMatters", topic.whyThisMatters);
  visit("parentBriefing.inPlainEnglish", topic.parentBriefing.inPlainEnglish);
  visit("parentBriefing.howSchoolTeachesIt", topic.parentBriefing.howSchoolTeachesIt);
  visit("parentBriefing.youAreReadyWhen", topic.parentBriefing.youAreReadyWhen);
  visit("homePack.setup", topic.homePack.setup);
  visit("homePack.activity.title", topic.homePack.activity.title);
  if (topic.homePack.activity.tip) visit("homePack.activity.tip", topic.homePack.activity.tip);
  if (topic.homePack.stretch) visit("homePack.stretch", topic.homePack.stretch);
  visit("homePack.stopRule", topic.homePack.stopRule);

  topic.householdItems.forEach((item, index) => visit(`householdItems[${index}]`, item));
  topic.parentBriefing.sayThis.forEach((item, index) => {
    visit(`parentBriefing.sayThis[${index}].prompt`, sayThisPrompt(item));
    const listenFor = sayThisListenFor(item);
    if (listenFor) visit(`parentBriefing.sayThis[${index}].listenFor`, listenFor);
  });
  topic.parentBriefing.avoidThis.forEach((line, index) => {
    visit(`parentBriefing.avoidThis[${index}]`, line);
  });
  topic.parentBriefing.commonMisconceptions.forEach((item, index) => {
    visit(`parentBriefing.commonMisconceptions[${index}].misconception`, item.misconception);
    visit(`parentBriefing.commonMisconceptions[${index}].why`, item.why);
    visit(`parentBriefing.commonMisconceptions[${index}].instead`, item.instead);
  });
  topic.homePack.activity.steps.forEach((step, index) => {
    visit(`homePack.activity.steps[${index}]`, step);
  });
  topic.homePack.check.forEach((item, index) => {
    visit(`homePack.check[${index}].prompt`, item.prompt);
    visit(`homePack.check[${index}].looksLike`, item.looksLike);
    visit(`homePack.check[${index}].notYet`, item.notYet);
    if (item.nudge) visit(`homePack.check[${index}].nudge`, item.nudge);
  });
}

function proposePhrase(topic: Topic, learning: PhraseLearning): ProposedRevision[] {
  const proposals: ProposedRevision[] = [];
  walkStringFields(topic, (fieldPath, value) => {
    const after = replaceInsensitive(value, learning.find, learning.replace);
    if (!after || after === value) return;
    proposals.push({
      id: hashRevisionId([learning.id, topic.id, fieldPath, value]),
      learningId: learning.id,
      learningTitle: learning.title,
      topicId: topic.id,
      topicTitle: topic.title,
      fieldPath,
      before: value,
      after,
      rationale: learning.principle,
      kind: "phrase",
    });
  });
  return proposals;
}

function proposeCheckNudges(topic: Topic, learning: StructureLearning): ProposedRevision[] {
  return topic.homePack.check.flatMap((item, index) => {
    if (item.nudge?.trim()) return [];
    const fieldPath = `homePack.check[${index}].nudge`;
    const after = `Try this: go back to the objects or picture for “${item.prompt}”, then ask the check again.`;
    return [
      {
        id: hashRevisionId([learning.id, topic.id, fieldPath, ""]),
        learningId: learning.id,
        learningTitle: learning.title,
        topicId: topic.id,
        topicTitle: topic.title,
        fieldPath,
        before: "(missing)",
        after,
        rationale: learning.principle,
        kind: "structure" as const,
      },
    ];
  });
}

function proposeHouseholdSuchAs(topic: Topic, learning: StructureLearning): ProposedRevision[] {
  return topic.householdItems.flatMap((item, index) => {
    if (!/\([^)]*(?:,| and )[^)]+\)/.test(item)) return [];
    if (/\bsuch as\b/i.test(item)) return [];
    const after = item.replace(/\(([^)]+)\)/, "(such as $1)");
    if (after === item) return [];
    const fieldPath = `householdItems[${index}]`;
    return [
      {
        id: hashRevisionId([learning.id, topic.id, fieldPath, item]),
        learningId: learning.id,
        learningTitle: learning.title,
        topicId: topic.id,
        topicTitle: topic.title,
        fieldPath,
        before: item,
        after,
        rationale: learning.principle,
        kind: "structure" as const,
      },
    ];
  });
}

function proposeSayThisListenFor(topic: Topic, learning: StructureLearning): ProposedRevision[] {
  // One advisory per topic when no listenFor exists yet — avoids flooding every prompt.
  const items = topic.parentBriefing.sayThis;
  if (items.length === 0) return [];
  if (items.some((item) => Boolean(sayThisListenFor(item)))) return [];

  const fieldPath = "parentBriefing.sayThis";
  const before = items.map((item) => sayThisPrompt(item)).join(" · ");
  return [
    {
      id: hashRevisionId([learning.id, topic.id, fieldPath, before]),
      learningId: learning.id,
      learningTitle: learning.title,
      topicId: topic.id,
      topicTitle: topic.title,
      fieldPath,
      before,
      after: "Add listenFor on prompts that have a clear expected response (see parts-of-10). Decline if prompts are open-ended.",
      rationale: learning.principle,
      kind: "structure",
    },
  ];
}

function proposeForLearning(topic: Topic, learning: Learning): ProposedRevision[] {
  if (learning.kind === "phrase") return proposePhrase(topic, learning);
  if (learning.structure === "check-nudge") return proposeCheckNudges(topic, learning);
  if (learning.structure === "household-such-as") return proposeHouseholdSuchAs(topic, learning);
  if (learning.structure === "say-this-listen-for") return proposeSayThisListenFor(topic, learning);
  return [];
}

export function readCommittedDecisions(): LearningDecisionRecord[] {
  return (decisionsFile as LearningDecisionsFile).decisions ?? [];
}

export function scanLearningRevisions(
  topics: Topic[] = year1MathsTopics,
  catalog: Learning[] = learnings,
): ProposedRevision[] {
  return topics.flatMap((topic) => catalog.flatMap((learning) => proposeForLearning(topic, learning)));
}

export function filterPendingRevisions(
  proposals: ProposedRevision[],
  decisions: LearningDecisionRecord[],
): ProposedRevision[] {
  const decided = new Set(decisions.map((decision) => decision.revisionId));
  return proposals.filter((proposal) => !decided.has(proposal.id));
}

export function groupRevisionsByTopic(proposals: ProposedRevision[]): Map<string, ProposedRevision[]> {
  const map = new Map<string, ProposedRevision[]>();
  for (const proposal of proposals) {
    const list = map.get(proposal.topicId) ?? [];
    list.push(proposal);
    map.set(proposal.topicId, list);
  }
  return map;
}

export function learningTitles(): { id: string; title: string; principle: string }[] {
  return learnings.map((learning) => ({
    id: learning.id,
    title: learning.title,
    principle: learning.principle,
  }));
}

export { getLearningById };
