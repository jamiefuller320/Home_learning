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
      ? `<path d="M90 82 q13 5 26 0" fill="none" stroke="#2a3a36" stroke-width="2.5" stroke-linecap="round"/>`
      : pose === "point"
        ? `<path d="M90 80 q13 11 26 0" fill="none" stroke="#2a3a36" stroke-width="2.7" stroke-linecap="round"/>`
        : `<path d="M90 81 q13 9 26 0" fill="none" stroke="#2a3a36" stroke-width="2.5" stroke-linecap="round"/>`;

  const brows =
    pose === "listen"
      ? `<path d="M74 57 q10 -8 20 0" fill="none" stroke="#2a3a36" stroke-width="2.3" stroke-linecap="round"/>
         <path d="M110 57 q10 -8 20 0" fill="none" stroke="#2a3a36" stroke-width="2.3" stroke-linecap="round"/>`
      : pose === "point"
        ? `<path d="M74 59 q10 -10 20 -2" fill="none" stroke="#2a3a36" stroke-width="2.3" stroke-linecap="round"/>
           <path d="M110 57 q10 -10 20 -2" fill="none" stroke="#2a3a36" stroke-width="2.3" stroke-linecap="round"/>`
        : `<path d="M74 59 q10 -7 20 0" fill="none" stroke="#2a3a36" stroke-width="2.3" stroke-linecap="round"/>
           <path d="M110 59 q10 -7 20 0" fill="none" stroke="#2a3a36" stroke-width="2.3" stroke-linecap="round"/>`;

  // Sleeves as filled shapes so the figure reads as a person, not stick-arms.
  const leftArm =
    pose === "listen"
      ? `<path d="M72 118 C48 132 42 158 58 176 C66 184 78 180 82 172 C74 156 78 136 86 124 Z" fill="#164843"/>
         <ellipse cx="58" cy="118" rx="16" ry="13" fill="#d2b48c"/>
         <ellipse cx="53" cy="113" rx="4.5" ry="3.2" fill="#f0e2c8" opacity="0.55"/>`
      : pose === "point"
        ? `<path d="M74 120 C62 142 66 166 84 178 C92 182 98 176 96 168 C86 152 88 136 92 124 Z" fill="#164843"/>
           <circle cx="90" cy="178" r="9" fill="#d2b48c"/>`
        : `<path d="M74 120 C58 144 64 168 84 180 C92 184 98 178 96 170 C86 154 88 138 92 124 Z" fill="#164843"/>
           <circle cx="88" cy="180" r="9" fill="#d2b48c"/>`;

  // Short up-right jab toward the diagram — never a vertical stem through the cherry model.
  const rightArm =
    pose === "point"
      ? `<path d="M142 124 C152 110 160 96 168 84" fill="none" stroke="#164843" stroke-width="12" stroke-linecap="round"/>
         <circle cx="172" cy="78" r="11" fill="#d2b48c"/>
         <path d="M178 72 L190 60" fill="none" stroke="#d2b48c" stroke-width="5.5" stroke-linecap="round"/>`
      : `<path d="M140 120 C158 144 154 168 132 180 C124 184 118 178 120 170 C130 154 132 138 136 124 Z" fill="#164843"/>
         <circle cx="130" cy="180" r="9" fill="#d2b48c"/>`;

  const mug =
    pose === "listen" || pose === "point"
      ? ""
      : `<g class="mug" transform="translate(118 148)">
           <ellipse cx="14" cy="28" rx="17" ry="4.5" fill="#1d2a28" opacity="0.12"/>
           <rect x="0" y="2" width="28" height="25" rx="6" fill="#f7f1e6" stroke="#8a5a20" stroke-width="2.4"/>
           <path d="M28 9 h9 a8 8 0 0 1 0 14 h-9" fill="none" stroke="#8a5a20" stroke-width="2.4" stroke-linecap="round"/>
           <ellipse cx="14" cy="4" rx="11" ry="3.5" fill="#c4a574" opacity="0.55"/>
           <path d="M8 -6 q2 -8 0 -12" fill="none" stroke="#8a5a20" stroke-width="1.6" stroke-linecap="round" opacity="0.55"/>
           <path d="M14 -4 q2 -10 0 -14" fill="none" stroke="#8a5a20" stroke-width="1.6" stroke-linecap="round" opacity="0.4"/>
           <path d="M20 -6 q2 -8 0 -12" fill="none" stroke="#8a5a20" stroke-width="1.6" stroke-linecap="round" opacity="0.55"/>
         </g>`;

  const tilt = pose === "listen" ? `transform="rotate(-5 104 120)"` : "";
  const klass = size === "feature" ? "guide guide-feature" : "guide guide-corner";

  return `<svg class="${klass}" viewBox="0 0 240 220" aria-hidden="true">
    <defs>
      <radialGradient id="skinGlow" cx="38%" cy="32%" r="62%">
        <stop offset="0%" stop-color="#ead2ad"/>
        <stop offset="55%" stop-color="#d2b48c"/>
        <stop offset="100%" stop-color="#b9956c"/>
      </radialGradient>
      <linearGradient id="jumperShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2f857c"/>
        <stop offset="45%" stop-color="#1f5f59"/>
        <stop offset="100%" stop-color="#133f3b"/>
      </linearGradient>
      <linearGradient id="hairShade" x1="0.2" y1="0" x2="0.9" y2="1">
        <stop offset="0%" stop-color="#5a3f2a"/>
        <stop offset="100%" stop-color="#2a1c12"/>
      </linearGradient>
    </defs>
    <g ${tilt}>
      <ellipse cx="112" cy="210" rx="62" ry="10" fill="#1d2a28" opacity="0.12"/>
      <!-- hair back -->
      <ellipse cx="104" cy="52" rx="48" ry="42" fill="url(#hairShade)"/>
      <path d="M58 70 C54 100 62 118 78 122 C70 96 68 78 72 62 Z" fill="url(#hairShade)"/>
      <path d="M150 70 C154 100 146 118 130 122 C138 96 140 78 136 62 Z" fill="url(#hairShade)"/>
      <!-- neck + collar -->
      <path d="M94 94 L114 94 L118 116 L90 116 Z" fill="#d2b48c"/>
      <path d="M86 112 C96 124 112 124 122 112 L128 122 C114 134 94 134 80 122 Z" fill="#164843"/>
      <!-- head -->
      <circle cx="104" cy="66" r="37" fill="url(#skinGlow)"/>
      <ellipse cx="80" cy="78" rx="8" ry="5" fill="#d9897a" opacity="0.3"/>
      <ellipse cx="128" cy="78" rx="8" ry="5" fill="#d9897a" opacity="0.3"/>
      <!-- nose hint -->
      <path d="M104 70 q3 6 0 10" fill="none" stroke="#b9956c" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
      <!-- fringe -->
      <path d="M66 54 C78 26 132 24 142 54 C126 42 82 42 66 54 Z" fill="url(#hairShade)"/>
      <path d="M72 56 C88 42 104 50 104 50 C104 50 120 42 136 56 C124 48 112 54 104 64 C96 54 84 48 72 56 Z" fill="#3a2a1c" opacity="0.45"/>
      ${brows}
      <ellipse cx="90" cy="68" rx="5.2" ry="5.8" fill="#1d2a28"/>
      <ellipse cx="118" cy="68" rx="5.2" ry="5.8" fill="#1d2a28"/>
      <circle cx="91.8" cy="66" r="1.6" fill="#f7f1e6"/>
      <circle cx="119.8" cy="66" r="1.6" fill="#f7f1e6"/>
      ${smile}
      <!-- torso -->
      <path d="M54 116 C62 98 146 98 154 116 L162 176 C162 196 56 196 50 176 Z" fill="url(#jumperShade)"/>
      <path d="M70 138 C94 150 118 150 142 138" fill="none" stroke="#2f857c" stroke-width="2.4" stroke-linecap="round" opacity="0.35"/>
      <path d="M64 158 C90 168 118 168 148 158" fill="none" stroke="#133f3b" stroke-width="2" stroke-linecap="round" opacity="0.25"/>
      ${mug}
      ${leftArm}
      ${rightArm}
    </g>
  </svg>`;
}

