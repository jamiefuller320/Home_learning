"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MaintainerCredentials } from "@/lib/language-notes-admin";
import {
  buildDecisionsExport,
  readSessionLearningStore,
  recordSessionDecision,
  type SessionLearningStore,
} from "@/lib/learning-decisions-store";
import {
  fetchLearningRevisionDecisions,
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

export const DEFAULT_LEARNING_REVISION_POLL_MS = 20_000;

export function useLearningRevisionDecisions(credentials: MaintainerCredentials | null) {
  const [store, setStore] = useState<SessionLearningStore>(() => readSessionLearningStore());
  const [remoteRows, setRemoteRows] = useState<Awaited<ReturnType<typeof fetchLearningRevisionDecisions>>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [busyRevisionId, setBusyRevisionId] = useState<string | null>(null);

  const committed = useMemo(() => readCommittedDecisions(), []);
  const allProposals = useMemo(() => scanLearningRevisions(), []);

  const refresh = useCallback(async () => {
    if (!credentials) {
      setRemoteRows([]);
      setError("");
      return null;
    }
    setLoading(true);
    setError("");
    try {
      const rows = await fetchLearningRevisionDecisions(credentials);
      setRemoteRows(rows);
      setLastFetchedAt(new Date().toISOString());
      return rows;
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Could not load learning revision decisions.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [credentials]);

  useEffect(() => {
    if (!credentials) return;
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, DEFAULT_LEARNING_REVISION_POLL_MS);
    return () => window.clearInterval(timer);
  }, [credentials, refresh]);

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

  const liveMode = Boolean(credentials);

  const decide = useCallback(
    async (revision: ProposedRevision, decision: RevisionDecision) => {
      setBusyRevisionId(revision.id);
      setError("");
      try {
        if (credentials) {
          await upsertLearningRevisionDecision(credentials, revision, decision);
          await refresh();
        }
        setStore(recordSessionDecision(revision, decision));
      } catch (decideError) {
        setError(decideError instanceof Error ? decideError.message : "Could not save revision decision.");
        throw decideError;
      } finally {
        setBusyRevisionId(null);
      }
    },
    [credentials, refresh],
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
    refresh,
    setStore,
    exportDecisions,
  };
}
