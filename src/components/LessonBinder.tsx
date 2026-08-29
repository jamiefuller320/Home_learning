"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BinderContinue } from "@/components/BinderContinue";
import { BinderTabs, type BinderTabItem } from "@/components/BinderTabs";
import { GlossaryIndex } from "@/components/GlossaryIndex";
import { STAGE_1_META, STAGE_2_META, StageMetaBox } from "@/components/StageMetaBox";
import { emptyProgress, readProgress, writeProgress, type TopicProgress } from "@/lib/progress";

export type LessonTabId = "summary" | "parent" | "tasks" | "check";

const LESSON_TAB_ORDER: LessonTabId[] = ["summary", "parent", "tasks", "check"];

const LESSON_TAB_META: Record<
  LessonTabId,
  { label: string; shortLabel: string; step: number; head: string; blurb: string }
> = {
  summary: {
    label: "Lesson summary",
    shortLabel: "Summary",
    step: 1,
    head: "Lesson summary",
    blurb: "What this pack covers and why it matters tonight.",
  },
  parent: {
    label: "Parent lesson",
    shortLabel: "Parent",
    step: 2,
    head: "Parent lesson",
    blurb: "Teach yourself the idea before you sit down together.",
  },
  tasks: {
    label: "Tasks",
    shortLabel: "Tasks",
    step: 3,
    head: "Tasks",
    blurb: "One short activity using household things.",
  },
  check: {
    label: "Understanding check",
    shortLabel: "Check",
    step: 4,
    head: "Understanding check",
    blurb: "Three tiny looks at whether the idea landed.",
  },
};

const NEXT_LABEL: Partial<Record<LessonTabId, string>> = {
  summary: "Continue to parent lesson",
  parent: "Continue to tasks",
  tasks: "Continue to understanding check",
};

/**
 * Subordinate binder for one lesson — Summary → Parent → Tasks → Check,
 * with Continue buttons that advance the sequence.
 */
export function LessonBinder({
  slug,
  printPackHref,
  glossaryTermIds,
  summary,
  parentLesson,
  tasks,
  check,
}: {
  slug: string;
  printPackHref: string;
  glossaryTermIds: string[];
  summary: ReactNode;
  parentLesson: ReactNode;
  tasks: ReactNode;
  check: ReactNode;
}) {
  const [progress, setProgress] = useState<TopicProgress>(emptyProgress);
  const [readyChecked, setReadyChecked] = useState(false);
  const [activeId, setActiveId] = useState<LessonTabId>("summary");
  const [visited, setVisited] = useState<Record<LessonTabId, boolean>>({
    summary: true,
    parent: false,
    tasks: false,
    check: false,
  });

  useEffect(() => {
    const stored = readProgress(slug);
    setProgress(stored);
    setReadyChecked(stored.briefingDone);
    setVisited((prev) => ({
      ...prev,
      parent: stored.briefingDone || prev.parent,
      tasks: stored.packOpened || prev.tasks,
      check: stored.packOpened || prev.check,
    }));
    if (stored.packOpened) {
      setActiveId("tasks");
    } else if (stored.briefingDone) {
      setActiveId("parent");
    } else {
      setActiveId("summary");
    }
  }, [slug]);

  const items: BinderTabItem<LessonTabId>[] = useMemo(
    () =>
      LESSON_TAB_ORDER.map((id) => ({
        id,
        label: LESSON_TAB_META[id].label,
        shortLabel: LESSON_TAB_META[id].shortLabel,
        step: LESSON_TAB_META[id].step,
        done: Boolean(visited[id]) && activeId !== id,
        title: LESSON_TAB_META[id].blurb,
      })),
    [activeId, visited],
  );

  function goTo(id: LessonTabId, opts?: { markBriefingDone?: boolean; openPack?: boolean }) {
    setVisited((prev) => ({ ...prev, [id]: true }));
    setActiveId(id);

    const patch: Partial<TopicProgress> = {};
    if (opts?.markBriefingDone) patch.briefingDone = true;
    if (opts?.openPack) patch.packOpened = true;
    if (Object.keys(patch).length > 0) {
      const next = writeProgress(slug, patch);
      setProgress(next);
      if (patch.briefingDone) setReadyChecked(true);
    }

    window.setTimeout(() => {
      document.getElementById("lesson-binder")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  }

  const meta = LESSON_TAB_META[activeId];

  let body: ReactNode;
  if (activeId === "summary") {
    body = (
      <>
        {summary}
        {glossaryTermIds.length > 0 ? (
          <div className="mt-10 border-t border-rule pt-8">
            <h3 className="serif text-2xl text-ink">Words in this lesson</h3>
            <div className="mt-4">
              <GlossaryIndex revealOnly termIds={glossaryTermIds} />
            </div>
          </div>
        ) : null}
        <BinderContinue label={NEXT_LABEL.summary!} onClick={() => goTo("parent")} />
      </>
    );
  } else if (activeId === "parent") {
    body = (
      <>
        <StageMetaBox {...STAGE_1_META} />
        <div className="mt-8">{parentLesson}</div>
        <form
          className="no-print mt-8 rounded-2xl border border-rule bg-white/80 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!readyChecked) return;
            goTo("tasks", { markBriefingDone: true, openPack: true });
          }}
        >
          <label className="flex items-start gap-3 text-lg text-ink">
            <input
              type="checkbox"
              className="mt-1 size-5 accent-teal"
              checked={readyChecked}
              onChange={(event) => setReadyChecked(event.target.checked)}
            />
            I can explain this in my own words, including one thing to say and one thing to avoid.
          </label>
          <button
            type="submit"
            disabled={!readyChecked}
            className="mt-4 inline-flex rounded-full bg-teal px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-rule"
          >
            {NEXT_LABEL.parent}
          </button>
          <p className="mt-3 text-sm text-ink-soft">
            In a hurry?{" "}
            <button
              type="button"
              className="underline decoration-rule underline-offset-2 hover:text-teal"
              onClick={() => goTo("tasks", { openPack: true })}
            >
              Skip to tasks
            </button>{" "}
            — you will be more useful if you read the parent lesson first.
          </p>
        </form>
      </>
    );
  } else if (activeId === "tasks") {
    body = (
      <>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <StageMetaBox {...STAGE_2_META} className="mt-0 flex-1" />
          <Link
            href={printPackHref}
            prefetch={false}
            className="no-print rounded-full border border-rule px-4 py-2 text-sm hover:border-teal"
          >
            Open print-friendly pack
          </Link>
        </div>
        <div className="mt-8">{tasks}</div>
        <BinderContinue
          label={NEXT_LABEL.tasks!}
          onClick={() => goTo("check", { openPack: true })}
        />
      </>
    );
  } else {
    body = (
      <>
        <div className="mt-2">{check}</div>
        {progress.briefingDone ? (
          <p className="no-print mt-8 text-sm text-ink-soft">
            Briefing marked ready on this device. You can revisit any tab above anytime.
          </p>
        ) : null}
      </>
    );
  }

  return (
    <div id="lesson-binder" className="scroll-mt-6">
      <BinderTabs
        className="lesson-section-binder"
        tone="paper"
        ariaLabel="Lesson sections"
        items={items}
        activeId={activeId}
        onChange={(id) => goTo(id, id === "tasks" || id === "check" ? { openPack: true } : undefined)}
        sheetHeader={
          <header className="binder-sheet-head">
            <h3>{meta.head}</h3>
            <p>{meta.blurb}</p>
          </header>
        }
        sheet={body}
      />
    </div>
  );
}
