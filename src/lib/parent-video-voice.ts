/**
 * Kokoro British English has no SSML — voice id, speed, and punctuation are the levers.
 * bf_emma at 0.9 reads as slow audiobook; prefer a livelier British voice near natural pace.
 */
export const PARENT_VIDEO_TTS = {
  endpoint: "https://fal.run/fal-ai/kokoro/british-english",
  /** Younger, expressive British female — clearer lift than bf_emma’s warm-narrative tone. */
  voice: "bf_isabella",
  /** Slightly brisk so delivery feels engaged without rushing teaching beats. */
  speed: 1.05,
} as const;

export type ParentVideoVoice = (typeof PARENT_VIDEO_TTS)["voice"];
