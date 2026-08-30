import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DraftBadge } from "@/components/DraftBadge";
import { HomePack } from "@/components/HomePack";
import { STAGE_2_META, STAGE_2_FIELDS, StageMetaBox } from "@/components/StageMetaBox";
import { getTopicBySlug, year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return year1MathsTopics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return { title: "Home pack" };
  return { title: `${topic.shortTitle} home pack` };
}

export default async function PackPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  return (
    <article>
      <p className="no-print mb-6 text-sm">
        <Link href={`/year-1-maths/${topic.slug}`} className="text-teal hover:underline">
          ← Back to the briefing
        </Link>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <DraftBadge status={topic.reviewStatus} />
        <span className="text-sm text-ink-soft">{topic.homeMinutes} minutes together</span>
      </div>
      <h1 className="serif mt-4 text-4xl text-ink">{topic.title}</h1>
      <p className="mt-3 text-lg text-ink-soft">Home pack only. If you have not read the parent lesson, go back and do that first.</p>
      <StageMetaBox {...STAGE_2_META} fields={STAGE_2_FIELDS} />
      <div className="mt-10">
        <HomePack topic={topic} />
      </div>
    </article>
  );
}
