"use client";

import { createContext, useContext, type ReactNode } from "react";
import { year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";
import type { Topic } from "@/content/schema";

type LessonGlossaryValue = {
  topic: Topic;
  topics: Topic[];
};

const LessonGlossaryContext = createContext<LessonGlossaryValue | null>(null);

export function LessonGlossaryProvider({
  topic,
  topics = year1MathsTopics,
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
