import { Fragment, type ReactNode } from "react";
import { buildGlossaryMatchPatterns } from "@/content/glossary";
import { GlossaryLink } from "@/components/GlossaryLink";

function findMatchingTermId(part: string, patterns: ReturnType<typeof buildGlossaryMatchPatterns>): string | undefined {
  for (const entry of patterns) {
    if (new RegExp(`^${entry.pattern}$`, "i").test(part)) {
      return entry.termId;
    }
  }
  return undefined;
}

export function GlossaryText({ text }: { text: string }): ReactNode {
  const patterns = buildGlossaryMatchPatterns();
  if (patterns.length === 0) {
    return text;
  }

  const combinedPattern = patterns.map((entry) => entry.pattern).join("|");
  const regex = new RegExp(`(${combinedPattern})`, "gi");
  const parts = text.split(regex).filter((part) => part.length > 0);

  return parts.map((part, index) => {
    const termId = findMatchingTermId(part, patterns);
    if (termId) {
      return (
        <GlossaryLink key={`${termId}-${index}`} termId={termId}>
          {part}
        </GlossaryLink>
      );
    }
    return <Fragment key={`text-${index}`}>{part}</Fragment>;
  });
}
