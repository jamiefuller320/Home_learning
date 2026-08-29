/**
 * Delivery intent for each spoken beat.
 *
 * Fal Kokoro has no SSML — we cannot mark word-level stress.
 * We encode intent on the beat, then approximate with punctuation + clip speed.
 */
export const PROSODY_ROLES = [
  "title",
  "section",
  "key",
  "teach",
  "example",
  "aside",
  "handoff",
] as const;

export type ProsodyRole = (typeof PROSODY_ROLES)[number];

/** Short labels for the script viewer legend. */
export const PROSODY_LABEL: Record<ProsodyRole, string> = {
  title: "Title",
  section: "Section cue",
  key: "Key line",
  teach: "Teaching",
  example: "Example sum",
  aside: "Aside",
  handoff: "Page handoff",
};

/** Speed multipliers relative to PARENT_VIDEO_TTS.speed. */
export const PROSODY_SPEED: Record<ProsodyRole, number> = {
  title: 0.94,
  section: 0.97,
  key: 0.95,
  teach: 1,
  example: 0.92,
  aside: 1.04,
  handoff: 1.02,
};

/**
 * Shape punctuation so Kokoro lifts section cues and key lines.
 * Does not invent method words — only delivery marks.
 */
export function shapeProsody(text: string, role: ProsodyRole): string {
  let spoken = text.replace(/\s+/g, " ").trim();
  if (!spoken) return spoken;

  switch (role) {
    case "title":
      // Clear announcement reset; avoid trailing excitement on topic names.
      spoken = spoken.replace(/[!?…]+$/u, "").replace(/[.]+$/u, "");
      return `${spoken}.`;
    case "section":
      // Section cues: short, complete, slight energy if already imperative/excited.
      if (/[.!?…]$/u.test(spoken)) return spoken;
      return `${spoken}.`;
    case "key":
      // Key criteria / punchlines: keep ?/! lift; otherwise a firm full stop.
      if (/[?!]$/u.test(spoken)) return spoken;
      spoken = spoken.replace(/[.…]+$/u, "");
      return `${spoken}.`;
    case "example":
      // Example sums: deliberate end-stop so digits do not rush into the next thought.
      spoken = spoken.replace(/[,;:]+$/u, "");
      if (/[.!?…]$/u.test(spoken)) return spoken;
      return `${spoken}.`;
    case "aside":
      // Soft caveats trail off; keep energy on !/? and don’t dissolve long instructions.
      if (/\?$/u.test(spoken) || /!$/u.test(spoken)) return spoken;
      if (spoken.split(/\s+/).length <= 8) {
        spoken = spoken.replace(/[.…]+$/u, "");
        return `${spoken}…`;
      }
      if (/[.!…]$/u.test(spoken)) return spoken;
      return `${spoken}.`;
    case "handoff":
      // Page / YouTube pointers: clear instruction stop, questions keep rise.
      if (/\?$/u.test(spoken)) return spoken;
      if (/[.!…]$/u.test(spoken)) return spoken;
      return `${spoken}.`;
    case "teach":
    default:
      return spoken;
  }
}

export function ttsSpeedForRole(baseSpeed: number, role: ProsodyRole | undefined): number {
  const factor = role ? PROSODY_SPEED[role] : 1;
  const speed = baseSpeed * factor;
  // Keep within Kokoro’s comfortable band.
  return Math.min(1.2, Math.max(0.85, Number(speed.toFixed(3))));
}
