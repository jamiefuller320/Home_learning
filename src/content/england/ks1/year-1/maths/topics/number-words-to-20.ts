import { NC_MATHS } from "../sources";
import type { Topic } from "@/content/schema";

export const numberWordsTo20: Topic = {
  id: "number-words-to-20",
  slug: "number-words-to-20",
  title: "Numbers to 20 in words",
  shortTitle: "Number words",
  summary: "Link the spoken word “fourteen” to the numeral 14, not only to the counting song.",
  jurisdiction: "england",
  keyStage: "ks1",
  year: 1,
  subject: "maths",
  strand: "Number and place value",
  prerequisites: ["numbers-to-20"],
  glossaryTerms: ["number-word"],
  parentMinutes: 6,
  homeMinutes: 12,
  householdItems: [
    "Small sticky notes or scraps of paper",
    "A pen",
    "Up to 20 small objects (buttons, Lego bricks, grapes)",
  ],
  statutoryOutcomes: ["Read and write numbers from 1 to 20 in numerals and words"],
  readyToProgress: [],
  sources: [NC_MATHS],
  whyThisMatters:
    "School expects children to read and write number words as well as numerals. The tricky ones are not one to ten — they are the teens, where the word order (fourteen) does not match how we say the digits (one, then four).",
  parentBriefing: {
    inPlainEnglish:
      "A numeral is the symbol: 14. A number word is how we say and write it in letters: fourteen. Your child probably knows the chant to twenty. This topic is about matching a handful of numbers they meet in books and on worksheets to the words school uses.",
    howSchoolTeachesIt:
      "Teachers mix numerals and words on the same card, number track, or line. They highlight the teens pattern: thirteen, fourteen, fifteen… all end in -teen and mean ‘three and ten’, ‘four and ten’, and so on. They do not expect perfect spelling overnight — recognising the word when they see it matters first.",
    sayThis: [
      "This says fourteen. Can you find 14 to match?",
      "Eleven and twelve are special — they do not follow the -teen pattern. Let’s learn those two first.",
      "Say the word, then write the numeral. Say the numeral, then point to the word.",
      "If you are not sure, count the objects and listen to the word again. The amount checks the word.",
    ],
    avoidThis: [
      "Drilling all twenty words in one night. Five well-linked pairs beat a wall of flashcards.",
      "Correcting spelling before they can match the word to the amount. Recognition comes first.",
      "Only ever reading words on a screen. Write a few on paper they can move around.",
    ],
    commonMisconceptions: [
      {
        misconception: "They write 41 for fourteen because they hear ‘four’ then ‘teen’.",
        why: "The spoken order feels like tens then ones, but the numeral is the other way round.",
        instead: "Lay out 14 objects. Say “fourteen is one ten and four ones” while they count. Then write 14 together.",
      },
      {
        misconception: "They know the counting song but cannot pick out “sixteen” on a page.",
        why: "Chanting and reading are different jobs.",
        instead: "Hide the numeral. Show the word and a pile of objects. Let them count to check before you reveal 16.",
      },
    ],
    youAreReadyWhen:
      "You can show three teen words (for example eleven, fourteen, seventeen) and your child can match each to the right numeral with objects nearby.",
  },
  homePack: {
    setup: "Write five number words on sticky notes: eleven, twelve, fourteen, sixteen, and eighteen. Write the matching numerals on five more notes.",
    activity: {
      title: "Word and numeral pairs",
      steps: [
        "Start with eleven and twelve only. Match word to numeral. Make a pile of 11 objects and 12 objects to check.",
        "Add fourteen. Count 14 together, then match the word card to 14.",
        "Mix the three pairs face up. Ask your child to find a match. You find one too, so it feels like a game.",
        "If that is steady, add sixteen and eighteen one at a time with objects to check.",
        "Finish by shuffling all five pairs and seeing how many they can match without counting every time.",
      ],
      tip: "Leave tricky spellings on the card. They can copy the word; the job tonight is linking word, numeral, and amount.",
    },
    check: [
      {
        prompt: "Point to the word fourteen. Which numeral goes with it?",
        looksLike: "They pick 14, or count 14 objects first and then pick 14.",
        notYet: "They pick 4, 41, or guess without checking.",
      },
      {
        prompt: "Show 12. Which word card is twelve?",
        looksLike: "They pick twelve, perhaps after counting.",
        notYet: "They pick a -teen word or say twenty.",
      },
      {
        prompt: "Show the word sixteen with no objects. What numeral?",
        looksLike: "16, or they ask to count to check.",
        notYet: "They say 61, or cannot start without counting from 1 every time.",
      },
    ],
    stretch: "Write nineteen and 19. Talk about “nine and ten”. Only if the five pairs already feel easy.",
    stopRule: "Stop after five words sit comfortably. Teens arrive in school over weeks — one calm evening is enough.",
  },
  reviewStatus: "draft",
};
