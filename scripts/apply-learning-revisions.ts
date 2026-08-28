/**
 * Apply accepted learning revisions to topic TypeScript files.
 *
 *   npx tsx scripts/apply-learning-revisions.ts path/to/learning-revisions-accepted.json
 *
 * The JSON shape is { version: 1, accepted: ProposedRevision[] } from the maintenance page export.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { ProposedRevision } from "../src/lib/learning-revisions";

type ApplyFile = {
  version: number;
  accepted: ProposedRevision[];
};

function applyToSource(source: string, revision: ProposedRevision): { source: string; changed: boolean } {
  if (revision.before === "(missing)") {
    // Structural inserts (nudge / listenFor) need a human edit — flag only.
    return { source, changed: false };
  }

  if (!source.includes(revision.before)) {
    return { source, changed: false };
  }

  const next = source.replace(revision.before, revision.after);
  return { source: next, changed: next !== source };
}

function topicFilePath(topicId: string): string {
  return path.join(
    process.cwd(),
    "src/content/england/ks1/year-1/maths/topics",
    `${topicId}.ts`,
  );
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: npx tsx scripts/apply-learning-revisions.ts <accepted.json>");
    process.exit(1);
  }

  const payload = JSON.parse(readFileSync(inputPath, "utf8")) as ApplyFile;
  const accepted = payload.accepted ?? [];
  if (accepted.length === 0) {
    console.log("No accepted revisions in file.");
    return;
  }

  let applied = 0;
  let skipped = 0;
  const byTopic = new Map<string, ProposedRevision[]>();
  for (const revision of accepted) {
    const list = byTopic.get(revision.topicId) ?? [];
    list.push(revision);
    byTopic.set(revision.topicId, list);
  }

  for (const [topicId, revisions] of byTopic) {
    const filePath = topicFilePath(topicId);
    let source = readFileSync(filePath, "utf8");
    let fileChanged = false;

    for (const revision of revisions) {
      const result = applyToSource(source, revision);
      if (!result.changed) {
        console.log(`Skip ${topicId} ${revision.fieldPath} (${revision.learningId}) — needs manual edit or already applied`);
        skipped += 1;
        continue;
      }
      source = result.source;
      fileChanged = true;
      applied += 1;
      console.log(`Applied ${topicId} ${revision.fieldPath} (${revision.learningId})`);
    }

    if (fileChanged) {
      writeFileSync(filePath, source, "utf8");
    }
  }

  console.log(`\nDone. Applied ${applied}, skipped ${skipped}.`);
  if (skipped > 0) {
    console.log("Skipped structural “(missing)” fields — edit those topic files by hand (nudge / listenFor).");
  }
}

main();
