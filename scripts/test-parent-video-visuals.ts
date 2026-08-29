import assert from "node:assert/strict";
import { guideSvg, slideVisualSlot } from "../src/lib/parent-video-visuals";

const corner = guideSvg("present", "corner");
assert.match(corner, /guide-corner/);
assert.match(corner, /viewBox="0 0 240 220"/);
assert.ok(corner.includes("mug") || corner.includes("#f4efe6"), "present pose keeps the mug");

const listen = guideSvg("listen", "feature");
assert.match(listen, /guide-feature/);
assert.ok(!listen.includes("<rect"), "listen pose puts the mug down (hand to ear)");

const point = guideSvg("point", "feature");
assert.match(point, /guide-feature/);
assert.ok(point.includes("222 68") || point.includes("point"), "point pose extends an arm");

const withDiagram = slideVisualSlot(
  { kind: "ten-frame", filled: 6, other: 4, caption: "6 and 4" },
  "point",
);
assert.match(withDiagram, /class="frame"/);
assert.match(withDiagram, /guide-corner/);
assert.ok(!withDiagram.includes("visual-character"), "diagram beats keep the guide in the corner");

const characterOnly = slideVisualSlot(undefined, "present");
assert.match(characterOnly, /visual-character/);
assert.match(characterOnly, /guide-feature/);
assert.ok(!characterOnly.includes("guide-corner"), "no-diagram beats feature the character");

console.log("Parent-video guide character layout looks good.");
