import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Topic } from "@/content/schema";
import {
  allBeats,
  buildParentVideoScript,
  spokenCorpus,
  type ParentVideoScript,
  type VideoBeat,
  type VideoScene,
} from "@/lib/parent-video-script";
import {
  deliveryBlocksProduction,
  evaluateSpokenDelivery,
  type DeliveryFinding,
  type DeliveryReport,
} from "@/lib/parent-video-delivery";

export type AudioFinding = {
  severity: "blocking" | "note";
  code: string;
  beatPath: string;
  spoken: string;
  message: string;
  durationSec?: number;
  charsPerSec?: number;
};

export type RehearsalBeat = {
  path: string;
  sceneId: string;
  spoken: string;
  line: string;
  pauseAfter: number;
  prosody?: string;
  durationSec?: number;
  charsPerSec?: number;
  audioFile?: string;
};

export type RehearsalReport = {
  topicId: string;
  title: string;
  scriptHash: string;
  createdAt: string;
  status: "pass" | "fail";
  delivery: DeliveryReport;
  audioFindings: AudioFinding[];
  beats: RehearsalBeat[];
};

export function scriptFingerprint(script: ParentVideoScript): string {
  return createHash("sha256").update(spokenCorpus(script)).digest("hex").slice(0, 16);
}

export function parentVideoInboxDir(root: string, topicId: string): string {
  return path.join(root, "inbox", "parent-video", topicId);
}

export function rehearsalAudioDir(root: string, topicId: string): string {
  return path.join(root, ".video-work", "rehearsal", topicId);
}

export function scriptJsonPath(root: string, topicId: string): string {
  return path.join(parentVideoInboxDir(root, topicId), "script.json");
}

export function scriptMarkdownPath(root: string, topicId: string): string {
  return path.join(parentVideoInboxDir(root, topicId), "script.md");
}

export function humanNotesPath(root: string, topicId: string): string {
  return path.join(parentVideoInboxDir(root, topicId), "human-notes.md");
}

export function rehearsalReportPath(root: string, topicId: string): string {
  return path.join(parentVideoInboxDir(root, topicId), "rehearsal-report.json");
}

export function rehearsalMarkdownPath(root: string, topicId: string): string {
  return path.join(parentVideoInboxDir(root, topicId), "rehearsal.md");
}

function beatPath(sceneId: string, index: number): string {
  return `scenes.${sceneId}.beats[${index}]`;
}

export function flattenBeats(script: ParentVideoScript): RehearsalBeat[] {
  const rows: RehearsalBeat[] = [];
  for (const scene of script.scenes) {
    scene.beats.forEach((beat, index) => {
      rows.push({
        path: beatPath(scene.id, index),
        sceneId: scene.id,
        spoken: beat.spoken,
        line: beat.line,
        pauseAfter: beat.pauseAfter,
        prosody: beat.prosody,
      });
    });
  }
  return rows;
}

function formatFindings(findings: Array<{ severity: string; code: string; beatPath: string; message: string; spoken: string }>): string {
  if (findings.length === 0) return "_No findings._\n";
  return findings
    .map((item) => {
      const mark = item.severity === "blocking" ? "!" : "-";
      return `${mark} **${item.code}** (\`${item.beatPath}\`) — ${item.message}\n  > ${item.spoken}`;
    })
    .join("\n\n");
}

