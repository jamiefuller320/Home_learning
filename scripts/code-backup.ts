import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createCodeBackupSnapshot,
  listLocalCodeBackups,
  resolveCodeBackupS3Uri,
  restoreCodeBackupSnapshot,
  snapshotFromPayload,
  tryUploadCodeBackupSnapshot,
  tryUploadMonthlyCodeBackupPin,
  verifyCodeBackupSnapshot,
  type CodeBackupSnapshot,
  type S3UploadResult,
} from "../src/lib/code-backup";

function usage(): never {
  console.error(`Usage:
  npx tsx scripts/code-backup.ts snapshot [--json]
  npx tsx scripts/code-backup.ts verify <archive.tar.gz>
  npx tsx scripts/code-backup.ts list
  npx tsx scripts/code-backup.ts restore <archive.tar.gz> [--dest <dir>] [--dry-run]
  npx tsx scripts/code-backup.ts deliver --from-json <file> [--upload] [--upload-monthly] [--json]
`);
  process.exit(2);
}

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

function readOption(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}

async function snapshot(args: string[]): Promise<CodeBackupSnapshot> {
  const created = await createCodeBackupSnapshot({ repoRoot: process.cwd() });
  if (hasFlag(args, "--json")) {
    process.stdout.write(`${JSON.stringify(created, null, 2)}\n`);
  } else {
    console.log(
      `Wrote ${created.manifest.archive_name} (${created.manifest.bytes.toLocaleString()} bytes, ${created.manifest.file_count} files, ${created.manifest.commit.slice(0, 7)})`,
    );
  }
  return created;
}

async function deliver(args: string[]): Promise<void> {
  const fromJson = readOption(args, "--from-json");
  if (!fromJson) usage();
  const payload = JSON.parse(readFileSync(resolve(fromJson), "utf8")) as CodeBackupSnapshot;
  const created = snapshotFromPayload(payload);
  const result: CodeBackupSnapshot & {
    upload?: S3UploadResult;
    upload_monthly?: S3UploadResult;
    destination?: string;
  } = { ...created };

  if (process.env.BACKUP_S3_URI) {
    result.destination = resolveCodeBackupS3Uri(process.env.BACKUP_S3_URI);
  }

  if (hasFlag(args, "--upload")) {
    result.upload = tryUploadCodeBackupSnapshot(created);
  }
  if (hasFlag(args, "--upload-monthly")) {
    result.upload_monthly = tryUploadMonthlyCodeBackupPin(created);
  }

  writeFileSync(resolve(fromJson), `${JSON.stringify(result, null, 2)}\n`, "utf8");
  if (hasFlag(args, "--json")) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }
  if (result.upload?.uploaded) {
    console.log(`S3 upload ok: ${result.upload.archive_dest}`);
  } else if (result.upload) {
    console.log(`S3 upload skipped/failed: ${result.upload.reason || result.upload.error}`);
  }
  if (result.upload_monthly?.uploaded) {
    console.log(`S3 monthly pin ok: ${result.upload_monthly.archive_dest}`);
  } else if (result.upload_monthly) {
    console.log(
      `S3 monthly pin skipped/failed: ${result.upload_monthly.reason || result.upload_monthly.error}`,
    );
  }
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);
  if (!command) usage();

  if (command === "snapshot") {
    await snapshot(args);
    return;
  }

  if (command === "verify") {
    const archive = args[0];
    if (!archive) usage();
    const result = await verifyCodeBackupSnapshot(archive);
    if (hasFlag(args, "--json")) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      console.log(result.ok ? `Checksum ok: ${result.manifest.archive_name}` : "Checksum mismatch");
    }
    if (!result.ok) process.exit(1);
    return;
  }

  if (command === "list") {
    const rows = listLocalCodeBackups(resolve(process.cwd(), "output/backups"));
    if (hasFlag(args, "--json")) {
      process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
      return;
    }
    if (rows.length === 0) {
      console.log("No local code backups in output/backups");
      return;
    }
    for (const row of rows) {
      console.log(
        `${row.created_at}  ${row.file_count} files  ${row.bytes.toLocaleString()} bytes  ${row.commit.slice(0, 7)}  ${row.archive_exists ? "ok" : "missing archive"}`,
      );
    }
    return;
  }

  if (command === "restore") {
    const archive = args[0];
    if (!archive) usage();
    const dest = readOption(args, "--dest") ?? "output/restore";
    const result = restoreCodeBackupSnapshot({
      archivePath: archive,
      destDir: dest,
      dryRun: hasFlag(args, "--dry-run"),
    });
    if (hasFlag(args, "--json")) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }
    console.log(
      `${result.dry_run ? "Would restore" : "Restored"} ${result.members.length} paths into ${result.dest}`,
    );
    return;
  }

  if (command === "deliver") {
    await deliver(args);
    return;
  }

  usage();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
