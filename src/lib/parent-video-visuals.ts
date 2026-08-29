import type { GuidePose, VideoVisual } from "./parent-video-script";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export type GuideSize = "corner" | "feature";

/** Point only when a diagram is on screen — otherwise the arm aims at empty space. */
export function resolveGuidePose(pose: GuidePose, hasVisual: boolean): GuidePose {
  if (pose === "point" && !hasVisual) return "present";
  return pose;
}

/**
 * Recurring adult guide character — not a child, not a cartoon teacher.
 * Same person every film; pose changes with the beat. `feature` is for
 * beats with no diagram so the character can carry the frame.
 */
export function guideSvg(pose: GuidePose, size: GuideSize = "corner"): string {
  const smile =
    pose === "listen"
      ? `<path d="M92 78 q10 4 20 0" fill="none" stroke="#1d2a28" stroke-width="2.2" stroke-linecap="round"/>`
      : pose === "point"
        ? `<path d="M92 76 q10 8 20 0" fill="none" stroke="#1d2a28" stroke-width="2.4" stroke-linecap="round"/>`
        : `<path d="M92 77 q10 6 20 0" fill="none" stroke="#1d2a28" stroke-width="2.2" stroke-linecap="round"/>`;

  const brows =
    pose === "listen"
      ? `<path d="M78 58 q8 -6 16 0" fill="none" stroke="#1d2a28" stroke-width="2" stroke-linecap="round"/>
         <path d="M108 58 q8 -6 16 0" fill="none" stroke="#1d2a28" stroke-width="2" stroke-linecap="round"/>`
      : pose === "point"
        ? `<path d="M78 60 q8 -8 16 -2" fill="none" stroke="#1d2a28" stroke-width="2" stroke-linecap="round"/>
           <path d="M108 58 q8 -8 16 -2" fill="none" stroke="#1d2a28" stroke-width="2" stroke-linecap="round"/>`
        : `<path d="M78 60 q8 -5 16 0" fill="none" stroke="#1d2a28" stroke-width="2" stroke-linecap="round"/>
           <path d="M108 60 q8 -5 16 0" fill="none" stroke="#1d2a28" stroke-width="2" stroke-linecap="round"/>`;

  const leftArm =
    pose === "listen"
      ? `<path d="M72 128 C48 148 52 172 78 178" fill="none" stroke="#164843" stroke-width="9" stroke-linecap="round"/>
         <ellipse cx="62" cy="118" rx="14" ry="11" fill="#c4a574"/>`
      : pose === "point"
        ? // Free the left side; mug stays down while the right hand points at the diagram.
          `<path d="M78 132 C68 155 74 172 90 178" fill="none" stroke="#164843" stroke-width="9" stroke-linecap="round"/>`
        : `<path d="M78 132 C62 158 70 176 88 180" fill="none" stroke="#164843" stroke-width="9" stroke-linecap="round"/>`;

  // Corner guide sits under the diagram; jab straight up at the frame, not off into empty space.
  const rightArm =
    pose === "point"
      ? `<path d="M128 112 L128 38" fill="none" stroke="#164843" stroke-width="9" stroke-linecap="round"/>
         <circle cx="128" cy="30" r="9" fill="#c4a574"/>
         <path d="M128 22 L128 12" fill="none" stroke="#c4a574" stroke-width="5" stroke-linecap="round"/>`
      : `<path d="M132 132 C148 158 142 176 124 180" fill="none" stroke="#164843" stroke-width="9" stroke-linecap="round"/>`;

  const mug =
    pose === "listen" || pose === "point"
      ? ""
      : `<g transform="translate(118 148)">
           <rect x="0" y="0" width="28" height="24" rx="4" fill="#f4efe6" stroke="#8a5a20" stroke-width="2.5"/>
           <path d="M28 6 h8 a7 7 0 0 1 0 14 h-8" fill="none" stroke="#8a5a20" stroke-width="2.5"/>
           <ellipse cx="14" cy="3" rx="10" ry="3" fill="#d8c4a0" opacity="0.7"/>
         </g>`;

  const tilt = pose === "listen" ? `transform="rotate(-6 102 120)"` : "";
  const klass = size === "feature" ? "guide guide-feature" : "guide guide-corner";

  return `<svg class="${klass}" viewBox="0 0 240 220" aria-hidden="true">
    <g ${tilt}>
      <!-- soft ground shadow -->
      <ellipse cx="108" cy="206" rx="54" ry="8" fill="#1d2a28" opacity="0.08"/>
      <!-- hair -->
      <ellipse cx="102" cy="52" rx="42" ry="36" fill="#3a2a1c"/>
      <!-- head -->
      <circle cx="102" cy="64" r="34" fill="#c4a574"/>
      <!-- hair fringe -->
      <path d="M68 54 C78 34 126 34 136 54 C120 48 84 48 68 54" fill="#3a2a1c"/>
      ${brows}
      <!-- eyes -->
      <circle cx="88" cy="66" r="4" fill="#1d2a28"/>
      <circle cx="116" cy="66" r="4" fill="#1d2a28"/>
      <circle cx="89.5" cy="64.5" r="1.2" fill="#f4efe6"/>
      <circle cx="117.5" cy="64.5" r="1.2" fill="#f4efe6"/>
      ${smile}
      <!-- torso -->
      <path d="M58 108 C62 96 142 96 146 108 L152 176 C152 188 62 188 58 176 Z" fill="#1f5f59"/>
      <path d="M78 108 C92 118 112 118 126 108" fill="none" stroke="#164843" stroke-width="3" stroke-linecap="round"/>
      ${mug}
      ${leftArm}
      ${rightArm}
    </g>
  </svg>`;
}

