import type { Topic } from "@/content/schema";
import {
  CLASSROOM_SHORTHAND,
  CLASSROOM_TERMS,
  METHOD_CLASHES,
  POINTING_PATTERNS,
  looksLikeWarning,
  phraseLearnings,
  pointingHasAnchor,
} from "./rules";
import { findTermMentions, projectTopic, termIdsInText } from "./document";
import type { JudgeDocument, JudgeFinding, JudgeSpan } from "./types";

function finding(
  partial: Omit<JudgeFinding, "span"> & { span: string },
): JudgeFinding {
  return {
    ...partial,
    span: partial.span.length > 180 ? `${partial.span.slice(0, 177)}...` : partial.span,
  };
}

function teachingSpans(document: JudgeDocument): JudgeSpan[] {
  return document.spans.filter((span) => span.role === "teaching");
}

export function checkStyle(document: JudgeDocument): JudgeFinding[] {
  const findings: JudgeFinding[] = [];

  for (const span of document.spans) {
    if (span.role === "script-link") continue;

    for (const rule of CLASSROOM_SHORTHAND) {
      if (!rule.pattern.test(span.text)) continue;
      findings.push(
        finding({
          check: "style",
          severity: "blocking",
          fieldPath: span.fieldPath,
          span: span.text,
          message: `Classroom shorthand “${rule.label}” does not fit the house style.`,
          evidence: "Style card: write as you would say it to a tired parent.",
          coverId: rule.coverId,
        }),
      );
    }

    for (const learning of phraseLearnings()) {
      if (!span.text.toLowerCase().includes(learning.find.toLowerCase())) continue;
      findings.push(
        finding({
          check: "style",
          severity: "note",
          fieldPath: span.fieldPath,
          span: span.text,
          message: learning.title,
          evidence: learning.principle,
          coverId: `learning-${learning.id}`,
        }),
      );
    }
  }

  return findings;
}

export function checkAccuracy(document: JudgeDocument): JudgeFinding[] {
  const findings: JudgeFinding[] = [];

  for (const span of teachingSpans(document)) {
    if (looksLikeWarning(span.text)) continue;
    for (const clash of METHOD_CLASHES) {
      if (!clash.pattern.test(span.text)) continue;
      findings.push(
        finding({
          check: "accuracy",
          severity: "blocking",
          fieldPath: span.fieldPath,
          span: span.text,
          message: `Teaching text recommends “${clash.label}”, which clashes with current Year 1 method.`,
          evidence: "Treat this as an instruction, not a warning. Move it to avoidThis or rewrite.",
          coverId: clash.coverId,
        }),
      );
    }
  }

  return findings;
}

export function checkAmbiguity(document: JudgeDocument): JudgeFinding[] {
  const findings: JudgeFinding[] = [];

  for (const span of teachingSpans(document)) {
    for (const rule of POINTING_PATTERNS) {
      if (!rule.pattern.test(span.text)) continue;
      if (pointingHasAnchor(span.text, rule.coverId)) continue;
      findings.push(
        finding({
          check: "ambiguity",
          severity: "note",
          fieldPath: span.fieldPath,
          span: span.text,
          message: "A tired parent could form two different pictures from this sentence.",
          evidence: `Picture A: ${rule.pictureA} Picture B: ${rule.pictureB}`,
          coverId: rule.coverId,
        }),
      );
    }
  }

  return findings;
}

function hasGloss(text: string, termId: string): boolean {
  const rule = CLASSROOM_TERMS.find((item) => item.id === termId);
  if (!rule) return false;
  const lower = text.toLowerCase();
  if (/\b(means|is a|is an)\b/i.test(text) || text.includes("(")) return true;
  return rule.glossHints.some((hint) => lower.includes(hint.toLowerCase()));
}

