import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Topic } from "@/content/schema";
import {
  allBeats,
  buildParentVideoScript,
  spokenCorpus,
  visualLabel,
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
  /** sha256 prefix of spoken+prosody — enables per-clip reuse. */
  spokenHash?: string;
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
      if (beat.visual) {
        lines.push(`   _[${beat.visual.kind}]_ ${visualLabel(beat.visual)}`);
      }
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

/** Ideal spoken pace for parent-briefing clips (characters per second of audio). */
export const PACE = {
  minCharsPerSec: 8,
  /** ElevenLabs Charlotte sits a touch quicker than Kokoro on short cues. */
  maxCharsPerSec: 21,
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

    // Short linking cues naturally spike chars/s; only block sustained rush.
    if (beat.charsPerSec > PACE.maxCharsPerSec && beat.spoken.replace(/\s+/g, "").length > 24) {
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

export function assertReadyToRender(
  root: string,
  topic: Topic,
  opts: {
    force?: boolean;
    /** Skip hash-matched rehearsal gate — used by --reuse-audio / --audio-only (per-clip planning). */
    allowStaleRehearsal?: boolean;
  } = {},
): {
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

  if (opts.allowStaleRehearsal) {
    // Per-clip / baked reuse decides audio sources; a drifted script hash is OK.
    return { script, hash };
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

/** Gap-baked beat audio (spoken + pauseAfter) — safe to reuse across graphics-only re-renders. */
export function bakedAudioDir(root: string, topicId: string): string {
  return path.join(root, ".video-work", "baked", topicId);
}

export function bakedBeatWavPath(root: string, topicId: string, beatIndex: number): string {
  return path.join(bakedAudioDir(root, topicId), `${String(beatIndex).padStart(2, "0")}.wav`);
}

export function bakedBeatMetaPath(root: string, topicId: string, beatIndex: number): string {
  return path.join(bakedAudioDir(root, topicId), `${String(beatIndex).padStart(2, "0")}.json`);
}

/** Spoken-only rehearsal WAV for beat index (00.wav, 01.wav, …). */
export function rehearsalSpokenWavPath(root: string, topicId: string, beatIndex: number): string {
  return path.join(rehearsalAudioDir(root, topicId), `${String(beatIndex).padStart(2, "0")}.wav`);
}

/** Content-addressed spoken clip — survives partial script edits when the line is unchanged. */
export function rehearsalClipWavPath(root: string, topicId: string, spokenHash: string): string {
  return path.join(rehearsalAudioDir(root, topicId), "clips", `${spokenHash}.wav`);
}

/** Stable hash of what was spoken (and how), for per-clip reuse. */
export function spokenClipHash(spoken: string, prosody?: string): string {
  return createHash("sha256")
    .update(JSON.stringify({ spoken: spoken.trim(), prosody: prosody ?? "" }))
    .digest("hex")
    .slice(0, 16);
}

export type BakedBeatMeta = {
  spokenHash: string;
  pauseAfter: number;
  durationSec?: number;
};

export function readBakedBeatMeta(root: string, topicId: string, beatIndex: number): BakedBeatMeta | null {
  const file = bakedBeatMetaPath(root, topicId, beatIndex);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as BakedBeatMeta;
}

export function writeBakedBeatMeta(
  root: string,
  topicId: string,
  beatIndex: number,
  meta: BakedBeatMeta,
): void {
  mkdirSync(bakedAudioDir(root, topicId), { recursive: true });
  writeFileSync(bakedBeatMetaPath(root, topicId, beatIndex), JSON.stringify(meta, null, 2) + "\n");
}

/**
 * Strict all-or-nothing check used when the whole script hash still matches.
 * Prefer `planBeatAudio` when individual lines may have changed.
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
      `Rehearsal audio is stale for ${topicId} (report ${report.scriptHash} vs script ${scriptHash}). Re-run npm run rehearse:parent-video -- ${topicId} before --reuse-audio, or rely on per-clip hashes after a partial edit.`,
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

export type AudioPlan =
  | { source: "baked"; path: string; spokenHash: string }
  | { source: "rehearsal"; path: string; spokenHash: string; needsGap: true }
  | { source: "tts"; spokenHash: string; needsGap: true };

/**
 * Decide how to obtain audio for one beat.
 * Order: gap-baked match → content-addressed rehearsal clip → index WAV if script hash matches → TTS.
 */
export function planBeatAudio(input: {
  root: string;
  topicId: string;
  beatIndex: number;
  spoken: string;
  pauseAfter: number;
  prosody?: string;
  scriptHash: string;
  preferReuse: boolean;
}): AudioPlan {
  const spokenHash = spokenClipHash(input.spoken, input.prosody);

  if (input.preferReuse) {
    const bakedMeta = readBakedBeatMeta(input.root, input.topicId, input.beatIndex);
    const bakedWav = bakedBeatWavPath(input.root, input.topicId, input.beatIndex);
    if (
      bakedMeta &&
      bakedMeta.spokenHash === spokenHash &&
      Math.abs(bakedMeta.pauseAfter - input.pauseAfter) < 0.001 &&
      existsSync(bakedWav)
    ) {
      return { source: "baked", path: bakedWav, spokenHash };
    }

    const clipPath = rehearsalClipWavPath(input.root, input.topicId, spokenHash);
    if (existsSync(clipPath)) {
      return { source: "rehearsal", path: clipPath, spokenHash, needsGap: true };
    }

    const report = readRehearsalReport(input.root, input.topicId);
    if (report && report.scriptHash === input.scriptHash) {
      const indexPath = rehearsalSpokenWavPath(input.root, input.topicId, input.beatIndex);
      if (existsSync(indexPath)) {
        return { source: "rehearsal", path: indexPath, spokenHash, needsGap: true };
      }
    }
  }

  return { source: "tts", spokenHash, needsGap: true };
}

export type RenderMode = "full" | "reuse-audio" | "slides-only" | "audio-only";

export function parseRenderMode(flags: string[]): RenderMode {
  const modes = [
    flags.includes("--reuse-audio") ? ("reuse-audio" as const) : null,
    flags.includes("--slides-only") ? ("slides-only" as const) : null,
    flags.includes("--audio-only") ? ("audio-only" as const) : null,
  ].filter(Boolean) as RenderMode[];

  if (modes.length > 1) {
    throw new Error("Use only one of --reuse-audio, --slides-only, or --audio-only.");
  }
  return modes[0] ?? "full";
}

export type BeatSelection = {
  /** Absolute indexes to rebuild. `null` means every beat. */
  indexes: number[] | null;
  label: string;
};

function parseBeatRangeToken(token: string, beatCount: number): number[] {
  const range = token.match(/^(\d+)\s*-\s*(\d+)$/);
  if (range) {
    const start = Number(range[1]);
    const end = Number(range[2]);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start) {
      throw new Error(`Invalid --beats range "${token}". Use start-end with start <= end.`);
    }
    if (end >= beatCount) {
      throw new Error(`--beats range "${token}" is out of range (script has ${beatCount} beats, 0..${beatCount - 1}).`);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  const single = Number(token);
  if (!Number.isInteger(single) || single < 0 || single >= beatCount) {
    throw new Error(`Invalid --beats index "${token}". Expected 0..${beatCount - 1} or start-end.`);
  }
  return [single];
}

function flagValues(flags: string[], name: string): string[] {
  const values: string[] = [];
  for (let i = 0; i < flags.length; i += 1) {
    const flag = flags[i];
    if (flag === name) {
      const value = flags[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${name} requires a value.`);
      }
      values.push(value);
      i += 1;
      continue;
    }
    if (flag.startsWith(`${name}=`)) {
      values.push(flag.slice(name.length + 1));
    }
  }
  return values;
}

/**
 * Parse `--scene school`, `--scenes open,plain`, `--beats 3-7`, `--beats 1,4,9`.
 * Selection is optional; omitting all of these rebuilds every beat.
 */
export function parseBeatSelection(flags: string[], script: ParentVideoScript): BeatSelection {
  const sceneValues = [
    ...flagValues(flags, "--scene"),
    ...flagValues(flags, "--scenes"),
  ].flatMap((value) => value.split(",").map((part) => part.trim()).filter(Boolean));
  const beatValues = flagValues(flags, "--beats").flatMap((value) =>
    value.split(",").map((part) => part.trim()).filter(Boolean),
  );

  if (sceneValues.length === 0 && beatValues.length === 0) {
    return { indexes: null, label: "all beats" };
  }

  const selected = new Set<number>();
  const labels: string[] = [];
  let cursor = 0;
  const sceneSpans = new Map<string, { start: number; end: number }>();
  for (const scene of script.scenes) {
    sceneSpans.set(scene.id, { start: cursor, end: cursor + scene.beats.length - 1 });
    cursor += scene.beats.length;
  }
  const beatCount = cursor;

  for (const sceneId of sceneValues) {
    const span = sceneSpans.get(sceneId);
    if (!span) {
      const known = [...sceneSpans.keys()].join(", ");
      throw new Error(`Unknown scene "${sceneId}". Known scenes: ${known}.`);
    }
    if (span.end < span.start) {
      throw new Error(`Scene "${sceneId}" has no beats.`);
    }
    for (let i = span.start; i <= span.end; i += 1) selected.add(i);
    labels.push(`scene:${sceneId}`);
  }

  for (const token of beatValues) {
    for (const index of parseBeatRangeToken(token, beatCount)) {
      selected.add(index);
    }
    labels.push(`beats:${token}`);
  }

  const indexes = [...selected].sort((a, b) => a - b);
  if (indexes.length === 0) {
    throw new Error("Beat selection matched no beats.");
  }
  return { indexes, label: labels.join(" + ") };
}

export function beatIsSelected(selection: BeatSelection, beatIndex: number): boolean {
  return selection.indexes === null || selection.indexes.includes(beatIndex);
}
