import type { Metadata } from "next";
import { YearGlossaryPage } from "@/components/YearGlossaryPage";

export const metadata: Metadata = {
  title: "Maths glossary",
  description: "Plain-English definitions for classroom maths words used in the Year 1 packs.",
};

export default function MathsGlossaryPage() {
  return <YearGlossaryPage year={1} keyStage="KS1" />;
}
