import type { MaintainerCredentials } from "@/lib/language-notes-admin";
import type { ProposedRevision, RevisionDecision } from "@/lib/learning-revisions";
import {
  acceptedSnapshotsFromRows,
  mergeDecisionRecords,
  revisionToDecisionRow,
  rowToDecisionRecord,
  rowsToDecisionRecords,
  type LearningRevisionDecisionRow,
} from "@/lib/learning-revisions-sync";

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

export async function verifyLearningRevisionTables(credentials: MaintainerCredentials): Promise<void> {
  await maintainerRest<LearningRevisionDecisionRow[]>(
    credentials,
    "/rest/v1/learning_revision_decisions?select=revision_id&limit=1",
  );
}

export async function fetchLearningRevisionDecisions(
  credentials: MaintainerCredentials,
): Promise<LearningRevisionDecisionRow[]> {
  return maintainerRest<LearningRevisionDecisionRow[]>(
    credentials,
    "/rest/v1/learning_revision_decisions?select=*&order=decided_at.desc",
  );
}

export async function upsertLearningRevisionDecision(
  credentials: MaintainerCredentials,
  revision: ProposedRevision,
  decision: RevisionDecision,
  note?: string,
): Promise<LearningRevisionDecisionRow> {
  const row = revisionToDecisionRow(revision, decision, note);
  const rows = await maintainerRest<LearningRevisionDecisionRow[]>(
    credentials,
    "/rest/v1/learning_revision_decisions",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(row),
    },
  );
  return rows[0] ?? row;
}

export function remoteDecisionRecords(rows: LearningRevisionDecisionRow[]) {
  return rowsToDecisionRecords(rows);
}

export function remoteAcceptedRevisions(rows: LearningRevisionDecisionRow[]): ProposedRevision[] {
  return acceptedSnapshotsFromRows(rows);
}

export { mergeDecisionRecords, rowToDecisionRecord };
