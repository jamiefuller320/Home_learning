import { sortTopicsByPrerequisites } from "./england/ks1/year-1/maths/curriculum";
import { glossaryTerms } from "./glossary";
import { CONTENT_LIMITS, type Topic } from "./schema";

export type ValidationIssue = {
  topicId: string;
  field: string;
  message: string;
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GLOSSARY_IDS = new Set(glossaryTerms.map((term) => term.id));

function requiredText(value: string, field: string, topicId: string, issues: ValidationIssue[]) {
  if (!value || !value.trim()) {
    issues.push({ topicId, field, message: "must not be empty" });
  }
}

export function validateTopic(topic: Topic): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const id = topic.id || "unknown";

  if (!SLUG.test(topic.id)) issues.push({ topicId: id, field: "id", message: "must be lowercase hyphenated" });
  if (!SLUG.test(topic.slug)) issues.push({ topicId: id, field: "slug", message: "must be lowercase hyphenated" });
  if (topic.id !== topic.slug) {
    issues.push({ topicId: id, field: "slug", message: "must match id in the first slice" });
  }

  requiredText(topic.title, "title", id, issues);
  requiredText(topic.shortTitle, "shortTitle", id, issues);
  requiredText(topic.summary, "summary", id, issues);
  requiredText(topic.strand, "strand", id, issues);
  requiredText(topic.whyThisMatters, "whyThisMatters", id, issues);
  requiredText(topic.parentBriefing.inPlainEnglish, "parentBriefing.inPlainEnglish", id, issues);
  requiredText(topic.parentBriefing.howSchoolTeachesIt, "parentBriefing.howSchoolTeachesIt", id, issues);
  requiredText(topic.parentBriefing.youAreReadyWhen, "parentBriefing.youAreReadyWhen", id, issues);
  requiredText(topic.homePack.setup, "homePack.setup", id, issues);
  requiredText(topic.homePack.activity.title, "homePack.activity.title", id, issues);
  requiredText(topic.homePack.stopRule, "homePack.stopRule", id, issues);

  if (topic.year !== 1) issues.push({ topicId: id, field: "year", message: "first slice is Year 1 only" });
  if (topic.jurisdiction !== "england") issues.push({ topicId: id, field: "jurisdiction", message: "first slice is England only" });
  if (topic.keyStage !== "ks1") issues.push({ topicId: id, field: "keyStage", message: "first slice is KS1 only" });
  if (topic.subject !== "maths") issues.push({ topicId: id, field: "subject", message: "first slice is maths only" });

  if (topic.parentMinutes < CONTENT_LIMITS.minParentMinutes || topic.parentMinutes > CONTENT_LIMITS.maxParentMinutes) {
    issues.push({
      topicId: id,
      field: "parentMinutes",
      message: `must be ${CONTENT_LIMITS.minParentMinutes}–${CONTENT_LIMITS.maxParentMinutes}`,
    });
  }

  if (topic.homeMinutes < CONTENT_LIMITS.minHomeMinutes || topic.homeMinutes > CONTENT_LIMITS.maxHomeMinutes) {
    issues.push({
      topicId: id,
      field: "homeMinutes",
      message: `must be ${CONTENT_LIMITS.minHomeMinutes}–${CONTENT_LIMITS.maxHomeMinutes}`,
    });
  }

  if (topic.householdItems.length === 0) {
    issues.push({ topicId: id, field: "householdItems", message: "need at least one household item" });
  }

  if (topic.statutoryOutcomes.length === 0) {
    issues.push({ topicId: id, field: "statutoryOutcomes", message: "map to at least one statutory outcome" });
  }

  if (topic.sources.length < CONTENT_LIMITS.minSources) {
    issues.push({ topicId: id, field: "sources", message: "cite at least one official source" });
  }

  if (topic.parentBriefing.sayThis.length < CONTENT_LIMITS.minSayThis) {
    issues.push({ topicId: id, field: "parentBriefing.sayThis", message: `need at least ${CONTENT_LIMITS.minSayThis} prompts` });
  }

  if (topic.parentBriefing.avoidThis.length < CONTENT_LIMITS.minAvoidThis) {
    issues.push({ topicId: id, field: "parentBriefing.avoidThis", message: `need at least ${CONTENT_LIMITS.minAvoidThis} cautions` });
  }

  if (topic.parentBriefing.commonMisconceptions.length < CONTENT_LIMITS.minMisconceptions) {
    issues.push({
      topicId: id,
      field: "parentBriefing.commonMisconceptions",
      message: `need at least ${CONTENT_LIMITS.minMisconceptions} misconceptions`,
    });
  }

  if (topic.homePack.activity.steps.length < CONTENT_LIMITS.minActivitySteps) {
    issues.push({ topicId: id, field: "homePack.activity.steps", message: `need at least ${CONTENT_LIMITS.minActivitySteps} steps` });
  }

  if (topic.homePack.check.length !== CONTENT_LIMITS.minChecks) {
    issues.push({ topicId: id, field: "homePack.check", message: "need exactly three check items" });
  }

  topic.homePack.check.forEach((item, index) => {
    requiredText(item.prompt, `homePack.check[${index}].prompt`, id, issues);
    requiredText(item.looksLike, `homePack.check[${index}].looksLike`, id, issues);
    requiredText(item.notYet, `homePack.check[${index}].notYet`, id, issues);
  });

  for (const prerequisiteId of topic.prerequisites) {
    if (!SLUG.test(prerequisiteId)) {
      issues.push({
        topicId: id,
        field: "prerequisites",
        message: `prerequisite "${prerequisiteId}" must be lowercase hyphenated`,
      });
    }
    if (prerequisiteId === topic.id) {
      issues.push({ topicId: id, field: "prerequisites", message: "cannot list itself as a prerequisite" });
    }
  }

  for (const termId of topic.glossaryTerms) {
    if (!GLOSSARY_IDS.has(termId)) {
      issues.push({
        topicId: id,
        field: "glossaryTerms",
        message: `unknown glossary term "${termId}"`,
      });
    }
  }

  return issues;
}

