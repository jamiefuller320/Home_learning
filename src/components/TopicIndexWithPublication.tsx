import type { Topic } from "@/content/schema";
import { draftTopicsForParents, liveTopics } from "@/lib/publication";
import { readPackReleaseFile } from "@/lib/pack-release";
import { TopicIndex } from "./TopicIndex";

export function TopicIndexWithPublication({ topics }: { topics: Topic[] }) {
  const releaseFile = readPackReleaseFile();
  const live = liveTopics(topics, releaseFile);
  const preparing = draftTopicsForParents(topics, releaseFile);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="serif text-2xl text-ink">Live lessons</h2>
        {live.length === 0 ? (
          <p className="mt-3 text-ink-soft">No lessons are live yet — maintainers are still checking packs.</p>
        ) : (
          <div className="mt-4">
            <TopicIndex topics={live} />
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
            <TopicIndex topics={preparing} showPublicationStatus />
          </div>
        </section>
      ) : null}
    </div>
  );
}
