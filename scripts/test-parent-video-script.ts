import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { factsWithin10 } from "../src/content/england/ks1/year-1/maths/topics/facts-within-10";
import {
  allBeats,
  buildParentVideoScript,
  forTheEar,
  sayThisLines,
  spokenCorpus,
  takeSentences,
} from "../src/lib/parent-video-script";
import { PARENT_VIDEO_TTS } from "../src/lib/parent-video-voice";

const script = buildParentVideoScript(factsWithin10);
const spoken = spokenCorpus(script);
const beats = allBeats(script);
const sceneIds = script.scenes.map((scene) => scene.id);

assert.equal(script.topicId, "facts-within-10");
assert.deepEqual(sceneIds, ["open", "plain", "school", "mix", "tonight", "criteria", "page", "close"]);
assert.ok(beats.length >= 12, "teaching and task outline should still split into spoken beats");
assert.ok(beats.length <= 28, "script should stay concise — not a full page reading");
assert.ok(
  beats.every((beat) => beat.spoken.length > 0 && beat.spoken.length < 280),
  "each beat should stay short enough for Kokoro pacing",
);
assert.ok(beats.some((beat) => beat.pauseAfter >= 0.5), "section beats need a real pause");

assert.match(spoken, /Quick parent briefing/i);
assert.match(spoken, /not a film for your child/i);
assert.match(spoken, /written page/i);
assert.match(spoken, /follow the school/i);
assert.match(spoken, /YouTube/i);
assert.match(spoken, /video description/i);
assert.ok(spoken.includes("fluency does not mean shouting answers against a timer") || spoken.includes("Fluency does not mean shouting"));
assert.match(spoken, /ten-frame/i);
assert.match(spoken, /number bond/i);
assert.ok(spoken.toLowerCase().includes(factsWithin10.parentBriefing.youAreReadyWhen.toLowerCase().slice(0, 40)));
assert.match(spoken, /fifteen minutes or three bonds/i);
assert.match(spoken, /How many more to make 10/i);
assert.match(spoken, /Don.?t run the session from this film/i);

// Say-this and avoid lists stay on the written pack for live use beside the child.
for (const line of sayThisLines(factsWithin10)) {
  assert.ok(!spoken.includes(forTheEar(line)) && !spoken.includes(line), `sayThis should not be filmed: ${line}`);
}
for (const line of factsWithin10.parentBriefing.avoidThis) {
  assert.ok(!spoken.includes(forTheEar(line)) && !spoken.includes(line), `avoidThis should not be filmed: ${line}`);
}

assert.equal(forTheEar("6 + 4 = 10 or 7 − 2 = 5"), "6 and 4 make 10 — or 7 take away 2 equals 5");
assert.equal(forTheEar("They can do 3 + 2 with objects."), "They can do 3 plus 2 with objects.");
assert.equal(forTheEar("Listen... then try."), "Listen — then try.");
assert.deepEqual(takeSentences("One. Two. Three.", 2), ["One.", "Two."]);

assert.equal(PARENT_VIDEO_TTS.voice, "bf_isabella");
assert.ok(PARENT_VIDEO_TTS.speed >= 1 && PARENT_VIDEO_TTS.speed <= 1.15, "voice should sit near natural pace, not slow audiobook");

const schoolVisuals = script.scenes
  .find((scene) => scene.id === "school")
  ?.beats.map((beat) => beat.visual?.kind)
  .filter(Boolean);
assert.ok(schoolVisuals?.includes("ten-frame"));
assert.ok(schoolVisuals?.includes("part-whole"));

const criteriaVisual = script.scenes
  .find((scene) => scene.id === "criteria")
  ?.beats.find((beat) => beat.visual?.kind === "ten-frame");
assert.equal(criteriaVisual?.visual && criteriaVisual.visual.kind === "ten-frame" ? criteriaVisual.visual.filled : 0, 7);

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

console.log(`Parent-video script: ${beats.length} concise beats (lesson + task outline + page handoff).`);
