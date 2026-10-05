import type { Topic } from "@/content/schema";
import { year3MathsTopics } from "./year-3/maths/topics";
import { year4MathsTopics } from "./year-4/maths/topics";
import { year5MathsTopics } from "./year-5/maths/topics";
import { year6MathsTopics } from "./year-6/maths/topics";

export { year3MathsTopics, year4MathsTopics, year5MathsTopics, year6MathsTopics };

export const KS2_YEARS = [3, 4, 5, 6] as const;
export type Ks2Year = (typeof KS2_YEARS)[number];

export const ks2MathsTopicsByYear: Record<Ks2Year, Topic[]> = {
  3: year3MathsTopics,
  4: year4MathsTopics,
  5: year5MathsTopics,
  6: year6MathsTopics,
};

export const ks2MathsTopics: Topic[] = [
  ...year3MathsTopics,
  ...year4MathsTopics,
  ...year5MathsTopics,
  ...year6MathsTopics,
];

export function getKs2TopicsForYear(year: number): Topic[] | undefined {
  if (year === 3 || year === 4 || year === 5 || year === 6) {
    return ks2MathsTopicsByYear[year];
  }
  return undefined;
}

export function getKs2TopicBySlug(year: number, slug: string): Topic | undefined {
  return getKs2TopicsForYear(year)?.find((topic) => topic.slug === slug);
}
