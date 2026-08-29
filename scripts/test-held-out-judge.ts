import assert from "node:assert/strict";
import { year1MathsTopics } from "../src/content/england/ks1/year-1/maths/topics";
import { factsWithin10 } from "../src/content/england/ks1/year-1/maths/topics/facts-within-10";
import { shapesAroundUs } from "../src/content/england/ks1/year-1/maths/topics/shapes-around-us";
import {
  FROZEN_EVAL_CASES,
  judgeAfterEdit,
  judgeExtractedScript,
  judgeTopic,
  proposeCoversFromMisses,
  scoreCoverage,
} from "../src/lib/held-out-judge";
import {
  JUDGE_FIXTURES,
  fixtureAccuracy,
  fixtureAmbiguity,
  fixtureAssumed,
  fixtureStyle,
  makeJudgeFixture,
} from "../src/lib/held-out-judge/fixtures";

const catalog = [...JUDGE_FIXTURES, ...year1MathsTopics];

const style = judgeTopic(fixtureStyle, catalog);
assert.ok(
  style.findings.some((item) => item.coverId === "style-on-the-board"),
  "classroom shorthand should fail style",
);
assert.ok(
  style.findings.some((item) => item.coverId === "learning-no-counting-as-song"),
  "phrase learnings should still fire",
);

const accuracy = judgeTopic(fixtureAccuracy, catalog);
assert.ok(
  accuracy.findings.some((item) => item.check === "accuracy" && item.coverId === "accuracy-bigger-in-head"),
  "banned method as instruction should fail accuracy",
);

const ambiguity = judgeTopic(fixtureAmbiguity, catalog);
assert.ok(
  ambiguity.findings.some((item) => item.check === "ambiguity" && /Picture A/.test(item.evidence)),
  "two-picture evidence is required for ambiguity",
);

const assumed = judgeTopic(fixtureAssumed, catalog);
assert.ok(
  assumed.findings.some((item) => item.check === "assumedKnowledge" && item.coverId === "term-gloss-ten-frame"),
  "own term without a gloss should fail assumed knowledge",
);

const glossed = makeJudgeFixture({
  id: "fixture-glossed",
  title: "Glossed ten-frame",
  glossaryTerms: ["ten-frame"],
  parentBriefing: {
    inPlainEnglish: "A ten-frame is a grid of exactly ten spaces, two rows of five. Show 7 on it.",
    howSchoolTeachesIt: "Keep it short.",
    sayThis: ["What comes next?"],
    avoidThis: ["Racing.", "Doing the thinking for them."],
    commonMisconceptions: [
      { misconception: "They skip teens.", why: "Sound alike.", instead: "Slow down." },
      { misconception: "They recount.", why: "Two skills.", instead: "Move objects." },
    ],
    youAreReadyWhen: "You can say the idea in your own words.",
  },
});
const glossedReport = judgeTopic(glossed, [glossed]);
assert.equal(
  glossedReport.findings.filter((item) => item.coverId === "term-gloss-ten-frame").length,
  0,
  "same-sentence gloss should unlock the term",
);

const facts = judgeTopic(factsWithin10, year1MathsTopics);
assert.equal(
  facts.findings.filter((item) => item.check === "assumedKnowledge" && item.span.toLowerCase().includes("number fact is a small truth"))
    .length,
  0,
  "facts-within-10 already glosses number fact",
);

const numbers = judgeTopic(
  year1MathsTopics.find((topic) => topic.id === "numbers-to-20")!,
  year1MathsTopics,
);
assert.equal(
  numbers.findings.filter((item) => item.coverId === "ambiguity-the-middle").length,
  0,
  "middle of a named number line is not ambiguous",
);

const countingInSteps = judgeTopic(
  year1MathsTopics.find((topic) => topic.id === "counting-in-steps")!,
  year1MathsTopics,
);
assert.ok(
  countingInSteps.findings.some((item) => item.coverId === "term-unlock-ten-frame"),
  "counting-in-steps uses ten-frames without that lesson as a prerequisite",
);

