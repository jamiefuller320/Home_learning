import assert from "node:assert/strict";
import { year1MathsTopics } from "../src/content/england/ks1/year-1/maths/topics";
import { presentationLearnings } from "../src/content/presentation-learnings";
import {
  assessAllPacks,
  assessPackCompleteness,
  planGlobalRevisionSweep,
  summarizeCompleteness,
} from "../src/lib/pack-completeness";
import { validateTopicReviewReady } from "../src/content/validate";

const counting = year1MathsTopics.find((topic) => topic.id === "counting-within-100");
assert.ok(counting);

const report = assessPackCompleteness(counting);
assert.equal(report.structuralOk, true);
assert.equal(report.reviewStatus, "draft");

const all = assessAllPacks();
assert.equal(all.length, year1MathsTopics.length);
const summary = summarizeCompleteness(all);
assert.ok(summary.draftCount > 0);
assert.ok(summary.pendingLearningCount > 0);

const sweep = planGlobalRevisionSweep("counting-within-100");
assert.equal(sweep.version, 1);
assert.equal(sweep.triggeredByTopicId, "counting-within-100");
assert.ok(sweep.draftTopicIds.length > 0);
assert.ok(sweep.pending.length > 0);

assert.equal(validateTopicReviewReady(counting).length, 0);
assert.ok(presentationLearnings.some((learning) => learning.id === "prose-text-pretty"));
assert.ok(presentationLearnings.some((learning) => learning.id === "stage-2-meta-what-label"));

console.log("pack-completeness tests passed.");
