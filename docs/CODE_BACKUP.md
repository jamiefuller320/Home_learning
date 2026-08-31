# Weekly AWS code backup

Sunday snapshot of every git-tracked file, stored off-repo on the same S3
bucket the value_investor project already uses.

GitHub remains the primary copy. This protects against a repo-wide incident
and gives a dated tarball you can restore without cloning.

## What is backed up

All files `git ls-files` knows about at `HEAD` on `main`: source, content,
docs, workflows, and tracked parent-video assets. `node_modules`, `.next`,
and other gitignored paths are not included.

## Schedule

| Trigger | When |
|---|---|
| GitHub Actions | Sunday **13:00 UTC** (`0 13 * * 0`) |
| Manual | Actions → **Weekly code backup** → Run workflow |

Same-day skip: a second successful run the same UTC day exits unless `force=true`.

## Secrets

Copy these four repository secrets from **value_investor** onto this repo
(Settings → Secrets and variables → Actions). Same names, same values.

| Secret | Role |
|---|---|
| `AWS_ACCESS_KEY_ID` | Existing S3 user |
| `AWS_SECRET_ACCESS_KEY` | Existing S3 user |
| `AWS_DEFAULT_REGION` | Usually `eu-west-2` |
| `BACKUP_S3_URI` | `s3://<same-bucket>/…` — only the bucket name is used |

Objects land under `s3://<bucket>/home-learning/code/`, not under the FTSE
data prefix. Override the whole destination with `HOME_LEARNING_BACKUP_S3_URI`
if you ever need a different path.

| Prefix | Retention (suggested) |
|---|---|
| `home-learning/code/` | 90 days — timestamped weekly archives + `latest.tar.gz` |
| `home-learning/code/monthly/` | 365 days — one pin per calendar month |

## Commands

```bash
npm run backup:code                 # tarball + manifest in output/backups/
npx tsx scripts/code-backup.ts verify output/backups/home-learning-code-*.tar.gz
npx tsx scripts/code-backup.ts list
npx tsx scripts/code-backup.ts restore output/backups/home-learning-code-….tar.gz --dest /tmp/home-learning-restore
```

CI also keeps a 90-day GitHub Actions artifact named `home-learning-code-backup`.

## Restore

```bash
aws s3 cp s3://<bucket>/home-learning/code/latest.tar.gz restored.tar.gz
aws s3 cp s3://<bucket>/home-learning/code/latest.manifest.json restored.manifest.json
npx tsx scripts/code-backup.ts verify restored.tar.gz
npx tsx scripts/code-backup.ts restore restored.tar.gz --dest /tmp/home-learning-restore
```
