import assert from "node:assert/strict";
import { year1MathsTopics } from "../src/content/england/ks1/year-1/maths/topics";
import {
  assessPublishWorkflow,
  resolvePublishStage,
} from "../src/lib/pack-publishing";
import { buildScriptPreviewBundle } from "../src/lib/pack-script-preview";
import { resolvePublicationStatus } from "../src/lib/publication";
import { mergePackReleaseFile, readPackReleaseFile, upsertReleaseEntry } from "../src/lib/pack-release";

const counting = year1MathsTopics.find((topic) => topic.id === "counting-within-100");
assert.ok(counting);

const preview = buildScriptPreviewBundle(counting);
assert.ok(preview.hash.length >= 8);
assert.ok(preview.scriptJson.beats.length > 0);

const candidateFile = mergePackReleaseFile(readPackReleaseFile(), { activeCandidateId: "counting-within-100" });
const editing = assessPublishWorkflow(counting, candidateFile);
assert.equal(editing.stage, "editing");
assert.ok(editing.blockers.some((item) => item.includes("active candidate")) === false);
assert.equal(editing.nextAction, "approve_lesson");

const lessonApproved = upsertReleaseEntry(candidateFile, "counting-within-100", {
  lessonApprovedAt: new Date().toISOString(),
  scriptGeneratedAt: new Date().toISOString(),
  scriptHashAtGeneration: preview.hash,
});
const scriptReview = assessPublishWorkflow(counting, lessonApproved);
assert.equal(scriptReview.stage, "script_review");
assert.equal(scriptReview.nextAction, "approve_script");

const scriptApproved = upsertReleaseEntry(lessonApproved, "counting-within-100", {
  scriptApprovedAt: new Date().toISOString(),
});
assert.equal(resolvePublishStage(scriptApproved.entries["counting-within-100"], counting), "video_pending");

const videoReady = upsertReleaseEntry(scriptApproved, "counting-within-100", {
  videoGeneratedAt: new Date().toISOString(),
  videoGeneratedHash: preview.hash,
});
const videoReview = assessPublishWorkflow(counting, videoReady);
assert.equal(videoReview.stage, "video_review");
assert.equal(videoReview.nextAction, "approve_video");

const released = upsertReleaseEntry(videoReady, "counting-within-100", {
  videoApprovedAt: new Date().toISOString(),
  finalCheckedAt: new Date().toISOString(),
  releasedAt: new Date().toISOString(),
});
assert.equal(resolvePublicationStatus(released.entries["counting-within-100"], "reviewed"), "live");

const suspended = upsertReleaseEntry(released, "counting-within-100", {
  suspendedAt: new Date().toISOString(),
});
assert.equal(resolvePublicationStatus(suspended.entries["counting-within-100"], "reviewed"), "suspended");

console.log("pack-publishing tests passed.");
