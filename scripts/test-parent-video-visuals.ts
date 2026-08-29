import assert from "node:assert/strict";
import { guideSvg, resolveGuidePose, slideVisualSlot } from "../src/lib/parent-video-visuals";

assert.equal(resolveGuidePose("point", false), "present");
assert.equal(resolveGuidePose("point", true), "point");
assert.equal(resolveGuidePose("listen", false), "listen");

const corner = guideSvg("present", "corner");
assert.match(corner, /guide-corner/);
assert.match(corner, /viewBox="0 0 240 220"/);
assert.ok(corner.includes("mug") || corner.includes("#f4efe6"), "present pose keeps the mug");

const listen = guideSvg("listen", "feature");
assert.match(listen, /guide-feature/);
assert.ok(!listen.includes("<rect"), "listen pose puts the mug down (hand to ear)");

const point = guideSvg("point", "corner");
assert.match(point, /guide-corner/);
assert.match(point, /L178 78/, "point pose uses a short up-right jab toward the diagram");
assert.ok(!point.includes("222 68"), "old noodle arm should be gone");
assert.ok(!point.includes("<rect"), "point pose puts the mug down so the arm can aim");

const withDiagram = slideVisualSlot(
  { kind: "ten-frame", filled: 6, other: 4, caption: "6 and 4" },
  "point",
);
assert.match(withDiagram, /class="frame"/);
assert.match(withDiagram, /guide-corner/);
assert.match(withDiagram, /L178 78/);
assert.ok(!withDiagram.includes("visual-character"), "diagram beats keep the guide in the corner");

const pointless = slideVisualSlot(undefined, "point");
assert.match(pointless, /visual-character/);
assert.match(pointless, /guide-feature/);
assert.ok(!pointless.includes("L178 78"), "no-diagram beats must not keep a pointing arm");

console.log("Parent-video guide character layout looks good.");
