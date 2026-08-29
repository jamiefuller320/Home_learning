import assert from "node:assert/strict";
import { buildParentVideoScript, allBeats } from "../src/lib/parent-video-script";
import { factsWithin10 } from "../src/content/england/ks1/year-1/maths/topics/facts-within-10";
import {
  shapeProsody,
  ttsSpeedForRole,
  type ProsodyRole,
} from "../src/lib/parent-video-prosody";
import { PARENT_VIDEO_TTS } from "../src/lib/parent-video-voice";

assert.equal(shapeProsody("Number facts within 10", "title"), "Number facts within 10.");
assert.equal(shapeProsody("Here’s the idea", "section"), "Here’s the idea.");
assert.equal(shapeProsody("Follow the school.", "aside"), "Follow the school…");
assert.equal(
  shapeProsody("Then you work from the written page, beside your child.", "aside"),
  "Then you work from the written page, beside your child.",
);
assert.equal(shapeProsody("Found this on YouTube?", "handoff"), "Found this on YouTube?");
assert.equal(shapeProsody("6 plus 4", "example"), "6 plus 4.");
assert.equal(shapeProsody("How many more to make 10?", "key"), "How many more to make 10?");
assert.equal(shapeProsody("Not a film for your child to watch!", "key"), "Not a film for your child to watch!");

assert.ok(ttsSpeedForRole(PARENT_VIDEO_TTS.speed, "example") < PARENT_VIDEO_TTS.speed);
assert.ok(ttsSpeedForRole(PARENT_VIDEO_TTS.speed, "aside") > PARENT_VIDEO_TTS.speed);
assert.ok(ttsSpeedForRole(PARENT_VIDEO_TTS.speed, "title") < PARENT_VIDEO_TTS.speed);

const script = buildParentVideoScript(factsWithin10);
const beats = allBeats(script);
assert.ok(beats.every((beat) => beat.prosody), "every beat should carry a prosody role");

const roles = new Set(beats.map((beat) => beat.prosody as ProsodyRole));
for (const needed of ["title", "section", "key", "teach", "example", "aside", "handoff"] as const) {
  assert.ok(roles.has(needed), `missing prosody role ${needed}`);
}

const title = beats.find((beat) => beat.prosody === "title");
assert.ok(title && /\.$/.test(title.spoken));

const aside = beats.find((beat) => beat.prosody === "aside" && /Follow the school/i.test(beat.spoken));
assert.ok(aside && /…$/.test(aside.spoken), "aside caveats should trail off for a softer tone");

const example = beats.find((beat) => beat.prosody === "example" && /6 plus 4/i.test(beat.spoken));
assert.ok(example, "example sums should be marked for deliberate delivery");

console.log(`Prosody: ${beats.length} beats tagged across ${roles.size} roles.`);
