import type { LanguageNote } from "@/lib/language-log";
import type {
  CoverageOutcome,
  CoverageReport,
  CoverageRow,
  EvalCase,
  JudgeFinding,
  JudgeReport,
  ProposedCover,
} from "./types";

function excerptHitsFinding(excerpt: string, finding: JudgeFinding): boolean {
  const needle = excerpt.trim().toLowerCase();
  if (!needle) return false;
  const span = finding.span.toLowerCase();
  const message = finding.message.toLowerCase();
  const evidence = finding.evidence.toLowerCase();
  return span.includes(needle) || needle.includes(span.slice(0, 40)) || message.includes(needle) || evidence.includes(needle);
}

export function evaluateCase(evalCase: EvalCase, findings: JudgeFinding[]): CoverageOutcome {
  const relevant = findings.filter((item) => {
    if (evalCase.fieldPath && item.fieldPath !== evalCase.fieldPath && !item.fieldPath.startsWith(evalCase.fieldPath)) {
      return excerptHitsFinding(evalCase.excerpt, item);
    }
    return excerptHitsFinding(evalCase.excerpt, item) || (evalCase.fieldPath ? item.fieldPath === evalCase.fieldPath : false);
  });

  const matched = relevant.length > 0 ? relevant : findings.filter((item) => excerptHitsFinding(evalCase.excerpt, item));

  if (evalCase.expectedCheck === null) {
    return matched.length === 0 ? "silent-ok" : "noise";
  }

  if (matched.some((item) => item.check === evalCase.expectedCheck)) {
    if (evalCase.expectedCoverId && !matched.some((item) => item.coverId === evalCase.expectedCoverId)) {
      return "partial";
    }
    return "hit";
  }

  if (matched.length > 0) return "partial";
  return "miss";
}

export function scoreCoverage(cases: EvalCase[], reports: JudgeReport[]): CoverageReport {
  const byTopic = new Map(reports.map((report) => [`${report.sourceKind}:${report.topicId}`, report]));
  const rows: CoverageRow[] = [];

  for (const evalCase of cases) {
    const topicReport = byTopic.get(`topic:${evalCase.topicId}`);
    const scriptReport = byTopic.get(`script:${evalCase.topicId}`);
    const findings = [...(topicReport?.findings ?? []), ...(scriptReport?.findings ?? [])];
    const outcome = evaluateCase(evalCase, findings);
    rows.push({
      caseId: evalCase.id,
      outcome,
      expectedCheck: evalCase.expectedCheck,
      matchedChecks: findings.filter((item) => excerptHitsFinding(evalCase.excerpt, item)).map((item) => item.check),
      note: evalCase.note,
    });
  }

  return {
    rows,
    hits: rows.filter((row) => row.outcome === "hit").length,
    misses: rows.filter((row) => row.outcome === "miss").length,
    noise: rows.filter((row) => row.outcome === "noise").length,
    silentOk: rows.filter((row) => row.outcome === "silent-ok").length,
  };
}

export function proposeCoversFromMisses(cases: EvalCase[], report: CoverageReport): ProposedCover[] {
  const missed = cases.filter((evalCase) =>
    report.rows.some((row) => row.caseId === evalCase.id && row.outcome === "miss" && evalCase.expectedCheck),
  );

  const byCheck = new Map<string, EvalCase[]>();
  for (const evalCase of missed) {
    const key = evalCase.expectedCheck as string;
    const list = byCheck.get(key) ?? [];
    list.push(evalCase);
    byCheck.set(key, list);
  }

  const covers: ProposedCover[] = [];

  for (const [check, group] of byCheck) {
    if (group.length < 2) continue;
    const words = group
      .map((item) => item.excerpt.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((word) => word.length > 3))
      .filter((list) => list.length > 0);
    const shared = words[0]?.filter((word) => words.every((list) => list.includes(word))) ?? [];

    covers.push({
      check: check as ProposedCover["check"],
      title: `Cover ${check} misses (${group.length})`,
      rationale:
        shared.length > 0
          ? `Human notes share “${shared.slice(0, 6).join(" ")}”. Promote a reusable probe or phrase learning.`
          : "Several human notes failed the same check. Promote a probe, not an auto-rewrite.",
      missIds: group.map((item) => item.id),
      kind: check === "assumedKnowledge" ? "term-unlock" : check === "style" ? "phrase" : "probe",
      suggestedFind: shared.slice(0, 4).join(" ") || undefined,
    });
  }

  return covers;
}

/** Closed language notes become exam questions for the judge. */
export function evalCasesFromLanguageNotes(notes: LanguageNote[]): EvalCase[] {
  return notes
    .filter((note) => note.status === "done" || note.status === "declined")
    .map((note): EvalCase => ({
      id: `note-${note.id}`,
      topicId: note.topicId,
      excerpt: note.unclear.trim(),
      expectedCheck: note.status === "declined" ? null : "style",
      note: note.reviewNote || note.unclear,
      source: "language-note",
    }))
    .filter((item) => item.excerpt.length > 0);
}
