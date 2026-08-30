/**
 * Durable learnings from language feedback.
 * Used to scan existing packs and to gate future lesson builds.
 *
 * Principles (to avoid change/counter-change loops):
 * - Each learning has a stable id. Do not rewrite an id’s meaning — add a new learning that `supersedes` it.
 * - Declined proposals are sticky (see learning-decisions.json + maintainer session store).
 * - Accepted proposals edit the topic file; the old wording disappears so it is not re-proposed.
 * - Presentation/layout rules live in presentation-learnings.ts and shared components (see PackProse).
 */

export type LearningKind = "phrase" | "structure";

export type PhraseLearning = {
  id: string;
  kind: "phrase";
  title: string;
  principle: string;
  /** Source language_notes ids when known. */
  sourceNoteIds?: string[];
  /** Case-insensitive substring match in topic text fields. */
  find: string;
  /** Everyday replacement that keeps the school method. */
  replace: string;
  supersedes?: string[];
};

export type StructureLearning = {
  id: string;
  kind: "structure";
  title: string;
  principle: string;
  sourceNoteIds?: string[];
  structure: "check-nudge" | "household-such-as" | "say-this-listen-for";
  supersedes?: string[];
};

export type Learning = PhraseLearning | StructureLearning;

export const learnings: Learning[] = [
  {
    id: "no-counting-as-song",
    kind: "phrase",
    title: "Don’t call the number list a song",
    principle:
      "Parents hear “song” as nursery performance. Prefer “the count that always starts at 1” or “the list that starts at 1”.",
    sourceNoteIds: ["f21fbad2-a98b-46ae-afa4-9161e740e647"],
    find: "1, 2, 3 song",
    replace: "count that always starts at 1",
  },
  {
    id: "no-song-that-starts-at-1",
    kind: "phrase",
    title: "Counting isn’t only a song from 1",
    principle: "Same intent as no-counting-as-song when the wording is “a song that starts at 1”.",
    sourceNoteIds: ["f21fbad2-a98b-46ae-afa4-9161e740e647"],
    find: "a song that starts at 1",
    replace: "the list that always starts at 1",
  },
  {
    id: "no-as-a-caption",
    kind: "phrase",
    title: "Avoid “caption” for written maths",
    principle: "“Caption” sounds technical. Prefer “written underneath” or “show the symbols after the objects”.",
    sourceNoteIds: ["5c8239df-3788-4aaa-affd-ac869e4a2d4a"],
    find: "as a caption",
    replace: "written underneath",
  },
  {
    id: "check-needs-nudge",
    kind: "structure",
    title: "Every check needs a “Try this” nudge",
    principle:
      "After “Not yet”, give one concrete next step the parent can try. Pattern from numbers-to-20; rolled out site-wide.",
    sourceNoteIds: ["26043a6d-2c0a-4216-b3d5-01b8654b4358"],
    structure: "check-nudge",
  },
  {
    id: "household-examples-such-as",
    kind: "structure",
    title: "Example kit lists need “such as”",
    principle:
      "Parentheses full of items can look like a required shopping list. Lead with the idea, then “such as …” for examples.",
    sourceNoteIds: ["6a92e221-e01f-41ea-a611-7f98d0c87607"],
    structure: "household-such-as",
  },
  {
    id: "say-this-listen-for",
    kind: "structure",
    title: "Say this prompts can reveal what you might hear",
    principle:
      "Optional: when a prompt has a clear expected response, add listenFor so parents can check without coaching the child.",
    sourceNoteIds: ["41df55ed-bdd0-4472-b761-98497d2c82ae"],
    structure: "say-this-listen-for",
  },
  {
    id: "no-worksheet-brand-aside",
    kind: "phrase",
    title: "Don’t call a number bond a “worksheet brand”",
    principle:
      "On the page, “not a worksheet brand” is a tidy aside. Aloud it sounds like a product quip. Say what the bond is, then that the name is just a label for the idea.",
    find: "not a worksheet brand",
    replace: "The name is just a label for that idea",
  },
];

export function getLearningById(id: string): Learning | undefined {
  return learnings.find((learning) => learning.id === id);
}
