import type { Topic } from "@/content/schema";
import { comparingLength } from "./comparing-length";
import { countingInSteps } from "./counting-in-steps";
import { countingWithin100 } from "./counting-within-100";
import { factsWithin10 } from "./facts-within-10";
import { halves } from "./halves";
import { coins } from "./coins";
import { numberWordsTo20 } from "./number-words-to-20";
import { numbersTo20 } from "./numbers-to-20";
import { oclockAndHalfPast } from "./oclock-and-half-past";
import { partsOf10 } from "./parts-of-10";
import { plusMinusEquals } from "./plus-minus-equals";
import { quarters } from "./quarters";
import { shapesAroundUs } from "./shapes-around-us";

export const year1MathsTopics: Topic[] = [
  countingWithin100,
  numbersTo20,
  numberWordsTo20,
  factsWithin10,
  partsOf10,
  plusMinusEquals,
  countingInSteps,
  shapesAroundUs,
  halves,
  quarters,
  comparingLength,
  coins,
  oclockAndHalfPast,
];

export function getTopicBySlug(slug: string): Topic | undefined {
  return year1MathsTopics.find((topic) => topic.slug === slug);
}

export function getTopicById(id: string): Topic | undefined {
  return year1MathsTopics.find((topic) => topic.id === id);
}
