import type { Metadata } from "next";
import { SkillsTree } from "@/components/SkillsTree";
import { Year1TopTabs } from "@/components/Year1TopTabs";
import { getKs2TopicsForYear, ks2YearStaticParams, parseKs2YearKey } from "@/content/england/ks2";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ yearKey: string }>;
};

export function generateStaticParams() {
  return ks2YearStaticParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { yearKey } = await params;
  const year = parseKs2YearKey(yearKey);
  if (!year) return { title: "Skills tree" };
  return { title: `Year ${year} skills tree` };
}

export default async function Ks2YearSkillsPage({ params }: PageProps) {
  const { yearKey } = await params;
  const year = parseKs2YearKey(yearKey);
  const topics = year ? getKs2TopicsForYear(year) : undefined;
  if (!year || !topics) notFound();

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
