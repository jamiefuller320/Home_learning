import assert from "node:assert/strict";
import {
  ELEVENLABS_TTS,
  KOKORO_TTS,
  PARENT_VIDEO_TTS,
  resolveTtsProvider,
} from "../src/lib/parent-video-voice";

assert.equal(resolveTtsProvider(undefined), "elevenlabs");
assert.equal(resolveTtsProvider("kokoro"), "kokoro");
assert.equal(resolveTtsProvider("elevenlabs"), "elevenlabs");
assert.equal(resolveTtsProvider("Eleven"), "elevenlabs");
assert.equal(resolveTtsProvider("el"), "elevenlabs");

assert.equal(PARENT_VIDEO_TTS.voice, ELEVENLABS_TTS.voice, "production default is ElevenLabs Charlotte after listen trial");
assert.equal(ELEVENLABS_TTS.voice, "Charlotte");
assert.ok(ELEVENLABS_TTS.stability > 0.2 && ELEVENLABS_TTS.stability < 0.6);
assert.match(ELEVENLABS_TTS.endpoint, /elevenlabs\/tts\/eleven-v3/);
assert.equal(KOKORO_TTS.voice, "bf_alice");
assert.ok(KOKORO_TTS.speed >= 1.05 && KOKORO_TTS.speed <= 1.15);

console.log("Parent-video TTS provider config looks good.");
