import { NC_MATHS } from "../sources";
import type { Topic } from "@/content/schema";

export const comparingLength: Topic = {
  id: "comparing-length",
  slug: "comparing-length",
  title: "Longer, shorter, taller",
  shortTitle: "Comparing length",
  summary: "Compare how long or tall things are using everyday words, then measure with hands or steps.",
  jurisdiction: "england",
  keyStage: "ks1",
  year: 1,
  subject: "maths",
  strand: "Measurement",
  prerequisites: ["numbers-to-20"],
  glossaryTerms: ["compare-length"],
  parentMinutes: 7,
  homeMinutes: 12,
  householdItems: [
    "Two or three pencils, spoons, or sticks of different lengths",
    "A book, a cup, and something to stand against (door frame or wall)",
    "Optional: a piece of string or ribbon",
  ],
  statutoryOutcomes: [
    "Compare, describe and solve practical problems for lengths and heights [for example, long/short, longer/shorter, tall/short, double/half]",
    "Measure and begin to record lengths and heights",
  ],
  readyToProgress: [],
  sources: [NC_MATHS],
  whyThisMatters:
    "Measurement in Year 1 starts with comparing before rulers. School wants children to use words like longer and taller correctly, and to measure with non-standard units (hands, cubes, steps) before centimetres arrive in Year 2.",
  parentBriefing: {
    inPlainEnglish:
      "Comparing length is about which object stretches further, or which person or thing reaches higher. Longer and shorter describe sideways distance; taller and shorter often describe height. The comparison needs a fair start — same baseline, not one pencil on the table and one in the air.",
    howSchoolTeachesIt:
      "Teachers line objects up at one end before comparing. They measure with uniform units: identical cubes, paper clips, or hand spans placed end to end without gaps. They record with words and numbers: “The table is 6 hands long.” Rulers with centimetres are not the main tool in Year 1.",
    sayThis: [
      "Line them up at the same starting place. Now which is longer?",
      "Taller means which one reaches higher when we stand them on the floor.",
      "Let’s measure with your hand. Count how many hands fit along the book.",
      "Write what we found: five hands long. The number goes with the unit.",
    ],
    avoidThis: [
      "Comparing without lining up the ends. That makes the shorter object look longer.",
      "Jumping to a ruler in centimetres because you have one in the drawer.",
      "Using ‘bigger’ when you mean longer or taller. Keep the measurement words precise.",
    ],
    commonMisconceptions: [
      {
        misconception: "The thicker pencil is ‘longer’ because it looks bigger overall.",
        why: "They mix overall size with length.",
        instead: "Compare only the length that sticks out. Turn pencils so they start on the same line.",
      },
      {
        misconception: "A hand span is always the same number because ‘a hand is a hand’.",
        why: "They treat the unit as fixed without noticing gaps or overlapping hands.",
        instead: "Place one hand, mark or remember where it ended, put the next hand touching with no gap.",
      },
    ],
    youAreReadyWhen:
      "You can line up two objects fairly, say which is longer, and measure one thing in hand spans with a number you both agree on.",
  },
  homePack: {
    setup: "Collect three sticks or spoons of different lengths and one book to measure.",
    activity: {
      title: "Line up and measure",
      steps: [
        "Line up two pencils at one end on the table. Ask which is longer and which is shorter. Swap them to check you still agree.",
        "Stand a book upright against the wall and a cup beside it. Ask which is taller. Use the words tall and short.",
        "Measure the book with hand spans. Count together. Say “The book is ___ hands long.”",
        "Pick a third object. Guess how many hands, then measure to check.",
      ],
      tip: "If hand spans are chaotic, use footsteps along the floor for something long, or lay spoons end to end for something small.",
    },
    check: [
      {
        prompt: "Two sticks, lined up fairly. Which is longer?",
        looksLike: "They compare from the same start line and pick correctly.",
        notYet: "They compare from the middle, or say longer because it is thicker.",
        nudge: "Line both sticks up at the same end. Which sticks out further?",
      },
      {
        prompt: "Measure the book in hand spans.",
        looksLike: "A counted number with hands placed end to end, roughly consistently.",
        notYet: "They say “lots” or count hands with big gaps between.",
        nudge: "Place one hand, then the next thumb-to-finger with no big gaps. Count each hand.",
      },
      {
        prompt: "Which is taller, the cup or the book?",
        looksLike: "They use taller/shorter correctly with both standing on the same surface.",
        notYet: "They say bigger, or compare length lying flat when you asked about height.",
        nudge: "Stand both on the table. Look from the bottom up — which reaches higher?",
      },
    ],
    stretch: "Find something twice as long as the shorter pencil using string. Only if comparing already feels easy.",
    stopRule: "One object measured and one comparison is enough. Put the sticks away before they become swords.",
  },
  reviewStatus: "draft",
};
