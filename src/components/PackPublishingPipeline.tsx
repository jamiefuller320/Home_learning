"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";
import {
  assessAllPublishWorkflows,
  buildPublishRequest,
  buildScriptPreviewBundle,
  publishActionLabel,
  publishStageLabel,
  type PublishAction,
  type PublishRequest,
  type PublishWorkflowView,
} from "@/lib/pack-publishing";
import { readPackReleaseFile } from "@/lib/pack-release";
import {
  confirmSessionFinalCheck,
  approveSessionLesson,
  approveSessionScript,
  approveSessionVideo,
  buildPackReleaseExport,
  markSessionReleased,
  markSessionVideoGenerated,
  markSessionVideoQueued,
  mergePackReleaseStores,
  readSessionPackReleaseStore,
  refreshSessionScript,
  restoreSessionRelease,
  setSessionCandidate,
  suspendSessionRelease,
  writeSessionPackReleaseStore,
} from "@/lib/pack-release-store";

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function stageStyles(stage: PublishWorkflowView["stage"]): string {
  if (stage === "live") return "border-sage/40 bg-[#e5efe8]";
  if (stage === "suspended") return "border-clay/40 bg-[#f6e4e0]";
  if (stage === "ready_to_release") return "border-teal/40 bg-teal/5";
  return "border-rule bg-white/70";
}

