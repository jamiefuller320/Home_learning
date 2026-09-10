"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";
import { presentationLearnings } from "@/content/presentation-learnings";
import { LessonRevisionPanel } from "@/components/LessonRevisionPanel";
import { PackPublishingPipeline } from "@/components/PackPublishingPipeline";
import { useLearningRevisionDecisions } from "@/hooks/useLearningRevisionDecisions";
import type { MaintainerCredentials } from "@/lib/language-notes-admin";
import { clearPendingApply } from "@/lib/learning-decisions-store";
import { learningTitles, type ProposedRevision } from "@/lib/learning-revisions";

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function PackLearningReview({ credentials }: { credentials?: MaintainerCredentials | null }) {
  const [selectedTopicId, setSelectedTopicId] = useState<string>("all");
  const [message, setMessage] = useState("");

  const {
    liveMode,
    pending,
    byTopic,
    pendingApply,
    busyRevisionId,
    decide,
    exportDecisions,
    setStore,
    error,
    loading,
    lastFetchedAt,
  } = useLearningRevisionDecisions(credentials ?? null);

  const catalog = useMemo(() => learningTitles(), []);
  const visible: ProposedRevision[] =
    selectedTopicId === "all" ? pending : (byTopic.get(selectedTopicId) ?? []);

  const topicsWithPending = year1MathsTopics.filter((topic) => (byTopic.get(topic.id) ?? []).length > 0);

  async function handleDecide(revision: ProposedRevision, decision: "accepted" | "declined") {
    try {
      await decide(revision, decision);
      setMessage(
        decision === "accepted"
          ? liveMode
            ? "Accepted in Supabase — added to the apply queue."
            : "Accepted locally — added to the apply queue. Export when ready to patch topic files."
          : liveMode
            ? "Declined in Supabase — this proposal stays hidden for all maintainers."
            : "Declined locally — this exact proposal will stay hidden (sticky) so it does not bounce back.",
      );
    } catch {
      setMessage("Could not save the revision decision.");
    }
  }

  function exportDecisionsFile() {
    downloadJson("learning-decisions.json", exportDecisions());
    setMessage("Downloaded learning-decisions.json — commit it under src/content/ to keep declines sticky.");
  }

  function exportApplyQueue() {
    downloadJson("learning-revisions-accepted.json", {
      version: 1,
      accepted: pendingApply,
    });
    setMessage(
      "Downloaded learning-revisions-accepted.json — commit it to inbox/ on main to auto-apply via GitHub Actions, or run: npx tsx scripts/apply-learning-revisions.ts inbox/learning-revisions-accepted.json",
    );
  }

  function clearQueue() {
    setStore(clearPendingApply());
    setMessage("Cleared the local apply queue. Supabase accepted snapshots remain until exported and applied.");
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="serif text-3xl text-ink">Pack learning review</h2>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Learnings from past language notes are scanned across every lesson. Accept or decline each proposed change on
          the lesson tiles below or in the list. When maintainer access is unlocked, decisions sync live via Supabase.
        </p>
      </div>

      <PackPublishingPipeline
        credentials={credentials}
        revisions={{
          byTopic,
          liveMode,
          busyRevisionId,
          decide: handleDecide,
          error,
          loading,
          lastFetchedAt,
        }}
      />

      <section className="rounded-2xl border border-rule bg-white/70 p-5">
        <h3 className="font-semibold text-ink">Presentation learnings (global)</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Layout and wrapping fixes live in shared components — not in topic files. Future packs inherit these
          automatically.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-ink-soft">
          {presentationLearnings.map((learning) => (
            <li key={learning.id}>
              <span className="font-semibold text-ink">{learning.title}: </span>
              {learning.principle}
            </li>
          ))}
        </ul>
      </section>

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
            disabled={pendingApply.length === 0}
          >
            Export accepted ({pendingApply.length})
          </button>
          <button type="button" className="rounded-full border border-rule px-4 py-2 hover:border-teal" onClick={exportDecisionsFile}>
            Export decisions
          </button>
          <button type="button" className="underline decoration-rule" onClick={clearQueue} disabled={pendingApply.length === 0}>
            Clear local apply queue
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
              <p className="text-sm text-ink-soft">
                <Link href={`/year-1-maths/${revision.topicId}`} className="font-semibold text-teal hover:underline">
                  {revision.topicTitle}
                </Link>
              </p>
              <LessonRevisionPanel
                revisions={[revision]}
                liveMode={liveMode}
                busyRevisionId={busyRevisionId}
                onDecide={handleDecide}
              />
            </article>
          ))}
        </div>
      )}

      <p className="text-sm text-ink-soft">
        Commit exported acceptances to{" "}
        <code className="text-xs">inbox/learning-revisions-accepted.json</code> on{" "}
        <code className="text-xs">main</code> to auto-apply via GitHub Actions, or run locally with{" "}
        <code className="text-xs">npx tsx scripts/apply-learning-revisions.ts --record-decisions --archive</code>,
        then commit the topic edits and an updated <code className="text-xs">learning-decisions.json</code>. Run{" "}
        <code className="text-xs">supabase/learning_revision_decisions.sql</code> once for live revision decisions.
      </p>
    </div>
  );
}
