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

console.log("Language-notes API helpers look good.");
