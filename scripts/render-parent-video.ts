/**
 * Render one parent-briefing preview from a topic file.
 *
 * Pre-production gate (unless --force):
 *   npm run script:parent-video -- <id>     # human-readable script + delivery checks
 *   npm run rehearse:parent-video -- <id>   # TTS-only + pace eval
 *
 * Building-block modes:
 *   --reuse-audio   prefer baked / rehearsal / hash clips; TTS only for gaps
 *   --slides-only   write slide PNGs only (no TTS, no mp4)
 *   --audio-only    gap-bake WAVs (+ stub frames) for voice A/B — no real slides
 *
 * Targeting (optional):
 *   --scene open,school     only these scene ids
 *   --beats 0-2,5           beat indexes (0-based, script order)
 *
 * Theme:
 *   --theme path/to/theme.json   override palette / typography tokens
 *
 * Voice: Fal Kokoro British English (needs FAL_KEY) — see PARENT_VIDEO_TTS.
 * Pictures: our slides and diagrams only — no generated classroom footage.
 *
 *   npx tsx scripts/render-parent-video.ts facts-within-10
 *   npx tsx scripts/render-parent-video.ts facts-within-10 --reuse-audio
 *   npx tsx scripts/render-parent-video.ts facts-within-10 --slides-only --scene open
 *   npx tsx scripts/render-parent-video.ts facts-within-10 --audio-only --beats 0-3
 *   npx tsx scripts/render-parent-video.ts facts-within-10 --force
 */

import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { getTopicById } from "../src/content/england/ks1/year-1/maths/topics";
import { allBeats, type VideoBeat, type VideoScene } from "../src/lib/parent-video-script";
import {
  assertReadyToRender,
  bakedBeatWavPath,
  beatIsSelected,
  parseBeatSelection,
  parseRenderMode,
  planBeatAudio,
  renderWorkDir,
  writeBakedBeatMeta,
  type BeatSelection,
  type RenderMode,
} from "../src/lib/parent-video-pipeline";
import { escapeHtml, slideCss, slideVisualSlot } from "../src/lib/parent-video-visuals";
import {
  loadParentVideoTheme,
  PARENT_VIDEO_THEME,
  type ParentVideoTheme,
} from "../src/lib/parent-video-theme";
import { ttsSpeedForRole } from "../src/lib/parent-video-prosody";
import { PARENT_VIDEO_TTS, speakParentVideo } from "../src/lib/parent-video-voice";

const ROOT = path.resolve(__dirname, "..");
const CHROME = process.env.CHROME_PATH || "google-chrome";
const args = process.argv.slice(2).filter((arg) => arg !== "--");
const FORCE = args.includes("--force");
const MODE: RenderMode = parseRenderMode(args);
const themePath = flagValue(args, "--theme");
const THEME: ParentVideoTheme = themePath
  ? loadParentVideoTheme(path.resolve(ROOT, themePath))
  : PARENT_VIDEO_THEME;
const topicId = args.find((arg) => !arg.startsWith("--") && !isFlagValue(args, arg)) || "facts-within-10";

function flagValue(flags: string[], name: string): string | undefined {
  const idx = flags.indexOf(name);
  if (idx >= 0) {
    const value = flags[idx + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`${name} requires a value.`);
    }
    return value;
  }
  const prefixed = flags.find((flag) => flag.startsWith(`${name}=`));
  return prefixed ? prefixed.slice(name.length + 1) : undefined;
}

function isFlagValue(flags: string[], candidate: string): boolean {
  const idx = flags.indexOf(candidate);
  if (idx <= 0) return false;
  const prev = flags[idx - 1];
  return prev === "--theme" || prev === "--scene" || prev === "--scenes" || prev === "--beats";
}

function run(command: string, commandArgs: string[], timeoutMs = 120_000) {
  const result = spawnSync(command, commandArgs, { encoding: "utf8", timeout: timeoutMs });
  if (result.error) throw new Error(`${command} failed: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${command} failed: ${result.stderr || result.stdout}`);
  return result;
}

