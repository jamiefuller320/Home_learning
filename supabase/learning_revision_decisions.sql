-- Pack learning revision decisions — shared between maintainers.
-- Run in the Supabase SQL editor after pack_publish.sql.
--
-- Maintainers (service_role): read/write decisions and accepted revision snapshots.

create table if not exists public.learning_revision_decisions (
  revision_id text primary key,
  topic_id text not null,
  learning_id text not null,
  decision text not null check (decision in ('accepted', 'declined')),
  decided_at timestamptz not null default now(),
  note text,
  revision_snapshot jsonb
);

create index if not exists learning_revision_decisions_topic_id_idx
  on public.learning_revision_decisions (topic_id);

alter table public.learning_revision_decisions enable row level security;

revoke all on table public.learning_revision_decisions from anon, authenticated;
