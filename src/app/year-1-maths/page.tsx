import type { Metadata } from "next";
import { TopicIndex } from "@/components/TopicIndex";
import { Year1TopTabs } from "@/components/Year1TopTabs";
import { year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";

export const metadata: Metadata = {
  title: "Year 1 maths",
  description: "Parent briefings and home packs for Year 1 maths in England.",
};

export default function Year1MathsPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
        England · KS1 · Year 1
      </p>
      <h1 className="serif mt-3 text-4xl text-ink sm:text-5xl">Maths topics</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
        Pick the idea you want to sit with tonight. Use the tabs for the skills tree or glossary when you need a
        step back or a word explained. Every topic is still a draft until a teacher has checked the method.
      </p>
      <div className="mt-10">
        <Year1TopTabs
          activeId="lessons"
          sheetHeader={
            <header className="binder-sheet-head">
              <h3>Lessons</h3>
              <p>Open a pack — summary, parent lesson, tasks, then a quick check.</p>
            </header>
          }
          sheet={<TopicIndex topics={year1MathsTopics} />}
        />
      </div>
    </div>
  );
}
