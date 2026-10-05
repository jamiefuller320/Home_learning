import Link from "next/link";
import { PackProse } from "@/components/PackProse";
import type { Topic } from "@/content/schema";
import { getPrerequisiteTopics } from "@/content/curriculum";
import { topicHref } from "@/lib/topic-path";

export function PrerequisiteCallout({ topic, topics }: { topic: Topic; topics: Topic[] }) {
  const prerequisites = getPrerequisiteTopics(topic, topics);

  if (prerequisites.length === 0) {
    return null;
  }

  return (
    <aside className="no-print mt-6 rounded-2xl border border-amber/30 bg-[#f8f0e3] p-5">
      <h2 className="font-semibold text-ink">If this does not click yet, go back a step</h2>
      <PackProse className="mt-2 text-ink-soft">
        These earlier topics lay groundwork for {topic.shortTitle.toLowerCase()}. Try one of them first if the idea feels wobbly.
      </PackProse>
      <ul className="mt-4 space-y-2 text-pretty">
        {prerequisites.map((prerequisite) => (
          <li key={prerequisite.id}>
            <Link
              href={topicHref(prerequisite)}
              prefetch={false}
              className="font-medium text-teal hover:underline"
            >
              {prerequisite.title}
            </Link>
            <span className="text-ink-soft"> — {prerequisite.summary}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
