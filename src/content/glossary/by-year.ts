import { allMathsTopics } from "@/content/catalogue";
import { glossaryTerms } from "./terms";
import type { YearGroup } from "@/content/schema";

/** Glossary ids listed on packs in this year or earlier. */
export function glossaryTermIdsUpToYear(year: YearGroup): string[] {
  const listed = new Set<string>();
  for (const topic of allMathsTopics) {
    if (topic.year <= year) {
      topic.glossaryTerms.forEach((termId) => listed.add(termId));
    }
  }
  return glossaryTerms.filter((term) => listed.has(term.id)).map((term) => term.id);
}
