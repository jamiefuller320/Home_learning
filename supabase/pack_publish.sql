-- Pack publishing workflow — live state shared between maintainers and the public site.
-- Run in the Supabase SQL editor after language_notes.sql.
--
-- Public (anon): read lesson_publication table only — which lessons are live or suspended.
-- Maintainers (service_role): read/write full workflow state on pack_publish_state.

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

-- Public read model (table, not view — Supabase RLS requires a real table).
create table if not exists public.lesson_publication (
  topic_id text primary key references public.pack_publish_state (topic_id) on delete cascade,
  released_at timestamptz,
  suspended_at timestamptz,
  updated_at timestamptz not null default now()
);

create or replace function public.sync_lesson_publication()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.lesson_publication (topic_id, released_at, suspended_at, updated_at)
  values (new.topic_id, new.released_at, new.suspended_at, new.updated_at)
  on conflict (topic_id) do update
  set
    released_at = excluded.released_at,
    suspended_at = excluded.suspended_at,
    updated_at = excluded.updated_at;
  return new;
end;
$$;

drop trigger if exists sync_lesson_publication on public.pack_publish_state;
create trigger sync_lesson_publication
after insert or update on public.pack_publish_state
for each row
execute function public.sync_lesson_publication();

-- Back-fill if pack_publish_state already has rows.
insert into public.lesson_publication (topic_id, released_at, suspended_at, updated_at)
select topic_id, released_at, suspended_at, updated_at
from public.pack_publish_state
on conflict (topic_id) do update
set
  released_at = excluded.released_at,
  suspended_at = excluded.suspended_at,
  updated_at = excluded.updated_at;

alter table public.pack_publish_meta enable row level security;
alter table public.pack_publish_state enable row level security;
alter table public.lesson_publication enable row level security;

revoke all on table public.pack_publish_meta from anon, authenticated;
revoke all on table public.pack_publish_state from anon, authenticated;
revoke all on table public.lesson_publication from anon, authenticated;

grant select on table public.lesson_publication to anon;

drop policy if exists public_read_lesson_publication on public.lesson_publication;
create policy public_read_lesson_publication
  on public.lesson_publication
  for select
  to anon
  using (true);
