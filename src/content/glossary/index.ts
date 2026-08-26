import type { GlossaryTerm } from "@/content/schema";
import { glossaryTerms } from "./terms";

export { glossaryTerms };

export function getGlossaryTermById(id: string): GlossaryTerm | undefined {
  return glossaryTerms.find((term) => term.id === id);
}

export function getGlossaryTermsForTopic(topicId: string): GlossaryTerm[] {
  return glossaryTerms.filter((term) => term.relatedTopics?.includes(topicId));
}

type MatchPattern = {
  termId: string;
  pattern: string;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Longest patterns first so “number bond” wins over “number”. */
export function buildGlossaryMatchPatterns(terms: GlossaryTerm[] = glossaryTerms): MatchPattern[] {
  const patterns: MatchPattern[] = [];

  for (const term of terms) {
    const phrases = [term.term, ...(term.aliases ?? [])];
    for (const phrase of phrases) {
      patterns.push({ termId: term.id, pattern: escapeRegex(phrase) });
    }
  }

  return patterns.sort((a, b) => b.pattern.length - a.pattern.length);
}
