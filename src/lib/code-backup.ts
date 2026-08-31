import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { pipeline } from "node:stream/promises";

export const DEFAULT_BACKUP_DIR = "output/backups";
export const CODE_BACKUP_PREFIX = "home-learning/code";
export const ARCHIVE_PREFIX = "home-learning-code";

export type CodeBackupManifest = {
  created_at: string;
  kind: "code";
  repo: string;
  ref: string;
  commit: string;
  archive_name: string;
  file_count: number;
  bytes: number;
  sha256: string;
  paths_sample: string[];
};

export type CodeBackupSnapshot = {
  archive_path: string;
  manifest_path: string;
  manifest: CodeBackupManifest;
};

export type S3UploadResult = {
  uploaded: boolean;
  archive_dest?: string;
  manifest_dest?: string;
  month_key?: string;
  reason?: string;
  error?: string;
};

function utcNow(now?: Date): Date {
  return now ?? new Date();
}

function archiveStamp(now?: Date): string {
  return utcNow(now).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function runGit(repoRoot: string, args: string[], optional = false): string {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    if (optional) return "";
    throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
  }
  return (result.stdout || "").trim();
}

export function listTrackedFiles(repoRoot: string): string[] {
  const output = runGit(repoRoot, ["ls-files", "-z"]);
  return output.split("\0").filter(Boolean);
}

function sha256File(path: string): Promise<string> {
  const hash = createHash("sha256");
  return pipeline(createReadStream(path), hash).then(() => hash.digest("hex"));
}

export function resolveCodeBackupS3Uri(backupS3Uri: string): string {
  const override = (process.env.HOME_LEARNING_BACKUP_S3_URI || "").trim();
  if (override) {
    return override.replace(/\/+$/, "");
  }
  const trimmed = backupS3Uri.trim();
  const match = trimmed.match(/^s3:\/\/([^/]+)(?:\/.*)?$/);
  if (!match) {
    throw new Error(
      "BACKUP_S3_URI must look like s3://bucket or s3://bucket/optional/prefix",
    );
  }
  return `s3://${match[1]}/${CODE_BACKUP_PREFIX}`;
}

export function monthlyBackupNames(createdAt: string): {
  monthKey: string;
  archive: string;
  manifest: string;
} {
  const raw = createdAt.endsWith("Z") ? `${createdAt.slice(0, -1)}+00:00` : createdAt;
  const created = new Date(raw);
  if (Number.isNaN(created.getTime())) {
    throw new Error(`Invalid manifest created_at: ${createdAt}`);
  }
  const monthKey = created.toISOString().slice(0, 7);
  return {
    monthKey,
    archive: `${ARCHIVE_PREFIX}-monthly-${monthKey}.tar.gz`,
    manifest: `${ARCHIVE_PREFIX}-monthly-${monthKey}.manifest.json`,
  };
}