export function checkAssumedKnowledge(document: JudgeDocument): JudgeFinding[] {
  const findings: JudgeFinding[] = [];
  const seen = new Set(document.unlockedTermIds);
  const introduced = new Set<string>();

  for (const span of document.spans) {
    if (span.role === "script-link" || span.role === "kit" || span.role === "caution") continue;

    const mentions = findTermMentions(span.text);
    for (const mention of mentions) {
      const rule = CLASSROOM_TERMS.find((item) => item.id === mention.termId);
      if (!rule || rule.everyday) continue;

      if (seen.has(mention.termId) || introduced.has(mention.termId)) continue;

      const ownTerm = document.introducingTermIds.includes(mention.termId);
      if (ownTerm && hasGloss(span.text, mention.termId)) {
        introduced.add(mention.termId);
        seen.add(mention.termId);
        continue;
      }

      if (ownTerm) {
        findings.push(
          finding({
            check: "assumedKnowledge",
            severity: "blocking",
            fieldPath: span.fieldPath,
            span: span.text,
            message: `“${mention.phrase}” is used before this lesson has taught it.`,
            evidence: `Isolated read has to invent what a ${mention.phrase} is. Add a gloss in the same sentence.`,
            coverId: `term-gloss-${mention.termId}`,
          }),
        );
        continue;
      }

      findings.push(
        finding({
          check: "assumedKnowledge",
          severity: "blocking",
          fieldPath: span.fieldPath,
          span: span.text,
          message: `“${mention.phrase}” relies on a lesson that is not a prerequisite.`,
          evidence: `Allowed prior terms: ${document.unlockedTermIds.join(", ") || "(none)"}.`,
          coverId: `term-unlock-${mention.termId}`,
        }),
      );
    }
  }

  return findings;
}

export function checkScriptFidelity(document: JudgeDocument): JudgeFinding[] {
  if (document.sourceKind !== "script") return [];

  const findings: JudgeFinding[] = [];
  const allowed = new Set([...document.sourceTermIds, ...document.unlockedTermIds, ...document.introducingTermIds]);

  for (const span of document.spans) {
    if (span.role !== "script-visual") continue;
    for (const termId of termIdsInText(span.text)) {
      if (allowed.has(termId)) continue;
      findings.push(
        finding({
          check: "coherence",
          severity: "blocking",
          fieldPath: span.fieldPath,
          span: span.text,
          message: `Compiled script invents “${termId}”, which is not in the written pack.`,
          evidence: "The film must compile the page. Visual captions cannot add a new classroom term.",
          coverId: `script-invent-${termId}`,
        }),
      );
    }
  }

  return findings;
}

export function checkCoherenceDiff(before: Topic, after: Topic, allTopics: Topic[]): JudgeFinding[] {
  const beforeDoc = projectTopic(before, allTopics);
  const afterDoc = projectTopic(after, allTopics);
  const findings: JudgeFinding[] = [];

  const briefingTeaching = (document: ReturnType<typeof projectTopic>) =>
    termIdsInText(
      document.spans
        .filter((span) => span.role === "teaching" && span.fieldPath.startsWith("parentBriefing."))
        .map((span) => span.text)
        .join("\n"),
    );

  const beforeBriefing = briefingTeaching(beforeDoc);
  const afterBriefing = new Set(briefingTeaching(afterDoc));
  const afterPack = new Set(
    termIdsInText(
      afterDoc.spans
        .filter((span) => span.fieldPath.startsWith("homePack."))
        .map((span) => span.text)
        .join("\n"),
    ),
  );

  for (const termId of beforeBriefing) {
    if (afterBriefing.has(termId)) continue;
    if (!afterPack.has(termId)) continue;
    findings.push({
      check: "coherence",
      severity: "blocking",
      fieldPath: "parentBriefing",
      span: termId,
      message: `Edit dropped “${termId}” from the briefing but the home pack still uses it.`,
      evidence: "Line edits must not desync Stage 1 and Stage 2.",
      coverId: `coherence-dropped-${termId}`,
    });
  }

  return findings;
}

export function runChecks(document: JudgeDocument): JudgeFinding[] {
  return [
    ...checkStyle(document),
    ...checkAccuracy(document),
    ...checkAmbiguity(document),
    ...checkAssumedKnowledge(document),
    ...checkScriptFidelity(document),
  ];
}
