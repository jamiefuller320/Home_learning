import type { Topic } from "@/content/schema";
import { year2MathsTopics } from "./maths/topics";

export { year2MathsTopics };

export function getYear2TopicBySlug(slug: string): Topic | undefined {
  return year2MathsTopics.find((topic) => topic.slug === slug);
}

export function getYear2TopicById(id: string): Topic | undefined {
  return year2MathsTopics.find((topic) => topic.id === id);
}
