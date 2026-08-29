import type { Metadata } from "next";
import { GlossaryIndex } from "@/components/GlossaryIndex";
import { Year1TopTabs } from "@/components/Year1TopTabs";

export const metadata: Metadata = {
  title: "Maths glossary",
  description: "Plain-English definitions for classroom maths words used in the Year 1 packs.",
};

export default function MathsGlossaryPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
        England · KS1 · Year 1
      </p>
      <h1 className="serif mt-3 text-4xl text-ink sm:text-5xl">Maths glossary</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
        An alphabetical index first. Open a card when you want the meaning — same reveal you get from dotted
        underlines inside a lesson.
      </p>

      <div className="mt-10">
        <Year1TopTabs
          activeId="glossary"
          sheetHeader={
            <header className="binder-sheet-head">
              <h3>Glossary</h3>
              <p>Letter index · tap a word to open its card.</p>
            </header>
          }
          sheet={<GlossaryIndex />}
        />
      </div>
    </div>
  );
}
