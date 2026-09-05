"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { NoteSendActions } from "@/components/NoteSendActions";
import type { Topic } from "@/content/schema";
import {
  addLanguageNote,
  createNoteId,
  SECTION_LABEL,
  type LanguageNote,
} from "@/lib/language-log";
import { formatParentVideoComment } from "@/lib/parent-video-comments";
import { PROSODY_LABEL, type ProsodyRole } from "@/lib/parent-video-prosody";
import { buildParentVideoScript, visualLabel, type VideoBeat, type VideoScene } from "@/lib/parent-video-script";

type BeatRef = {
  scene: VideoScene;
  beat: VideoBeat;
  beatIndex: number;
  path: string;
};

function beatPath(sceneId: string, index: number): string {
  return `scenes.${sceneId}.beats[${index}]`;
}

function roleOf(beat: VideoBeat): ProsodyRole {
  return beat.prosody ?? "teach";
}

export function ParentVideoScriptViewer({ topic }: { topic: Topic }) {
  const script = useMemo(() => buildParentVideoScript(topic), [topic]);
  const [active, setActive] = useState<BeatRef | null>(null);
  const [comment, setComment] = useState("");
  const [clearer, setClearer] = useState("");
  const [saved, setSaved] = useState<LanguageNote | null>(null);

  function openComment(scene: VideoScene, beat: VideoBeat, beatIndex: number) {
    setSaved(null);
    setActive({ scene, beat, beatIndex, path: beatPath(scene.id, beatIndex) });
    setComment("");
    setClearer("");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!active || !comment.trim()) return;

    const note: LanguageNote = {
      id: createNoteId(),
      createdAt: new Date().toISOString(),
      topicId: topic.id,
      topicTitle: topic.title,
      section: "parent-video",
      unclear: formatParentVideoComment({
        path: active.path,
        prosody: roleOf(active.beat),
        spoken: active.beat.spoken,
        comment: comment.trim(),
      }),
      clearer: clearer.trim(),
      pagePath: typeof window !== "undefined" ? window.location.href : `/for-schools/script`,
      status: "open",
    };

    addLanguageNote(note);
    setSaved(note);
    setComment("");
    setClearer("");
    setActive(null);
  }

  return (
    <section className="no-print space-y-6" aria-labelledby="parent-video-script-heading">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">Pre-production</p>
        <h2 id="parent-video-script-heading" className="serif mt-2 text-3xl text-ink sm:text-4xl">
          Parent video script
        </h2>
        <p className="mt-3 max-w-3xl text-ink-soft">
          Colour shows how each line is meant to be spoken (title, key line, example, aside…). Comment
          on a beat to send it into the language inbox — same Supabase loop as “I don’t understand”.
        </p>
      </div>

      <ul className="prosody-legend flex flex-wrap gap-2" aria-label="Prosody colour key">
        {(Object.keys(PROSODY_LABEL) as ProsodyRole[]).map((role) => (
          <li key={role} className={`prosody-chip prosody-${role}`}>
            {PROSODY_LABEL[role]}
          </li>
        ))}
      </ul>

      {saved ? (
        <div className="rounded-2xl border border-teal/30 bg-white/80 p-5">
          <p className="font-semibold text-ink">Comment saved and queued for the review loop.</p>
          <div className="mt-3">
            <NoteSendActions note={saved} autoSend />
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/language" className="text-teal underline">
              View language log
            </Link>
            <button type="button" className="text-ink-soft underline" onClick={() => setSaved(null)}>
              Comment on another beat
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-8">
        {script.scenes.map((scene) => (
          <div key={scene.id}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">{scene.kicker}</p>
            <h3 className="serif mt-1 text-2xl text-ink">{scene.heading}</h3>
            <ol className="mt-4 space-y-3">
              {scene.beats.map((beat, beatIndex) => {
                const role = roleOf(beat);
                const path = beatPath(scene.id, beatIndex);
                const isOpen = active?.path === path;
                return (
                  <li key={path} className={`prosody-beat prosody-${role}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                          {PROSODY_LABEL[role]} · {beat.pauseAfter.toFixed(2)}s gap
                        </p>
                        <p className="mt-1 text-lg leading-7 text-ink">{beat.spoken}</p>
                        {beat.visual ? (
                          <p className="mt-1 text-sm text-ink-soft">
                            Picture: {visualLabel(beat.visual)}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded-full border border-rule px-3 py-1.5 text-sm font-semibold text-teal hover:border-teal hover:bg-white"
                        onClick={() => openComment(scene, beat, beatIndex)}
                        aria-expanded={isOpen}
                      >
                        Comment
                      </button>
                    </div>
                    {isOpen ? (
                      <form className="mt-4 space-y-3 border-t border-rule/60 pt-4" onSubmit={handleSubmit}>
                        <p className="text-sm text-ink-soft">
                          {SECTION_LABEL["parent-video"]} · <code className="text-xs">{path}</code>
                        </p>
                        <label className="block">
                          <span className="font-semibold text-ink">What sounds wrong or unclear aloud?</span>
                          <textarea
                            required
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                            rows={3}
                            className="mt-2 w-full rounded-xl border border-rule bg-white p-3 text-ink"
                            placeholder="e.g. rushes the example; aside sounds like a joke; stress the readiness line."
                          />
                        </label>
                        <label className="block">
                          <span className="font-semibold text-ink">A clearer way to say it (optional)</span>
                          <textarea
                            value={clearer}
                            onChange={(event) => setClearer(event.target.value)}
                            rows={2}
                            className="mt-2 w-full rounded-xl border border-rule bg-white p-3 text-ink"
                            placeholder="A sentence that would sound natural when spoken."
                          />
                        </label>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            className="rounded-full bg-teal px-4 py-2 font-semibold text-white hover:bg-teal-deep"
                          >
                            Send to review loop
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-rule px-4 py-2 font-semibold text-ink-soft hover:border-teal"
                            onClick={() => setActive(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
