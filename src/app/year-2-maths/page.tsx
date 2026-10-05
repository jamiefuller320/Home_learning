import type { Metadata } from "next";
import { StrandTopicIndex } from "@/components/StrandTopicIndex";
import { Year1TopTabs } from "@/components/Year1TopTabs";
import { year2MathsTopics } from "@/content/england/ks1/year-2";

export const metadata: Metadata = {
  title: "Year 2 maths",
  description: "Draft parent briefings and home packs for Year 2 maths in England.",
};

export default function Year2MathsPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
        England · KS1 · Year 2 · Draft syllabus
      </p>
      <h1 className="serif mt-3 text-4xl text-ink sm:text-5xl">Maths topics</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
        Draft packs covering the Year 2 programme of study, so a school can see what a parent briefing
        and kitchen-table activity might look like to the end of KS1. They are not teacher-checked yet.
        If a pack clashes with how you teach it, follow the school.
      </p>
      <div className="mt-10">
        <Year1TopTabs
          year={2}
          activeId="lessons"
          sheetHeader={
            <header className="binder-sheet-head">
              <h3>Year 2 lessons</h3>
              <p>Grouped by strand — open a pack to read the full draft.</p>
            </header>
          }
          sheet={<StrandTopicIndex topics={year2MathsTopics} />}
        />
      </div>
    </div>
  );
}
