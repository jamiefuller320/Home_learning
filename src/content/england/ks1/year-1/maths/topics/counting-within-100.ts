import { DFE_Y1_MATHS, NC_MATHS } from "../sources";
import type { Topic } from "@/content/schema";

export const countingWithin100: Topic = {
  id: "counting-within-100",
  slug: "counting-within-100",
  title: "Counting forwards and backwards within 100",
  shortTitle: "Counting to 100",
  summary: "Start from any number, not always from 1, and be able to go both ways.",
  jurisdiction: "england",
  keyStage: "ks1",
  year: 1,
  subject: "maths",
  strand: "Number and place value",
  prerequisites: [],
  glossaryTerms: [],
  parentMinutes: 6,
  homeMinutes: 12,
  householdItems: ["Stairs, steps, or a walking route", "A handful of dried pasta, coins, or Lego"],
  statutoryOutcomes: [
    "Count to and across 100, forwards and backwards, beginning with 0 or 1, or from any given number",
    "Count, read and write numbers to 100 in numerals",
  ],
  readyToProgress: ["1NPV-1"],
  sources: [NC_MATHS, DFE_Y1_MATHS],
  whyThisMatters:
    "If counting is only a list that always starts at 1, children get stuck the moment school asks “what comes after 37?” Secure counting is the base for almost every later number idea.",
  parentBriefing: {
    inPlainEnglish:
      "Counting is not just reciting 1, 2, 3. Year 1 children need to start from any number, keep going past 20 and 30 without a wobble, and count backwards as well as forwards. They also need to count objects, not only words: one touch, one word, one thing.",
    howSchoolTeachesIt:
      "School will mix three things: saying the number names in order, counting a set of objects, and finding a number on a track or hundred square. Teachers often start from a number in the middle, such as 16, 28, or 45, so children do not only rely on a count that always starts at 1. They will also count back, which feels much harder and is worth a little extra practice at home.",
    sayThis: [
      {
        prompt: "Start at 14. What comes next?",
        listenFor: "15 — the next number after 14.",
      },
      {
        prompt: "Can you count back from 20? I’ll do the first two with you: 20, 19…",
        listenFor: "18, then 17, 16… stepping down one at a time.",
      },
      "Touch each piece as you say the number. When they are all in the bowl, we stop.",
      "If you lose your place, we can start that bit again. That is part of counting.",
    ],
    avoidThis: [
      "Always starting at 1. That hides the gaps.",
      "Rushing to 100 as a performance. A calm count from 27 to 40 is more useful.",
      "Correcting every stumble instantly. Pause for a moment, then say the next number if they are stuck.",
    ],
    commonMisconceptions: [
      {
        misconception: "The child skips teen numbers or swaps 13 and 30, 14 and 40.",
        why: "Teen and ten words sound alike, and English names them in a messy way.",
        instead: "Slow down on 12 to 20 — say “thirteen, that’s three and ten” and show ten fingers plus three.",
      },
      {
        misconception: "When counting objects they re-count, skip, or say more words than objects.",
        why: "Saying the list and matching it to objects are two skills.",
        instead: "Move each object as it is counted. No moving, no word.",
      },
    ],
    youAreReadyWhen: "You can start at a random number under 40 and count on ten more, then back again, without treating it as a test.",
  },
  homePack: {
    setup: "You need about 20 objects, or you can use the stairs or a short walk. Put phones away. This should feel like a game, not a recitation exam.",
    activity: {
      title: "Start anywhere",
      steps: [
        "You say a starting number between 8 and 25. Your child counts on ten more numbers. Clap each time they say a number in the sequence.",
        "Swap: they pick the starting number, you count on ten more, and they stop you if you say a wrong number.",
        "Do two backwards counts from a number they know well, such as 15 or 20.",
        "Finish by counting a handful of objects into a bowl, moving each one as you say its number. Ask “how many in the bowl?” See if they can answer with the last number they said, without starting the count again.",
      ],
      tip: "If the teen numbers (13, 14, 15…) are shaky, stay in 10–20 for the whole session. You do not need to reach 100 tonight.",
    },
    check: [
      {
        prompt: "Start at 17. Count on to 25.",
        looksLike: "They keep the sequence without going back to 1. Brief pauses are fine.",
        notYet: "They restart at 1, or jump 19 to 21, or stall and guess.",
        nudge: "Whisper the numbers after 17 together: 18, 19, 20… Keep going to 25.",
      },
      {
        prompt: "Count back from 12 to 7.",
        looksLike: "12, 11, 10, 9, 8, 7, with or without fingers.",
        notYet: "They can only go forwards, or they bounce between two numbers.",
        nudge: "Start at 12 and step down one number at a time: 11, 10, 9…",
      },
      {
        prompt: "Put 14 objects in a line. How many?",
        looksLike: "They touch each object once and know the last number they said is how many there are.",
        notYet: "They skip objects, double-count, or cannot say the total at the end.",
        nudge: "Touch each object once as you say a number. The last number you say is the total.",
      },
    ],
    stretch: "On a walk, count steps in a low voice from 30 to 40, then back. Stop if the pavement gets busy.",
    stopRule: "Stop after about 12 minutes, or sooner if voices rise — end on a count they can do, even if it is only 1 to 10.",
  },
  reviewStatus: "draft",
};
