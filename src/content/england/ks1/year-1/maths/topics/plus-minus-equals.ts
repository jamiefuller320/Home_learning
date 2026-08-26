import { DFE_Y1_MATHS, NC_MATHS } from "../sources";
import type { Topic } from "@/content/schema";

export const plusMinusEquals: Topic = {
  id: "plus-minus-equals",
  slug: "plus-minus-equals",
  title: "What +, − and = actually mean",
  shortTitle: "+ − =",
  summary: "Equals means ‘the same as’, not ‘put the answer after this’.",
  jurisdiction: "england",
  keyStage: "ks1",
  year: 1,
  subject: "maths",
  strand: "Addition and subtraction",
  parentMinutes: 8,
  homeMinutes: 12,
  householdItems: ["Two plates or pieces of paper", "Up to 10 small objects", "A pen and scrap paper"],
  statutoryOutcomes: [
    "Read, write and interpret mathematical statements involving addition (+), subtraction (−) and equals (=) signs",
    "Solve one-step problems that involve addition and subtraction, using concrete objects and pictorial representations, and missing number problems such as 7 = ? − 9",
  ],
  readyToProgress: ["1AS-2"],
  sources: [NC_MATHS, DFE_Y1_MATHS],
  whyThisMatters:
    "If a child learns that = means ‘the answer is next’, they hit a wall when school writes 7 = 3 + 4 or 8 = ☐ + 3. That wall appears early, and it is easier to avoid than to unlearn.",
  parentBriefing: {
    inPlainEnglish:
      "Plus means join or add a part. Minus means a part is missing or taken off. Equals means both sides are worth the same. It is a balance, not a full stop. So 3 + 4 = 7, 7 = 3 + 4, and 3 + 4 = 5 + 2 can all be true.",
    howSchoolTeachesIt:
      "Teachers put objects on two sides of a table or a drawn balance. They will write the same story in more than one order, and they will leave a box for a missing number. You may see 7 = ☐ − 2, which feels backwards if you grew up with ‘sum, then answer’.",
    sayThis: [
      "Is this side the same as that side?",
      "7 is the same as 3 and 4. Can we write that both ways?",
      "The box is a number we have not named yet. What would make both sides the same?",
      "Minus can mean ‘how many were taken’ or ‘how many are hiding’, not only ‘count backwards’.",
    ],
    avoidThis: [
      "Always writing sums as 3 + 4 = ☐ with the box on the right.",
      "Saying ‘equals means the answer’. Say ‘same as’ or ‘balances’.",
      "Teaching ‘add means plus, take away means minus’ as the only stories. Missing-part stories matter too.",
    ],
    commonMisconceptions: [
      {
        misconception: "They put the total immediately after the first plus, as if 3 + 4 = 7 + 2 must start 3 + 4 = 7…",
        why: "They are reading left to right like a sentence that ends at =.",
        instead: "Cover the symbols. Build both sides with objects, then reveal the writing.",
      },
      {
        misconception: "They think a longer looking sentence must be a bigger number.",
        why: "More ink looks like more stuff.",
        instead: "Compare 5 + 1 and 6 with objects. Same whole, different writing.",
      },
    ],
    youAreReadyWhen: "You are comfortable writing 6 = 2 + 4 as well as 2 + 4 = 6, and you can say why both are fine.",
  },
  homePack: {
    setup: "Two plates are the two sides. A spoon in the middle is the equals sign. Paper is only for later.",
    activity: {
      title: "Same as",
      steps: [
        "Put 5 objects on the left plate. On the right, put 2 and 3. Agree they are the same. Say “5 is the same as 2 + 3”.",
        "Swap the plates. Say it the other way: “2 + 3 is the same as 5”.",
        "Clear the right plate. Ask them to make the same as 6 in two parts.",
        "Write one of the stories, once with = in the middle of the objects and once with 6 = ☐ + 1. Fill the box together.",
      ],
      tip: "If symbols cause a freeze, stay on plates for the whole session. The writing can wait a day.",
    },
    check: [
      {
        prompt: "Can 4 + 2 and 6 be the same?",
        looksLike: "Yes, shown with objects or a clear verbal ‘same as’.",
        notYet: "They think you can only write 4 + 2 = 6, or they add 4 + 2 + 6.",
        nudge: "Lay out 4 and 2 on one side, 6 on the other. Same amount on both sides?",
      },
      {
        prompt: "6 = 5 + ☐",
        looksLike: "1, perhaps after putting 6 on one plate and 5 on the other.",
        notYet: "They write 11, adding every number they see.",
        nudge: "Put 6 objects as the whole. Move 5 to one part. How many in the other?",
      },
      {
        prompt: "Read 7 − 2 = 5 in words.",
        looksLike: "Something like “7 take away 2 is the same as 5” or “2 hidden from 7 leaves 5”.",
        notYet: "They cannot attach any story to the symbols.",
        nudge: "Point to each symbol. Seven, take away two, leaves five.",
      },
    ],
    stretch: "Build 3 + 3 on one plate and 4 + 2 on the other. Both equal 6. That is the seed of later missing-number work.",
    stopRule: "If the plates become a fight about fairness of snacks, you have accidentally invented a better lesson — and also it is time to eat them.",
  },
  reviewStatus: "draft",
};
