-- ============================================================
-- Superadmin layer   roles, centers registry, center admins
-- Run in the Supabase SQL Editor or via `supabase migration up`
-- ============================================================

-- 1. Role + email on profiles
alter table public.profiles
  add column if not exists role text not null default 'admin'
    check (role in ('admin', 'superadmin'));

alter table public.profiles
  add column if not exists email text not null default '';

-- Backfill email from auth.users
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email = '';

-- Keep the signup trigger in sync (role can be seeded via user_metadata)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    case when new.raw_user_meta_data ->> 'role' = 'superadmin'
         then 'superadmin' else 'admin' end
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Centers registry (platform-level metadata; no multi-tenant refactor  
--    the live EIDEN data stays single-center, flagged via is_primary)
create table if not exists public.centers (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  city           text not null default '',
  contact_email  text not null default '',
  contact_phone  text not null default '',
  plan           text not null default 'essai' check (plan in ('essai', 'standard', 'premium')),
  status         text not null default 'actif' check (status in ('actif', 'suspendu', 'essai')),
  monthly_price  numeric not null default 0,
  students_count int not null default 0,
  is_primary     boolean not null default false,
  notes          text not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
alter table public.centers enable row level security;

drop policy if exists "Authenticated can manage centers" on public.centers;
create policy "Authenticated can manage centers"
  on public.centers for all
  using (auth.role() = 'authenticated');

drop trigger if exists set_updated_at_centers on public.centers;
create trigger set_updated_at_centers
  before update on public.centers
  for each row execute function public.set_updated_at();

-- 3. Center <-> admin linkage
create table if not exists public.center_admins (
  center_id   uuid not null references public.centers(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (center_id, profile_id)
);
alter table public.center_admins enable row level security;

drop policy if exists "Authenticated can manage center_admins" on public.center_admins;
create policy "Authenticated can manage center_admins"
  on public.center_admins for all
  using (auth.role() = 'authenticated');

-- 4. Seed: the existing single-center data becomes the primary center
insert into public.centers (name, city, plan, status, monthly_price, is_primary)
select 'EIDEN   Centre principal', 'Casablanca', 'premium', 'actif', 0, true
where not exists (select 1 from public.centers where is_primary);

-- 5. Bootstrap the first superadmin
update public.profiles
set role = 'superadmin'
where id in (select id from auth.users where email = 'basmaess11@gmail.com');
