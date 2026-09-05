import assert from "node:assert/strict";
import { year1MathsTopics } from "../src/content/england/ks1/year-1/maths/topics";
import { presentationLearnings } from "../src/content/presentation-learnings";
import {
  assessAllPackReleases,
  assessPackRelease,
  mergePackReleaseFile,
  planGlobalRevisionSweep,
  readPackReleaseFile,
  releaseBlockers,
  summarizePackReleases,
  upsertReleaseEntry,
} from "../src/lib/pack-release";
import { validateTopicReviewReady } from "../src/content/validate";

const counting = year1MathsTopics.find((topic) => topic.id === "counting-within-100");
assert.ok(counting);

const report = assessPackRelease(counting);
assert.equal(report.structuralOk, true);
assert.equal(report.reviewStatus, "draft");
assert.ok(!("readyToMarkReviewed" in report));

const candidateFile = mergePackReleaseFile(readPackReleaseFile(), { activeCandidateId: "counting-within-100" });
const candidate = assessPackRelease(counting, candidateFile);
assert.equal(candidate.isActiveCandidate, true);
assert.ok(releaseBlockers(candidate).some((item) => item.includes("pack not rechecked")));

const confirmedFile = upsertReleaseEntry(candidateFile, "counting-within-100", {
  packRecheckedAt: new Date().toISOString(),
  packRecheckNote: "test",
});
const confirmed = assessPackRelease(counting, confirmedFile);
assert.equal(confirmed.packRechecked, true);
assert.ok(!releaseBlockers(confirmed).some((item) => item.includes("pack not rechecked")));

const all = assessAllPackReleases(year1MathsTopics);
assert.equal(all.length, year1MathsTopics.length);
const summary = summarizePackReleases(all);
assert.ok(summary.draftCount > 0);
assert.ok(summary.pendingLearningCount > 0);

const sweep = planGlobalRevisionSweep("counting-within-100", year1MathsTopics);
assert.equal(sweep.version, 1);
assert.equal(sweep.triggeredByTopicId, "counting-within-100");
assert.ok(sweep.draftTopicIds.length > 0);
assert.ok(sweep.pending.length > 0);

assert.equal(validateTopicReviewReady(counting).length, 0);
assert.ok(presentationLearnings.some((learning) => learning.id === "prose-text-pretty"));
assert.ok(presentationLearnings.some((learning) => learning.id === "glossary-inline-everyday"));

console.log("pack-release tests passed.");
