create table if not exists public.calendar_exceptions (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  label       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.calendar_exceptions enable row level security;

drop policy if exists "Admin can read calendar_exceptions" on public.calendar_exceptions;
create policy "Admin can read calendar_exceptions"
  on public.calendar_exceptions for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can insert calendar_exceptions" on public.calendar_exceptions;
create policy "Admin can insert calendar_exceptions"
  on public.calendar_exceptions for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin can update calendar_exceptions" on public.calendar_exceptions;
create policy "Admin can update calendar_exceptions"
  on public.calendar_exceptions for update
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can delete calendar_exceptions" on public.calendar_exceptions;
create policy "Admin can delete calendar_exceptions"
  on public.calendar_exceptions for delete
  using (auth.role() = 'authenticated');

create index if not exists idx_calendar_exceptions_date on public.calendar_exceptions(date);