function tenFrameHtml(filled: number, other = 0): string {
  const cells = Array.from({ length: 10 }, (_, index) => {
    const klass = index < filled ? "on" : index < filled + other ? "other" : "";
    return `<span class="cell ${klass}"></span>`;
  }).join("");
  return `<div class="frame" aria-hidden="true">${cells}</div>`;
}

function partWholeHtml(whole: number, left: number, right: number): string {
  return `<div class="bond" aria-hidden="true">
    <div class="bond-whole">${whole}</div>
    <div class="bond-arms"></div>
    <div class="bond-parts">
      <div class="bond-part">${left}</div>
      <div class="bond-part">${right}</div>
    </div>
  </div>`;
}

function listHtml(items: string[], highlight: number): string {
  const rows = items
    .map((item, index) => {
      const klass = index === highlight ? "list-item on" : "list-item";
      return `<p class="${klass}">${escapeHtml(item)}</p>`;
    })
    .join("");
  return `<div class="list">${rows}</div>`;
}

export function visualHtml(visual: VideoVisual): string {
  if (visual.kind === "ten-frame") {
    return `${tenFrameHtml(visual.filled, visual.other)}
      <p class="caption">${escapeHtml(visual.caption)}</p>`;
  }
  if (visual.kind === "part-whole") {
    return `${partWholeHtml(visual.whole, visual.left, visual.right)}
      <p class="caption">${escapeHtml(visual.caption)}</p>`;
  }
  return listHtml(visual.items, visual.highlight);
}

/** Slide body: diagram when present; otherwise feature the guide character. */
export function slideVisualSlot(beatVisual: VideoVisual | undefined, pose: GuidePose): string {
  const resolved = resolveGuidePose(pose, Boolean(beatVisual));
  if (beatVisual) {
    // Keep the guide under the diagram so “point” aims at something on screen.
    return `<div class="visual visual-with-guide">
      ${visualHtml(beatVisual)}
      ${guideSvg(resolved, "corner")}
    </div>`;
  }
  return `<div class="visual visual-character">${guideSvg(resolved, "feature")}</div>`;
}

export const SLIDE_CSS = `
    html, body { margin: 0; width: 1280px; height: 720px; }
    body {
      box-sizing: border-box;
      position: relative;
      padding: 48px 64px;
      background: #f4efe6;
      color: #1d2a28;
      font-family: "Source Sans 3", "Segoe UI", sans-serif;
    }
    .kicker { color: #1f5f59; font-size: 20px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
    h1 { font-family: Georgia, "Iowan Old Style", serif; font-size: 38px; line-height: 1.15; margin: 12px 0 18px; font-weight: 500; max-width: 38rem; }
    .layout { display: flex; gap: 40px; align-items: flex-start; }
    .copy { flex: 1 1 52%; min-width: 0; }
    .visual { flex: 1 1 42%; min-width: 0; }
    .visual-with-guide { position: relative; padding-bottom: 112px; min-height: 280px; display: flex; flex-direction: column; align-items: flex-start; }
    .visual-character { display: flex; align-items: flex-end; justify-content: center; min-height: 420px; padding-top: 24px; }
    .line { font-size: 26px; line-height: 1.4; color: #3d4f4b; margin: 0 0 12px; max-width: 36rem; }
    .frame { display: grid; grid-template-columns: repeat(5, 52px); gap: 10px; margin: 8px 0 12px; }
    .cell { width: 52px; height: 52px; border-radius: 999px; border: 3px solid #1f5f59; background: transparent; }
    .cell.on { background: #1f5f59; }
    .cell.other { background: #c47b2b; border-color: #8a5a20; }
    .caption { font-size: 18px; color: #3d4f4b; margin: 0; }
    .bond { width: 280px; text-align: center; }
    .bond-whole {
      display: inline-flex; align-items: center; justify-content: center;
      width: 88px; height: 88px; border-radius: 999px; border: 4px solid #1f5f59;
      font-size: 36px; font-weight: 700; color: #1f5f59;
    }
    .bond-arms { height: 28px; border-left: 3px solid #1f5f59; border-right: 3px solid #1f5f59; width: 160px; margin: 0 auto; border-bottom: 3px solid #1f5f59; }
    .bond-parts { display: flex; justify-content: space-between; width: 220px; margin: 0 auto; }
    .bond-part {
      display: inline-flex; align-items: center; justify-content: center;
      width: 72px; height: 72px; border-radius: 999px; border: 4px solid #8a5a20;
      font-size: 30px; font-weight: 700; color: #8a5a20; background: #f4efe6;
    }
    .list-item { font-size: 22px; line-height: 1.35; color: #7a6d5c; margin: 0 0 10px; }
    .list-item.on { color: #1d2a28; font-weight: 700; }
    .guide-corner { position: absolute; left: 72px; bottom: 0; width: 108px; height: auto; }
    .guide-feature { width: 320px; height: auto; }
    .mark { position: absolute; right: 64px; bottom: 28px; color: #1f5f59; font-size: 16px; }
`;