export async function createCodeBackupSnapshot(options: {
  repoRoot: string;
  backupDir?: string;
  now?: Date;
}): Promise<CodeBackupSnapshot> {
  const repoRoot = resolve(options.repoRoot);
  const files = listTrackedFiles(repoRoot);
  if (files.length === 0) {
    throw new Error("No git-tracked files to back up");
  }

  const missing = files.filter((rel) => !existsSync(join(repoRoot, rel)));
  if (missing.length > 0) {
    throw new Error(`Tracked files missing from working tree: ${missing.slice(0, 5).join(", ")}`);
  }

  const stamp = archiveStamp(options.now);
  const backupDir = resolve(repoRoot, options.backupDir ?? DEFAULT_BACKUP_DIR);
  mkdirSync(backupDir, { recursive: true });

  const archiveName = `${ARCHIVE_PREFIX}-${stamp}.tar.gz`;
  const archivePath = join(backupDir, archiveName);
  const manifestPath = join(backupDir, `${ARCHIVE_PREFIX}-${stamp}.manifest.json`);
  const listFile = join(tmpdir(), `${ARCHIVE_PREFIX}-${stamp}.files`);
  writeFileSync(listFile, `${files.join("\n")}\n`, "utf8");

  const tar = spawnSync("tar", ["-czf", archivePath, "-C", repoRoot, "--files-from", listFile], {
    encoding: "utf8",
  });
  if (tar.status !== 0) {
    throw new Error(tar.stderr.trim() || "tar failed while creating the code backup");
  }

  const digest = await sha256File(archivePath);
  const commit = runGit(repoRoot, ["rev-parse", "HEAD"]);
  const ref = runGit(repoRoot, ["rev-parse", "--abbrev-ref", "HEAD"]);
  const remote = runGit(repoRoot, ["config", "--get", "remote.origin.url"], true).replace(
    /x-access-token:[^@]+@/i,
    "",
  );
  const repo =
    remote.replace(/\.git$/, "").replace(/^git@github\.com:/, "https://github.com/") ||
    "Home_learning";

  const manifest: CodeBackupManifest = {
    created_at: utcNow(options.now).toISOString(),
    kind: "code",
    repo,
    ref,
    commit,
    archive_name: archiveName,
    file_count: files.length,
    bytes: statSync(archivePath).size,
    sha256: digest,
    paths_sample: files.slice(0, 20),
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  return {
    archive_path: archivePath,
    manifest_path: manifestPath,
    manifest,
  };
}

export async function verifyCodeBackupSnapshot(
  archivePath: string,
  manifestPath?: string,
): Promise<{
  ok: boolean;
  expected_sha256: string;
  actual_sha256: string;
  manifest: CodeBackupManifest;
}> {
  const resolvedArchive = resolve(archivePath);
  const resolvedManifest = resolve(
    manifestPath ?? resolvedArchive.replace(/\.tar\.gz$/, ".manifest.json"),
  );
  const manifest = JSON.parse(readFileSync(resolvedManifest, "utf8")) as CodeBackupManifest;
  const actual = await sha256File(resolvedArchive);
  return {
    ok: actual === manifest.sha256,
    expected_sha256: manifest.sha256,
    actual_sha256: actual,
    manifest,
  };
}

export function snapshotFromPayload(data: {
  archive_path?: string;
  manifest_path?: string;
  manifest?: CodeBackupManifest;
}): CodeBackupSnapshot {
  if (!data.archive_path || !data.manifest_path || !data.manifest) {
    throw new Error("payload missing archive_path, manifest_path, or manifest");
  }
  return {
    archive_path: data.archive_path,
    manifest_path: data.manifest_path,
    manifest: data.manifest,
  };
}

function awsAvailable(): boolean {
  return spawnSync("aws", ["--version"], { encoding: "utf8" }).status === 0;
}

function awsCopy(source: string, dest: string): void {
  const result = spawnSync("aws", ["s3", "cp", source, dest], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `aws s3 cp failed for ${dest}`);
  }
}

export function uploadCodeBackupSnapshot(
  snapshot: CodeBackupSnapshot,
  s3Uri?: string,
): S3UploadResult {
  const rawUri = (s3Uri ?? process.env.BACKUP_S3_URI ?? "").trim();
  if (!rawUri) {
    return { uploaded: false, reason: "BACKUP_S3_URI not configured" };
  }
  if (!awsAvailable()) {
    throw new Error("aws CLI not found — install AWS CLI or upload the artifact manually");
  }

  const base = resolveCodeBackupS3Uri(rawUri);
  const archiveDest = `${base}/${basename(snapshot.archive_path)}`;
  const manifestDest = `${base}/${basename(snapshot.manifest_path)}`;

  awsCopy(snapshot.archive_path, archiveDest);
  awsCopy(snapshot.manifest_path, manifestDest);
  awsCopy(snapshot.archive_path, `${base}/latest.tar.gz`);
  awsCopy(snapshot.manifest_path, `${base}/latest.manifest.json`);

  return {
    uploaded: true,
    archive_dest: archiveDest,
    manifest_dest: manifestDest,
  };
}

