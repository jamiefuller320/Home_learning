import type { Topic } from "@/content/schema";

export function yearMathsHref(year: Topic["year"]): string {
  if (year === 1) return "/year-1-maths";
  return `/ks2/year-${year}`;
}

export function yearSkillsHref(year: Topic["year"]): string {
  return `${yearMathsHref(year)}/skills`;
}

export function yearGlossaryHref(year: Topic["year"]): string {
  if (year === 1) return "/year-1-maths/glossary";
  return "/year-1-maths/glossary";
}

export function topicHref(topic: Topic): string {
  return `${yearMathsHref(topic.year)}/${topic.slug}`;
}

export function topicPackHref(topic: Topic): string {
  return `${topicHref(topic)}/pack`;
}

export function yearLabel(year: Topic["year"]): string {
  return `Year ${year}`;
}

export function keyStageLabel(topic: Topic): string {
  return topic.keyStage === "ks2" ? "KS2" : "KS1";
}
