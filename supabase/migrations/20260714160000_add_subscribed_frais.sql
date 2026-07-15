-- Add per-client subscribed fees (frais) column
alter table public.clients
  add column if not exists subscribed_frais jsonb not null default '[]';
