import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopicPublicationGate } from "@/components/TopicPublicationGate";
import {
  getKs2TopicBySlug,
  getKs2TopicsForYear,
  ks2TopicStaticParams,
  parseKs2YearKey,
} from "@/content/england/ks2";

type PageProps = {
  params: Promise<{ yearKey: string; slug: string }>;
};

export function generateStaticParams() {
  return ks2TopicStaticParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { yearKey, slug } = await params;
  const year = parseKs2YearKey(yearKey);
  const topic = year ? getKs2TopicBySlug(year, slug) : undefined;
  if (!topic) return { title: "Topic" };
  return { title: topic.title, description: topic.summary };
}

export default async function Ks2TopicPage({ params }: PageProps) {
  const { yearKey, slug } = await params;
  const year = parseKs2YearKey(yearKey);
  const topics = year ? getKs2TopicsForYear(year) : undefined;
  const topic = year ? getKs2TopicBySlug(year, slug) : undefined;
  if (!topics || !topic) notFound();

  return <TopicPublicationGate topic={topic} topics={topics} />;
}
