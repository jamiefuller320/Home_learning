/**
 * Global presentation learnings — applied once in shared components or CSS,
 * not scanned per topic like pack learnings in learnings.ts.
 *
 * When inbox feedback points at layout or wrapping, fix the component here
 * and record the rule so future packs inherit it without per-lesson edits.
 */

export type PresentationLearning = {
  id: string;
  title: string;
  principle: string;
  /** Where the fix lives in the codebase. */
  appliedIn: string[];
  sourceNoteIds?: string[];
};

export const presentationLearnings: PresentationLearning[] = [
  {
    id: "prose-text-pretty",
    title: "Pack prose uses pretty text wrapping",
    principle:
      "Parent-facing sentences should avoid orphan words and awkward line breaks. Apply via PackProse on shared readers, not per topic file.",
    appliedIn: [
      "src/components/PackProse.tsx",
      "src/components/ParentBriefing.tsx",
      "src/components/HomeTasks.tsx",
      "src/components/TopicExperience.tsx",
      "src/components/SayThisList.tsx",
      "src/components/PrerequisiteCallout.tsx",
      "src/components/StageMetaBox.tsx",
    ],
    sourceNoteIds: ["26782ddb-efc8-4420-a79c-1624fa758f76", "cc2b6ac6-a92d-474b-a5b9-48ea6f6c61c5"],
  },
  {
    id: "glossary-inline-everyday",
    title: "Glossary links stay inline and skip everyday words",
    principle:
      "Auto-linked glossary terms must stay inside the sentence. details/summary are display:inline so a match cannot put line breaks between neighbouring words. Everyday adjectives such as “short” and “tall” are not aliases — they were splitting “a short walk” on Tasks → Set up.",
    appliedIn: [
      "src/components/GlossaryLink.tsx",
      "src/components/GlossaryText.tsx",
      "src/app/globals.css",
      "src/content/glossary/index.ts",
      "src/content/glossary/terms.ts",
    ],
  },
  {
    id: "stage-2-meta-what-label",
    title: "Stage 2 meta box labels the middle column What",
    principle:
      "On tasks/home pack, the middle strip describes what you will do tonight — not why. STAGE_2_META carries stage: 2 so every StageMetaBox spread picks the label.",
    appliedIn: ["src/components/StageMetaBox.tsx"],
    sourceNoteIds: ["e829a023-95fa-429d-8d68-bc883c5ca5ca"],
  },
];

export function getPresentationLearningById(id: string): PresentationLearning | undefined {
  return presentationLearnings.find((learning) => learning.id === id);
}
