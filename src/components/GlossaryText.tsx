"use client";

import { Fragment, type ReactNode } from "react";
import { glossaryMentionTreatment } from "@/content/glossary/presentation";
import { splitGlossaryText } from "@/content/glossary";
import { GlossaryIntroduction } from "@/components/GlossaryIntroduction";
import { GlossaryLink } from "@/components/GlossaryLink";
import { useLessonGlossary } from "@/components/LessonGlossary";

export function GlossaryText({ text }: { text: string }): ReactNode {
  const lesson = useLessonGlossary();
  const parts = splitGlossaryText(text);
  if (parts.length === 1 && !parts[0]?.termId) {
    return text;
  }

  return parts.map((part, index) => {
    if (!part.termId) {
      return <Fragment key={`text-${index}`}>{part.text}</Fragment>;
    }

    const treatment = lesson
      ? glossaryMentionTreatment(part.termId, lesson.topic, lesson.topics)
      : "recall";

    if (treatment === "introduce") {
      return (
        <GlossaryIntroduction key={`${part.termId}-${index}`}>{part.text}</GlossaryIntroduction>
      );
    }

    if (treatment === "recall") {
      return (
        <GlossaryLink key={`${part.termId}-${index}`} termId={part.termId}>
          {part.text}
        </GlossaryLink>
      );
    }

    return <Fragment key={`${part.termId}-${index}`}>{part.text}</Fragment>;
  });
}
