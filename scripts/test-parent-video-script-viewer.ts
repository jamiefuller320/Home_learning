import assert from "node:assert/strict";
import { formatParentVideoComment } from "../src/lib/parent-video-comments";
import { SECTION_LABEL } from "../src/lib/language-log";
import { scriptTopicHref } from "../src/components/ParentVideoScriptBrowser";

assert.equal(SECTION_LABEL["parent-video"], "Parent video script");

assert.equal(
  scriptTopicHref("/maintenance/", "counting-within-100", { tab: "script" }),
  "/maintenance/?tab=script&topic=counting-within-100",
);
assert.equal(
  scriptTopicHref("/for-schools/script/", "counting-within-100"),
  "/for-schools/script/?topic=counting-within-100",
);

const unclear = formatParentVideoComment({
  path: "scenes.school.beats[7]",
  prosody: "teach",
  spoken: "School often calls that pair a number bond: two parts that make a whole.",
  comment: "Sounds flat — needs a clearer pause before the definition.",
});

assert.match(unclear, /Beat: scenes\.school\.beats\[7\]/);
assert.match(unclear, /Prosody: teach/);
assert.match(unclear, /Spoken:/);
assert.match(unclear, /Sounds flat/);

console.log("Parent-video script comment formatting looks good.");
