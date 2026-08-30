/**
 * Render one parent-briefing preview from a topic file.
 *
 * Pre-production gate (unless --force):
 *   npm run script:parent-video -- <id>     # human-readable script + delivery checks
 *   npm run rehearse:parent-video -- <id>   # TTS-only + pace eval
 *
 * Voice: Fal Kokoro British English (needs FAL_KEY) — see PARENT_VIDEO_TTS.
 * Pictures: our slides and diagrams only — no generated classroom footage.
 *
 *   npx tsx scripts/render-parent-video.ts facts-within-10
 *   npx tsx scripts/render-parent-video.ts facts-within-10 --force
 */

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getTopicById } from "../src/content/england/ks1/year-1/maths/topics";
import {
  allBeats,
  type VideoBeat,
  type VideoScene,
} from "../src/lib/parent-video-script";
import { assertReadyToRender } from "../src/lib/parent-video-pipeline";
import { escapeHtml, slideVisualSlot, SLIDE_CSS } from "../src/lib/parent-video-visuals";
import { ttsSpeedForRole } from "../src/lib/parent-video-prosody";
import { PARENT_VIDEO_TTS, speakParentVideo } from "../src/lib/parent-video-voice";

const ROOT = path.resolve(__dirname, "..");
const WORK = path.join(ROOT, ".video-work");
const CHROME = process.env.CHROME_PATH || "google-chrome";
const args = process.argv.slice(2).filter((arg) => arg !== "--");
const FORCE = args.includes("--force");
const topicId = args.find((arg) => !arg.startsWith("--")) || "facts-within-10";

function run(command: string, args: string[], timeoutMs = 120_000) {
  const result = spawnSync(command, args, { encoding: "utf8", timeout: timeoutMs });
  if (result.error) {
    throw new Error(`${command} failed: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`${command} failed: ${result.stderr || result.stdout}`);
  }
  return result;
}

function slideHtml(scene: VideoScene, beat: VideoBeat): string {
  const pose = beat.guide ?? "present";
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <style>${SLIDE_CSS}</style>
</head>
<body>
  <div class="layout">
    <div class="copy">
      <p class="kicker">${escapeHtml(scene.kicker)}</p>
      <h1>${escapeHtml(scene.heading)}</h1>
      <p class="line">${escapeHtml(beat.line)}</p>
    </div>
    ${slideVisualSlot(beat.visual, pose)}
  </div>
  <p class="mark">Home Learning · generated from the written pack</p>
</body>
</html>`;
}

async function speak(text: string, dest: string, speed: number = PARENT_VIDEO_TTS.speed): Promise<void> {
  const spoken = await speakParentVideo({ text, speed });
  writeFileSync(dest, spoken.bytes);
}

function screenshot(htmlPath: string, pngPath: string) {
  const profile = path.join(WORK, `chrome-profile-${Date.now()}`);
  mkdirSync(profile, { recursive: true });
  mkdirSync(path.dirname(pngPath), { recursive: true });
  try {
    run(
      "timeout",
      [
        "20",
        CHROME,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--remote-debugging-port=0",
        `--user-data-dir=${profile}`,
        "--window-size=1280,720",
        `--screenshot=${pngPath}`,
        `file://${htmlPath}`,
      ],
      25_000,
    );
  } catch (error) {
    if (!existsSync(pngPath)) throw error;
  }
  if (!existsSync(pngPath)) {
    throw new Error(`Chrome did not write ${pngPath}`);
  }
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

function silenceWav(dest: string, seconds: number) {
  run("ffmpeg", [
    "-y",
    "-f",
    "lavfi",
    "-i",
    "anullsrc=channel_layout=mono:sample_rate=24000",
    "-t",
    seconds.toFixed(2),
    dest,
  ]);
}

function concatWav(parts: string[], dest: string) {
  const listPath = dest + ".txt";
  writeFileSync(listPath, parts.map((part) => `file '${part}'`).join("\n") + "\n");
  run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", dest]);
}

async function main() {
  const topic = getTopicById(topicId);
  if (!topic) throw new Error(`Unknown topic ${topicId}`);

  const { script, hash } = assertReadyToRender(ROOT, topic, { force: FORCE });
  if (FORCE) {
    console.log(`Render forced — skipping rehearsal gate (script ${hash}).`);
  } else {
    console.log(`Rehearsal gate passed (script ${hash}).`);
  }

  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(WORK, { recursive: true });
  mkdirSync(path.join(ROOT, "public/videos"), { recursive: true });

  const listLines: string[] = [];
  let beatIndex = 0;

  for (const scene of script.scenes) {
    for (const beat of scene.beats) {
      const stem = String(beatIndex).padStart(2, "0") + "-" + scene.id;
      const htmlPath = path.join(WORK, `${stem}.html`);
      const pngPath = path.join(WORK, `${stem}.png`);
      const rawPath = path.join(WORK, `${stem}-raw`);
      const spokenPath = path.join(WORK, `${stem}-spoken.wav`);
      const wavPath = path.join(WORK, `${stem}.wav`);
      const mp4Path = path.join(WORK, `${stem}.mp4`);

      writeFileSync(htmlPath, slideHtml(scene, beat));
      process.stdout.write(`Slide ${scene.id} (${beatIndex + 1}/${allBeats(script).length})…\n`);
      screenshot(htmlPath, pngPath);
      process.stdout.write(`Speaking: ${beat.spoken.slice(0, 72)}…\n`);
      await speak(beat.spoken, rawPath, ttsSpeedForRole(PARENT_VIDEO_TTS.speed, beat.prosody));
      toWav(rawPath, spokenPath);

      if (beat.pauseAfter > 0.05) {
        const gapPath = path.join(WORK, `${stem}-gap.wav`);
        silenceWav(gapPath, beat.pauseAfter);
        concatWav([spokenPath, gapPath], wavPath);
      } else {
        copyFileSync(spokenPath, wavPath);
      }

      const duration = audioSeconds(wavPath);
      run("ffmpeg", [
        "-y",
        "-loop",
        "1",
        "-i",
        pngPath,
        "-i",
        wavPath,
        "-c:v",
        "libx264",
        "-tune",
        "stillimage",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-pix_fmt",
        "yuv420p",
        "-t",
        duration.toFixed(2),
        "-vf",
        "scale=1280:720",
        mp4Path,
      ]);
      listLines.push(`file '${mp4Path}'`);
      beatIndex += 1;
    }
  }

  const listPath = path.join(WORK, "concat.txt");
  writeFileSync(listPath, listLines.join("\n") + "\n");
  const outName =
    topic.parentVideo?.src.replace(/^\/videos\//, "").replace(/[?#].*$/, "") ||
    `${topic.id}-parent-briefing.mp4`;
  const outPath = path.join(ROOT, "public/videos", outName);
  run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", outPath]);

  if (!existsSync(outPath)) throw new Error("Render finished but the mp4 is missing.");
  console.log(`Wrote ${outPath} (${beatIndex} beats)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
