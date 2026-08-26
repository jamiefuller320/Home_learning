import { DFE_Y1_MATHS, NC_MATHS } from "../sources";
import type { Topic } from "@/content/schema";

export const partsOf10: Topic = {
  id: "parts-of-10",
  slug: "parts-of-10",
  title: "Making and breaking numbers to 10",
  shortTitle: "Parts of 10",
  summary: "See that 8 can be 5 and 3, or 4 and 4, and it is still 8.",
  jurisdiction: "england",
  keyStage: "ks1",
  year: 1,
  subject: "maths",
  strand: "Addition and subtraction",
  prerequisites: ["numbers-to-20"],
  glossaryTerms: ["compose", "partition", "part-whole", "conservation-of-number", "number-bond"],
  parentMinutes: 7,
  homeMinutes: 12,
  householdItems: ["Up to 10 identical objects (buttons, crayons, grapes)", "A plate or piece of paper torn into a ‘whole’ and two ‘parts’"],
  statutoryOutcomes: [
    "Represent and use number bonds and related subtraction facts within 20",
    "Read, write and interpret mathematical statements involving addition (+), subtraction (−) and equals (=) signs",
  ],
  readyToProgress: ["1AS-1"],
  sources: [NC_MATHS, DFE_Y1_MATHS],
  whyThisMatters:
    "This is the idea underneath addition and subtraction. If a child can only think of 8 as ‘the next number after 7’, they will struggle when school asks them to split 8 or build 8 from two parts.",
  parentBriefing: {
    inPlainEnglish:
      "Compose means put parts together to make a whole. Partition means break a whole into parts. 8 is 8, whether it is a stick of 8 crayons, a group of 5 and 3, or 4 and 4. The number does not change when you split it. That surprise is the lesson.",
    howSchoolTeachesIt:
      "You will see a ‘cherry’ or part–whole drawing: one circle for the whole, two circles for the parts, with lines joining them. Teachers also hide some objects under a cloth: “5 in the whole, 2 showing, how many hiding?” That is subtraction as missing part, not as ‘take away’ only.",
    sayThis: [
      "The whole is 7. Show me two parts that make 7.",
      "Is there another way? 7 can be made in more than one way.",
      "You hid some. I can see 3. The whole was 8. How many are hiding?",
      "Moving them apart did not make more or less. Check by pushing them back together.",
    ],
    avoidThis: [
      "Only ever using 5 + 5 or 10 + 0. The interesting work is the other splits.",
      "Writing a formal sum before they have moved the objects.",
      "Saying ‘that’s wrong’ when they offer 6 and 1 for 7. Ask for a second way instead.",
    ],
    commonMisconceptions: [
      {
        misconception: "They think splitting 8 into 3 and 5 makes a smaller number because the groups look smaller.",
        why: "Conservation of number is still settling in.",
        instead: "Push the groups back together every time and recount the whole once.",
      },
      {
        misconception: "They only ever split into 1 and the rest.",
        why: "It is the first pattern they found.",
        instead: "Ask for a ‘nearly equal’ split and a ‘very uneven’ split of the same number.",
      },
    ],
    youAreReadyWhen: "You can take 8 grapes and find at least three different pairs of parts without writing anything down.",
  },
  homePack: {
    setup: "Sit with 8 objects and a cloth, mug, or hand to hide some. Draw a big circle and two smaller ones if you like, but objects come first.",
    activity: {
      title: "Hidden parts",
      steps: [
        "Count 8 together. That is the whole. Split them into two groups. Name the parts. Push back together and agree it is still 8.",
        "Find two more splits of 8. Include 4 and 4.",
        "You hide some of the 8. Show the rest. “How many are hiding?” Let them check by lifting the cloth.",
        "If 8 is easy, try the same with 6 or 9. If it is hard, stay with 5.",
      ],
      tip: "Keep the whole visible as a number you both say out loud. The mystery is only the hidden part.",
    },
    check: [
      {
        prompt: "Show two ways to make 6.",
        looksLike: "Two different pairs, such as 1+5 and 3+3, with objects.",
        notYet: "Only one way, or the parts no longer add to 6.",
      },
      {
        prompt: "Whole is 9, one part is 2. Other part?",
        looksLike: "7, after thinking or using objects.",
        notYet: "They add 9 and 2, or guess a number bigger than 9.",
      },
      {
        prompt: "I split 8 into 5 and 3. Have I still got 8?",
        looksLike: "Yes, and they can push them together to show it.",
        notYet: "They think there are now 5, or 3, or 13.",
      },
    ],
    stretch: "Ask them to tell you a split you must hide. They become the teacher for one turn.",
    stopRule: "Stop after a few successful hides. Do not empty the fruit bowl ‘for maths’.",
  },
  reviewStatus: "draft",
};
