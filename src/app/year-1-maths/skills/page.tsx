import type { Metadata } from "next";
import { SkillsTree } from "@/components/SkillsTree";
import { Year1TopTabs } from "@/components/Year1TopTabs";
import { year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";

export const metadata: Metadata = {
  title: "Skills tree",
  description: "How Year 1 maths topics build on each other.",
};

export default function Year1SkillsPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
        England · KS1 · Year 1
      </p>
      <h1 className="serif mt-3 text-4xl text-ink sm:text-5xl">Skills tree</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
        Topics build on each other. If something feels unclear, follow the link back a step rather than pushing on.
      </p>
      <div className="mt-10">
        <Year1TopTabs
          activeId="skills"
          sheetHeader={
            <header className="binder-sheet-head">
              <h3>Skills tree</h3>
              <p>Prerequisites first — then the topic that needs them.</p>
            </header>
          }
          sheet={<SkillsTree topics={year1MathsTopics} />}
        />
      </div>
    </div>
  );
}
