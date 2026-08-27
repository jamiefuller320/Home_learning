import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { factsWithin10 } from "../src/content/england/ks1/year-1/maths/topics/facts-within-10";
import {
  allBeats,
  buildParentVideoScript,
  forTheEar,
  spokenCorpus,
} from "../src/lib/parent-video-script";

const script = buildParentVideoScript(factsWithin10);
const spoken = spokenCorpus(script);
const beats = allBeats(script);

assert.equal(script.topicId, "facts-within-10");
assert.ok(script.scenes.length >= 8);
assert.ok(beats.length >= 20, "long page sentences should be split into spoken beats");
assert.ok(
  beats.every((beat) => beat.spoken.length > 0 && beat.spoken.length < 280),
  "each beat should stay short enough for Kokoro pacing",
);
assert.ok(beats.some((beat) => beat.pauseAfter >= 0.5), "list and section beats need a real pause");

assert.match(spoken, /parent briefing/i);
assert.match(spoken, /not a lesson for your child/i);
assert.match(spoken, /follow the school/i);
assert.ok(spoken.includes("fluency does not mean shouting answers against a timer") || spoken.includes("Fluency does not mean shouting"));
assert.match(spoken, /ten-frame/i);
assert.match(spoken, /number bond/i);
assert.ok(spoken.toLowerCase().includes(factsWithin10.parentBriefing.youAreReadyWhen.toLowerCase().slice(0, 40)));
assert.match(spoken, /fifteen minutes or three bonds/i);

for (const line of factsWithin10.parentBriefing.sayThis) {
  const text = typeof line === "string" ? line : line.prompt;
  assert.ok(spoken.includes(forTheEar(text)) || spoken.includes(text), `missing sayThis: ${text}`);
}

assert.equal(forTheEar("6 + 4 = 10 or 7 − 2 = 5"), "6 and 4 make 10... or 7 take away 2 equals 5");
assert.equal(forTheEar("They can do 3 + 2 with objects."), "They can do 3 plus 2 with objects.");

const schoolVisuals = script.scenes
  .find((scene) => scene.id === "school")
  ?.beats.map((beat) => beat.visual?.kind)
  .filter(Boolean);
assert.ok(schoolVisuals?.includes("ten-frame"));
assert.ok(schoolVisuals?.includes("part-whole"));

const readyVisual = script.scenes
  .find((scene) => scene.id === "ready")
  ?.beats.find((beat) => beat.visual?.kind === "ten-frame");
assert.equal(readyVisual?.visual && readyVisual.visual.kind === "ten-frame" ? readyVisual.visual.filled : 0, 7);

assert.ok(
  beats.some((beat) => beat.guide === "point") && beats.some((beat) => beat.guide === "listen"),
  "the guide should change pose with the beat",
);

assert.ok(factsWithin10.parentVideo, "facts-within-10 should ship the proof-of-concept video");
const videoRel = factsWithin10.parentVideo.src.replace(/^\//, "");
assert.ok(
  existsSync(path.join(process.cwd(), "public", videoRel)),
  `missing rendered file public/${videoRel}`,
);

console.log(`Parent-video script: ${beats.length} beats compiled from the pack, not invented.`);
