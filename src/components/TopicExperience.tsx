"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Topic } from "@/content/schema";
import { emptyProgress, readProgress, writeProgress, type TopicProgress } from "@/lib/progress";
import { DraftBadge } from "./DraftBadge";
import { HomePack } from "./HomePack";
import { ParentBriefing } from "./ParentBriefing";

export function TopicExperience({ topic }: { topic: Topic }) {
  const [progress, setProgress] = useState<TopicProgress>(emptyProgress);
  const [readyChecked, setReadyChecked] = useState(false);
  const [showPack, setShowPack] = useState(false);

  useEffect(() => {
    const stored = readProgress(topic.slug);
    setProgress(stored);
    setReadyChecked(stored.briefingDone);
    setShowPack(stored.packOpened);
  }, [topic.slug]);

  function openPack(fromBriefing: boolean) {
    const next = writeProgress(topic.slug, {
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
    <article>
      <p className="no-print mb-6 text-sm">
        <Link href="/year-1-maths" className="text-teal hover:underline">
          ← All Year 1 maths topics
        </Link>
      </p>

      <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        <DraftBadge status={topic.reviewStatus} />
        <span>
          {topic.parentMinutes} min for you · {topic.homeMinutes} min together
        </span>
        {topic.readyToProgress.length > 0 ? (
          <span>Ready-to-progress {topic.readyToProgress.join(", ")}</span>
        ) : null}
      </div>

      <h1 className="serif mt-4 text-4xl leading-tight text-ink sm:text-5xl">{topic.title}</h1>
      <p className="mt-4 text-xl leading-8 text-ink-soft">{topic.summary}</p>
      <p className="mt-4 text-lg leading-8 text-ink">{topic.whyThisMatters}</p>

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
        <p className="mt-2 text-ink-soft">Read this before you sit down with your child. No special kit.</p>
        <div className="mt-8">
          <ParentBriefing topic={topic} />
        </div>

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
            <div>
              <h2 className="serif text-3xl text-ink">Stage 2 · Tonight with your child</h2>
              <p className="mt-2 text-ink-soft">One activity. Household things. A clear stop rule.</p>
            </div>
            <Link
              href={`/year-1-maths/${topic.slug}/pack`}
              className="no-print rounded-full border border-rule px-4 py-2 text-sm hover:border-teal"
            >
              Open print-friendly pack
            </Link>
          </div>
          <div className="mt-8">
            <HomePack topic={topic} />
          </div>
        </section>
      ) : null}

      <aside className="no-print mt-16 text-sm leading-6 text-ink-soft">
        <h2 className="font-semibold text-ink">Sources</h2>
        <ul className="mt-2 space-y-2">
          {topic.sources.map((source) => (
            <li key={source.url}>
              <a className="underline decoration-rule underline-offset-2 hover:text-teal" href={source.url}>
                {source.label}
              </a>
              {" — "}
              {source.note}
            </li>
          ))}
        </ul>
        {topic.statutoryOutcomes.length > 0 ? (
          <div className="mt-4">
            <p className="font-semibold text-ink">Statutory outcomes this pack supports</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {topic.statutoryOutcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </aside>
    </article>
  );
}
