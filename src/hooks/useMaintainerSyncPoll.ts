"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MaintainerCredentials } from "@/lib/language-notes-admin";
import { fetchLearningRevisionDecisions } from "@/lib/learning-revisions-admin";
import type { LearningRevisionDecisionRow } from "@/lib/learning-revisions-sync";
import { fetchPackPublishFile } from "@/lib/pack-publish-admin";
import { mergePackReleaseFile, readPackReleaseFile, type PackReleaseFile } from "@/lib/pack-release";

export const DEFAULT_MAINTAINER_SYNC_POLL_MS = 20_000;

export type MaintainerSyncPoll = {
  liveMode: boolean;
  loading: boolean;
  error: string;
  lastFetchedAt: string | null;
  remoteFile: PackReleaseFile | null;
  mergedFile: PackReleaseFile;
  revisionRows: LearningRevisionDecisionRow[];
  refresh: () => Promise<{ file: PackReleaseFile; rows: LearningRevisionDecisionRow[] } | null>;
};

export function useMaintainerSyncPoll(
  credentials: MaintainerCredentials | null,
  intervalMs = DEFAULT_MAINTAINER_SYNC_POLL_MS,
): MaintainerSyncPoll {
  const [remoteFile, setRemoteFile] = useState<PackReleaseFile | null>(null);
  const [revisionRows, setRevisionRows] = useState<LearningRevisionDecisionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!credentials) {
      setRemoteFile(null);
      setRevisionRows([]);
      setError("");
      return null;
    }

    setLoading(true);
    setError("");
    try {
      const [file, rows] = await Promise.all([
        fetchPackPublishFile(credentials),
        fetchLearningRevisionDecisions(credentials),
      ]);
      setRemoteFile(file);
      setRevisionRows(rows);
      setLastFetchedAt(new Date().toISOString());
      return { file, rows };
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Could not load maintainer state from Supabase.");
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
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [credentials, intervalMs, refresh]);

  const mergedFile = useMemo(
    () =>
      remoteFile
        ? mergePackReleaseFile(readPackReleaseFile(), {
            activeCandidateId: remoteFile.activeCandidateId,
            entries: remoteFile.entries,
          })
        : mergePackReleaseFile(readPackReleaseFile(), { entries: {} }),
    [remoteFile],
  );

  return {
    liveMode: Boolean(credentials),
    loading,
    error,
    lastFetchedAt,
    remoteFile,
    mergedFile,
    revisionRows,
    refresh,
  };
}