export function renderScriptMarkdown(
  topic: Topic,
  script: ParentVideoScript,
  delivery: DeliveryReport,
  humanNotes: string | null,
): string {
  const hash = scriptFingerprint(script);
  const lines: string[] = [
    `# Parent video script · ${topic.title}`,
    "",
    `Topic id: \`${topic.id}\`  `,
    `Script hash: \`${hash}\`  `,
    `Beats: ${allBeats(script).length}  `,
    "",
    "Compiled from the written pack. **Edit the topic file to change wording** — this dump is for review, not a second authoring path.",
    "",
    "## How to use this in the learning loop",
    "",
    "1. Read the beats below (and listen after `npm run rehearse:parent-video`).",
    "2. Prosody tags (`title`, `section`, `key`, `teach`, `example`, `aside`, `handoff`) are delivery intent — Kokoro approximates them with punctuation and speed (no SSML).",
    "3. Add notes in `human-notes.md` in this folder.",
    "4. Fix awkward lines in the topic pack (or add a learning), then re-run preview.",
    "5. Rehearse audio before full production.",
    "",
  ];

  if (humanNotes?.trim()) {
    lines.push("## Human notes", "", humanNotes.trim(), "");
  } else {
    lines.push(
      "## Human notes",
      "",
      "_None yet. Create `human-notes.md` beside this file to capture listen-through feedback._",
      "",
    );
  }

  lines.push("## Spoken delivery check", "", formatFindings(delivery.findings), "");

  for (const scene of script.scenes) {
    lines.push(`## ${scene.id} · ${scene.heading}`, "", `_${scene.kicker}_`, "");
    scene.beats.forEach((beat: VideoBeat, index: number) => {
      const role = beat.prosody ?? "teach";
      lines.push(`${index + 1}. \`[${role}]\` (${beat.pauseAfter.toFixed(2)}s gap) ${beat.spoken}`);
    });
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

export function writeScriptPreview(root: string, topic: Topic): {
  script: ParentVideoScript;
  delivery: DeliveryReport;
  hash: string;
  markdownPath: string;
  jsonPath: string;
} {
  const script = buildParentVideoScript(topic);
  const delivery = evaluateSpokenDelivery(script);
  const hash = scriptFingerprint(script);
  const dir = parentVideoInboxDir(root, topic.id);
  mkdirSync(dir, { recursive: true });

  const notesFile = humanNotesPath(root, topic.id);
  const humanNotes = existsSync(notesFile) ? readFileSync(notesFile, "utf8") : null;

  const markdownPath = scriptMarkdownPath(root, topic.id);
  const jsonPath = scriptJsonPath(root, topic.id);

  writeFileSync(markdownPath, renderScriptMarkdown(topic, script, delivery, humanNotes));
  writeFileSync(
    jsonPath,
    `${JSON.stringify(
      {
        topicId: topic.id,
        title: topic.title,
        scriptHash: hash,
        delivery,
        scenes: script.scenes,
        beats: flattenBeats(script),
      },
      null,
      2,
    )}\n`,
  );

  // Seed an empty notes file so the path is obvious for humans.
  if (!existsSync(notesFile)) {
    writeFileSync(
      notesFile,
      `# Human notes · ${topic.title}\n\n` +
        `Add listen-through or read-through notes here. Fix wording in the topic pack, then re-run:\n\n` +
        "```bash\n" +
        `npm run script:parent-video -- ${topic.id}\n` +
        `npm run rehearse:parent-video -- ${topic.id}\n` +
        "```\n",
    );
  }

  return { script, delivery, hash, markdownPath, jsonPath };
}

/** Ideal spoken pace for Kokoro teaching clips (characters per second of audio). */
export const PACE = {
  minCharsPerSec: 8,
  maxCharsPerSec: 18,
  minDurationSec: 0.35,
} as const;

export function evaluateAudioPace(beats: RehearsalBeat[]): AudioFinding[] {
  const findings: AudioFinding[] = [];

  for (const beat of beats) {
    if (beat.durationSec == null || beat.charsPerSec == null) continue;
    const words = beat.spoken.trim().split(/\s+/).filter(Boolean).length;

    if (words >= 3 && beat.durationSec < PACE.minDurationSec) {
      findings.push({
        severity: "note",
        code: "clipped-audio",
        beatPath: beat.path,
        spoken: beat.spoken,
        message: "Audio is very short for a multi-word line — check punctuation or split.",
        durationSec: beat.durationSec,
        charsPerSec: beat.charsPerSec,
      });
    }

    if (beat.charsPerSec > PACE.maxCharsPerSec) {
      findings.push({
        severity: "blocking",
        code: "too-fast",
        beatPath: beat.path,
        spoken: beat.spoken,
        message: `Speaking too fast (${beat.charsPerSec.toFixed(1)} chars/s). Split the line or slow the voice slightly.`,
        durationSec: beat.durationSec,
        charsPerSec: beat.charsPerSec,
      });
    }

    if (beat.charsPerSec < PACE.minCharsPerSec && beat.spoken.length > 40) {
      findings.push({
        severity: "note",
        code: "too-slow",
        beatPath: beat.path,
        spoken: beat.spoken,
        message: `Speaking slowly (${beat.charsPerSec.toFixed(1)} chars/s). Check for awkward pauses inside the clip.`,
        durationSec: beat.durationSec,
        charsPerSec: beat.charsPerSec,
      });
    }
  }

  return findings;
}

export function buildRehearsalReport(input: {
  topic: Topic;
  script: ParentVideoScript;
  delivery: DeliveryReport;
  beats: RehearsalBeat[];
  audioFindings: AudioFinding[];
}): RehearsalReport {
  const scriptHash = scriptFingerprint(input.script);
  const blockingAudio = input.audioFindings.filter((item) => item.severity === "blocking").length;
  const status =
    deliveryBlocksProduction(input.delivery) || blockingAudio > 0 ? "fail" : "pass";

  return {
    topicId: input.topic.id,
    title: input.topic.title,
    scriptHash,
    createdAt: new Date().toISOString(),
    status,
    delivery: input.delivery,
    audioFindings: input.audioFindings,
    beats: input.beats,
  };
}

export function writeRehearsalArtifacts(root: string, report: RehearsalReport): {
  jsonPath: string;
  markdownPath: string;
} {
  const dir = parentVideoInboxDir(root, report.topicId);
  mkdirSync(dir, { recursive: true });
  const jsonPath = rehearsalReportPath(root, report.topicId);
  const markdownPath = rehearsalMarkdownPath(root, report.topicId);

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);

  const md = [
    `# Parent video rehearsal · ${report.title}`,
    "",
    `Status: **${report.status}**  `,
    `Script hash: \`${report.scriptHash}\`  `,
    `Created: ${report.createdAt}  `,
    "",
    "## Delivery (paper / aloud)",
    "",
    formatFindings(report.delivery.findings),
    "",
    "## Audio pace",
    "",
    formatFindings(report.audioFindings),
    "",
    "## Beats",
    "",
    ...report.beats.map((beat) => {
      const pace =
        beat.durationSec != null && beat.charsPerSec != null
          ? ` · ${beat.durationSec.toFixed(2)}s · ${beat.charsPerSec.toFixed(1)} c/s`
          : "";
      return `- \`${beat.path}\`${pace} — ${beat.spoken}`;
    }),
    "",
  ].join("\n");

  writeFileSync(markdownPath, md);
  return { jsonPath, markdownPath };
}

export function readRehearsalReport(root: string, topicId: string): RehearsalReport | null {
  const file = rehearsalReportPath(root, topicId);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as RehearsalReport;
}

export function assertReadyToRender(root: string, topic: Topic, opts: { force?: boolean } = {}): {
  script: ParentVideoScript;
  hash: string;
} {
  const script = buildParentVideoScript(topic);
  const hash = scriptFingerprint(script);
  const delivery = evaluateSpokenDelivery(script);

  if (opts.force) {
    return { script, hash };
  }

  if (deliveryBlocksProduction(delivery)) {
    const sample = delivery.findings
      .filter((item: DeliveryFinding) => item.severity === "blocking")
      .slice(0, 3)
      .map((item) => `${item.code}: ${item.spoken}`)
      .join("; ");
    throw new Error(
      `Spoken delivery blocked production for ${topic.id}. Run npm run script:parent-video -- ${topic.id} and fix the pack. ${sample}`,
    );
  }

  const report = readRehearsalReport(root, topic.id);
  if (!report) {
    throw new Error(
      `No rehearsal report for ${topic.id}. Run npm run rehearse:parent-video -- ${topic.id} before full production (or pass --force).`,
    );
  }
  if (report.scriptHash !== hash) {
    throw new Error(
      `Rehearsal report is stale for ${topic.id} (report ${report.scriptHash} vs script ${hash}). Re-run npm run rehearse:parent-video -- ${topic.id}.`,
    );
  }
  if (report.status !== "pass") {
    throw new Error(
      `Rehearsal failed for ${topic.id}. See inbox/parent-video/${topic.id}/rehearsal.md (or pass --force).`,
    );
  }

  return { script, hash };
}

export function sceneSummary(scenes: VideoScene[]): string {
  return scenes.map((scene) => `${scene.id}:${scene.beats.length}`).join(", ");
}

/** Per-topic render scratch (slides / mux). Separate from rehearsal so wipes keep audio. */
export function renderWorkDir(root: string, topicId: string): string {
  return path.join(root, ".video-work", "render", topicId);
}

/** Spoken-only rehearsal WAV for beat index (00.wav, 01.wav, …) — pauses are applied at render. */
export function rehearsalSpokenWavPath(root: string, topicId: string, beatIndex: number): string {
  return path.join(rehearsalAudioDir(root, topicId), `${String(beatIndex).padStart(2, "0")}.wav`);
}

/**
 * Ensure rehearsal spoken WAVs exist for every beat and match the current script hash.
 * Used by `render --reuse-audio` so graphics can change without re-paying for TTS.
 */
export function assertReusableRehearsalAudio(
  root: string,
  topicId: string,
  expectedBeats: number,
  scriptHash: string,
): string[] {
  const report = readRehearsalReport(root, topicId);
  if (!report) {
    throw new Error(
      `No rehearsal report for ${topicId}. Run npm run rehearse:parent-video -- ${topicId} before --reuse-audio.`,
    );
  }
  if (report.scriptHash !== scriptHash) {
    throw new Error(
      `Rehearsal audio is stale for ${topicId} (report ${report.scriptHash} vs script ${scriptHash}). Re-run npm run rehearse:parent-video -- ${topicId} before --reuse-audio.`,
    );
  }
  if (report.beats.length !== expectedBeats) {
    throw new Error(
      `Rehearsal beat count mismatch for ${topicId} (report ${report.beats.length} vs script ${expectedBeats}). Re-run rehearsal.`,
    );
  }

  const wavs: string[] = [];
  for (let index = 0; index < expectedBeats; index += 1) {
    const wavPath = rehearsalSpokenWavPath(root, topicId, index);
    if (!existsSync(wavPath)) {
      throw new Error(
        `Missing rehearsal WAV ${path.relative(root, wavPath)}. Run npm run rehearse:parent-video -- ${topicId}.`,
      );
    }
    wavs.push(wavPath);
  }
  return wavs;
}

export type RenderMode = "full" | "reuse-audio" | "slides-only";

export function parseRenderMode(flags: string[]): RenderMode {
  const reuse = flags.includes("--reuse-audio");
  const slidesOnly = flags.includes("--slides-only");
  if (reuse && slidesOnly) {
    throw new Error("Use only one of --reuse-audio or --slides-only.");
  }
  if (slidesOnly) return "slides-only";
  if (reuse) return "reuse-audio";
  return "full";
}

