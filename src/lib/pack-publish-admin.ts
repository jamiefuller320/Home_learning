import type { MaintainerCredentials } from "@/lib/language-notes-admin";
import type { PackReleaseEntry, PackReleaseFile } from "@/lib/pack-release";
import {
  entryToPackPublishPatch,
  rowsToPackReleaseFile,
  type PackPublishMetaRow,
  type PackPublishStateRow,
} from "@/lib/pack-publish-sync";

async function maintainerRest<T>(
  credentials: MaintainerCredentials,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("apikey", credentials.serviceKey);
  headers.set("Authorization", `Bearer ${credentials.serviceKey}`);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${credentials.url}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase ${response.status}: ${body.slice(0, 240)}`);
  }
  if (response.status === 204) return [] as T;
  return (await response.json()) as T;
}

export async function verifyPublishTables(credentials: MaintainerCredentials): Promise<void> {
  await maintainerRest<PackPublishMetaRow[]>(
    credentials,
    "/rest/v1/pack_publish_meta?select=id&limit=1",
  );
}

export async function fetchPackPublishFile(credentials: MaintainerCredentials): Promise<PackReleaseFile> {
  const [metaRows, stateRows] = await Promise.all([
    maintainerRest<PackPublishMetaRow[]>(credentials, "/rest/v1/pack_publish_meta?select=*&id=eq.1"),
    maintainerRest<PackPublishStateRow[]>(
      credentials,
      "/rest/v1/pack_publish_state?select=*&order=topic_id.asc",
    ),
  ]);
  return rowsToPackReleaseFile(metaRows[0] ?? null, stateRows);
}

export async function setRemoteActiveCandidate(
  credentials: MaintainerCredentials,
  topicId: string | null,
): Promise<PackReleaseFile> {
  const now = new Date().toISOString();
  await maintainerRest<PackPublishMetaRow[]>(credentials, "/rest/v1/pack_publish_meta?id=eq.1", {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      active_candidate_id: topicId,
      updated_at: now,
    }),
  });

  if (topicId) {
    await upsertRemotePublishEntry(credentials, topicId, {
      topicId,
      candidateSince: now,
    });
  }

  return fetchPackPublishFile(credentials);
}

export async function upsertRemotePublishEntry(
  credentials: MaintainerCredentials,
  topicId: string,
  update: Partial<PackReleaseEntry>,
): Promise<PackReleaseFile> {
  const row = entryToPackPublishPatch(topicId, update);
  await maintainerRest<PackPublishStateRow[]>(credentials, "/rest/v1/pack_publish_state", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(row),
  });
  return fetchPackPublishFile(credentials);
}

export async function mergeRemotePublishFile(
  credentials: MaintainerCredentials,
  file: PackReleaseFile,
): Promise<PackReleaseFile> {
  await maintainerRest<PackPublishMetaRow[]>(credentials, "/rest/v1/pack_publish_meta?id=eq.1", {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      active_candidate_id: file.activeCandidateId,
      updated_at: new Date().toISOString(),
    }),
  });

  for (const entry of Object.values(file.entries)) {
    await upsertRemotePublishEntry(credentials, entry.topicId, entry);
  }

  return fetchPackPublishFile(credentials);
}
