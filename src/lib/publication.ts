import type { Topic } from "@/content/schema";
import type { LivePublicationMap } from "@/lib/pack-publish-api";
import type { PackReleaseEntry, PackReleaseFile } from "@/lib/pack-release";
import { readPackReleaseFile } from "@/lib/pack-release";

export type PublicationStatus = "draft" | "live" | "suspended";

export function resolvePublicationStatus(
  entry: PackReleaseEntry | undefined,
  topicReviewStatus: Topic["reviewStatus"],
  liveMap?: LivePublicationMap,
  topicId?: string,
): PublicationStatus {
  if (topicId && liveMap?.[topicId]) {
    return liveMap[topicId];
  }
  if (entry?.suspendedAt) return "suspended";
  if (entry?.releasedAt || topicReviewStatus === "reviewed") return "live";
  return "draft";
}

export function liveTopics(
  topics: Topic[],
  releaseFile: PackReleaseFile = readPackReleaseFile(),
  liveMap?: LivePublicationMap,
): Topic[] {
  return topics.filter(
    (topic) =>
      resolvePublicationStatus(releaseFile.entries[topic.id], topic.reviewStatus, liveMap, topic.id) === "live",
  );
}

export function draftTopicsForParents(
  topics: Topic[],
  releaseFile: PackReleaseFile = readPackReleaseFile(),
  liveMap?: LivePublicationMap,
): Topic[] {
  return topics.filter(
    (topic) =>
      resolvePublicationStatus(releaseFile.entries[topic.id], topic.reviewStatus, liveMap, topic.id) === "draft",
  );
}

export function suspendedTopics(
  topics: Topic[],
  releaseFile: PackReleaseFile = readPackReleaseFile(),
  liveMap?: LivePublicationMap,
): Topic[] {
  return topics.filter(
    (topic) =>
      resolvePublicationStatus(releaseFile.entries[topic.id], topic.reviewStatus, liveMap, topic.id) === "suspended",
  );
}
