import { year1MathsTopics } from "../src/content/england/ks1/year-1/maths/topics";
import { validateTopics } from "../src/content/validate";

const issues = validateTopics(year1MathsTopics);

if (issues.length > 0) {
  for (const issue of issues) {
    console.error(`${issue.topicId} → ${issue.field}: ${issue.message}`);
  }
  console.error(`\n${issues.length} content issue(s) found.`);
  process.exit(1);
}

console.log(`Validated ${year1MathsTopics.length} Year 1 maths topics. No issues.`);
