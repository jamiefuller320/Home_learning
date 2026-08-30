/**
 * Parent-video TTS providers.
 *
 * Kokoro (default): cheap British voices, no SSML — punctuation + speed only.
 * ElevenLabs (trial): richer inflection via fal; select with
 *   PARENT_VIDEO_TTS_PROVIDER=elevenlabs
 *
 * Do not switch production default until a human listen-pass says it is comfortable.
 */

export type TtsProviderId = "kokoro" | "elevenlabs";

export type TtsRequest = {
  text: string;
  /** Relative pace vs the provider’s natural rate (Kokoro only; ElevenLabs ignores). */
  speed?: number;
};

export type TtsResult = {
  /** Downloaded audio bytes (wav/mp3 depending on provider). */
  bytes: Buffer;
  /** Hint for ffmpeg / file extension. */
  format: "wav" | "mp3";
  provider: TtsProviderId;
  voice: string;
};

export const KOKORO_TTS = {
  id: "kokoro" as const,
  endpoint: "https://fal.run/fal-ai/kokoro/british-english",
  voice: "bf_alice",
  speed: 1.1,
};

/**
 * ElevenLabs via fal — prefer v3 for inflection on parent briefings.
 * Charlotte is a clear British female; stability slightly under 0.5 for warmth
 * without tipping into theatrical delivery.
 */
export const ELEVENLABS_TTS = {
  id: "elevenlabs" as const,
  endpoint: "https://fal.run/fal-ai/elevenlabs/tts/eleven-v3",
  voice: "Charlotte",
  /** 0 = more expressive, 1 = flat; 0.4 aims for natural teaching. */
  stability: 0.4,
  languageCode: "en",
};

/** Production default stays Kokoro until the ElevenLabs trial is accepted. */
export const PARENT_VIDEO_TTS = {
  ...KOKORO_TTS,
  endpoint: KOKORO_TTS.endpoint,
  voice: KOKORO_TTS.voice,
  speed: KOKORO_TTS.speed,
} as const;

export type ParentVideoVoice = (typeof PARENT_VIDEO_TTS)["voice"];

export function resolveTtsProvider(raw: string | undefined = process.env.PARENT_VIDEO_TTS_PROVIDER): TtsProviderId {
  const value = (raw || "kokoro").trim().toLowerCase();
  if (value === "elevenlabs" || value === "eleven" || value === "el") return "elevenlabs";
  return "kokoro";
}

async function downloadAudio(url: string): Promise<Buffer> {
  const audio = await fetch(url);
  if (!audio.ok) throw new Error(`Could not download TTS audio (${audio.status}).`);
  return Buffer.from(await audio.arrayBuffer());
}

async function speakKokoro(request: TtsRequest): Promise<TtsResult> {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY is missing. Add it as a cloud or shell secret.");

  const response = await fetch(KOKORO_TTS.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: request.text,
      voice: KOKORO_TTS.voice,
      speed: request.speed ?? KOKORO_TTS.speed,
    }),
  });
  if (!response.ok) {
    throw new Error(`Kokoro TTS failed (${response.status}): ${(await response.text()).slice(0, 240)}`);
  }
  const payload = (await response.json()) as { audio?: { url?: string } };
  const url = payload.audio?.url;
  if (!url) throw new Error("Kokoro TTS returned no audio URL.");
  return {
    bytes: await downloadAudio(url),
    format: "wav",
    provider: "kokoro",
    voice: KOKORO_TTS.voice,
  };
}

async function speakElevenLabs(request: TtsRequest): Promise<TtsResult> {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY is missing. Add it as a cloud or shell secret.");

  const response = await fetch(ELEVENLABS_TTS.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: request.text,
      voice: ELEVENLABS_TTS.voice,
      stability: ELEVENLABS_TTS.stability,
      language_code: ELEVENLABS_TTS.languageCode,
      apply_text_normalization: "auto",
    }),
  });
  if (!response.ok) {
    throw new Error(`ElevenLabs TTS failed (${response.status}): ${(await response.text()).slice(0, 240)}`);
  }
  const payload = (await response.json()) as { audio?: { url?: string } };
  const url = payload.audio?.url;
  if (!url) throw new Error("ElevenLabs TTS returned no audio URL.");
  return {
    bytes: await downloadAudio(url),
    format: "mp3",
    provider: "elevenlabs",
    voice: ELEVENLABS_TTS.voice,
  };
}

export async function speakParentVideo(request: TtsRequest, provider: TtsProviderId = resolveTtsProvider()): Promise<TtsResult> {
  if (provider === "elevenlabs") return speakElevenLabs(request);
  return speakKokoro(request);
}
