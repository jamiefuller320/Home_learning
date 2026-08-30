/**
 * One-off slide screenshots for graphics QA (bond, ten-frame, guide).
 *   npx tsx scripts/preview-parent-video-graphics.ts
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { GuidePose, VideoVisual } from "../src/lib/parent-video-script";
import { escapeHtml, slideVisualSlot, SLIDE_CSS } from "../src/lib/parent-video-visuals";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, ".video-work", "graphics-preview");
const ARTIFACTS = "/opt/cursor/artifacts/screenshots";
const CHROME = process.env.CHROME_PATH || "google-chrome";

mkdirSync(OUT, { recursive: true });
mkdirSync(ARTIFACTS, { recursive: true });

function slideHtml(
  kicker: string,
  heading: string,
  line: string,
  visual: VideoVisual | undefined,
  pose: GuidePose,
): string {
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <style>${SLIDE_CSS}</style>
</head>
<body>
  <div class="layout">
    <div class="copy">
      <p class="kicker">${escapeHtml(kicker)}</p>
      <h1>${escapeHtml(heading)}</h1>
      <p class="line">${escapeHtml(line)}</p>
    </div>
    ${slideVisualSlot(visual, pose)}
  </div>
  <p class="mark">Home Learning · generated from the written pack</p>
</body>
</html>`;
}

function screenshot(name: string, html: string) {
  const htmlPath = path.join(OUT, `${name}.html`);
  const pngPath = path.join(OUT, `${name}.png`);
  writeFileSync(htmlPath, html);
  const profile = path.join(OUT, `chrome-${name}`);
  mkdirSync(profile, { recursive: true });
  const result = spawnSync(
    "timeout",
    [
      "20",
      CHROME,
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--remote-debugging-port=0",
      `--user-data-dir=${profile}`,
      "--window-size=1280,720",
      `--screenshot=${pngPath}`,
      `file://${htmlPath}`,
    ],
    { encoding: "utf8", timeout: 25_000 },
  );
  if (!existsSync(pngPath)) {
    throw new Error(`Screenshot failed for ${name}: ${result.stderr || result.stdout}`);
  }
  console.log("wrote", pngPath);
  return pngPath;
}

const bond = screenshot(
  "after-bond",
  slideHtml(
    "How school teaches it",
    "Number facts within 10",
    "School often calls that pair a number bond: two parts that make a whole.",
    {
      kind: "part-whole",
      whole: 10,
      left: 6,
      right: 4,
      caption: "A number bond: two parts that make a whole.",
    },
    "point",
  ),
);

const tenFrame = screenshot(
  "after-ten-frame",
  slideHtml(
    "How school teaches it",
    "Number facts within 10",
    "They will teach families of facts together, such as: 6 + 4.",
    {
      kind: "ten-frame",
      filled: 6,
      other: 4,
      caption: "6 and 4 making 10, on a ten-frame.",
    },
    "point",
  ),
);

const character = screenshot(
  "after-character",
  slideHtml(
    "Tonight at home",
    "Number facts within 10",
    "Start with objects on a homemade ten-frame — not with a written sum.",
    undefined,
    "present",
  ),
);

copyFileSync(bond, path.join(ARTIFACTS, "number_bond_after.png"));
copyFileSync(tenFrame, path.join(ARTIFACTS, "ten_frame_after.png"));
copyFileSync(character, path.join(ARTIFACTS, "guide_character_after.png"));
console.log("Copied walkthrough screenshots to", ARTIFACTS);
