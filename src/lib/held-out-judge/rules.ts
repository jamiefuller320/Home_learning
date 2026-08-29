import { learnings, type PhraseLearning } from "@/content/learnings";
import type { JudgeCheck } from "./types";

export type ClassroomTermRule = {
  id: string;
  /** Phrases to match in lesson text (longest first at use). */
  phrases: string[];
  /** Same-sentence hints that count as a gloss. */
  glossHints: string[];
  /** Skip assumed-knowledge matching (everyday English). */
  everyday?: boolean;
};

/**
 * Classroom terms the judge tracks. Everyday comparison words are omitted
 * so “short” / “longer” do not flood every pack.
 */
export const CLASSROOM_TERMS: ClassroomTermRule[] = [
  {
    id: "ten-frame",
    phrases: ["ten-frames", "ten frames", "ten-frame", "ten frame"],
    glossHints: ["two rows of five", "grid of exactly ten", "ten spaces", "10 spaces", "10 cells"],
  },
  {
    id: "number-bond",
    phrases: ["number bonds", "number bond"],
    glossHints: ["two parts that make", "two parts that join", "parts that make a whole", "pair a number"],
  },
  {
    id: "part-whole",
    phrases: ["part–whole", "part-whole"],
    glossHints: ["one whole", "two parts", "cherry", "parts that make"],
  },
  {
    id: "compose",
    phrases: ["compose", "composing"],
    glossHints: ["put parts together", "means put", "join"],
  },
  {
    id: "partition",
    phrases: ["partition", "partitioning"],
    glossHints: ["break a whole", "means break", "split"],
  },
  {
    id: "number-fact",
    phrases: ["number facts", "number fact"],
    glossHints: ["small truth", "small addition", "without a long count"],
  },
  {
    id: "fluency",
    phrases: ["fluency"],
    glossHints: ["does not mean", "without starting from scratch", "available without"],
  },
  {
    id: "number-line",
    phrases: ["number lines", "number line"],
    glossHints: ["picture of order", "marks on a line", "along a line", "distance"],
  },
  {
    id: "number-track",
    phrases: ["number tracks", "number track"],
    glossHints: ["boxes with a number", "numbered boxes", "own cell"],
  },
  {
    id: "conservation-of-number",
    phrases: ["conservation of number"],
    glossHints: ["stays the same", "does not change when you split"],
  },
  {
    id: "skip-counting",
    phrases: ["skip-counting", "skip counting"],
    glossHints: ["counting in 2s", "equal jumps", "equal steps", "2, 4, 6"],
  },
  {
    id: "number-word",
    phrases: ["number words", "number word"],
    glossHints: ["using letters", "fourteen, not 14", "in words"],
  },
  {
    id: "2d-shape",
    phrases: ["2-d shapes", "2-d shape", "flat shapes", "flat shape"],
    glossHints: ["flat", "draw on paper", "circle, triangle"],
  },
  {
    id: "3d-shape",
    phrases: ["3-d shapes", "3-d shape", "solid shapes", "solid shape"],
    glossHints: ["objects you can hold", "pick up", "sphere", "cuboid"],
  },
  {
    id: "half",
    phrases: ["halves", "a half", "half of", "half means"],
    glossHints: ["two equal parts", "one of two", "equal parts"],
    everyday: true,
  },
  {
    id: "quarter",
    phrases: ["quarters", "a quarter", "quarter of", "quarter means"],
    glossHints: ["four equal parts", "one of four"],
    everyday: true,
  },
];

export const CLASSROOM_SHORTHAND: { coverId: string; pattern: RegExp; label: string }[] = [
  { coverId: "style-on-the-board", pattern: /\bon the board\b/i, label: "on the board" },
  { coverId: "style-when-they-land", pattern: /\bwhen they land\b/i, label: "when they land" },
  { coverId: "style-carpet-session", pattern: /\bcarpet session\b/i, label: "carpet session" },
  { coverId: "style-mini-plenary", pattern: /\bmini[- ]plenary\b/i, label: "mini plenary" },
  { coverId: "style-walt", pattern: /\bWALT\b/, label: "WALT" },
  { coverId: "style-success-criteria", pattern: /\bsuccess criteria\b/i, label: "success criteria" },
  { coverId: "style-in-your-books", pattern: /\bin your books\b/i, label: "in your books" },
  { coverId: "style-worksheet-brand", pattern: /\bworksheet brand\b/i, label: "worksheet brand" },
];

export const METHOD_CLASHES: { coverId: string; pattern: RegExp; label: string }[] = [
  { coverId: "accuracy-column-addition", pattern: /\bcolumn addition\b/i, label: "column addition" },
  { coverId: "accuracy-carrying", pattern: /\bcarry(?:ing)? the (?:one|ten)\b/i, label: "carrying" },
  { coverId: "accuracy-bigger-in-head", pattern: /\bbigger number in your head\b/i, label: "put the bigger number in your head" },
  { coverId: "accuracy-timed-test", pattern: /\btimed tests?\b/i, label: "timed tests" },
  { coverId: "accuracy-faster-faster", pattern: /\bfaster,\s*faster\b/i, label: "faster, faster" },
];

const WARNING = /\b(don'?t|do not|avoid|not|never|ban(?:ning)?|anxiety|clash)\b/i;

export function looksLikeWarning(text: string): boolean {
  return WARNING.test(text);
}

export function phraseLearnings(): PhraseLearning[] {
  return learnings.filter((learning): learning is PhraseLearning => learning.kind === "phrase");
}

export type PointingPattern = {
  coverId: string;
  pattern: RegExp;
  pictureA: string;
  pictureB: string;
};

export const POINTING_PATTERNS: PointingPattern[] = [
  {
    coverId: "ambiguity-other-box",
    pattern: /\bthe other (box|one|side|group|pile|container)\b/i,
    pictureA: "A second object already on the table.",
    pictureB: "A leftover bit of kit the sentence never named.",
  },
  {
    coverId: "ambiguity-leftover",
    pattern: /\bthe leftover\b/i,
    pictureA: "Objects still unused from the count.",
    pictureB: "Spare household kit, not part of the maths.",
  },
  {
    coverId: "ambiguity-the-middle",
    pattern: /\bthe middle\b/i,
    pictureA: "The midpoint of a line or row already named in this sentence.",
    pictureB: "The middle of the table, the page, or a group of objects.",
  },
  {
    coverId: "ambiguity-left-right",
    pattern: /\b(on the left|on the right|left \/ middle \/ right)\b/i,
    pictureA: "Positions on a number line or track already in view.",
    pictureB: "The parent’s left and right as they sit at the table.",
  },
];

const MIDDLE_ANCHORS =
  /\b(number line|number track|hundred square|track|line|row|0\b|end|between|equals sign|of the objects|spoon)\b/i;

export function pointingHasAnchor(text: string, coverId: string): boolean {
  if (coverId === "ambiguity-the-middle") return MIDDLE_ANCHORS.test(text);
  if (coverId === "ambiguity-left-right") {
    return /\b(number line|number track|step|line|plate|object|equals)\b/i.test(text);
  }
  if (coverId === "ambiguity-other-box") return /\b(two|both|first|one type|one colour|one color)\b/i.test(text);
  return false;
}

export function checkLabel(check: JudgeCheck): string {
  switch (check) {
    case "accuracy":
      return "language accurate";
    case "ambiguity":
      return "meaning unambiguous";
    case "assumedKnowledge":
      return "assumed knowledge";
    case "style":
      return "standardised style";
    case "coherence":
      return "coherent after change";
  }
}