const shapesScript = judgeExtractedScript(shapesAroundUs, year1MathsTopics);
assert.ok(
  shapesScript.findings.some((item) => item.check === "coherence" && item.coverId.startsWith("script-invent-")),
  "the same judge must catch a compiled script that invents a ten-frame",
);

const factsScript = judgeExtractedScript(factsWithin10, year1MathsTopics);
assert.equal(
  factsScript.findings.filter((item) => item.coverId.startsWith("script-invent-")).length,
  0,
  "facts-within-10 script may reuse terms already in the pack",
);

const stripTenFrame = (text: string) => text.replace(/ten-frames?/gi, "grid");
const edited = {
  ...factsWithin10,
  parentBriefing: {
    ...factsWithin10.parentBriefing,
    inPlainEnglish: stripTenFrame(factsWithin10.parentBriefing.inPlainEnglish),
    howSchoolTeachesIt: stripTenFrame(factsWithin10.parentBriefing.howSchoolTeachesIt),
    sayThis: factsWithin10.parentBriefing.sayThis.map((item) =>
      typeof item === "string" ? stripTenFrame(item) : { ...item, prompt: stripTenFrame(item.prompt) },
    ),
    youAreReadyWhen: stripTenFrame(factsWithin10.parentBriefing.youAreReadyWhen),
    commonMisconceptions: factsWithin10.parentBriefing.commonMisconceptions.map((item) => ({
      misconception: stripTenFrame(item.misconception),
      why: stripTenFrame(item.why),
      instead: stripTenFrame(item.instead),
    })),
  },
};
const afterEdit = judgeAfterEdit(factsWithin10, edited, year1MathsTopics);
assert.ok(
  afterEdit.findings.some((item) => item.coverId === "coherence-dropped-ten-frame"),
  "dropping a term from the briefing but leaving it in the pack should fail coherence",
);

const fixtureReports = JUDGE_FIXTURES.map((topic) => judgeTopic(topic, catalog));
const liveReports = year1MathsTopics.map((topic) => judgeTopic(topic, year1MathsTopics));
const scriptReports = [factsScript, shapesScript];
const coverage = scoreCoverage(FROZEN_EVAL_CASES, [...fixtureReports, ...liveReports, ...scriptReports]);

assert.equal(coverage.misses, 0, `frozen eval misses: ${coverage.rows.filter((row) => row.outcome === "miss").map((row) => row.caseId).join(", ")}`);
assert.equal(coverage.noise, 0, `frozen eval noise: ${coverage.rows.filter((row) => row.outcome === "noise").map((row) => row.caseId).join(", ")}`);
assert.ok(coverage.hits >= 6, "fixture cases should hit");
assert.equal(proposeCoversFromMisses(FROZEN_EVAL_CASES, coverage).length, 0);

const twoMisses = scoreCoverage(
  [
    { id: "m1", topicId: "none", excerpt: "mystery jargon", expectedCheck: "style", note: "a", source: "fixture" },
    { id: "m2", topicId: "none", excerpt: "more mystery jargon", expectedCheck: "style", note: "b", source: "fixture" },
  ],
  [],
);
const covers = proposeCoversFromMisses(
  [
    { id: "m1", topicId: "none", excerpt: "mystery jargon", expectedCheck: "style", note: "a", source: "fixture" },
    { id: "m2", topicId: "none", excerpt: "more mystery jargon", expectedCheck: "style", note: "b", source: "fixture" },
  ],
  twoMisses,
);
assert.equal(covers.length, 1);
assert.equal(covers[0]?.kind, "phrase");
assert.match(covers[0]?.suggestedFind ?? "", /mystery/);

console.log(
  `Held-out judge: ${liveReports.reduce((sum, report) => sum + report.findings.length, 0)} live findings, script recheck reused, frozen eval ${coverage.hits} hits.`,
);
