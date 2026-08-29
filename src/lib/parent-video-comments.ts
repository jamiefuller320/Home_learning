import { PROSODY_LABEL, type ProsodyRole } from "@/lib/parent-video-prosody";

/** Structured unclear text for parent-video beat comments in language_notes. */
export function formatParentVideoComment(input: {
  path: string;
  prosody: ProsodyRole;
  spoken: string;
  comment: string;
}): string {
  return [
    `Beat: ${input.path}`,
    `Prosody: ${input.prosody} (${PROSODY_LABEL[input.prosody]})`,
    `Spoken: “${input.spoken.trim()}”`,
    "",
    input.comment.trim(),
  ].join("\n");
}
