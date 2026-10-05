import Link from "next/link";
import type { Topic } from "@/content/schema";
import type { LivePublicationMap } from "@/lib/pack-publish-api";
import { resolvePublicationStatus } from "@/lib/publication";
import { readPackReleaseFile } from "@/lib/pack-release";
import { topicHref } from "@/lib/topic-path";
import { DraftBadge } from "./DraftBadge";
import { PublicationBadge } from "./PublicationBadge";

export function TopicCard({
  topic,
  briefingDone,
  showPublicationStatus = false,
  liveMap,
}: {
  topic: Topic;
  briefingDone?: boolean;
  showPublicationStatus?: boolean;
  liveMap?: LivePublicationMap;
}) {
  const publicationStatus = resolvePublicationStatus(
    readPackReleaseFile().entries[topic.id],
    topic.reviewStatus,
    liveMap,
    topic.id,
  );
  return (
    <Link
      href={topicHref(topic)}
      prefetch={false}
      className="block rounded-2xl border border-rule bg-white/70 p-5 transition hover:border-teal hover:bg-white"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
        <span>{topic.strand}</span>
        <span aria-hidden="true">·</span>
        <span>
          {topic.parentMinutes} min parent · {topic.homeMinutes} min home
        </span>
        {briefingDone ? (
          <span className="rounded-full bg-[#d9e8df] px-2 py-0.5 font-semibold text-sage">Briefing done</span>
        ) : showPublicationStatus ? (
          <PublicationBadge status={publicationStatus} />
        ) : publicationStatus === "live" ? (
          <PublicationBadge status="live" />
        ) : (
          <DraftBadge status={topic.reviewStatus} />
        )}
      </div>
      <h2 className="serif mt-2 text-2xl leading-snug text-ink">{topic.title}</h2>
      <p className="mt-2 text-ink-soft">{topic.summary}</p>
    </Link>
  );
}
