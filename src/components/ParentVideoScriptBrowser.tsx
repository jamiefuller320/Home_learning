"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ParentVideoScriptViewer } from "@/components/ParentVideoScriptViewer";
import { getTopicById, year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";

export const DEFAULT_SCRIPT_TOPIC_ID = "facts-within-10";

export function scriptTopicHref(basePath: string, topicId: string, extra: Record<string, string> = {}): string {
  const params = new URLSearchParams({ ...extra, topic: topicId });
  const separator = basePath.includes("?") ? "&" : "?";
  const query = params.toString();
  return query ? `${basePath}${separator}${query}` : basePath;
}

export function ParentVideoScriptBrowser({
  basePath = "/for-schools/script/",
  defaultTopicId = DEFAULT_SCRIPT_TOPIC_ID,
  extraParams = {},
}: {
  basePath?: string;
  defaultTopicId?: string;
  extraParams?: Record<string, string>;
}) {
  const params = useSearchParams();
  const requested = params.get("topic") || defaultTopicId;
  const topic = getTopicById(requested) ?? getTopicById(defaultTopicId) ?? year1MathsTopics[0];

  if (!topic) {
    return <p className="text-ink-soft">No Year 1 maths topics loaded.</p>;
  }

  return (
    <>
      <nav className="flex flex-wrap gap-2" aria-label="Topic scripts">
        {year1MathsTopics.map((item) => {
          const active = item.id === topic.id;
          return (
            <Link
              key={item.id}
              href={scriptTopicHref(basePath, item.id, extraParams)}
              className={
                active
                  ? "rounded-full bg-teal px-3 py-1.5 text-sm font-semibold text-white"
                  : "rounded-full border border-rule px-3 py-1.5 text-sm font-semibold text-teal hover:border-teal hover:bg-white"
              }
              aria-current={active ? "page" : undefined}
            >
              {item.shortTitle}
            </Link>
          );
        })}
      </nav>
      <ParentVideoScriptViewer topic={topic} />
    </>
  );
}
