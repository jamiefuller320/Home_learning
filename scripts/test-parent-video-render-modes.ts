import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  assertReusableRehearsalAudio,
  bakedAudioDir,
  bakedBeatWavPath,
  beatIsSelected,
  parseBeatSelection,
  parseRenderMode,
  planBeatAudio,
  rehearsalClipWavPath,
  rehearsalSpokenWavPath,
  renderWorkDir,
  spokenClipHash,
  writeBakedBeatMeta,
} from "../src/lib/parent-video-pipeline";
import type { ParentVideoScript } from "../src/lib/parent-video-script";
import { loadParentVideoTheme, PARENT_VIDEO_THEME, themeCssVariables } from "../src/lib/parent-video-theme";
import { slideCss } from "../src/lib/parent-video-visuals";

assert.equal(parseRenderMode([]), "full");
assert.equal(parseRenderMode(["--force"]), "full");
assert.equal(parseRenderMode(["--reuse-audio"]), "reuse-audio");
assert.equal(parseRenderMode(["--slides-only"]), "slides-only");
assert.equal(parseRenderMode(["--audio-only"]), "audio-only");
assert.throws(
  () => parseRenderMode(["--reuse-audio", "--slides-only"]),
  /only one of/,
);
assert.throws(
  () => parseRenderMode(["--audio-only", "--reuse-audio"]),
  /only one of/,
);

const demoScript: ParentVideoScript = {
  topicId: "demo-topic",
  title: "Demo",
  scenes: [
    {
      id: "open",
      kicker: "Open",
      heading: "Hello",
      beats: [
        { spoken: "one", line: "one", pauseAfter: 0.2 },
        { spoken: "two", line: "two", pauseAfter: 0.2 },
      ],
    },
    {
      id: "school",
      kicker: "School",
      heading: "Method",
      beats: [
        { spoken: "three", line: "three", pauseAfter: 0.3, prosody: "aside" },
        { spoken: "four", line: "four", pauseAfter: 0.2 },
      ],
    },
  ],
};

assert.deepEqual(parseBeatSelection([], demoScript), { indexes: null, label: "all beats" });
assert.deepEqual(parseBeatSelection(["--scene", "open"], demoScript).indexes, [0, 1]);
assert.deepEqual(parseBeatSelection(["--scenes", "school"], demoScript).indexes, [2, 3]);
assert.deepEqual(parseBeatSelection(["--beats", "1,3"], demoScript).indexes, [1, 3]);
assert.deepEqual(parseBeatSelection(["--beats", "0-2"], demoScript).indexes, [0, 1, 2]);
assert.deepEqual(
  parseBeatSelection(["--scene", "open", "--beats", "3"], demoScript).indexes,
  [0, 1, 3],
);
assert.throws(() => parseBeatSelection(["--scene", "nope"], demoScript), /Unknown scene/);
assert.throws(() => parseBeatSelection(["--beats", "99"], demoScript), /Invalid --beats/);
assert.equal(beatIsSelected({ indexes: null, label: "all beats" }, 2), true);
assert.equal(beatIsSelected({ indexes: [0, 2], label: "x" }, 1), false);
assert.equal(beatIsSelected({ indexes: [0, 2], label: "x" }, 2), true);

assert.equal(spokenClipHash("hello", "teach"), spokenClipHash("hello", "teach"));
assert.notEqual(spokenClipHash("hello", "teach"), spokenClipHash("hello", "aside"));
assert.ok(themeCssVariables(PARENT_VIDEO_THEME).includes("--pv-brand:"));
assert.ok(slideCss(PARENT_VIDEO_THEME).includes(".audio-only-stub"));

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
  assert.equal(
    bakedAudioDir(root, topicId),
    path.join(root, ".video-work", "baked", topicId),
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

  // Per-clip hash reuse via clips/<hash>.wav even when script hash drifts.
  const hashOne = spokenClipHash("one");
  const clipPath = rehearsalClipWavPath(root, topicId, hashOne);
  mkdirSync(path.dirname(clipPath), { recursive: true });
  writeFileSync(clipPath, "clip-one");
  const planClip = planBeatAudio({
    root,
    topicId,
    beatIndex: 0,
    spoken: "one",
    pauseAfter: 0.2,
    scriptHash: "drifted",
    preferReuse: true,
  });
  assert.equal(planClip.source, "rehearsal");
  assert.equal(planClip.spokenHash, hashOne);

  // Gap-baked match wins when spokenHash + pauseAfter match.
  writeBakedBeatMeta(root, topicId, 0, { spokenHash: hashOne, pauseAfter: 0.2, durationSec: 1.5 });
  writeFileSync(bakedBeatWavPath(root, topicId, 0), "baked-one");
  const planBaked = planBeatAudio({
    root,
    topicId,
    beatIndex: 0,
    spoken: "one",
    pauseAfter: 0.2,
    scriptHash: "drifted",
    preferReuse: true,
  });
  assert.equal(planBaked.source, "baked");

  // Pause mismatch falls through to clip.
  const planPauseMiss = planBeatAudio({
    root,
    topicId,
    beatIndex: 0,
    spoken: "one",
    pauseAfter: 0.9,
    scriptHash: "drifted",
    preferReuse: true,
  });
  assert.equal(planPauseMiss.source, "rehearsal");

  // No reuse → always TTS.
  assert.equal(
    planBeatAudio({
      root,
      topicId,
      beatIndex: 0,
      spoken: "one",
      pauseAfter: 0.2,
      scriptHash: "hash-a",
      preferReuse: false,
    }).source,
    "tts",
  );

  // Theme JSON loader
  const themeFile = path.join(root, "theme.json");
  writeFileSync(themeFile, JSON.stringify(PARENT_VIDEO_THEME, null, 2));
  const loaded = loadParentVideoTheme(themeFile);
  assert.equal(loaded.brand, PARENT_VIDEO_THEME.brand);
  writeFileSync(themeFile, JSON.stringify({ brand: "#000000" }));
  assert.throws(() => loadParentVideoTheme(themeFile), /missing string keys/);
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log("Parent-video render building blocks (modes, selection, hash reuse, bake, theme) look good.");
