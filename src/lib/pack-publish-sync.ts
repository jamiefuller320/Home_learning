import type { PackReleaseEntry, PackReleaseFile } from "@/lib/pack-release";

export type PackPublishMetaRow = {
  id: number;
  active_candidate_id: string | null;
  updated_at: string;
};

export type PackPublishStateRow = {
  topic_id: string;
  updated_at: string;
  candidate_since?: string | null;
  pack_rechecked_at?: string | null;
  pack_recheck_note?: string | null;
  video_rechecked_at?: string | null;
  video_recheck_note?: string | null;
  lesson_approved_at?: string | null;
  lesson_approval_note?: string | null;
  script_generated_at?: string | null;
  script_hash_at_generation?: string | null;
  script_approved_at?: string | null;
  script_approval_note?: string | null;
  video_generated_at?: string | null;
  video_generated_hash?: string | null;
  video_approved_at?: string | null;
  video_approval_note?: string | null;
  final_checked_at?: string | null;
  final_check_note?: string | null;
  released_at?: string | null;
  release_note?: string | null;
  suspended_at?: string | null;
  suspend_note?: string | null;
  restored_at?: string | null;
};

export type LessonPublicationRow = {
  topic_id: string;
  released_at: string | null;
  suspended_at: string | null;
  updated_at: string;
};

function pickIso(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return value;
}

function pickText(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function rowToPackReleaseEntry(row: PackPublishStateRow): PackReleaseEntry {
  return {
    topicId: row.topic_id,
    candidateSince: pickIso(row.candidate_since),
    packRecheckedAt: pickIso(row.pack_rechecked_at),
    packRecheckNote: pickText(row.pack_recheck_note),
    videoRecheckedAt: pickIso(row.video_rechecked_at),
    videoRecheckNote: pickText(row.video_recheck_note),
    lessonApprovedAt: pickIso(row.lesson_approved_at),
    lessonApprovalNote: pickText(row.lesson_approval_note),
    scriptGeneratedAt: pickIso(row.script_generated_at),
    scriptHashAtGeneration: pickText(row.script_hash_at_generation),
    scriptApprovedAt: pickIso(row.script_approved_at),
    scriptApprovalNote: pickText(row.script_approval_note),
    videoGeneratedAt: pickIso(row.video_generated_at),
    videoGeneratedHash: pickText(row.video_generated_hash),
    videoApprovedAt: pickIso(row.video_approved_at),
    videoApprovalNote: pickText(row.video_approval_note),
    finalCheckedAt: pickIso(row.final_checked_at),
    finalCheckNote: pickText(row.final_check_note),
    releasedAt: pickIso(row.released_at),
    releaseNote: pickText(row.release_note),
    suspendedAt: pickIso(row.suspended_at),
    suspendNote: pickText(row.suspend_note),
    restoredAt: pickIso(row.restored_at),
  };
}

function assignPatch<T>(target: Partial<PackPublishStateRow>, key: keyof PackPublishStateRow, value: T | undefined) {
  if (value !== undefined) {
    (target as Record<string, unknown>)[key] = value;
  }
}

/** Patch only the fields present in `entry` — avoids wiping untouched columns on upsert. */
export function entryToPackPublishPatch(
  topicId: string,
  entry: Partial<PackReleaseEntry>,
): Partial<PackPublishStateRow> {
  const row: Partial<PackPublishStateRow> = {
    topic_id: topicId,
    updated_at: new Date().toISOString(),
  };
  if ("candidateSince" in entry) assignPatch(row, "candidate_since", entry.candidateSince ?? null);
  if ("packRecheckedAt" in entry) assignPatch(row, "pack_rechecked_at", entry.packRecheckedAt ?? null);
  if ("packRecheckNote" in entry) assignPatch(row, "pack_recheck_note", entry.packRecheckNote ?? null);
  if ("videoRecheckedAt" in entry) assignPatch(row, "video_rechecked_at", entry.videoRecheckedAt ?? null);
  if ("videoRecheckNote" in entry) assignPatch(row, "video_recheck_note", entry.videoRecheckNote ?? null);
  if ("lessonApprovedAt" in entry) assignPatch(row, "lesson_approved_at", entry.lessonApprovedAt ?? null);
  if ("lessonApprovalNote" in entry) assignPatch(row, "lesson_approval_note", entry.lessonApprovalNote ?? null);
  if ("scriptGeneratedAt" in entry) assignPatch(row, "script_generated_at", entry.scriptGeneratedAt ?? null);
  if ("scriptHashAtGeneration" in entry) assignPatch(row, "script_hash_at_generation", entry.scriptHashAtGeneration ?? null);
  if ("scriptApprovedAt" in entry) assignPatch(row, "script_approved_at", entry.scriptApprovedAt ?? null);
  if ("scriptApprovalNote" in entry) assignPatch(row, "script_approval_note", entry.scriptApprovalNote ?? null);
  if ("videoGeneratedAt" in entry) assignPatch(row, "video_generated_at", entry.videoGeneratedAt ?? null);
  if ("videoGeneratedHash" in entry) assignPatch(row, "video_generated_hash", entry.videoGeneratedHash ?? null);
  if ("videoApprovedAt" in entry) assignPatch(row, "video_approved_at", entry.videoApprovedAt ?? null);
  if ("videoApprovalNote" in entry) assignPatch(row, "video_approval_note", entry.videoApprovalNote ?? null);
  if ("finalCheckedAt" in entry) assignPatch(row, "final_checked_at", entry.finalCheckedAt ?? null);
  if ("finalCheckNote" in entry) assignPatch(row, "final_check_note", entry.finalCheckNote ?? null);
  if ("releasedAt" in entry) assignPatch(row, "released_at", entry.releasedAt ?? null);
  if ("releaseNote" in entry) assignPatch(row, "release_note", entry.releaseNote ?? null);
  if ("suspendedAt" in entry) assignPatch(row, "suspended_at", entry.suspendedAt ?? null);
  if ("suspendNote" in entry) assignPatch(row, "suspend_note", entry.suspendNote ?? null);
  if ("restoredAt" in entry) assignPatch(row, "restored_at", entry.restoredAt ?? null);
  return row;
}

export function rowsToPackReleaseFile(
  meta: PackPublishMetaRow | null,
  rows: PackPublishStateRow[],
): PackReleaseFile {
  const entries: Record<string, PackReleaseEntry> = {};
  for (const row of rows) {
    entries[row.topic_id] = rowToPackReleaseEntry(row);
  }
  return {
    version: 1,
    activeCandidateId: meta?.active_candidate_id ?? null,
    entries,
  };
}
