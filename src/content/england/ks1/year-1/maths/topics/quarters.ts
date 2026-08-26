import { NC_MATHS } from "../sources";
import type { Topic } from "@/content/schema";

export const quarters: Topic = {
  id: "quarters",
  slug: "quarters",
  title: "Quarters: four equal parts",
  shortTitle: "Quarters",
  summary: "A quarter is one of four equal parts. Same rule as halves: equal matters more than four pieces.",
  jurisdiction: "england",
  keyStage: "ks1",
  year: 1,
  subject: "maths",
  strand: "Fractions",
  prerequisites: ["halves"],
  glossaryTerms: ["quarter", "half"],
  parentMinutes: 6,
  homeMinutes: 12,
  householdItems: [
    "A square of paper, a slice of toast, or a flat biscuit",
    "A small handful of 8 or 12 identical snacks",
    "Scissors or hands for folding",
  ],
  statutoryOutcomes: [
    "Recognise, find and name a quarter as 1 of 4 equal parts of an object, shape or quantity",
  ],
  readyToProgress: [],
  sources: [NC_MATHS],
  whyThisMatters:
    "Quarters sit beside halves in the Year 1 programme of study. They turn up when folding paper, sharing snacks four ways, and later when talking about turns and clocks. The word is easy to say before the idea of equal parts is secure.",
  parentBriefing: {
    inPlainEnglish:
      "A quarter is one of four equal parts of the same whole. Four unequal slices of pizza are not quarters, even if there are four of them. Halves split into two equal parts; quarters split into four. Two quarters make a half; four quarters make the whole again.",
    howSchoolTeachesIt:
      "Teachers fold paper in half, then in half again, to show four equal parts. They share 8 or 12 objects into four equal groups and call one group a quarter of the whole. They link back to halves: fold once for two parts, fold again for four.",
    sayThis: [
      "Are these four parts the same size? That is what makes them quarters.",
      "One quarter of 8 means four equal groups. How many in each group?",
      "Two quarters is the same as a half. Let’s check with the paper.",
      "If one piece is bigger, we have four pieces — not four quarters yet.",
    ],
    avoidThis: [
      "Calling any four pieces quarters without checking they are equal.",
      "Rushing to write 1/4 before they can fold or share fairly.",
      "Mixing up quarter past the hour with quarter of a shape in the same breath tonight. Keep this about equal parts.",
    ],
    commonMisconceptions: [
      {
        misconception: "Four pieces automatically means quarters.",
        why: "They learned ‘half’ needed two parts and copied the pattern without ‘equal’.",
        instead: "Put the four paper pieces on top of each other, or count snacks in each group.",
      },
      {
        misconception: "A quarter must be a small piece, so the biggest slice cannot be a quarter.",
        why: "Everyday language uses ‘quarter’ to mean ‘not much’.",
        instead: "Use a square piece of paper. Each quarter is the same shape and size once folded fairly.",
      },
    ],
    youAreReadyWhen:
      "You can fold a square into four equal parts, or share 8 snacks into four equal groups, and name one part as a quarter.",
  },
  homePack: {
    setup: "Have one square-ish piece of paper and 8 identical snacks ready.",
    activity: {
      title: "Fold and share",
      steps: [
        "Fold the paper in half, then in half again. Open it and count four equal parts. Colour one part and say “one quarter”.",
        "Share 8 snacks into four equal groups. Count each group. One group is a quarter of 8.",
        "Push two groups together. “Two quarters is the same as a half.” Check against a half fold if you did halves before.",
        "Rip or cut one uneven set of four pieces and ask whether they are quarters. Fix or reject together.",
      ],
      tip: "Square paper folds cleanly. A rectangle works but the four parts look different even when equal — stick to a square if you have one.",
    },
    check: [
      {
        prompt: "Show four equal paper parts. Point to one quarter.",
        looksLike: "They pick one of the equal parts and use the word quarter.",
        notYet: "They pick the biggest piece, or any piece without checking equality.",
      },
      {
        prompt: "One quarter of 8 snacks.",
        looksLike: "2 snacks, or four groups of 2 with one group named as the quarter.",
        notYet: "They give 4, or split into two groups only, or groups are unequal.",
      },
      {
        prompt: "Two quarters of the paper square — what do we have?",
        looksLike: "A half, or two of the four equal parts, with some sense of ‘half the square’.",
        notYet: "They say two quarters but cannot show it covers half the paper.",
      },
    ],
    stretch: "Try one quarter of 12 objects. Only if 8 felt easy.",
    stopRule: "Once they have folded fairly and shared 8 four ways, stop. Do not quarter the whole loaf.",
  },
  reviewStatus: "draft",
};
