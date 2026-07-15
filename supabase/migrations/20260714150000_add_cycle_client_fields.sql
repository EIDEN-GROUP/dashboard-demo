-- Add cycle/category to levels
alter table public.levels
  add column if not exists cycle text not null default '';

-- Add fields to clients for the extended wizard
alter table public.clients
  add column if not exists cin_mother        text not null default '',
  add column if not exists profession_father text not null default '',
  add column if not exists profession_mother text not null default '',
  add column if not exists address          text not null default '',
  add column if not exists child_names      jsonb not null default '[]';
