-- Mohab & Hams wedding RSVPs
-- Run once in Supabase: SQL Editor → New query → paste → Run

create table if not exists public.rsvps (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  attending text not null,
  plus_one text,
  message text,
  page text
);

alter table public.rsvps enable row level security;

-- Guests can submit only; they cannot read other RSVPs
create policy "Allow anonymous RSVP inserts"
  on public.rsvps
  for insert
  to anon
  with check (true);
