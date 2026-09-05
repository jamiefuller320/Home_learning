import { HomeTasks, UnderstandingCheck } from "@/components/HomeTasks";
import { LanguageFeedback } from "@/components/LanguageFeedback";
import type { Topic } from "@/content/schema";

/** Full Stage 2 pack for the print-friendly page. */
export function HomePack({ topic }: { topic: Topic }) {
  return (
    <div className="space-y-10">
      <HomeTasks topic={topic} />
      <UnderstandingCheck topic={topic} />
      <LanguageFeedback topic={topic} section="home" />
    </div>
  );
}
