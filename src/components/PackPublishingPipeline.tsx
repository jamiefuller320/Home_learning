"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";
import { LessonRevisionPanel } from "@/components/LessonRevisionPanel";
import { useMaintainerPublishPoll } from "@/hooks/useMaintainerPublishPoll";
import type { ProposedRevision } from "@/lib/learning-revisions";
import type { MaintainerCredentials } from "@/lib/language-notes-admin";
import {
  setRemoteActiveCandidate,
  upsertRemotePublishEntry,
} from "@/lib/pack-publish-admin";
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
  buildPackReleaseExport,
  mergePackReleaseStores,
  readSessionPackReleaseStore,
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

type RevisionControls = {
  byTopic: Map<string, ProposedRevision[]>;
  liveMode: boolean;
  busyRevisionId: string | null;
  decide: (revision: ProposedRevision, decision: "accepted" | "declined") => void | Promise<void>;
  error?: string;
  loading?: boolean;
  lastFetchedAt?: string | null;
};

export function PackPublishingPipeline({
  credentials,
  revisions,
}: {
  credentials?: MaintainerCredentials | null;
  revisions?: RevisionControls;
}) {
  const [releaseStore, setReleaseStore] = useState(() => readSessionPackReleaseStore());
  const [message, setMessage] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(releaseStore.activeCandidateId);
  const [busy, setBusy] = useState(false);
  const { mergedFile, loading, error, lastFetchedAt, refresh } = useMaintainerPublishPoll(credentials ?? null);
  const byTopic = revisions?.byTopic ?? new Map<string, ProposedRevision[]>();
  const revisionsLiveMode = revisions?.liveMode ?? false;
  const busyRevisionId = revisions?.busyRevisionId ?? null;
  const decideRevision = revisions?.decide ?? (() => undefined);
  const revisionError = revisions?.error ?? "";
  const revisionsLoading = revisions?.loading ?? false;
  const revisionsFetchedAt = revisions?.lastFetchedAt ?? null;

  const mergedReleaseFile = useMemo(() => {
    if (credentials) return mergedFile;
    return mergePackReleaseStores(readPackReleaseFile(), releaseStore);
  }, [credentials, mergedFile, releaseStore]);

  const workflows = useMemo(
    () => assessAllPublishWorkflows(year1MathsTopics, mergedReleaseFile),
    [mergedReleaseFile],
  );

  useEffect(() => {
    if (credentials && mergedFile.activeCandidateId) {
      setExpandedId(mergedFile.activeCandidateId);
    }
  }, [credentials, mergedFile.activeCandidateId]);

  const activeCandidate = workflows.find((row) => row.isActiveCandidate);
  const liveCount = workflows.filter((row) => row.stage === "live").length;
  const inProgress = workflows.filter((row) => row.stage !== "live" && row.stage !== "suspended" && row.stage !== "editing");
  const liveMode = Boolean(credentials);

  function exportPackRelease() {
    downloadJson("pack-release.json", buildPackReleaseExport(readPackReleaseFile(), releaseStore));
    setMessage("Downloaded pack-release.json — optional git backup; Supabase is live when unlocked.");
  }

  function exportPublishRequest(view: PublishWorkflowView, action: PublishRequest["action"], note?: string): void {
    const topic = year1MathsTopics.find((item) => item.id === view.topicId);
    if (!topic) return;
    downloadJson(
      `publish-request-${view.topicId}.json`,
      buildPublishRequest(action, topic, mergedReleaseFile, note),
    );
  }

  async function persistEntry(topicId: string, update: Parameters<typeof upsertRemotePublishEntry>[2]) {
    if (!credentials) return;
    await upsertRemotePublishEntry(credentials, topicId, update);
    await refresh();
  }

  async function runAction(view: PublishWorkflowView, action: PublishAction) {
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
    const now = new Date().toISOString();

    setBusy(true);
    setMessage("");
    try {
      switch (action) {
        case "approve_lesson": {
          if (!trimmed) return;
          const preview = buildScriptPreviewBundle(topic);
          if (liveMode && credentials) {
            await persistEntry(topic.id, {
              topicId: topic.id,
              lessonApprovedAt: now,
              lessonApprovalNote: trimmed,
              packRecheckedAt: now,
              packRecheckNote: trimmed,
              scriptGeneratedAt: now,
              scriptHashAtGeneration: preview.hash,
            });
          } else {
            setReleaseStore((current) => ({
              ...current,
              entries: {
                ...current.entries,
                [topic.id]: {
                  ...current.entries[topic.id],
                  topicId: topic.id,
                  lessonApprovedAt: now,
                  lessonApprovalNote: trimmed,
                  packRecheckedAt: now,
                  packRecheckNote: trimmed,
                  scriptGeneratedAt: now,
                  scriptHashAtGeneration: preview.hash,
                },
              },
            }));
          }
          downloadJson(`script-preview-${topic.id}.json`, preview.scriptJson);
          setMessage(
            `Lesson approved and script generated (${preview.hash.slice(0, 8)}…). Review in Video script tab, then approve script.`,
          );
          setExpandedId(topic.id);
          break;
        }
        case "approve_script": {
          if (!trimmed) return;
          if (liveMode && credentials) {
            await persistEntry(topic.id, {
              topicId: topic.id,
              scriptApprovedAt: now,
              scriptApprovalNote: trimmed,
              videoGeneratedHash: view.scriptHash,
            });
          } else {
            setReleaseStore((current) => ({
              ...current,
              entries: {
                ...current.entries,
                [topic.id]: {
                  ...current.entries[topic.id],
                  topicId: topic.id,
                  scriptApprovedAt: now,
                  scriptApprovalNote: trimmed,
                  videoGeneratedHash: view.scriptHash,
                },
              },
            }));
          }
          exportPublishRequest(view, "generate-video", trimmed);
          setMessage(
            liveMode
              ? "Script approved in Supabase. Video job exported — run rehearsal locally or via GitHub Actions."
              : "Script approved locally. Downloaded publish-request for video generation.",
          );
          break;
        }
        case "queue_video": {
          exportPublishRequest(view, "generate-video");
          setMessage("Downloaded video generation request.");
          break;
        }
        case "approve_video": {
          if (!trimmed) return;
          if (liveMode && credentials) {
            await persistEntry(topic.id, {
              topicId: topic.id,
              videoApprovedAt: now,
              videoApprovalNote: trimmed,
              videoRecheckedAt: now,
              videoRecheckNote: trimmed,
            });
          } else {
            setReleaseStore((current) => ({
              ...current,
              entries: {
                ...current.entries,
                [topic.id]: {
                  ...current.entries[topic.id],
                  topicId: topic.id,
                  videoApprovedAt: now,
                  videoApprovalNote: trimmed,
                  videoRecheckedAt: now,
                  videoRecheckNote: trimmed,
                },
              },
            }));
          }
          setMessage("Video approved — run final check when ready.");
          break;
        }
        case "final_check": {
          if (!trimmed) return;
          if (liveMode && credentials) {
            await persistEntry(topic.id, { topicId: topic.id, finalCheckedAt: now, finalCheckNote: trimmed });
          } else {
            setReleaseStore((current) => ({
              ...current,
              entries: {
                ...current.entries,
                [topic.id]: { ...current.entries[topic.id], topicId: topic.id, finalCheckedAt: now, finalCheckNote: trimmed },
              },
            }));
          }
          setMessage("Final check recorded — you can release when blockers are clear.");
          break;
        }
        case "release": {
          if (!trimmed) return;
          if (liveMode && credentials) {
            await persistEntry(topic.id, {
              topicId: topic.id,
              releasedAt: now,
              releaseNote: trimmed,
              suspendedAt: undefined,
              suspendNote: undefined,
            });
            await setRemoteActiveCandidate(credentials, null);
            await refresh();
          } else {
            setReleaseStore((current) => ({
              activeCandidateId: null,
              entries: {
                ...current.entries,
                [topic.id]: {
                  ...current.entries[topic.id],
                  topicId: topic.id,
                  releasedAt: now,
                  releaseNote: trimmed,
                  suspendedAt: undefined,
                  suspendNote: undefined,
                },
              },
            }));
            exportPublishRequest(view, "release", trimmed);
          }
          setMessage(
            liveMode
              ? `${view.shortTitle} is live — public lesson list updates on the next Supabase poll (~30s).`
              : "Release queued locally. Commit publish-request to inbox/ for git sync.",
          );
          break;
        }
        case "suspend": {
          if (!trimmed) return;
          if (liveMode && credentials) {
            await persistEntry(topic.id, { topicId: topic.id, suspendedAt: now, suspendNote: trimmed });
          } else {
            setReleaseStore((current) => ({
              ...current,
              entries: {
                ...current.entries,
                [topic.id]: { ...current.entries[topic.id], topicId: topic.id, suspendedAt: now, suspendNote: trimmed },
              },
            }));
            exportPublishRequest(view, "suspend", trimmed);
          }
          setMessage(liveMode ? `${view.shortTitle} suspended — hidden from the public index shortly.` : "Suspend request downloaded.");
          break;
        }
        case "restore": {
          if (!trimmed) return;
          if (liveMode && credentials) {
            await persistEntry(topic.id, {
              topicId: topic.id,
              suspendedAt: undefined,
              suspendNote: undefined,
              restoredAt: now,
              releaseNote: trimmed,
            });
          } else {
            setReleaseStore((current) => ({
              ...current,
              entries: {
                ...current.entries,
                [topic.id]: {
                  ...current.entries[topic.id],
                  topicId: topic.id,
                  suspendedAt: undefined,
                  suspendNote: undefined,
                  restoredAt: now,
                  releaseNote: trimmed,
                },
              },
            }));
            exportPublishRequest(view, "restore", trimmed);
          }
          setMessage(liveMode ? `${view.shortTitle} restored live.` : "Restore request downloaded.");
          break;
        }
      }
    } catch (actionError) {
      setMessage(actionError instanceof Error ? actionError.message : "Publishing update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function refreshScript(view: PublishWorkflowView) {
    const topic = year1MathsTopics.find((item) => item.id === view.topicId);
    if (!topic) return;
    const preview = buildScriptPreviewBundle(topic);
    const now = new Date().toISOString();
    setBusy(true);
    try {
      if (liveMode && credentials) {
        await persistEntry(topic.id, {
          topicId: topic.id,
          scriptGeneratedAt: now,
          scriptHashAtGeneration: preview.hash,
          scriptApprovedAt: undefined,
          scriptApprovalNote: undefined,
          videoGeneratedAt: undefined,
          videoGeneratedHash: undefined,
          videoApprovedAt: undefined,
          videoApprovalNote: undefined,
          finalCheckedAt: undefined,
          finalCheckNote: undefined,
        });
      } else {
        setReleaseStore((current) => ({
          ...current,
          entries: {
            ...current.entries,
            [topic.id]: {
              ...current.entries[topic.id],
              topicId: topic.id,
              scriptGeneratedAt: now,
              scriptHashAtGeneration: preview.hash,
            },
          },
        }));
      }
      downloadJson(`script-preview-${topic.id}.json`, preview.scriptJson);
      setMessage(`Regenerated script for ${view.shortTitle} (${preview.hash.slice(0, 8)}…).`);
    } catch (refreshError) {
      setMessage(refreshError instanceof Error ? refreshError.message : "Could not refresh script.");
    } finally {
      setBusy(false);
    }
  }

  async function chooseCandidate(topicId: string, shortTitle: string) {
    setBusy(true);
    try {
      if (liveMode && credentials) {
        await setRemoteActiveCandidate(credentials, topicId);
        await refresh();
      } else {
        const now = new Date().toISOString();
        setReleaseStore((current) => ({
          activeCandidateId: topicId,
          entries: {
            ...current.entries,
            [topicId]: { ...current.entries[topicId], topicId, candidateSince: current.entries[topicId]?.candidateSince ?? now },
          },
        }));
      }
      setExpandedId(topicId);
      setMessage(`Set ${shortTitle} as the active candidate.`);
    } catch (candidateError) {
      setMessage(candidateError instanceof Error ? candidateError.message : "Could not set candidate.");
    } finally {
      setBusy(false);
    }
  }

  async function markVideoReady(view: PublishWorkflowView) {
    const note = window.prompt("Confirm video rehearsal/render is ready", "Watched rehearsal pass");
    if (!note?.trim() || !view.scriptHash) return;
    const now = new Date().toISOString();
    setBusy(true);
    try {
      if (liveMode && credentials) {
        await persistEntry(view.topicId, {
          topicId: view.topicId,
          videoGeneratedAt: now,
          videoGeneratedHash: view.scriptHash,
          videoRecheckedAt: now,
          videoRecheckNote: note.trim(),
        });
      } else {
        setReleaseStore((current) => ({
          ...current,
          entries: {
            ...current.entries,
            [view.topicId]: {
              ...current.entries[view.topicId],
              topicId: view.topicId,
              videoGeneratedAt: now,
              videoGeneratedHash: view.scriptHash,
              videoRecheckedAt: now,
              videoRecheckNote: note.trim(),
            },
          },
        }));
      }
      setMessage(`Marked video ready for ${view.shortTitle}. Approve video when satisfied.`);
    } catch (videoError) {
      setMessage(videoError instanceof Error ? videoError.message : "Could not mark video ready.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6 rounded-2xl border border-rule bg-white/70 p-5">
      <div>
        <h3 className="font-semibold text-ink">Publishing pipeline</h3>
        <p className="mt-2 max-w-3xl text-sm text-ink-soft">
          One pack at a time: approve the lesson (auto-generates a script), approve the script (queues video
          generation), approve the video, final check, then release live. When maintainer access is unlocked, state
          syncs to Supabase and the public lesson list polls every 30 seconds — no redeploy needed for release or
          suspend. Pending pack learning revisions appear on each lesson tile with live accept/decline when unlocked.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          {liveMode ? (
            <>
              <span className="font-semibold text-teal">Live via Supabase</span>
              {lastFetchedAt ? ` · publishing synced ${new Date(lastFetchedAt).toLocaleTimeString("en-GB")}` : ""}
              {revisionsFetchedAt
                ? ` · revisions synced ${new Date(revisionsFetchedAt).toLocaleTimeString("en-GB")}`
                : ""}
              {loading || revisionsLoading ? " · refreshing…" : ""}
            </>
          ) : (
            <span>Offline mode — unlock maintainer access below the tabs to sync live.</span>
          )}
          {" · "}
          Active candidate: <strong className="text-ink">{activeCandidate?.shortTitle ?? "none"}</strong> · {liveCount}{" "}
          live · {inProgress.length} in progress
        </p>
      </div>

      {error || revisionError ? (
        <p className="rounded-2xl border border-clay/30 bg-[#f6e4e0] px-4 py-3 text-sm text-ink">
          {error || revisionError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 text-sm">
        <button type="button" className="rounded-full border border-rule px-4 py-2 hover:border-teal" onClick={exportPackRelease}>
          Export pack-release.json
        </button>
        {!liveMode ? (
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
        ) : (
          <button type="button" className="underline decoration-rule" disabled={loading} onClick={() => void refresh()}>
            Refresh from Supabase
          </button>
        )}
      </div>

      {message ? <p className="rounded-2xl bg-[#e5efe8] px-4 py-3 text-sm text-ink">{message}</p> : null}

      <div className="space-y-4">
        {workflows.map((view) => {
          const expanded = expandedId === view.topicId;
          const topicRevisions = byTopic.get(view.topicId) ?? [];
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

              <LessonRevisionPanel
                revisions={topicRevisions}
                compact={!expanded}
                liveMode={revisionsLiveMode}
                busyRevisionId={busyRevisionId}
                onDecide={decideRevision}
              />

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
                </dl>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                {!view.isActiveCandidate && view.stage !== "live" && view.stage !== "suspended" ? (
                  <button
                    type="button"
                    disabled={busy}
                    className="rounded-full border border-rule px-3 py-1.5 hover:border-teal disabled:opacity-60"
                    onClick={() => void chooseCandidate(view.topicId, view.shortTitle)}
                  >
                    Set candidate
                  </button>
                ) : null}
                <Link href={`/maintenance/?tab=script&topic=${view.topicId}`} className="rounded-full border border-rule px-3 py-1.5 hover:border-teal">
                  Open script
                </Link>
                <Link href={`/year-1-maths/${view.topicId}`} className="rounded-full border border-rule px-3 py-1.5 hover:border-teal">
                  Open lesson
                </Link>
                {view.scriptStale || (view.entry?.scriptGeneratedAt && view.stage === "script_review") ? (
                  <button type="button" disabled={busy} className="underline decoration-rule" onClick={() => void refreshScript(view)}>
                    Refresh script
                  </button>
                ) : null}
                {view.nextAction ? (
                  <button
                    type="button"
                    disabled={busy}
                    className="rounded-full bg-teal px-4 py-1.5 font-semibold text-white hover:bg-teal-deep disabled:opacity-60"
                    onClick={() => void runAction(view, view.nextAction!)}
                  >
                    {publishActionLabel(view.nextAction)}
                  </button>
                ) : null}
                {view.stage === "video_pending" && !view.entry?.videoGeneratedAt ? (
                  <>
                    <span className="self-center text-xs text-ink-soft">Waiting for video pipeline…</span>
                    <button type="button" disabled={busy} className="underline decoration-rule" onClick={() => void markVideoReady(view)}>
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
