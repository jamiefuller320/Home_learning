"use client";

import { createContext, useContext, type ReactNode } from "react";
import { allMathsTopics } from "@/content/catalogue";
import type { Topic } from "@/content/schema";

type LessonGlossaryValue = {
  topic: Topic;
  topics: Topic[];
};

const LessonGlossaryContext = createContext<LessonGlossaryValue | null>(null);

export function LessonGlossaryProvider({
  topic,
  topics = allMathsTopics,
  children,
}: {
  topic: Topic;
  topics?: Topic[];
  children: ReactNode;
}) {
  return <LessonGlossaryContext.Provider value={{ topic, topics }}>{children}</LessonGlossaryContext.Provider>;
}

export function useLessonGlossary(): LessonGlossaryValue | null {
  return useContext(LessonGlossaryContext);
}
