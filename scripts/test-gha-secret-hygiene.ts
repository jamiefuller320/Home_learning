/** Guards against reintroducing GHA secret-exposure patterns. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  decideScheduleGate,
  extractRunBlocks,
  scanWorkflowText,
  scanWorkflows,
} from "../src/lib/gha-secret-hygiene";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WORKFLOWS = join(ROOT, ".github", "workflows");

async function main(): Promise<void> {
  const report = scanWorkflows(WORKFLOWS);
  const errors = report.findings.filter((item) => item.severity === "error");
  assert.deepEqual(errors, [], `Unexpected hygiene errors: ${JSON.stringify(errors, null, 2)}`);
  assert.equal(report.ok, true);

  const supabaseCheck = readFileSync(join(WORKFLOWS, "supabase-check.yml"), "utf8");
  assert.ok(
    !supabaseCheck.includes("${SUPABASE_ANON_KEY}") ||
      supabaseCheck.includes("length ${#SUPABASE_ANON_KEY}"),
    "supabase-check must not echo full anon key values",
  );

  const pages = readFileSync(join(WORKFLOWS, "pages.yml"), "utf8");
  assert.ok(!/SUPABASE_SERVICE_ROLE|service_role/i.test(pages), "pages build must not use service_role");
  assert.ok(pages.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY"), "pages build expects public anon key");

  const evilUntrusted = `
name: Evil
on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
jobs:
  x:
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "\${{ github.event.workflow_run.head_branch }}"
`;
  assert.ok(
    scanWorkflowText("evil.yml", evilUntrusted).some((item) => item.rule === "untrusted_expr_in_run"),
  );

  const evilDispatch = `
name: Evil
on:
  workflow_dispatch:
    inputs:
      task_id:
        type: string
jobs:
  x:
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "\${{ github.event.inputs.task_id }}"
`;
  assert.ok(
    scanWorkflowText("evil.yml", evilDispatch).some((item) => item.rule === "dispatch_input_in_run"),
  );

  const okDispatch = `
name: Ok
on:
  workflow_dispatch:
    inputs:
      task_id:
        type: string
jobs:
  x:
    runs-on: ubuntu-latest
    steps:
      - env:
          TASK_ID: \${{ github.event.inputs.task_id }}
        run: |
          echo "$TASK_ID"
`;
  assert.ok(
    !scanWorkflowText("ok.yml", okDispatch).some((item) => item.rule === "dispatch_input_in_run"),
  );

  const evilSameRepo = `
name: Evil
on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
jobs:
  x:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          ref: \${{ github.event.workflow_run.head_sha }}
`;
  assert.ok(
    scanWorkflowText("evil.yml", evilSameRepo).some(
      (item) => item.rule === "workflow_run_missing_same_repo_gate",
    ),
  );

  const evilGithubTokenSecret = `
name: Evil
on:
  workflow_dispatch:
jobs:
  x:
    runs-on: ubuntu-latest
    steps:
      - env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: echo ok
`;
  assert.ok(
    scanWorkflowText("evil.yml", evilGithubTokenSecret).some(
      (item) => item.rule === "secrets_github_token",
    ),
  );

  const forced = await decideScheduleGate({ force: true });
  assert.equal(forced.shouldRun, true);
  assert.equal(forced.reason, "force");

  const skip = await decideScheduleGate({
    force: false,
    mergedPrCount: 0,
    workflowTouchCount: 0,
    lookbackHours: 36,
  });
  assert.equal(skip.shouldRun, false);
  assert.equal(skip.reason, "no_recent_merges_or_workflow_changes");

  const run = await decideScheduleGate({
    force: false,
    mergedPrCount: 2,
    workflowTouchCount: 0,
    lookbackHours: 36,
  });
  assert.equal(run.shouldRun, true);
  assert.equal(run.reason, "recent_main_changes");

  const envBlock = `
jobs:
  x:
    steps:
      - env:
          BRANCH: \${{ github.event.workflow_run.head_branch }}
        run: |
          echo "$BRANCH"
`;
  const blocks = extractRunBlocks(envBlock);
  assert.equal(blocks.length, 1);
  assert.ok(blocks[0].includes("$BRANCH"));
  assert.ok(!blocks[0].includes("github.event"));

  console.log("test-gha-secret-hygiene: OK");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
