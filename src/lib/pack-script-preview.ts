import type { Topic } from "@/content/schema";
import { evaluateSpokenDelivery, type DeliveryReport } from "@/lib/parent-video-delivery";
import {
  allBeats,
  buildParentVideoScript,
  spokenCorpus,
  visualLabel,
  type ParentVideoScript,
  type VideoBeat,
} from "@/lib/parent-video-script";

export type RehearsalBeatPreview = {
  path: string;
  sceneId: string;
  spoken: string;
  line: string;
  pauseAfter: number;
  prosody?: string;
};

export type ScriptPreviewBundle = {
  script: ParentVideoScript;
  delivery: DeliveryReport;
  hash: string;
  scriptJson: {
    topicId: string;
    title: string;
    scriptHash: string;
    delivery: DeliveryReport;
    scenes: ParentVideoScript["scenes"];
    beats: RehearsalBeatPreview[];
  };
  scriptMarkdown: string;
};

function beatPath(sceneId: string, index: number): string {
  return `scenes.${sceneId}.beats[${index}]`;
}

function flattenBeats(script: ParentVideoScript): RehearsalBeatPreview[] {
  const rows: RehearsalBeatPreview[] = [];
  for (const scene of script.scenes) {
    scene.beats.forEach((beat, index) => {
      rows.push({
        path: beatPath(scene.id, index),
        sceneId: scene.id,
        spoken: beat.spoken,
        line: beat.line,
        pauseAfter: beat.pauseAfter,
        prosody: beat.prosody,
      });
    });
  }
  return rows;
}

/** Browser-safe fingerprint for maintainer staleness checks (djb2 hex). */
export function previewScriptFingerprint(script: ParentVideoScript): string {
  const text = spokenCorpus(script);
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 33) ^ text.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function formatFindings(
  findings: Array<{ severity: string; code: string; beatPath: string; message: string; spoken: string }>,
): string {
  if (findings.length === 0) return "_No findings._\n";
  return findings
    .map((item) => {
      const mark = item.severity === "blocking" ? "!" : "-";
      return `${mark} **${item.code}** (\`${item.beatPath}\`) — ${item.message}\n  > ${item.spoken}`;
    })
    .join("\n\n");
}

function renderScriptMarkdown(
  topic: Topic,
  script: ParentVideoScript,
  delivery: DeliveryReport,
): string {
  const hash = previewScriptFingerprint(script);
  const lines: string[] = [
    `# Parent video script · ${topic.title}`,
    "",
    `Topic id: \`${topic.id}\`  `,
    `Script hash: \`${hash}\`  `,
    `Beats: ${allBeats(script).length}  `,
    "",
    "Compiled from the written pack.",
    "",
    "## Spoken delivery check",
    "",
    formatFindings(delivery.findings),
    "",
  ];

  for (const scene of script.scenes) {
    lines.push(`## ${scene.id} · ${scene.heading}`, "", `_${scene.kicker}_`, "");
    scene.beats.forEach((beat: VideoBeat, index: number) => {
      const role = beat.prosody ?? "teach";
      lines.push(`${index + 1}. \`[${role}]\` (${beat.pauseAfter.toFixed(2)}s gap) ${beat.spoken}`);
      if (beat.visual) {
        lines.push(`   _[${beat.visual.kind}]_ ${visualLabel(beat.visual)}`);
      }
    });
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

export function buildScriptPreviewBundle(topic: Topic): ScriptPreviewBundle {
  const script = buildParentVideoScript(topic);
  const delivery = evaluateSpokenDelivery(script);
  const hash = previewScriptFingerprint(script);
  const beats = flattenBeats(script);

  return {
    script,
    delivery,
    hash,
    scriptJson: {
      topicId: topic.id,
      title: topic.title,
      scriptHash: hash,
      delivery,
      scenes: script.scenes,
      beats,
    },
    scriptMarkdown: renderScriptMarkdown(topic, script, delivery),
  };
}
