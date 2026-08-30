# ElevenLabs listen trial · Number facts within 10

- Provider: fal `fal-ai/elevenlabs/tts/eleven-v3`
- Voice: **Charlotte** (stability 0.4)
- Mode: short collage (open / plain / mix / page / close)
- Compared with production Kokoro `bf_alice` @ 1.1

## Listen

- [Short collage](./listen.mp3)

## How to re-run

```bash
npm run trial:elevenlabs-parent-video -- facts-within-10
npm run trial:elevenlabs-parent-video -- facts-within-10 --full
```

Production render still uses Kokoro until this trial is accepted
(`PARENT_VIDEO_TTS_PROVIDER` defaults to `kokoro`).
