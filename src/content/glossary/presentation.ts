import type { Topic } from "@/content/schema";
import { introducingTopicId, unlockedTermIdsFor } from "./unlock";

export type GlossaryMentionTreatment = "introduce" | "recall" | "plain";

/**
 * Introducing lesson: colour the term, no glossary link (stay with the explanation).
 * Subsequent lessons that already know the term: dotted glossary link.
 * Mentions before the term has been taught: plain text.
 */
export function glossaryMentionTreatment(
  termId: string,
  topic: Topic,
  topics: Topic[],
): GlossaryMentionTreatment {
  const introducer = introducingTopicId(termId, topics);
  if (introducer === topic.id) return "introduce";

  const unlocked = unlockedTermIdsFor(topic, topics);
  if (unlocked.includes(termId) || topic.glossaryTerms.includes(termId)) {
    return "recall";
  }

  return "plain";
}
