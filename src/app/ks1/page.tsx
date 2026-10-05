import type { Metadata } from "next";
import Link from "next/link";
import { year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";
import { year2MathsTopics } from "@/content/england/ks1/year-2";
import { yearMathsHref } from "@/lib/topic-path";

export const metadata: Metadata = {
  title: "KS1 maths",
  description: "Year 1 and Year 2 maths packs for England Key Stage 1.",
};

export default function Ks1IndexPage() {
  const years = [
    {
      year: 1 as const,
      count: year1MathsTopics.length,
      note: "First slice — parent briefings and home packs.",
      label: "packs",
    },
    {
      year: 2 as const,
      count: year2MathsTopics.length,
      note: "Draft packs covering the Year 2 programme of study.",
      label: "draft packs",
    },
  ];

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
        England · Key Stage 1
      </p>
      <h1 className="serif mt-3 text-4xl text-ink sm:text-5xl">Years 1 and 2 maths</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
        KS1 is Year 1 plus Year 2. Year 1 is the first slice. Year 2 is a draft syllabus preview so a
        school can see the rest of KS1 in the same parent-briefing and household-activity shape. Those
        Year 2 packs are not teacher-checked yet.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {years.map((entry) => (
          <Link
            key={entry.year}
            href={yearMathsHref(entry.year)}
            className="rounded-2xl border border-rule bg-white/70 p-5 transition hover:border-teal hover:bg-white"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Year {entry.year}</p>
            <p className="serif mt-2 text-2xl text-ink">
              {entry.count} {entry.label}
            </p>
            <p className="mt-2 text-ink-soft">{entry.note}</p>
          </Link>
        ))}
      </div>

      <p className="mt-10">
        <Link href="/syllabus" className="font-semibold text-teal hover:underline">
          Whole primary syllabus, Years 1 to 6 →
        </Link>
      </p>
    </div>
  );
}
