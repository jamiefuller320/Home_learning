/**
 * Slide theme tokens for parent-video stills.
 * Swap palette / type here (or via a JSON file) without touching diagram SVG paths.
 */

import { readFileSync } from "node:fs";

export type ParentVideoTheme = {
  ink: string;
  inkSoft: string;
  brand: string;
  brandDeep: string;
  brandMid: string;
  accent: string;
  accentDeep: string;
  paper0: string;
  paper1: string;
  paper2: string;
  panel: string;
  skin0: string;
  skin1: string;
  skin2: string;
  hair0: string;
  hair1: string;
  blush: string;
  displayFont: string;
  bodyFont: string;
};

const REQUIRED_THEME_KEYS: (keyof ParentVideoTheme)[] = [
  "ink",
  "inkSoft",
  "brand",
  "brandDeep",
  "brandMid",
  "accent",
  "accentDeep",
  "paper0",
  "paper1",
  "paper2",
  "panel",
  "skin0",
  "skin1",
  "skin2",
  "hair0",
  "hair1",
  "blush",
  "displayFont",
  "bodyFont",
];

/** Default Home Learning look — teal brand, warm paper, amber accent. */
export const PARENT_VIDEO_THEME: ParentVideoTheme = {
  ink: "#1d2a28",
  inkSoft: "#3d4f4b",
  brand: "#1f5f59",
  brandDeep: "#164843",
  brandMid: "#2f857c",
  accent: "#c47b2b",
  accentDeep: "#8a5a20",
  paper0: "#f8f3eb",
  paper1: "#efe5d6",
  paper2: "#e7dccb",
  panel: "rgba(255, 252, 247, 0.72)",
  skin0: "#ead2ad",
  skin1: "#d2b48c",
  skin2: "#b9956c",
  hair0: "#5a3f2a",
  hair1: "#2a1c12",
  blush: "#d9897a",
  displayFont: 'Georgia, "Iowan Old Style", serif',
  bodyFont: '"Source Sans 3", "Segoe UI", sans-serif',
};

/** CSS custom properties injected at the top of slide stylesheets. */
export function themeCssVariables(theme: ParentVideoTheme = PARENT_VIDEO_THEME): string {
  return `
    :root {
      --pv-ink: ${theme.ink};
      --pv-ink-soft: ${theme.inkSoft};
      --pv-brand: ${theme.brand};
      --pv-brand-deep: ${theme.brandDeep};
      --pv-brand-mid: ${theme.brandMid};
      --pv-accent: ${theme.accent};
      --pv-accent-deep: ${theme.accentDeep};
      --pv-paper-0: ${theme.paper0};
      --pv-paper-1: ${theme.paper1};
      --pv-paper-2: ${theme.paper2};
      --pv-panel: ${theme.panel};
      --pv-skin-0: ${theme.skin0};
      --pv-skin-1: ${theme.skin1};
      --pv-skin-2: ${theme.skin2};
      --pv-hair-0: ${theme.hair0};
      --pv-hair-1: ${theme.hair1};
      --pv-blush: ${theme.blush};
      --pv-display: ${theme.displayFont};
      --pv-body: ${theme.bodyFont};
    }
  `;
}

/** Load a full theme JSON (all keys required). Partial files are rejected. */
export function loadParentVideoTheme(filePath: string): ParentVideoTheme {
  const raw = JSON.parse(readFileSync(filePath, "utf8")) as Record<string, unknown>;
  const missing = REQUIRED_THEME_KEYS.filter((key) => typeof raw[key] !== "string" || !raw[key]);
  if (missing.length > 0) {
    throw new Error(`Theme file ${filePath} missing string keys: ${missing.join(", ")}`);
  }
  return raw as ParentVideoTheme;
}
