import type { LearningDecisionRecord, ProposedRevision } from "@/lib/learning-revisions";

export type LearningRevisionDecisionRow = {
  revision_id: string;
  topic_id: string;
  learning_id: string;
  decision: "accepted" | "declined";
  decided_at: string;
  note: string | null;
  revision_snapshot: ProposedRevision | null;
};

export function rowToDecisionRecord(row: LearningRevisionDecisionRow): LearningDecisionRecord {
  return {
    revisionId: row.revision_id,
    decision: row.decision,
    decidedAt: row.decided_at,
    note: row.note ?? undefined,
  };
}

export function revisionToDecisionRow(
  revision: ProposedRevision,
  decision: "accepted" | "declined",
  note?: string,
): LearningRevisionDecisionRow {
  return {
    revision_id: revision.id,
    topic_id: revision.topicId,
    learning_id: revision.learningId,
    decision,
    decided_at: new Date().toISOString(),
    note: note ?? null,
    revision_snapshot: decision === "accepted" ? revision : null,
  };
}

export function rowsToDecisionRecords(rows: LearningRevisionDecisionRow[]): LearningDecisionRecord[] {
  return rows.map(rowToDecisionRecord);
}

export function acceptedSnapshotsFromRows(rows: LearningRevisionDecisionRow[]): ProposedRevision[] {
  return rows
    .filter((row) => row.decision === "accepted" && row.revision_snapshot)
    .map((row) => row.revision_snapshot as ProposedRevision);
}

export function mergeDecisionRecords(...sources: LearningDecisionRecord[][]): LearningDecisionRecord[] {
  const byId = new Map<string, LearningDecisionRecord>();
  for (const source of sources) {
    for (const decision of source) {
      byId.set(decision.revisionId, decision);
    }
  }
  return [...byId.values()].sort((a, b) => a.revisionId.localeCompare(b.revisionId));
}
