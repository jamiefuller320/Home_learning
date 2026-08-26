import type { LanguageNote } from "./language-log";

export type LanguageNoteKind = "language" | "feature";

const FEATURE_PATTERNS: RegExp[] = [
  /\b(include|add)\s+(a\s+)?(way|button|toggle|feature|option)\b/i,
  /\bwould like to (be able|check)\b/i,
  /\bcheck my answers?\b/i,
  /\bshow the answers?\b/i,
  /\bnew (ui|feature|functionality|component|screen)\b/i,
  /\bcould you include\b/i,
];

export function classifyLanguageNote(note: Pick<LanguageNote, "unclear" | "clearer">): LanguageNoteKind {
  const text = `${note.unclear} ${note.clearer}`.trim();
  return FEATURE_PATTERNS.some((pattern) => pattern.test(text)) ? "feature" : "language";
}

export function hasApprovalIssueLink(reviewNote: string | undefined): boolean {
  return /github\.com\/[^/]+\/[^/]+\/issues\/\d+/i.test(reviewNote || "");
}
