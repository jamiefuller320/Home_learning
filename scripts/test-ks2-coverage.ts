import { KS2_YEARS, ks2MathsTopics, ks2MathsTopicsByYear } from "../src/content/england/ks2";
import { year1MathsTopics } from "../src/content/england/ks1/year-1/maths/topics";
import assert from "node:assert/strict";

const requiredStrands: Record<3 | 4 | 5 | 6, string[]> = {
  3: [
    "Number and place value",
    "Addition and subtraction",
    "Multiplication and division",
    "Fractions",
    "Measurement",
    "Geometry",
    "Statistics",
  ],
  4: [
    "Number and place value",
    "Addition and subtraction",
    "Multiplication and division",
    "Fractions",
    "Measurement",
    "Geometry",
    "Statistics",
  ],
  5: [
    "Number and place value",
    "Addition and subtraction",
    "Multiplication and division",
    "Fractions",
    "Measurement",
    "Geometry",
    "Statistics",
  ],
  6: [
    "Number and place value",
    "Calculation",
    "Fractions",
    "Ratio and proportion",
    "Algebra",
    "Measurement",
    "Geometry",
    "Statistics",
  ],
};

assert.equal(year1MathsTopics.length > 0, true);
assert.equal(ks2MathsTopics.length, 94);

for (const year of KS2_YEARS) {
  const topics = ks2MathsTopicsByYear[year];
  const strands = new Set(topics.map((topic) => topic.strand));
  for (const strand of requiredStrands[year]) {
    assert.ok(strands.has(strand), `Year ${year} should cover ${strand}`);
  }
  assert.ok(
    topics.every((topic) => topic.year === year && topic.keyStage === "ks2" && topic.reviewStatus === "draft"),
    `Year ${year} packs must be KS2 drafts`,
  );
  const withRtp = topics.filter((topic) => topic.readyToProgress.length > 0);
  assert.ok(withRtp.length >= 8, `Year ${year} should map several ready-to-progress codes`);
}

console.log(`KS2 syllabus coverage: ${ks2MathsTopics.length} draft packs across years 3–6.`);
