import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopicPublicationGate } from "@/components/TopicPublicationGate";
import { KS2_YEARS, getKs2TopicBySlug, getKs2TopicsForYear, type Ks2Year } from "@/content/england/ks2";

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
  if (!topic) return { title: "Topic" };
  return { title: topic.title, description: topic.summary };
}

export default async function Ks2TopicPage({ params }: PageProps) {
  const { year: yearParam, slug } = await params;
  const year = Number(yearParam) as Ks2Year;
  const topics = getKs2TopicsForYear(year);
  const topic = getKs2TopicBySlug(year, slug);
  if (!topics || !topic) notFound();

  return <TopicPublicationGate topic={topic} topics={topics} />;
}
