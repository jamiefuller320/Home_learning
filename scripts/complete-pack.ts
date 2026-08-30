/**
 * Mark a pack complete and trigger a global revision sweep across draft packs.
 *
 *   npx tsx scripts/complete-pack.ts counting-within-100
 *   npx tsx scripts/complete-pack.ts counting-within-100 --mark-reviewed --sweep
 *
 * --mark-reviewed   Set reviewStatus to "reviewed" in the topic file (only when ready)
 * --sweep           Write inbox/global-revision-sweep.json for remaining draft packs
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getTopicBySlug, year1MathsTopics } from "../src/content/england/ks1/year-1/maths/topics";
import { presentationLearnings } from "../src/content/presentation-learnings";
import {
  assessPackCompleteness,
  planGlobalRevisionSweep,
  groupSweepByLearning,
} from "../src/lib/pack-completeness";

function topicFilePath(topicId: string): string {
  return path.join(process.cwd(), "src/content/england/ks1/year-1/maths/topics", `${topicId}.ts`);
}

function markTopicReviewed(topicId: string): void {
  const filePath = topicFilePath(topicId);
  let source = readFileSync(filePath, "utf8");
  if (!source.includes('reviewStatus: "draft"')) {
    throw new Error(`${topicId} is not draft — reviewStatus was not changed.`);
  }
  source = source.replace('reviewStatus: "draft"', 'reviewStatus: "reviewed"');
  writeFileSync(filePath, source, "utf8");
}

function main() {
  const args = process.argv.slice(2);
  const topicId = args.find((arg) => !arg.startsWith("-"));
  const markReviewed = args.includes("--mark-reviewed");
  const sweep = args.includes("--sweep");

  if (!topicId) {
    console.error("Usage: npx tsx scripts/complete-pack.ts <topic-id> [--mark-reviewed] [--sweep]");
    process.exit(1);
  }

  const topic = getTopicBySlug(topicId) ?? year1MathsTopics.find((entry) => entry.id === topicId);
  if (!topic) {
    console.error(`Unknown topic: ${topicId}`);
    process.exit(1);
  }

  const report = assessPackCompleteness(topic);
  console.log(`\nPack completeness: ${report.topicTitle} (${report.topicId})`);
  console.log(`  Structural: ${report.structuralOk ? "ok" : "issues"}`);
  console.log(`  Pending learnings: ${report.pendingLearningRevisions}`);
  console.log(`  Review status: ${report.reviewStatus}`);
  console.log(`  Ready to mark reviewed: ${report.readyToMarkReviewed ? "yes" : "no"}`);

  if (!report.structuralOk) {
    console.log("\nStructural issues:");
    for (const issue of report.structuralIssues) {
      console.log(`  - ${issue.field}: ${issue.message}`);
    }
  }

  if (!report.readyToMarkReviewed) {
    console.error("\nPack is not ready to complete. Fix structural issues and pending learnings first.");
    process.exit(1);
  }

  if (markReviewed) {
    markTopicReviewed(topic.id);
    console.log(`\nMarked ${topic.id} as reviewed.`);
  } else {
    console.log("\nDry run — pass --mark-reviewed to flip reviewStatus in the topic file.");
  }

  const globalSweep = planGlobalRevisionSweep(topic.id);
  const byLearning = groupSweepByLearning(globalSweep);

  console.log(`\nGlobal revision sweep (${globalSweep.draftTopicIds.length} draft packs):`);
  console.log(`  ${globalSweep.pending.length} pending learning revision(s) across draft corpus`);

  if (globalSweep.pending.length > 0) {
    for (const [learningId, revisions] of byLearning) {
      console.log(`  - ${learningId}: ${revisions.length} lesson(s)`);
    }
  }

  console.log("\nPresentation learnings (apply once globally — not per topic):");
  for (const learning of presentationLearnings) {
    console.log(`  - ${learning.id}: ${learning.title}`);
  }

  if (sweep) {
    const outDir = path.join(process.cwd(), "inbox");
    mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, "global-revision-sweep.json");
    writeFileSync(outPath, `${JSON.stringify(globalSweep, null, 2)}\n`, "utf8");
    console.log(`\nWrote ${outPath}`);
    console.log("Review proposals on /maintenance → Pack learnings, then export and apply.");
  } else {
    console.log("\nPass --sweep to write inbox/global-revision-sweep.json for the maintainer queue.");
  }
}

main();
