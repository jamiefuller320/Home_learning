"use client";

import { usePublicationPoll } from "@/hooks/usePublicationPoll";
import type { Topic } from "@/content/schema";
import { SuspendedLesson } from "./SuspendedLesson";
import { TopicExperience } from "./TopicExperience";

export function TopicPublicationGate({
  topic,
  topics,
}: {
  topic: Topic;
  topics: Topic[];
}) {
  const { statusFor } = usePublicationPoll(topics);
  const status = statusFor(topic.id, topic.reviewStatus);

  if (status === "suspended") {
    return <SuspendedLesson topic={topic} />;
  }

  return <TopicExperience topic={topic} topics={topics} />;
}
