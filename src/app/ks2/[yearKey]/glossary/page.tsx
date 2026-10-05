import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { YearGlossaryPage } from "@/components/YearGlossaryPage";
import { ks2YearStaticParams, parseKs2YearKey } from "@/content/england/ks2";

type PageProps = {
  params: Promise<{ yearKey: string }>;
};

export function generateStaticParams() {
  return ks2YearStaticParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { yearKey } = await params;
  const year = parseKs2YearKey(yearKey);
  if (!year) return { title: "Maths glossary" };
  return {
    title: `Year ${year} maths glossary`,
    description: `Plain-English definitions for classroom maths words used by Year ${year}.`,
  };
}

export default async function Ks2GlossaryPage({ params }: PageProps) {
  const { yearKey } = await params;
  const year = parseKs2YearKey(yearKey);
  if (!year) notFound();
  return <YearGlossaryPage year={year} keyStage="KS2" />;
}
