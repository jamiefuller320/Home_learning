import { DFE_Y1_MATHS, NC_MATHS } from "../sources";
import type { Topic } from "@/content/schema";

export const shapesAroundUs: Topic = {
  id: "shapes-around-us",
  slug: "shapes-around-us",
  title: "2-D and 3-D shapes around the house",
  shortTitle: "Shapes",
  summary: "Name common shapes and still know them when they are turned around.",
  jurisdiction: "england",
  keyStage: "ks1",
  year: 1,
  subject: "maths",
  strand: "Geometry",
  prerequisites: [],
  glossaryTerms: ["2d-shape", "3d-shape"],
  parentMinutes: 7,
  homeMinutes: 15,
  householdItems: ["Food boxes, tins, balls, a toilet roll, a book, a ball of playdough or a cushion", "A window, a clock, a slice of toast or a mat"],
  statutoryOutcomes: [
    "Recognise and name common 2-D and 3-D shapes, including rectangles (including squares), circles, triangles, cuboids (including cubes), pyramids and spheres",
  ],
  readyToProgress: ["1G-1"],
  sources: [NC_MATHS, DFE_Y1_MATHS],
  whyThisMatters:
    "Children often only know the ‘perfect poster’ triangle: two sides equal, sitting on its base. School will show skinny triangles, tilted squares, and boxes that are cuboids. The name follows the properties, not the usual picture.",
  parentBriefing: {
    inPlainEnglish:
      "2-D shapes are flat faces: circle, triangle, square, rectangle. 3-D shapes are objects you can hold: sphere, cube, cuboid, pyramid, cylinder. A square is a special rectangle — it has four right angles and four equal sides — and schools do say that. A cereal box is a cuboid even if it is long and thin.",
    howSchoolTeachesIt:
      "Teachers want children to handle shapes, turn them, and talk about faces, edges and whether sides are straight. They will also hunt shapes in the classroom. They do not need formal definitions of every property in Year 1, but they do need more than a matching worksheet of perfect icons.",
    sayThis: [
      "Can you still call it a triangle if I turn it? How many straight sides?",
      "This box is a cuboid. Its faces are rectangles. Can you find a face that is a square?",
      "A sphere is the ball. It is curved all the way. A circle is the flat print it would leave.",
      "Find something that is not a rectangle, and tell me how you know.",
    ],
    avoidThis: [
      "Only showing equilateral triangles pointing up.",
      "Arguing that a square is ‘not a rectangle’. In school maths, it is.",
      "Quizzing every Latin name. Cylinder and cuboid are enough; ‘triangular prism’ can wait.",
    ],
    commonMisconceptions: [
      {
        misconception: "A square on its corner is ‘a diamond’, not a square.",
        why: "Orientation feels like identity.",
        instead: "Turn it slowly back. Count sides and corners. The name travels with the object.",
      },
      {
        misconception: "They call every 3-D object by its face: the tin is ‘a circle’.",
        why: "They see the end that faces them.",
        instead: "Trace the circular face, then hold the whole tin. Face and object have different names.",
      },
    ],
    youAreReadyWhen: "You can pick up a book, a tin and a ball and name cuboid, cylinder and sphere without feeling silly.",
  },
  homePack: {
    setup: "Five-minute shape hunt. You need the house as it is. No printouts.",
    activity: {
      title: "Hunt and turn",
      steps: [
        "Collect four objects: something ball-like, a box, a tin or roll, and something pyramid-like if you have it (a party hat, a closed umbrella point, a Lego roof).",
        "Name each as a 3-D shape. Then point to one flat face and name that 2-D shape.",
        "Draw or air-draw a triangle. Then draw a skinnier one and a tilted one. Still triangles?",
        "Finish by turning a square book or mat onto its corner. “Has it stopped being a square?”",
      ],
      tip: "If you do not have a pyramid, skip it. Cuboid, cube, sphere and cylinder do most of the Year 1 work.",
    },
    check: [
      {
        prompt: "Point to a rectangle in the room that is not a square.",
        looksLike: "A door, a phone, a book cover — and they mention four sides or corners.",
        notYet: "They pick a circle, or they cannot find any once the ‘maths square’ is put away.",
        nudge: "Trace the four sides with your finger. A rectangle has four straight sides — find one that is longer than it is wide.",
      },
      {
        prompt: "What 3-D shape is this ball / piece of fruit?",
        looksLike: "Sphere, or ‘it’s like a sphere’.",
        notYet: "Circle, or a shrug.",
        nudge: "A ball is round all over, like a circle stretched into 3-D. Flat circles live on paper; balls are spheres.",
      },
      {
        prompt: "Is this tilted square still a square?",
        looksLike: "Yes, with a reason about sides or corners.",
        notYet: "They insist it is now a diamond and a different shape.",
        nudge: "Turn it back straight. Same four equal sides? Still a square — tilted does not change the shape.",
      },
    ],
    stretch: "Build a bigger cuboid from smaller boxes or Lego. That is the start of composing shapes (1G-2).",
    stopRule: "Fifteen minutes or one room. Do not shape-name the entire house.",
  },
  reviewStatus: "draft",
};
