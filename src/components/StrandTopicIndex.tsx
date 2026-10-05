import { groupTopicsByStrand } from "@/content/curriculum";
import type { Topic } from "@/content/schema";
import { TopicCard } from "./TopicCard";

export function StrandTopicIndex({ topics }: { topics: Topic[] }) {
  const groups = groupTopicsByStrand(topics);

  return (
    <div className="space-y-10">
      <p className="text-sm text-ink-soft">{topics.length} draft packs in this year, grouped by strand.</p>
      {groups.map((group) => (
        <section key={group.strand}>
          <h2 className="serif text-2xl text-ink">{group.strand}</h2>
          <div className="mt-4 space-y-4">
            {group.topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} showPublicationStatus />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
