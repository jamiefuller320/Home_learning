import Link from "next/link";
import type { Topic } from "@/content/schema";
import {
  getPrerequisiteTopics,
  sortTopicsByPrerequisites,
} from "@/content/england/ks1/year-1/maths/curriculum";

export function SkillsTree({ topics }: { topics: Topic[] }) {
  const ordered = sortTopicsByPrerequisites(topics);

  return (
    <nav aria-label="Year 1 maths skills tree">
      <ol className="space-y-4">
        {ordered.map((topic) => {
          const prerequisites = getPrerequisiteTopics(topic, topics);

          return (
            <li key={topic.id} className="border-l-2 border-teal/30 pl-4">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <Link href={`/year-1-maths/${topic.slug}`} prefetch={false} className="serif text-xl text-ink hover:text-teal">
                  {topic.shortTitle}
                </Link>
                <span className="text-xs text-ink-soft">{topic.strand}</span>
              </div>
              {prerequisites.length > 0 ? (
                <p className="mt-1 text-sm text-ink-soft">
                  Builds on{" "}
                  {prerequisites.map((prerequisite, index) => (
                    <span key={prerequisite.id}>
                      {index > 0 ? (index === prerequisites.length - 1 ? " and " : ", ") : null}
                      <Link
                        href={`/year-1-maths/${prerequisite.slug}`}
                        prefetch={false}
                        className="font-medium text-teal hover:underline"
                      >
                        {prerequisite.shortTitle}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : (
                <p className="mt-1 text-sm text-ink-soft">A good place to start — no prior topic required.</p>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
