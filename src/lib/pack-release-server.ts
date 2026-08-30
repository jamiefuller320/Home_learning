import { buildParentVideoScript } from "@/lib/parent-video-script";
import { readRehearsalReport, scriptFingerprint } from "@/lib/parent-video-pipeline";
import {
  assessPackRelease,
  type PackReleaseFile,
  type PackReleaseStatus,
  type VideoReleaseSignal,
} from "@/lib/pack-release";
import type { Topic } from "@/content/schema";
import type { LearningDecisionRecord } from "@/lib/learning-revisions";
import { readCommittedDecisions } from "@/lib/learning-revisions";

export function assessVideoReleaseSignalServer(topic: Topic, root = process.cwd()): VideoReleaseSignal {
  if (!topic.parentVideo) return { kind: "none" };

  const script = buildParentVideoScript(topic);
  const currentHash = scriptFingerprint(script);
  const report = readRehearsalReport(root, topic.id);

  if (!report) return { kind: "missing" };
  if (report.scriptHash !== currentHash) {
    return { kind: "stale", reportHash: report.scriptHash, currentHash };
  }
  if (report.status !== "pass") return { kind: "failed" };
  return { kind: "current", reportHash: currentHash };
}

function videoBlocker(video: VideoReleaseSignal): string | null {
  if (video.kind === "none" || video.kind === "has-video" || video.kind === "current") return null;
  if (video.kind === "missing") {
    return "parent video exists but rehearsal report is missing — run npm run rehearse:parent-video";
  }
  if (video.kind === "stale") {
    return `rehearsal report is stale (${video.reportHash} vs ${video.currentHash}) — re-run rehearsal after pack edits`;
  }
  if (video.kind === "failed") {
    return "rehearsal report failed — fix script and re-run rehearsal";
  }
  return null;
}

/** Server-only assessment — includes rehearsal report checks from disk. */
export function assessPackReleaseServer(
  topic: Topic,
  releaseFile?: PackReleaseFile,
  decisions: LearningDecisionRecord[] = readCommittedDecisions(),
  root = process.cwd(),
): PackReleaseStatus {
  const base = assessPackRelease(topic, releaseFile, decisions);
  if (!topic.parentVideo) return base;

  const video = assessVideoReleaseSignalServer(topic, root);
  const videoIssue = videoBlocker(video);
  if (!videoIssue) {
    return { ...base, video };
  }

  const automaticBlockers = [...base.automaticBlockers, videoIssue];
  return {
    ...base,
    video,
    automaticBlockers,
    canSweepCorpus: automaticBlockers.length === 0,
  };
}
