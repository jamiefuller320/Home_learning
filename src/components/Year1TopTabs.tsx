"use client";

import { useRouter } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { BinderTabs, type BinderTabItem } from "@/components/BinderTabs";
import { yearGlossaryHref, yearMathsHref, yearSkillsHref } from "@/lib/topic-path";
import type { YearGroup } from "@/content/schema";

export type Year1TopTabId = "lessons" | "skills" | "glossary";

/**
 * Year maths binder: Lessons, Skills tree, and Glossary.
 * Navigates between routes so deep links and static export stay intact.
 */
export function Year1TopTabs({
  activeId,
  sheet,
  sheetHeader,
  year = 1,
}: {
  activeId: Year1TopTabId;
  sheet: ReactNode;
  sheetHeader?: ReactNode;
  year?: YearGroup;
}) {
  const router = useRouter();
  const items = useMemo((): BinderTabItem<Year1TopTabId>[] => {
    const tabs: BinderTabItem<Year1TopTabId>[] = [
      { id: "lessons", label: "Lessons", shortLabel: "Lessons", step: 1 },
      { id: "skills", label: "Skills tree", shortLabel: "Skills", step: 2 },
      { id: "glossary", label: "Glossary", shortLabel: "Glossary", step: 3 },
    ];
    return tabs;
  }, []);

  const hrefs = useMemo(
    (): Record<Year1TopTabId, string> => ({
      lessons: yearMathsHref(year),
      skills: yearSkillsHref(year),
      glossary: yearGlossaryHref(year),
    }),
    [year],
  );

  return (
    <BinderTabs
      className="year1-top-binder"
      tone="harbour"
      ariaLabel={`Year ${year} maths sections`}
      items={items}
      activeId={activeId}
      onChange={(id) => {
        if (id === activeId) return;
        router.push(hrefs[id]);
      }}
      sheetHeader={sheetHeader}
      sheet={sheet}
    />
  );
}
