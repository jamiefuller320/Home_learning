-- Pack publishing workflow — live state shared between maintainers and the public site.
-- Run in the Supabase SQL editor after language_notes.sql.
-- Safe to re-run; includes explicit service_role grants.
--
-- Public (anon): read lesson_publication view only — which lessons are live or suspended.
-- Maintainers (service_role / secret key): read/write full workflow state.
--
-- Note: do not put RLS policies on lesson_publication. Policies on views require
-- PG15+ view-RLS support and otherwise fail with 42809 ("is not a table").
-- Public read is GRANT SELECT on the view; the view owner reads pack_publish_state.

create table if not exists public.pack_publish_meta (
  id int primary key default 1 check (id = 1),
  active_candidate_id text,
  updated_at timestamptz not null default now()
);

insert into public.pack_publish_meta (id, active_candidate_id)
values (1, null)
on conflict (id) do nothing;

create table if not exists public.pack_publish_state (
  topic_id text primary key,
  updated_at timestamptz not null default now(),
  candidate_since timestamptz,
  pack_rechecked_at timestamptz,
  pack_recheck_note text,
  video_rechecked_at timestamptz,
  video_recheck_note text,
  lesson_approved_at timestamptz,
  lesson_approval_note text,
  script_generated_at timestamptz,
  script_hash_at_generation text,
  script_approved_at timestamptz,
  script_approval_note text,
  video_generated_at timestamptz,
  video_generated_hash text,
  video_approved_at timestamptz,
  video_approval_note text,
  final_checked_at timestamptz,
  final_check_note text,
  released_at timestamptz,
  release_note text,
  suspended_at timestamptz,
  suspend_note text,
  restored_at timestamptz
);

-- Replace whatever currently occupies the name with a plain view.
do $$
declare
  kind text;
begin
  select c.relkind::text into kind
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'lesson_publication';

  if kind is null then
    raise notice 'lesson_publication does not exist yet';
  elsif kind in ('r', 'p') then
    execute 'drop table public.lesson_publication cascade';
  elsif kind = 'v' then
    execute 'drop view public.lesson_publication cascade';
  elsif kind = 'm' then
    execute 'drop materialized view public.lesson_publication cascade';
  elsif kind = 'f' then
    execute 'drop foreign table public.lesson_publication cascade';
  else
    raise exception 'public.lesson_publication has unsupported relkind %', kind;
  end if;
end $$;

create view public.lesson_publication as
select
  topic_id,
  released_at,
  suspended_at,
  updated_at
from public.pack_publish_state;

alter table public.pack_publish_meta enable row level security;
alter table public.pack_publish_state enable row level security;

revoke all on table public.pack_publish_meta from anon, authenticated;
revoke all on table public.pack_publish_state from anon, authenticated;
revoke all on public.lesson_publication from anon, authenticated;

grant select, insert, update, delete on table public.pack_publish_meta to service_role;
grant select, insert, update, delete on table public.pack_publish_state to service_role;
grant select on public.lesson_publication to anon;
grant select on public.lesson_publication to service_role;
