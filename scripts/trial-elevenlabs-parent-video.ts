/**
 * ElevenLabs listen trial for parent briefings.
 *
 *   npm run trial:elevenlabs-parent-video -- facts-within-10
 *   npm run trial:elevenlabs-parent-video -- facts-within-10 --full
 *
 * Default: a short collage (open / plain / mix / page / close) so you can
 * judge comfort quickly. --full speaks every beat into the trial folder.
 *
 * Does not overwrite the Kokoro rehearsal gate used by render:parent-video.
 * Needs FAL_KEY. Output: inbox/parent-video/<id>/elevenlabs-trial/
 */

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { getTopicById } from "../src/content/england/ks1/year-1/maths/topics";
import { buildParentVideoScript } from "../src/lib/parent-video-script";
import { ELEVENLABS_TTS, KOKORO_TTS, speakParentVideo } from "../src/lib/parent-video-voice";

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2).filter((arg) => arg !== "--");
const FULL = args.includes("--full");
const topicId = args.find((arg) => !arg.startsWith("--")) || "facts-within-10";

type TrialBeat = {
  sceneId: string;
  spoken: string;
  prosody?: string;
};

function run(command: string, argv: string[], timeoutMs = 60_000) {
  const result = spawnSync(command, argv, { encoding: "utf8", timeout: timeoutMs });
  if (result.error) throw new Error(`${command} failed: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${command} failed: ${result.stderr || result.stdout}`);
  return result;
}

function toWav(src: string, dest: string) {
  run("ffmpeg", ["-y", "-i", src, "-ac", "1", "-ar", "24000", "-c:a", "pcm_s16le", dest]);
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
  const listPath = `${dest}.txt`;
  writeFileSync(listPath, parts.map((part) => `file '${part}'`).join("\n") + "\n");
  run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", dest]);
}

function pickListenBeats(beats: TrialBeat[]): TrialBeat[] {
  if (FULL) return beats;
  const want = new Set(["open", "plain", "mix", "page", "close"]);
  const picked: TrialBeat[] = [];
  const perScene = new Map<string, number>();
  for (const beat of beats) {
    if (!want.has(beat.sceneId)) continue;
    const count = perScene.get(beat.sceneId) ?? 0;
    const limit = beat.sceneId === "plain" || beat.sceneId === "page" ? 4 : 3;
    if (count >= limit) continue;
    perScene.set(beat.sceneId, count + 1);
    picked.push(beat);
  }
  return picked;
}

async function main() {
  const topic = getTopicById(topicId);
  if (!topic) throw new Error(`Unknown topic ${topicId}`);

  const script = buildParentVideoScript(topic);
  const all: TrialBeat[] = script.scenes.flatMap((scene) =>
    scene.beats.map((beat) => ({
      sceneId: scene.id,
      spoken: beat.spoken,
      prosody: beat.prosody,
    })),
  );
  const selected = pickListenBeats(all);

  const outDir = path.join(ROOT, "inbox", "parent-video", topic.id, "elevenlabs-trial");
  mkdirSync(outDir, { recursive: true });

  console.log(`ElevenLabs trial · voice ${ELEVENLABS_TTS.voice} · stability ${ELEVENLABS_TTS.stability}`);
  console.log(`Mode: ${FULL ? "full script" : "short listen collage"} (${selected.length} beats)`);
  console.log(`Out: ${path.relative(ROOT, outDir)}`);

  const smoke = await speakParentVideo(
    { text: "This is a quick parent briefing — listening for comfort, not for perfection." },
    "elevenlabs",
  );
  writeFileSync(path.join(outDir, `00-smoke.${smoke.format}`), smoke.bytes);
  console.log(`Smoke OK (${smoke.format}, ${smoke.bytes.length} bytes).`);

  const wavParts: string[] = [];
  const lines: string[] = [
    `# ElevenLabs listen trial · ${topic.title}`,
    "",
    `- Provider: fal \`${ELEVENLABS_TTS.endpoint.replace("https://fal.run/", "")}\``,
    `- Voice: **${ELEVENLABS_TTS.voice}** (stability ${ELEVENLABS_TTS.stability})`,
    `- Mode: ${FULL ? "full" : "short collage"}`,
    `- Compared with production Kokoro \`${KOKORO_TTS.voice}\` @ ${KOKORO_TTS.speed}`,
    "",
    "## Beats",
    "",
  ];

  for (let i = 0; i < selected.length; i += 1) {
    const beat = selected[i];
    const stem = String(i + 1).padStart(2, "0");
    const rawPath = path.join(outDir, `${stem}.raw`);
    const wavPath = path.join(outDir, `${stem}.wav`);
    process.stdout.write(
      `Trial ${i + 1}/${selected.length} [${beat.sceneId}/${beat.prosody ?? "teach"}]: ${beat.spoken.slice(0, 56)}…\n`,
    );
    const spoken = await speakParentVideo({ text: beat.spoken }, "elevenlabs");
    writeFileSync(rawPath, spoken.bytes);
    toWav(rawPath, wavPath);
    const seconds = audioSeconds(wavPath);
    lines.push(
      `- \`${stem}.wav\` · ${seconds.toFixed(2)}s · ${beat.sceneId} · ${beat.prosody ?? "teach"} — ${beat.spoken}`,
    );
    wavParts.push(wavPath);
    const gap = path.join(outDir, `${stem}-gap.wav`);
    silenceWav(gap, 0.35);
    wavParts.push(gap);
  }

  const listenWav = path.join(outDir, "listen.wav");
  const listenMp3 = path.join(outDir, "listen.mp3");
  concatWav(wavParts, listenWav);
  run("ffmpeg", ["-y", "-i", listenWav, "-codec:a", "libmp3lame", "-qscale:a", "3", listenMp3]);

  lines.push("", "## Listen file", "", `- [${FULL ? "full" : "short"} collage](./listen.mp3)`, "");
  writeFileSync(path.join(outDir, "README.md"), `${lines.join("\n")}\n`);

  if (!existsSync(listenMp3)) throw new Error("listen.mp3 was not written");
  console.log(`\nWrote ${path.relative(ROOT, listenMp3)}`);
  console.log("Listen, then decide: keep Kokoro, adopt ElevenLabs, or tweak voice/stability.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
