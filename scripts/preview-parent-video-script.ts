/**
 * Dump the compiled parent-video script for human review before production.
 *
 *   npm run script:parent-video -- facts-within-10
 *
 * Writes inbox/parent-video/<id>/script.md + script.json (+ seeds human-notes.md).
 * Runs spoken-delivery checks (paper/aloud). Does not call TTS.
 */

import path from "node:path";
import { getTopicById } from "../src/content/england/ks1/year-1/maths/topics";
import { deliveryBlocksProduction } from "../src/lib/parent-video-delivery";
import { writeScriptPreview } from "../src/lib/parent-video-pipeline";

const ROOT = path.resolve(__dirname, "..");
const topicId = process.argv[2] || "facts-within-10";
const topic = getTopicById(topicId);
if (!topic) {
  console.error(`Unknown topic ${topicId}`);
  process.exit(1);
}

const { delivery, hash, markdownPath, jsonPath } = writeScriptPreview(ROOT, topic);

console.log(`Wrote ${markdownPath}`);
console.log(`Wrote ${jsonPath}`);
console.log(`Script hash ${hash}`);
console.log(
  `Delivery: ${delivery.findings.length} finding(s), ${delivery.blockingCount} blocking`,
);

for (const finding of delivery.findings) {
  const mark = finding.severity === "blocking" ? "!" : "-";
  console.log(`  ${mark} [${finding.code}] ${finding.beatPath}`);
  console.log(`    ${finding.message}`);
  console.log(`    “${finding.spoken}”`);
}

if (deliveryBlocksProduction(delivery)) {
  console.error("\nFix blocking spoken-delivery issues in the topic pack, then re-run.");
  process.exit(1);
}

console.log("\nNext: add notes in human-notes.md if needed, then npm run rehearse:parent-video -- " + topicId);
