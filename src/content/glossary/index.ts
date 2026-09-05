import type { GlossaryTerm } from "@/content/schema";
import { glossaryTerms } from "./terms";

export { glossaryTerms };

/**
 * Everyday adjectives that must never be auto-linked as glossary aliases.
 * They split ordinary phrases (“a short walk”, “short hand”) into popover chips
 * and force line breaks around the matched word.
 */
export const BLOCKED_EVERYDAY_GLOSSARY_ALIASES = ["short", "tall", "long"] as const;

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

export type GlossaryTextPart = {
  text: string;
  termId?: string;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isBlockedEverydayGlossaryAlias(phrase: string, termLabel: string): boolean {
  const lower = phrase.toLowerCase();
  if (lower === termLabel.toLowerCase()) return false;
  return (BLOCKED_EVERYDAY_GLOSSARY_ALIASES as readonly string[]).includes(lower);
}

/** Longest patterns first so “number bond” wins over “number”. */
export function buildGlossaryMatchPatterns(terms: GlossaryTerm[] = glossaryTerms): MatchPattern[] {
  const patterns: MatchPattern[] = [];

  for (const term of terms) {
    const phrases = [term.term, ...(term.aliases ?? [])];
    for (const phrase of phrases) {
      if (isBlockedEverydayGlossaryAlias(phrase, term.term)) continue;
      // Word boundaries so a short alias cannot split a longer word.
      patterns.push({ termId: term.id, pattern: `\\b${escapeRegex(phrase)}\\b` });
    }
  }

  return patterns.sort((a, b) => b.pattern.length - a.pattern.length);
}

function matchingTermId(part: string, patterns: MatchPattern[]): string | undefined {
  for (const entry of patterns) {
    if (new RegExp(`^${entry.pattern}$`, "i").test(part)) {
      return entry.termId;
    }
  }
  return undefined;
}

/** Split running text into plain spans and glossary matches. */
export function splitGlossaryText(text: string, terms: GlossaryTerm[] = glossaryTerms): GlossaryTextPart[] {
  const patterns = buildGlossaryMatchPatterns(terms);
  if (patterns.length === 0) {
    return text.length === 0 ? [] : [{ text }];
  }

  const combinedPattern = patterns.map((entry) => entry.pattern).join("|");
  const regex = new RegExp(`(${combinedPattern})`, "gi");
  const parts = text.split(regex).filter((part) => part.length > 0);

  return parts.map((part) => {
    const termId = matchingTermId(part, patterns);
    return termId ? { text: part, termId } : { text: part };
  });
}
