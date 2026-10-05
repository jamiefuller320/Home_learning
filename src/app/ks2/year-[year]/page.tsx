import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StrandTopicIndex } from "@/components/StrandTopicIndex";
import { Year1TopTabs } from "@/components/Year1TopTabs";
import { KS2_YEARS, getKs2TopicsForYear, type Ks2Year } from "@/content/england/ks2";

type PageProps = {
  params: Promise<{ year: string }>;
};

export function generateStaticParams() {
  return KS2_YEARS.map((year) => ({ year: String(year) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `Year ${year} maths`,
    description: `Draft parent briefings and home packs for Year ${year} maths in England.`,
  };
}

export default async function Ks2YearPage({ params }: PageProps) {
  const { year: yearParam } = await params;
  const year = Number(yearParam) as Ks2Year;
  const topics = getKs2TopicsForYear(year);
  if (!topics) notFound();

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
        England · KS2 · Year {year} · Draft syllabus
      </p>
      <h1 className="serif mt-3 text-4xl text-ink sm:text-5xl">Maths topics</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
        Every pack here is a draft so you can see the shape of the year: parent briefing, then a 10–15 minute
        household activity. Method is not teacher-checked yet.
      </p>
      <div className="mt-10">
        <Year1TopTabs
          year={year}
          activeId="lessons"
          sheetHeader={
            <header className="binder-sheet-head">
              <h3>Year {year} lessons</h3>
              <p>Grouped by strand — open a pack to read the full draft.</p>
            </header>
          }
          sheet={<StrandTopicIndex topics={topics} />}
        />
      </div>
    </div>
  );
}
