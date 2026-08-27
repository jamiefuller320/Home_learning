import { DFE_Y1_MATHS, NC_MATHS } from "../sources";
import type { Topic } from "@/content/schema";

export const factsWithin10: Topic = {
  id: "facts-within-10",
  slug: "facts-within-10",
  title: "Number facts within 10",
  shortTitle: "Facts within 10",
  summary: "Know the small addition and subtraction facts so they do not count from 1 every time.",
  jurisdiction: "england",
  keyStage: "ks1",
  year: 1,
  subject: "maths",
  strand: "Number facts",
  prerequisites: ["parts-of-10", "numbers-to-20"],
  glossaryTerms: ["ten-frame", "number-bond", "part-whole", "number-fact", "fluency"],
  parentMinutes: 8,
  homeMinutes: 15,
  householdItems: [
    "Ten objects of two colours or types (such as forks and spoons, red and green Lego, raisins and almonds)",
    "A homemade ten-frame with exactly 10 cells: two rows of five circles on paper, a 10-hole muffin tin, or an egg box with 10 holes left open",
  ],
  statutoryOutcomes: [
    "Represent and use number bonds and related subtraction facts within 20",
    "Add and subtract one-digit and two-digit numbers to 20, including 0",
  ],
  readyToProgress: ["1NF-1"],
  sources: [NC_MATHS, DFE_Y1_MATHS],
  whyThisMatters:
    "School wants these facts to become fluent — available without a long count — because later maths uses them constantly. Year 1 starts within 10. Twenty can wait until these feel easy.",
  parentBriefing: {
    inPlainEnglish:
      "A number fact is a small truth such as 6 + 4 = 10 or 7 − 2 = 5. Fluency does not mean shouting answers against a timer. It means the child does not have to start at 1 and climb every time. Fingers, pictures, and objects are allowed. The child uses them to see 6 and 4 making 10, before the fact lives in their head.",
    howSchoolTeachesIt:
      "Most schools use a ten-frame (two rows of five) and a part–whole picture: one whole number made of two parts. They will teach families of facts together: 6 + 4, 4 + 6, 10 − 4, 10 − 6. School often calls that pair a number bond — two parts that make a whole, not a worksheet brand.",
    sayThis: [
      "6 and what make 10?",
      "If 4 is one part and 6 is the other part, what is the whole?",
      "You knew 5 + 5. Does that help with 5 + 6?",
      "Don’t race. See it on the ten-frame first, then see if the words come.",
    ],
    avoidThis: [
      "Timed tests or ‘faster, faster’. Anxiety kills the facts you are trying to grow.",
      "Teaching column addition, carrying, or ‘put the bigger number in your head’ as the first method.",
      "Banning fingers. In Year 1, fingers are a legitimate ten-frame.",
    ],
    commonMisconceptions: [
      {
        misconception: "They can do 3 + 2 with objects but go blank when they see 3 + 2 written.",
        why: "They can see it with objects first. The written 3 + 2 is a later step, not a different sum.",
        instead: "Build it with objects, say it in words, then show the symbols written underneath — not as the starting point.",
      },
      {
        misconception: "They always count all, even for 9 + 1.",
        why: "Counting all is a safe habit and needs a gentle upgrade, not a scolding.",
        instead: "For +1 and +2, practise ‘count on from the larger number’ once the amount is visible.",
      },
    ],
    youAreReadyWhen: "You can show 7 on a ten-frame and see, without counting from 1, that 3 empty spaces make 10.",
  },
  homePack: {
    setup:
      "You need a ten-frame: a grid of exactly 10 spaces, in two rows of five. Egg boxes and muffin tins come in different sizes (6, 10 or 12 holes are common). Count the holes first. If you have a 12-hole box, cover 2 holes so 10 are left open. A 6-hole box is not enough on its own — use paper instead, and draw two rows of five circles. Have ten objects ready.",
    activity: {
      title: "Make 10 in two colours",
      steps: [
        "Fill the frame with 6 of one type. Ask how many empty spaces, then fill them with the other type. Say “6 and 4 make 10”.",
        "Tip them out and hide the 4. Ask “I still have 6. How many are hiding if the whole was 10?”",
        "Repeat with 5 and 5, then 9 and 1. Keep the language: part, part, whole.",
        "If that is steady, try 7 + 2 on the frame without making 10, just to see a fact that is not a bond to 10.",
      ],
      tip: "Stay with bonds to 10 tonight if anything wobbles. One family of facts, known well, beats a scatter of sums.",
    },
    check: [
      {
        prompt: "Show 8 on the frame. How many more to make 10?",
        looksLike: "They see 2 empty spaces, or count the empties once.",
        notYet: "They recount all 8 from the start and still cannot name the complement.",
        nudge: "Count the empty spaces on the frame, or ask what goes with 8 to make 10.",
      },
      {
        prompt: "4 and 6 make…?",
        looksLike: "10, with or without the frame nearby.",
        notYet: "A long count of all ten fingers as if the fact is new each time, after several repeats.",
        nudge: "Fill 4 and 6 on the frame together. Say the total without counting from 1.",
      },
      {
        prompt: "10 take away 1.",
        looksLike: "9, perhaps by imagining one space emptying.",
        notYet: "They remove an object at random or say 10, not linking subtraction to the bond.",
        nudge: "Remove one object or cover one space. How many are left?",
      },
    ],
    stretch: "Ask “7 and 3 make 10. What is 3 and 7?” If they can swap the two parts and still get 10, the idea is sticking.",
    stopRule: "Fifteen minutes or three bonds, whichever comes first. If they get silly or tearful, pack the objects away mid-success.",
  },
  reviewStatus: "draft",
  parentVideo: {
    src: "/videos/facts-within-10-parent-briefing.mp4",
    caption:
      "A generated reading of this briefing, in short beats, with our ten-frame and part–whole pictures. The words on this page are the source.",
  },
};
