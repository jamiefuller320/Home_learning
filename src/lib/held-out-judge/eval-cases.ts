import type { EvalCase } from "./types";

/**
 * Frozen exam questions for the judge. Replay after any new cover.
 * Human language notes can be appended via evalCasesFromLanguageNotes.
 */
export const FROZEN_EVAL_CASES: EvalCase[] = [
  {
    id: "style-on-the-board",
    topicId: "fixture-style",
    excerpt: "on the board",
    expectedCheck: "style",
    expectedCoverId: "style-on-the-board",
    note: "Classroom shorthand should fail style.",
    source: "fixture",
  },
  {
    id: "style-song-learning",
    topicId: "fixture-style",
    excerpt: "1, 2, 3 song",
    expectedCheck: "style",
    expectedCoverId: "learning-no-counting-as-song",
    note: "Known phrase learning should still fire.",
    source: "fixture",
  },
  {
    id: "accuracy-head",
    topicId: "fixture-accuracy",
    excerpt: "bigger number in your head",
    expectedCheck: "accuracy",
    expectedCoverId: "accuracy-bigger-in-head",
    note: "A teaching prompt must not recommend a banned method.",
    source: "fixture",
  },
  {
    id: "ambiguity-leftover",
    topicId: "fixture-ambiguity",
    excerpt: "the leftover",
    expectedCheck: "ambiguity",
    expectedCoverId: "ambiguity-leftover",
    note: "Two-picture test for an unnamed leftover.",
    source: "fixture",
  },
  {
    id: "assumed-ten-frame",
    topicId: "fixture-assumed",
    excerpt: "ten-frame",
    expectedCheck: "assumedKnowledge",
    note: "Own classroom term used before a gloss.",
    source: "fixture",
  },
  {
    id: "silent-number-fact-gloss",
    topicId: "facts-within-10",
    excerpt: "A number fact is a small truth",
    expectedCheck: null,
    note: "Glossed first use should pass.",
    source: "fixture",
  },
  {
    id: "silent-middle-on-line",
    topicId: "numbers-to-20",
    excerpt: "10 sits in the middle",
    expectedCheck: null,
    note: "“The middle” is anchored to the number line in the same sentence.",
    source: "fixture",
  },
  {
    id: "script-invent-ten-frame",
    topicId: "shapes-around-us",
    excerpt: "ten-frame",
    expectedCheck: null,
    note: "Compiled script must not invent a ten-frame for a shapes pack.",
    source: "fixture",
  },
  {
    id: "silent-counting-no-ten-frame",
    topicId: "counting-within-100",
    excerpt: "ten-frame",
    expectedCheck: null,
    note: "Counting to 100 script must compile a track, not a ten-frame.",
    source: "fixture",
  },
];
