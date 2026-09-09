import assert from "node:assert/strict";
import {
  entryToPackPublishPatch,
  rowToPackReleaseEntry,
  rowsToPackReleaseFile,
} from "../src/lib/pack-publish-sync";
import { publicationFromRow, rowsToPublicationMap } from "../src/lib/pack-publish-api";

const row = {
  topic_id: "counting-within-100",
  updated_at: "2026-01-01T00:00:00.000Z",
  lesson_approved_at: "2026-01-01T00:00:00.000Z",
  released_at: "2026-01-02T00:00:00.000Z",
  suspended_at: null,
};

const entry = rowToPackReleaseEntry(row);
assert.equal(entry.topicId, "counting-within-100");
assert.equal(entry.lessonApprovedAt, row.lesson_approved_at);

const patch = entryToPackPublishPatch("facts-within-10", {
  topicId: "facts-within-10",
  scriptApprovedAt: "2026-01-03T00:00:00.000Z",
});
assert.equal(patch.topic_id, "facts-within-10");
assert.equal(patch.script_approved_at, "2026-01-03T00:00:00.000Z");
assert.equal("released_at" in patch, false);

const file = rowsToPackReleaseFile(
  { id: 1, active_candidate_id: "counting-within-100", updated_at: row.updated_at },
  [row],
);
assert.equal(file.activeCandidateId, "counting-within-100");
assert.equal(file.entries["counting-within-100"]?.releasedAt, row.released_at);

const map = rowsToPublicationMap([
  { topic_id: "a", released_at: "2026-01-01", suspended_at: null, updated_at: "2026-01-01" },
  { topic_id: "b", released_at: "2026-01-01", suspended_at: "2026-01-02", updated_at: "2026-01-02" },
]);
assert.equal(map.a, "live");
assert.equal(map.b, "suspended");
assert.equal(publicationFromRow({ released_at: null, suspended_at: null }), "draft");

console.log("pack-publish-sync tests passed.");
