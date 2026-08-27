export const JURISDICTIONS = ["england"] as const;
export const KEY_STAGES = ["ks1"] as const;
export const SUBJECTS = ["maths"] as const;
export const REVIEW_STATUSES = ["draft", "reviewed"] as const;

export type Jurisdiction = (typeof JURISDICTIONS)[number];
export type KeyStage = (typeof KEY_STAGES)[number];
export type Subject = (typeof SUBJECTS)[number];
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export type Source = {
  label: string;
  url: string;
  note: string;
};

export type Misconception = {
  misconception: string;
  why: string;
  instead: string;
};

export type CheckItem = {
  prompt: string;
  looksLike: string;
  notYet: string;
  nudge?: string;
};

export type NumberLineGuide = {
  start: number;
  end: number;
  marks: number[];
  caption: string;
};

export type HomeActivity = {
  title: string;
  steps: string[];
  tip?: string;
  numberLine?: NumberLineGuide;
};

export type SayThisPrompt = {
  prompt: string;
  /** What the parent might hear — optional reveal, not coaching the child. */
  listenFor?: string;
};

export type SayThisItem = string | SayThisPrompt;

export type ParentBriefing = {
  inPlainEnglish: string;
  howSchoolTeachesIt: string;
  sayThis: SayThisItem[];
  avoidThis: string[];
  commonMisconceptions: Misconception[];
  youAreReadyWhen: string;
};

export type HomePack = {
  setup: string;
  activity: HomeActivity;
  check: CheckItem[];
  stretch?: string;
  stopRule: string;
};

export type Topic = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  jurisdiction: Jurisdiction;
  keyStage: KeyStage;
  year: 1;
  subject: Subject;
  strand: string;
  /** Topic ids that should feel solid before this one. Empty means no required prior step. */
  prerequisites: string[];
  /** Glossary term ids highlighted in this topic’s text. */
  glossaryTerms: string[];
  parentMinutes: number;
  homeMinutes: number;
  householdItems: string[];
  statutoryOutcomes: string[];
  readyToProgress: string[];
  sources: Source[];
  whyThisMatters: string;
  parentBriefing: ParentBriefing;
  homePack: HomePack;
  reviewStatus: ReviewStatus;
  /** Optional generated parent-briefing preview. The written pack stays the source. */
  parentVideo?: {
    src: string;
    caption: string;
  };
};

export type GlossaryTerm = {
  id: string;
  /** Display label, e.g. “ten-frame”. */
  term: string;
  /** Extra phrases to auto-link in lesson text (longest matches win). */
  aliases?: string[];
  plainEnglish: string;
  /** Other glossary ids to cross-link. */
  seeAlso?: string[];
  /** Topic ids where this term matters most. */
  relatedTopics?: string[];
};

export const CONTENT_LIMITS = {
  minParentMinutes: 5,
  maxParentMinutes: 8,
  minHomeMinutes: 10,
  maxHomeMinutes: 15,
  minChecks: 3,
  maxChecks: 3,
  minSayThis: 3,
  minAvoidThis: 2,
  minMisconceptions: 2,
  minSources: 1,
  minActivitySteps: 3,
} as const;
