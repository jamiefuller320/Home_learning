#!/usr/bin/env tsx
/**
 * CLI for GitHub Actions secret-hygiene scanning and schedule gating.
 *
 *   npx tsx scripts/gha-secret-hygiene.ts check
 *   npx tsx scripts/gha-secret-hygiene.ts schedule-gate [--force] [--github-output]
 */

import { appendFileSync } from "node:fs";
import {
  DEFAULT_LOOKBACK_HOURS,
  DEFAULT_WORKFLOWS_DIR,
  decideScheduleGate,
  scanWorkflows,
} from "../src/lib/gha-secret-hygiene";

function usage(): never {
  console.error(`Usage:
  gha-secret-hygiene check [--workflows-dir PATH] [--json]
  gha-secret-hygiene schedule-gate [--force] [--lookback-hours N] [--json] [--github-output]`);
  process.exit(2);
}

async function cmdCheck(args: string[]): Promise<number> {
  let workflowsDir = DEFAULT_WORKFLOWS_DIR;
  let json = false;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--workflows-dir") {
      workflowsDir = args[++i] ?? DEFAULT_WORKFLOWS_DIR;
    } else if (args[i] === "--json") {
      json = true;
    } else {
      usage();
    }
  }

  const report = scanWorkflows(workflowsDir);
  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      `scanned=${report.scannedFiles.length} errors=${report.errorCount} warnings=${report.warningCount}`,
    );
    for (const item of report.findings) {
      console.log(`${item.severity.toUpperCase()} ${item.path} [${item.rule}] ${item.message}`);
    }
    if (report.ok) {
      console.log("GHA secret hygiene: OK");
    } else {
      console.error("GHA secret hygiene: FAILED");
    }
  }
  return report.ok ? 0 : 1;
}

async function cmdScheduleGate(args: string[]): Promise<number> {
  let force = false;
  let lookbackHours = DEFAULT_LOOKBACK_HOURS;
  let json = false;
  let githubOutput = false;
  let repo = process.env.GITHUB_REPOSITORY?.trim() ?? "";
  let token = (process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? "").trim();

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--force") force = true;
    else if (arg === "--json") json = true;
    else if (arg === "--github-output") githubOutput = true;
    else if (arg === "--lookback-hours") lookbackHours = Number(args[++i]);
    else if (arg === "--repo") repo = args[++i] ?? "";
    else if (arg === "--token") token = args[++i] ?? "";
    else usage();
  }

  if (!force && (!token || !repo)) {
    console.error(
      "GITHUB_TOKEN/GH_TOKEN and GITHUB_REPOSITORY (or --token/--repo) required unless --force",
    );
    return 2;
  }

  const decision = await decideScheduleGate({
    force,
    lookbackHours,
    repo: repo || undefined,
    token: token || undefined,
  });

  if (json) {
    console.log(JSON.stringify(decision, null, 2));
  } else {
    console.log(
      `should_run=${decision.shouldRun} reason=${decision.reason} merged_prs=${decision.mergedPrCount} workflow_touches=${decision.workflowTouchCount} lookback_hours=${decision.lookbackHours}`,
    );
  }

  if (githubOutput) {
    const out = process.env.GITHUB_OUTPUT;
    if (!out) {
      console.error("GITHUB_OUTPUT is unset");
      return 2;
    }
    appendFileSync(
      out,
      [
        `should_run=${decision.shouldRun ? "true" : "false"}`,
        `reason=${decision.reason}`,
        `merged_pr_count=${decision.mergedPrCount}`,
        `workflow_touch_count=${decision.workflowTouchCount}`,
        "",
      ].join("\n"),
      "utf8",
    );
  }

  return 0;
}

async function main(): Promise<number> {
  const [command, ...rest] = process.argv.slice(2);
  if (command === "check") return cmdCheck(rest);
  if (command === "schedule-gate") return cmdScheduleGate(rest);
  usage();
}

main().then((code) => process.exit(code));
