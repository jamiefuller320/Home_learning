"use client";

import { useEffect, useState } from "react";
import type { Topic } from "@/content/schema";
import { countFinishedBriefings, readAllProgress } from "@/lib/progress";
import { TopicCard } from "./TopicCard";

export function TopicIndex({ topics }: { topics: Topic[] }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [finishedCount, setFinishedCount] = useState(0);

  useEffect(() => {
    const all = readAllProgress();
    const flags: Record<string, boolean> = {};
    for (const topic of topics) {
      flags[topic.slug] = Boolean(all[topic.slug]?.briefingDone);
    }
    setDone(flags);
    setFinishedCount(countFinishedBriefings(topics.map((topic) => topic.slug)));
  }, [topics]);

  return (
    <div>
      <p className="text-sm text-ink-soft">
        {finishedCount} of {topics.length} briefings marked ready on this device.
      </p>
      <div className="mt-6 space-y-4">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} briefingDone={done[topic.slug]} />
        ))}
      </div>
    </div>
  );
}
