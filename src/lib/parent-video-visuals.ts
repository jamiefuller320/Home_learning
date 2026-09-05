import type { GuidePose, VideoVisual } from "./parent-video-script";
import { PARENT_VIDEO_THEME, themeCssVariables } from "./parent-video-theme";

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
      ? `<path d="M90 82 q13 5 26 0" fill="none" stroke="${PARENT_VIDEO_THEME.ink}" stroke-width="2.5" stroke-linecap="round"/>`
      : pose === "point"
        ? `<path d="M90 80 q13 11 26 0" fill="none" stroke="${PARENT_VIDEO_THEME.ink}" stroke-width="2.7" stroke-linecap="round"/>`
        : `<path d="M90 81 q13 9 26 0" fill="none" stroke="${PARENT_VIDEO_THEME.ink}" stroke-width="2.5" stroke-linecap="round"/>`;

  const brows =
    pose === "listen"
      ? `<path d="M74 57 q10 -8 20 0" fill="none" stroke="${PARENT_VIDEO_THEME.ink}" stroke-width="2.3" stroke-linecap="round"/>
         <path d="M110 57 q10 -8 20 0" fill="none" stroke="${PARENT_VIDEO_THEME.ink}" stroke-width="2.3" stroke-linecap="round"/>`
      : pose === "point"
        ? `<path d="M74 59 q10 -10 20 -2" fill="none" stroke="${PARENT_VIDEO_THEME.ink}" stroke-width="2.3" stroke-linecap="round"/>
           <path d="M110 57 q10 -10 20 -2" fill="none" stroke="${PARENT_VIDEO_THEME.ink}" stroke-width="2.3" stroke-linecap="round"/>`
        : `<path d="M74 59 q10 -7 20 0" fill="none" stroke="${PARENT_VIDEO_THEME.ink}" stroke-width="2.3" stroke-linecap="round"/>
           <path d="M110 59 q10 -7 20 0" fill="none" stroke="${PARENT_VIDEO_THEME.ink}" stroke-width="2.3" stroke-linecap="round"/>`;

  // Sleeves as filled shapes so the figure reads as a person, not stick-arms.
  const leftArm =
    pose === "listen"
      ? `<path d="M72 118 C48 132 42 158 58 176 C66 184 78 180 82 172 C74 156 78 136 86 124 Z" fill="${PARENT_VIDEO_THEME.brandDeep}"/>
         <ellipse cx="58" cy="118" rx="16" ry="13" fill="${PARENT_VIDEO_THEME.skin1}"/>
         <ellipse cx="53" cy="113" rx="4.5" ry="3.2" fill="#f0e2c8" opacity="0.55"/>`
      : pose === "point"
        ? `<path d="M74 120 C62 142 66 166 84 178 C92 182 98 176 96 168 C86 152 88 136 92 124 Z" fill="${PARENT_VIDEO_THEME.brandDeep}"/>
           <circle cx="90" cy="178" r="9" fill="${PARENT_VIDEO_THEME.skin1}"/>`
        : `<path d="M74 120 C58 144 64 168 84 180 C92 184 98 178 96 170 C86 154 88 138 92 124 Z" fill="${PARENT_VIDEO_THEME.brandDeep}"/>
           <circle cx="88" cy="180" r="9" fill="${PARENT_VIDEO_THEME.skin1}"/>`;

  // Short up-right jab toward the diagram — never a vertical stem through the cherry model.
  const rightArm =
    pose === "point"
      ? `<path d="M142 124 C152 110 160 96 168 84" fill="none" stroke="${PARENT_VIDEO_THEME.brandDeep}" stroke-width="12" stroke-linecap="round"/>
         <circle cx="172" cy="78" r="11" fill="${PARENT_VIDEO_THEME.skin1}"/>
         <path d="M178 72 L190 60" fill="none" stroke="${PARENT_VIDEO_THEME.skin1}" stroke-width="5.5" stroke-linecap="round"/>`
      : `<path d="M140 120 C158 144 154 168 132 180 C124 184 118 178 120 170 C130 154 132 138 136 124 Z" fill="${PARENT_VIDEO_THEME.brandDeep}"/>
         <circle cx="130" cy="180" r="9" fill="${PARENT_VIDEO_THEME.skin1}"/>`;

  const mug =
    pose === "listen" || pose === "point"
      ? ""
      : `<g class="mug" transform="translate(118 148)">
           <ellipse cx="14" cy="28" rx="17" ry="4.5" fill="${PARENT_VIDEO_THEME.ink}" opacity="0.12"/>
           <rect x="0" y="2" width="28" height="25" rx="6" fill="${PARENT_VIDEO_THEME.paper0}" stroke="${PARENT_VIDEO_THEME.accentDeep}" stroke-width="2.4"/>
           <path d="M28 9 h9 a8 8 0 0 1 0 14 h-9" fill="none" stroke="${PARENT_VIDEO_THEME.accentDeep}" stroke-width="2.4" stroke-linecap="round"/>
           <ellipse cx="14" cy="4" rx="11" ry="3.5" fill="${PARENT_VIDEO_THEME.skin2}" opacity="0.55"/>
           <path d="M8 -6 q2 -8 0 -12" fill="none" stroke="${PARENT_VIDEO_THEME.accentDeep}" stroke-width="1.6" stroke-linecap="round" opacity="0.55"/>
           <path d="M14 -4 q2 -10 0 -14" fill="none" stroke="${PARENT_VIDEO_THEME.accentDeep}" stroke-width="1.6" stroke-linecap="round" opacity="0.4"/>
           <path d="M20 -6 q2 -8 0 -12" fill="none" stroke="${PARENT_VIDEO_THEME.accentDeep}" stroke-width="1.6" stroke-linecap="round" opacity="0.55"/>
         </g>`;

  const tilt = pose === "listen" ? `transform="rotate(-5 104 120)"` : "";
  const klass = size === "feature" ? "guide guide-feature" : "guide guide-corner";

  return `<svg class="${klass}" viewBox="0 0 240 220" aria-hidden="true">
    <defs>
      <radialGradient id="skinGlow" cx="38%" cy="32%" r="62%">
        <stop offset="0%" stop-color="${PARENT_VIDEO_THEME.skin0}"/>
        <stop offset="55%" stop-color="${PARENT_VIDEO_THEME.skin1}"/>
        <stop offset="100%" stop-color="${PARENT_VIDEO_THEME.skin2}"/>
      </radialGradient>
      <linearGradient id="jumperShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${PARENT_VIDEO_THEME.brandMid}"/>
        <stop offset="45%" stop-color="${PARENT_VIDEO_THEME.brand}"/>
        <stop offset="100%" stop-color="${PARENT_VIDEO_THEME.brandDeep}"/>
      </linearGradient>
      <linearGradient id="hairShade" x1="0.2" y1="0" x2="0.9" y2="1">
        <stop offset="0%" stop-color="${PARENT_VIDEO_THEME.hair0}"/>
        <stop offset="100%" stop-color="${PARENT_VIDEO_THEME.hair1}"/>
      </linearGradient>
    </defs>
    <g ${tilt}>
      <ellipse cx="112" cy="210" rx="62" ry="10" fill="${PARENT_VIDEO_THEME.ink}" opacity="0.12"/>
      <!-- hair back -->
      <ellipse cx="104" cy="52" rx="48" ry="42" fill="url(#hairShade)"/>
      <path d="M58 70 C54 100 62 118 78 122 C70 96 68 78 72 62 Z" fill="url(#hairShade)"/>
      <path d="M150 70 C154 100 146 118 130 122 C138 96 140 78 136 62 Z" fill="url(#hairShade)"/>
      <!-- neck + collar -->
      <path d="M94 94 L114 94 L118 116 L90 116 Z" fill="${PARENT_VIDEO_THEME.skin1}"/>
      <path d="M86 112 C96 124 112 124 122 112 L128 122 C114 134 94 134 80 122 Z" fill="${PARENT_VIDEO_THEME.brandDeep}"/>
      <!-- head -->
      <circle cx="104" cy="66" r="37" fill="url(#skinGlow)"/>
      <ellipse cx="80" cy="78" rx="8" ry="5" fill="${PARENT_VIDEO_THEME.blush}" opacity="0.3"/>
      <ellipse cx="128" cy="78" rx="8" ry="5" fill="${PARENT_VIDEO_THEME.blush}" opacity="0.3"/>
      <!-- nose hint -->
      <path d="M104 70 q3 6 0 10" fill="none" stroke="${PARENT_VIDEO_THEME.skin2}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
      <!-- fringe -->
      <path d="M66 54 C78 26 132 24 142 54 C126 42 82 42 66 54 Z" fill="url(#hairShade)"/>
      <path d="M72 56 C88 42 104 50 104 50 C104 50 120 42 136 56 C124 48 112 54 104 64 C96 54 84 48 72 56 Z" fill="${PARENT_VIDEO_THEME.hair0}" opacity="0.45"/>
      ${brows}
      <ellipse cx="90" cy="68" rx="5.2" ry="5.8" fill="${PARENT_VIDEO_THEME.ink}"/>
      <ellipse cx="118" cy="68" rx="5.2" ry="5.8" fill="${PARENT_VIDEO_THEME.ink}"/>
      <circle cx="91.8" cy="66" r="1.6" fill="${PARENT_VIDEO_THEME.paper0}"/>
      <circle cx="119.8" cy="66" r="1.6" fill="${PARENT_VIDEO_THEME.paper0}"/>
      ${smile}
      <!-- torso -->
      <path d="M54 116 C62 98 146 98 154 116 L162 176 C162 196 56 196 50 176 Z" fill="url(#jumperShade)"/>
      <path d="M70 138 C94 150 118 150 142 138" fill="none" stroke="${PARENT_VIDEO_THEME.brandMid}" stroke-width="2.4" stroke-linecap="round" opacity="0.35"/>
      <path d="M64 158 C90 168 118 168 148 158" fill="none" stroke="${PARENT_VIDEO_THEME.brandDeep}" stroke-width="2" stroke-linecap="round" opacity="0.25"/>
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

function numberTrackHtml(numbers: number[], highlight: number): string {
  const cells = numbers
    .map((n) => {
      const klass = n === highlight ? "track-cell on" : "track-cell";
      return `<span class="${klass}">${n}</span>`;
    })
    .join("");
  return `<div class="track-panel" aria-hidden="true"><div class="track">${cells}</div></div>`;
}

function numberLineHtml(start: number, end: number, marks: number[], highlight?: number): string {
  const span = Math.max(end - start, 1);
  const ticks = marks
    .map((mark) => {
      const left = ((mark - start) / span) * 100;
      const on = mark === highlight ? " on" : "";
      return `<span class="nl-mark${on}" style="left:${left}%"><span class="nl-tick"></span><span class="nl-num">${mark}</span></span>`;
    })
    .join("");
  return `<div class="nl-panel" aria-hidden="true"><div class="nl">${ticks}</div></div>`;
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
  if (visual.kind === "number-track") {
    return `${numberTrackHtml(visual.numbers, visual.highlight)}
      <p class="caption">${escapeHtml(visual.caption)}</p>`;
  }
  if (visual.kind === "number-line") {
    return `${numberLineHtml(visual.start, visual.end, visual.marks, visual.highlight)}
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

