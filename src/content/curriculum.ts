import type { Topic } from "@/content/schema";

export function getTopicById(topics: Topic[], id: string): Topic | undefined {
  return topics.find((topic) => topic.id === id);
}

export function getPrerequisiteTopics(topic: Topic, topics: Topic[]): Topic[] {
  return topic.prerequisites
    .map((id) => getTopicById(topics, id))
    .filter((item): item is Topic => Boolean(item));
}

export function getFollowUpTopics(topic: Topic, topics: Topic[]): Topic[] {
  return topics.filter((candidate) => candidate.prerequisites.includes(topic.id));
}

/** Topics with no prerequisites — sensible entry points. */
export function getRootTopics(topics: Topic[]): Topic[] {
  return topics.filter((topic) => topic.prerequisites.length === 0);
}

/** Group topics by strand, preserving the order they first appear in the list. */
export function groupTopicsByStrand(topics: Topic[]): { strand: string; topics: Topic[] }[] {
  const groups: { strand: string; topics: Topic[] }[] = [];
  const indexByStrand = new Map<string, number>();

  for (const topic of topics) {
    const existing = indexByStrand.get(topic.strand);
    if (existing === undefined) {
      indexByStrand.set(topic.strand, groups.length);
      groups.push({ strand: topic.strand, topics: [topic] });
    } else {
      groups[existing].topics.push(topic);
    }
  }

  return groups;
}

/** Topological order for rendering a skills tree (roots first). */
export function sortTopicsByPrerequisites(topics: Topic[]): Topic[] {
  const byId = new Map(topics.map((topic) => [topic.id, topic]));
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const ordered: Topic[] = [];

  function visit(id: string) {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      throw new Error(`Circular prerequisite detected at topic "${id}"`);
    }
    visiting.add(id);
    const topic = byId.get(id);
    if (topic) {
      for (const prerequisiteId of topic.prerequisites) {
        visit(prerequisiteId);
      }
      ordered.push(topic);
    }
    visiting.delete(id);
    visited.add(id);
  }

  for (const topic of topics) {
    visit(topic.id);
  }

  return ordered;
}
