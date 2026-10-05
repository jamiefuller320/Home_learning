import { KS2_YEARS, ks2MathsTopics, ks2MathsTopicsByYear } from "../src/content/england/ks2";
import { year1MathsTopics } from "../src/content/england/ks1/year-1/maths/topics";
import { year2MathsTopics } from "../src/content/england/ks1/year-2";
import assert from "node:assert/strict";

const ks1Year2Strands = [
  "Number and place value",
  "Addition and subtraction",
  "Multiplication and division",
  "Fractions",
  "Measurement",
  "Geometry",
  "Statistics",
];

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

const year2Rtp = [
  "2NPV-1",
  "2NPV-2",
  "2NF-1",
  "2AS-1",
  "2AS-2",
  "2AS-3",
  "2AS-4",
  "2MD-1",
  "2MD-2",
  "2G-1",
];

assert.equal(year1MathsTopics.length > 0, true);
assert.equal(year2MathsTopics.length, 24);
assert.equal(ks2MathsTopics.length, 94);

const year2Strands = new Set(year2MathsTopics.map((topic) => topic.strand));
for (const strand of ks1Year2Strands) {
  assert.ok(year2Strands.has(strand), `Year 2 should cover ${strand}`);
}
assert.ok(
  year2MathsTopics.every((topic) => topic.year === 2 && topic.keyStage === "ks1" && topic.reviewStatus === "draft"),
  "Year 2 packs must be KS1 drafts",
);
const year2RtpCodes = new Set(year2MathsTopics.flatMap((topic) => topic.readyToProgress));
for (const code of year2Rtp) {
  assert.ok(year2RtpCodes.has(code), `Year 2 should map ready-to-progress ${code}`);
}

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

console.log(
  `Primary syllabus coverage: ${year1MathsTopics.length} Year 1, ${year2MathsTopics.length} Year 2 drafts, ${ks2MathsTopics.length} KS2 drafts.`,
);
