/**
 * Human-gated pack release — one lesson at a time.
 *
 *   npx tsx scripts/release-pack.ts counting-within-100
 *   npx tsx scripts/release-pack.ts counting-within-100 --candidate
 *   npx tsx scripts/release-pack.ts counting-within-100 --confirm-pack "re-read after listenFor edits"
 *   npx tsx scripts/release-pack.ts counting-within-100 --confirm-video "watched after re-rehearsal"
 *   npx tsx scripts/release-pack.ts counting-within-100 --release --sweep
 *
 * Workflow:
 * 1. --candidate        Pick the one pack you are finishing (only one active at a time).
 * 2. Apply learnings / edit the pack / re-run video pipeline.
 * 3. --confirm-pack     Human sign-off after re-reading the pack on site.
 * 4. --confirm-video    Human sign-off after watching video (if the pack has one).
 * 5. --release          Flip reviewStatus to reviewed and optionally sweep other drafts.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getTopicBySlug, year1MathsTopics } from "../src/content/england/ks1/year-1/maths/topics";
import { presentationLearnings } from "../src/content/presentation-learnings";
import {
  groupSweepByLearning,
  mergePackReleaseFile,
  planGlobalRevisionSweep,
  readPackReleaseFile,
  releaseBlockers,
  upsertReleaseEntry,
} from "../src/lib/pack-release";
import { assessPackReleaseServer } from "../src/lib/pack-release-server";

const PACK_RELEASE_PATH = path.join(process.cwd(), "src/content/pack-release.json");

function topicFilePath(topicId: string): string {
  return path.join(process.cwd(), "src/content/england/ks1/year-1/maths/topics", `${topicId}.ts`);
}

function writePackReleaseFile(file: ReturnType<typeof readPackReleaseFile>): void {
  writeFileSync(PACK_RELEASE_PATH, `${JSON.stringify(file, null, 2)}\n`, "utf8");
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

function readNoteArg(args: string[], flag: string): string {
  const index = args.indexOf(flag);
  if (index < 0 || index === args.length - 1) {
    throw new Error(`Missing note after ${flag}`);
  }
  return args.slice(index + 1).join(" ").trim();
}

function printStatus(topicId: string) {
  const topic = getTopicBySlug(topicId) ?? year1MathsTopics.find((entry) => entry.id === topicId);
  if (!topic) throw new Error(`Unknown topic: ${topicId}`);

  const releaseFile = readPackReleaseFile();
  const status = assessPackReleaseServer(topic, releaseFile);
  const blockers = releaseBlockers(status);

  console.log(`\nPack release: ${status.topicTitle} (${status.topicId})`);
  console.log(`  Review status: ${status.reviewStatus}`);
  console.log(`  Active candidate: ${status.isActiveCandidate ? "yes" : "no"}`);
  if (releaseFile.activeCandidateId && !status.isActiveCandidate) {
    console.log(`  Current candidate elsewhere: ${releaseFile.activeCandidateId}`);
  }
  console.log(`  Structural: ${status.structuralOk ? "ok" : "issues"}`);
  console.log(`  Pending learnings (this pack): ${status.pendingLearningRevisions}`);
  console.log(`  Pack rechecked: ${status.packRechecked ? status.packRecheckedAt : "not yet"}`);
  if (status.hasVideo) {
    console.log(`  Video signal: ${status.video.kind}`);
    console.log(`  Video rechecked: ${status.videoRechecked ? status.videoRecheckedAt : "not yet"}`);
  } else {
    console.log("  Video: none");
  }

  if (blockers.length > 0) {
    console.log("\nRelease blockers:");
    for (const blocker of blockers) {
      console.log(`  - ${blocker}`);
    }
  } else {
    console.log("\nNo blockers — you can run --release when you are satisfied.");
  }

  return { topic, status, releaseFile, blockers };
}

function main() {
  const args = process.argv.slice(2);
  const topicId = args.find((arg) => !arg.startsWith("-"));
  const setCandidate = args.includes("--candidate");
  const replaceCandidate = args.includes("--replace-candidate");
  const confirmPack = args.includes("--confirm-pack");
  const confirmVideo = args.includes("--confirm-video");
  const release = args.includes("--release");
  const sweep = args.includes("--sweep");
  const clearCandidate = args.includes("--clear-candidate");

  if (!topicId) {
    console.error(
      "Usage: npx tsx scripts/release-pack.ts <topic-id> [--candidate] [--confirm-pack <note>] [--confirm-video <note>] [--release] [--sweep]",
    );
    process.exit(1);
  }

  if (clearCandidate) {
    const file = mergePackReleaseFile(readPackReleaseFile(), { activeCandidateId: null });
    writePackReleaseFile(file);
    console.log("Cleared active release candidate.");
    return;
  }

  if (setCandidate) {
    const file = readPackReleaseFile();
    if (file.activeCandidateId && file.activeCandidateId !== topicId && !replaceCandidate) {
      console.error(
        `Another pack is already the active candidate (${file.activeCandidateId}). Finish or clear it first, or pass --replace-candidate.`,
      );
      process.exit(1);
    }
    const now = new Date().toISOString();
    let next = mergePackReleaseFile(file, { activeCandidateId: topicId });
    next = upsertReleaseEntry(next, topicId, { candidateSince: now });
    writePackReleaseFile(next);
    console.log(`Set ${topicId} as the active release candidate.`);
    console.log("Apply edits, re-read the pack on site, re-run video if needed, then confirm rechecks.");
    printStatus(topicId);
    return;
  }

  if (confirmPack) {
    const note = readNoteArg(args, "--confirm-pack");
    let file = readPackReleaseFile();
    file = upsertReleaseEntry(file, topicId, {
      packRecheckedAt: new Date().toISOString(),
      packRecheckNote: note,
    });
    writePackReleaseFile(file);
    console.log(`Recorded pack recheck for ${topicId}.`);
    printStatus(topicId);
    return;
  }

  if (confirmVideo) {
    const note = readNoteArg(args, "--confirm-video");
    const topic = getTopicBySlug(topicId) ?? year1MathsTopics.find((entry) => entry.id === topicId);
    if (!topic?.parentVideo) {
      console.error(`${topicId} has no parent video — nothing to confirm.`);
      process.exit(1);
    }
    let file = readPackReleaseFile();
    file = upsertReleaseEntry(file, topicId, {
      videoRecheckedAt: new Date().toISOString(),
      videoRecheckNote: note,
    });
    writePackReleaseFile(file);
    console.log(`Recorded video recheck for ${topicId}.`);
    printStatus(topicId);
    return;
  }

  if (release) {
    const { topic, releaseFile, blockers } = printStatus(topicId);
    if (blockers.length > 0) {
      console.error("\nCannot release — resolve blockers and human rechecks first.");
      process.exit(1);
    }

    markTopicReviewed(topic.id);
    let next = upsertReleaseEntry(releaseFile, topic.id, {
      releasedAt: new Date().toISOString(),
      releaseNote: "Released via release-pack script",
    });
    next = mergePackReleaseFile(next, { activeCandidateId: null });
    writePackReleaseFile(next);
    console.log(`\nReleased ${topic.id} (reviewStatus: reviewed).`);

    const globalSweep = planGlobalRevisionSweep(topic.id, year1MathsTopics);
    const byLearning = groupSweepByLearning(globalSweep);
    console.log(`\nGlobal revision sweep (${globalSweep.draftTopicIds.length} remaining draft packs):`);
    console.log(`  ${globalSweep.pending.length} pending learning revision(s)`);
    for (const [learningId, revisions] of byLearning) {
      console.log(`  - ${learningId}: ${revisions.length} lesson(s)`);
    }

    if (sweep) {
      const outDir = path.join(process.cwd(), "inbox");
      mkdirSync(outDir, { recursive: true });
      const outPath = path.join(outDir, "global-revision-sweep.json");
      writeFileSync(outPath, `${JSON.stringify(globalSweep, null, 2)}\n`, "utf8");
      console.log(`\nWrote ${outPath}`);
    }

    console.log("\nPresentation learnings (already global):");
    for (const learning of presentationLearnings) {
      console.log(`  - ${learning.id}: ${learning.title}`);
    }
    return;
  }

  printStatus(topicId);
}

main();