function slideHtml(scene: VideoScene, beat: VideoBeat, theme: ParentVideoTheme, audioOnly = false): string {
  const pose = beat.guide ?? "present";
  const visual = audioOnly
    ? `<div class="visual"><div class="audio-only-stub">Audio-only · ${escapeHtml(scene.id)} · voice check</div></div>`
    : slideVisualSlot(beat.visual, pose);
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <style>${slideCss(theme)}</style>
</head>
<body>
  <div class="layout">
    <div class="copy">
      <p class="kicker">${escapeHtml(scene.kicker)}</p>
      <h1>${escapeHtml(scene.heading)}</h1>
      <p class="line">${escapeHtml(beat.line)}</p>
    </div>
    ${visual}
  </div>
  <p class="mark">Home Learning · generated from the written pack</p>
</body>
</html>`;
}

async function speak(text: string, dest: string, speed: number = PARENT_VIDEO_TTS.speed): Promise<void> {
  const spoken = await speakParentVideo({ text, speed });
  writeFileSync(dest, spoken.bytes);
}

function screenshot(work: string, htmlPath: string, pngPath: string) {
  const profile = path.join(work, `chrome-profile-${Date.now()}`);
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
  if (!existsSync(pngPath)) throw new Error(`Chrome did not write ${pngPath}`);
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

function withPause(work: string, stem: string, spokenPath: string, pauseAfter: number, wavPath: string) {
  if (pauseAfter > 0.05) {
    const gapPath = path.join(work, `${stem}-gap.wav`);
    silenceWav(gapPath, pauseAfter);
    concatWav([spokenPath, gapPath], wavPath);
  } else {
    copyFileSync(spokenPath, wavPath);
  }
}

function muxBeat(pngPath: string, wavPath: string, mp4Path: string) {
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
}

function preferReuse(mode: RenderMode): boolean {
  return mode === "reuse-audio" || mode === "audio-only";
}

function prepareWorkDir(work: string, selection: BeatSelection): void {
  mkdirSync(work, { recursive: true });
  if (selection.indexes === null) {
    // Full rebuild: wipe render scratch only (never rehearsal / baked trees).
    for (const name of readdirSync(work)) {
      rmSync(path.join(work, name), { recursive: true, force: true });
    }
    return;
  }
  // Partial: drop transient chrome profiles; keep sibling beat mp4/png for stitch.
  for (const name of readdirSync(work)) {
    if (name.startsWith("chrome-profile-")) {
      rmSync(path.join(work, name), { recursive: true, force: true });
    }
  }
}

async function main() {
  const topic = getTopicById(topicId);
  if (!topic) throw new Error(`Unknown topic ${topicId}`);

  // --force skips the gate for full TTS. reuse/audio-only allow drifted rehearsal (per-clip plan).
  const gateForce = FORCE && MODE === "full";
  const allowStaleRehearsal = MODE === "reuse-audio" || MODE === "audio-only";
  const { script, hash } = assertReadyToRender(ROOT, topic, {
    force: gateForce,
    allowStaleRehearsal,
  });
  const beatCount = allBeats(script).length;
  const selection = parseBeatSelection(args, script);
  const work = renderWorkDir(ROOT, topic.id);

  if (gateForce) {
    console.log(`Render forced — skipping rehearsal gate (script ${hash}).`);
  } else if (allowStaleRehearsal) {
    console.log(`Delivery OK — per-clip audio plan (script ${hash}).`);
  } else {
    console.log(`Rehearsal gate passed (script ${hash}).`);
  }
  console.log(`Mode: ${MODE} · selection: ${selection.label}`);
  if (themePath) console.log(`Theme: ${themePath}`);

  prepareWorkDir(work, selection);
  mkdirSync(work, { recursive: true });
  mkdirSync(path.join(ROOT, "public/videos"), { recursive: true });

  writeFileSync(path.join(work, "theme.resolved.json"), `${JSON.stringify(THEME, null, 2)}\n`);

  const listLines: string[] = [];
  let beatIndex = 0;
  let rendered = 0;
  let ttsCount = 0;
  let reuseCount = 0;
  let bakedHits = 0;

  for (const scene of script.scenes) {
    for (const beat of scene.beats) {
      const selected = beatIsSelected(selection, beatIndex);
      const stem = `${String(beatIndex).padStart(2, "0")}-${scene.id}`;
      const htmlPath = path.join(work, `${stem}.html`);
      const pngPath = path.join(work, `${stem}.png`);
      const spokenPath = path.join(work, `${stem}-spoken.wav`);
      const wavPath = path.join(work, `${stem}.wav`);
      const mp4Path = path.join(work, `${stem}.mp4`);

      if (!selected) {
        if (MODE !== "slides-only" && existsSync(mp4Path)) {
          listLines.push(`file '${mp4Path}'`);
        }
        beatIndex += 1;
        continue;
      }

      writeFileSync(htmlPath, slideHtml(scene, beat, THEME, MODE === "audio-only"));
      process.stdout.write(`Slide ${scene.id} beat ${beatIndex} (${rendered + 1} selected)…\n`);
      screenshot(work, htmlPath, pngPath);

      if (MODE === "slides-only") {
        beatIndex += 1;
        rendered += 1;
        continue;
      }

      const plan = planBeatAudio({
        root: ROOT,
        topicId: topic.id,
        beatIndex,
        spoken: beat.spoken,
        pauseAfter: beat.pauseAfter,
        prosody: beat.prosody,
        scriptHash: hash,
        preferReuse: preferReuse(MODE),
      });

      if (plan.source === "baked") {
        process.stdout.write(`Baked audio ${path.basename(plan.path)}…\n`);
        copyFileSync(plan.path, wavPath);
        bakedHits += 1;
        reuseCount += 1;
      } else if (plan.source === "rehearsal") {
        process.stdout.write(`Reusing rehearsal ${path.basename(plan.path)}…\n`);
        copyFileSync(plan.path, spokenPath);
        withPause(work, stem, spokenPath, beat.pauseAfter, wavPath);
        reuseCount += 1;
      } else {
        const rawPath = path.join(work, `${stem}-raw`);
        process.stdout.write(`Speaking: ${beat.spoken.slice(0, 72)}…\n`);
        await speak(beat.spoken, rawPath, ttsSpeedForRole(PARENT_VIDEO_TTS.speed, beat.prosody));
        toWav(rawPath, spokenPath);
        withPause(work, stem, spokenPath, beat.pauseAfter, wavPath);
        ttsCount += 1;
      }

      if (plan.source !== "baked") {
        const durationSec = audioSeconds(wavPath);
        const bakedDest = bakedBeatWavPath(ROOT, topic.id, beatIndex);
        mkdirSync(path.dirname(bakedDest), { recursive: true });
        copyFileSync(wavPath, bakedDest);
        writeBakedBeatMeta(ROOT, topic.id, beatIndex, {
          spokenHash: plan.spokenHash,
          pauseAfter: beat.pauseAfter,
          durationSec,
        });
      }

      muxBeat(pngPath, wavPath, mp4Path);
      listLines.push(`file '${mp4Path}'`);
      beatIndex += 1;
      rendered += 1;
    }
  }

  if (MODE === "slides-only") {
    console.log(
      `Wrote ${rendered} slide PNG(s) under ${path.relative(ROOT, work)} (selection: ${selection.label}; no audio / no mp4).`,
    );
    return;
  }

  if (listLines.length === 0) {
    throw new Error("No clips to stitch. Re-render selected beats or run a full render first.");
  }
  if (listLines.length < beatCount && selection.indexes !== null) {
    console.log(
      `Stitching ${listLines.length}/${beatCount} clips (partial selection; missing siblings were skipped).`,
    );
  }

  const listPath = path.join(work, "concat.txt");
  writeFileSync(listPath, listLines.join("\n") + "\n");
  const outName =
    topic.parentVideo?.src.replace(/^\/videos\//, "").replace(/[?#].*$/, "") ||
    `${topic.id}-parent-briefing.mp4`;
  const outPath = path.join(ROOT, "public/videos", outName);
  run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", outPath]);

  if (!existsSync(outPath)) throw new Error("Render finished but the mp4 is missing.");
  console.log(
    `Wrote ${outPath} (selected ${rendered}, stitch ${listLines.length}, tts ${ttsCount}, reused ${reuseCount}, baked-hit ${bakedHits}, mode=${MODE})`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
