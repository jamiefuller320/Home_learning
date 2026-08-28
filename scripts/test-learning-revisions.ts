import assert from "node:assert/strict";
import type { Topic } from "../src/content/schema";
import { learnings } from "../src/content/learnings";
import {
  filterPendingRevisions,
  scanLearningRevisions,
} from "../src/lib/learning-revisions";

const sample: Topic = {
  id: "sample-topic",
  slug: "sample-topic",
  title: "Sample topic",
  shortTitle: "Sample",
  summary: "Summary",
  jurisdiction: "england",
  keyStage: "ks1",
  year: 1,
  subject: "maths",
  strand: "Number",
  prerequisites: [],
  glossaryTerms: [],
  parentMinutes: 6,
  homeMinutes: 12,
  householdItems: ["Ten objects (forks and spoons, red and green Lego)"],
  statutoryOutcomes: ["Count to 10"],
  readyToProgress: [],
  sources: [{ label: "NC", url: "https://example.com", note: "OGL" }],
  whyThisMatters: "If counting is only a song that starts at 1, they get stuck.",
  parentBriefing: {
    inPlainEnglish: "Plain English.",
    howSchoolTeachesIt: "Teachers avoid the 1, 2, 3 song.",
    sayThis: ["What comes next?"],
    avoidThis: ["Racing"],
    commonMisconceptions: [
      { misconception: "Skip teens", why: "Sound alike", instead: "Slow down" },
      { misconception: "Recount", why: "Two skills", instead: "Move objects" },
    ],
    youAreReadyWhen: "You can count on ten.",
  },
  homePack: {
    setup: "Clear the table.",
    activity: { title: "Count", steps: ["One", "Two", "Three"] },
    check: [
      { prompt: "Count on", looksLike: "Steady", notYet: "Restart" },
      { prompt: "Count back", looksLike: "Steady", notYet: "Stuck", nudge: "Step down one." },
      { prompt: "How many?", looksLike: "Last number", notYet: "Guess" },
    ],
    stopRule: "Stop after 12 minutes.",
  },
  reviewStatus: "draft",
};

const proposals = scanLearningRevisions([sample], learnings);
assert.ok(proposals.some((item) => item.learningId === "no-song-that-starts-at-1"));
assert.ok(proposals.some((item) => item.learningId === "no-counting-as-song"));
assert.ok(proposals.some((item) => item.learningId === "check-needs-nudge"));
assert.ok(proposals.some((item) => item.learningId === "household-examples-such-as"));

const pending = filterPendingRevisions(proposals, [
  { revisionId: proposals[0]!.id, decision: "declined", decidedAt: "2026-08-27T00:00:00.000Z" },
]);
assert.equal(pending.length, proposals.length - 1);
assert.ok(!pending.some((item) => item.id === proposals[0]!.id));

const live = scanLearningRevisions();
assert.ok(!live.some((item) => item.topicId === "counting-within-100" && item.learningId === "no-counting-as-song"));
assert.ok(!live.some((item) => item.topicId === "comparing-length" && item.learningId === "check-needs-nudge"));
assert.ok(!live.some((item) => item.topicId === "number-words-to-20" && item.learningId === "household-examples-such-as"));
assert.ok(!live.some((item) => item.topicId === "coins" && item.learningId === "household-examples-such-as"));

console.log("learning-revisions tests passed.");
