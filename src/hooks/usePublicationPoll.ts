"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchLivePublicationMap, type LivePublicationMap } from "@/lib/pack-publish-api";
import { readPackReleaseFile } from "@/lib/pack-release";
import type { Topic } from "@/content/schema";
import { resolvePublicationStatus, type PublicationStatus } from "@/lib/publication";

export const DEFAULT_PUBLICATION_POLL_MS = 30_000;

function staticPublicationMap(topics: Topic[]): LivePublicationMap {
  const releaseFile = readPackReleaseFile();
  const map: LivePublicationMap = {};
  for (const topic of topics) {
    map[topic.id] = resolvePublicationStatus(releaseFile.entries[topic.id], topic.reviewStatus);
  }
  return map;
}

export function usePublicationPoll(topics: Topic[], intervalMs = DEFAULT_PUBLICATION_POLL_MS) {
  const [map, setMap] = useState<LivePublicationMap>(() => staticPublicationMap(topics));
  const [source, setSource] = useState<"static" | "supabase">("static");
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const refresh = useCallback(async () => {
    setPolling(true);
    try {
      const result = await fetchLivePublicationMap();
      if (result.ok) {
        setMap(() => {
          const next = { ...staticPublicationMap(topics) };
          for (const [topicId, status] of Object.entries(result.map)) {
            next[topicId] = status;
          }
          return next;
        });
        setSource("supabase");
        setLastFetchedAt(result.updatedAt ?? new Date().toISOString());
        return;
      }
      setMap(staticPublicationMap(topics));
      setSource("static");
    } finally {
      setPolling(false);
    }
  }, [topics]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [refresh, intervalMs]);

  function statusFor(topicId: string, reviewStatus: Topic["reviewStatus"]): PublicationStatus {
    return map[topicId] ?? resolvePublicationStatus(readPackReleaseFile().entries[topicId], reviewStatus);
  }

  return { map, source, lastFetchedAt, polling, refresh, statusFor };
}
