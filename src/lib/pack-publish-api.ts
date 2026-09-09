import { readPublicSupabaseEnv } from "@/lib/language-notes-api";
import type { LessonPublicationRow } from "@/lib/pack-publish-sync";
import type { PublicationStatus } from "@/lib/publication";

export type LivePublicationMap = Record<string, PublicationStatus>;

export function publicationFromRow(row: Pick<LessonPublicationRow, "released_at" | "suspended_at">): PublicationStatus {
  if (row.suspended_at) return "suspended";
  if (row.released_at) return "live";
  return "draft";
}

export function rowsToPublicationMap(rows: LessonPublicationRow[]): LivePublicationMap {
  const map: LivePublicationMap = {};
  for (const row of rows) {
    map[row.topic_id] = publicationFromRow(row);
  }
  return map;
}

export async function fetchLivePublicationMap(): Promise<{
  ok: boolean;
  map: LivePublicationMap;
  updatedAt?: string;
  reason?: "missing-env" | "http";
}> {
  const env = readPublicSupabaseEnv();
  if (!env) return { ok: false, map: {}, reason: "missing-env" };

  const response = await fetch(
    `${env.url}/rest/v1/lesson_publication?select=topic_id,released_at,suspended_at,updated_at&order=topic_id.asc`,
    {
      headers: {
        apikey: env.anonKey,
        Authorization: `Bearer ${env.anonKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) return { ok: false, map: {}, reason: "http" };

  const rows = (await response.json()) as LessonPublicationRow[];
  const map = rowsToPublicationMap(rows);
  const updatedAt = rows.reduce<string | undefined>((latest, row) => {
    if (!latest || row.updated_at > latest) return row.updated_at;
    return latest;
  }, undefined);

  return { ok: true, map, updatedAt };
}
