import { allMathsTopics, year1MathsTopics } from "../src/content/catalogue";
import { ks2MathsTopics } from "../src/content/england/ks2";
import { validateTopics } from "../src/content/validate";

const issues = validateTopics(allMathsTopics);

if (issues.length > 0) {
  for (const issue of issues) {
    console.error(`${issue.topicId} → ${issue.field}: ${issue.message}`);
  }
  console.error(`\n${issues.length} content issue(s) found.`);
  process.exit(1);
}

console.log(
  `Validated ${allMathsTopics.length} maths topics (${year1MathsTopics.length} Year 1, ${ks2MathsTopics.length} KS2 drafts). No issues.`,
);
