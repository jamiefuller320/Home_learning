"use client";

import Link from "next/link";
import { useState } from "react";
import type { Topic } from "@/content/schema";
import {
  addLanguageNote,
  buildGitHubIssueUrl,
  createNoteId,
  SECTION_LABEL,
  type LanguageNote,
  type LanguageSection,
} from "@/lib/language-log";

export function LanguageFeedback({ topic, section }: { topic: Topic; section: LanguageSection }) {
  const [open, setOpen] = useState(false);
  const [unclear, setUnclear] = useState("");
  const [clearer, setClearer] = useState("");
  const [saved, setSaved] = useState<LanguageNote | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = unclear.trim();
    if (!trimmed) return;

    const note: LanguageNote = {
      id: createNoteId(),
      createdAt: new Date().toISOString(),
      topicId: topic.id,
      topicTitle: topic.title,
      section,
      unclear: trimmed,
      clearer: clearer.trim(),
      pagePath: window.location.href,
      status: "open",
    };

    addLanguageNote(note);
    setSaved(note);
    setUnclear("");
    setClearer("");
  }

  if (saved) {
    const issueUrl = buildGitHubIssueUrl(saved);
    return (
      <div className="no-print rounded-2xl border border-teal/30 bg-white/80 p-5">
        <p className="font-semibold text-ink">Saved to the language log.</p>
        <p className="mt-2 text-ink-soft">
          Next: open a GitHub issue so we can rewrite this on the next pass, or keep collecting notes
          in the log.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={issueUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-teal px-4 py-2 font-semibold text-white hover:bg-teal-deep"
          >
            Open GitHub issue
          </a>
          <Link href="/language" className="rounded-full border border-rule px-4 py-2 hover:border-teal">
            View language log
          </Link>
          <button type="button" className="text-sm text-ink-soft underline" onClick={() => setSaved(null)}>
            Add another note
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="no-print rounded-2xl border border-dashed border-rule p-5">
      <button
        type="button"
        className="text-left font-semibold text-teal hover:underline"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        I don’t understand something in this section
      </button>
      <p className="mt-1 text-sm text-ink-soft">
        {SECTION_LABEL[section]}. Flag a phrase now so we can rewrite it.
      </p>
      {open ? (
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="font-semibold text-ink">What didn’t make sense?</span>
            <textarea
              required
              value={unclear}
              onChange={(event) => setUnclear(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-rule bg-white p-3 text-ink"
              placeholder="Quote the words, or say what you could not picture."
            />
          </label>
          <label className="block">
            <span className="font-semibold text-ink">A clearer way to say it (optional)</span>
            <textarea
              value={clearer}
              onChange={(event) => setClearer(event.target.value)}
              rows={2}
              className="mt-2 w-full rounded-xl border border-rule bg-white p-3 text-ink"
              placeholder="A sentence a tired parent would understand."
            />
          </label>
          <button type="submit" className="rounded-full bg-teal px-4 py-2 font-semibold text-white hover:bg-teal-deep">
            Save to the language log
          </button>
        </form>
      ) : null}
    </div>
  );
}
