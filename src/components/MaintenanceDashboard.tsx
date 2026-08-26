"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MaintainerUnlock } from "@/components/MaintainerUnlock";
import { SECTION_LABEL, type LanguageNote } from "@/lib/language-log";
import { classifyLanguageNote, hasApprovalIssueLink } from "@/lib/language-note-routing";
import {
  clearCredentials,
  fetchAllLanguageNotes,
  readStoredCredentials,
  updateLanguageNoteRemote,
  type MaintainerCredentials,
} from "@/lib/language-notes-admin";
import {
  extractApprovalIssueUrl,
  summarizeTopicFeedback,
  type TopicFeedbackSummary,
} from "@/lib/topic-feedback-summary";

type LoadState = "idle" | "loading" | "error";

function formatWhen(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function alertStyles(level: TopicFeedbackSummary["alertLevel"]): string {
  if (level === "review") return "border-clay/40 bg-[#f6e4e0]";
  if (level === "watch") return "border-amber-300/60 bg-amber-50/80";
  return "border-rule bg-white/70";
}

export function MaintenanceDashboard() {
  const [credentials, setCredentials] = useState<MaintainerCredentials | null>(null);
  const [notes, setNotes] = useState<LanguageNote[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState("");

  const loadNotes = useCallback(async (creds: MaintainerCredentials) => {
    setLoadState("loading");
    setError("");
    try {
      const rows = await fetchAllLanguageNotes(creds);
      setNotes(rows);
      setLoadState("idle");
    } catch (loadError) {
      setLoadState("error");
      setError(loadError instanceof Error ? loadError.message : "Could not load notes.");
    }
  }, []);

  useEffect(() => {
    const stored = readStoredCredentials();
    if (stored) {
      setCredentials(stored);
      void loadNotes(stored);
    }
  }, [loadNotes]);

  const summaries = useMemo(() => summarizeTopicFeedback(notes), [notes]);
  const openNotes = notes.filter((note) => note.status === "open");
  const featureNotes = openNotes.filter((note) => classifyLanguageNote(note) === "feature");
  const languageNotes = openNotes.filter((note) => classifyLanguageNote(note) === "language");
  const flaggedTopics = summaries.filter((summary) => summary.alertLevel !== "none");

  async function handleUnlock(creds: MaintainerCredentials) {
    setCredentials(creds);
    await loadNotes(creds);
  }

  function handleSignOut() {
    clearCredentials();
    setCredentials(null);
    setNotes([]);
    setError("");
  }

  async function patchNote(id: string, update: { status?: LanguageNote["status"]; review_note?: string }) {
    if (!credentials) return;
    const updated = await updateLanguageNoteRemote(credentials, id, update);
    setNotes((current) => current.map((note) => (note.id === id ? updated : note)));
  }

  if (!credentials) {
    return <MaintainerUnlock onUnlock={handleUnlock} />;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          Connected to Supabase · {notes.length} note{notes.length === 1 ? "" : "s"} loaded
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <button
            type="button"
            className="rounded-full border border-rule px-4 py-2 hover:border-teal"
            onClick={() => void loadNotes(credentials)}
            disabled={loadState === "loading"}
          >
            {loadState === "loading" ? "Refreshing…" : "Refresh"}
          </button>
          <button type="button" className="underline decoration-rule" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>

      {error ? <p className="rounded-2xl border border-clay/30 bg-[#f6e4e0] px-4 py-3 text-sm text-ink">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Open" value={openNotes.length} />
        <StatCard label="Feature requests" value={featureNotes.length} />
        <StatCard label="Language fixes" value={languageNotes.length} />
        <StatCard label="Lessons flagged" value={flaggedTopics.length} />
      </section>

      {flaggedTopics.length > 0 ? (
        <section>
          <h2 className="serif text-3xl text-ink">Lessons needing attention</h2>
          <p className="mt-2 max-w-2xl text-ink-soft">
            Repeated notes on one lesson often mean the parent briefing or home pack is missing a picture — not just a
            single awkward phrase.
          </p>
          <div className="mt-4 space-y-4">
            {flaggedTopics.map((summary) => (
              <TopicSummaryCard key={summary.topicId} summary={summary} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="serif text-3xl text-ink">Feature requests ({featureNotes.length})</h2>
        <p className="mt-2 text-ink-soft">
          New behaviour needs approval before building. Add the <code className="text-sm">approved</code> label on the
          linked GitHub issue when ready.
        </p>
        {featureNotes.length === 0 ? (
          <p className="mt-3 text-ink-soft">No open feature requests.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {featureNotes.map((note) => (
              <MaintainerNoteCard key={note.id} note={note} onPatch={patchNote} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="serif text-3xl text-ink">Open language fixes ({languageNotes.length})</h2>
        {languageNotes.length === 0 ? (
          <p className="mt-3 text-ink-soft">Nothing waiting — wording fixes can be applied without approval.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {languageNotes.map((note) => (
              <MaintainerNoteCard key={note.id} note={note} onPatch={patchNote} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="serif text-3xl text-ink">All lessons by note count</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-rule bg-white/70">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-rule text-xs uppercase tracking-[0.14em] text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-semibold">Lesson</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Open</th>
                <th className="px-4 py-3 font-semibold">Language</th>
                <th className="px-4 py-3 font-semibold">Feature</th>
                <th className="px-4 py-3 font-semibold">Alert</th>
                <th className="px-4 py-3 font-semibold">Last note</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((summary) => (
                <tr key={summary.topicId} className="border-b border-rule/70 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/year-1-maths/${summary.topicId}`} className="font-semibold text-teal hover:underline">
                      {summary.topicTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{summary.total}</td>
                  <td className="px-4 py-3">{summary.open}</td>
                  <td className="px-4 py-3">{summary.language}</td>
                  <td className="px-4 py-3">{summary.feature}</td>
                  <td className="px-4 py-3 capitalize">{summary.alertLevel === "none" ? "—" : summary.alertLevel}</td>
                  <td className="px-4 py-3 text-ink-soft">{formatWhen(summary.lastNoteAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="serif text-3xl text-ink">Recent history</h2>
        <div className="mt-4 space-y-4">
          {notes.slice(0, 12).map((note) => (
            <MaintainerNoteCard key={note.id} note={note} onPatch={patchNote} compact />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-rule bg-white/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">{label}</p>
      <p className="serif mt-2 text-4xl text-ink">{value}</p>
    </div>
  );
}

function TopicSummaryCard({ summary }: { summary: TopicFeedbackSummary }) {
  return (
    <article className={`rounded-2xl border p-5 ${alertStyles(summary.alertLevel)}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">{summary.alertLevel}</p>
          <h3 className="serif mt-1 text-2xl text-ink">
            <Link href={`/year-1-maths/${summary.topicId}`} className="hover:underline">
              {summary.topicTitle}
            </Link>
          </h3>
        </div>
        <p className="text-sm text-ink-soft">
          {summary.total} notes · {summary.open} open · last {formatWhen(summary.lastNoteAt)}
        </p>
      </div>
      <p className="mt-3 text-ink-soft">{summary.alertReason}</p>
      <ul className="mt-4 space-y-2 text-sm text-ink-soft">
        {summary.notes.slice(0, 3).map((note) => (
          <li key={note.id}>
            <span className="font-semibold text-ink">[{note.status}]</span> {note.unclear}
          </li>
        ))}
      </ul>
    </article>
  );
}

function MaintainerNoteCard({
  note,
  onPatch,
  compact = false,
}: {
  note: LanguageNote;
  onPatch: (id: string, update: { status?: LanguageNote["status"]; review_note?: string }) => Promise<void>;
  compact?: boolean;
}) {
  const kind = classifyLanguageNote(note);
  const approvalUrl = extractApprovalIssueUrl(note.reviewNote);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  async function runAction(action: "done" | "decline" | "annotate") {
    const promptLabel =
      action === "done" ? "What changed?" : action === "decline" ? "Why skip?" : "Add a maintainer note";
    const text = window.prompt(promptLabel, note.reviewNote || "");
    if (text === null) return;
    const trimmed = text.trim();
    if (!trimmed && action !== "annotate") return;

    setBusy(true);
    setActionError("");
    try {
      if (action === "done") await onPatch(note.id, { status: "done", review_note: trimmed });
      else if (action === "decline") await onPatch(note.id, { status: "declined", review_note: trimmed });
      else await onPatch(note.id, { review_note: trimmed });
    } catch (patchError) {
      setActionError(patchError instanceof Error ? patchError.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-2xl border border-rule bg-white/70 p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
        <span className="text-teal">{note.status}</span>
        <span className="text-ink-soft">·</span>
        <span className={kind === "feature" ? "text-clay" : "text-sage"}>{kind}</span>
        <span className="text-ink-soft">·</span>
        <span className="text-ink-soft">{formatWhen(note.createdAt)}</span>
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        {note.topicTitle} · {SECTION_LABEL[note.section]}
      </p>
      {!compact ? <p className="mt-3 text-lg text-ink">{note.unclear}</p> : null}
      {note.clearer ? (
        <p className="mt-2 text-ink-soft">
          <span className="font-semibold text-ink">Suggested: </span>
          {note.clearer}
        </p>
      ) : null}
      {note.reviewNote ? (
        <p className="mt-2 text-ink-soft">
          <span className="font-semibold text-ink">Review: </span>
          {note.reviewNote}
        </p>
      ) : null}
      {actionError ? <p className="mt-2 text-sm text-clay">{actionError}</p> : null}
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link href={`/year-1-maths/${note.topicId}`} className="rounded-full border border-rule px-4 py-2 hover:border-teal">
          Open lesson
        </Link>
        {approvalUrl ? (
          <a href={approvalUrl} className="rounded-full border border-clay/40 px-4 py-2 text-clay hover:border-clay" target="_blank" rel="noreferrer">
            Approval issue
          </a>
        ) : kind === "feature" && !hasApprovalIssueLink(note.reviewNote) ? (
          <span className="rounded-full bg-[#f6e4e0] px-4 py-2 text-clay">Run daily sweep for approval issue</span>
        ) : null}
        {note.status === "open" ? (
          <>
            <button type="button" disabled={busy} className="underline decoration-rule" onClick={() => void runAction("done")}>
              Mark done
            </button>
            <button type="button" disabled={busy} className="underline decoration-rule" onClick={() => void runAction("decline")}>
              Decline
            </button>
          </>
        ) : null}
        <button type="button" disabled={busy} className="underline decoration-rule" onClick={() => void runAction("annotate")}>
          Annotate
        </button>
      </div>
    </article>
  );
}
