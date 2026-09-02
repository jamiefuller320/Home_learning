# GitHub Actions secret hygiene

This repo is **public**. Any `workflow_run` job runs in the base-repo context and
receives the default `GITHUB_TOKEN` (and repository secrets when configured). Treat
PR head branch names and fork commits as **untrusted input**.

## High-risk patterns (blocked)

| Pattern | Risk | Mitigation in this repo |
|---------|------|-------------------------|
| `workflow_run` after PR CI, then `${{ github.event.workflow_run.head_branch }}` inside `run:` | Shell injection → token / secret theft | Pass via `env:` + strict regex; never `${{ }}` into the script body |
| `workflow_run` without a same-repo gate | Public **fork** PRs trigger privileged jobs | Require `head_repository.full_name == github.repository` |
| Logging full API keys | Key leak via Actions logs | Use length / status helpers only (`supabase-check.yml`) |
| `${{ github.event.inputs.* }}` inside `run:` | Shell injection via stolen dispatch PAT | Pass all inputs via `env:` + allowlists |
| `secrets.GITHUB_TOKEN` | Empty unless manually duplicated | Use `${{ github.token }}` or rely on auto-injected `GITHUB_TOKEN` |
| `SUPABASE_SERVICE_ROLE_KEY` in `pages.yml` build | Service role baked into static site | Only `NEXT_PUBLIC_*` anon keys in Pages build |
| `NEXT_PUBLIC_*` prefix on service_role keys | Client bundle exposure | Never prefix maintainer keys with `NEXT_PUBLIC_` |

## Which secrets workflows use

| Secret | Workflow | Notes |
|--------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `pages.yml`, `supabase-check.yml`, `language-notes-process.yml` | Public; baked into static export |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same | Public; RLS limits to insert-only on `language_notes` |
| `SUPABASE_SERVICE_ROLE_KEY` | `language-notes-process.yml` only | Never in Pages build; maintainer CLI / scheduled inbox routing |

Maintainer **service_role** for `/maintenance` is entered in the browser and stored in
**sessionStorage** only — not in GitHub secrets or the static bundle.

## Automated daily check

`gha-secret-hygiene.yml` runs:

1. **Daily** (~06:20 UTC via GitHub `schedule`, or manual `workflow_dispatch`)
2. **On PRs / pushes** that touch `.github/workflows/**` or the scanner itself
3. **Manual** `workflow_dispatch` with optional `force=true`

The daily job **skips** when no PRs were merged to `main` and no commits touched
`.github/workflows/` in the last **36 hours** (override with `force`). That keeps
noise low while still catching workflow changes introduced by merges.

Local / CI commands:

```bash
npm run gha-secret-hygiene
npm run gha-secret-hygiene -- schedule-gate --force
npx tsx scripts/test-gha-secret-hygiene.ts
```

## If Supabase keys may already be compromised

1. Rotate the **service_role** key in Supabase → Settings → API (this invalidates the old key).
2. Update GitHub Actions secret `SUPABASE_SERVICE_ROLE_KEY`.
3. Update any maintainer sessionStorage unlocks (sign out on `/maintenance` and re-enter).
4. Review recent Actions runs for unexpected workflow changes.
5. Prefer branch protection on `main` so a stolen Actions token cannot silently plant an exfiltrating workflow.

## Related

- [`supabase-check.yml`](../../.github/workflows/supabase-check.yml) — scheduled anon-key health check (no secret echo)
- [`supabase/language_notes.sql`](../../supabase/language_notes.sql) — RLS: anon insert-only
