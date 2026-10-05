import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DraftBadge } from "@/components/DraftBadge";
import { HomePack } from "@/components/HomePack";
import { STAGE_2_META, StageMetaBox } from "@/components/StageMetaBox";
import { KS2_YEARS, getKs2TopicBySlug, getKs2TopicsForYear } from "@/content/england/ks2";
import { topicHref } from "@/lib/topic-path";

type PageProps = {
  params: Promise<{ year: string; slug: string }>;
};

export function generateStaticParams() {
  return KS2_YEARS.flatMap((year) =>
    (getKs2TopicsForYear(year) ?? []).map((topic) => ({ year: String(year), slug: topic.slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year, slug } = await params;
  const topic = getKs2TopicBySlug(Number(year), slug);
  if (!topic) return { title: "Home pack" };
  return { title: `${topic.shortTitle} home pack` };
}

export default async function Ks2PackPage({ params }: PageProps) {
  const { year, slug } = await params;
  const topic = getKs2TopicBySlug(Number(year), slug);
  if (!topic) notFound();

  return (
    <article>
      <p className="no-print mb-6 text-sm">
        <Link href={topicHref(topic)} className="text-teal hover:underline">
          ← Back to the briefing
        </Link>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <DraftBadge status={topic.reviewStatus} />
        <span className="text-sm text-ink-soft">{topic.homeMinutes} minutes together</span>
      </div>
      <h1 className="serif mt-4 text-4xl text-ink">{topic.title}</h1>
      <p className="mt-3 text-lg text-ink-soft">
        Home pack only. If you have not read the parent lesson, go back and do that first.
      </p>
      <StageMetaBox {...STAGE_2_META} />
      <div className="mt-10">
        <HomePack topic={topic} />
      </div>
    </article>
  );
}
