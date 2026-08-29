/**
 * Kokoro British English has no SSML — voice id, speed, punctuation, and per-beat
 * prosody roles (see parent-video-prosody.ts) are the levers.
 * bf_emma at 0.9 reads as slow audiobook; bf_isabella was clearer but still flat.
 * bf_alice tends brighter/younger; pair with a slightly brisk base speed.
 */
export const PARENT_VIDEO_TTS = {
  endpoint: "https://fal.run/fal-ai/kokoro/british-english",
  /** Brighter British female — usually the most upbeat of the four bf_* voices. */
  voice: "bf_alice",
  /** Base speed; prosody roles scale this slightly per beat. */
  speed: 1.1,
} as const;

export type ParentVideoVoice = (typeof PARENT_VIDEO_TTS)["voice"];
