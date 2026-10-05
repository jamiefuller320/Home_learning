import type { Metadata } from "next";
import { SkillsTree } from "@/components/SkillsTree";
import { Year1TopTabs } from "@/components/Year1TopTabs";
import { KS2_YEARS, getKs2TopicsForYear, type Ks2Year } from "@/content/england/ks2";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ year: string }>;
};

export function generateStaticParams() {
  return KS2_YEARS.map((year) => ({ year: String(year) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;
  return { title: `Year ${year} skills tree` };
}

export default async function Ks2YearSkillsPage({ params }: PageProps) {
  const { year: yearParam } = await params;
  const year = Number(yearParam) as Ks2Year;
  const topics = getKs2TopicsForYear(year);
  if (!topics) notFound();

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
        England · KS2 · Year {year}
      </p>
      <h1 className="serif mt-3 text-4xl text-ink sm:text-5xl">Skills tree</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
        How this year’s draft packs build on each other. Follow a link back a step if an idea feels wobbly.
      </p>
      <div className="mt-10">
        <Year1TopTabs
          year={year}
          activeId="skills"
          sheetHeader={
            <header className="binder-sheet-head">
              <h3>Skills tree</h3>
              <p>Prerequisites first — then the topic that needs them.</p>
            </header>
          }
          sheet={<SkillsTree topics={topics} />}
        />
      </div>
    </div>
  );
}
