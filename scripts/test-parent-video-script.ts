import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { factsWithin10 } from "../src/content/england/ks1/year-1/maths/topics/facts-within-10";
import {
  allBeats,
  buildParentVideoScript,
  forTheEar,
  sayThisLines,
  spokenClips,
  spokenCorpus,
  splitAsideRemark,
  splitExampleSums,
  takeSentences,
} from "../src/lib/parent-video-script";
import { PARENT_VIDEO_TTS } from "../src/lib/parent-video-voice";

const script = buildParentVideoScript(factsWithin10);
const spoken = spokenCorpus(script);
const beats = allBeats(script);
const sceneIds = script.scenes.map((scene) => scene.id);

assert.equal(script.topicId, "facts-within-10");
assert.deepEqual(sceneIds, ["open", "plain", "school", "mix", "tonight", "criteria", "page", "close"]);
assert.ok(beats.length >= 20, "teaching and task outline should still split into spoken beats");
assert.ok(beats.length <= 55, "script should stay concise — not a full page reading");
assert.ok(
  beats.every((beat) => beat.spoken.length > 0 && beat.spoken.length < 280),
  "each beat should stay short enough for Kokoro pacing",
);
assert.ok(beats.some((beat) => beat.pauseAfter >= 0.5), "section and example beats need a real pause");

assert.match(spoken, /Quick parent briefing/i);
assert.match(spoken, /not a film for your child/i);
assert.match(spoken, /written page/i);
assert.match(spoken, /Follow the school/i);
assert.ok(!/This pack is still a draft/i.test(spoken), "draft status belongs on the page badge, not in the film");
assert.ok(!/written pack is the source/i.test(spoken), "page handoff already covers the written pack");
assert.match(spoken, /enjoy the session together/i);
assert.match(spoken, /YouTube/i);
assert.match(spoken, /video description/i);
assert.ok(spoken.includes("fluency does not mean shouting answers against a timer") || spoken.includes("Fluency does not mean shouting"));
assert.match(spoken, /ten-frame/i);
assert.match(spoken, /number bond/i);
assert.ok(spoken.toLowerCase().includes(factsWithin10.parentBriefing.youAreReadyWhen.toLowerCase().slice(0, 40)));
assert.match(spoken, /fifteen minutes.*three number bonds.*plenty/i);
assert.match(spoken, /How many more to make 10/i);
assert.match(spoken, /Don.?t run the session from this film alone/i);
assert.match(spoken, /Here.?s what you want to see/i);
assert.match(spoken, /2 empty spaces/i);
assert.ok(!/worksheet brand/i.test(spoken), "worksheet-brand aside should not be filmed");
assert.ok(!/^Looking for:/m.test(spoken), "UI chrome Looking for should not be filmed");

// Example sums must be separate clips, not one rushed list.
assert.match(spoken, /Such as:\s*6 and 4 make 10/i);
assert.match(spoken, /Or:\s*7 take away 2 equals 5/i);
assert.ok(
  spoken.split("\n").some((line) => /^(Such as:\s*)?6 plus 4\.?$/i.test(line.trim())),
  "family facts should be spoken one at a time",
);
assert.ok(
  spoken.split("\n").some((line) => /^(Or:\s*)?4 plus 6\.?$/i.test(line.trim())),
  "family facts should be spoken one at a time",
);

// Website / aside remarks are their own beats so tone can change.
const pageBeats = script.scenes.find((scene) => scene.id === "page")?.beats.map((beat) => beat.spoken) ?? [];
assert.ok(pageBeats.length >= 5, "page handoff should be several distinct clips");
assert.ok(pageBeats.some((line) => /Found this on YouTube\?/i.test(line)));
assert.ok(pageBeats.some((line) => /video description/i.test(line)));
assert.ok(pageBeats.some((line) => /Don.?t run the session/i.test(line)));
assert.ok(
  pageBeats.every((line) => !/Found this on YouTube\?.*written page/i.test(line)),
  "YouTube aside must not share a clip with the page handoff",
);

const openBeats = script.scenes.find((scene) => scene.id === "open")?.beats.map((beat) => beat.spoken) ?? [];
assert.ok(openBeats.some((line) => /^Not a film for your child/i.test(line)));
assert.ok(openBeats.some((line) => /^Follow the school/i.test(line)));

// Say-this and avoid lists stay on the written pack for live use beside the child.
for (const line of sayThisLines(factsWithin10)) {
  assert.ok(!spoken.includes(forTheEar(line)) && !spoken.includes(line), `sayThis should not be filmed: ${line}`);
}
for (const line of factsWithin10.parentBriefing.avoidThis) {
  assert.ok(!spoken.includes(forTheEar(line)) && !spoken.includes(line), `avoidThis should not be filmed: ${line}`);
}

assert.equal(forTheEar("6 + 4 = 10 or 7 − 2 = 5"), "6 and 4 make 10 or 7 take away 2 equals 5");
assert.equal(forTheEar("They can do 3 + 2 with objects."), "They can do 3 plus 2 with objects.");
assert.deepEqual(
  splitExampleSums("A number fact is a small truth such as 6 + 4 = 10 or 7 − 2 = 5."),
  ["A number fact is a small truth.", "Such as: 6 and 4 make 10.", "Or: 7 take away 2 equals 5."],
);
assert.deepEqual(
  splitExampleSums("They will teach families of facts together: 6 + 4, 4 + 6, 10 − 4, 10 − 6."),
  ["They will teach families of facts together.", "6 plus 4.", "4 plus 6.", "10 take away 4.", "10 take away 6."],
);
assert.deepEqual(
  splitExampleSums("They will teach families of facts together, such as: 6 + 4, 4 + 6, 10 − 4, 10 − 6."),
  [
    "They will teach families of facts together.",
    "Such as: 6 plus 4.",
    "Or: 4 plus 6.",
    "Or: 10 take away 4.",
    "Or: 10 take away 6.",
  ],
);
assert.deepEqual(splitAsideRemark("Keep the frame — not a worksheet brand."), [
  "Keep the frame.",
  "Not a worksheet brand.",
]);
assert.deepEqual(spokenClips("Listen. Then try."), ["Listen.", "Then try."]);
assert.deepEqual(takeSentences("One. Two. Three.", 2), ["One.", "Two."]);

assert.equal(PARENT_VIDEO_TTS.voice, "Charlotte");
assert.ok(PARENT_VIDEO_TTS.speed >= 0.9 && PARENT_VIDEO_TTS.speed <= 1.15, "nominal speed kept for Kokoro fallback / prosody helpers");

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

console.log(`Parent-video script: ${beats.length} paced beats (examples and asides split for Kokoro).`);
