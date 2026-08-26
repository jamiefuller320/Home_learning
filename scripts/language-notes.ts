/**
 * Maintainer access to language_notes.
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY plus NEXT_PUBLIC_SUPABASE_URL
 * (or SUPABASE_URL). The service role is never shipped to the site.
 *
 *   npx tsx scripts/language-notes.ts list
 *   npx tsx scripts/language-notes.ts list all
 *   npx tsx scripts/language-notes.ts done <id>
 *   npx tsx scripts/language-notes.ts decline <id>
 */

import { rowToLanguageNote, type LanguageNoteRow } from "../src/lib/language-notes-api";

function readServiceEnv(): { url: string; serviceKey: string } {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY. Use the service_role key, not the anon key.",
    );
  }
  return { url, serviceKey };
}

async function rest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const env = readServiceEnv();
  const headers = new Headers(init.headers);
  headers.set("apikey", env.serviceKey);
  headers.set("Authorization", `Bearer ${env.serviceKey}`);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${env.url}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase ${response.status}: ${body.slice(0, 240)}`);
  }
  if (response.status === 204) return [] as T;
  return (await response.json()) as T;
}

function printNotes(notes: ReturnType<typeof rowToLanguageNote>[], label: string) {
  if (notes.length === 0) {
    console.log(`No ${label} language notes.`);
    return;
  }
  console.log(`${notes.length} ${label} note(s):\n`);
  for (const note of notes) {
    console.log(`- ${note.id} [${note.status}]`);
    console.log(`  ${note.topicTitle} (${note.topicId}) · ${note.section}`);
    console.log(`  Unclear: ${note.unclear}`);
    if (note.clearer) console.log(`  Clearer: ${note.clearer}`);
    console.log(`  Page: ${note.pagePath}`);
    console.log("");
  }
}

async function listNotes(all: boolean): Promise<void> {
  const query = all
    ? "/rest/v1/language_notes?select=*&order=created_at.asc"
    : "/rest/v1/language_notes?select=*&status=eq.open&order=created_at.asc";
  const rows = await rest<LanguageNoteRow[]>(query);
  printNotes(rows.map(rowToLanguageNote), all ? "recorded" : "open");
}

async function setStatus(id: string, status: "done" | "declined"): Promise<void> {
  await rest<LanguageNoteRow[]>(`/rest/v1/language_notes?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ status }),
  });
  console.log(`Marked ${id} ${status}.`);
}

async function main() {
  const [command, arg] = process.argv.slice(2);
  if (command === "list") {
    await listNotes(arg === "all");
    return;
  }
  if (command === "done" && arg) {
    await setStatus(arg, "done");
    return;
  }
  if (command === "decline" && arg) {
    await setStatus(arg, "declined");
    return;
  }
  console.error("Usage: npx tsx scripts/language-notes.ts list [all]|done <id>|decline <id>");
  process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
