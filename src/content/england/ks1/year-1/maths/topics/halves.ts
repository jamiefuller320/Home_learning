import { NC_MATHS } from "../sources";
import type { Topic } from "@/content/schema";

export const halves: Topic = {
  id: "halves",
  slug: "halves",
  title: "Halves: two equal parts",
  shortTitle: "Halves",
  summary: "A half is one of two parts that are the same. There is no ‘bigger half’.",
  jurisdiction: "england",
  keyStage: "ks1",
  year: 1,
  subject: "maths",
  strand: "Fractions",
  prerequisites: ["parts-of-10"],
  glossaryTerms: ["half", "partition"],
  parentMinutes: 6,
  homeMinutes: 12,
  householdItems: ["A piece of toast, a banana, a sandwich, or a sheet of paper", "An even number of snacks (such as 6, 8 or 10)", "A cup of water if you do not mind a small spill"],
  statutoryOutcomes: [
    "Recognise, find and name a half as 1 of 2 equal parts of an object, shape or quantity",
  ],
  readyToProgress: [],
  sources: [NC_MATHS],
  whyThisMatters:
    "Halves sit in the Year 1 programme of study even though they are not a ready-to-progress criterion. Parents meet them at snack time every day, and the word is easy to get slightly wrong.",
  parentBriefing: {
    inPlainEnglish:
      "Half means one of two equal parts. Equal is the whole lesson. Half of a shape (toast cut into two matching pieces) and half of a quantity (8 grapes, 4 each) are the same idea. Quarters can wait until halves feel boring.",
    howSchoolTeachesIt:
      "Teachers fold paper, share objects, and pour. They will be strict about equal parts. They connect halves to sharing and to the earlier work on ‘two parts that make a whole’. They also show that two halves make the original whole again.",
    sayThis: [
      "Are these two parts the same? How can we check?",
      "Half of the grapes means we share them into two equal groups.",
      "If one piece is bigger, we have not made halves yet. Let’s adjust.",
      "Two halves should fit back together to make what we started with.",
    ],
    avoidThis: [
      "Saying ‘you can have the bigger half’. Joke only after they know it is a joke.",
      "Cutting wildly unequal pieces and calling them halves ‘because there are two’.",
      "Jumping to written 1/2 notation if the sharing is still shaky. The words are enough.",
    ],
    commonMisconceptions: [
      {
        misconception: "Two pieces means halves, even if one is huge.",
        why: "They heard ‘two parts’ and missed ‘equal’.",
        instead: "Put the pieces on top of each other or count the grapes in each group.",
      },
      {
        misconception: "They can half a shape but not a group of objects, or the reverse.",
        why: "Continuous stuff (toast) and countable stuff (grapes) feel different.",
        instead: "Do one of each in the same sitting and use the same sentence: ‘two equal parts’.",
      },
    ],
    youAreReadyWhen: "You can refuse to call an uneven split a half, kindly, and help them fix it.",
  },
  homePack: {
    setup: "Pick one food you were going to share anyway, plus an even handful of small items.",
    activity: {
      title: "Fair share",
      steps: [
        "Cut or break the toast / banana / paper. Ask if it is a half. If not, say why and try again (fold paper first if cutting is hard).",
        "Share 8 snacks into two groups. Count to check. Name one group as half of 8.",
        "Put the two groups back together. “Two halves make the whole.”",
        "If you have a cup, pour water into two glasses and ask whether it looks like half. Eyeballing is allowed; exact millilitres are not the point.",
      ],
      tip: "Eat the evidence. Maths that vanishes into mouths is still maths.",
    },
    check: [
      {
        prompt: "Is this cut a half? (Show one even and one uneven split.)",
        looksLike: "They pick the equal split and mention same size or same amount.",
        notYet: "They say both are halves ‘because there are two pieces’.",
        nudge: "Hold both pieces together. Are the two parts the same size?",
      },
      {
        prompt: "Half of 6 snacks.",
        looksLike: "Two groups of 3, or they give you 3.",
        notYet: "They give 2, or 4, or split into more than two groups.",
        nudge: "Share six into two equal groups. How many in each group?",
      },
      {
        prompt: "Can we put the two halves back to make the whole?",
        looksLike: "They do it, or explain that we should get the original toast / 6 snacks.",
        notYet: "They think the whole has gone forever once it was split.",
        nudge: "Put the halves back. Same as before you cut?",
      },
    ],
    stretch: "If halves are easy, try a quarter of a piece of paper: four equal parts. Only if they ask.",
    stopRule: "Once the snack is shared fairly, you are done. Do not recut lunch into a worksheet.",
  },
  reviewStatus: "draft",
};
