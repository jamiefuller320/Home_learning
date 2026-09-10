"use client";

import {
  DEFAULT_MAINTAINER_SYNC_POLL_MS,
  useMaintainerSyncPoll,
} from "@/hooks/useMaintainerSyncPoll";
import type { MaintainerCredentials } from "@/lib/language-notes-admin";

/** @deprecated Prefer useMaintainerSyncPoll when revision decisions are also needed. */
export function useMaintainerPublishPoll(
  credentials: MaintainerCredentials | null,
  intervalMs = DEFAULT_MAINTAINER_SYNC_POLL_MS,
) {
  const sync = useMaintainerSyncPoll(credentials, intervalMs);
  return {
    remoteFile: sync.remoteFile,
    mergedFile: sync.mergedFile,
    loading: sync.loading,
    error: sync.error,
    lastFetchedAt: sync.lastFetchedAt,
    refresh: async () => {
      const result = await sync.refresh();
      return result?.file ?? null;
    },
  };
}
