export const JUDGE_CHECKS = [
  "accuracy",
  "ambiguity",
  "assumedKnowledge",
  "style",
  "coherence",
] as const;

export type JudgeCheck = (typeof JUDGE_CHECKS)[number];

export type JudgeSeverity = "blocking" | "note";

export type JudgeSourceKind = "topic" | "script";

export type JudgeSpanRole =
  | "teaching"
  | "caution"
  | "meta"
  | "kit"
  | "script-link"
  | "script-visual";

export type JudgeSpan = {
  id: string;
  fieldPath: string;
  text: string;
  order: number;
  role: JudgeSpanRole;
};

export type JudgeDocument = {
  sourceKind: JudgeSourceKind;
  topicId: string;
  title: string;
  spans: JudgeSpan[];
  /** Terms already taught in prerequisite lessons. */
  unlockedTermIds: string[];
  /** Terms this lesson is responsible for introducing. */
  introducingTermIds: string[];
  /** Classroom terms that appear in the source pack text (script fidelity). */
  sourceTermIds: string[];
  avoidThis: string[];
};

export type JudgeFinding = {
  check: JudgeCheck;
  severity: JudgeSeverity;
  fieldPath: string;
  span: string;
  message: string;
  evidence: string;
  coverId: string;
};

export type JudgeReport = {
  topicId: string;
  title: string;
  sourceKind: JudgeSourceKind;
  spanCount: number;
  findings: JudgeFinding[];
};

export type EvalCase = {
  id: string;
  topicId: string;
  fieldPath?: string;
  excerpt: string;
  /** Check that should fire. Null means the judge must stay silent on this excerpt. */
  expectedCheck: JudgeCheck | null;
  expectedCoverId?: string;
  note: string;
  source: "fixture" | "language-note";
};

export type CoverageOutcome = "hit" | "miss" | "noise" | "partial" | "silent-ok";

export type CoverageRow = {
  caseId: string;
  outcome: CoverageOutcome;
  expectedCheck: JudgeCheck | null;
  matchedChecks: JudgeCheck[];
  note: string;
};

export type CoverageReport = {
  rows: CoverageRow[];
  hits: number;
  misses: number;
  noise: number;
  silentOk: number;
};

export type ProposedCover = {
  check: JudgeCheck;
  title: string;
  rationale: string;
  missIds: string[];
  kind: "phrase" | "probe" | "term-unlock";
  suggestedFind?: string;
};
