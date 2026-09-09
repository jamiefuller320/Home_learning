import type { Topic } from "@/content/schema";
import {
  assessPackRelease,
  readPackReleaseFile,
  type PackReleaseEntry,
  type PackReleaseFile,
  type PackReleaseStatus,
} from "@/lib/pack-release";
import { buildScriptPreviewBundle, type ScriptPreviewBundle } from "@/lib/pack-script-preview";
import { draftTopicsForParents, liveTopics, resolvePublicationStatus, type PublicationStatus } from "@/lib/publication";

export type { PublicationStatus, ScriptPreviewBundle };
export { buildScriptPreviewBundle, draftTopicsForParents, liveTopics, resolvePublicationStatus };

export const PUBLISH_STAGES = [
  "editing",
  "script_review",
  "video_pending",
  "video_review",
  "final_check",
  "ready_to_release",
  "live",
  "suspended",
] as const;

export type PublishStage = (typeof PUBLISH_STAGES)[number];

export type PublishWorkflowView = {
  topicId: string;
  topicTitle: string;
  shortTitle: string;
  stage: PublishStage;
  publicationStatus: PublicationStatus;
  isActiveCandidate: boolean;
  blockers: string[];
  releaseStatus: PackReleaseStatus;
  entry?: PackReleaseEntry;
  scriptHash?: string;
  scriptStale: boolean;
  nextAction?: PublishAction;
};

export type PublishAction =
  | "approve_lesson"
  | "approve_script"
  | "queue_video"
  | "approve_video"
  | "final_check"
  | "release"
  | "suspend"
  | "restore";

export type PublishRequest = {
  version: 1;
  action: "write-script" | "generate-video" | "release" | "suspend" | "restore";
  topicId: string;
  requestedAt: string;
  note?: string;
  script?: ScriptPreviewBundle["scriptJson"];
  scriptMarkdown?: string;
  packRelease?: PackReleaseFile;
};

const STAGE_LABEL: Record<PublishStage, string> = {
  editing: "Pack in progress",
  script_review: "Script ready for review",
  video_pending: "Video generating",
  video_review: "Video ready for review",
  final_check: "Final check",
  ready_to_release: "Ready to release",
  live: "Live",
  suspended: "Suspended",
};

export function publishStageLabel(stage: PublishStage): string {
  return STAGE_LABEL[stage];
}

export function resolvePublishStage(entry: PackReleaseEntry | undefined, topic: Topic): PublishStage {
  const publication = resolvePublicationStatus(entry, topic.reviewStatus);
  if (publication === "suspended") return "suspended";
  if (publication === "live") return "live";
  if (entry?.finalCheckedAt) return "ready_to_release";
  if (entry?.videoApprovedAt) return "final_check";
  if (entry?.scriptApprovedAt && !entry.videoGeneratedAt) return "video_pending";
  if (entry?.videoGeneratedAt && !entry.videoApprovedAt) return "video_review";
  if (entry?.scriptGeneratedAt || entry?.lessonApprovedAt) return "script_review";
  return "editing";
}

function lessonApprovalBlockers(status: PackReleaseStatus): string[] {
  const blockers = [...status.automaticBlockers];
  if (!status.isActiveCandidate) {
    blockers.push("Set this pack as the active candidate first");
  }
  return blockers;
}

function releaseWorkflowBlockers(entry: PackReleaseEntry | undefined, status: PackReleaseStatus): string[] {
  const blockers: string[] = [];
  if (!entry?.lessonApprovedAt) blockers.push("Lesson not approved");
  if (!entry?.scriptGeneratedAt) blockers.push("Script not generated");
  if (!entry?.scriptApprovedAt) blockers.push("Script not approved");
  if (!entry?.videoGeneratedAt) blockers.push("Video not generated");
  if (!entry?.videoApprovedAt) blockers.push("Video not approved");
  if (!entry?.finalCheckedAt) blockers.push("Final check not complete");
  if (status.reviewStatus !== "draft") blockers.push(`Already ${status.reviewStatus}`);
  if (!status.isActiveCandidate) blockers.push("Not the active release candidate");
  return blockers;
}

export function nextPublishAction(stage: PublishStage, blockers: string[]): PublishAction | undefined {
  if (blockers.length > 0 && stage !== "live" && stage !== "suspended") return undefined;
  switch (stage) {
    case "editing":
      return "approve_lesson";
    case "script_review":
      return "approve_script";
    case "video_pending":
      return "queue_video";
    case "video_review":
      return "approve_video";
    case "final_check":
      return "final_check";
    case "ready_to_release":
      return "release";
    case "live":
      return "suspend";
    case "suspended":
      return "restore";
    default:
      return undefined;
  }
}

export function publishActionLabel(action: PublishAction): string {
  switch (action) {
    case "approve_lesson":
      return "Approve lesson";
    case "approve_script":
      return "Approve script";
    case "queue_video":
      return "Generate video";
    case "approve_video":
      return "Approve video";
    case "final_check":
      return "Final check OK";
    case "release":
      return "Release live";
    case "suspend":
      return "Suspend";
    case "restore":
      return "Restore live";
  }
}

export function assessPublishWorkflow(
  topic: Topic,
  releaseFile: PackReleaseFile = readPackReleaseFile(),
): PublishWorkflowView {
  const entry = releaseFile.entries[topic.id];
  const preview = buildScriptPreviewBundle(topic);
  const releaseStatus = assessPackRelease(topic, releaseFile);
  const scriptStale = Boolean(
    entry?.scriptHashAtGeneration && entry.scriptHashAtGeneration !== preview.hash,
  );
  const stage = resolvePublishStage(entry, topic);

  let blockers: string[] = [];
  if (stage === "editing") {
    blockers = lessonApprovalBlockers(releaseStatus);
  } else if (stage === "script_review" && scriptStale) {
    blockers = ["Pack changed since script was generated — re-approve the lesson to refresh the script"];
  } else if (stage === "ready_to_release") {
    blockers = releaseWorkflowBlockers(entry, releaseStatus);
  } else if (stage === "live" || stage === "suspended") {
    blockers = [];
  }

  const nextAction = nextPublishAction(stage, blockers);

  return {
    topicId: topic.id,
    topicTitle: topic.title,
    shortTitle: topic.shortTitle,
    stage,
    publicationStatus: resolvePublicationStatus(entry, topic.reviewStatus),
    isActiveCandidate: releaseStatus.isActiveCandidate,
    blockers,
    releaseStatus,
    entry,
    scriptHash: preview.hash,
    scriptStale,
    nextAction,
  };
}

export function assessAllPublishWorkflows(
  topics: Topic[],
  releaseFile: PackReleaseFile = readPackReleaseFile(),
): PublishWorkflowView[] {
  return topics.map((topic) => assessPublishWorkflow(topic, releaseFile));
}

export function buildPublishRequest(
  action: PublishRequest["action"],
  topic: Topic,
  releaseFile: PackReleaseFile,
  note?: string,
): PublishRequest {
  const preview = buildScriptPreviewBundle(topic);
  return {
    version: 1,
    action,
    topicId: topic.id,
    requestedAt: new Date().toISOString(),
    note,
    script: preview.scriptJson,
    scriptMarkdown: preview.scriptMarkdown,
    packRelease: releaseFile,
  };
}
