import { Fragment, type ReactNode } from "react";
import { splitGlossaryText } from "@/content/glossary";
import { GlossaryLink } from "@/components/GlossaryLink";

export function GlossaryText({ text }: { text: string }): ReactNode {
  const parts = splitGlossaryText(text);
  if (parts.length === 1 && !parts[0]?.termId) {
    return text;
  }

  return parts.map((part, index) => {
    if (part.termId) {
      return (
        <GlossaryLink key={`${part.termId}-${index}`} termId={part.termId}>
          {part.text}
        </GlossaryLink>
      );
    }
    return <Fragment key={`text-${index}`}>{part.text}</Fragment>;
  });
}
