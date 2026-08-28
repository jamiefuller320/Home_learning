"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { STAGE_1_META, STAGE_2_META, StageMetaBox } from "@/components/StageMetaBox";
import { emptyProgress, readProgress, writeProgress, type TopicProgress } from "@/lib/progress";

export function TopicStageFlow({
  slug,
  printPackHref,
  briefing,
  homePack,
}: {
  slug: string;
  printPackHref: string;
  briefing: ReactNode;
  homePack: ReactNode;
}) {
  const [progress, setProgress] = useState<TopicProgress>(emptyProgress);
  const [readyChecked, setReadyChecked] = useState(false);
  const [showPack, setShowPack] = useState(false);

  useEffect(() => {
    const stored = readProgress(slug);
    setProgress(stored);
    setReadyChecked(stored.briefingDone);
    setShowPack(stored.packOpened);
  }, [slug]);

  function openPack(fromBriefing: boolean) {
    const next = writeProgress(slug, {
      briefingDone: fromBriefing ? true : progress.briefingDone,
      packOpened: true,
    });
    setProgress(next);
    setShowPack(true);
    window.setTimeout(() => {
      document.getElementById("home-pack")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <>
      <ol className="no-print mt-8 grid gap-3 sm:grid-cols-2">
        <li className="rounded-2xl bg-teal px-5 py-4 text-white">
          <p className="text-xs uppercase tracking-[0.16em] text-white/70">Stage 1</p>
          <p className="serif mt-1 text-2xl">Teach yourself the idea</p>
        </li>
        <li className={`rounded-2xl px-5 py-4 ${showPack ? "bg-teal text-white" : "bg-paper-deep text-ink-soft"}`}>
          <p className={`text-xs uppercase tracking-[0.16em] ${showPack ? "text-white/70" : "text-ink-soft"}`}>
            Stage 2
          </p>
          <p className="serif mt-1 text-2xl">A small pack at home</p>
        </li>
      </ol>

      <section className="mt-12">
        <h2 className="serif text-3xl text-ink">Stage 1 · For you first</h2>
        <StageMetaBox {...STAGE_1_META} />
        <div className="mt-8">{briefing}</div>

        <form
          className="no-print mt-8 rounded-2xl border border-rule bg-white/80 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!readyChecked) return;
            openPack(true);
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
            Continue to the home pack
          </button>
          <p className="mt-3 text-sm text-ink-soft">
            In a hurry?{" "}
            <button
              type="button"
              className="underline decoration-rule underline-offset-2 hover:text-teal"
              onClick={() => openPack(false)}
            >
              Skip to the pack
            </button>{" "}
            — you will be more useful if you read Stage 1 first.
          </p>
        </form>
      </section>

      {showPack ? (
        <section id="home-pack" className="mt-16 border-t border-rule pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="serif text-3xl text-ink">Stage 2 · Tonight with your child</h2>
            <Link
              href={printPackHref}
              prefetch={false}
              className="no-print rounded-full border border-rule px-4 py-2 text-sm hover:border-teal"
            >
              Open print-friendly pack
            </Link>
          </div>
          <StageMetaBox {...STAGE_2_META} />
          <div className="mt-8">{homePack}</div>
        </section>
      ) : null}
    </>
  );
}
