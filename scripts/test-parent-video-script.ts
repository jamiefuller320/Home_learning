import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { factsWithin10 } from "../src/content/england/ks1/year-1/maths/topics/facts-within-10";
import { buildParentVideoScript, spokenCorpus } from "../src/lib/parent-video-script";

const script = buildParentVideoScript(factsWithin10);
const spoken = spokenCorpus(script);

assert.equal(script.topicId, "facts-within-10");
assert.ok(script.scenes.length >= 8);

assert.match(spoken, /parent briefing, not a lesson for your child/i);
assert.ok(spoken.includes(factsWithin10.parentBriefing.inPlainEnglish));
assert.ok(spoken.includes(factsWithin10.parentBriefing.howSchoolTeachesIt));
assert.ok(spoken.includes(factsWithin10.parentBriefing.youAreReadyWhen));
assert.ok(spoken.includes(factsWithin10.homePack.stopRule));

for (const line of factsWithin10.parentBriefing.sayThis) {
  const text = typeof line === "string" ? line : line.prompt;
  assert.ok(spoken.includes(text), `missing sayThis: ${text}`);
}

assert.match(spoken, /follow the school/i);

const schoolScene = script.scenes.find((scene) => scene.id === "school");
assert.equal(schoolScene?.tenFrame?.filled, 6);

assert.ok(factsWithin10.parentVideo, "facts-within-10 should ship the proof-of-concept video");
const videoRel = factsWithin10.parentVideo.src.replace(/^\//, "");
assert.ok(
  existsSync(path.join(process.cwd(), "public", videoRel)),
  `missing rendered file public/${videoRel}`,
);

console.log("Parent-video script is compiled from the pack, not invented.");
