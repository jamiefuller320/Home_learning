import type { Metadata } from "next";
import Link from "next/link";
import { KS2_YEARS, ks2MathsTopics, ks2MathsTopicsByYear } from "@/content/england/ks2";
import { yearMathsHref } from "@/lib/topic-path";

export const metadata: Metadata = {
  title: "KS2 maths draft syllabus",
  description: "Draft parent packs covering England Key Stage 2 maths, Years 3 to 6.",
};

export default function Ks2IndexPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
        England · Key Stage 2 · Draft preview
      </p>
      <h1 className="serif mt-3 text-4xl text-ink sm:text-5xl">Years 3 to 6 maths</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
        {ks2MathsTopics.length} draft packs mapped to the National Curriculum programme of study, so a school can
        see what a parent briefing and kitchen-table activity might look like in every strand through the end of
        Year 6. They are not teacher-checked yet. If a pack clashes with how you teach it, follow the school.
      </p>

      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
        Need KS1 as well? Year 2 draft packs finish that key stage on the{" "}
        <Link href="/syllabus" className="font-semibold text-teal hover:underline">
          primary syllabus
        </Link>{" "}
        page.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {KS2_YEARS.map((year) => {
          const topics = ks2MathsTopicsByYear[year];
          return (
            <Link
              key={year}
              href={yearMathsHref(year)}
              className="rounded-2xl border border-rule bg-white/70 p-5 transition hover:border-teal hover:bg-white"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Year {year}</p>
              <p className="serif mt-2 text-2xl text-ink">{topics.length} draft packs</p>
              <p className="mt-2 text-ink-soft">Open the year to browse by strand.</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
