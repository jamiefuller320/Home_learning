import type { PackReleaseEntry, PackReleaseFile } from "@/lib/pack-release";
import { buildScriptPreviewBundle } from "@/lib/pack-script-preview";
import type { Topic } from "@/content/schema";

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

function patchEntry(
  store: SessionPackReleaseStore,
  topicId: string,
  update: Partial<PackReleaseEntry>,
): SessionPackReleaseStore {
  return {
    ...store,
    entries: {
      ...store.entries,
      [topicId]: {
        ...store.entries[topicId],
        ...update,
        topicId,
      },
    },
  };
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

/** Approve lesson and auto-generate script metadata from the current pack. */
export function approveSessionLesson(topic: Topic, note: string): SessionPackReleaseStore {
  const store = readSessionPackReleaseStore();
  const now = new Date().toISOString();
  const preview = buildScriptPreviewBundle(topic);
  const next = patchEntry(store, topic.id, {
    lessonApprovedAt: now,
    lessonApprovalNote: note,
    packRecheckedAt: now,
    packRecheckNote: note,
    scriptGeneratedAt: now,
    scriptHashAtGeneration: preview.hash,
  });
  writeSessionPackReleaseStore(next);
  return next;
}

/** Regenerate script after pack edits. */
export function refreshSessionScript(topic: Topic): SessionPackReleaseStore {
  const store = readSessionPackReleaseStore();
  const now = new Date().toISOString();
  const preview = buildScriptPreviewBundle(topic);
  const next = patchEntry(store, topic.id, {
    scriptGeneratedAt: now,
    scriptHashAtGeneration: preview.hash,
    scriptApprovedAt: undefined,
    scriptApprovalNote: undefined,
    videoGeneratedAt: undefined,
    videoGeneratedHash: undefined,
    videoApprovedAt: undefined,
    videoApprovalNote: undefined,
    finalCheckedAt: undefined,
    finalCheckNote: undefined,
  });
  writeSessionPackReleaseStore(next);
  return next;
}

export function approveSessionScript(topicId: string, note: string): SessionPackReleaseStore {
  const store = readSessionPackReleaseStore();
  const now = new Date().toISOString();
  const next = patchEntry(store, topicId, {
    scriptApprovedAt: now,
    scriptApprovalNote: note,
  });
  writeSessionPackReleaseStore(next);
  return next;
}

export function markSessionVideoQueued(topicId: string, scriptHash: string): SessionPackReleaseStore {
  const store = readSessionPackReleaseStore();
  const next = patchEntry(store, topicId, {
    videoGeneratedAt: undefined,
    videoGeneratedHash: scriptHash,
  });
  writeSessionPackReleaseStore(next);
  return next;
}

export function markSessionVideoGenerated(topicId: string, scriptHash: string, note?: string): SessionPackReleaseStore {
  const store = readSessionPackReleaseStore();
  const now = new Date().toISOString();
  const next = patchEntry(store, topicId, {
    videoGeneratedAt: now,
    videoGeneratedHash: scriptHash,
    videoRecheckedAt: now,
    videoRecheckNote: note ?? "Video generated via publish pipeline",
  });
  writeSessionPackReleaseStore(next);
  return next;
}

export function approveSessionVideo(topicId: string, note: string): SessionPackReleaseStore {
  const store = readSessionPackReleaseStore();
  const now = new Date().toISOString();
  const next = patchEntry(store, topicId, {
    videoApprovedAt: now,
    videoApprovalNote: note,
    videoRecheckedAt: now,
    videoRecheckNote: note,
  });
  writeSessionPackReleaseStore(next);
  return next;
}

export function confirmSessionFinalCheck(topicId: string, note: string): SessionPackReleaseStore {
  const store = readSessionPackReleaseStore();
  const next = patchEntry(store, topicId, {
    finalCheckedAt: new Date().toISOString(),
    finalCheckNote: note,
  });
  writeSessionPackReleaseStore(next);
  return next;
}

export function markSessionReleased(topicId: string, note: string): SessionPackReleaseStore {
  const store = readSessionPackReleaseStore();
  const now = new Date().toISOString();
  const next: SessionPackReleaseStore = {
    activeCandidateId: null,
    entries: {
      ...store.entries,
      [topicId]: {
        ...store.entries[topicId],
        topicId,
        releasedAt: now,
        releaseNote: note,
        suspendedAt: undefined,
        suspendNote: undefined,
      },
    },
  };
  writeSessionPackReleaseStore(next);
  return next;
}

export function suspendSessionRelease(topicId: string, note: string): SessionPackReleaseStore {
  const store = readSessionPackReleaseStore();
  const next = patchEntry(store, topicId, {
    suspendedAt: new Date().toISOString(),
    suspendNote: note,
  });
  writeSessionPackReleaseStore(next);
  return next;
}

export function restoreSessionRelease(topicId: string, note: string): SessionPackReleaseStore {
  const store = readSessionPackReleaseStore();
  const next = patchEntry(store, topicId, {
    suspendedAt: undefined,
    suspendNote: undefined,
    restoredAt: new Date().toISOString(),
    releaseNote: note,
  });
  writeSessionPackReleaseStore(next);
  return next;
}

/** @deprecated Use approveSessionLesson instead. */
export function confirmSessionPackRecheck(topicId: string, note: string): SessionPackReleaseStore {
  const store = readSessionPackReleaseStore();
  const next = patchEntry(store, topicId, {
    packRecheckedAt: new Date().toISOString(),
    packRecheckNote: note,
  });
  writeSessionPackReleaseStore(next);
  return next;
}

/** @deprecated Use approveSessionVideo instead. */
export function confirmSessionVideoRecheck(topicId: string, note: string): SessionPackReleaseStore {
  const store = readSessionPackReleaseStore();
  const next = patchEntry(store, topicId, {
    videoRecheckedAt: new Date().toISOString(),
    videoRecheckNote: note,
  });
  writeSessionPackReleaseStore(next);
  return next;
}

export function clearSessionCandidate(): SessionPackReleaseStore {
  const store = readSessionPackReleaseStore();
  const next = { ...store, activeCandidateId: null };
  writeSessionPackReleaseStore(next);
  return next;
}
