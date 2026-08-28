"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";
import {
  buildDecisionsExport,
  clearPendingApply,
  readSessionLearningStore,
  recordSessionDecision,
  type SessionLearningStore,
} from "@/lib/learning-decisions-store";
import {
  filterPendingRevisions,
  groupRevisionsByTopic,
  learningTitles,
  readCommittedDecisions,
  scanLearningRevisions,
  type ProposedRevision,
} from "@/lib/learning-revisions";

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function PackLearningReview() {
  const [store, setStore] = useState<SessionLearningStore>(() => readSessionLearningStore());
  const [selectedTopicId, setSelectedTopicId] = useState<string>("all");
  const [message, setMessage] = useState("");

  const committed = useMemo(() => readCommittedDecisions(), []);
  const allProposals = useMemo(() => scanLearningRevisions(), []);
  const mergedDecisions = useMemo(
    () => buildDecisionsExport(committed, store.decisions).decisions,
    [committed, store.decisions],
  );
  const pending = useMemo(
    () => filterPendingRevisions(allProposals, mergedDecisions),
    [allProposals, mergedDecisions],
  );
  const byTopic = useMemo(() => groupRevisionsByTopic(pending), [pending]);
  const catalog = useMemo(() => learningTitles(), []);

  const visible: ProposedRevision[] =
    selectedTopicId === "all" ? pending : (byTopic.get(selectedTopicId) ?? []);

  const topicsWithPending = year1MathsTopics.filter((topic) => (byTopic.get(topic.id) ?? []).length > 0);

  function decide(revision: ProposedRevision, decision: "accepted" | "declined") {
    const next = recordSessionDecision(revision, decision);
    setStore(next);
    setMessage(
      decision === "accepted"
        ? "Accepted — added to the apply queue. Export when you are ready to patch topic files."
        : "Declined — this exact proposal will stay hidden (sticky) so it does not bounce back.",
    );
  }

  function exportDecisions() {
    downloadJson("learning-decisions.json", buildDecisionsExport(committed, store.decisions));
    setMessage("Downloaded learning-decisions.json — commit it under src/content/ to keep declines sticky.");
  }

  function exportApplyQueue() {
    downloadJson("learning-revisions-accepted.json", {
      version: 1,
      accepted: store.pendingApply,
    });
    setMessage(
      "Downloaded learning-revisions-accepted.json — run: npx tsx scripts/apply-learning-revisions.ts learning-revisions-accepted.json",
    );
  }

  function clearQueue() {
    setStore(clearPendingApply());
    setMessage("Cleared the local apply queue.");
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="serif text-3xl text-ink">Pack learning review</h2>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Learnings from past language notes are scanned across every lesson. Accept or decline each proposed change.
          Declines stick so the same wording does not bounce back; accepted changes go into an apply queue you export
          and run as a script (avoids a change / counter-change loop).
        </p>
      </div>

      <section className="rounded-2xl border border-rule bg-white/70 p-5">
        <h3 className="font-semibold text-ink">Active learnings</h3>
        <ul className="mt-3 space-y-2 text-sm text-ink-soft">
          {catalog.map((learning) => (
            <li key={learning.id}>
              <span className="font-semibold text-ink">{learning.title}: </span>
              {learning.principle}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap items-end gap-4">
        <label className="block text-sm">
          <span className="font-semibold text-ink">Lesson</span>
          <select
            className="mt-2 block rounded-xl border border-rule bg-white px-3 py-2 text-ink"
            value={selectedTopicId}
            onChange={(event) => setSelectedTopicId(event.target.value)}
          >
            <option value="all">All lessons with proposals ({pending.length})</option>
            {year1MathsTopics.map((topic) => {
              const count = (byTopic.get(topic.id) ?? []).length;
              return (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                  {count ? ` (${count})` : ""}
                </option>
              );
            })}
          </select>
        </label>
        <div className="flex flex-wrap gap-3 text-sm">
          <button
            type="button"
            className="rounded-full border border-rule px-4 py-2 hover:border-teal"
            onClick={exportApplyQueue}
            disabled={store.pendingApply.length === 0}
          >
            Export accepted ({store.pendingApply.length})
          </button>
          <button type="button" className="rounded-full border border-rule px-4 py-2 hover:border-teal" onClick={exportDecisions}>
            Export decisions
          </button>
          <button type="button" className="underline decoration-rule" onClick={clearQueue} disabled={store.pendingApply.length === 0}>
            Clear apply queue
          </button>
        </div>
      </div>

      {message ? <p className="rounded-2xl bg-[#e5efe8] px-4 py-3 text-sm text-ink">{message}</p> : null}

      {topicsWithPending.length > 0 && selectedTopicId === "all" ? (
        <p className="text-sm text-ink-soft">
          Lessons with pending proposals:{" "}
          {topicsWithPending.map((topic) => topic.shortTitle).join(", ")}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <p className="text-ink-soft">
          No pending proposals
          {selectedTopicId === "all" ? "" : " for this lesson"}. Either the packs already match the learnings, or
          remaining items were declined.
        </p>
      ) : (
        <div className="space-y-4">
          {visible.map((revision) => (
            <article key={revision.id} className="rounded-2xl border border-rule bg-white/70 p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
                <span className="text-teal">{revision.kind}</span>
                <span className="text-ink-soft">·</span>
                <span className="text-ink-soft">{revision.learningTitle}</span>
              </div>
              <p className="mt-2 text-sm text-ink-soft">
                <Link href={`/year-1-maths/${revision.topicId}`} className="font-semibold text-teal hover:underline">
                  {revision.topicTitle}
                </Link>{" "}
                · <code className="text-xs">{revision.fieldPath}</code>
              </p>
              <p className="mt-3 text-ink-soft">{revision.rationale}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#f6e4e0] p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">Before</p>
                  <p className="mt-2 text-sm text-ink">{revision.before}</p>
                </div>
                <div className="rounded-xl bg-[#e5efe8] p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage">After</p>
                  <p className="mt-2 text-sm text-ink">{revision.after}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  className="rounded-full bg-teal px-4 py-2 font-semibold text-white hover:bg-teal-deep"
                  onClick={() => decide(revision, "accepted")}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="rounded-full border border-rule px-4 py-2 hover:border-clay"
                  onClick={() => decide(revision, "declined")}
                >
                  Decline
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="text-sm text-ink-soft">
        Apply accepted revisions locally with{" "}
        <code className="text-xs">npx tsx scripts/apply-learning-revisions.ts learning-revisions-accepted.json</code>,
        then commit the topic edits and an updated <code className="text-xs">learning-decisions.json</code>.
      </p>
    </div>
  );
}
