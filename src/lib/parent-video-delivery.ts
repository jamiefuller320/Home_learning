import type { ParentVideoScript, VideoBeat } from "@/lib/parent-video-script";
import { allBeats } from "@/lib/parent-video-script";

export type DeliverySeverity = "blocking" | "note";

export type DeliveryFinding = {
  severity: DeliverySeverity;
  code: string;
  beatPath: string;
  spoken: string;
  message: string;
};

export type DeliveryReport = {
  topicId: string;
  findings: DeliveryFinding[];
  blockingCount: number;
};

type PatternRule = {
  code: string;
  severity: DeliverySeverity;
  pattern: RegExp;
  message: string;
};

/**
 * Phrases that can look fine on the page but sound odd, meta, or like UI chrome aloud.
 * Kokoro has no SSML — if it reads awkwardly, rewrite the pack (source of truth).
 */
const SPOKEN_PATTERN_RULES: PatternRule[] = [
  {
    code: "worksheet-brand",
    severity: "blocking",
    pattern: /\bworksheet brand\b/i,
    message:
      "“Worksheet brand” is a page aside that sounds odd aloud. Say what a number bond is, without product-meta.",
  },
  {
    code: "product-meta-aside",
    severity: "blocking",
    pattern: /\bnot a \w+ brand\b/i,
    message: "Product-meta asides (“not a … brand”) read as a quip on paper and fall flat in speech.",
  },
  {
    code: "ui-chrome-looking-for",
    severity: "blocking",
    pattern: /^looking for:/i,
    message: "“Looking for:” sounds like page chrome. Prefer “You want to see …” when speaking.",
  },
  {
    code: "ui-chrome-one-check",
    severity: "note",
    pattern: /^one check from the page\.?$/i,
    message: "Fine as a short bridge, but keep it brief — the check prompt should carry the meaning.",
  },
  {
    code: "bare-negation-aside",
    severity: "note",
    pattern: /^not a .+\.$/i,
    message: "Bare negation asides often need a full thought when spoken alone.",
  },
];

function beatPath(sceneId: string, index: number): string {
  return `scenes.${sceneId}.beats[${index}]`;
}

function indexedBeats(script: ParentVideoScript): { path: string; beat: VideoBeat }[] {
  const rows: { path: string; beat: VideoBeat }[] = [];
  for (const scene of script.scenes) {
    scene.beats.forEach((beat, index) => {
      rows.push({ path: beatPath(scene.id, index), beat });
    });
  }
  return rows;
}

/** Paper/aloud checks on compiled spoken clips — no TTS required. */
export function evaluateSpokenDelivery(script: ParentVideoScript): DeliveryReport {
  const findings: DeliveryFinding[] = [];

  for (const { path, beat } of indexedBeats(script)) {
    const spoken = beat.spoken.trim();
    if (!spoken) {
      findings.push({
        severity: "blocking",
        code: "empty-beat",
        beatPath: path,
        spoken,
        message: "Empty spoken beat.",
      });
      continue;
    }

    if (spoken.length > 220) {
      findings.push({
        severity: "note",
        code: "long-clip",
        beatPath: path,
        spoken,
        message: "Long clip — consider another sentence split so pacing stays natural.",
      });
    }

    for (const rule of SPOKEN_PATTERN_RULES) {
      if (rule.pattern.test(spoken)) {
        findings.push({
          severity: rule.severity,
          code: rule.code,
          beatPath: path,
          spoken,
          message: rule.message,
        });
      }
    }
  }

  // Orphan fact-list lead without following example clips is fine; stacked examples without pauses are handled at compile time.
  void allBeats;

  return {
    topicId: script.topicId,
    findings,
    blockingCount: findings.filter((item) => item.severity === "blocking").length,
  };
}

export function deliveryBlocksProduction(report: DeliveryReport): boolean {
  return report.blockingCount > 0;
}
