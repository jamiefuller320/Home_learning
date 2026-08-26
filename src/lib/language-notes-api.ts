import {
  LANGUAGE_SECTIONS,
  type LanguageNote,
  type LanguageNoteStatus,
  type LanguageSection,
} from "./language-log";

export type LanguageNoteRow = {
  id: string;
  created_at: string;
  topic_id: string;
  topic_title: string;
  section: string;
  unclear: string;
  clearer: string;
  page_path: string;
  status: string;
};

export function readPublicSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function noteToInsertRow(
  note: Pick<LanguageNote, "topicId" | "topicTitle" | "section" | "unclear" | "clearer" | "pagePath" | "status">,
): Omit<LanguageNoteRow, "id" | "created_at"> {
  return {
    topic_id: note.topicId,
    topic_title: note.topicTitle,
    section: note.section,
    unclear: note.unclear.trim(),
    clearer: note.clearer.trim(),
    page_path: note.pagePath,
    status: note.status,
  };
}

export function rowToLanguageNote(row: LanguageNoteRow): LanguageNote {
  const section = LANGUAGE_SECTIONS.includes(row.section as LanguageSection)
    ? (row.section as LanguageSection)
    : "parent";
  const status: LanguageNoteStatus =
    row.status === "done" ? "done" : row.status === "declined" ? "declined" : "open";
  return {
    id: row.id,
    createdAt: row.created_at,
    topicId: row.topic_id,
    topicTitle: row.topic_title,
    section,
    unclear: row.unclear,
    clearer: row.clearer,
    pagePath: row.page_path,
    status,
  };
}

export async function submitLanguageNoteToSupabase(
  note: Pick<LanguageNote, "topicId" | "topicTitle" | "section" | "unclear" | "clearer" | "pagePath" | "status">,
): Promise<{ ok: boolean; reason: "missing-env" | "http" | "ok" }> {
  const env = readPublicSupabaseEnv();
  if (!env) return { ok: false, reason: "missing-env" };

  const response = await fetch(`${env.url}/rest/v1/language_notes`, {
    method: "POST",
    headers: {
      apikey: env.anonKey,
      Authorization: `Bearer ${env.anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(noteToInsertRow(note)),
  });

  return response.ok ? { ok: true, reason: "ok" } : { ok: false, reason: "http" };
}
