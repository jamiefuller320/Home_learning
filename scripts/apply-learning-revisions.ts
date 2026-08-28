/**
 * Apply accepted learning revisions to topic TypeScript files.
 *
 *   npx tsx scripts/apply-learning-revisions.ts [path/to/learning-revisions-accepted.json]
 *   npx tsx scripts/apply-learning-revisions.ts --record-decisions --archive
 *
 * Defaults to inbox/learning-revisions-accepted.json, then learning-revisions-accepted.json.
 * The JSON shape is { version: 1, accepted: ProposedRevision[] } from the maintenance page export.
 *
 * --record-decisions  Merge accepted revision ids into src/content/learning-decisions.json
 * --archive           Clear the inbox file after a successful apply (accepted: [])
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { LearningDecisionsFile, ProposedRevision } from "../src/lib/learning-revisions";

type ApplyFile = {
  version: number;
  accepted: ProposedRevision[];
};

const DEFAULT_PATHS = [
  path.join(process.cwd(), "inbox/learning-revisions-accepted.json"),
  path.join(process.cwd(), "learning-revisions-accepted.json"),
];

function resolveInputPath(args: string[]): string {
  const positional = args.find((arg) => !arg.startsWith("-"));
  if (positional) return path.resolve(positional);
  for (const candidate of DEFAULT_PATHS) {
    try {
      readFileSync(candidate, "utf8");
      return candidate;
    } catch {
      // try next default
    }
  }
  return DEFAULT_PATHS[0]!;
}

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

export function recordAcceptedDecisions(
  accepted: ProposedRevision[],
  decisionsPath = path.join(process.cwd(), "src/content/learning-decisions.json"),
): LearningDecisionsFile {
  const existing = JSON.parse(readFileSync(decisionsPath, "utf8")) as LearningDecisionsFile;
  const byId = new Map((existing.decisions ?? []).map((decision) => [decision.revisionId, decision]));
  const decidedAt = new Date().toISOString();

  for (const revision of accepted) {
    byId.set(revision.id, {
      revisionId: revision.id,
      decision: "accepted",
      decidedAt,
    });
  }

  const next: LearningDecisionsFile = {
    version: 1,
    decisions: [...byId.values()].sort((a, b) => a.revisionId.localeCompare(b.revisionId)),
  };
  writeFileSync(decisionsPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}

export function archiveAcceptedFile(inputPath: string): void {
  writeFileSync(inputPath, `${JSON.stringify({ version: 1, accepted: [] }, null, 2)}\n`, "utf8");
}

function main() {
  const args = process.argv.slice(2);
  const recordDecisions = args.includes("--record-decisions");
  const archive = args.includes("--archive");
  const inputPath = resolveInputPath(args);

  let payload: ApplyFile;
  try {
    payload = JSON.parse(readFileSync(inputPath, "utf8")) as ApplyFile;
  } catch (error) {
    console.error(`Could not read ${inputPath}:`, error instanceof Error ? error.message : error);
    process.exit(1);
  }

  const accepted = payload.accepted ?? [];
  if (accepted.length === 0) {
    console.log(`No accepted revisions in ${inputPath}.`);
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

  if (recordDecisions && applied > 0) {
    recordAcceptedDecisions(accepted);
    console.log("Recorded accepted revision ids in src/content/learning-decisions.json.");
  }

  if (archive && applied > 0) {
    archiveAcceptedFile(inputPath);
    console.log(`Archived ${inputPath} (cleared accepted queue).`);
  }

  if (applied === 0 && accepted.length > 0) {
    process.exitCode = 1;
  }
}

main();
