import { HomeTasks, UnderstandingCheck } from "@/components/HomeTasks";
import type { Topic } from "@/content/schema";

/** Full Stage 2 pack for the print-friendly page. */
export function HomePack({ topic }: { topic: Topic }) {
  return (
    <div className="space-y-10">
      <HomeTasks topic={topic} />
      <UnderstandingCheck topic={topic} />
    </div>
  );
}