export function validateGlossary(relatedTopicIds: Set<string>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const term of glossaryTerms) {
    if (!SLUG.test(term.id)) {
      issues.push({ topicId: term.id, field: "id", message: "must be lowercase hyphenated" });
    }
    requiredText(term.term, "term", term.id, issues);
    requiredText(term.plainEnglish, "plainEnglish", term.id, issues);

    for (const relatedTopicId of term.relatedTopics ?? []) {
      if (!relatedTopicIds.has(relatedTopicId)) {
        issues.push({
          topicId: term.id,
          field: "relatedTopics",
          message: `unknown topic "${relatedTopicId}"`,
        });
      }
    }

    for (const seeAlsoId of term.seeAlso ?? []) {
      if (!GLOSSARY_IDS.has(seeAlsoId)) {
        issues.push({
          topicId: term.id,
          field: "seeAlso",
          message: `unknown glossary term "${seeAlsoId}"`,
        });
      }
      if (seeAlsoId === term.id) {
        issues.push({ topicId: term.id, field: "seeAlso", message: "cannot reference itself" });
      }
    }
  }

  return issues;
}

export function validateTopics(topics: Topic[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();

  for (const topic of topics) {
    if (ids.has(topic.id)) issues.push({ topicId: topic.id, field: "id", message: "duplicate id" });
    if (slugs.has(topic.slug)) issues.push({ topicId: topic.id, field: "slug", message: "duplicate slug" });
    ids.add(topic.id);
    slugs.add(topic.slug);
    issues.push(...validateTopic(topic));
  }

  for (const topic of topics) {
    for (const prerequisiteId of topic.prerequisites) {
      if (!ids.has(prerequisiteId)) {
        issues.push({
          topicId: topic.id,
          field: "prerequisites",
          message: `unknown prerequisite "${prerequisiteId}"`,
        });
      }
    }

    for (const termId of topic.glossaryTerms) {
      const term = glossaryTerms.find((entry) => entry.id === termId);
      if (term && !(term.relatedTopics ?? []).includes(topic.id)) {
        issues.push({
          topicId: topic.id,
          field: "glossaryTerms",
          message: `term "${termId}" does not list this topic in relatedTopics`,
        });
      }
    }
  }

  try {
    sortTopicsByPrerequisites(topics);
  } catch (error) {
    issues.push({
      topicId: "curriculum",
      field: "prerequisites",
      message: error instanceof Error ? error.message : "invalid prerequisite graph",
    });
  }

  issues.push(...validateGlossary(ids));

  return issues;
}
