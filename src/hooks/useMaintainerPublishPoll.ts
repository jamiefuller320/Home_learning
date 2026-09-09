"use client";

import { useCallback, useEffect, useState } from "react";
import type { MaintainerCredentials } from "@/lib/language-notes-admin";
import { fetchPackPublishFile } from "@/lib/pack-publish-admin";
import { mergePackReleaseFile, readPackReleaseFile, type PackReleaseFile } from "@/lib/pack-release";

export const DEFAULT_MAINTAINER_PUBLISH_POLL_MS = 20_000;

export function useMaintainerPublishPoll(
  credentials: MaintainerCredentials | null,
  intervalMs = DEFAULT_MAINTAINER_PUBLISH_POLL_MS,
) {
  const [remoteFile, setRemoteFile] = useState<PackReleaseFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!credentials) {
      setRemoteFile(null);
      setError("");
      return null;
    }
    setLoading(true);
    setError("");
    try {
      const file = await fetchPackPublishFile(credentials);
      setRemoteFile(file);
      setLastFetchedAt(new Date().toISOString());
      return file;
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Could not load publishing state.");
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

  const mergedFile = remoteFile
    ? mergePackReleaseFile(readPackReleaseFile(), {
        activeCandidateId: remoteFile.activeCandidateId,
        entries: remoteFile.entries,
      })
    : mergePackReleaseFile(readPackReleaseFile(), { entries: {} });

  return { remoteFile, mergedFile, loading, error, lastFetchedAt, refresh };
}
