import assert from "node:assert/strict";
import { guideSvg, resolveGuidePose, slideVisualSlot, visualHtml } from "../src/lib/parent-video-visuals";

assert.equal(resolveGuidePose("point", false), "present");
assert.equal(resolveGuidePose("point", true), "point");
assert.equal(resolveGuidePose("listen", false), "listen");

const corner = guideSvg("present", "corner");
assert.match(corner, /guide-corner/);
assert.match(corner, /viewBox="0 0 240 220"/);
assert.ok(corner.includes('class="mug"') || corner.includes("#f7f1e6"), "present pose keeps the mug");
assert.match(corner, /url\(#skinGlow\)/, "guide uses soft skin shading");
assert.match(corner, /url\(#jumperShade\)/, "guide uses jumper gradient");

const listen = guideSvg("listen", "feature");
assert.match(listen, /guide-feature/);
assert.ok(!listen.includes('class="mug"'), "listen pose puts the mug down (hand to ear)");

const point = guideSvg("point", "corner");
assert.match(point, /guide-corner/);
assert.match(point, /L190 40/, "point pose uses a short up-right jab toward the diagram");
assert.ok(!point.includes("L128 38"), "vertical stem through the cherry must be gone");
assert.ok(!point.includes("222 68"), "old noodle arm should be gone");
assert.ok(!point.includes('class="mug"'), "point pose puts the mug down so the arm can aim");

const withDiagram = slideVisualSlot(
  { kind: "ten-frame", filled: 6, other: 4, caption: "6 and 4" },
  "point",
);
assert.match(withDiagram, /class="frame"/);
assert.match(withDiagram, /frame-panel/);
assert.match(withDiagram, /visual-with-guide/);
assert.match(withDiagram, /guide-corner/);
assert.match(withDiagram, /L190 40/);
assert.ok(!withDiagram.includes("visual-character"), "diagram beats keep the guide with the visual");

const pointless = slideVisualSlot(undefined, "point");
assert.match(pointless, /visual-character/);
assert.match(pointless, /guide-feature/);
assert.ok(!pointless.includes("L190 40"), "no-diagram beats must not keep a pointing arm");

const bond = visualHtml({
  kind: "part-whole",
  whole: 10,
  left: 6,
  right: 4,
  caption: "A number bond: two parts that make a whole.",
});
assert.match(bond, /class="bond"/);
assert.match(bond, /M114 78 L70 146/, "left arm runs from whole rim to left part");
assert.match(bond, /M166 78 L210 146/, "right arm runs from whole rim to right part");
assert.ok(!bond.includes("bond-arms"), "old CSS U-bar connector should be gone");
assert.match(bond, />10</, "whole numeral is drawn");
assert.match(bond, />6</, "left part numeral is drawn");
assert.match(bond, />4</, "right part numeral is drawn");

const frame = visualHtml({
  kind: "ten-frame",
  filled: 6,
  other: 4,
  caption: "6 and 4 making 10, on a ten-frame.",
});
assert.match(frame, /frame-panel/);
assert.match(frame, /class="counter"/, "counters render as filled discs inside cells");

console.log("Parent-video graphics (guide, cherry bond, ten-frame) look good.");
