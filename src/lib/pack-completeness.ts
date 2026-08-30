import { year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";
import type { ReviewStatus, Topic } from "@/content/schema";
import { validateTopic, type ValidationIssue } from "@/content/validate";
import {
  filterPendingRevisions,
  groupRevisionsByTopic,
  readCommittedDecisions,
  scanLearningRevisions,
  type LearningDecisionRecord,
  type ProposedRevision,
} from "@/lib/learning-revisions";

export type PackCompleteness = {
  topicId: string;
  topicTitle: string;
  shortTitle: string;
  reviewStatus: ReviewStatus;
  structuralOk: boolean;
  structuralIssues: ValidationIssue[];
  pendingLearningRevisions: number;
  readyToMarkReviewed: boolean;
};

export type GlobalRevisionSweep = {
  version: 1;
  triggeredByTopicId: string;
  triggeredAt: string;
  draftTopicIds: string[];
  pending: ProposedRevision[];
};

export function assessPackCompleteness(
  topic: Topic,
  decisions: LearningDecisionRecord[] = readCommittedDecisions(),
): PackCompleteness {
  const structuralIssues = validateTopic(topic);
  const pending = filterPendingRevisions(scanLearningRevisions([topic]), decisions);

  return {
    topicId: topic.id,
    topicTitle: topic.title,
    shortTitle: topic.shortTitle,
    reviewStatus: topic.reviewStatus,
    structuralOk: structuralIssues.length === 0,
    structuralIssues,
    pendingLearningRevisions: pending.length,
    readyToMarkReviewed:
      topic.reviewStatus === "draft" && structuralIssues.length === 0 && pending.length === 0,
  };
}

export function assessAllPacks(
  topics: Topic[] = year1MathsTopics,
  decisions: LearningDecisionRecord[] = readCommittedDecisions(),
): PackCompleteness[] {
  return topics.map((topic) => assessPackCompleteness(topic, decisions));
}

export function draftTopics(topics: Topic[] = year1MathsTopics): Topic[] {
  return topics.filter((topic) => topic.reviewStatus === "draft");
}

export function planGlobalRevisionSweep(
  completedTopicId: string,
  topics: Topic[] = year1MathsTopics,
  decisions: LearningDecisionRecord[] = readCommittedDecisions(),
): GlobalRevisionSweep {
  const drafts = draftTopics(topics);
  const proposals = filterPendingRevisions(scanLearningRevisions(drafts), decisions);

  return {
    version: 1,
    triggeredByTopicId: completedTopicId,
    triggeredAt: new Date().toISOString(),
    draftTopicIds: drafts.map((topic) => topic.id),
    pending: proposals,
  };
}

export function groupSweepByLearning(sweep: GlobalRevisionSweep): Map<string, ProposedRevision[]> {
  const map = new Map<string, ProposedRevision[]>();
  for (const revision of sweep.pending) {
    const list = map.get(revision.learningId) ?? [];
    list.push(revision);
    map.set(revision.learningId, list);
  }
  return map;
}

export function summarizeCompleteness(reports: PackCompleteness[]): {
  draftCount: number;
  readyCount: number;
  pendingLearningCount: number;
  byTopic: Map<string, ProposedRevision[]>;
} {
  const decisions = readCommittedDecisions();
  const pending = filterPendingRevisions(scanLearningRevisions(), decisions);
  return {
    draftCount: reports.filter((report) => report.reviewStatus === "draft").length,
    readyCount: reports.filter((report) => report.readyToMarkReviewed).length,
    pendingLearningCount: pending.length,
    byTopic: groupRevisionsByTopic(pending),
  };
}
