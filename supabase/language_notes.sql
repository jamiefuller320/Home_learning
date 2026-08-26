-- Home Learning language notes. Testers insert anonymously; only the
-- service_role (dashboard / maintainer script) can read or update.

create table if not exists public.language_notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  topic_id text not null,
  topic_title text not null,
  section text not null,
  unclear text not null,
  clearer text not null default '',
  page_path text not null,
  status text not null default 'open'
);

alter table public.language_notes enable row level security;

drop policy if exists testers_can_insert on public.language_notes;
create policy testers_can_insert
  on public.language_notes
  for insert
  to anon
  with check (true);
