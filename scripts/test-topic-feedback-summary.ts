import assert from "node:assert/strict";
import { summarizeTopicFeedback } from "../src/lib/topic-feedback-summary";
import type { LanguageNote } from "../src/lib/language-log";

function note(partial: Partial<LanguageNote> & Pick<LanguageNote, "topicId" | "unclear">): LanguageNote {
  return {
    id: partial.id ?? "id-1",
    createdAt: partial.createdAt ?? "2026-08-26T10:00:00.000Z",
    topicTitle: partial.topicTitle ?? "Test topic",
    section: partial.section ?? "parent",
    clearer: partial.clearer ?? "",
    pagePath: partial.pagePath ?? "/year-1-maths/test/",
    status: partial.status ?? "open",
    ...partial,
  };
}

const summaries = summarizeTopicFeedback([
  note({ id: "a", topicId: "facts-within-10", topicTitle: "Facts within 10", unclear: "word one" }),
  note({ id: "b", topicId: "facts-within-10", unclear: "word two", status: "done" }),
  note({ id: "c", topicId: "facts-within-10", unclear: "word three", status: "open" }),
  note({ id: "d", topicId: "parts-of-10", topicTitle: "Parts of 10", unclear: "include a way to show answers", clearer: "add a button" }),
]);

const facts = summaries.find((summary) => summary.topicId === "facts-within-10");
assert.ok(facts);
assert.equal(facts.total, 3);
assert.equal(facts.open, 2);
assert.equal(facts.alertLevel, "review");

const parts = summaries.find((summary) => summary.topicId === "parts-of-10");
assert.ok(parts);
assert.equal(parts.feature, 1);
assert.equal(parts.alertLevel, "none");

assert.equal(summaries[0]?.topicId, "facts-within-10");

console.log("topic-feedback-summary tests passed.");
