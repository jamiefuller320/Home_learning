"use client";

import { useCallback, useMemo, useState } from "react";
import type { MaintainerSyncPoll } from "@/hooks/useMaintainerSyncPoll";
import type { MaintainerCredentials } from "@/lib/language-notes-admin";
import {
  buildDecisionsExport,
  readSessionLearningStore,
  recordSessionDecision,
  type SessionLearningStore,
} from "@/lib/learning-decisions-store";
import {
  mergeDecisionRecords,
  remoteAcceptedRevisions,
  remoteDecisionRecords,
  upsertLearningRevisionDecision,
} from "@/lib/learning-revisions-admin";
import {
  filterPendingRevisions,
  groupRevisionsByTopic,
  readCommittedDecisions,
  scanLearningRevisions,
  type ProposedRevision,
  type RevisionDecision,
} from "@/lib/learning-revisions";

export function useLearningRevisionDecisions(
  credentials: MaintainerCredentials | null,
  sync?: MaintainerSyncPoll,
) {
  const [store, setStore] = useState<SessionLearningStore>(() => readSessionLearningStore());
  const [busyRevisionId, setBusyRevisionId] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");

  const committed = useMemo(() => readCommittedDecisions(), []);
  const allProposals = useMemo(() => scanLearningRevisions(), []);

  const remoteRows = sync?.revisionRows ?? [];
  const loading = sync?.loading ?? false;
  const lastFetchedAt = sync?.lastFetchedAt ?? null;
  const syncError = sync?.error ?? "";
  const error = localError || syncError;
  const liveMode = sync?.liveMode ?? Boolean(credentials);

  const refreshRemote = useCallback(async () => {
    if (!sync) return null;
    return sync.refresh();
  }, [sync]);

  const mergedDecisions = useMemo(
    () =>
      mergeDecisionRecords(
        committed,
        remoteDecisionRecords(remoteRows),
        store.decisions,
      ),
    [committed, remoteRows, store.decisions],
  );

  const pending = useMemo(
    () => filterPendingRevisions(allProposals, mergedDecisions),
    [allProposals, mergedDecisions],
  );

  const byTopic = useMemo(() => groupRevisionsByTopic(pending), [pending]);

  const pendingApply = useMemo(() => {
    const remoteAccepted = remoteAcceptedRevisions(remoteRows);
    const byId = new Map<string, ProposedRevision>();
    for (const revision of [...store.pendingApply, ...remoteAccepted]) {
      byId.set(revision.id, revision);
    }
    return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
  }, [remoteRows, store.pendingApply]);

  const decide = useCallback(
    async (revision: ProposedRevision, decision: RevisionDecision) => {
      setBusyRevisionId(revision.id);
      setLocalError("");
      try {
        if (credentials) {
          await upsertLearningRevisionDecision(credentials, revision, decision);
          await refreshRemote();
        }
        setStore(recordSessionDecision(revision, decision));
      } catch (decideError) {
        setLocalError(decideError instanceof Error ? decideError.message : "Could not save revision decision.");
        throw decideError;
      } finally {
        setBusyRevisionId(null);
      }
    },
    [credentials, refreshRemote],
  );

  const exportDecisions = useCallback(() => {
    return buildDecisionsExport(committed, mergedDecisions);
  }, [committed, mergedDecisions]);

  return {
    liveMode,
    loading,
    error,
    lastFetchedAt,
    busyRevisionId,
    allProposals,
    pending,
    byTopic,
    pendingApply,
    mergedDecisions,
    decide,
    refresh: refreshRemote,
    setStore,
    exportDecisions,
  };
}
