"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NoteSendActions } from "@/components/NoteSendActions";
import { readLanguageLog, SECTION_LABEL, updateLanguageNote, type LanguageNote } from "@/lib/language-log";

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
          <p className="mt-2 text-ink-soft">Use the button at the bottom of any lesson tab.</p>
        </li>
        <li className="rounded-2xl bg-white/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">2. Keep the note</p>
          <p className="mt-2 text-ink-soft">Send to the team stores it for review. Share or copy still works with no GitHub.</p>
        </li>
        <li className="rounded-2xl bg-white/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">3. Rewrite</p>
          <p className="mt-2 text-ink-soft">Edit the topic file, ship the clearer sentence, mark the note done.</p>
        </li>
      </ol>

      <p className="text-sm text-ink-soft">
        Testers do not need a GitHub account. Send to the team stores the note for review and a lesson rewrite.
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
      <div className="mt-4 space-y-3">
        <NoteSendActions note={note} />
        <div className="flex flex-wrap gap-3 text-sm">
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
      </div>
    </article>
  );
}
