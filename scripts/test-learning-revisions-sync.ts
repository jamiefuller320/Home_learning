import assert from "node:assert/strict";
import {
  acceptedSnapshotsFromRows,
  mergeDecisionRecords,
  revisionToDecisionRow,
  rowToDecisionRecord,
} from "../src/lib/learning-revisions-sync";
import type { ProposedRevision } from "../src/lib/learning-revisions";

const sampleRevision: ProposedRevision = {
  id: "rev-abff0d8c",
  learningId: "say-this-listen-for",
  learningTitle: "Say this prompts can reveal what you might hear",
  topicId: "facts-within-10",
  topicTitle: "Number facts within 10",
  fieldPath: "parentBriefing.sayThis",
  before: "6 and what make 10?",
  after: "Add listenFor on prompts that have a clear expected response (see parts-of-10).",
  rationale: "Optional: when a prompt has a clear expected response, add listenFor so parents can check without coaching the child.",
  kind: "structure",
};

const acceptedRow = revisionToDecisionRow(sampleRevision, "accepted");
assert.equal(acceptedRow.revision_id, "rev-abff0d8c");
assert.equal(acceptedRow.topic_id, "facts-within-10");
assert.deepEqual(acceptedRow.revision_snapshot, sampleRevision);

const declinedRow = revisionToDecisionRow(sampleRevision, "declined");
assert.equal(declinedRow.revision_snapshot, null);

const record = rowToDecisionRecord(acceptedRow);
assert.equal(record.revisionId, "rev-abff0d8c");
assert.equal(record.decision, "accepted");

const snapshots = acceptedSnapshotsFromRows([acceptedRow, declinedRow]);
assert.equal(snapshots.length, 1);
assert.equal(snapshots[0]?.id, "rev-abff0d8c");

const merged = mergeDecisionRecords(
  [{ revisionId: "rev-a", decision: "declined", decidedAt: "2026-01-01T00:00:00.000Z" }],
  [{ revisionId: "rev-a", decision: "accepted", decidedAt: "2026-01-02T00:00:00.000Z" }],
);
assert.equal(merged.length, 1);
assert.equal(merged[0]?.decision, "accepted");

console.log("learning-revisions-sync tests passed.");
