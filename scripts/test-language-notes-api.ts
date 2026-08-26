import assert from "node:assert/strict";
import { noteToInsertRow, rowToLanguageNote } from "../src/lib/language-notes-api";

const note = {
  topicId: "counting-within-100",
  topicTitle: "Counting forwards and backwards within 100",
  section: "parent" as const,
  unclear: "What does clap once when they land mean?",
  clearer: "Clap each time they say a number in the sequence.",
  pagePath: "https://jamiefuller320.github.io/Home_learning/year-1-maths/counting-within-100/",
  status: "open" as const,
};

const row = noteToInsertRow(note);
assert.equal(row.topic_id, "counting-within-100");
assert.equal(row.section, "parent");
assert.equal(row.unclear, note.unclear);
assert.equal(row.status, "open");
assert.ok(!("id" in row));

const roundTrip = rowToLanguageNote({
  id: "11111111-1111-1111-1111-111111111111",
  created_at: "2026-08-26T09:00:00.000Z",
  ...row,
});
assert.equal(roundTrip.topicId, note.topicId);
assert.equal(roundTrip.section, "parent");
assert.equal(roundTrip.status, "open");
assert.equal(roundTrip.unclear, note.unclear);

const unknownSection = rowToLanguageNote({
  id: "22222222-2222-2222-2222-222222222222",
  created_at: "2026-08-26T09:00:00.000Z",
  topic_id: "coins",
  topic_title: "Coins",
  section: "mystery",
  unclear: "Which coin is 2p?",
  clearer: "",
  page_path: "/year-1-maths/coins/",
  status: "done",
});
assert.equal(unknownSection.section, "parent");
assert.equal(unknownSection.status, "done");

const declined = rowToLanguageNote({
  id: "33333333-3333-3333-3333-333333333333",
  created_at: "2026-08-26T10:00:00.000Z",
  topic_id: "facts-within-10",
  topic_title: "Number facts within 10",
  section: "parent",
  unclear: "layer",
  clearer: "learning stage",
  page_path: "/year-1-maths/facts-within-10/",
  status: "declined",
});
assert.equal(declined.status, "declined");

const reviewed = rowToLanguageNote({
  id: "44444444-4444-4444-4444-444444444444",
  created_at: "2026-08-26T10:00:00.000Z",
  topic_id: "facts-within-10",
  topic_title: "Number facts within 10",
  section: "parent",
  unclear: "They are how the fact is built",
  clearer: "They are the components that allow the fact to be built",
  page_path: "/year-1-maths/facts-within-10/",
  status: "done",
  review_note: "Intent kept; wording was still abstract. Now: see 6 and 4 making 10.",
});
assert.equal(reviewed.reviewNote, "Intent kept; wording was still abstract. Now: see 6 and 4 making 10.");
assert.ok(!("review_note" in noteToInsertRow(note)));

console.log("Language-notes API helpers look good.");
