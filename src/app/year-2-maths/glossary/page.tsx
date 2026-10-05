import type { Metadata } from "next";
import { YearGlossaryPage } from "@/components/YearGlossaryPage";

export const metadata: Metadata = {
  title: "Year 2 maths glossary",
  description: "Plain-English definitions for classroom maths words used by Year 2.",
};

export default function Year2GlossaryPage() {
  return <YearGlossaryPage year={2} keyStage="KS1" />;
}
