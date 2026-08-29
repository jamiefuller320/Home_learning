export const LANGUAGE_LOG_KEY = "home-learning-language-log-v1";
export const GITHUB_REPO = "jamiefuller320/Home_learning";

export const LANGUAGE_SECTIONS = ["parent", "home", "parent-video"] as const;
export type LanguageSection = (typeof LANGUAGE_SECTIONS)[number];
export const LANGUAGE_NOTE_STATUSES = ["open", "done", "declined"] as const;
export type LanguageNoteStatus = (typeof LANGUAGE_NOTE_STATUSES)[number];

export type LanguageNote = {
  id: string;
  createdAt: string;
  topicId: string;
  topicTitle: string;
  section: LanguageSection;
  unclear: string;
  clearer: string;
  pagePath: string;
  status: LanguageNoteStatus;
  /** Maintainer note: what changed, or why the suggestion was skipped. */
  reviewNote?: string;
};

export const SECTION_LABEL: Record<LanguageSection, string> = {
  parent: "Stage 1 · Parent briefing",
  home: "Stage 2 · Home pack",
  "parent-video": "Parent video script",
};

export function createNoteId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function readLanguageLog(): LanguageNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LANGUAGE_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LanguageNote[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLanguageLog(notes: LanguageNote[]) {
  window.localStorage.setItem(LANGUAGE_LOG_KEY, JSON.stringify(notes));
}

export function addLanguageNote(note: LanguageNote): LanguageNote[] {
  const next = [note, ...readLanguageLog()];
  writeLanguageLog(next);
  return next;
}

export function updateLanguageNote(id: string, update: Partial<LanguageNote>): LanguageNote[] {
  const next = readLanguageLog().map((note) => (note.id === id ? { ...note, ...update } : note));
  writeLanguageLog(next);
  return next;
}

export function buildIssueTitle(note: Pick<LanguageNote, "topicTitle" | "section">): string {
  return `[Language] ${note.topicTitle} — ${SECTION_LABEL[note.section]}`;
}

export function buildIssueBody(note: Pick<LanguageNote, "topicId" | "topicTitle" | "section" | "unclear" | "clearer" | "pagePath">): string {
  const clearer = note.clearer.trim() || "_No rewrite suggested yet._";
  return [
    "## Topic",
    `${note.topicTitle} (\`${note.topicId}\`)`,
    "",
    "## Section",
    SECTION_LABEL[note.section],
    "",
    "## What was unclear",
    note.unclear.trim(),
    "",
    "## A clearer way to say it",
    clearer,
    "",
    "## Page",
    note.pagePath,
    "",
    "Use this to rewrite the topic file, then close the issue when the wording is on `main`.",
  ].join("\n");
}

export function buildGitHubIssueUrl(note: Pick<LanguageNote, "topicId" | "topicTitle" | "section" | "unclear" | "clearer" | "pagePath">): string {
  const params = new URLSearchParams({
    title: buildIssueTitle(note),
    body: buildIssueBody(note),
    labels: "language",
  });
  return `https://github.com/${GITHUB_REPO}/issues/new?${params.toString()}`;
}

export const FEEDBACK_EMAIL = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL || "jamiefuller@live.co.uk";
export const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${FEEDBACK_EMAIL}`;

export function formatNoteForSharing(
  note: Pick<LanguageNote, "topicId" | "topicTitle" | "section" | "unclear" | "clearer" | "pagePath">,
): string {
  const clearer = note.clearer.trim();
  return [
    `Language note: ${note.topicTitle}`,
    SECTION_LABEL[note.section],
    "",
    `What was unclear: ${note.unclear.trim()}`,
    clearer ? `Clearer way to say it: ${clearer}` : "Clearer way to say it: (none suggested)",
    "",
    `Page: ${note.pagePath}`,
  ].join("\n");
}

export function buildMailtoUrl(
  note: Pick<LanguageNote, "topicId" | "topicTitle" | "section" | "unclear" | "clearer" | "pagePath">,
): string {
  const params = new URLSearchParams({
    subject: buildIssueTitle(note),
    body: formatNoteForSharing(note),
  });
  return `mailto:${FEEDBACK_EMAIL}?${params.toString()}`;
}
