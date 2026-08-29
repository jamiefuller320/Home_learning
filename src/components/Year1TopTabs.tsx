"use client";

import { useRouter } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { BinderTabs, type BinderTabItem } from "@/components/BinderTabs";

export type Year1TopTabId = "lessons" | "skills" | "glossary";

const TOP_TABS: BinderTabItem<Year1TopTabId>[] = [
  { id: "lessons", label: "Lessons", shortLabel: "Lessons", step: 1 },
  { id: "skills", label: "Skills tree", shortLabel: "Skills", step: 2 },
  { id: "glossary", label: "Glossary", shortLabel: "Glossary", step: 3 },
];

const TAB_HREF: Record<Year1TopTabId, string> = {
  lessons: "/year-1-maths",
  skills: "/year-1-maths/skills",
  glossary: "/year-1-maths/glossary",
};

/**
 * Top-level Year 1 maths binder: Lessons, Skills tree, Glossary.
 * Navigates between routes so deep links and static export stay intact.
 */
export function Year1TopTabs({
  activeId,
  sheet,
  sheetHeader,
}: {
  activeId: Year1TopTabId;
  sheet: ReactNode;
  sheetHeader?: ReactNode;
}) {
  const router = useRouter();
  const items = useMemo(() => TOP_TABS, []);

  return (
    <BinderTabs
      className="year1-top-binder"
      tone="harbour"
      ariaLabel="Year 1 maths sections"
      items={items}
      activeId={activeId}
      onChange={(id) => {
        if (id === activeId) return;
        router.push(TAB_HREF[id]);
      }}
      sheetHeader={sheetHeader}
      sheet={sheet}
    />
  );
}
