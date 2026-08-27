import type { LearningDecisionRecord, ProposedRevision, RevisionDecision } from "./learning-revisions";

export const LEARNING_DECISIONS_KEY = "home-learning-learning-decisions-v1";

export type SessionLearningStore = {
  decisions: LearningDecisionRecord[];
  /** Accepted revisions waiting to be applied to topic files. */
  pendingApply: ProposedRevision[];
};

export function readSessionLearningStore(): SessionLearningStore {
  if (typeof window === "undefined") return { decisions: [], pendingApply: [] };
  try {
    const raw = window.localStorage.getItem(LEARNING_DECISIONS_KEY);
    if (!raw) return { decisions: [], pendingApply: [] };
    const parsed = JSON.parse(raw) as SessionLearningStore;
    return {
      decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
      pendingApply: Array.isArray(parsed.pendingApply) ? parsed.pendingApply : [],
    };
  } catch {
    return { decisions: [], pendingApply: [] };
  }
}

export function writeSessionLearningStore(store: SessionLearningStore): void {
  window.localStorage.setItem(LEARNING_DECISIONS_KEY, JSON.stringify(store));
}

export function recordSessionDecision(
  revision: ProposedRevision,
  decision: RevisionDecision,
  note?: string,
): SessionLearningStore {
  const store = readSessionLearningStore();
  const nextDecision: LearningDecisionRecord = {
    revisionId: revision.id,
    decision,
    decidedAt: new Date().toISOString(),
    note,
  };
  const decisions = [
    ...store.decisions.filter((entry) => entry.revisionId !== revision.id),
    nextDecision,
  ];
  const pendingApply =
    decision === "accepted"
      ? [...store.pendingApply.filter((entry) => entry.id !== revision.id), revision]
      : store.pendingApply.filter((entry) => entry.id !== revision.id);

  const next = { decisions, pendingApply };
  writeSessionLearningStore(next);
  return next;
}

export function clearPendingApply(): SessionLearningStore {
  const store = readSessionLearningStore();
  const next = { ...store, pendingApply: [] };
  writeSessionLearningStore(next);
  return next;
}

export function buildDecisionsExport(
  committed: LearningDecisionRecord[],
  session: LearningDecisionRecord[],
): { version: number; decisions: LearningDecisionRecord[] } {
  const byId = new Map<string, LearningDecisionRecord>();
  for (const decision of [...committed, ...session]) {
    byId.set(decision.revisionId, decision);
  }
  return {
    version: 1,
    decisions: [...byId.values()].sort((a, b) => a.revisionId.localeCompare(b.revisionId)),
  };
}
