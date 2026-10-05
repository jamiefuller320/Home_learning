import type { CheckItem, Misconception, SayThisItem, Topic } from "@/content/schema";
import { DFE_PRIMARY_MATHS, NC_MATHS_KS2 } from "./sources";

export type Ks2DraftSpec = {
  id: string;
  year: 3 | 4 | 5 | 6;
  strand: string;
  title: string;
  shortTitle: string;
  summary: string;
  prerequisites?: string[];
  statutoryOutcomes: string[];
  readyToProgress?: string[];
  whyThisMatters: string;
  inPlainEnglish: string;
  howSchoolTeachesIt: string;
  sayThis: SayThisItem[];
  avoidThis: string[];
  misconceptions: [Misconception, Misconception, ...Misconception[]];
  youAreReadyWhen: string;
  householdItems: string[];
  setup: string;
  activityTitle: string;
  steps: [string, string, string, ...string[]];
  tip?: string;
  check: [CheckItem, CheckItem, CheckItem];
  stretch?: string;
  stopRule?: string;
  parentMinutes?: number;
  homeMinutes?: number;
};

export function ks2MathsDraft(spec: Ks2DraftSpec): Topic {
  return {
    id: spec.id,
    slug: spec.id,
    title: spec.title,
    shortTitle: spec.shortTitle,
    summary: spec.summary,
    jurisdiction: "england",
    keyStage: "ks2",
    year: spec.year,
    subject: "maths",
    strand: spec.strand,
    prerequisites: spec.prerequisites ?? [],
    glossaryTerms: [],
    parentMinutes: spec.parentMinutes ?? 7,
    homeMinutes: spec.homeMinutes ?? 12,
    householdItems: spec.householdItems,
    statutoryOutcomes: spec.statutoryOutcomes,
    readyToProgress: spec.readyToProgress ?? [],
    sources: [NC_MATHS_KS2, DFE_PRIMARY_MATHS],
    whyThisMatters: spec.whyThisMatters,
    parentBriefing: {
      inPlainEnglish: spec.inPlainEnglish,
      howSchoolTeachesIt: spec.howSchoolTeachesIt,
      sayThis: spec.sayThis,
      avoidThis: spec.avoidThis,
      commonMisconceptions: spec.misconceptions,
      youAreReadyWhen: spec.youAreReadyWhen,
    },
    homePack: {
      setup: spec.setup,
      activity: {
        title: spec.activityTitle,
        steps: spec.steps,
        tip: spec.tip,
      },
      check: spec.check,
      stretch: spec.stretch,
      stopRule:
        spec.stopRule ??
        "Fifteen minutes is plenty. Stop while they still feel successful — pack the objects away mid-success if they get silly or tired.",
    },
    reviewStatus: "draft",
  };
}
