import { GlossaryIndex } from "@/components/GlossaryIndex";
import { Year1TopTabs } from "@/components/Year1TopTabs";
import { glossaryTermIdsUpToYear } from "@/content/glossary/by-year";
import { yearGlossaryHref, yearLabel } from "@/lib/topic-path";
import type { YearGroup } from "@/content/schema";

export function YearGlossaryPage({ year, keyStage }: { year: YearGroup; keyStage: "KS1" | "KS2" }) {
  const termIds = glossaryTermIdsUpToYear(year);
  const glossaryHref = yearGlossaryHref(year);

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
        England · {keyStage} · {yearLabel(year)}
      </p>
      <h1 className="serif mt-3 text-4xl text-ink sm:text-5xl">Maths glossary</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
        Words introduced by {yearLabel(year)} so far. Open a card when you want the meaning — same reveal you
        get from dotted underlines inside a lesson.
      </p>

      <div className="mt-10">
        <Year1TopTabs
          year={year}
          activeId="glossary"
          sheetHeader={
            <header className="binder-sheet-head">
              <h3>Glossary</h3>
              <p>Letter index · tap a word to open its card.</p>
            </header>
          }
          sheet={<GlossaryIndex termIds={termIds} glossaryHref={glossaryHref} />}
        />
      </div>
    </div>
  );
}
