import { sortTopicsByPrerequisites } from "@/content/curriculum";
import type { Topic } from "@/content/schema";

/** First topic in prerequisite order that lists the term — that lesson introduces it. */
export function introducingTopicId(termId: string, topics: Topic[]): string | undefined {
  return sortTopicsByPrerequisites(topics).find((topic) => topic.glossaryTerms.includes(termId))?.id;
}

/** Terms already taught on the prerequisite path, so later lessons may link them. */
export function unlockedTermIdsFor(topic: Topic, topics: Topic[]): string[] {
  const byId = new Map(topics.map((item) => [item.id, item]));
  const unlocked = new Set<string>();

  function walk(id: string) {
    const node = byId.get(id);
    if (!node) return;
    for (const prerequisiteId of node.prerequisites) {
      walk(prerequisiteId);
      const prerequisite = byId.get(prerequisiteId);
      prerequisite?.glossaryTerms.forEach((termId) => unlocked.add(termId));
    }
  }

  walk(topic.id);

  // Later-year packs do not list earlier years as prerequisites, but those
  // introducing lessons have already taught the words.
  for (const earlier of topics) {
    if (earlier.year < topic.year) {
      earlier.glossaryTerms.forEach((termId) => unlocked.add(termId));
    }
  }

  return [...unlocked];
}
