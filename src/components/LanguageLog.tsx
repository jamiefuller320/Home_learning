"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  buildGitHubIssueUrl,
  GITHUB_REPO,
  readLanguageLog,
  SECTION_LABEL,
  updateLanguageNote,
  type LanguageNote,
} from "@/lib/language-log";

export function LanguageLog() {
  const [notes, setNotes] = useState<LanguageNote[]>([]);

  useEffect(() => {
    setNotes(readLanguageLog());
  }, []);

  const openNotes = notes.filter((note) => note.status === "open");
  const doneNotes = notes.filter((note) => note.status === "done");

  return (
    <div className="space-y-10">
      <ol className="grid gap-3 sm:grid-cols-3">
        <li className="rounded-2xl bg-white/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">1. Flag</p>
          <p className="mt-2 text-ink-soft">Use the button at the end of a parent briefing or home pack.</p>
        </li>
        <li className="rounded-2xl bg-white/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">2. Keep the note</p>
          <p className="mt-2 text-ink-soft">It lands here on this device, and can open a GitHub issue.</p>
        </li>
        <li className="rounded-2xl bg-white/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">3. Rewrite</p>
          <p className="mt-2 text-ink-soft">Edit the topic file, ship the clearer sentence, mark the note done.</p>
        </li>
      </ol>

      <p className="text-sm text-ink-soft">
        Open issues in the repo:{" "}
        <a
          className="underline decoration-rule underline-offset-2 hover:text-teal"
          href={`https://github.com/${GITHUB_REPO}/issues?q=is%3Aissue+label%3Alanguage`}
        >
          label “language”
        </a>
        . Notes below stay in this browser until you clear site data.
      </p>

      <section>
        <h2 className="serif text-3xl text-ink">Open notes ({openNotes.length})</h2>
        {openNotes.length === 0 ? (
          <p className="mt-3 text-ink-soft">
            Nothing waiting. Open a topic and use “I don’t understand something in this section”.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {openNotes.map((note) => (
              <LanguageNoteCard
                key={note.id}
                note={note}
                onDone={() => setNotes(updateLanguageNote(note.id, { status: "done" }))}
              />
            ))}
          </div>
        )}
      </section>

      {doneNotes.length > 0 ? (
        <section>
          <h2 className="serif text-3xl text-ink">Done ({doneNotes.length})</h2>
          <div className="mt-4 space-y-4">
            {doneNotes.map((note) => (
              <LanguageNoteCard
                key={note.id}
                note={note}
                onOpen={() => setNotes(updateLanguageNote(note.id, { status: "open" }))}
              />
            ))}
          </div>
        </section>
      ) : null}

      <p>
        <Link href="/year-1-maths" className="font-semibold text-teal hover:underline">
          Back to Year 1 maths →
        </Link>
      </p>
    </div>
  );
}

function LanguageNoteCard({
  note,
  onDone,
  onOpen,
}: {
  note: LanguageNote;
  onDone?: () => void;
  onOpen?: () => void;
}) {
  return (
    <article className="rounded-2xl border border-rule bg-white/70 p-5">
      <p className="text-sm text-ink-soft">
        {note.topicTitle} · {SECTION_LABEL[note.section]}
      </p>
      <p className="mt-3 text-lg text-ink">{note.unclear}</p>
      {note.clearer ? (
        <p className="mt-2 text-ink-soft">
          <span className="font-semibold text-ink">Clearer: </span>
          {note.clearer}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <a
          href={buildGitHubIssueUrl(note)}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-teal px-4 py-2 font-semibold text-white hover:bg-teal-deep"
        >
          Open GitHub issue
        </a>
        <Link href={`/year-1-maths/${note.topicId}`} className="rounded-full border border-rule px-4 py-2 hover:border-teal">
          Open topic
        </Link>
        {onDone ? (
          <button type="button" className="underline decoration-rule" onClick={onDone}>
            Mark done
          </button>
        ) : null}
        {onOpen ? (
          <button type="button" className="underline decoration-rule" onClick={onOpen}>
            Reopen
          </button>
        ) : null}
      </div>
    </article>
  );
}
