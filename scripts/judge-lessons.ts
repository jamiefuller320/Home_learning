/**
 * Run the held-out judge on Year 1 packs, and optionally on compiled video scripts.
 *
 *   npx tsx scripts/judge-lessons.ts
 *   npx tsx scripts/judge-lessons.ts --script facts-within-10
 *   npx tsx scripts/judge-lessons.ts --script --all
 *   npx tsx scripts/judge-lessons.ts --coverage
 */

import { year1MathsTopics } from "../src/content/england/ks1/year-1/maths/topics";
import { JUDGE_FIXTURES } from "../src/lib/held-out-judge/fixtures";
import {
  FROZEN_EVAL_CASES,
  blockingFindings,
  checkLabel,
  countByCheck,
  judgeExtractedScript,
  judgeTopic,
  proposeCoversFromMisses,
  scoreCoverage,
  type JudgeCheck,
  type JudgeReport,
} from "../src/lib/held-out-judge";

const args = process.argv.slice(2);
const wantCoverage = args.includes("--coverage");
const scriptFlag = args.includes("--script");
const scriptAll = scriptFlag && args.includes("--all");
const scriptId = scriptFlag ? args.find((arg, index) => args[index - 1] === "--script" && !arg.startsWith("--")) : undefined;

function printReport(report: JudgeReport, heading: string) {
  const blocking = blockingFindings(report);
  const counts = countByCheck(report);
  const countText =
    Object.keys(counts).length === 0
      ? "clean"
      : Object.entries(counts)
          .map(([check, count]) => `${checkLabel(check as JudgeCheck)}=${count}`)
          .join(", ");

  console.log(`\n## ${heading}`);
  console.log(
    `${report.findings.length} finding(s) (${blocking.length} blocking) across ${report.spanCount} spans — ${countText}`,
  );

  for (const finding of report.findings) {
    const mark = finding.severity === "blocking" ? "!" : "-";
    console.log(`  ${mark} [${finding.check}] ${finding.fieldPath}`);
    console.log(`    ${finding.message}`);
    console.log(`    “${finding.span}”`);
  }
}

const topicReports: JudgeReport[] = [];
const scriptReports: JudgeReport[] = [];

console.log(`Held-out judge · ${year1MathsTopics.length} Year 1 maths packs`);

for (const topic of year1MathsTopics) {
  const report = judgeTopic(topic, year1MathsTopics);
  topicReports.push(report);
  printReport(report, `${topic.title} (${topic.id})`);
}

const scriptTopics = scriptAll
  ? year1MathsTopics
  : scriptId
    ? year1MathsTopics.filter((topic) => topic.id === scriptId)
    : year1MathsTopics.filter(
        (topic) =>
          topic.id === "facts-within-10" || topic.id === "shapes-around-us" || topic.id === "counting-within-100",
      );

if (scriptFlag || !scriptId) {
  console.log(`\n---\nRecheck after script extraction (${scriptTopics.length} pack${scriptTopics.length === 1 ? "" : "s"})`);
  for (const topic of scriptTopics) {
    const report = judgeExtractedScript(topic, year1MathsTopics);
    scriptReports.push(report);
    printReport(report, `Script · ${topic.title}`);
  }
}

const fixtureReports = JUDGE_FIXTURES.map((topic) => judgeTopic(topic, [...JUDGE_FIXTURES, ...year1MathsTopics]));
const coverage = scoreCoverage(FROZEN_EVAL_CASES, [...fixtureReports, ...topicReports, ...scriptReports]);

console.log(`\n---\nFrozen eval: ${coverage.hits} hit, ${coverage.misses} miss, ${coverage.noise} noise, ${coverage.silentOk} silent-ok`);
for (const row of coverage.rows) {
  console.log(`  ${row.outcome.padEnd(9)} ${row.caseId}`);
}

if (wantCoverage || coverage.misses > 0) {
  const covers = proposeCoversFromMisses(FROZEN_EVAL_CASES, coverage);
  if (covers.length === 0) {
    console.log("\nNo clustered coverage misses to promote.");
  } else {
    console.log("\nProposed covers (human promote only):");
    for (const cover of covers) {
      console.log(`  - ${cover.title}: ${cover.rationale}`);
    }
  }
}

const blocking = [...topicReports, ...scriptReports].flatMap((report) =>
  blockingFindings(report).map((finding) => `${report.topicId} [${report.sourceKind}] ${finding.message}`),
);

console.log(`\n${blocking.length} blocking finding(s) on live packs/scripts.`);
if (coverage.misses > 0) {
  process.exitCode = 1;
}
