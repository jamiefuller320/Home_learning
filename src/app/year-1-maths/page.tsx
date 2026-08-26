import type { Metadata } from "next";
import { TopicIndex } from "@/components/TopicIndex";
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
        Pick the idea you want to sit with tonight. Read Stage 1 yourself. Then use the pack. Use the skills tree if
        you need to go back a step. Every topic is still a draft until a teacher has checked the method.
      </p>
      <div className="mt-10">
        <TopicIndex topics={year1MathsTopics} />
      </div>
    </div>
  );
}