/** Slide stylesheet for a theme (defaults to PARENT_VIDEO_THEME). */
export function slideCss(theme: typeof PARENT_VIDEO_THEME = PARENT_VIDEO_THEME): string {
  return `
${themeCssVariables(theme)}
    html, body { margin: 0; width: 1280px; height: 720px; }
    body {
      box-sizing: border-box;
      position: relative;
      padding: 48px 64px;
      color: var(--pv-ink);
      font-family: var(--pv-body);
      background:
        radial-gradient(ellipse 75% 60% at 100% 0%, color-mix(in srgb, var(--pv-brand) 16%, transparent), transparent 58%),
        radial-gradient(ellipse 60% 50% at 0% 100%, color-mix(in srgb, var(--pv-accent) 14%, transparent), transparent 52%),
        linear-gradient(165deg, var(--pv-paper-0) 0%, var(--pv-paper-1) 46%, var(--pv-paper-2) 100%);
    }
    body::before {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.045;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
    }
    .kicker { color: var(--pv-brand); font-size: 20px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
    h1 { font-family: var(--pv-display); font-size: 38px; line-height: 1.15; margin: 12px 0 18px; font-weight: 500; max-width: 38rem; color: var(--pv-brand-deep); }
    .layout { display: flex; gap: 40px; align-items: flex-start; position: relative; z-index: 1; }
    .copy { flex: 1 1 52%; min-width: 0; }
    .visual { flex: 1 1 42%; min-width: 0; }
    .visual-with-guide { position: relative; padding-bottom: 132px; min-height: 300px; display: flex; flex-direction: column; align-items: flex-start; }
    .visual-character { display: flex; align-items: flex-end; justify-content: center; min-height: 420px; padding-top: 24px; }
    .line { font-size: 26px; line-height: 1.4; color: var(--pv-ink-soft); margin: 0 0 12px; max-width: 36rem; }
    .frame-panel {
      display: inline-block;
      padding: 18px 20px 16px;
      margin: 4px 0 14px;
      border-radius: 22px;
      background: var(--pv-panel);
      border: 1px solid color-mix(in srgb, var(--pv-brand) 18%, transparent);
      box-shadow: 0 10px 28px color-mix(in srgb, var(--pv-ink) 8%, transparent);
    }
    .frame { display: grid; grid-template-columns: repeat(5, 52px); gap: 10px; }
    .cell {
      width: 52px; height: 52px; border-radius: 999px;
      border: 3px solid var(--pv-brand); background: rgba(255,255,255,0.55);
      box-shadow: inset 0 2px 4px color-mix(in srgb, var(--pv-ink) 8%, transparent);
      display: flex; align-items: center; justify-content: center;
    }
    .cell .counter { width: 34px; height: 34px; border-radius: 999px; opacity: 0; }
    .cell.on { border-color: var(--pv-brand-deep); background: color-mix(in srgb, var(--pv-brand) 14%, white); }
    .cell.on .counter {
      opacity: 1;
      background: radial-gradient(circle at 32% 28%, var(--pv-brand-mid), var(--pv-brand) 62%, var(--pv-brand-deep) 100%);
      box-shadow: 0 2px 4px color-mix(in srgb, var(--pv-brand-deep) 35%, transparent);
    }
    .cell.other { border-color: var(--pv-accent-deep); background: color-mix(in srgb, var(--pv-accent) 18%, white); }
    .cell.other .counter {
      opacity: 1;
      background: radial-gradient(circle at 32% 28%, color-mix(in srgb, var(--pv-accent) 70%, white), var(--pv-accent) 62%, var(--pv-accent-deep) 100%);
      box-shadow: 0 2px 4px color-mix(in srgb, var(--pv-accent-deep) 30%, transparent);
    }
    .caption { font-size: 18px; color: var(--pv-ink-soft); margin: 0; max-width: 22rem; }
    .track-panel {
      display: inline-block;
      padding: 16px 18px 14px;
      margin: 4px 0 14px;
      border-radius: 22px;
      background: var(--pv-panel);
      border: 1px solid color-mix(in srgb, var(--pv-brand) 18%, transparent);
      box-shadow: 0 10px 28px color-mix(in srgb, var(--pv-ink) 8%, transparent);
    }
    .track { display: flex; flex-wrap: wrap; gap: 8px; max-width: 420px; }
    .track-cell {
      min-width: 42px; height: 42px; padding: 0 8px;
      border-radius: 12px;
      border: 3px solid var(--pv-brand);
      background: rgba(255,255,255,0.55);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 18px; color: var(--pv-brand-deep);
    }
    .track-cell.on {
      border-color: var(--pv-brand-deep);
      background: color-mix(in srgb, var(--pv-brand) 18%, white);
      box-shadow: 0 2px 4px color-mix(in srgb, var(--pv-brand-deep) 25%, transparent);
    }
    .nl-panel {
      display: block;
      padding: 28px 18px 12px;
      margin: 4px 0 14px;
      border-radius: 22px;
      background: var(--pv-panel);
      border: 1px solid color-mix(in srgb, var(--pv-brand) 18%, transparent);
      min-width: 280px; max-width: 420px;
    }
    .nl { position: relative; height: 56px; margin: 0 8px; border-top: 3px solid var(--pv-ink); }
    .nl-mark { position: absolute; top: -2px; transform: translateX(-50%); text-align: center; }
    .nl-tick { display: block; width: 2px; height: 14px; margin: 0 auto; background: var(--pv-ink); }
    .nl-num { display: block; margin-top: 4px; font-size: 16px; font-weight: 700; color: var(--pv-ink-soft); }
    .nl-mark.on .nl-tick { background: var(--pv-brand-deep); width: 3px; }
    .nl-mark.on .nl-num { color: var(--pv-brand-deep); }
    .bond { width: 300px; height: auto; display: block; margin: 4px 0 10px; margin-left: 48px; }
    .list { padding: 8px 4px; }
    .list-item { font-size: 22px; line-height: 1.35; color: color-mix(in srgb, var(--pv-ink-soft) 70%, #7a6d5c); margin: 0 0 10px; }
    .list-item.on { color: var(--pv-ink); font-weight: 700; }
    .guide-corner { position: absolute; left: 0; bottom: 0; width: 108px; height: auto; filter: drop-shadow(0 6px 10px color-mix(in srgb, var(--pv-ink) 12%, transparent)); }
    .guide-feature { width: 360px; height: auto; filter: drop-shadow(0 12px 18px color-mix(in srgb, var(--pv-ink) 14%, transparent)); }
    .mark { position: absolute; right: 64px; bottom: 28px; color: var(--pv-brand); font-size: 16px; z-index: 1; }
    .audio-only-stub {
      display: flex; align-items: center; justify-content: center;
      min-height: 420px; width: 100%;
      border-radius: 24px;
      background: color-mix(in srgb, var(--pv-brand) 8%, var(--pv-paper-0));
      border: 1px dashed color-mix(in srgb, var(--pv-brand) 35%, transparent);
      color: var(--pv-brand); font-size: 22px; letter-spacing: 0.04em;
    }
`;
}

/** Default slide CSS (Home Learning theme). */
export const SLIDE_CSS = slideCss();
