import type { Topic } from "@/content/schema";
import { year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";
import { ks2MathsTopics } from "@/content/england/ks2";

export { year1MathsTopics };
export { ks2MathsTopics };

export const allMathsTopics: Topic[] = [...year1MathsTopics, ...ks2MathsTopics];

export function getAnyTopicBySlug(slug: string): Topic | undefined {
  return allMathsTopics.find((topic) => topic.slug === slug);
}

export function getAnyTopicById(id: string): Topic | undefined {
  return allMathsTopics.find((topic) => topic.id === id);
}

export function topicsForYear(year: Topic["year"]): Topic[] {
  return allMathsTopics.filter((topic) => topic.year === year);
}
