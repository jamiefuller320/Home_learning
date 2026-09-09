import Link from "next/link";
import type { Topic } from "@/content/schema";
import { resolvePublicationStatus } from "@/lib/publication";
import { readPackReleaseFile } from "@/lib/pack-release";
import { DraftBadge } from "./DraftBadge";
import { PublicationBadge } from "./PublicationBadge";

export function TopicCard({
  topic,
  briefingDone,
  showPublicationStatus = false,
}: {
  topic: Topic;
  briefingDone?: boolean;
  showPublicationStatus?: boolean;
}) {
  const publicationStatus = resolvePublicationStatus(readPackReleaseFile().entries[topic.id], topic.reviewStatus);
  return (
    <Link
      href={`/year-1-maths/${topic.slug}`}
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
