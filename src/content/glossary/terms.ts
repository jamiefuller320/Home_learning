import type { GlossaryTerm } from "@/content/schema";

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: "ten-frame",
    term: "ten-frame",
    aliases: ["ten frame"],
    plainEnglish:
      "A grid of exactly ten spaces, usually two rows of five. Children fill it with counters to see a number at a glance and spot how many more make ten.",
    seeAlso: ["number-bond", "part-whole"],
    relatedTopics: ["facts-within-10"],
  },
  {
    id: "number-bond",
    term: "number bond",
    aliases: ["number bonds"],
    plainEnglish:
      "Two parts that join to make a whole number — for example 6 and 4 make 10. School often teaches the whole family together: 6 + 4, 4 + 6, 10 − 4, and 10 − 6.",
    seeAlso: ["part-whole", "number-fact", "ten-frame"],
    relatedTopics: ["facts-within-10", "parts-of-10"],
  },
  {
    id: "part-whole",
    term: "part–whole",
    aliases: ["part-whole", "part–whole picture", "part-whole picture"],
    plainEnglish:
      "A way to show that one number (the whole) is made of two smaller numbers (the parts). Splitting and joining the parts does not change the whole.",
    seeAlso: ["compose", "partition", "number-bond"],
    relatedTopics: ["parts-of-10", "facts-within-10", "plus-minus-equals"],
  },
  {
    id: "compose",
    term: "compose",
    plainEnglish: "Put parts together to make a whole. If you join 5 and 3, you compose 8.",
    seeAlso: ["partition", "part-whole"],
    relatedTopics: ["parts-of-10"],
  },
  {
    id: "partition",
    term: "partition",
    plainEnglish: "Break a whole into parts. If you split 8 into 5 and 3, you partition 8.",
    seeAlso: ["compose", "part-whole"],
    relatedTopics: ["parts-of-10", "halves"],
  },
  {
    id: "number-fact",
    term: "number fact",
    aliases: ["number facts"],
    plainEnglish:
      "A small addition or subtraction truth the child knows without a long count — such as 6 + 4 = 10 or 7 − 2 = 5. Fluency means the fact is available, not shouted under pressure.",
    seeAlso: ["number-bond", "fluency"],
    relatedTopics: ["facts-within-10"],
  },
  {
    id: "fluency",
    term: "fluency",
    plainEnglish:
      "Being able to use a fact or method without starting from scratch every time. In Year 1 it still includes fingers, objects, and pictures — not timed tests.",
    seeAlso: ["number-fact"],
    relatedTopics: ["facts-within-10"],
  },
  {
    id: "number-line",
    term: "number line",
    plainEnglish:
      "A picture of numbers in order along a line. Distance on the line shows how far apart numbers are — 8 sits closer to 10 than to 0.",
    seeAlso: ["number-track"],
    relatedTopics: ["numbers-to-20", "counting-in-steps"],
  },
  {
    id: "number-track",
    term: "number track",
    plainEnglish:
      "Numbered boxes in a row, like squares on a board game. Easier than a number line because each number has its own cell. Many children move from a track to a line.",
    seeAlso: ["number-line"],
    relatedTopics: ["numbers-to-20"],
  },
  {
    id: "conservation-of-number",
    term: "conservation of number",
    plainEnglish:
      "Knowing that a number stays the same when you move objects around or split them into groups. Eight grapes are still eight whether they sit in one pile or two.",
    seeAlso: ["part-whole"],
    relatedTopics: ["parts-of-10"],
  },
  {
    id: "skip-counting",
    term: "skip-counting",
    aliases: ["counting in 2s", "counting in 5s", "counting in 10s"],
    plainEnglish:
      "Counting in equal jumps — 2, 4, 6, 8… or 5, 10, 15, 20… — instead of one-by-one. In Year 1 this is about hearing the pattern, not times tables yet.",
    seeAlso: ["number-line"],
    relatedTopics: ["counting-in-steps", "coins"],
  },
  {
    id: "half",
    term: "half",
    aliases: ["halves"],
    plainEnglish:
      "One of two equal parts of a whole. Both halves must match — there is no ‘bigger half’. Half past on a clock uses this same idea of splitting an hour in two.",
    seeAlso: ["partition"],
    relatedTopics: ["halves", "oclock-and-half-past"],
  },
  {
    id: "2d-shape",
    term: "2-D shape",
    aliases: ["2-D shapes", "flat shape", "flat shapes"],
    plainEnglish:
      "A flat shape you can draw on paper — circles, triangles, rectangles, and squares. Turning the shape around does not change what it is.",
    relatedTopics: ["shapes-around-us"],
  },
  {
    id: "3d-shape",
    term: "3-D shape",
    aliases: ["3-D shapes", "solid shape", "solid shapes"],
    plainEnglish:
      "A solid shape you can pick up — balls (spheres), boxes (cuboids), tins (cylinders), and so on. They have faces, edges, and corners you can feel.",
    seeAlso: ["2d-shape"],
    relatedTopics: ["shapes-around-us"],
  },
];
