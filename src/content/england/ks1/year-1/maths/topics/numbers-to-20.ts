import { DFE_Y1_MATHS, NC_MATHS } from "../sources";
import type { Topic } from "@/content/schema";

export const numbersTo20: Topic = {
  id: "numbers-to-20",
  slug: "numbers-to-20",
  title: "Finding numbers to 20 on a line",
  shortTitle: "Numbers to 20",
  summary: "Know where a number lives, not only what comes next in the song.",
  jurisdiction: "england",
  keyStage: "ks1",
  year: 1,
  subject: "maths",
  strand: "Number and place value",
  parentMinutes: 7,
  homeMinutes: 12,
  householdItems: ["A strip of paper or the edge of a table", "A pen or raisins to mark places", "Small toys or spoons as counters"],
  statutoryOutcomes: [
    "Identify and represent numbers using objects and pictorial representations including the number line, and use the language of: equal to, more than, less than (fewer), most, least",
    "Given a number, identify 1 more and 1 less",
  ],
  readyToProgress: ["1NPV-2"],
  sources: [NC_MATHS, DFE_Y1_MATHS],
  whyThisMatters:
    "Children can chant to 20 and still not know that 8 sits closer to 10 than to 0. That ‘where does it live?’ sense is what school means by the linear number system.",
  parentBriefing: {
    inPlainEnglish:
      "A number line is a picture of order and distance. 0 is at one end, 20 at the other, and 10 sits in the middle. ‘One more’ is one step right. ‘One less’ is one step left. The point is not pretty handwriting. It is knowing that 12 is after 11 and a bit past 10.",
    howSchoolTeachesIt:
      "Teachers often start with a number track (boxes with a number in each) and move to a number line (marks on a line). They will ask children to place 0, 10 and 20 first, then drop other numbers in. Comparing uses words like more, fewer, and less — not only plus and minus.",
    sayThis: [
      "If 0 is here and 20 is here, where would 10 sit?",
      "Which is more, 7 or 12? How do you know, without counting from 1?",
      "One more than 14 is the next step along. What number is that?",
      "Show me a number that is less than 10 but more than 5.",
    ],
    avoidThis: [
      "Turning it into a race to write every numeral perfectly. Reading and placing matter more tonight.",
      "Only ever using a 1–20 poster on the wall. A homemade line on the table is better, because they build it.",
      "Saying ‘take away’ when you mean ‘one less on the line’. Keep the language as ‘one less’ / ‘one more’ here.",
    ],
    commonMisconceptions: [
      {
        misconception: "They think bigger numbers should take more space, so 18 is drawn huge and 2 is tiny.",
        why: "They are mixing ‘how many’ with ‘where it sits’.",
        instead: "Keep the marks evenly spaced. The number name changes; the step size does not.",
      },
      {
        misconception: "They can say one more, but point to the wrong side of the line.",
        why: "Left and right on a line is a new code.",
        instead:
          "Make a line on the floor. Put a shoe at the left end for 0 and a shoe at the right end for 20. Walk along it together.",
      },
    ],
    youAreReadyWhen: "You can draw a rough 0–20 line, forget to write 8, and know roughly where it belongs.",
  },
  homePack: {
    setup:
      "Clear a strip of table, or find a long piece of paper. You are going to make a number line that only shows the two ends. Nothing goes in the middle until your child puts it there.",
    activity: {
      title: "Empty line",
      steps: [
        "Set up the empty line: draw one long straight line. Write 0 at the left end and 20 at the right end. Leave the middle blank.",
        "Ask: “Where does 10 live?” Place a raisin or spoon there. Check it is roughly in the middle, halfway from 0 to 20.",
        "Give three numbers — 4, 15 and 11 — one at a time. Your child places a mark or toy for each.",
        "Ask which of two placed numbers is more, and which is closer to 10.",
        "Finish with “one more than 9” and “one less than 16”, pointing to the place before naming it if they can.",
      ],
      numberLine: {
        start: 0,
        end: 20,
        marks: [0, 5, 10, 15, 20],
        caption:
          "If placing is all over the place, write these five numbers on the line first. They are evenly spaced guides — like fence posts along a path. Then cover 5 and 15 and try 4, 11 and 15 again.",
      },
      tip: "The picture above is the extra help. Start with only 0 and 20 showing. Add the extra marks only if your child needs them.",
    },
    check: [
      {
        prompt: "Point to about where 10 is on a 0–20 line that only shows 0 and 20.",
        looksLike: "Near the middle, not next to 0 or 20.",
        notYet: "They guess an end, or count from 1 along the whole line every time.",
        nudge: "Walk from the 0 end toward 20 together. Stop when you think you are halfway. That spot is about 10.",
      },
      {
        prompt: "Which is less, 8 or 13?",
        looksLike: "They use position or ‘8 is before 10’ rather than starting a full count.",
        notYet: "They cannot decide without counting both sets of objects.",
        nudge: "Put a mark for 8 and a mark for 13. The one nearer 0 is less.",
      },
      {
        prompt: "What is one more than 19?",
        looksLike: "20, said with some certainty.",
        notYet: "They say 21, or go back to 1, or do not know what ‘one more’ means.",
        nudge: "One more means the next step after 19 on the line. Point just past 19. That mark is 20.",
      },
    ],
    stretch: "Ask them to place 7 and 17 and talk about what is the same about the words and what is different about the place.",
    stopRule: "Twelve minutes is enough. If the line turns into a drawing lesson, fold the paper and try placing only 0, 10 and 20 tomorrow.",
  },
  reviewStatus: "draft",
};
