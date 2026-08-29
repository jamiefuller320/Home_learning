import type { Topic } from "@/content/schema";
import { buildParentVideoScript, type ParentVideoScript } from "@/lib/parent-video-script";
import { checkCoherenceDiff, runChecks } from "./checks";
import { projectScript, projectTopic } from "./document";
import type { JudgeReport } from "./types";

export function judgeDocument(document: ReturnType<typeof projectTopic>): JudgeReport {
  const findings = runChecks(document);
  return {
    topicId: document.topicId,
    title: document.title,
    sourceKind: document.sourceKind,
    spanCount: document.spans.length,
    findings,
  };
}

export function judgeTopic(topic: Topic, topics: Topic[]): JudgeReport {
  return judgeDocument(projectTopic(topic, topics));
}

export function judgeScript(script: ParentVideoScript, topic: Topic, topics: Topic[]): JudgeReport {
  return judgeDocument(projectScript(script, topic, topics));
}

/** Compile the video script from the pack, then run the same judge on the spoken beats. */
export function judgeExtractedScript(topic: Topic, topics: Topic[]): JudgeReport {
  return judgeScript(buildParentVideoScript(topic), topic, topics);
}

export function judgeTopicAndScript(topic: Topic, topics: Topic[]): { topic: JudgeReport; script: JudgeReport } {
  return {
    topic: judgeTopic(topic, topics),
    script: judgeExtractedScript(topic, topics),
  };
}

export function judgeAfterEdit(before: Topic, after: Topic, topics: Topic[]): JudgeReport {
  const afterReport = judgeTopic(after, topics);
  return {
    ...afterReport,
    findings: [...afterReport.findings, ...checkCoherenceDiff(before, after, topics)],
  };
}

export function blockingFindings(report: JudgeReport) {
  return report.findings.filter((finding) => finding.severity === "blocking");
}

export function countByCheck(report: JudgeReport): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const finding of report.findings) {
    counts[finding.check] = (counts[finding.check] ?? 0) + 1;
  }
  return counts;
}
