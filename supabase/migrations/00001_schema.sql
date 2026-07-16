-- ============================================================
-- Gestio CRM   Full Database Schema
-- Run this in your Supabase SQL Editor or via `supabase migration up`
-- ============================================================

-- 0. Extensions
create extension if not exists "pgcrypto";

-- 1. Profiles (extends auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "Admin can read own profile" on public.profiles;
create policy "Admin can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Admin can update own profile" on public.profiles;
create policy "Admin can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Clients (familles)
create table if not exists public.clients (
  id            uuid primary key default gen_random_uuid(),
  parent_name   text not null,
  child_name    text not null,
  child_age     text not null default '',
  email         text not null default '',
  email2        text not null default '',
  phone         text not null default '',
  phone2        text not null default '',
  cin           text not null default '',
  father_name   text not null default '',
  mother_name   text not null default '',
  dob           text not null default '',
  level         text not null default '',
  crm_stage     text not null default 'nouveau' check (crm_stage in ('nouveau','converti')),
  payment_status text not null default 'impaye' check (payment_status in ('impaye','paye')),
  monthly_fee   numeric not null default 0,
  debt          numeric not null default 0,
  overdue       boolean not null default false,
  payment_day   int not null default 1,
  notes         text not null default '',
  whatsapp_optin boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.clients enable row level security;

drop policy if exists "Admin can read clients" on public.clients;
create policy "Admin can read clients"
  on public.clients for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can insert clients" on public.clients;
create policy "Admin can insert clients"
  on public.clients for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin can update clients" on public.clients;
create policy "Admin can update clients"
  on public.clients for update
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can delete clients" on public.clients;
create policy "Admin can delete clients"
  on public.clients for delete
  using (auth.role() = 'authenticated');

create index if not exists idx_clients_search on public.clients using gin(
  to_tsvector('french', coalesce(parent_name,'') || ' ' || coalesce(child_name,'') || ' ' || coalesce(email,'') || ' ' || coalesce(phone,''))
);
create index if not exists idx_clients_crm_stage on public.clients(crm_stage);
create index if not exists idx_clients_payment_status on public.clients(payment_status);

-- 3. Payments (paiements)
create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients(id) on delete cascade,
  amount        numeric not null check (amount >= 0),
  date          date not null default current_date,
  mode          text not null default 'especes' check (mode in ('especes','virement','carte','cheque')),
  period        text not null default '',
  receipt       text not null default '',
  invoice_sent  boolean not null default false,
  notes         text not null default '',
  created_at    timestamptz not null default now()
);
alter table public.payments enable row level security;

drop policy if exists "Admin can read payments" on public.payments;
create policy "Admin can read payments"
  on public.payments for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can insert payments" on public.payments;
create policy "Admin can insert payments"
  on public.payments for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin can update payments" on public.payments;
create policy "Admin can update payments"
  on public.payments for update
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can delete payments" on public.payments;
create policy "Admin can delete payments"
  on public.payments for delete
  using (auth.role() = 'authenticated');

create index if not exists idx_payments_client on public.payments(client_id);
create index if not exists idx_payments_date on public.payments(date);

-- 4. Appointments (rendez-vous)
create table if not exists public.appointments (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null default '',
  phone         text not null default '',
  subject       text not null default '',
  type          text not null default 'contact' check (type in ('contact','rdv')),
  status        text not null default 'nouveau' check (status in ('nouveau','contacte','converti')),
  age           text not null default '',
  message       text not null default '',
  date_table    text not null default '',
  date_detail   text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.appointments enable row level security;

drop policy if exists "Admin can read appointments" on public.appointments;
create policy "Admin can read appointments"
  on public.appointments for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can insert appointments" on public.appointments;
create policy "Admin can insert appointments"
  on public.appointments for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin can update appointments" on public.appointments;
create policy "Admin can update appointments"
  on public.appointments for update
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can delete appointments" on public.appointments;
create policy "Admin can delete appointments"
  on public.appointments for delete
  using (auth.role() = 'authenticated');

create index if not exists idx_appointments_status on public.appointments(status);

-- 5. Employees (affiches)
create table if not exists public.employees (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  position        text not null default '',
  department      text not null default '',
  email           text not null default '',
  personal_email  text not null default '',
  phone           text not null default '',
  phone2          text not null default '',
  cin             text not null default '',
  birth_date      text not null default '',
  hire_date       text not null default '',
  address         text not null default '',
  contract_type   text not null default '',
  status          text not null default 'actif' check (status in ('actif','inactif')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table public.employees enable row level security;

drop policy if exists "Admin can read employees" on public.employees;
create policy "Admin can read employees"
  on public.employees for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can insert employees" on public.employees;
create policy "Admin can insert employees"
  on public.employees for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin can update employees" on public.employees;
create policy "Admin can update employees"
  on public.employees for update
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can delete employees" on public.employees;
create policy "Admin can delete employees"
  on public.employees for delete
  using (auth.role() = 'authenticated');

create index if not exists idx_employees_search on public.employees using gin(
  to_tsvector('french', coalesce(full_name,'') || ' ' || coalesce(position,'') || ' ' || coalesce(department,''))
);

-- 6. Planifications (calendar events)
create table if not exists public.planifications (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  time        time not null,
  title       text not null,
  detail      text not null default '',
  tone        text not null default 'zinc' check (tone in ('violet','emerald','amber','zinc')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.planifications enable row level security;

drop policy if exists "Admin can read planifications" on public.planifications;
create policy "Admin can read planifications"
  on public.planifications for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can insert planifications" on public.planifications;
create policy "Admin can insert planifications"
  on public.planifications for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin can update planifications" on public.planifications;
create policy "Admin can update planifications"
  on public.planifications for update
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can delete planifications" on public.planifications;
create policy "Admin can delete planifications"
  on public.planifications for delete
  using (auth.role() = 'authenticated');

create index if not exists idx_planifications_date on public.planifications(date);

-- 7. WhatsApp Messages Log
create table if not exists public.whatsapp_messages (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid references public.clients(id) on delete set null,
  phone         text not null,
  direction     text not null check (direction in ('sent','received')),
  content       text not null,
  status        text not null default 'pending' check (status in ('pending','sent','delivered','read','failed')),
  wa_message_id text not null default '',
  broadcast_id  uuid default null,
  created_at    timestamptz not null default now()
);
alter table public.whatsapp_messages enable row level security;

drop policy if exists "Admin can read whatsapp messages" on public.whatsapp_messages;
create policy "Admin can read whatsapp messages"
  on public.whatsapp_messages for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can insert whatsapp messages" on public.whatsapp_messages;
create policy "Admin can insert whatsapp messages"
  on public.whatsapp_messages for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin can update whatsapp messages" on public.whatsapp_messages;
create policy "Admin can update whatsapp messages"
  on public.whatsapp_messages for update
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can delete whatsapp messages" on public.whatsapp_messages;
create policy "Admin can delete whatsapp messages"
  on public.whatsapp_messages for delete
  using (auth.role() = 'authenticated');

create index if not exists idx_wa_client on public.whatsapp_messages(client_id);
create index if not exists idx_wa_broadcast on public.whatsapp_messages(broadcast_id);
create index if not exists idx_wa_created on public.whatsapp_messages(created_at desc);

-- 8. Email Logs
create table if not exists public.email_logs (
  id          uuid primary key default gen_random_uuid(),
  recipient   text not null,
  subject     text not null,
  type        text not null default 'custom',
  status      text not null default 'sent' check (status in ('sent','failed')),
  error_msg   text not null default '',
  created_at  timestamptz not null default now()
);
alter table public.email_logs enable row level security;

drop policy if exists "Admin can read email logs" on public.email_logs;
create policy "Admin can read email logs"
  on public.email_logs for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can insert email logs" on public.email_logs;
create policy "Admin can insert email logs"
  on public.email_logs for insert
  with check (auth.role() = 'authenticated');

-- 9. Demo requests (existing table   kept for backward compat)
create table if not exists public.demo_requests (
  id              bigint generated by default as identity primary key,
  center          text not null,
  email           text not null,
  phone           text not null,
  preferred_date  date not null,
  message         text,
  created_at      timestamptz not null default now()
);
alter table public.demo_requests enable row level security;

drop policy if exists "Anyone can insert demo requests" on public.demo_requests;
create policy "Anyone can insert demo requests"
  on public.demo_requests for insert
  with check (true);

drop policy if exists "Admin can read demo requests" on public.demo_requests;
create policy "Admin can read demo requests"
  on public.demo_requests for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- Functions & Triggers
-- ============================================================

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  tbl text;
begin
  foreach tbl in array array['profiles','clients','employees','planifications','appointments']
  loop
    execute format('
      create or replace trigger set_updated_at_%I
        before update on public.%I
        for each row execute function public.set_updated_at()
    ', tbl, tbl);
  end loop;
end;
$$;

-- Auto-generate receipt number
create or replace function public.generate_receipt()
returns trigger as $$
begin
  new.receipt = 'EDU-' || to_char(new.date, 'YYYYMMDD') || '-' || lpad(nextval('public.receipt_seq')::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create sequence if not exists public.receipt_seq start 1;

create or replace trigger set_receipt_on_insert
  before insert on public.payments
  for each row
  when (new.receipt is null or new.receipt = '')
  execute function public.generate_receipt();

-- Recalculate client debt (monthly_fee sum minus payments sum)
create or replace function public.recalc_client_debt(p_client_id uuid)
returns void as $$
declare
  v_monthly numeric;
  v_paid numeric;
begin
  select coalesce(monthly_fee, 0) into v_monthly
  from public.clients where id = p_client_id;

  select coalesce(sum(amount), 0) into v_paid
  from public.payments where client_id = p_client_id;

  update public.clients
  set debt = greatest(0, v_monthly - v_paid),
      payment_status = case when v_paid >= v_monthly then 'paye' else 'impaye' end,
      overdue = case when v_paid < v_monthly and v_monthly > 0 then true else false end
  where id = p_client_id;
end;
$$ language plpgsql security definer;

-- 10. Levels
create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  monthly_fee numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.levels enable row level security;

drop policy if exists "Authenticated users can manage levels" on public.levels;
create policy "Authenticated users can manage levels"
  on public.levels for all
  using (auth.role() = 'authenticated');

-- 11. Settings
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;

drop policy if exists "Authenticated users can manage settings" on public.settings;
create policy "Authenticated users can manage settings"
  on public.settings for all
  using (auth.role() = 'authenticated');

-- Default settings
insert into public.settings (key, value) values
  ('transportation', '{"enabled": false, "price": 0, "currency": "MAD"}'),
  ('sibling_discount', '{"enabled": false, "type": "percentage", "value": 10, "max_kids": 99}'),
  ('payment_due', '{"day": 5, "grace_days": 5}')
on conflict (key) do nothing;