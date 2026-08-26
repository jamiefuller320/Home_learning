import Link from "next/link";
import type { Metadata } from "next";
import { glossaryTerms } from "@/content/glossary";
import { year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";

export const metadata: Metadata = {
  title: "Maths glossary",
  description: "Plain-English definitions for classroom maths words used in the Year 1 packs.",
};

export default function MathsGlossaryPage() {
  const sortedTerms = [...glossaryTerms].sort((a, b) => a.term.localeCompare(b.term, "en-GB"));

  return (
    <div>
      <p className="text-sm">
        <Link href="/year-1-maths" className="text-teal hover:underline">
          ← All Year 1 maths topics
        </Link>
      </p>
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-teal">
        England · KS1 · Year 1
      </p>
      <h1 className="serif mt-3 text-4xl text-ink sm:text-5xl">Maths glossary</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
        Key terms from school, in words you can use at the kitchen table. Tap a dotted underline in any briefing to
        peek at a definition, or browse here.
      </p>

      <dl className="mt-10 space-y-8">
        {sortedTerms.map((entry) => {
          const relatedTopics = (entry.relatedTopics ?? [])
            .map((topicId) => year1MathsTopics.find((topic) => topic.id === topicId))
            .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic));

          const seeAlsoTerms = (entry.seeAlso ?? [])
            .map((termId) => glossaryTerms.find((term) => term.id === termId))
            .filter((term): term is NonNullable<typeof term> => Boolean(term));

          return (
            <div key={entry.id} id={entry.id} className="scroll-mt-24 rounded-2xl border border-rule bg-white/70 p-5">
              <dt className="serif text-2xl text-ink">{entry.term}</dt>
              <dd className="mt-3 text-lg leading-8 text-ink-soft">{entry.plainEnglish}</dd>

              {seeAlsoTerms.length > 0 ? (
                <p className="mt-4 text-sm text-ink-soft">
                  See also{" "}
                  {seeAlsoTerms.map((related, index) => (
                    <span key={related.id}>
                      {index > 0 ? (index === seeAlsoTerms.length - 1 ? " and " : ", ") : null}
                      <Link href={`#${related.id}`} className="font-medium text-teal hover:underline">
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
                        className="font-medium text-teal hover:underline"
                      >
                        {topic.shortTitle}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
          );
        })}
      </dl>
    </div>
  );
}
