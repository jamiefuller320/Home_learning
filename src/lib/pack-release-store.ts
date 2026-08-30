import type { PackReleaseEntry, PackReleaseFile } from "@/lib/pack-release";

export const PACK_RELEASE_KEY = "home-learning-pack-release-v1";

export type SessionPackReleaseStore = {
  activeCandidateId: string | null;
  entries: Record<string, PackReleaseEntry>;
};

export function readSessionPackReleaseStore(): SessionPackReleaseStore {
  if (typeof window === "undefined") {
    return { activeCandidateId: null, entries: {} };
  }
  try {
    const raw = window.localStorage.getItem(PACK_RELEASE_KEY);
    if (!raw) return { activeCandidateId: null, entries: {} };
    const parsed = JSON.parse(raw) as SessionPackReleaseStore;
    return {
      activeCandidateId: parsed.activeCandidateId ?? null,
      entries: parsed.entries ?? {},
    };
  } catch {
    return { activeCandidateId: null, entries: {} };
  }
}

export function writeSessionPackReleaseStore(store: SessionPackReleaseStore): void {
  window.localStorage.setItem(PACK_RELEASE_KEY, JSON.stringify(store));
}

export function mergePackReleaseStores(
  committed: PackReleaseFile,
  session: SessionPackReleaseStore,
): PackReleaseFile {
  const entries = { ...committed.entries };
  for (const [topicId, entry] of Object.entries(session.entries)) {
    entries[topicId] = { ...entries[topicId], ...entry, topicId };
  }
  return {
    version: 1,
    activeCandidateId: session.activeCandidateId ?? committed.activeCandidateId,
    entries,
  };
}

export function buildPackReleaseExport(
  committed: PackReleaseFile,
  session: SessionPackReleaseStore,
): PackReleaseFile {
  return mergePackReleaseStores(committed, session);
}

export function setSessionCandidate(topicId: string): SessionPackReleaseStore {
  const store = readSessionPackReleaseStore();
  const now = new Date().toISOString();
  const next: SessionPackReleaseStore = {
    activeCandidateId: topicId,
    entries: {
      ...store.entries,
      [topicId]: {
        ...store.entries[topicId],
        topicId,
        candidateSince: store.entries[topicId]?.candidateSince ?? now,
      },
    },
  };
  writeSessionPackReleaseStore(next);
  return next;
}

export function confirmSessionPackRecheck(topicId: string, note: string): SessionPackReleaseStore {
  const store = readSessionPackReleaseStore();
  const next: SessionPackReleaseStore = {
    ...store,
    entries: {
      ...store.entries,
      [topicId]: {
        ...store.entries[topicId],
        topicId,
        packRecheckedAt: new Date().toISOString(),
        packRecheckNote: note,
      },
    },
  };
  writeSessionPackReleaseStore(next);
  return next;
}

export function confirmSessionVideoRecheck(topicId: string, note: string): SessionPackReleaseStore {
  const store = readSessionPackReleaseStore();
  const next: SessionPackReleaseStore = {
    ...store,
    entries: {
      ...store.entries,
      [topicId]: {
        ...store.entries[topicId],
        topicId,
        videoRecheckedAt: new Date().toISOString(),
        videoRecheckNote: note,
      },
    },
  };
  writeSessionPackReleaseStore(next);
  return next;
}

export function clearSessionCandidate(): SessionPackReleaseStore {
  const store = readSessionPackReleaseStore();
  const next = { ...store, activeCandidateId: null };
  writeSessionPackReleaseStore(next);
  return next;
}
