import { DFE_Y1_MATHS, NC_MATHS } from "../sources";
import type { Topic } from "@/content/schema";

export const countingInSteps: Topic = {
  id: "counting-in-steps",
  slug: "counting-in-steps",
  title: "Counting in 2s, 5s and 10s",
  shortTitle: "2s, 5s and 10s",
  summary: "Hear the pattern in skip-counting. This is not times tables yet.",
  jurisdiction: "england",
  keyStage: "ks1",
  year: 1,
  subject: "maths",
  strand: "Number facts",
  parentMinutes: 6,
  homeMinutes: 12,
  householdItems: ["Pairs of socks or shoes", "Hands, a 5p or 10p coin if you have one", "A small staircase or hallway"],
  statutoryOutcomes: [
    "Count, read and write numbers to 100 in numerals; count in multiples of 2s, 5s and 10s",
  ],
  readyToProgress: ["1NF-2"],
  sources: [NC_MATHS, DFE_Y1_MATHS],
  whyThisMatters:
    "Skip-counting is the sound of later multiplication. In Year 1 it is still counting — grouping, patterns, and keeping the sequence — not written ×.",
  parentBriefing: {
    inPlainEnglish:
      "Counting in 2s is 2, 4, 6, 8… Counting in 5s is 5, 10, 15, 20… Counting in 10s is 10, 20, 30… The child is jumping along the number line in equal steps. They may still glance at a pair of socks or their fingers. That is the point.",
    howSchoolTeachesIt:
      "Teachers link 2s to pairs, 5s to hands or 5p, and 10s to ten-frames or 10p. They will also count objects in groups: “how many shoes if there are 6 pairs?” They usually do not introduce the multiplication sign as the main idea in Year 1.",
    sayThis: [
      "Let’s put the socks in pairs. Now count the socks the quick way: 2, 4, 6…",
      "Each hand is 5 fingers. Two hands?",
      "If we keep adding 10, what changes in the number, and what stays 0?",
      "If you lose the chant, look at the groups. The groups are the meaning.",
    ],
    avoidThis: [
      "Drilling 2 × 7 = 14 as a Year 1 target. That is later.",
      "Only chanting with no objects. The chant evaporates by morning.",
      "Starting in 2s from 1 (1, 3, 5…) unless you mean to. Year 1 multiples of 2 start at 0 or 2.",
    ],
    commonMisconceptions: [
      {
        misconception: "They slip back into 1, 2, 3 after a few jumps.",
        why: "Equal steps are a new rhythm.",
        instead: "Clap or step for each jump. Slow is better than mixed intervals.",
      },
      {
        misconception: "They can chant in 10s but think 10, 20, 30 is ‘adding a 1’.",
        why: "They are watching the 1, 2, 3 in the tens place without meaning.",
        instead: "Bundle ten objects each time so 40 is visibly four tens.",
      },
    ],
    youAreReadyWhen: "You can count four pairs of socks in 2s and know you have 8 socks, not 4.",
  },
  homePack: {
    setup: "Gather as many pairs of socks as you can tolerate, or use shoes. Clear a bit of floor.",
    activity: {
      title: "Pair, hand, bundle",
      steps: [
        "Make 5 pairs. Count the socks in 2s. Then ask how many pairs, and how many socks. Those are different answers.",
        "Count fingers in 5s: one hand, two hands, two hands and one more hand if a sibling joins.",
        "If you have 10p coins or just bundles of ten pasta pieces, count 10, 20, 30.",
        "Pick the chant that was strongest and do it while walking to the bathroom. Stop at the door.",
      ],
      tip: "One sequence per evening is enough. 2s tonight, 5s tomorrow, is better than all three in a blur.",
    },
    check: [
      {
        prompt: "Count in 2s up to 12, with socks or jumps.",
        looksLike: "2, 4, 6, 8, 10, 12, matching six pairs or six jumps.",
        notYet: "Uneven steps, or they count pairs and call that the number of socks.",
      },
      {
        prompt: "Count in 5s to 20.",
        looksLike: "5, 10, 15, 20, perhaps looking at hands.",
        notYet: "They say 5, 6, 7 or 5, 10, 20.",
      },
      {
        prompt: "Count three tens. How many altogether?",
        looksLike: "10, 20, 30 and the word thirty, with three groups visible.",
        notYet: "They say 3, or 13, or cannot connect the chant to the groups.",
      },
    ],
    stretch: "Start at 10 and count in 2s: 10, 12, 14. Starting not-from-zero is a useful stretch.",
    stopRule: "The laundry does not need to be fully paired. Twelve minutes, then a sock ball fight is a valid end.",
  },
  reviewStatus: "draft",
};
