import type { Topic } from "@/content/schema";
import type { PackReleaseEntry, PackReleaseFile } from "@/lib/pack-release";
import { readPackReleaseFile } from "@/lib/pack-release";

export type PublicationStatus = "draft" | "live" | "suspended";

export function resolvePublicationStatus(
  entry: PackReleaseEntry | undefined,
  topicReviewStatus: Topic["reviewStatus"],
): PublicationStatus {
  if (entry?.suspendedAt) return "suspended";
  if (entry?.releasedAt || topicReviewStatus === "reviewed") return "live";
  return "draft";
}

export function liveTopics(topics: Topic[], releaseFile: PackReleaseFile = readPackReleaseFile()): Topic[] {
  return topics.filter((topic) => resolvePublicationStatus(releaseFile.entries[topic.id], topic.reviewStatus) === "live");
}

export function draftTopicsForParents(
  topics: Topic[],
  releaseFile: PackReleaseFile = readPackReleaseFile(),
): Topic[] {
  return topics.filter((topic) => resolvePublicationStatus(releaseFile.entries[topic.id], topic.reviewStatus) === "draft");
}
