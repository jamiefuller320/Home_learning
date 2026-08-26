import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopicExperience } from "@/components/TopicExperience";
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
  if (!topic) return { title: "Topic" };
  return { title: topic.title, description: topic.summary };
}

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();
  return <TopicExperience topic={topic} />;
}
