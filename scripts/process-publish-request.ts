/**
 * Apply maintainer publish requests dropped in inbox/.
 *
 *   npx tsx scripts/process-publish-request.ts inbox/publish-request-counting-within-100.json
 *
 * Actions: write-script | generate-video | release | suspend | restore
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getTopicById } from "../src/content/england/ks1/year-1/maths/topics";
import {
  mergePackReleaseFile,
  readPackReleaseFile,
  upsertReleaseEntry,
  type PackReleaseFile,
} from "../src/lib/pack-release";
import type { PublishRequest } from "../src/lib/pack-publishing";
import { readRehearsalReport, scriptFingerprint, writeScriptPreview } from "../src/lib/parent-video-pipeline";
import { buildParentVideoScript } from "../src/lib/parent-video-script";

const ROOT = process.cwd();
const PACK_RELEASE_PATH = path.join(ROOT, "src/content/pack-release.json");

function topicFilePath(topicId: string): string {
  return path.join(ROOT, "src/content/england/ks1/year-1/maths/topics", `${topicId}.ts`);
}

function writePackReleaseFile(file: PackReleaseFile): void {
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

function readRequest(inputPath: string): PublishRequest {
  const raw = readFileSync(inputPath, "utf8");
  return JSON.parse(raw) as PublishRequest;
}

function applyPackReleasePatch(request: PublishRequest): PackReleaseFile {
  const base = request.packRelease ? mergePackReleaseFile(readPackReleaseFile(), request.packRelease) : readPackReleaseFile();
  const now = new Date().toISOString();
  const topicId = request.topicId;

  switch (request.action) {
    case "write-script":
    case "generate-video": {
      const script = buildParentVideoScript(getTopicById(topicId)!);
      const hash = scriptFingerprint(script);
      return upsertReleaseEntry(base, topicId, {
        videoGeneratedAt: request.action === "generate-video" ? now : undefined,
        videoGeneratedHash: hash,
      });
    }
    case "release":
      return upsertReleaseEntry(mergePackReleaseFile(base, { activeCandidateId: null }), topicId, {
        releasedAt: now,
        releaseNote: request.note ?? "Released via publish request",
        suspendedAt: undefined,
        suspendNote: undefined,
      });
    case "suspend":
      return upsertReleaseEntry(base, topicId, {
        suspendedAt: now,
        suspendNote: request.note ?? "Suspended via publish request",
      });
    case "restore":
      return upsertReleaseEntry(base, topicId, {
        suspendedAt: undefined,
        suspendNote: undefined,
        restoredAt: now,
        releaseNote: request.note ?? "Restored via publish request",
      });
    default:
      return base;
  }
}

function processRequest(inputPath: string): void {
  const request = readRequest(inputPath);
  const topic = getTopicById(request.topicId);
  if (!topic) throw new Error(`Unknown topic ${request.topicId}`);

  console.log(`Processing ${request.action} for ${request.topicId}`);

  if (request.action === "write-script" || request.action === "generate-video") {
    const { hash, delivery } = writeScriptPreview(ROOT, topic);
    console.log(`Wrote script preview (${hash}), ${delivery.blockingCount} blocking finding(s)`);

    if (request.action === "generate-video") {
      const report = readRehearsalReport(ROOT, topic.id);
      if (report?.status === "pass" && report.scriptHash === hash) {
        console.log("Rehearsal report already current — marking video generated.");
      } else if (process.env.FAL_KEY) {
        console.log("FAL_KEY present — run npm run rehearse:parent-video locally or in CI with secrets.");
      } else {
        console.log("No rehearsal run in this step — maintainer can run rehearse:parent-video, then re-export pack-release.");
      }
    }
  }

  if (request.action === "release") {
    markTopicReviewed(topic.id);
    console.log(`Marked ${topic.id} reviewStatus: reviewed`);
  }

  const nextRelease = applyPackReleasePatch(request);
  writePackReleaseFile(nextRelease);
  console.log(`Updated ${PACK_RELEASE_PATH}`);
}

function main() {
  const arg = process.argv[2];
  if (!arg) {
    const inbox = path.join(ROOT, "inbox");
    const files = existsSync(inbox)
      ? readdirSync(inbox).filter((name) => name.startsWith("publish-request") && name.endsWith(".json"))
      : [];
    if (files.length === 0) {
      console.error("Usage: npx tsx scripts/process-publish-request.ts inbox/publish-request-<topic>.json");
      process.exit(1);
    }
    for (const file of files) {
      processRequest(path.join(inbox, file));
    }
    return;
  }

  processRequest(path.isAbsolute(arg) ? arg : path.join(ROOT, arg));
}

main();
