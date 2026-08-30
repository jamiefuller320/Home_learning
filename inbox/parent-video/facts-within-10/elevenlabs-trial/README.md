# ElevenLabs listen trial · Number facts within 10

- Provider: fal `fal-ai/elevenlabs/tts/eleven-v3`
- Voice: **Charlotte** (stability 0.4)
- Mode: short collage (open / plain / mix / page / close)

## Status

**Adopted for production** after human listen-pass (2026-08-30).
Default provider is ElevenLabs; Kokoro remains a fallback via `PARENT_VIDEO_TTS_PROVIDER=kokoro`.

## Listen

- [Short collage](./listen.mp3)

## Re-run

```bash
npm run trial:elevenlabs-parent-video -- facts-within-10
npm run trial:elevenlabs-parent-video -- facts-within-10 --full
```
