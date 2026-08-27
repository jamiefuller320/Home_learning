import type { GuidePose, VideoVisual } from "./parent-video-script";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Recurring adult guide — not a child, not a cartoon teacher. Same drawing, three poses. */
export function guideSvg(pose: GuidePose): string {
  const arm =
    pose === "point"
      ? `<path d="M62 86 C78 80 96 70 112 58" fill="none" stroke="#164843" stroke-width="6" stroke-linecap="round"/>
         <circle cx="114" cy="56" r="5" fill="#c4a574"/>`
      : pose === "listen"
        ? `<path d="M38 92 C28 104 30 118 42 122" fill="none" stroke="#164843" stroke-width="6" stroke-linecap="round"/>
           <ellipse cx="34" cy="78" rx="9" ry="7" fill="#c4a574"/>`
        : `<path d="M40 96 C34 110 38 120 48 122" fill="none" stroke="#164843" stroke-width="6" stroke-linecap="round"/>
           <path d="M80 96 C86 110 82 120 72 122" fill="none" stroke="#164843" stroke-width="6" stroke-linecap="round"/>`;

  const mug =
    pose === "listen"
      ? ""
      : `<rect x="70" y="92" width="18" height="16" rx="3" fill="#f4efe6" stroke="#8a5a20" stroke-width="2"/>
         <path d="M88 96 h6 a5 5 0 0 1 0 10 h-6" fill="none" stroke="#8a5a20" stroke-width="2"/>`;

  const tilt = pose === "listen" ? `transform="rotate(-8 60 70)"` : "";

  return `<svg class="guide" viewBox="0 0 128 150" aria-hidden="true">
    <g ${tilt}>
      <circle cx="60" cy="38" r="20" fill="#c4a574"/>
      <circle cx="53" cy="36" r="2.4" fill="#1d2a28"/>
      <circle cx="67" cy="36" r="2.4" fill="#1d2a28"/>
      <path d="M44 36 h8 M68 36 h8" stroke="#1d2a28" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M54 46 q6 5 12 0" fill="none" stroke="#1d2a28" stroke-width="1.8" stroke-linecap="round"/>
      <rect x="38" y="58" width="44" height="52" rx="16" fill="#1f5f59"/>
      ${mug}
      ${arm}
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
    .guide { position: absolute; left: 36px; bottom: 18px; width: 88px; height: auto; }
    .mark { position: absolute; right: 64px; bottom: 28px; color: #1f5f59; font-size: 16px; }
`;
