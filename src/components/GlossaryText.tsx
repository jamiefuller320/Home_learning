import { Fragment, type ReactNode } from "react";
import { buildGlossaryMatchPatterns } from "@/content/glossary";
import { GlossaryLink } from "@/components/GlossaryLink";

const GLOSSARY_PATTERNS = buildGlossaryMatchPatterns();

function findMatchingTermId(part: string): string | undefined {
  for (const entry of GLOSSARY_PATTERNS) {
    if (new RegExp(`^${entry.pattern}$`, "i").test(part)) {
      return entry.termId;
    }
  }
  return undefined;
}

export function GlossaryText({ text }: { text: string }): ReactNode {
  if (GLOSSARY_PATTERNS.length === 0) {
    return text;
  }

  const combinedPattern = GLOSSARY_PATTERNS.map((entry) => entry.pattern).join("|");
  const regex = new RegExp(`(${combinedPattern})`, "gi");
  const parts = text.split(regex).filter((part) => part.length > 0);

  return parts.map((part, index) => {
    const termId = findMatchingTermId(part);
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
