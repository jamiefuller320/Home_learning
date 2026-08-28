import { NC_MATHS } from "../sources";
import type { Topic } from "@/content/schema";

export const oclockAndHalfPast: Topic = {
  id: "oclock-and-half-past",
  slug: "oclock-and-half-past",
  title: "O’clock and half past",
  shortTitle: "Time",
  summary: "Read an analogue clock to the hour and half past. The short hand is the one to trust.",
  jurisdiction: "england",
  keyStage: "ks1",
  year: 1,
  subject: "maths",
  strand: "Measurement",
  prerequisites: ["numbers-to-20", "halves"],
  glossaryTerms: ["half"],
  parentMinutes: 7,
  homeMinutes: 12,
  householdItems: ["A real analogue clock or watch, or a paper plate with two card hands", "A reference to daily events (such as lunch, bedtime)"],
  statutoryOutcomes: [
    "Tell the time to the hour and half past the hour and draw the hands on a clock face to show these times",
    "Recognise and use language relating to dates, including days of the week, weeks, months and years",
    "Sequence events in chronological order using language such as before, after, next, first, today, yesterday, tomorrow",
  ],
  readyToProgress: [],
  sources: [NC_MATHS],
  whyThisMatters:
    "Time language is used all day, but the clock face is a new code. Year 1 only requires o’clock and half past. If you push minutes too soon, the short-hand idea gets lost.",
  parentBriefing: {
    inPlainEnglish:
      "The short hand tells the hour. The long hand tells us whether we are on the hour (12) or halfway (6). At 4 o’clock the short hand points at 4 and the long hand at 12. At half past 4 the long hand is at 6 and the short hand is halfway between 4 and 5 — not still glued to 4.",
    howSchoolTeachesIt:
      "Teachers use geared clocks so both hands move together. They connect times to the day: “half past 12 is around lunch.” They will also work on days of the week and before/after, which you can fold into bedtime chat without a clock.",
    sayThis: [
      "Which hand is shorter? That one names the hour.",
      "On the hour, the long hand is at 12. At half past, the long hand is at 6.",
      "At half past 4, has the short hand stayed on 4 or started to move towards 5?",
      "What do we usually do at this time of day?",
    ],
    avoidThis: [
      "Teaching “the big hand is the minutes, multiply by 5” on night one.",
      "Only using a digital oven clock. Digital is fine as an extra, not as the only model.",
      "Correcting every nearby clock in the house. One clock is the lesson.",
    ],
    commonMisconceptions: [
      {
        misconception: "They read the long hand as the hour because it is more obvious.",
        why: "Longer looks more important.",
        instead: "Call them short hand / long hand, or hour hand / minute hand, and hold the short one when you talk about the hour.",
      },
      {
        misconception: "At half past they still put the short hand exactly on the hour number.",
        why: "They copied o’clock and only moved the long hand.",
        instead: "Nudge the short hand to the halfway point. “It has started its walk to the next number.”",
      },
    ],
    youAreReadyWhen: "You can set a clock to 7 o’clock and half past 7, and you know where both hands belong.",
  },
  homePack: {
    setup: "Use a real clock you can move, or make one from a plate. Only write 12, 3, 6 and 9 if a full set of numbers is visually noisy.",
    activity: {
      title: "Set the day",
      steps: [
        "Find the short hand. Move it to 8, long hand to 12. “8 o’clock. What happens around then?”",
        "Move to half past 8: long hand to 6, short hand halfway to 9. Compare with 8 o’clock.",
        "You set three times (3 o’clock, half past 6, 12 o’clock). They name them.",
        "They set one o’clock and one half past for you. You ‘get it wrong’ once so they can teach you.",
      ],
      tip: "If the real wall clock cannot be moved, take a photo and make a plate clock. Moving the hands is the practice.",
    },
    check: [
      {
        prompt: "Show 2 o’clock.",
        looksLike: "Short hand on 2, long hand on 12.",
        notYet: "Hands swapped, or long hand on 2.",
        nudge: "Short hand on the hour number, long hand pointing straight up at 12.",
      },
      {
        prompt: "What time is this? (Half past 5.)",
        looksLike: "Half past 5, or “5 and a half”.",
        notYet: "5 o’clock, or 6 o’clock, or a minutes answer.",
        nudge: "Long hand at the bottom means half way around. Short hand sits between 5 and 6.",
      },
      {
        prompt: "At half past, where is the short hand?",
        looksLike: "Between two numbers, halfway.",
        notYet: "Stuck on the hour number, or they only watch the long hand.",
        nudge: "At half past, the short hand has moved halfway between two numbers.",
      },
    ],
    stretch: "Talk through tomorrow morning: wake, breakfast, school. Before and after are part of the same programme of study.",
    stopRule: "If they are tired, reading one real clock in the room is a complete session. Quarter past can wait for Year 2.",
  },
  reviewStatus: "draft",
};
