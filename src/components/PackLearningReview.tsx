"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";
import { presentationLearnings } from "@/content/presentation-learnings";
import {
  buildDecisionsExport,
  clearPendingApply,
  readSessionLearningStore,
  recordSessionDecision,
  type SessionLearningStore,
} from "@/lib/learning-decisions-store";
import {
  buildPackReleaseExport,
  clearSessionCandidate,
  confirmSessionPackRecheck,
  confirmSessionVideoRecheck,
  readSessionPackReleaseStore,
  setSessionCandidate,
} from "@/lib/pack-release-store";
import {
  assessAllPackReleases,
  mergePackReleaseFile,
  planGlobalRevisionSweep,
  readPackReleaseFile,
  summarizePackReleases,
} from "@/lib/pack-release";
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
  const [releaseStore, setReleaseStore] = useState(() => readSessionPackReleaseStore());
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
  const mergedReleaseFile = useMemo(
    () => mergePackReleaseFile(readPackReleaseFile(), releaseStore),
    [releaseStore],
  );
  const releaseReports = useMemo(
    () => assessAllPackReleases(year1MathsTopics, mergedReleaseFile),
    [mergedReleaseFile],
  );
  const releaseSummary = useMemo(() => summarizePackReleases(releaseReports), [releaseReports]);

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
      "Downloaded learning-revisions-accepted.json — commit it to inbox/ on main to auto-apply via GitHub Actions, or run: npx tsx scripts/apply-learning-revisions.ts inbox/learning-revisions-accepted.json",
    );
  }

  function clearQueue() {
    setStore(clearPendingApply());
    setMessage("Cleared the local apply queue.");
  }

  function exportPackRelease() {
    downloadJson("pack-release.json", buildPackReleaseExport(readPackReleaseFile(), releaseStore));
    setMessage("Downloaded pack-release.json — commit it under src/content/ to keep release checklists sticky.");
  }

  function exportGlobalSweep(topicId: string) {
    const sweep = planGlobalRevisionSweep(topicId);
    downloadJson("global-revision-sweep.json", sweep);
    setMessage(
      `Downloaded global revision sweep triggered by ${topicId} — ${sweep.pending.length} pending proposal(s) across ${sweep.draftTopicIds.length} draft pack(s). Review and accept on this page, then export the apply queue.`,
    );
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
        <h3 className="font-semibold text-ink">Pack release (one at a time)</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Finishing a pack is a human decision. Apply learnings, re-read the pack on site, re-run and watch the video
          if there is one, then release. Only one lesson should be the active candidate at a time. CLI:{" "}
          <code className="text-xs">npx tsx scripts/release-pack.ts &lt;topic-id&gt; --candidate</code> →{" "}
          <code className="text-xs">--confirm-pack</code> →{" "}
          <code className="text-xs">--confirm-video</code> (if needed) →{" "}
          <code className="text-xs">--release --sweep</code>.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Active candidate:{" "}
          <strong className="text-ink">{releaseSummary.activeCandidateId ?? "none"}</strong> ·{" "}
          {releaseSummary.draftCount} draft pack(s) · {releaseSummary.pendingLearningCount} corpus-wide pending learning
          proposal(s)
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <button
            type="button"
            className="rounded-full border border-rule px-4 py-2 hover:border-teal"
            onClick={exportPackRelease}
          >
            Export pack-release.json
          </button>
          <button
            type="button"
            className="underline decoration-rule"
            onClick={() => {
              setReleaseStore(clearSessionCandidate());
              setMessage("Cleared local release candidate.");
            }}
          >
            Clear local candidate
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead>
              <tr className="border-b border-rule text-xs uppercase tracking-[0.14em] text-ink-soft">
                <th className="py-2 pr-4 font-semibold">Lesson</th>
                <th className="py-2 pr-4 font-semibold">Status</th>
                <th className="py-2 pr-4 font-semibold">Blockers</th>
                <th className="py-2 pr-4 font-semibold">Pack recheck</th>
                <th className="py-2 pr-4 font-semibold">Video</th>
                <th className="py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {releaseReports.map((row) => (
                <tr key={row.topicId} className="border-b border-rule/60">
                  <td className="py-3 pr-4 text-ink">
                    {row.shortTitle}
                    {row.isActiveCandidate ? (
                      <span className="ml-2 rounded-full bg-teal/10 px-2 py-0.5 text-xs font-semibold text-teal">
                        candidate
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4 text-ink-soft">{row.reviewStatus}</td>
                  <td className="py-3 pr-4 text-ink-soft">
                    {row.automaticBlockers.length === 0 ? "none" : row.automaticBlockers.length}
                  </td>
                  <td className="py-3 pr-4">{row.packRechecked ? "done" : "needed"}</td>
                  <td className="py-3 pr-4">
                    {!row.hasVideo ? "n/a" : row.videoRechecked ? "done" : row.video.kind}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="text-teal underline decoration-teal/40"
                        onClick={() => {
                          setReleaseStore(setSessionCandidate(row.topicId));
                          setMessage(`Set ${row.shortTitle} as the local release candidate.`);
                        }}
                      >
                        Candidate
                      </button>
                      <button
                        type="button"
                        className="text-teal underline decoration-teal/40"
                        onClick={() => {
                          const note = window.prompt("What did you re-read or check on the pack?");
                          if (!note?.trim()) return;
                          setReleaseStore(confirmSessionPackRecheck(row.topicId, note.trim()));
                          setMessage(`Recorded pack recheck for ${row.shortTitle}.`);
                        }}
                      >
                        Pack OK
                      </button>
                      {row.hasVideo ? (
                        <button
                          type="button"
                          className="text-teal underline decoration-teal/40"
                          onClick={() => {
                            const note = window.prompt("What did you check on the video?");
                            if (!note?.trim()) return;
                            setReleaseStore(confirmSessionVideoRecheck(row.topicId, note.trim()));
                            setMessage(`Recorded video recheck for ${row.shortTitle}.`);
                          }}
                        >
                          Video OK
                        </button>
                      ) : null}
                      {row.canSweepCorpus ? (
                        <button
                          type="button"
                          className="text-teal underline decoration-teal/40"
                          onClick={() => exportGlobalSweep(row.topicId)}
                        >
                          Sweep
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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
        Commit exported acceptances to{" "}
        <code className="text-xs">inbox/learning-revisions-accepted.json</code> on{" "}
        <code className="text-xs">main</code> to auto-apply via GitHub Actions, or run locally with{" "}
        <code className="text-xs">npx tsx scripts/apply-learning-revisions.ts --record-decisions --archive</code>,
        then commit the topic edits and an updated <code className="text-xs">learning-decisions.json</code>.
      </p>
    </div>
  );
}
