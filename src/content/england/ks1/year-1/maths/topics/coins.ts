import { NC_MATHS } from "../sources";
import type { Topic } from "@/content/schema";

export const coins: Topic = {
  id: "coins",
  slug: "coins",
  title: "Knowing our coins",
  shortTitle: "Coins",
  summary: "Recognise coins and that some coins are worth more even when they look smaller.",
  jurisdiction: "england",
  keyStage: "ks1",
  year: 1,
  subject: "maths",
  strand: "Measurement",
  prerequisites: ["counting-in-steps", "numbers-to-20"],
  glossaryTerms: ["skip-counting"],
  parentMinutes: 6,
  homeMinutes: 12,
  householdItems: ["A small pile of real coins if you have them (such as 1p, 2p, 5p, 10p, 20p, 50p, £1, £2)", "Otherwise, drawings on scraps of paper labelled with the values"],
  statutoryOutcomes: [
    "Recognise and know the value of different denominations of coins and notes",
  ],
  readyToProgress: [],
  sources: [NC_MATHS],
  whyThisMatters:
    "Money is in the Year 1 measurement programme. Children often think a bigger coin is always worth more. That everyday mix-up is worth a calm evening before anyone tries written pounds and pence.",
  parentBriefing: {
    inPlainEnglish:
      "Year 1 is about recognising coins and knowing what each is worth, not about giving change or writing £1.45. A 5p is worth more than a 2p even if it is smaller. Five 1p coins are worth the same as one 5p.",
    howSchoolTeachesIt:
      "Schools use real or plastic coins, sort them, and make small amounts in more than one way. They will talk about pounds and pence in words. They usually keep amounts within what children can count, often using 1p, 2p, 5p and 10p first.",
    sayThis: [
      "This is 10p. It is worth ten 1p coins, even though it is one coin.",
      "Which is worth more, this 5p or this 2p? How do you know?",
      "Can you make 6p in two different ways?",
      "The size of the coin is not the same as how much it is worth.",
    ],
    avoidThis: [
      "Written £ and p columns, or ‘the decimal point’.",
      "Shop role-play that needs change from £10. That is later.",
      "Pretending a 50p is ‘five and 0’ in the same way as the number 50 on a line, without showing five 10ps.",
    ],
    commonMisconceptions: [
      {
        misconception: "Bigger coin, more money. So 2p beats 5p.",
        why: "Size is the most obvious feature.",
        instead: "Stack 1p coins next to each coin. Worth is a count, not a diameter.",
      },
      {
        misconception: "They count coins instead of value: three coins must be 3p.",
        why: "They are using their counting-objects skill in the wrong place.",
        instead: "Sort by type first, then count each type in 2s, 5s or 10s if they know those chants.",
      },
    ],
    youAreReadyWhen: "You can hold a 2p and a 5p and know which buys more, without thinking about which is physically larger.",
  },
  homePack: {
    setup: "Tip out a handful of coins onto a towel. If you have no coins, draw 1p, 2p, 5p and 10p on paper circles.",
    activity: {
      title: "Sort, then make",
      steps: [
        "Sort the coins into types. Name each type and say its worth.",
        "Put a 2p and a 5p in front of them. “Which is worth more?” Check by matching 1p coins.",
        "Make 10p in at least two ways (ten 1p, one 10p, two 5p, five 2p…).",
        "Finish by letting them ‘buy’ a banana or a book from you for 6p, paying with exact coins if they can.",
      ],
      tip: "Stay with 1p, 2p, 5p and 10p if the pile is confusing. 50p and £2 can be a ‘just look’ extra.",
    },
    check: [
      {
        prompt: "Show me the 10p.",
        looksLike: "They pick it, or correctly name a drawn 10p.",
        notYet: "They pick by size at random, or confuse 10p and 2p.",
        nudge: "Look for the number on the coin, not the size. 10p is smaller than some others but worth more.",
      },
      {
        prompt: "Which is worth more, 5p or 2p?",
        looksLike: "5p, with a reason about five 1ps versus two.",
        notYet: "They pick 2p because it is larger.",
        nudge: "Five 1ps make 5p; two 1ps make 2p. Which pile is worth more?",
      },
      {
        prompt: "Make 6p.",
        looksLike: "Any exact combination, counted by value.",
        notYet: "Six coins of any type, or a guess that is not checked.",
        nudge: "Count in ones: add 1p coins until you reach exactly 6.",
      },
    ],
    stretch: "Make 10p without using a 10p coin. That forces grouping.",
    stopRule: "Coins go back in the pot after 12 minutes. This is not a shop that stays open all evening.",
  },
  reviewStatus: "draft",
};
