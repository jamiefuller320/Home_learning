/**
 * Route open language notes: language fixes vs feature requests needing approval.
 *
 *   npx tsx scripts/process-language-notes.ts route
 *   npx tsx scripts/process-language-notes.ts list
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL).
 * For feature routing, set GITHUB_TOKEN (Actions provides this automatically).
 */

import { GITHUB_REPO, SECTION_LABEL, type LanguageNote } from "../src/lib/language-log";
import {
  classifyLanguageNote,
  hasApprovalIssueLink,
  type LanguageNoteKind,
} from "../src/lib/language-note-routing";
import { rowToLanguageNote, type LanguageNoteRow } from "../src/lib/language-notes-api";

function readServiceEnv(): { url: string; serviceKey: string } {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.",
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

async function fetchOpenNotes(): Promise<LanguageNote[]> {
  const rows = await rest<LanguageNoteRow[]>(
    "/rest/v1/language_notes?select=*&status=eq.open&order=created_at.asc",
  );
  return rows.map(rowToLanguageNote);
}

async function annotateNote(id: string, reviewNote: string): Promise<void> {
  await rest(`/rest/v1/language_notes?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ review_note: reviewNote }),
  });
}

function buildFeatureIssueBody(note: LanguageNote): string {
  const clearer = note.clearer.trim() || "_No rewrite suggested._";
  return [
    "## Approval needed",
    "",
    "This came from a language feedback note, but it asks for **new behaviour** (UI, interaction, or product change) — not just clearer wording.",
    "",
    "**To approve:** add the `approved` label to this issue, then run the language-notes Cloud Agent (or implement manually).",
    "",
    "**To decline:** close this issue and run:",
    "",
    "```bash",
    `npx tsx scripts/language-notes.ts decline ${note.id} "<reason>"`,
    "```",
    "",
    "## Topic",
    `${note.topicTitle} (\`${note.topicId}\`)`,
    "",
    "## Section",
    SECTION_LABEL[note.section],
    "",
    "## What was unclear / requested",
    note.unclear.trim(),
    "",
    "## Suggested direction",
    clearer,
    "",
    "## Page",
    note.pagePath,
    "",
    "## Language note id",
    `\`${note.id}\``,
  ].join("\n");
}

async function createFeatureApprovalIssue(note: LanguageNote): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn("GITHUB_TOKEN not set — skipping feature approval issue creation.");
    return null;
  }

  const [owner, repo] = GITHUB_REPO.split("/");
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: `[Feature] ${note.topicTitle} — approval needed`,
      body: buildFeatureIssueBody(note),
      labels: ["feature-request", "needs-approval"],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub issue create ${response.status}: ${body.slice(0, 240)}`);
  }

  const issue = (await response.json()) as { html_url: string; number: number };
  return issue.html_url;
}

function printGrouped(notes: LanguageNote[], kind: LanguageNoteKind): void {
  const filtered = notes.filter((note) => classifyLanguageNote(note) === kind);
  if (filtered.length === 0) {
    console.log(`No open ${kind} notes.`);
    return;
  }
  console.log(`${filtered.length} open ${kind} note(s):\n`);
  for (const note of filtered) {
    console.log(`- ${note.id} · ${note.topicTitle} (${note.topicId}) · ${note.section}`);
    console.log(`  ${note.unclear}`);
    if (note.clearer) console.log(`  Suggested: ${note.clearer}`);
    if (note.reviewNote) console.log(`  Review: ${note.reviewNote}`);
    console.log("");
  }
}

async function routeNotes(): Promise<void> {
  const notes = await fetchOpenNotes();
  if (notes.length === 0) {
    console.log("No open language notes.");
    return;
  }

  const languageNotes = notes.filter((note) => classifyLanguageNote(note) === "language");
  const featureNotes = notes.filter((note) => classifyLanguageNote(note) === "feature");

  console.log(`Open notes: ${notes.length} (${languageNotes.length} language, ${featureNotes.length} feature)\n`);

  for (const note of languageNotes) {
    console.log(`[language] ${note.id} · ${note.topicTitle}`);
    console.log(`  → ready for automatic wording fix (no approval needed)\n`);
  }

  for (const note of featureNotes) {
    console.log(`[feature] ${note.id} · ${note.topicTitle}`);
    if (hasApprovalIssueLink(note.reviewNote)) {
      console.log(`  → approval issue already linked: ${note.reviewNote}\n`);
      continue;
    }

    const issueUrl = await createFeatureApprovalIssue(note);
    if (!issueUrl) {
      console.log("  → create a GitHub issue manually (needs GITHUB_TOKEN)\n");
      continue;
    }

    const reviewNote = `Approval requested: ${issueUrl}`;
    await annotateNote(note.id, reviewNote);
    console.log(`  → approval issue opened: ${issueUrl}\n`);
  }
}

function usage(): never {
  console.error("Usage: npx tsx scripts/process-language-notes.ts list|route");
  process.exit(1);
}

async function main() {
  const [command] = process.argv.slice(2);
  if (command === "list") {
    const notes = await fetchOpenNotes();
    printGrouped(notes, "language");
    printGrouped(notes, "feature");
    return;
  }
  if (command === "route") {
    await routeNotes();
    return;
  }
  usage();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
