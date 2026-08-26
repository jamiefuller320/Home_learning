import { classifyLanguageNote } from "./language-note-routing";
import type { LanguageNote } from "./language-log";

export type TopicAlertLevel = "none" | "watch" | "review";

export type TopicFeedbackSummary = {
  topicId: string;
  topicTitle: string;
  total: number;
  open: number;
  done: number;
  declined: number;
  language: number;
  feature: number;
  lastNoteAt: string;
  notes: LanguageNote[];
  alertLevel: TopicAlertLevel;
  alertReason: string;
};

export type TopicFeedbackThresholds = {
  reviewMinTotal: number;
  reviewMinOpen: number;
  watchMinTotal: number;
};

export const DEFAULT_TOPIC_FEEDBACK_THRESHOLDS: TopicFeedbackThresholds = {
  reviewMinTotal: 3,
  reviewMinOpen: 2,
  watchMinTotal: 2,
};

function topicAlert(
  summary: Omit<TopicFeedbackSummary, "alertLevel" | "alertReason">,
  thresholds: TopicFeedbackThresholds,
): { alertLevel: TopicAlertLevel; alertReason: string } {
  if (summary.open >= thresholds.reviewMinOpen) {
    return {
      alertLevel: "review",
      alertReason: `${summary.open} open notes on this lesson — may need a structural rewrite, not line edits.`,
    };
  }
  if (summary.total >= thresholds.reviewMinTotal) {
    return {
      alertLevel: "review",
      alertReason: `${summary.total} notes on this lesson — repeated friction may mean the briefing or pack is missing a picture.`,
    };
  }
  if (summary.total >= thresholds.watchMinTotal) {
    return {
      alertLevel: "watch",
      alertReason: `${summary.total} notes so far — worth watching if more arrive.`,
    };
  }
  return { alertLevel: "none", alertReason: "" };
}

export function summarizeTopicFeedback(
  notes: LanguageNote[],
  thresholds: TopicFeedbackThresholds = DEFAULT_TOPIC_FEEDBACK_THRESHOLDS,
): TopicFeedbackSummary[] {
  const byTopic = new Map<string, LanguageNote[]>();

  for (const note of notes) {
    const existing = byTopic.get(note.topicId) ?? [];
    existing.push(note);
    byTopic.set(note.topicId, existing);
  }

  const summaries: TopicFeedbackSummary[] = [];

  for (const [topicId, topicNotes] of byTopic) {
    const sorted = [...topicNotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const base = {
      topicId,
      topicTitle: sorted[0]?.topicTitle ?? topicId,
      total: sorted.length,
      open: sorted.filter((note) => note.status === "open").length,
      done: sorted.filter((note) => note.status === "done").length,
      declined: sorted.filter((note) => note.status === "declined").length,
      language: sorted.filter((note) => classifyLanguageNote(note) === "language").length,
      feature: sorted.filter((note) => classifyLanguageNote(note) === "feature").length,
      lastNoteAt: sorted[0]?.createdAt ?? "",
      notes: sorted,
    };
    const alert = topicAlert(base, thresholds);
    summaries.push({ ...base, ...alert });
  }

  return summaries.sort((a, b) => {
    const levelScore = { review: 2, watch: 1, none: 0 };
    const levelDiff = levelScore[b.alertLevel] - levelScore[a.alertLevel];
    if (levelDiff !== 0) return levelDiff;
    if (b.open !== a.open) return b.open - a.open;
    if (b.total !== a.total) return b.total - a.total;
    return b.lastNoteAt.localeCompare(a.lastNoteAt);
  });
}

export function extractApprovalIssueUrl(reviewNote: string | undefined): string | null {
  const match = (reviewNote || "").match(/https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/issues\/\d+/i);
  return match?.[0] ?? null;
}
