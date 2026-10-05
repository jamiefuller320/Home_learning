import type { Metadata } from "next";
import { SkillsTree } from "@/components/SkillsTree";
import { Year1TopTabs } from "@/components/Year1TopTabs";
import { year2MathsTopics } from "@/content/england/ks1/year-2";

export const metadata: Metadata = {
  title: "Year 2 skills tree",
  description: "How Year 2 maths topics build on each other.",
};

export default function Year2SkillsPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
        England · KS1 · Year 2
      </p>
      <h1 className="serif mt-3 text-4xl text-ink sm:text-5xl">Skills tree</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
        How this year’s draft packs build on each other. Follow a link back a step if an idea feels wobbly.
      </p>
      <div className="mt-10">
        <Year1TopTabs
          year={2}
          activeId="skills"
          sheetHeader={
            <header className="binder-sheet-head">
              <h3>Skills tree</h3>
              <p>Prerequisites first — then the topic that needs them.</p>
            </header>
          }
          sheet={<SkillsTree topics={year2MathsTopics} />}
        />
      </div>
    </div>
  );
}
