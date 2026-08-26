import { rowToLanguageNote, type LanguageNoteRow } from "./language-notes-api";
import type { LanguageNote, LanguageNoteStatus } from "./language-log";

export type MaintainerCredentials = {
  url: string;
  serviceKey: string;
};

const CREDENTIALS_KEY = "home-learning-maintainer-creds-v1";

export function readDefaultSupabaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
}

export function readStoredCredentials(): MaintainerCredentials | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CREDENTIALS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MaintainerCredentials;
    if (!parsed.url || !parsed.serviceKey) return null;
    return { url: parsed.url.replace(/\/$/, ""), serviceKey: parsed.serviceKey };
  } catch {
    return null;
  }
}

export function storeCredentials(credentials: MaintainerCredentials): void {
  window.sessionStorage.setItem(
    CREDENTIALS_KEY,
    JSON.stringify({
      url: credentials.url.replace(/\/$/, ""),
      serviceKey: credentials.serviceKey,
    }),
  );
}

export function clearCredentials(): void {
  window.sessionStorage.removeItem(CREDENTIALS_KEY);
}

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

export async function verifyMaintainerCredentials(credentials: MaintainerCredentials): Promise<void> {
  await maintainerRest<LanguageNoteRow[]>(
    credentials,
    "/rest/v1/language_notes?select=id&limit=1",
  );
}

export async function fetchAllLanguageNotes(credentials: MaintainerCredentials): Promise<LanguageNote[]> {
  const rows = await maintainerRest<LanguageNoteRow[]>(
    credentials,
    "/rest/v1/language_notes?select=*&order=created_at.desc",
  );
  return rows.map(rowToLanguageNote);
}

export async function updateLanguageNoteRemote(
  credentials: MaintainerCredentials,
  id: string,
  update: { status?: LanguageNoteStatus; review_note?: string },
): Promise<LanguageNote> {
  const rows = await maintainerRest<LanguageNoteRow[]>(
    credentials,
    `/rest/v1/language_notes?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(update),
    },
  );
  const row = rows[0];
  if (!row) throw new Error("Note not found after update.");
  return rowToLanguageNote(row);
}
