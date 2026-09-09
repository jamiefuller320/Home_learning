"use client";

import type { Topic } from "@/content/schema";
import { usePublicationPoll } from "@/hooks/usePublicationPoll";
import { draftTopicsForParents, liveTopics } from "@/lib/publication";
import { TopicIndex } from "./TopicIndex";

export function LiveTopicIndexWithPublication({ topics }: { topics: Topic[] }) {
  const { map, source, lastFetchedAt, polling } = usePublicationPoll(topics);
  const live = liveTopics(topics, undefined, map);
  const preparing = draftTopicsForParents(topics, undefined, map);

  return (
    <div className="space-y-10">
      <p className="text-xs text-ink-soft">
        {source === "supabase"
          ? `Live lesson list synced from Supabase${lastFetchedAt ? ` · updated ${new Date(lastFetchedAt).toLocaleTimeString("en-GB")}` : ""}${polling ? " · refreshing…" : ""}`
          : "Using bundled publication defaults — set Supabase env vars for live updates."}
      </p>
      <section>
        <h2 className="serif text-2xl text-ink">Live lessons</h2>
        {live.length === 0 ? (
          <p className="mt-3 text-ink-soft">No lessons are live yet — maintainers are still checking packs.</p>
        ) : (
          <div className="mt-4">
            <TopicIndex topics={live} liveMap={map} />
          </div>
        )}
      </section>
      {preparing.length > 0 ? (
        <section>
          <h2 className="serif text-2xl text-ink">In preparation</h2>
          <p className="mt-2 text-sm text-ink-soft">
            These packs are being checked before they appear in the live list. Maintainers can still open them for QA.
          </p>
          <div className="mt-4 opacity-90">
            <TopicIndex topics={preparing} showPublicationStatus liveMap={map} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