function tenFrameHtml(filled: number, other = 0): string {
  const cells = Array.from({ length: 10 }, (_, index) => {
    const klass = index < filled ? "on" : index < filled + other ? "other" : "";
    return `<span class="cell ${klass}"><span class="counter"></span></span>`;
  }).join("");
  return `<div class="frame-panel" aria-hidden="true"><div class="frame">${cells}</div></div>`;
}

/**
 * Classroom cherry / part–whole model: whole on top, two parts below,
 * with separate arms that run from the whole rim to each part rim.
 */
function partWholeHtml(whole: number, left: number, right: number): string {
  return `<svg class="bond" viewBox="0 0 280 230" aria-hidden="true">
    <defs>
      <filter id="bondSoft" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#1d2a28" flood-opacity="0.12"/>
      </filter>
    </defs>
    <!-- two independent arms from whole rim into each part rim (wide attach so they never read as a Y-stem) -->
    <path d="M108 72 L70 146" fill="none" stroke="#1f5f59" stroke-width="5" stroke-linecap="round"/>
    <path d="M172 72 L210 146" fill="none" stroke="#1f5f59" stroke-width="5" stroke-linecap="round"/>
    <!-- whole -->
    <g filter="url(#bondSoft)">
      <circle cx="140" cy="48" r="40" fill="#e8f3f1" stroke="#1f5f59" stroke-width="5"/>
      <text x="140" y="60" text-anchor="middle" font-size="36" font-weight="700" fill="#1f5f59" font-family="Source Sans 3, Segoe UI, sans-serif">${whole}</text>
    </g>
    <!-- parts -->
    <g filter="url(#bondSoft)">
      <circle cx="70" cy="182" r="36" fill="#faf6ef" stroke="#8a5a20" stroke-width="5"/>
      <text x="70" y="194" text-anchor="middle" font-size="30" font-weight="700" fill="#8a5a20" font-family="Source Sans 3, Segoe UI, sans-serif">${left}</text>
      <circle cx="210" cy="182" r="36" fill="#faf6ef" stroke="#8a5a20" stroke-width="5"/>
      <text x="210" y="194" text-anchor="middle" font-size="30" font-weight="700" fill="#8a5a20" font-family="Source Sans 3, Segoe UI, sans-serif">${right}</text>
    </g>
  </svg>`;
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
      color: #1d2a28;
      font-family: "Source Sans 3", "Segoe UI", sans-serif;
      background:
        radial-gradient(ellipse 75% 60% at 100% 0%, rgba(31, 95, 89, 0.16), transparent 58%),
        radial-gradient(ellipse 60% 50% at 0% 100%, rgba(196, 123, 43, 0.14), transparent 52%),
        linear-gradient(165deg, #f8f3eb 0%, #efe5d6 46%, #e7dccb 100%);
    }
    body::before {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.045;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
    }
    .kicker { color: #1f5f59; font-size: 20px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
    h1 { font-family: Georgia, "Iowan Old Style", serif; font-size: 38px; line-height: 1.15; margin: 12px 0 18px; font-weight: 500; max-width: 38rem; color: #16322e; }
    .layout { display: flex; gap: 40px; align-items: flex-start; position: relative; z-index: 1; }
    .copy { flex: 1 1 52%; min-width: 0; }
    .visual { flex: 1 1 42%; min-width: 0; }
    .visual-with-guide { position: relative; padding-bottom: 132px; min-height: 300px; display: flex; flex-direction: column; align-items: flex-start; }
    .visual-character { display: flex; align-items: flex-end; justify-content: center; min-height: 420px; padding-top: 24px; }
    .line { font-size: 26px; line-height: 1.4; color: #3d4f4b; margin: 0 0 12px; max-width: 36rem; }
    .frame-panel {
      display: inline-block;
      padding: 18px 20px 16px;
      margin: 4px 0 14px;
      border-radius: 22px;
      background: rgba(255, 252, 247, 0.72);
      border: 1px solid rgba(31, 95, 89, 0.18);
      box-shadow: 0 10px 28px rgba(29, 42, 40, 0.08);
    }
    .frame { display: grid; grid-template-columns: repeat(5, 52px); gap: 10px; }
    .cell {
      width: 52px; height: 52px; border-radius: 999px;
      border: 3px solid #1f5f59; background: rgba(255,255,255,0.55);
      box-shadow: inset 0 2px 4px rgba(29, 42, 40, 0.08);
      display: flex; align-items: center; justify-content: center;
    }
    .cell .counter { width: 34px; height: 34px; border-radius: 999px; opacity: 0; }
    .cell.on { border-color: #164843; background: #dff0ed; }
    .cell.on .counter {
      opacity: 1;
      background: radial-gradient(circle at 32% 28%, #4aa89e, #1f5f59 62%, #164843 100%);
      box-shadow: 0 2px 4px rgba(22, 72, 67, 0.35);
    }
    .cell.other { border-color: #8a5a20; background: #f6ead8; }
    .cell.other .counter {
      opacity: 1;
      background: radial-gradient(circle at 32% 28%, #e0a35a, #c47b2b 62%, #8a5a20 100%);
      box-shadow: 0 2px 4px rgba(138, 90, 32, 0.3);
    }
    .caption { font-size: 18px; color: #3d4f4b; margin: 0; max-width: 22rem; }
    .bond { width: 300px; height: auto; display: block; margin: 4px 0 10px; margin-left: 48px; }
    .list { padding: 8px 4px; }
    .list-item { font-size: 22px; line-height: 1.35; color: #7a6d5c; margin: 0 0 10px; }
    .list-item.on { color: #1d2a28; font-weight: 700; }
    /* Sit left of the diagram so a point jab never reads as a third bond stem. */
    .guide-corner { position: absolute; left: 0; bottom: 0; width: 108px; height: auto; filter: drop-shadow(0 6px 10px rgba(29,42,40,0.12)); }
    .guide-feature { width: 360px; height: auto; filter: drop-shadow(0 12px 18px rgba(29,42,40,0.14)); }
    .mark { position: absolute; right: 64px; bottom: 28px; color: #1f5f59; font-size: 16px; z-index: 1; }
`;