export function uploadMonthlyCodeBackupPin(
  snapshot: CodeBackupSnapshot,
  s3Uri?: string,
): S3UploadResult {
  const rawUri = (s3Uri ?? process.env.BACKUP_S3_URI ?? "").trim();
  if (!rawUri) {
    return { uploaded: false, reason: "BACKUP_S3_URI not configured" };
  }
  if (!awsAvailable()) {
    throw new Error("aws CLI not found — install AWS CLI or upload the artifact manually");
  }

  const names = monthlyBackupNames(snapshot.manifest.created_at);
  const base = `${resolveCodeBackupS3Uri(rawUri)}/monthly`;
  const archiveDest = `${base}/${names.archive}`;
  const manifestDest = `${base}/${names.manifest}`;
  awsCopy(snapshot.archive_path, archiveDest);
  awsCopy(snapshot.manifest_path, manifestDest);
  return {
    uploaded: true,
    month_key: names.monthKey,
    archive_dest: archiveDest,
    manifest_dest: manifestDest,
  };
}

export function tryUploadCodeBackupSnapshot(
  snapshot: CodeBackupSnapshot,
  s3Uri?: string,
): S3UploadResult {
  try {
    return uploadCodeBackupSnapshot(snapshot, s3Uri);
  } catch (error) {
    return {
      uploaded: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function tryUploadMonthlyCodeBackupPin(
  snapshot: CodeBackupSnapshot,
  s3Uri?: string,
): S3UploadResult {
  try {
    return uploadMonthlyCodeBackupPin(snapshot, s3Uri);
  } catch (error) {
    return {
      uploaded: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function restoreCodeBackupSnapshot(options: {
  archivePath: string;
  destDir: string;
  dryRun?: boolean;
}): { archive: string; dest: string; dry_run: boolean; member_count: number; members: string[] } {
  const archivePath = resolve(options.archivePath);
  const destDir = resolve(options.destDir);
  const listed = spawnSync("tar", ["-tzf", archivePath], { encoding: "utf8" });
  if (listed.status !== 0) {
    throw new Error(listed.stderr.trim() || "tar -tzf failed");
  }
  const members = listed.stdout.split("\n").filter(Boolean);
  if (!options.dryRun) {
    mkdirSync(destDir, { recursive: true });
    const extracted = spawnSync("tar", ["-xzf", archivePath, "-C", destDir], { encoding: "utf8" });
    if (extracted.status !== 0) {
      throw new Error(extracted.stderr.trim() || "tar extract failed");
    }
  }
  return {
    archive: archivePath,
    dest: destDir,
    dry_run: Boolean(options.dryRun),
    member_count: members.length,
    members: members.slice(0, 50),
  };
}

export function listLocalCodeBackups(backupDir: string): Array<{
  manifest_path: string;
  archive_path: string;
  archive_exists: boolean;
  created_at: string;
  bytes: number;
  file_count: number;
  commit: string;
}> {
  if (!existsSync(backupDir)) return [];
  const rows = [];
  for (const name of readdirSync(backupDir).sort().reverse()) {
    if (!name.startsWith(ARCHIVE_PREFIX) || !name.endsWith(".manifest.json")) continue;
    const manifestPath = join(backupDir, name);
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as CodeBackupManifest;
      const archivePath = join(backupDir, manifest.archive_name);
      rows.push({
        manifest_path: manifestPath,
        archive_path: archivePath,
        archive_exists: existsSync(archivePath),
        created_at: manifest.created_at,
        bytes: manifest.bytes,
        file_count: manifest.file_count,
        commit: manifest.commit,
      });
    } catch {
      continue;
    }
  }
  return rows;
}
