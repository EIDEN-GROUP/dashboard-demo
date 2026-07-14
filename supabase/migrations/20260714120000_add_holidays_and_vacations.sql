-- Holidays (single-day named dates)
create table if not exists public.holidays (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  label       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.holidays enable row level security;

drop policy if exists "Admin can read holidays" on public.holidays;
create policy "Admin can read holidays"
  on public.holidays for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can insert holidays" on public.holidays;
create policy "Admin can insert holidays"
  on public.holidays for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin can update holidays" on public.holidays;
create policy "Admin can update holidays"
  on public.holidays for update
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can delete holidays" on public.holidays;
create policy "Admin can delete holidays"
  on public.holidays for delete
  using (auth.role() = 'authenticated');

create index if not exists idx_holidays_date on public.holidays(date);

-- School vacations (multi-day ranges)
create table if not exists public.school_vacations (
  id          uuid primary key default gen_random_uuid(),
  start_date  date not null,
  end_date    date not null,
  label       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.school_vacations enable row level security;

drop policy if exists "Admin can read school_vacations" on public.school_vacations;
create policy "Admin can read school_vacations"
  on public.school_vacations for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can insert school_vacations" on public.school_vacations;
create policy "Admin can insert school_vacations"
  on public.school_vacations for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin can update school_vacations" on public.school_vacations;
create policy "Admin can update school_vacations"
  on public.school_vacations for update
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can delete school_vacations" on public.school_vacations;
create policy "Admin can delete school_vacations"
  on public.school_vacations for delete
  using (auth.role() = 'authenticated');

create index if not exists idx_school_vacations_dates on public.school_vacations(start_date, end_date);
