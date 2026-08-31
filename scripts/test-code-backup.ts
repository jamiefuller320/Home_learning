import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import {
  createCodeBackupSnapshot,
  listLocalCodeBackups,
  monthlyBackupNames,
  resolveCodeBackupS3Uri,
  restoreCodeBackupSnapshot,
  snapshotFromPayload,
  tryUploadCodeBackupSnapshot,
  verifyCodeBackupSnapshot,
} from "../src/lib/code-backup";

function git(cwd: string, args: string[]): void {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
}

const sandbox = mkdtempSync(join(tmpdir(), "home-learning-code-backup-"));
git(sandbox, ["init"]);
git(sandbox, ["config", "user.email", "backup-test@example.com"]);
git(sandbox, ["config", "user.name", "Backup Test"]);
git(sandbox, ["remote", "add", "origin", "https://github.com/jamiefuller320/Home_learning.git"]);
mkdirSync(join(sandbox, "src"), { recursive: true });
writeFileSync(join(sandbox, "README.md"), "# fixture\n", "utf8");
writeFileSync(join(sandbox, "src", "pack.ts"), "export const topic = 'facts-within-10';\n", "utf8");
writeFileSync(join(sandbox, "ignored.log"), "do not pack\n", "utf8");
writeFileSync(join(sandbox, ".gitignore"), "ignored.log\n", "utf8");
git(sandbox, ["add", "README.md", "src/pack.ts", ".gitignore"]);
git(sandbox, ["commit", "-m", "fixture"]);

async function main(): Promise<void> {
const snapshot = await createCodeBackupSnapshot({
  repoRoot: sandbox,
  now: new Date("2026-08-31T13:00:00.000Z"),
});

assert.match(snapshot.manifest.archive_name, /^home-learning-code-20260831T130000Z\.tar\.gz$/);
assert.equal(snapshot.manifest.kind, "code");
assert.equal(snapshot.manifest.file_count, 3);
assert.ok(snapshot.manifest.bytes > 0);
assert.match(snapshot.manifest.commit, /^[0-9a-f]{40}$/);
assert.match(snapshot.manifest.repo, /Home_learning/);
assert.ok(snapshot.manifest.paths_sample.includes("README.md"));

const verified = await verifyCodeBackupSnapshot(snapshot.archive_path);
assert.equal(verified.ok, true);
assert.equal(verified.actual_sha256, snapshot.manifest.sha256);

const listed = listLocalCodeBackups(join(sandbox, "output/backups"));
assert.equal(listed.length, 1);
assert.equal(listed[0]?.archive_exists, true);

const restoreDir = join(sandbox, "restored");
const dry = restoreCodeBackupSnapshot({
  archivePath: snapshot.archive_path,
  destDir: restoreDir,
  dryRun: true,
});
assert.equal(dry.dry_run, true);
assert.equal(dry.member_count, 3);
assert.ok(dry.members.includes("README.md"));
assert.ok(dry.members.includes("src/pack.ts"));
assert.ok(!dry.members.includes("ignored.log"));

const restored = restoreCodeBackupSnapshot({
  archivePath: snapshot.archive_path,
  destDir: restoreDir,
});
assert.equal(restored.dry_run, false);
assert.equal(readFileSync(join(restoreDir, "src/pack.ts"), "utf8"), "export const topic = 'facts-within-10';\n");

assert.equal(
  resolveCodeBackupS3Uri("s3://shared-backups/ftse-value-investor/backups/"),
  "s3://shared-backups/home-learning/code",
);
assert.equal(resolveCodeBackupS3Uri("s3://shared-backups"), "s3://shared-backups/home-learning/code");
assert.throws(() => resolveCodeBackupS3Uri("https://example.com/bucket"), /BACKUP_S3_URI/);

process.env.HOME_LEARNING_BACKUP_S3_URI = "s3://shared-backups/custom/prefix/";
assert.equal(resolveCodeBackupS3Uri("s3://ignored"), "s3://shared-backups/custom/prefix");
delete process.env.HOME_LEARNING_BACKUP_S3_URI;

const monthly = monthlyBackupNames("2026-08-31T13:00:00.000Z");
assert.equal(monthly.monthKey, "2026-08");
assert.equal(monthly.archive, "home-learning-code-monthly-2026-08.tar.gz");

const rebuilt = snapshotFromPayload(JSON.parse(JSON.stringify(snapshot)));
assert.equal(rebuilt.manifest.sha256, snapshot.manifest.sha256);

delete process.env.BACKUP_S3_URI;
const skipped = tryUploadCodeBackupSnapshot(snapshot);
assert.equal(skipped.uploaded, false);
assert.equal(skipped.reason, "BACKUP_S3_URI not configured");

rmSync(sandbox, { recursive: true, force: true });
console.log("Code backup helpers look good.");
}

main().catch((error) => {
  rmSync(sandbox, { recursive: true, force: true });
  console.error(error);
  process.exit(1);
});
