/**
 * Render one parent-briefing preview from a topic file.
 *
 * Voice: Fal Kokoro British English (needs FAL_KEY).
 * Pictures: our slides only — no generated classroom footage.
 *
 *   npx tsx scripts/render-parent-video.ts facts-within-10
 */

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import path from "node:path";
import { getTopicById } from "../src/content/england/ks1/year-1/maths/topics";
import { buildParentVideoScript, type VideoScene } from "../src/lib/parent-video-script";

const ROOT = path.resolve(__dirname, "..");
const WORK = path.join(ROOT, ".video-work");
const CHROME = process.env.CHROME_PATH || "google-chrome";

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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function tenFrameHtml(filled: number): string {
  const cells = Array.from({ length: 10 }, (_, index) => {
    const on = index < filled;
    return `<span class="cell ${on ? "on" : ""}"></span>`;
  }).join("");
  return `<div class="frame" aria-hidden="true">${cells}</div>
    <p class="caption">A ten-frame: two rows of five. Here, 6 filled and 4 empty.</p>`;
}

function slideHtml(scene: VideoScene): string {
  const lines = scene.lines.map((line) => `<p class="line">${escapeHtml(line)}</p>`).join("");
  const frame = scene.tenFrame ? tenFrameHtml(scene.tenFrame.filled) : "";
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <style>
    html, body { margin: 0; width: 1280px; height: 720px; }
    body {
      box-sizing: border-box;
      padding: 56px 72px;
      background: #f4efe6;
      color: #1d2a28;
      font-family: "Source Sans 3", "Segoe UI", sans-serif;
    }
    .kicker { color: #1f5f59; font-size: 22px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
    h1 { font-family: Georgia, "Iowan Old Style", serif; font-size: 44px; line-height: 1.15; margin: 16px 0 24px; font-weight: 500; }
    .line { font-size: 28px; line-height: 1.4; color: #3d4f4b; margin: 0 0 14px; max-width: 42rem; }
    .frame { display: grid; grid-template-columns: repeat(5, 56px); gap: 10px; margin: 28px 0 12px; }
    .cell { width: 56px; height: 56px; border-radius: 999px; border: 3px solid #1f5f59; background: transparent; }
    .cell.on { background: #1f5f59; }
    .caption { font-size: 20px; color: #3d4f4b; }
    .mark { position: absolute; right: 72px; bottom: 40px; color: #1f5f59; font-size: 18px; }
  </style>
</head>
<body>
  <p class="kicker">${escapeHtml(scene.kicker)}</p>
  <h1>${escapeHtml(scene.heading)}</h1>
  ${lines}
  ${frame}
  <p class="mark">Home Learning · generated from the written pack</p>
</body>
</html>`;
}

async function speak(text: string, dest: string): Promise<void> {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY is missing. Add it as a cloud or shell secret.");

  const response = await fetch("https://fal.run/fal-ai/kokoro/british-english", {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: text, voice: "bf_emma", speed: 0.95 }),
  });
  if (!response.ok) {
    throw new Error(`TTS failed (${response.status}): ${(await response.text()).slice(0, 200)}`);
  }
  const payload = (await response.json()) as { audio?: { url?: string } };
  const url = payload.audio?.url;
  if (!url) throw new Error("TTS returned no audio URL.");
  const audio = await fetch(url);
  if (!audio.ok) throw new Error(`Could not download TTS audio (${audio.status}).`);
  writeFileSync(dest, Buffer.from(await audio.arrayBuffer()));
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

async function main() {
  const topicId = process.argv[2] || "facts-within-10";
  const topic = getTopicById(topicId);
  if (!topic) throw new Error(`Unknown topic ${topicId}`);

  const script = buildParentVideoScript(topic);
  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(WORK, { recursive: true });
  mkdirSync(path.join(ROOT, "public/videos"), { recursive: true });

  const listLines: string[] = [];

  for (const [index, scene] of script.scenes.entries()) {
    const stem = String(index).padStart(2, "0") + "-" + scene.id;
    const htmlPath = path.join(WORK, `${stem}.html`);
    const pngPath = path.join(WORK, `${stem}.png`);
    const wavPath = path.join(WORK, `${stem}.wav`);
    const mp4Path = path.join(WORK, `${stem}.mp4`);

    writeFileSync(htmlPath, slideHtml(scene));
    process.stdout.write(`Slide ${scene.id}…\n`);
    screenshot(htmlPath, pngPath);
    process.stdout.write(`Speaking ${scene.id}…\n`);
    await speak(scene.spoken, wavPath);
    const duration = audioSeconds(wavPath) + 0.4;
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
  }

  const listPath = path.join(WORK, "concat.txt");
  writeFileSync(listPath, listLines.join("\n") + "\n");
  const outPath = path.join(ROOT, "public/videos", `${topic.id}-parent-briefing.mp4`);
  run("ffmpeg", [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listPath,
    "-c",
    "copy",
    outPath,
  ]);

  if (!existsSync(outPath)) throw new Error("Render finished but the mp4 is missing.");
  console.log(`Wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
