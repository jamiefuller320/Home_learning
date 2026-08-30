import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  assertReusableRehearsalAudio,
  parseRenderMode,
  rehearsalSpokenWavPath,
  renderWorkDir,
} from "../src/lib/parent-video-pipeline";

assert.equal(parseRenderMode([]), "full");
assert.equal(parseRenderMode(["--force"]), "full");
assert.equal(parseRenderMode(["--reuse-audio"]), "reuse-audio");
assert.equal(parseRenderMode(["--slides-only"]), "slides-only");
assert.throws(
  () => parseRenderMode(["--reuse-audio", "--slides-only"]),
  /only one of/,
);

const root = mkdtempSync(path.join(tmpdir(), "parent-video-reuse-"));
try {
  const topicId = "demo-topic";
  assert.equal(
    renderWorkDir(root, topicId),
    path.join(root, ".video-work", "render", topicId),
  );
  assert.equal(
    rehearsalSpokenWavPath(root, topicId, 7),
    path.join(root, ".video-work", "rehearsal", topicId, "07.wav"),
  );

  assert.throws(
    () => assertReusableRehearsalAudio(root, topicId, 2, "hash-a"),
    /No rehearsal report/,
  );

  const inbox = path.join(root, "inbox", "parent-video", topicId);
  const audioDir = path.join(root, ".video-work", "rehearsal", topicId);
  mkdirSync(inbox, { recursive: true });
  mkdirSync(audioDir, { recursive: true });
  writeFileSync(path.join(audioDir, "00.wav"), "fake-audio-0");
  writeFileSync(path.join(audioDir, "01.wav"), "fake-audio-1");
  writeFileSync(
    path.join(inbox, "rehearsal-report.json"),
    JSON.stringify({
      topicId,
      title: "Demo",
      scriptHash: "hash-a",
      createdAt: new Date().toISOString(),
      status: "pass",
      delivery: { findings: [], blockingCount: 0 },
      audioFindings: [],
      beats: [
        { path: "scenes.a.beats[0]", sceneId: "a", spoken: "one", line: "one", pauseAfter: 0.2 },
        { path: "scenes.a.beats[1]", sceneId: "a", spoken: "two", line: "two", pauseAfter: 0.2 },
      ],
    }),
  );

  const wavs = assertReusableRehearsalAudio(root, topicId, 2, "hash-a");
  assert.equal(wavs.length, 2);
  assert.ok(wavs[0].endsWith("00.wav"));
  assert.ok(wavs[1].endsWith("01.wav"));

  assert.throws(
    () => assertReusableRehearsalAudio(root, topicId, 2, "stale-hash"),
    /stale/,
  );
  assert.throws(
    () => assertReusableRehearsalAudio(root, topicId, 3, "hash-a"),
    /beat count/,
  );

  // Missing a WAV should fail clearly.
  rmSync(path.join(audioDir, "01.wav"));
  assert.throws(
    () => assertReusableRehearsalAudio(root, topicId, 2, "hash-a"),
    /Missing rehearsal WAV/,
  );
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log("Parent-video reuse-audio / slides-only building blocks look good.");
