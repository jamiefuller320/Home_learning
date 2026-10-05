import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopicPublicationGate } from "@/components/TopicPublicationGate";
import { getYear2TopicBySlug, year2MathsTopics } from "@/content/england/ks1/year-2";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return year2MathsTopics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getYear2TopicBySlug(slug);
  if (!topic) return { title: "Topic" };
  return { title: topic.title, description: topic.summary };
}

export default async function Year2TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = getYear2TopicBySlug(slug);
  if (!topic) notFound();

  return <TopicPublicationGate topic={topic} topics={year2MathsTopics} />;
}
