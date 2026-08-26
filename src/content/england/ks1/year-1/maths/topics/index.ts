import type { Topic } from "@/content/schema";
import { countingInSteps } from "./counting-in-steps";
import { countingWithin100 } from "./counting-within-100";
import { factsWithin10 } from "./facts-within-10";
import { halves } from "./halves";
import { coins } from "./coins";
import { numbersTo20 } from "./numbers-to-20";
import { oclockAndHalfPast } from "./oclock-and-half-past";
import { partsOf10 } from "./parts-of-10";
import { plusMinusEquals } from "./plus-minus-equals";
import { shapesAroundUs } from "./shapes-around-us";

export const year1MathsTopics: Topic[] = [
  countingWithin100,
  numbersTo20,
  factsWithin10,
  partsOf10,
  plusMinusEquals,
  countingInSteps,
  shapesAroundUs,
  halves,
  coins,
  oclockAndHalfPast,
];

export function getTopicBySlug(slug: string): Topic | undefined {
  return year1MathsTopics.find((topic) => topic.slug === slug);
}
