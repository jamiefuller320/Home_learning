import assert from "node:assert/strict";
import { countingWithin100 } from "../src/content/england/ks1/year-1/maths/topics/counting-within-100";
import {
  BLOCKED_EVERYDAY_GLOSSARY_ALIASES,
  isBlockedEverydayGlossaryAlias,
  splitGlossaryText,
} from "../src/content/glossary";
import { presentationLearnings } from "../src/content/presentation-learnings";
import { validateGlossary } from "../src/content/validate";

function matchedPhrases(text: string) {
  return splitGlossaryText(text)
    .filter((part) => part.termId)
    .map((part) => ({ text: part.text, termId: part.termId }));
}

assert.deepEqual(
  matchedPhrases(countingWithin100.homePack.setup),
  [],
  "Counting to 100 setup must not wrap everyday words as glossary chips",
);

assert.match(countingWithin100.homePack.setup, /a short walk/);
assert.equal(
  splitGlossaryText(countingWithin100.homePack.setup).some(
    (part) => part.termId === "compare-length" && part.text.toLowerCase() === "short",
  ),
  false,
);

assert.deepEqual(matchedPhrases("a short walk"), []);
assert.deepEqual(matchedPhrases("Find the short hand."), []);
assert.deepEqual(matchedPhrases("Keep it short."), []);

const shorter = matchedPhrases("Ask which is shorter.");
assert.equal(shorter.length, 1);
assert.equal(shorter[0]?.termId, "compare-length");
assert.equal(shorter[0]?.text.toLowerCase(), "shorter");

const taller = matchedPhrases("Ask which is taller.");
assert.equal(taller.length, 1);
assert.equal(taller[0]?.termId, "compare-length");

const phrase = matchedPhrases("Use the words tall and short.");
assert.equal(phrase.length, 1);
assert.equal(phrase[0]?.termId, "compare-length");
assert.equal(phrase[0]?.text.toLowerCase(), "tall and short");

assert.equal(isBlockedEverydayGlossaryAlias("short", "longer and shorter"), true);
assert.equal(isBlockedEverydayGlossaryAlias("tall", "longer and shorter"), true);
assert.equal(isBlockedEverydayGlossaryAlias("long", "longer and shorter"), true);
assert.equal(isBlockedEverydayGlossaryAlias("shorter", "longer and shorter"), false);
assert.equal(isBlockedEverydayGlossaryAlias("short", "short"), false);
assert.ok(BLOCKED_EVERYDAY_GLOSSARY_ALIASES.includes("short"));

const glossaryIssues = validateGlossary(new Set(["comparing-length"]));
assert.equal(
  glossaryIssues.some((issue) => issue.field === "aliases"),
  false,
);

assert.ok(presentationLearnings.some((learning) => learning.id === "glossary-inline-everyday"));

console.log("glossary tests passed.");
