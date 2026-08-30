/**
 * Rehearse parent-video audio before full production.
 *
 *   npm run rehearse:parent-video -- facts-within-10
 *
 * 1. Dumps/refreshes the script preview
 * 2. Blocks on spoken-delivery findings
 * 3. Generates Kokoro audio only (no slides / no final mp4)
 * 4. Auto-evaluates pace (chars/sec) and writes rehearsal report
 *
 * Needs FAL_KEY. Full render reads the report as a gate.
 */

import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Topic } from "../src/content/schema";
import { getTopicById } from "../src/content/england/ks1/year-1/maths/topics";
import { deliveryBlocksProduction } from "../src/lib/parent-video-delivery";
import {
  buildRehearsalReport,
  evaluateAudioPace,
  flattenBeats,
  rehearsalAudioDir,
  rehearsalClipWavPath,
  spokenClipHash,
  writeRehearsalArtifacts,
  writeScriptPreview,
  type RehearsalBeat,
} from "../src/lib/parent-video-pipeline";
import { PARENT_VIDEO_TTS, speakParentVideo } from "../src/lib/parent-video-voice";
import { ttsSpeedForRole, type ProsodyRole } from "../src/lib/parent-video-prosody";

const ROOT = path.resolve(__dirname, "..");
const topicId = process.argv[2] || "facts-within-10";

function requireTopic(id: string): Topic {
  const found = getTopicById(id);
  if (!found) throw new Error(`Unknown topic ${id}`);
  return found;
}

const topic = requireTopic(topicId);

function run(command: string, args: string[], timeoutMs = 60_000) {
  const result = spawnSync(command, args, { encoding: "utf8", timeout: timeoutMs });
  if (result.error) throw new Error(`${command} failed: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${command} failed: ${result.stderr || result.stdout}`);
  return result;
}

async function speak(text: string, dest: string, speed: number = PARENT_VIDEO_TTS.speed): Promise<void> {
  const spoken = await speakParentVideo({ text, speed });
  writeFileSync(dest, spoken.bytes);
}

function audioSeconds(wavPath: string): number {
  const result = run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    wavPath,
  ]);
  const seconds = Number(result.stdout.trim());
  if (!Number.isFinite(seconds) || seconds <= 0) throw new Error(`Bad duration for ${wavPath}`);
  return seconds;
}

function toWav(src: string, dest: string) {
  run("ffmpeg", ["-y", "-i", src, "-ac", "1", "-ar", "24000", "-c:a", "pcm_s16le", dest]);
}

async function main() {
  const { script, delivery, hash } = writeScriptPreview(ROOT, topic);
  console.log(`Script hash ${hash}`);
  console.log(`Delivery: ${delivery.findings.length} finding(s), ${delivery.blockingCount} blocking`);

  if (deliveryBlocksProduction(delivery)) {
    console.error("Spoken delivery blocked rehearsal. Fix the pack and re-run script:parent-video first.");
    for (const finding of delivery.findings.filter((item) => item.severity === "blocking")) {
      console.error(`  ! [${finding.code}] ${finding.spoken}`);
    }
    process.exit(1);
  }

  const audioRoot = rehearsalAudioDir(ROOT, topic.id);
  mkdirSync(audioRoot, { recursive: true });

  const beats: RehearsalBeat[] = flattenBeats(script);
  for (let index = 0; index < beats.length; index += 1) {
    const beat = beats[index];
    const stem = String(index).padStart(2, "0");
    const rawPath = path.join(audioRoot, `${stem}.raw`);
    const wavPath = path.join(audioRoot, `${stem}.wav`);
    const speed = ttsSpeedForRole(PARENT_VIDEO_TTS.speed, beat.prosody as ProsodyRole | undefined);
    process.stdout.write(
      `Rehearse ${index + 1}/${beats.length} [${beat.prosody ?? "teach"} @ ${speed}]: ${beat.spoken.slice(0, 48)}…\n`,
    );
    await speak(beat.spoken, rawPath, speed);
    toWav(rawPath, wavPath);
    const durationSec = audioSeconds(wavPath);
    const charsPerSec = beat.spoken.replace(/\s+/g, "").length / durationSec;
    beat.durationSec = durationSec;
    beat.charsPerSec = charsPerSec;
    beat.audioFile = path.relative(ROOT, wavPath);
    beat.spokenHash = spokenClipHash(beat.spoken, beat.prosody);
    const clipPath = rehearsalClipWavPath(ROOT, topic.id, beat.spokenHash);
    mkdirSync(path.dirname(clipPath), { recursive: true });
    copyFileSync(wavPath, clipPath);
  }

  const audioFindings = evaluateAudioPace(beats);
  const report = buildRehearsalReport({ topic, script, delivery, beats, audioFindings });
  const { jsonPath, markdownPath } = writeRehearsalArtifacts(ROOT, report);

  console.log(`Wrote ${markdownPath}`);
  console.log(`Wrote ${jsonPath}`);
  console.log(`Rehearsal status: ${report.status}`);
  for (const finding of audioFindings) {
    const mark = finding.severity === "blocking" ? "!" : "-";
    console.log(`  ${mark} [${finding.code}] ${finding.beatPath} — ${finding.message}`);
  }

  if (report.status !== "pass") {
    console.error("\nRehearsal failed. Fix wording or pacing, then re-run.");
    process.exit(1);
  }

  console.log(`\nReady for production: npm run render:parent-video -- ${topic.id}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
