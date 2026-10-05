import type { GlossaryTerm } from "@/content/schema";

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: "ten-frame",
    term: "ten-frame",
    aliases: ["ten frame", "ten-frames", "ten frames"],
    plainEnglish:
      "A grid of exactly ten spaces, usually two rows of five. Children fill it with counters to see a number at a glance and spot how many more make ten.",
    seeAlso: ["number-bond", "part-whole"],
    relatedTopics: ["facts-within-10", "y2-tens-and-ones", "y2-facts-to-20", "y2-add-subtract-across-10", "y2-add-three-ones"],
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
    relatedTopics: ["facts-within-10", "plus-minus-equals", "parts-of-10", "y2-facts-to-20", "y2-add-subtract-across-10", "y2-inverse-and-missing-numbers"],
  },
  {
    id: "compose",
    term: "compose",
    plainEnglish: "Put parts together to make a whole. If you join 5 and 3, you compose 8.",
    seeAlso: ["partition", "part-whole"],
    relatedTopics: ["parts-of-10", "y4-thousands"],
  },
  {
    id: "partition",
    term: "partition",
    plainEnglish: "Break a whole into parts. If you split 8 into 5 and 3, you partition 8.",
    seeAlso: ["compose", "part-whole"],
    relatedTopics: ["halves", "parts-of-10", "y3-multiply-2-digit-by-1-digit", "y6-numbers-to-10-million"],
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
    relatedTopics: ["facts-within-10", "y2-facts-to-20", "y3-ten-or-hundred-more-less", "y4-written-add-subtract-4-digit", "y4-tables-to-12", "y6-long-multiplication"],
  },
  {
    id: "number-line",
    term: "number line",
    aliases: ["number lines"],
    plainEnglish:
      "A picture of numbers in order along a line. Distance on the line shows how far apart numbers are — 8 sits closer to 10 than to 0.",
    seeAlso: ["number-track"],
    relatedTopics: ["numbers-to-20", "counting-in-steps", "y2-numbers-to-100-on-a-line", "y2-order-to-100", "y2-count-in-2-3-5-10", "y2-add-subtract-two-2-digit", "y2-money-pounds-and-pence", "y3-ten-or-hundred-more-less", "y3-count-in-4-8-50-100", "y3-order-numbers-to-1000", "y3-tables-3-4-8", "y3-tenths", "y3-unit-and-non-unit-fractions", "y3-money", "y4-count-6-7-9-25-1000", "y4-negative-numbers", "y4-mixed-numbers", "y4-decimal-equivalents", "y4-compare-decimals", "y4-convert-measures", "y4-12-and-24-hour", "y5-negative-numbers-in-context", "y5-rounding-large-numbers", "y5-multiply-fractions-by-wholes", "y5-decimals-to-3dp", "y6-rounding-and-negatives"],
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
    relatedTopics: ["counting-in-steps", "coins", "y2-count-in-2-3-5-10", "y2-tables-2-5-10"],
  },
  {
    id: "half",
    term: "half",
    aliases: ["halves"],
    plainEnglish:
      "One of two equal parts of a whole. Both halves must match — there is no ‘bigger half’. Half past on a clock uses this same idea of splitting an hour in two.",
    seeAlso: ["partition"],
    relatedTopics: ["quarters", "halves", "oclock-and-half-past", "y2-thirds-and-quarters", "y2-half-and-two-quarters", "y2-time-to-five-minutes", "y2-2d-3d-properties", "y2-turns-and-right-angles", "y2-pictograms-and-tables", "y3-count-in-4-8-50-100", "y3-equivalent-fractions", "y3-time-to-the-minute", "y3-right-angles", "y3-bar-charts-and-tables", "y4-equivalent-fraction-families", "y4-decimal-equivalents", "y4-convert-measures", "y4-perimeter-and-area", "y5-add-subtract-related-fractions", "y5-percentages", "y5-area-of-rectangles", "y5-volume-of-cubes", "y5-angles-in-degrees", "y6-add-subtract-unlike-fractions", "y6-multiply-and-divide-fractions", "y6-percentages-of-amounts", "y6-simple-formulae", "y6-area-triangles-parallelograms", "y6-pie-charts-and-mean"],
  },
  {
    id: "quarter",
    term: "quarter",
    aliases: ["quarters"],
    plainEnglish:
      "One of four equal parts of a whole. Like halves, the parts must match — four uneven slices are not quarters. Two quarters make a half; four quarters make the whole again.",
    seeAlso: ["half", "partition"],
    relatedTopics: ["quarters", "y2-thirds-and-quarters", "y2-half-and-two-quarters", "y2-time-to-five-minutes", "y2-turns-and-right-angles", "y3-equivalent-fractions", "y3-length-mass-capacity", "y3-right-angles", "y4-count-6-7-9-25-1000", "y4-equivalent-fraction-families", "y4-mixed-numbers", "y4-decimal-equivalents", "y4-12-and-24-hour", "y4-coordinates-and-translations", "y5-equivalent-and-mixed-fractions", "y5-multiply-fractions-by-wholes", "y6-simplify-and-compare-fractions", "y6-multiply-and-divide-fractions", "y6-pie-charts-and-mean"],
  },
  {
    id: "number-word",
    term: "number word",
    aliases: ["number words", "in words"],
    plainEnglish:
      "How we write a number using letters — fourteen, not 14. School expects children to link teen words to numerals, especially eleven, twelve, and the -teen numbers.",
    seeAlso: ["numeral"],
    relatedTopics: ["number-words-to-20", "y2-order-to-100", "y2-number-words-to-100", "y4-coordinates-and-translations", "y5-area-of-rectangles", "y6-simple-formulae", "y6-sequences-and-missing-numbers"],
  },
  {
    id: "numeral",
    term: "numeral",
    aliases: ["numerals"],
    plainEnglish:
      "The digit symbol for a number — 14, not fourteen. School asks children to read and write both the numeral and the number word.",
    seeAlso: ["number-word"],
    relatedTopics: ["number-words-to-20", "y2-number-words-to-100", "y3-time-to-the-minute", "y4-negative-numbers", "y4-roman-to-100", "y4-equivalent-fraction-families", "y5-negative-numbers-in-context", "y5-roman-to-1000", "y6-rounding-and-negatives"],
  },
  {
    id: "compare-length",
    term: "longer and shorter",
    aliases: ["longer", "shorter", "taller", "shorter than", "longer than", "tall and short"],
    plainEnglish:
      "Words for comparing how far something stretches (longer, shorter) or how high it reaches (taller, shorter). Line objects up at the same starting point before you compare.",
    relatedTopics: ["comparing-length", "y2-difference-how-many-more", "y2-units-of-measure", "y3-scaling-and-correspondence", "y3-length-mass-capacity", "y3-perimeter", "y4-compare-decimals", "y5-perimeter-composite", "y5-area-of-rectangles"],
  },
  {
    id: "2d-shape",
    term: "2-D shape",
    aliases: ["2-D shapes", "flat shape", "flat shapes"],
    plainEnglish:
      "A flat shape you can draw on paper — circles, triangles, rectangles, and squares. Turning the shape around does not change what it is.",
    relatedTopics: ["shapes-around-us", "y2-2d-3d-properties", "y3-2d-and-3d-shapes"],
  },
  {
    id: "3d-shape",
    term: "3-D shape",
    aliases: ["3-D shapes", "solid shape", "solid shapes"],
    plainEnglish:
      "A solid shape you can pick up — balls (spheres), boxes (cuboids), tins (cylinders), and so on. They have faces, edges, and corners you can feel.",
    seeAlso: ["2d-shape"],
    relatedTopics: ["shapes-around-us", "y2-2d-3d-properties", "y3-2d-and-3d-shapes", "y5-3d-from-2d"],
  },
  {
    id: "place-value",
    term: "place value",
    aliases: ["place-value"],
    plainEnglish:
      "What each digit is worth because of where it sits. In 47 the 4 is four tens (40), not four; in 405 the 4 is four hundreds.",
    seeAlso: ["numeral"],
    relatedTopics: ["y2-tens-and-ones", "y2-order-to-100", "y2-related-facts-to-100", "y2-add-subtract-1s-or-10s", "y2-money-pounds-and-pence", "y3-hundreds-tens-ones", "y3-ten-or-hundred-more-less", "y3-order-numbers-to-1000", "y3-mental-add-subtract", "y3-multiply-2-digit-by-1-digit", "y3-tenths", "y4-thousands", "y4-count-6-7-9-25-1000", "y4-roman-to-100", "y4-written-add-subtract-4-digit", "y4-multiply-divide-by-10-100", "y4-mixed-numbers", "y4-decimal-equivalents", "y4-compare-decimals", "y4-convert-measures", "y5-numbers-to-a-million", "y5-powers-of-10", "y5-roman-to-1000", "y5-written-add-subtract-large", "y5-multiply-divide-by-10-100-1000", "y5-decimals-to-3dp", "y5-metric-and-imperial", "y6-numbers-to-10-million", "y6-decimals-and-percentages", "y6-convert-measures"],
  },
  {
    id: "estimate",
    term: "estimate",
    aliases: ["estimates", "estimating"],
    plainEnglish:
      "A sensible about-where or about-how-many, not a lucky guess. On a 0–100 line, 47 lives just after halfway from 40 to 50.",
    seeAlso: ["number-line"],
    relatedTopics: ["y2-numbers-to-100-on-a-line", "y2-units-of-measure", "y3-order-numbers-to-1000", "y3-written-add-subtract", "y4-rounding", "y4-written-add-subtract-4-digit", "y4-short-multiplication", "y4-time-graphs", "y5-rounding-large-numbers", "y5-written-add-subtract-large", "y5-long-multiplication", "y5-area-of-rectangles", "y5-volume-of-cubes", "y5-angles-in-degrees", "y6-long-multiplication", "y6-long-division", "y6-volume-cuboids", "y6-circles"],
  },
  {
    id: "multiple",
    term: "multiple",
    aliases: ["multiples", "multiples of", "multiple of"],
    plainEnglish:
      "A number in a times list. Multiples of 10 are 10, 20, 30, 40… The tens marks on a 0–100 line are multiples of 10.",
    relatedTopics: ["y2-numbers-to-100-on-a-line", "y2-count-in-2-3-5-10", "y4-rounding", "y4-equivalent-fraction-families", "y5-rounding-large-numbers", "y5-factors-multiples-primes", "y5-squares-and-cubes", "y5-long-multiplication", "y5-equivalent-and-mixed-fractions", "y5-add-subtract-related-fractions", "y6-rounding-and-negatives", "y6-long-division", "y6-common-factors-and-multiples", "y6-simplify-and-compare-fractions", "y6-unequal-sharing"],
  },
  {
    id: "array",
    term: "array",
    aliases: ["arrays"],
    plainEnglish:
      "Objects in equal rows and columns. 3 rows of 5 is 15, and turning it makes 5 columns of 3 — the same amount.",
    seeAlso: ["skip-counting"],
    relatedTopics: ["y2-tables-2-5-10", "y2-arrays-and-grouping", "y3-tables-3-4-8", "y4-tables-to-12", "y4-factor-pairs", "y4-short-multiplication", "y5-factors-multiples-primes", "y5-squares-and-cubes", "y5-area-of-rectangles"],
  },
  {
    id: "inverse",
    term: "inverse",
    plainEnglish:
      "The undo. Addition and subtraction undo each other: if 8 + 6 = 14, then 14 − 6 = 8. A missing-number box is asking for the other part.",
    seeAlso: ["part-whole", "number-fact"],
    relatedTopics: ["y2-inverse-and-missing-numbers", "y4-written-add-subtract-4-digit", "y5-written-add-subtract-large", "y6-long-multiplication", "y6-multiply-and-divide-fractions", "y6-simple-formulae", "y6-sequences-and-missing-numbers"],
  },
  {
    id: "right-angle",
    term: "right angle",
    aliases: ["right angles", "right-angle"],
    plainEnglish:
      "A square corner, or a quarter-turn on the spot. Two right angles make a half-turn; four make a full turn.",
    seeAlso: ["quarter"],
    relatedTopics: ["y2-turns-and-right-angles", "y3-right-angles", "y3-parallel-and-perpendicular", "y3-2d-and-3d-shapes", "y4-perimeter-and-area", "y4-shape-properties", "y5-angles-in-degrees", "y6-area-triangles-parallelograms"],
  },
  {
    id: "vertex",
    term: "vertex",
    aliases: ["vertices"],
    plainEnglish:
      "A corner where sides or edges meet. A rectangle has four vertices; a box has vertices you can feel.",
    seeAlso: ["2d-shape", "3d-shape"],
    relatedTopics: ["y2-2d-3d-properties", "y3-2d-and-3d-shapes", "y4-shape-properties", "y5-perimeter-composite", "y5-reflection-and-translation"],
  },
  {
    id: "line-of-symmetry",
    term: "line of symmetry",
    aliases: ["line symmetry", "vertical line of symmetry", "lines of symmetry"],
    plainEnglish:
      "A fold line that matches both halves. A vertical line of symmetry is a fold down the middle that lands on itself.",
    relatedTopics: ["y2-2d-3d-properties", "y4-symmetry"],
  },
  {
    id: "pictogram",
    term: "pictogram",
    aliases: ["pictograms"],
    plainEnglish:
      "A chart that uses pictures or symbols instead of bars. One picture might stand for 2 or 10, so you have to read the key.",
    relatedTopics: ["y2-pictograms-and-tables", "y3-bar-charts-and-tables"],
  },
  {
    id: "third",
    term: "a third",
    aliases: ["thirds"],
    plainEnglish:
      "One of three equal parts of a whole. The parts must match — three uneven pieces are not thirds.",
    seeAlso: ["half", "quarter"],
    relatedTopics: ["y2-thirds-and-quarters", "y2-half-and-two-quarters", "y3-scaling-and-correspondence", "y3-equivalent-fractions", "y4-equivalent-fraction-families", "y4-mixed-numbers", "y4-time-graphs", "y5-written-add-subtract-large", "y5-multiply-fractions-by-wholes", "y6-add-subtract-unlike-fractions", "y6-multiply-and-divide-fractions", "y6-ratio"],
  },
  {
    id: "tenths",
    term: "tenth",
    aliases: ["tenths", "one tenth"],
    plainEnglish:
      "One of ten equal parts of a whole, or what you get when you divide a one by 10. Counting 1/10, 2/10, 3/10 is counting in a new unit.",
    seeAlso: ["quarter", "place-value"],
    relatedTopics: ["y3-tenths", "y3-unit-and-non-unit-fractions", "y4-multiply-divide-by-10-100", "y4-hundredths", "y4-decimal-equivalents", "y4-compare-decimals", "y5-powers-of-10", "y5-multiply-divide-by-10-100-1000", "y5-equivalent-and-mixed-fractions", "y5-decimals-to-3dp", "y6-decimals-and-percentages", "y6-percentages-of-amounts"],
  },
  {
    id: "denominator",
    term: "denominator",
    aliases: ["denominators"],
    plainEnglish:
      "The bottom number of a fraction: how many equal parts the whole is split into. In 2/5 the denominator is 5.",
    seeAlso: ["numerator"],
    relatedTopics: ["y3-unit-and-non-unit-fractions", "y3-equivalent-fractions", "y3-add-subtract-fractions", "y4-equivalent-fraction-families", "y4-hundredths", "y4-mixed-numbers", "y4-add-subtract-fractions", "y5-equivalent-and-mixed-fractions", "y5-add-subtract-related-fractions", "y5-multiply-fractions-by-wholes", "y6-simplify-and-compare-fractions", "y6-add-subtract-unlike-fractions", "y6-multiply-and-divide-fractions"],
  },
  {
    id: "numerator",
    term: "numerator",
    aliases: ["numerators"],
    plainEnglish:
      "The top number of a fraction: how many of those equal parts you take. In 2/5 the numerator is 2.",
    seeAlso: ["denominator"],
    relatedTopics: ["y3-unit-and-non-unit-fractions", "y3-add-subtract-fractions", "y4-mixed-numbers", "y5-multiply-fractions-by-wholes", "y6-multiply-and-divide-fractions"],
  },
  {
    id: "unit-fraction",
    term: "unit fraction",
    aliases: ["unit fractions", "non-unit fraction", "non-unit fractions"],
    plainEnglish:
      "A fraction with 1 on top, such as 1/5 — one equal share. A non-unit fraction such as 2/5 takes more than one of those shares.",
    seeAlso: ["numerator", "denominator"],
    relatedTopics: ["y3-unit-and-non-unit-fractions"],
  },
  {
    id: "equivalent-fraction",
    term: "equivalent fraction",
    aliases: ["equivalent fractions", "equivalence"],
    plainEnglish:
      "Fractions that cover the same amount of the whole, such as 1/2 and 2/4. The pieces look different; the shaded length matches.",
    seeAlso: ["half", "quarter"],
    relatedTopics: ["y2-half-and-two-quarters", "y3-equivalent-fractions", "y4-equivalent-fraction-families", "y5-equivalent-and-mixed-fractions", "y6-add-subtract-unlike-fractions"],
  },
  {
    id: "perimeter",
    term: "perimeter",
    aliases: ["perimeters"],
    plainEnglish:
      "The distance around the edge of a shape — walk the fence, do not fill the middle. Add every outer side once.",
    seeAlso: ["area"],
    relatedTopics: ["y3-perimeter", "y4-perimeter-and-area", "y5-perimeter-composite", "y5-area-of-rectangles", "y5-3d-from-2d", "y6-simple-formulae", "y6-area-triangles-parallelograms"],
  },
  {
    id: "area",
    term: "area",
    aliases: ["areas"],
    plainEnglish:
      "How much flat space is inside a shape. In Year 4 you count squares; later you may multiply length by width. It is not the walk around the edge.",
    seeAlso: ["perimeter"],
    relatedTopics: ["y3-perimeter", "y4-short-multiplication", "y4-perimeter-and-area", "y5-squares-and-cubes", "y5-perimeter-composite", "y5-area-of-rectangles", "y5-3d-from-2d", "y6-multiply-and-divide-fractions", "y6-scale-factors", "y6-simple-formulae", "y6-area-triangles-parallelograms", "y6-volume-cuboids"],
  },
  {
    id: "parallel",
    term: "parallel",
    aliases: ["parallel lines"],
    plainEnglish:
      "Lines that stay the same distance apart and never meet, like train tracks. They do not have to be the same length.",
    seeAlso: ["perpendicular"],
    relatedTopics: ["y3-parallel-and-perpendicular", "y4-shape-properties", "y5-perimeter-composite", "y5-angles-in-degrees", "y5-reflection-and-translation"],
  },
  {
    id: "perpendicular",
    term: "perpendicular",
    aliases: ["perpendicular lines"],
    plainEnglish:
      "Lines that meet at a right angle — a square join, like a window-frame corner.",
    seeAlso: ["parallel", "right-angle"],
    relatedTopics: ["y3-parallel-and-perpendicular", "y4-symmetry", "y5-reflection-and-translation", "y6-area-triangles-parallelograms"],
  },
  {
    id: "horizontal",
    term: "horizontal",
    plainEnglish: "Level like the horizon, left to right. A table edge is usually horizontal.",
    seeAlso: ["vertical"],
    relatedTopics: ["y3-parallel-and-perpendicular", "y4-symmetry", "y6-four-quadrants"],
  },
  {
    id: "vertical",
    term: "vertical",
    plainEnglish: "Upright like a lamppost. A door frame’s sides are usually vertical.",
    seeAlso: ["horizontal"],
    relatedTopics: ["y3-parallel-and-perpendicular", "y4-symmetry", "y4-coordinates-and-translations", "y5-reflection-and-translation"],
  },
  {
    id: "bar-chart",
    term: "bar chart",
    aliases: ["bar charts"],
    plainEnglish:
      "A chart that uses bars of equal width to show amounts. The height (or length) of the bar is the count.",
    seeAlso: ["pictogram"],
    relatedTopics: ["y3-bar-charts-and-tables", "y4-time-graphs"],
  },
  {
    id: "roman-numeral",
    term: "Roman numeral",
    aliases: ["Roman numerals"],
    plainEnglish:
      "Letters used as numbers on some clocks and dates — I, V, X, L, C, D, M. They do not use place value or a zero the way 14 does.",
    seeAlso: ["numeral", "place-value"],
    relatedTopics: ["y3-time-to-the-minute", "y4-roman-to-100", "y5-roman-to-1000"],
  },
  {
    id: "remainder",
    term: "remainder",
    aliases: ["remainders"],
    plainEnglish:
      "What is left when equal groups will not use everything up. 17 ÷ 5 is 3 groups with remainder 2. The story decides whether that leftover needs another group.",
    relatedTopics: ["y4-remainders", "y4-mixed-numbers", "y5-short-division", "y5-equivalent-and-mixed-fractions", "y6-long-division", "y6-decimals-and-percentages"],
  },
  {
    id: "negative-number",
    term: "negative number",
    aliases: ["negative numbers", "negatives"],
    plainEnglish:
      "A number the other side of zero on the line: after 1, 0 comes −1, −2. Further left is smaller, so −8 is less than −1.",
    seeAlso: ["number-line"],
    relatedTopics: ["y4-negative-numbers", "y5-negative-numbers-in-context", "y6-rounding-and-negatives", "y6-four-quadrants"],
  },
  {
    id: "rounding",
    term: "rounding",
    aliases: ["round to", "nearest ten", "nearest 10", "nearest 100", "nearest 1,000"],
    plainEnglish:
      "Naming the close landmark a number sits nearest to — 47 to the nearest 10 is 50 because it is past halfway from 40.",
    seeAlso: ["estimate", "number-line"],
    relatedTopics: ["y4-thousands", "y4-rounding", "y4-written-add-subtract-4-digit", "y4-compare-decimals", "y5-rounding-large-numbers", "y5-written-add-subtract-large", "y5-short-division", "y5-decimals-to-3dp", "y6-rounding-and-negatives", "y6-long-division", "y6-four-quadrants"],
  },
  {
    id: "factor",
    term: "factor",
    aliases: ["factors", "factor pairs", "factor pair"],
    plainEnglish:
      "A whole number that divides another exactly. Factor pairs of 12 are 1 and 12, 2 and 6, 3 and 4.",
    seeAlso: ["multiple", "prime"],
    relatedTopics: ["y4-factor-pairs", "y4-equivalent-fraction-families", "y5-factors-multiples-primes", "y5-squares-and-cubes", "y5-long-multiplication", "y5-equivalent-and-mixed-fractions", "y5-multiply-fractions-by-wholes", "y5-metric-and-imperial", "y6-common-factors-and-multiples", "y6-simplify-and-compare-fractions", "y6-scale-factors"],
  },
  {
    id: "hundredths",
    term: "hundredth",
    aliases: ["hundredths"],
    plainEnglish:
      "One of 100 equal parts of a whole. Ten hundredths make one tenth. 7 ÷ 100 = 7 hundredths.",
    seeAlso: ["tenths", "decimal"],
    relatedTopics: ["y4-multiply-divide-by-10-100", "y4-hundredths", "y4-decimal-equivalents", "y4-compare-decimals", "y5-multiply-divide-by-10-100-1000", "y5-equivalent-and-mixed-fractions", "y5-decimals-to-3dp", "y5-percentages", "y6-decimals-and-percentages"],
  },
  {
    id: "decimal",
    term: "decimal",
    aliases: ["decimals", "decimal point", "decimal equivalents"],
    plainEnglish:
      "A number that uses a point to show tenths (and later hundredths) after the ones. 0.3 is 3 tenths; 0.07 is 7 hundredths.",
    seeAlso: ["tenths", "hundredths", "place-value"],
    relatedTopics: ["y4-multiply-divide-by-10-100", "y4-hundredths", "y4-decimal-equivalents", "y4-compare-decimals", "y4-convert-measures", "y5-powers-of-10", "y5-short-division", "y5-multiply-divide-by-10-100-1000", "y5-decimals-to-3dp", "y5-percentages", "y5-line-graphs-and-timetables", "y6-numbers-to-10-million", "y6-long-multiplication", "y6-long-division", "y6-decimals-and-percentages", "y6-percentages-of-amounts", "y6-convert-measures"],
  },
  {
    id: "mixed-number",
    term: "mixed number",
    aliases: ["mixed numbers"],
    plainEnglish:
      "A whole number plus a fraction, such as 1 3/4 — one whole and three quarters.",
    seeAlso: ["improper-fraction"],
    relatedTopics: ["y4-mixed-numbers", "y4-add-subtract-fractions", "y5-equivalent-and-mixed-fractions", "y5-add-subtract-related-fractions", "y5-multiply-fractions-by-wholes", "y6-add-subtract-unlike-fractions"],
  },
  {
    id: "improper-fraction",
    term: "improper fraction",
    aliases: ["improper fractions"],
    plainEnglish:
      "A fraction where the top is bigger than the bottom, such as 7/4. It is not ‘wrong’: seven quarters is 1 and 3/4.",
    seeAlso: ["mixed-number", "numerator", "denominator"],
    relatedTopics: ["y4-mixed-numbers", "y5-equivalent-and-mixed-fractions"],
  },
  {
    id: "coordinate",
    term: "coordinates",
    aliases: ["coordinate"],
    plainEnglish:
      "A pair (x, y) that says where a point sits on a grid: across first, then up. (2, 5) is 2 along and 5 up.",
    relatedTopics: ["y4-coordinates-and-translations", "y5-reflection-and-translation", "y6-four-quadrants"],
  },
  {
    id: "translation",
    term: "translation",
    aliases: ["translations"],
    plainEnglish:
      "A slide: every point of a shape moves the same right/left and up/down. The shape does not turn or flip.",
    seeAlso: ["coordinate", "reflection"],
    relatedTopics: ["y4-coordinates-and-translations", "y5-reflection-and-translation", "y6-four-quadrants"],
  },
  {
    id: "reflection",
    term: "reflection",
    aliases: ["reflections"],
    plainEnglish:
      "A flip over a mirror line. Each point lands the same distance the other side of the line.",
    seeAlso: ["line-of-symmetry", "translation"],
    relatedTopics: ["y4-symmetry", "y5-reflection-and-translation", "y6-four-quadrants"],
  },
  {
    id: "prime",
    term: "prime number",
    aliases: ["prime", "primes", "prime numbers"],
    plainEnglish:
      "A whole number with exactly two factors: 1 and itself. 2, 3, 5, 7, 11… 1 is not prime. 4 is composite (not prime).",
    seeAlso: ["factor"],
    relatedTopics: ["y5-factors-multiples-primes", "y5-squares-and-cubes", "y5-long-multiplication", "y5-equivalent-and-mixed-fractions", "y6-common-factors-and-multiples"],
  },
  {
    id: "common-factor",
    term: "common factor",
    aliases: ["common factors"],
    plainEnglish:
      "A factor shared by two numbers. Common factors of 12 and 18 include 1, 2, 3 and 6.",
    seeAlso: ["factor", "hcf"],
    relatedTopics: ["y4-equivalent-fraction-families", "y5-factors-multiples-primes", "y6-common-factors-and-multiples", "y6-simplify-and-compare-fractions"],
  },
  {
    id: "square-number",
    term: "square number",
    aliases: ["square numbers"],
    plainEnglish:
      "A number that makes a square array: 1, 4, 9, 16, 25… 5² means 5 × 5 = 25, not 5 × 2.",
    seeAlso: ["array", "cube-number"],
    relatedTopics: ["y5-squares-and-cubes"],
  },
  {
    id: "cube-number",
    term: "cube number",
    aliases: ["cube numbers"],
    plainEnglish:
      "A number that makes a cube: 1, 8, 27, 64… 3³ means 3 × 3 × 3 = 27, not 3 × 3.",
    seeAlso: ["square-number", "volume"],
    relatedTopics: ["y5-squares-and-cubes"],
  },
  {
    id: "short-division",
    term: "short division",
    aliases: ["bus stop"],
    plainEnglish:
      "A written way to share hundreds, then tens, then ones, carrying leftovers to the next place. Often drawn as a ‘bus stop’ bracket. Then you still ask what the remainder means.",
    seeAlso: ["remainder"],
    relatedTopics: ["y5-short-division", "y6-long-division", "y6-decimals-and-percentages"],
  },
  {
    id: "long-multiplication",
    term: "long multiplication",
    plainEnglish:
      "A written method for multiplying by a two-digit number: multiply by the ones, then by the tens, then add. Each line is a place-value split, not a new trick.",
    seeAlso: ["place-value"],
    relatedTopics: ["y5-long-multiplication", "y6-long-multiplication"],
  },
  {
    id: "percentage",
    term: "percentage",
    aliases: ["percentages", "per cent", "percent"],
    plainEnglish:
      "Parts per hundred. 100% is the whole; 1% is 1/100; 50% = 1/2 = 0.5. The % mark is not decoration.",
    seeAlso: ["hundredths", "decimal"],
    relatedTopics: ["y5-percentages", "y6-decimals-and-percentages", "y6-percentages-of-amounts", "y6-ratio", "y6-convert-measures", "y6-pie-charts-and-mean"],
  },
  {
    id: "volume",
    term: "volume",
    aliases: ["volumes"],
    plainEnglish:
      "How much 3-D space is inside. For cubes and cuboids you can count layers of cubes, or multiply length × width × height.",
    seeAlso: ["area"],
    relatedTopics: ["y5-volume-of-cubes", "y6-volume-cuboids"],
  },
  {
    id: "acute-angle",
    term: "acute angle",
    aliases: ["acute"],
    plainEnglish: "An angle smaller than a right angle — less than 90°.",
    seeAlso: ["right-angle", "obtuse-angle"],
    relatedTopics: ["y4-shape-properties", "y5-angles-in-degrees"],
  },
  {
    id: "obtuse-angle",
    term: "obtuse angle",
    aliases: ["obtuse"],
    plainEnglish: "An angle larger than a right angle but smaller than a straight line — between 90° and 180°.",
    seeAlso: ["right-angle", "acute-angle", "reflex-angle"],
    relatedTopics: ["y4-shape-properties", "y5-angles-in-degrees"],
  },
  {
    id: "reflex-angle",
    term: "reflex angle",
    aliases: ["reflex"],
    plainEnglish: "An angle larger than a half-turn — more than 180°, less than a full turn.",
    seeAlso: ["obtuse-angle"],
    relatedTopics: ["y5-angles-in-degrees"],
  },
  {
    id: "bar-model",
    term: "bar model",
    aliases: ["bar models"],
    plainEnglish:
      "A rectangular bar split into parts to show a story: the whole and the known bits. It is a thinking picture, not a new method of calculating.",
    seeAlso: ["part-whole"],
    relatedTopics: ["y5-written-add-subtract-large", "y6-percentages-of-amounts", "y6-ratio"],
  },
  {
    id: "long-division",
    term: "long division",
    plainEnglish:
      "A written way to divide by a two-digit number, subtracting multiples as you go, so each leftover is smaller than the divisor.",
    seeAlso: ["short-division", "remainder"],
    relatedTopics: ["y6-long-division"],
  },
  {
    id: "order-of-operations",
    term: "order of operations",
    aliases: ["BODMAS", "BIDMAS", "PEMDAS"],
    plainEnglish:
      "The agreed order: brackets first, then multiply and divide left to right, then add and subtract left to right. BODMAS, BIDMAS and PEMDAS are names for that same idea. 2+1×3 is 5, not 9.",
    relatedTopics: ["y6-order-of-operations"],
  },
  {
    id: "hcf",
    term: "highest common factor",
    aliases: ["HCF", "highest common factor"],
    plainEnglish:
      "The largest whole number that divides two (or more) numbers exactly. Highest common factor of 12 and 18 is 6.",
    seeAlso: ["factor", "lcm"],
    relatedTopics: ["y6-common-factors-and-multiples", "y6-simplify-and-compare-fractions"],
  },
  {
    id: "lcm",
    term: "lowest common multiple",
    aliases: ["LCM", "lowest common multiple"],
    plainEnglish:
      "The smallest number that sits in two times lists. Lowest common multiple of 4 and 6 is 12.",
    seeAlso: ["multiple", "hcf"],
    relatedTopics: ["y6-common-factors-and-multiples", "y6-simplify-and-compare-fractions", "y6-add-subtract-unlike-fractions"],
  },
  {
    id: "ratio",
    term: "ratio",
    aliases: ["ratios"],
    plainEnglish:
      "A comparison of amounts in the same unit, written 2:3. For every 2 of one thing there are 3 of the other, scaled up together.",
    relatedTopics: ["y6-ratio", "y6-scale-factors", "y6-unequal-sharing", "y6-convert-measures"],
  },
  {
    id: "scale-factor",
    term: "scale factor",
    aliases: ["scale factors"],
    plainEnglish:
      "How many times larger (or smaller) a matching length has become. Scale factor 3 means every length is three times as long; area does not scale by 3.",
    seeAlso: ["ratio"],
    relatedTopics: ["y6-scale-factors"],
  },
  {
    id: "formula",
    term: "formula",
    aliases: ["formulae", "formulas"],
    plainEnglish:
      "A recipe with letters standing for numbers you can swap in. Perimeter of a rectangle p = 2(l + w): if l is 5 and w is 3, p is 16.",
    seeAlso: ["perimeter"],
    relatedTopics: ["y6-simple-formulae", "y6-sequences-and-missing-numbers", "y6-area-triangles-parallelograms", "y6-volume-cuboids", "y6-pie-charts-and-mean"],
  },
  {
    id: "radius",
    term: "radius",
    aliases: ["radii"],
    plainEnglish: "A spoke: the distance from the centre of a circle to the edge.",
    seeAlso: ["diameter", "circumference"],
    relatedTopics: ["y6-circles"],
  },
  {
    id: "diameter",
    term: "diameter",
    plainEnglish: "A straight line through the centre, edge to edge — twice the radius. d = 2 × r.",
    seeAlso: ["radius", "circumference"],
    relatedTopics: ["y6-circles"],
  },
  {
    id: "circumference",
    term: "circumference",
    plainEnglish: "The distance around a circle — the rim, not a spoke.",
    seeAlso: ["radius", "diameter"],
    relatedTopics: ["y6-circles"],
  },
  {
    id: "mean",
    term: "the mean",
    aliases: ["mean average"],
    plainEnglish:
      "A fair share: add the numbers, then divide by how many there are. The mean of 2, 5, 5, 8 is 20 ÷ 4 = 5. It is not the middle of the list.",
    relatedTopics: ["y6-pie-charts-and-mean"],
  },
  {
    id: "pie-chart",
    term: "pie chart",
    aliases: ["pie charts"],
    plainEnglish:
      "A circle split into slices that show shares of a whole. A quarter of the pie is a quarter of the total and 90° of the 360° turn.",
    seeAlso: ["percentage"],
    relatedTopics: ["y6-pie-charts-and-mean"],
  },
];
