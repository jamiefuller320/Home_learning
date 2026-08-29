"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { glossaryTerms } from "@/content/glossary";
import { year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";
import type { GlossaryTerm } from "@/content/schema";

function initialLetter(term: string): string {
  const letter = term.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(letter) ? letter : "#";
}

/**
 * Alphabetical glossary index: letter rail + term names.
 * Cards open on request (one at a time), matching the School Compass reveal pattern.
 */
export function GlossaryIndex({
  initialTermId,
  revealOnly = false,
  termIds,
}: {
  /** Open this card when the page loads (e.g. hash deep link). */
  initialTermId?: string;
  /** When true, only list the given term ids (lesson-scoped peek). */
  revealOnly?: boolean;
  termIds?: string[];
}) {
  const sortedTerms = useMemo(() => {
    const source =
      termIds && termIds.length > 0
        ? glossaryTerms.filter((term) => termIds.includes(term.id))
        : glossaryTerms;
    return [...source].sort((a, b) => a.term.localeCompare(b.term, "en-GB"));
  }, [termIds]);

  const letters = useMemo(() => {
    const set = new Set(sortedTerms.map((term) => initialLetter(term.term)));
    return [...set].sort((a, b) => a.localeCompare(b, "en-GB"));
  }, [sortedTerms]);

  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(initialTermId ?? null);

  useEffect(() => {
    if (!initialTermId) return;
    setOpenId(initialTermId);
    const match = sortedTerms.find((term) => term.id === initialTermId);
    if (match) setActiveLetter(initialLetter(match.term));
  }, [initialTermId, sortedTerms]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function applyHash() {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      const match = sortedTerms.find((term) => term.id === id);
      if (!match) return;
      setOpenId(match.id);
      setActiveLetter(initialLetter(match.term));
    }
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [sortedTerms]);

  const letterFilter = activeLetter ?? letters[0] ?? "A";
  const visibleTerms = sortedTerms.filter((term) => initialLetter(term.term) === letterFilter);
  const openTerm = openId ? sortedTerms.find((term) => term.id === openId) : null;

  return (
    <div className="glossary-index">
      {!revealOnly ? (
        <>
          <p className="text-ink-soft leading-7">
            Browse by letter, then open a card when you want the plain-English meaning. In a lesson, dotted
            underlines do the same thing in place.
          </p>
          <div className="glossary-letter-rail" role="tablist" aria-label="Glossary letters">
            {letters.map((letter) => {
              const selected = letter === letterFilter;
              return (
                <button
                  key={letter}
                  type="button"
                  role="tab"
                  className={selected ? "glossary-letter-btn is-active" : "glossary-letter-btn"}
                  aria-selected={selected}
                  onClick={() => {
                    setActiveLetter(letter);
                    setOpenId(null);
                  }}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <p className="text-ink-soft leading-7">Words used in this lesson — tap one to open its card.</p>
      )}

      <ul className="glossary-term-list" aria-label={`Terms starting with ${letterFilter}`}>
        {(revealOnly ? sortedTerms : visibleTerms).map((term) => {
          const selected = term.id === openId;
          return (
            <li key={term.id}>
              <button
                type="button"
                className={selected ? "glossary-term-btn is-active" : "glossary-term-btn"}
                aria-expanded={selected}
                aria-controls={`glossary-card-${term.id}`}
                onClick={() => setOpenId(selected ? null : term.id)}
              >
                {term.term}
              </button>
            </li>
          );
        })}
      </ul>

      {openTerm ? <GlossaryCard term={openTerm} /> : null}
    </div>
  );
}

function GlossaryCard({ term }: { term: GlossaryTerm }) {
  const relatedTopics = (term.relatedTopics ?? [])
    .map((topicId) => year1MathsTopics.find((topic) => topic.id === topicId))
    .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic));

  const seeAlsoTerms = (term.seeAlso ?? [])
    .map((termId) => glossaryTerms.find((entry) => entry.id === termId))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return (
    <article
      id={`glossary-card-${term.id}`}
      className="glossary-card scroll-mt-24"
      aria-live="polite"
    >
      <header className="glossary-card-head">
        <h3 className="serif text-2xl text-ink">{term.term}</h3>
      </header>
      <p className="mt-3 text-lg leading-8 text-ink-soft">{term.plainEnglish}</p>

      {seeAlsoTerms.length > 0 ? (
        <p className="mt-4 text-sm text-ink-soft">
          See also{" "}
          {seeAlsoTerms.map((related, index) => (
            <span key={related.id}>
              {index > 0 ? (index === seeAlsoTerms.length - 1 ? " and " : ", ") : null}
              <Link href={`/year-1-maths/glossary#${related.id}`} className="font-medium text-teal hover:underline">
                {related.term}
              </Link>
            </span>
          ))}
        </p>
      ) : null}

      {relatedTopics.length > 0 ? (
        <p className="mt-2 text-sm text-ink-soft">
          Used in{" "}
          {relatedTopics.map((topic, index) => (
            <span key={topic.id}>
              {index > 0 ? (index === relatedTopics.length - 1 ? " and " : ", ") : null}
              <Link
                href={`/year-1-maths/${topic.slug}`}
                prefetch={false}
                className="font-medium text-teal hover:underline"
              >
                {topic.shortTitle}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
    </article>
  );
}
