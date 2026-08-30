import packReleaseFile from "@/content/pack-release.json";
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

export type PackReleaseFile = {
  version: number;
  activeCandidateId: string | null;
  entries: Record<string, PackReleaseEntry>;
};

export type PackReleaseEntry = {
  topicId: string;
  candidateSince?: string;
  packRecheckedAt?: string;
  packRecheckNote?: string;
  videoRecheckedAt?: string;
  videoRecheckNote?: string;
  releasedAt?: string;
  releaseNote?: string;
};

export type VideoReleaseSignal =
  | { kind: "none" }
  | { kind: "has-video" }
  | { kind: "missing" }
  | { kind: "stale"; reportHash: string; currentHash: string }
  | { kind: "failed" }
  | { kind: "current"; reportHash: string };

export type PackReleaseStatus = {
  topicId: string;
  topicTitle: string;
  shortTitle: string;
  reviewStatus: ReviewStatus;
  isActiveCandidate: boolean;
  automaticBlockers: string[];
  structuralOk: boolean;
  structuralIssues: ValidationIssue[];
  pendingLearningRevisions: number;
  hasVideo: boolean;
  video: VideoReleaseSignal;
  packRechecked: boolean;
  packRecheckedAt?: string;
  videoRecheckRequired: boolean;
  videoRechecked: boolean;
  videoRecheckedAt?: string;
  canSweepCorpus: boolean;
};

export type GlobalRevisionSweep = {
  version: 1;
  triggeredByTopicId: string;
  triggeredAt: string;
  draftTopicIds: string[];
  pending: ProposedRevision[];
};

export function readPackReleaseFile(): PackReleaseFile {
  return packReleaseFile as PackReleaseFile;
}

export function assessVideoReleaseSignal(topic: Topic): VideoReleaseSignal {
  if (!topic.parentVideo) return { kind: "none" };
  return { kind: "has-video" };
}

export function assessPackRelease(
  topic: Topic,
  releaseFile: PackReleaseFile = readPackReleaseFile(),
  decisions: LearningDecisionRecord[] = readCommittedDecisions(),
): PackReleaseStatus {
  const structuralIssues = validateTopic(topic);
  const pending = filterPendingRevisions(scanLearningRevisions([topic]), decisions);
  const entry = releaseFile.entries[topic.id];
  const video = assessVideoReleaseSignal(topic);
  const hasVideo = video.kind !== "none";

  const automaticBlockers: string[] = [];
  for (const issue of structuralIssues) {
    automaticBlockers.push(`${issue.field}: ${issue.message}`);
  }
  if (pending.length > 0) {
    automaticBlockers.push(`${pending.length} pending pack learning revision(s) for this lesson`);
  }

  const packRechecked = Boolean(entry?.packRecheckedAt);
  const videoRecheckRequired = hasVideo;
  const videoRechecked = hasVideo ? Boolean(entry?.videoRecheckedAt) : true;

  return {
    topicId: topic.id,
    topicTitle: topic.title,
    shortTitle: topic.shortTitle,
    reviewStatus: topic.reviewStatus,
    isActiveCandidate: releaseFile.activeCandidateId === topic.id,
    automaticBlockers,
    structuralOk: structuralIssues.length === 0,
    structuralIssues,
    pendingLearningRevisions: pending.length,
    hasVideo,
    video,
    packRechecked,
    packRecheckedAt: entry?.packRecheckedAt,
    videoRecheckRequired,
    videoRechecked,
    videoRecheckedAt: entry?.videoRecheckedAt,
    canSweepCorpus: automaticBlockers.length === 0,
  };
}

export function assessAllPackReleases(
  topics: Topic[],
  releaseFile: PackReleaseFile = readPackReleaseFile(),
  decisions: LearningDecisionRecord[] = readCommittedDecisions(),
): PackReleaseStatus[] {
  return topics.map((topic) => assessPackRelease(topic, releaseFile, decisions));
}

export function releaseBlockers(status: PackReleaseStatus): string[] {
  const blockers = [...status.automaticBlockers];
  if (!status.isActiveCandidate) {
    blockers.push("not the active release candidate — set with --candidate first");
  }
  if (!status.packRechecked) {
    blockers.push("pack not rechecked after edits — confirm with --confirm-pack after reading on site");
  }
  if (status.videoRecheckRequired && !status.videoRechecked) {
    blockers.push("video not rechecked — re-run rehearsal/render, watch, then --confirm-video");
  }
  if (status.reviewStatus !== "draft") {
    blockers.push(`already ${status.reviewStatus}`);
  }
  return blockers;
}

export function draftTopics(topics: Topic[]): Topic[] {
  return topics.filter((topic) => topic.reviewStatus === "draft");
}

export function planGlobalRevisionSweep(
  completedTopicId: string,
  topics: Topic[],
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

export function summarizePackReleases(reports: PackReleaseStatus[]): {
  draftCount: number;
  activeCandidateId: string | null;
  pendingLearningCount: number;
  byTopic: Map<string, ProposedRevision[]>;
} {
  const decisions = readCommittedDecisions();
  const pending = filterPendingRevisions(scanLearningRevisions(), decisions);
  const releaseFile = readPackReleaseFile();

  return {
    draftCount: reports.filter((report) => report.reviewStatus === "draft").length,
    activeCandidateId: releaseFile.activeCandidateId,
    pendingLearningCount: pending.length,
    byTopic: groupRevisionsByTopic(pending),
  };
}

export function mergePackReleaseFile(
  committed: PackReleaseFile,
  patch: Partial<PackReleaseFile>,
): PackReleaseFile {
  return {
    version: 1,
    activeCandidateId: patch.activeCandidateId ?? committed.activeCandidateId,
    entries: { ...committed.entries, ...(patch.entries ?? {}) },
  };
}

export function upsertReleaseEntry(
  file: PackReleaseFile,
  topicId: string,
  update: Partial<PackReleaseEntry>,
): PackReleaseFile {
  const existing = file.entries[topicId] ?? { topicId };
  return mergePackReleaseFile(file, {
    entries: {
      [topicId]: { ...existing, ...update, topicId },
    },
  });
}