function PipelineStep({
  label,
  done,
  active,
}: {
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        done ? "bg-sage/15 text-sage" : active ? "bg-teal/15 text-teal" : "bg-rule/40 text-ink-soft"
      }`}
    >
      {label}
    </span>
  );
}

function WorkflowSteps({ view }: { view: PublishWorkflowView }) {
  const entry = view.entry;
  return (
    <div className="flex flex-wrap gap-2">
      <PipelineStep label="Lesson" done={Boolean(entry?.lessonApprovedAt)} active={view.stage === "editing"} />
      <PipelineStep label="Script" done={Boolean(entry?.scriptApprovedAt)} active={view.stage === "script_review"} />
      <PipelineStep
        label="Video"
        done={Boolean(entry?.videoApprovedAt)}
        active={view.stage === "video_pending" || view.stage === "video_review"}
      />
      <PipelineStep label="Final" done={Boolean(entry?.finalCheckedAt)} active={view.stage === "final_check"} />
      <PipelineStep label="Live" done={view.stage === "live"} active={view.stage === "ready_to_release"} />
    </div>
  );
}

export function PackPublishingPipeline() {
  const [releaseStore, setReleaseStore] = useState(() => readSessionPackReleaseStore());
  const [message, setMessage] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(releaseStore.activeCandidateId);

  const mergedReleaseFile = useMemo(
    () => mergePackReleaseStores(readPackReleaseFile(), releaseStore),
    [releaseStore],
  );
  const workflows = useMemo(
    () => assessAllPublishWorkflows(year1MathsTopics, mergedReleaseFile),
    [mergedReleaseFile],
  );

  const activeCandidate = workflows.find((row) => row.isActiveCandidate);
  const liveCount = workflows.filter((row) => row.stage === "live").length;
  const inProgress = workflows.filter((row) => row.stage !== "live" && row.stage !== "suspended" && row.stage !== "editing");

  function exportPackRelease() {
    downloadJson("pack-release.json", buildPackReleaseExport(readPackReleaseFile(), releaseStore));
    setMessage("Downloaded pack-release.json — commit under src/content/ to persist workflow state.");
  }

  function exportPublishRequest(view: PublishWorkflowView, action: PublishRequest["action"], note?: string): void {
    const topic = year1MathsTopics.find((item) => item.id === view.topicId);
    if (!topic) return;
    downloadJson(
      `publish-request-${view.topicId}.json`,
      buildPublishRequest(action, topic, mergedReleaseFile, note),
    );
  }

  function runAction(view: PublishWorkflowView, action: PublishAction) {
    const topic = year1MathsTopics.find((item) => item.id === view.topicId);
    if (!topic) return;

    const notePrompt =
      action === "approve_lesson"
        ? "What did you check on the lesson pack?"
        : action === "approve_script"
          ? "Script sign-off note"
          : action === "approve_video"
            ? "What did you check on the video?"
            : action === "final_check"
              ? "Final check note"
              : action === "release"
                ? "Release note"
                : action === "suspend"
                  ? "Why suspend this lesson?"
                  : action === "restore"
                    ? "Restore note"
                    : "Note";

    const note = action === "queue_video" ? undefined : window.prompt(notePrompt, "");
    if (action !== "queue_video" && note === null) return;
    const trimmed = note?.trim() ?? "";

    switch (action) {
      case "approve_lesson": {
        if (!trimmed) return;
        const preview = buildScriptPreviewBundle(topic);
        setReleaseStore(approveSessionLesson(topic, trimmed));
        downloadJson(`script-preview-${topic.id}.json`, preview.scriptJson);
        setMessage(
          `Lesson approved and script generated (${preview.hash.slice(0, 8)}…). Review in Video script tab, then approve script.`,
        );
        setExpandedId(topic.id);
        break;
      }
      case "approve_script": {
        if (!trimmed) return;
        setReleaseStore(approveSessionScript(topic.id, trimmed));
        setReleaseStore(markSessionVideoQueued(topic.id, view.scriptHash ?? ""));
        exportPublishRequest(view, "generate-video", trimmed);
        setMessage(
          "Script approved. Downloaded publish-request — commit to inbox/ to run rehearsal/render via GitHub Actions, or run npm run rehearse:parent-video locally.",
        );
        break;
      }
      case "queue_video": {
        exportPublishRequest(view, "generate-video");
        setMessage("Downloaded video generation request — commit to inbox/ or run the parent-video pipeline locally.");
        break;
      }
      case "approve_video": {
        if (!trimmed) return;
        setReleaseStore(approveSessionVideo(topic.id, trimmed));
        setMessage("Video approved — run final check when ready.");
        break;
      }
      case "final_check": {
        if (!trimmed) return;
        setReleaseStore(confirmSessionFinalCheck(topic.id, trimmed));
        setMessage("Final check recorded — you can release when blockers are clear.");
        break;
      }
      case "release": {
        if (!trimmed) return;
        setReleaseStore(markSessionReleased(topic.id, trimmed));
        exportPublishRequest(view, "release", trimmed);
        setMessage(
          "Release queued locally. Downloaded publish-request — commit to inbox/ to flip reviewStatus and go live via GitHub Actions.",
        );
        break;
      }
      case "suspend": {
        if (!trimmed) return;
        setReleaseStore(suspendSessionRelease(topic.id, trimmed));
        exportPublishRequest(view, "suspend", trimmed);
        setMessage("Suspend request downloaded — commit to inbox/ to hide this lesson on the public index.");
        break;
      }
      case "restore": {
        if (!trimmed) return;
        setReleaseStore(restoreSessionRelease(topic.id, trimmed));
        exportPublishRequest(view, "restore", trimmed);
        setMessage("Restore request downloaded — commit to inbox/ to show this lesson live again.");
        break;
      }
    }
  }

  function refreshScript(view: PublishWorkflowView) {
    const topic = year1MathsTopics.find((item) => item.id === view.topicId);
    if (!topic) return;
    const preview = buildScriptPreviewBundle(topic);
    setReleaseStore(refreshSessionScript(topic));
    downloadJson(`script-preview-${topic.id}.json`, preview.scriptJson);
    setMessage(`Regenerated script for ${view.shortTitle} (${preview.hash.slice(0, 8)}…).`);
  }

  return (
    <section className="space-y-6 rounded-2xl border border-rule bg-white/70 p-5">
      <div>
        <h3 className="font-semibold text-ink">Publishing pipeline</h3>
        <p className="mt-2 max-w-3xl text-sm text-ink-soft">
          One pack at a time: approve the lesson (auto-generates a script), approve the script (queues video
          generation), approve the video, final check, then release live. Suspended lessons stay in the repo but
          disappear from the public lesson list. Export{" "}
          <code className="text-xs">pack-release.json</code> to persist progress; commit publish requests in{" "}
          <code className="text-xs">inbox/</code> for GitHub Actions to apply release and video steps.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Active candidate:{" "}
          <strong className="text-ink">{activeCandidate?.shortTitle ?? "none"}</strong> · {liveCount} live ·{" "}
          {inProgress.length} in progress
        </p>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <button type="button" className="rounded-full border border-rule px-4 py-2 hover:border-teal" onClick={exportPackRelease}>
          Export pack-release.json
        </button>
        <button
          type="button"
          className="underline decoration-rule"
          onClick={() => {
            writeSessionPackReleaseStore({ activeCandidateId: null, entries: {} });
            setReleaseStore({ activeCandidateId: null, entries: {} });
            setMessage("Cleared local publishing session.");
          }}
        >
          Reset local session
        </button>
      </div>

      {message ? <p className="rounded-2xl bg-[#e5efe8] px-4 py-3 text-sm text-ink">{message}</p> : null}

      <div className="space-y-4">
        {workflows.map((view) => {
          const expanded = expandedId === view.topicId;
          return (
            <article key={view.topicId} className={`rounded-2xl border p-5 ${stageStyles(view.stage)}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="serif text-xl text-ink">{view.shortTitle}</h4>
                    {view.isActiveCandidate ? (
                      <span className="rounded-full bg-teal/10 px-2 py-0.5 text-xs font-semibold text-teal">candidate</span>
                    ) : null}
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                      {publishStageLabel(view.stage)}
                    </span>
                  </div>
                  <div className="mt-3">
                    <WorkflowSteps view={view} />
                  </div>
                </div>
                <button
                  type="button"
                  className="text-sm text-teal underline decoration-teal/40"
                  onClick={() => setExpandedId(expanded ? null : view.topicId)}
                >
                  {expanded ? "Hide" : "Details"}
                </button>
              </div>

              {view.blockers.length > 0 ? (
                <ul className="mt-3 space-y-1 text-sm text-clay">
                  {view.blockers.map((blocker) => (
                    <li key={blocker}>• {blocker}</li>
                  ))}
                </ul>
              ) : null}

              {expanded ? (
                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-ink-soft">Script hash</dt>
                    <dd className="font-mono text-xs text-ink">{view.scriptHash ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-soft">Publication</dt>
                    <dd className="capitalize text-ink">{view.publicationStatus}</dd>
                  </div>
                  {view.entry?.lessonApprovalNote ? (
                    <div className="sm:col-span-2">
                      <dt className="text-ink-soft">Lesson note</dt>
                      <dd className="text-ink">{view.entry.lessonApprovalNote}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                {!view.isActiveCandidate && view.stage !== "live" && view.stage !== "suspended" ? (
                  <button
                    type="button"
                    className="rounded-full border border-rule px-3 py-1.5 hover:border-teal"
                    onClick={() => {
                      setReleaseStore(setSessionCandidate(view.topicId));
                      setExpandedId(view.topicId);
                      setMessage(`Set ${view.shortTitle} as the active candidate.`);
                    }}
                  >
                    Set candidate
                  </button>
                ) : null}
                <Link
                  href={`/maintenance/?tab=script&topic=${view.topicId}`}
                  className="rounded-full border border-rule px-3 py-1.5 hover:border-teal"
                >
                  Open script
                </Link>
                <Link
                  href={`/year-1-maths/${view.topicId}`}
                  className="rounded-full border border-rule px-3 py-1.5 hover:border-teal"
                >
                  Open lesson
                </Link>
                {view.scriptStale || (view.entry?.scriptGeneratedAt && view.stage === "script_review") ? (
                  <button
                    type="button"
                    className="underline decoration-rule"
                    onClick={() => refreshScript(view)}
                  >
                    Refresh script
                  </button>
                ) : null}
                {view.nextAction ? (
                  <button
                    type="button"
                    className="rounded-full bg-teal px-4 py-1.5 font-semibold text-white hover:bg-teal-deep"
                    onClick={() => runAction(view, view.nextAction!)}
                  >
                    {publishActionLabel(view.nextAction)}
                  </button>
                ) : null}
                {view.stage === "video_pending" && !view.entry?.videoGeneratedAt ? (
                  <>
                    <span className="self-center text-xs text-ink-soft">Waiting for video pipeline…</span>
                    <button
                      type="button"
                      className="underline decoration-rule"
                      onClick={() => {
                        const note = window.prompt("Confirm video rehearsal/render is ready", "Watched rehearsal pass");
                        if (!note?.trim() || !view.scriptHash) return;
                        setReleaseStore(markSessionVideoGenerated(view.topicId, view.scriptHash, note.trim()));
                        setMessage(`Marked video ready for ${view.shortTitle}. Approve video when satisfied.`);
                      }}
                    >
                      Mark video ready
                    </button>
                  </>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
