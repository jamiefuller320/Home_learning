import assert from "node:assert/strict";
import { year1MathsTopics } from "../src/content/england/ks1/year-1/maths/topics";
import { countingWithin100 } from "../src/content/england/ks1/year-1/maths/topics/counting-within-100";
import { factsWithin10 } from "../src/content/england/ks1/year-1/maths/topics/facts-within-10";
import { partsOf10 } from "../src/content/england/ks1/year-1/maths/topics/parts-of-10";
import { halves } from "../src/content/england/ks1/year-1/maths/topics/halves";
import { plusMinusEquals } from "../src/content/england/ks1/year-1/maths/topics/plus-minus-equals";
import { quarters } from "../src/content/england/ks1/year-1/maths/topics/quarters";
import {
  BLOCKED_EVERYDAY_GLOSSARY_ALIASES,
  introducingTopicId,
  isBlockedEverydayGlossaryAlias,
  splitGlossaryText,
} from "../src/content/glossary";
import {
  firstIntroductionInLesson,
  glossaryMentionTreatment,
} from "../src/content/glossary/presentation";
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

assert.match(countingWithin100.homePack.setup, /a\u00a0short\u00a0walk/);
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
assert.ok(presentationLearnings.some((learning) => learning.id === "glossary-introduce-then-link"));

assert.equal(introducingTopicId("ten-frame", year1MathsTopics), "facts-within-10");
assert.equal(introducingTopicId("part-whole", year1MathsTopics), "parts-of-10");
assert.equal(introducingTopicId("number-bond", year1MathsTopics), "parts-of-10");
assert.equal(introducingTopicId("half", year1MathsTopics), "halves");

const firstTenFrame = firstIntroductionInLesson(factsWithin10, "ten-frame");
assert.ok(firstTenFrame);
assert.equal(firstTenFrame.occurrence, 0);
assert.equal(
  glossaryMentionTreatment("ten-frame", firstTenFrame.text, 0, factsWithin10, year1MathsTopics),
  "introduce",
);
assert.equal(
  glossaryMentionTreatment("ten-frame", firstTenFrame.text, 1, factsWithin10, year1MathsTopics),
  "plain",
);
assert.equal(
  glossaryMentionTreatment("ten-frame", factsWithin10.homePack.setup, 0, factsWithin10, year1MathsTopics),
  "plain",
);

const firstPartWhole = firstIntroductionInLesson(partsOf10, "part-whole");
assert.ok(firstPartWhole);
assert.equal(
  glossaryMentionTreatment("part-whole", firstPartWhole.text, 0, partsOf10, year1MathsTopics),
  "introduce",
);
assert.equal(
  glossaryMentionTreatment(
    "part-whole",
    factsWithin10.parentBriefing.howSchoolTeachesIt,
    0,
    factsWithin10,
    year1MathsTopics,
  ),
  "recall",
);
assert.equal(
  glossaryMentionTreatment("part-whole", plusMinusEquals.summary, 0, plusMinusEquals, year1MathsTopics),
  "recall",
);
assert.equal(
  glossaryMentionTreatment("ten-frame", countingWithin100.homePack.setup, 0, countingWithin100, year1MathsTopics),
  "plain",
);

const firstHalf = firstIntroductionInLesson(halves, "half");
assert.ok(firstHalf);
assert.equal(glossaryMentionTreatment("half", firstHalf.text, 0, halves, year1MathsTopics), "introduce");
assert.equal(
  glossaryMentionTreatment("half", quarters.parentBriefing.inPlainEnglish, 0, quarters, year1MathsTopics),
  "recall",
);

console.log("glossary tests passed.");
