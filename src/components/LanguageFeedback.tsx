"use client";

import Link from "next/link";
import { useState } from "react";
import { NoteSendActions } from "@/components/NoteSendActions";
import type { Topic } from "@/content/schema";
import {
  addLanguageNote,
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
    return (
      <div className="no-print rounded-2xl border border-teal/30 bg-white/80 p-5">
        <p className="font-semibold text-ink">Note saved on this device.</p>
        <div className="mt-3">
          <NoteSendActions note={saved} autoSend />
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/language" className="text-teal underline">
            View language log
          </Link>
          <button type="button" className="text-ink-soft underline" onClick={() => setSaved(null)}>
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
        {SECTION_LABEL[section]}. No GitHub account needed — send it to the team, or share/copy.
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
            Send this note
          </button>
        </form>
      ) : null}
    </div>
  );
}
