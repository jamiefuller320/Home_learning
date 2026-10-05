import type { Metadata } from "next";
import Link from "next/link";
import { year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";
import { year2MathsTopics } from "@/content/england/ks1/year-2";
import { KS2_YEARS, ks2MathsTopics, ks2MathsTopicsByYear } from "@/content/england/ks2";
import { yearMathsHref, yearLabel } from "@/lib/topic-path";
import type { YearGroup } from "@/content/schema";

export const metadata: Metadata = {
  title: "Primary maths syllabus",
  description: "Year 1 to Year 6 maths packs for England: the Year 1 slice plus draft packs through the end of KS1 and KS2.",
};

const years: { year: YearGroup; count: number; keyStage: "KS1" | "KS2"; note: string }[] = [
  {
    year: 1,
    count: year1MathsTopics.length,
    keyStage: "KS1",
    note: "First slice — parent briefings and home packs.",
  },
  {
    year: 2,
    count: year2MathsTopics.length,
    keyStage: "KS1",
    note: "Draft packs finishing the KS1 programme of study.",
  },
  ...KS2_YEARS.map((year) => ({
    year: year as YearGroup,
    count: ks2MathsTopicsByYear[year].length,
    keyStage: "KS2" as const,
    note: "Draft packs for the KS2 programme of study.",
  })),
];

export default function SyllabusPage() {
  const draftCount = year2MathsTopics.length + ks2MathsTopics.length;

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
        England · Years 1 to 6 · School preview
      </p>
      <h1 className="serif mt-3 text-4xl text-ink sm:text-5xl">Primary maths syllabus</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
        Year 1 is the first live slice. Year 2 finishes KS1 as drafts. Years 3 to 6 are a KS2 draft map —
        {` ${year1MathsTopics.length + draftCount} `}
        packs in all — so a school can see what a parent briefing and kitchen-table activity might look
        like across the primary programme of study. Year 2–6 packs are not teacher-checked yet.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {years.map((entry) => (
          <Link
            key={entry.year}
            href={yearMathsHref(entry.year)}
            className="rounded-2xl border border-rule bg-white/70 p-5 transition hover:border-teal hover:bg-white"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
              {entry.keyStage} · {yearLabel(entry.year)}
            </p>
            <p className="serif mt-2 text-2xl text-ink">
              {entry.count} {entry.year === 1 ? "packs" : "draft packs"}
            </p>
            <p className="mt-2 text-ink-soft">{entry.note}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
