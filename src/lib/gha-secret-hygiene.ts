/**
 * Static checks for GitHub Actions secret-exposure patterns.
 *
 * Public-repo `workflow_run` jobs run with base-repo privileges. This module
 * flags dangerous patterns so CI / a daily scheduled job can fail closed.
 *
 * Ported from jamiefuller320/value_investor (Python) for Home Learning.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export const DEFAULT_WORKFLOWS_DIR = ".github/workflows";
export const DEFAULT_LOOKBACK_HOURS = 36;

/** Privileged workflows that must keep explicit same-repo gates (repo-specific). */
export const REQUIRED_SAME_REPO_WORKFLOWS: readonly string[] = [];

const UNTRUSTED_RUN_INTERP =
  /\$\{\{\s*github\.event\.(?:pull_request\.head\.ref|workflow_run\.head_branch|workflow_run\.name)\s*\}\}/;

const DISPATCH_INPUT_IN_RUN = /\$\{\{\s*github\.event\.inputs\./;

const WORKFLOW_RUN_TRIGGER = /^\s*workflow_run\s*:/m;
const HEAD_REPO_GATE = /head_repository\.full_name\s*==\s*github\.repository/;
const EDITABLE_PIP = /pip\s+install\s+-e\b/;
const USES_WORKFLOW_RUN_HEAD = /github\.event\.workflow_run\.(?:head_branch|head_sha)/;
const CHECKOUT_UNTRUSTED_REF =
  /ref:\s*\$\{\{\s*github\.event\.workflow_run\.(?:head_branch|head_sha)\s*\}\}/;

/** Auto-provided token must use github.token, not secrets.GITHUB_TOKEN. */
const SECRETS_GITHUB_TOKEN = /secrets\.GITHUB_TOKEN/;

/** Service role must never be baked into static site builds. */
const SERVICE_ROLE_IN_BUILD =
  /(?:NEXT_PUBLIC_SUPABASE_SERVICE|SUPABASE_SERVICE_ROLE_KEY|service_role)/i;

export type HygieneSeverity = "error" | "warning";

export type HygieneFinding = {
  severity: HygieneSeverity;
  path: string;
  rule: string;
  message: string;
};

export type HygieneReport = {
  ok: boolean;
  errorCount: number;
  warningCount: number;
  scannedFiles: string[];
  findings: HygieneFinding[];
};

export type ScheduleGateDecision = {
  shouldRun: boolean;
  reason: string;
  mergedPrCount: number;
  workflowTouchCount: number;
  lookbackHours: number;
};

export function iterWorkflowFiles(workflowsDir = DEFAULT_WORKFLOWS_DIR): string[] {
  try {
    const entries = readdirSync(workflowsDir);
    return entries
      .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
      .map((name) => join(workflowsDir, name).replace(/\\/g, "/"))
      .sort();
  } catch {
    return [];
  }
}

export function extractRunBlocks(text: string): string[] {
  const blocks: string[] = [];
  const lines = text.split("\n");
  let i = 0;
  while (i < lines.length) {
    const match = lines[i].match(/^(\s*)(?:-\s+)?run:\s*[|>]\s*$/);
    if (!match) {
      i += 1;
      continue;
    }
    const indent = match[1].length;
    i += 1;
    const body: string[] = [];
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === "") {
        body.push(line);
        i += 1;
        continue;
      }
      const leading = line.length - line.trimStart().length;
      if (leading <= indent) break;
      body.push(line);
      i += 1;
    }
    blocks.push(body.join("\n"));
  }
  return blocks;
}

function pushFinding(
  findings: HygieneFinding[],
  severity: HygieneSeverity,
  path: string,
  rule: string,
  message: string,
): void {
  findings.push({ severity, path, rule, message });
}

export function scanWorkflowText(path: string, text: string): HygieneFinding[] {
  const findings: HygieneFinding[] = [];
  const name = path.split("/").pop() ?? path;
  const hasWorkflowRun = WORKFLOW_RUN_TRIGGER.test(text);
  const usesWorkflowRunHead = USES_WORKFLOW_RUN_HEAD.test(text);
  const checksOutUntrustedRef = CHECKOUT_UNTRUSTED_REF.test(text);
  const hasSameRepoGate = HEAD_REPO_GATE.test(text);

  for (const block of extractRunBlocks(text)) {
    const untrusted = UNTRUSTED_RUN_INTERP.exec(block);
    if (untrusted) {
      pushFinding(
        findings,
        "error",
        path,
        "untrusted_expr_in_run",
        `Untrusted GitHub expression inside run script: ${untrusted[0]}. Pass via env: and validate with a strict regex.`,
      );
    }
    const dispatchInput = DISPATCH_INPUT_IN_RUN.exec(block);
    if (dispatchInput) {
      pushFinding(
        findings,
        "error",
        path,
        "dispatch_input_in_run",
        `workflow_dispatch input interpolated inside run script: ${dispatchInput[0]}. Pass via env: (and allowlist) so a stolen dispatch PAT cannot shell-inject into secret-bearing jobs.`,
      );
    }
  }

  if (hasWorkflowRun && usesWorkflowRunHead && !hasSameRepoGate) {
    pushFinding(
      findings,
      "error",
      path,
      "workflow_run_missing_same_repo_gate",
      "workflow_run uses PR head fields without head_repository.full_name == github.repository",
    );
  }

  for (const required of REQUIRED_SAME_REPO_WORKFLOWS) {
    if (name === required && !hasSameRepoGate) {
      pushFinding(
        findings,
        "error",
        path,
        "required_same_repo_gate",
        `${name} must keep head_repository.full_name == github.repository`,
      );
    }
  }

  if (hasWorkflowRun && EDITABLE_PIP.test(text) && checksOutUntrustedRef) {
    pushFinding(
      findings,
      "error",
      path,
      "editable_install_with_untrusted_checkout",
      "workflow_run job checks out PR head with ref: and uses pip install -e (package code from the PR runs with write token)",
    );
  }

  if (SECRETS_GITHUB_TOKEN.test(text)) {
    pushFinding(
      findings,
      "error",
      path,
      "secrets_github_token",
      "Use github.token (or the auto-injected GITHUB_TOKEN env) instead of secrets.GITHUB_TOKEN — the latter is empty unless manually duplicated.",
    );
  }

  if (name === "pages.yml" && SERVICE_ROLE_IN_BUILD.test(text)) {
    pushFinding(
      findings,
      "error",
      path,
      "service_role_in_pages_build",
      "pages.yml must not inject SUPABASE_SERVICE_ROLE_KEY or service_role keys into the static site build.",
    );
  }

  if (/NEXT_PUBLIC_.*SERVICE_ROLE|NEXT_PUBLIC_.*service_role/i.test(text)) {
    pushFinding(
      findings,
      "error",
      path,
      "public_service_role_env",
      "Never prefix service_role keys with NEXT_PUBLIC_ — they would be baked into the client bundle.",
    );
  }

  return findings;
}

