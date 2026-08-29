import type { Topic } from "@/content/schema";

export function makeJudgeFixture(partial: Pick<Topic, "id" | "title"> & Partial<Topic>): Topic {
  return {
    slug: partial.id,
    shortTitle: partial.title,
    summary: "Summary.",
    jurisdiction: "england",
    keyStage: "ks1",
    year: 1,
    subject: "maths",
    strand: "Number",
    prerequisites: [],
    glossaryTerms: [],
    parentMinutes: 6,
    homeMinutes: 12,
    householdItems: ["Ten buttons"],
    statutoryOutcomes: ["Count to 10"],
    readyToProgress: [],
    sources: [{ label: "NC", url: "https://example.com", note: "OGL" }],
    whyThisMatters: "Why.",
    parentBriefing: {
      inPlainEnglish: "Plain English.",
      howSchoolTeachesIt: "How school teaches it.",
      sayThis: ["What comes next?"],
      avoidThis: ["Racing.", "Doing the thinking for them."],
      commonMisconceptions: [
        { misconception: "They skip teens.", why: "Sound alike.", instead: "Slow down." },
        { misconception: "They recount.", why: "Two skills.", instead: "Move objects." },
      ],
      youAreReadyWhen: "You can say the idea in your own words.",
    },
    homePack: {
      setup: "Clear a corner of the table.",
      activity: { title: "Try it", steps: ["Set out ten.", "Ask how many.", "Stop if it wobbles."] },
      check: [
        { prompt: "How many?", looksLike: "They say ten.", notYet: "They guess.", nudge: "Count the buttons." },
        { prompt: "One more?", looksLike: "Eleven.", notYet: "Stuck.", nudge: "Add one button." },
        { prompt: "One less?", looksLike: "Nine.", notYet: "Restart.", nudge: "Take one away." },
      ],
      stopRule: "Stop after 12 minutes.",
    },
    reviewStatus: "draft",
    ...partial,
    parentBriefing: {
      inPlainEnglish: "Plain English.",
      howSchoolTeachesIt: "How school teaches it.",
      sayThis: ["What comes next?"],
      avoidThis: ["Racing.", "Doing the thinking for them."],
      commonMisconceptions: [
        { misconception: "They skip teens.", why: "Sound alike.", instead: "Slow down." },
        { misconception: "They recount.", why: "Two skills.", instead: "Move objects." },
      ],
      youAreReadyWhen: "You can say the idea in your own words.",
      ...partial.parentBriefing,
    },
    homePack: {
      setup: "Clear a corner of the table.",
      activity: { title: "Try it", steps: ["Set out ten.", "Ask how many.", "Stop if it wobbles."] },
      check: [
        { prompt: "How many?", looksLike: "They say ten.", notYet: "They guess.", nudge: "Count the buttons." },
        { prompt: "One more?", looksLike: "Eleven.", notYet: "Stuck.", nudge: "Add one button." },
        { prompt: "One less?", looksLike: "Nine.", notYet: "Restart.", nudge: "Take one away." },
      ],
      stopRule: "Stop after 12 minutes.",
      ...partial.homePack,
    },
  };
}

export const fixtureStyle = makeJudgeFixture({
  id: "fixture-style",
  title: "Style fixture",
  parentBriefing: {
    inPlainEnglish: "Write the 1, 2, 3 song on the board so they can see the count.",
    howSchoolTeachesIt: "Keep it short.",
    sayThis: ["What comes next?"],
    avoidThis: ["Racing.", "Doing the thinking for them."],
    commonMisconceptions: [
      { misconception: "They skip teens.", why: "Sound alike.", instead: "Slow down." },
      { misconception: "They recount.", why: "Two skills.", instead: "Move objects." },
    ],
    youAreReadyWhen: "You can say the idea in your own words.",
  },
});

export const fixtureAccuracy = makeJudgeFixture({
  id: "fixture-accuracy",
  title: "Accuracy fixture",
  parentBriefing: {
    inPlainEnglish: "Add by putting the bigger number in your head and counting on.",
    howSchoolTeachesIt: "Keep it short.",
    sayThis: ["Put the bigger number in your head."],
    avoidThis: ["Racing.", "Doing the thinking for them."],
    commonMisconceptions: [
      { misconception: "They skip teens.", why: "Sound alike.", instead: "Slow down." },
      { misconception: "They recount.", why: "Two skills.", instead: "Move objects." },
    ],
    youAreReadyWhen: "You can say the idea in your own words.",
  },
});

export const fixtureAmbiguity = makeJudgeFixture({
  id: "fixture-ambiguity",
  title: "Ambiguity fixture",
  parentBriefing: {
    inPlainEnglish: "Put the leftover in the other box.",
    howSchoolTeachesIt: "Keep it short.",
    sayThis: ["What comes next?"],
    avoidThis: ["Racing.", "Doing the thinking for them."],
    commonMisconceptions: [
      { misconception: "They skip teens.", why: "Sound alike.", instead: "Slow down." },
      { misconception: "They recount.", why: "Two skills.", instead: "Move objects." },
    ],
    youAreReadyWhen: "You can say the idea in your own words.",
  },
});

export const fixtureAssumed = makeJudgeFixture({
  id: "fixture-assumed",
  title: "Assumed knowledge fixture",
  glossaryTerms: ["ten-frame"],
  parentBriefing: {
    inPlainEnglish: "Show 7 on the ten-frame and ask how many more make 10.",
    howSchoolTeachesIt: "Keep it short.",
    sayThis: ["What comes next?"],
    avoidThis: ["Racing.", "Doing the thinking for them."],
    commonMisconceptions: [
      { misconception: "They skip teens.", why: "Sound alike.", instead: "Slow down." },
      { misconception: "They recount.", why: "Two skills.", instead: "Move objects." },
    ],
    youAreReadyWhen: "You can say the idea in your own words.",
  },
});

export const JUDGE_FIXTURES: Topic[] = [fixtureStyle, fixtureAccuracy, fixtureAmbiguity, fixtureAssumed];
