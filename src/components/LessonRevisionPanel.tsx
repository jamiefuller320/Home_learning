"use client";

import type { ProposedRevision } from "@/lib/learning-revisions";

type LessonRevisionPanelProps = {
  revisions: ProposedRevision[];
  compact?: boolean;
  liveMode: boolean;
  busyRevisionId: string | null;
  onDecide: (revision: ProposedRevision, decision: "accepted" | "declined") => void | Promise<void>;
};

function RevisionActions({
  revision,
  liveMode,
  busyRevisionId,
  onDecide,
}: {
  revision: ProposedRevision;
  liveMode: boolean;
  busyRevisionId: string | null;
  onDecide: LessonRevisionPanelProps["onDecide"];
}) {
  const busy = busyRevisionId === revision.id;
  return (
    <div className="flex shrink-0 flex-wrap gap-2">
      <button
        type="button"
        disabled={busy}
        className="rounded-full bg-teal px-3 py-1 text-xs font-semibold text-white hover:bg-teal-deep disabled:opacity-60"
        onClick={() => void onDecide(revision, "accepted")}
      >
        {busy ? "Saving…" : "Accept"}
      </button>
      <button
        type="button"
        disabled={busy}
        className="rounded-full border border-rule px-3 py-1 text-xs font-semibold hover:border-clay disabled:opacity-60"
        onClick={() => void onDecide(revision, "declined")}
      >
        Decline
      </button>
      {!liveMode ? (
        <span className="self-center text-[10px] uppercase tracking-[0.12em] text-ink-soft">local</span>
      ) : null}
    </div>
  );
}

export function LessonRevisionPanel({
  revisions,
  compact = false,
  liveMode,
  busyRevisionId,
  onDecide,
}: LessonRevisionPanelProps) {
  if (revisions.length === 0) return null;

  if (compact) {
    return (
      <div className="mt-3 space-y-2 rounded-xl border border-amber-300/50 bg-amber-50/70 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-900/80">
          {revisions.length} pending learning revision{revisions.length === 1 ? "" : "s"}
        </p>
        <ul className="space-y-2">
          {revisions.map((revision) => (
            <li key={revision.id} className="flex flex-wrap items-start justify-between gap-2 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{revision.learningTitle}</p>
                <p className="mt-1 text-xs text-ink-soft">{revision.rationale}</p>
              </div>
              <RevisionActions
                revision={revision}
                liveMode={liveMode}
                busyRevisionId={busyRevisionId}
                onDecide={onDecide}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
        Pending learning revisions ({revisions.length})
      </p>
      {revisions.map((revision) => (
        <article key={revision.id} className="rounded-xl border border-rule bg-white/80 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
                <span className="text-teal">{revision.kind}</span>
                <span className="text-ink-soft">·</span>
                <span className="text-ink-soft">{revision.learningTitle}</span>
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                <code>{revision.fieldPath}</code>
              </p>
              <p className="mt-2 text-sm text-ink-soft">{revision.rationale}</p>
            </div>
            <RevisionActions
              revision={revision}
              liveMode={liveMode}
              busyRevisionId={busyRevisionId}
              onDecide={onDecide}
            />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-[#f6e4e0] p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-clay">Before</p>
              <p className="mt-1 text-xs text-ink">{revision.before}</p>
            </div>
            <div className="rounded-lg bg-[#e5efe8] p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sage">After</p>
              <p className="mt-1 text-xs text-ink">{revision.after}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