export function toHygieneReport(scannedFiles: string[], findings: HygieneFinding[]): HygieneReport {
  const errorCount = findings.filter((item) => item.severity === "error").length;
  const warningCount = findings.filter((item) => item.severity === "warning").length;
  return {
    ok: errorCount === 0,
    errorCount,
    warningCount,
    scannedFiles,
    findings,
  };
}

export function scanWorkflows(workflowsDir = DEFAULT_WORKFLOWS_DIR): HygieneReport {
  const scannedFiles: string[] = [];
  const findings: HygieneFinding[] = [];
  for (const path of iterWorkflowFiles(workflowsDir)) {
    scannedFiles.push(path);
    const text = readFileSync(path, "utf8");
    findings.push(...scanWorkflowText(path, text));
  }
  return toHygieneReport(scannedFiles, findings);
}

function parseRepo(repo: string): [string, string] {
  const parts = repo.trim().split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`repo must be owner/name, got ${JSON.stringify(repo)}`);
  }
  return [parts[0], parts[1]];
}

async function ghApiJson(url: string, token: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "home-learning-gha-secret-hygiene",
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub API ${response.status} for ${url}: ${detail}`);
  }
  return response.json();
}

export async function countMergedPrsSince(options: {
  repo: string;
  token: string;
  since: Date;
  base?: string;
}): Promise<number> {
  const { repo, token, since, base = "main" } = options;
  const [owner, name] = parseRepo(repo);
  const sinceIso = since.toISOString().replace(/\.\d{3}Z$/, "Z");
  const query = `repo:${owner}/${name} is:pr is:merged base:${base} merged:>=${sinceIso}`;
  const url = `https://api.github.com/search/issues?${new URLSearchParams({
    q: query,
    per_page: "1",
  })}`;
  const payload = (await ghApiJson(url, token)) as { total_count?: number };
  return Number(payload.total_count ?? 0);
}

export async function countWorkflowCommitsSince(options: {
  repo: string;
  token: string;
  since: Date;
  branch?: string;
  path?: string;
}): Promise<number> {
  const { repo, token, since, branch = "main", path = ".github/workflows" } = options;
  const [owner, name] = parseRepo(repo);
  const sinceIso = since.toISOString().replace(/\.\d{3}Z$/, "Z");
  const url = `https://api.github.com/repos/${owner}/${name}/commits?${new URLSearchParams({
    sha: branch,
    since: sinceIso,
    path,
    per_page: "100",
  })}`;
  const payload = await ghApiJson(url, token);
  return Array.isArray(payload) ? payload.length : 0;
}

export async function decideScheduleGate(options: {
  force?: boolean;
  lookbackHours?: number;
  mergedPrCount?: number;
  workflowTouchCount?: number;
  repo?: string;
  token?: string;
  now?: Date;
}): Promise<ScheduleGateDecision> {
  const hours = Math.max(1, Math.floor(options.lookbackHours ?? DEFAULT_LOOKBACK_HOURS));
  if (options.force) {
    return {
      shouldRun: true,
      reason: "force",
      mergedPrCount: options.mergedPrCount ?? 0,
      workflowTouchCount: options.workflowTouchCount ?? 0,
      lookbackHours: hours,
    };
  }

  const stamp = options.now ?? new Date();
  const since = new Date(stamp.getTime() - hours * 60 * 60 * 1000);

  let merged = options.mergedPrCount;
  let touches = options.workflowTouchCount;

  if (merged === undefined || touches === undefined) {
    if (!options.repo || !options.token) {
      throw new Error("repo and token are required unless counts are provided");
    }
    if (merged === undefined) {
      merged = await countMergedPrsSince({ repo: options.repo, token: options.token, since });
    }
    if (touches === undefined) {
      touches = await countWorkflowCommitsSince({
        repo: options.repo,
        token: options.token,
        since,
      });
    }
  }

  if (merged > 0 || touches > 0) {
    return {
      shouldRun: true,
      reason: "recent_main_changes",
      mergedPrCount: merged,
      workflowTouchCount: touches,
      lookbackHours: hours,
    };
  }
  return {
    shouldRun: false,
    reason: "no_recent_merges_or_workflow_changes",
    mergedPrCount: merged,
    workflowTouchCount: touches,
    lookbackHours: hours,
  };
}

export function workflowsDirExists(workflowsDir = DEFAULT_WORKFLOWS_DIR): boolean {
  try {
    return statSync(workflowsDir).isDirectory();
  } catch {
    return false;
  }
}
