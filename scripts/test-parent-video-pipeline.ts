import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { factsWithin10 } from "../src/content/england/ks1/year-1/maths/topics/facts-within-10";
import { buildParentVideoScript, type ParentVideoScript } from "../src/lib/parent-video-script";
import {
  deliveryBlocksProduction,
  evaluateSpokenDelivery,
} from "../src/lib/parent-video-delivery";
import {
  assertReadyToRender,
  buildRehearsalReport,
  evaluateAudioPace,
  flattenBeats,
  scriptFingerprint,
  writeRehearsalArtifacts,
  writeScriptPreview,
} from "../src/lib/parent-video-pipeline";

const live = buildParentVideoScript(factsWithin10);
const liveDelivery = evaluateSpokenDelivery(live);
assert.equal(liveDelivery.blockingCount, 0, "facts-within-10 spoken delivery should be clean");
assert.ok(!liveDelivery.findings.some((item) => item.code === "worksheet-brand"));
assert.ok(!spokenHas(live, /worksheet brand/i));
assert.ok(!spokenHas(live, /^Looking for:/m));
assert.ok(spokenHas(live, /You want to see:/i) || spokenHas(live, /label for that idea/i));

// The awkward paper-aside that sounded wrong aloud must still be caught.
const awkward: ParentVideoScript = {
  topicId: "fixture-awkward",
  title: "Awkward aside",
  scenes: [
    {
      id: "school",
      kicker: "At school",
      heading: "How school teaches it",
      beats: [
        {
          spoken: "Two parts that make a whole, not a worksheet brand.",
          line: "Two parts that make a whole, not a worksheet brand.",
          pauseAfter: 0.5,
        },
        {
          spoken: "Looking for: They see 2 empty spaces.",
          line: "Looking for: They see 2 empty spaces.",
          pauseAfter: 0.5,
        },
      ],
    },
  ],
};
const awkwardDelivery = evaluateSpokenDelivery(awkward);
assert.ok(deliveryBlocksProduction(awkwardDelivery));
assert.ok(awkwardDelivery.findings.some((item) => item.code === "worksheet-brand" || item.code === "product-meta-aside"));
assert.ok(awkwardDelivery.findings.some((item) => item.code === "ui-chrome-looking-for"));

const paceFindings = evaluateAudioPace([
  {
    path: "scenes.plain.beats[0]",
    sceneId: "plain",
    spoken: "A number fact is a small truth such as six and four make ten.",
    line: "A number fact is a small truth such as six and four make ten.",
    pauseAfter: 0.3,
    durationSec: 1.0,
    charsPerSec: 40,
  },
]);
assert.ok(paceFindings.some((item) => item.code === "too-fast"));

const root = mkdtempSync(path.join(tmpdir(), "parent-video-pipeline-"));
try {
  const preview = writeScriptPreview(root, factsWithin10);
  assert.ok(readFileSync(preview.markdownPath, "utf8").includes("Parent video script"));
  assert.equal(preview.hash, scriptFingerprint(live));

  assert.throws(
    () => assertReadyToRender(root, factsWithin10),
    /No rehearsal report/,
  );

  const beats = flattenBeats(live).map((beat) => ({
    ...beat,
    durationSec: 1.2,
    charsPerSec: 12,
  }));
  const report = buildRehearsalReport({
    topic: factsWithin10,
    script: live,
    delivery: liveDelivery,
    beats,
    audioFindings: [],
  });
  assert.equal(report.status, "pass");
  writeRehearsalArtifacts(root, report);
  const gated = assertReadyToRender(root, factsWithin10);
  assert.equal(gated.hash, preview.hash);
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log("Parent-video pipeline: preview, delivery, and rehearsal gate look good.");

function spokenHas(script: ParentVideoScript, pattern: RegExp): boolean {
  return script.scenes.some((scene) => scene.beats.some((beat) => pattern.test(beat.spoken)));
}
