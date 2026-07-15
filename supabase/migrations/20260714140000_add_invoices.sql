-- ============================================================================
-- Invoices: the missing historical record.
--
-- Before this, "impayé" / "retard" existed only as a snapshot on `clients`
-- (payment_status / debt / overdue), recomputed from today's monthly_fee. There
-- was no record of what was OWED in a given month, so impayé/retard could not be
-- charted over time. One row per client per period fixes that: what was due, when
-- it was due, and how much actually came in.
-- ============================================================================

create table if not exists public.invoices (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  period      text not null,                    -- 'YYYY-MM'
  amount_due  numeric not null default 0 check (amount_due >= 0),
  amount_paid numeric not null default 0 check (amount_paid >= 0),
  due_date    date not null,
  status      text not null default 'impaye' check (status in ('paye', 'impaye', 'retard')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (client_id, period)
);

create index if not exists invoices_period_idx on public.invoices (period);
create index if not exists invoices_status_idx on public.invoices (status);
create index if not exists invoices_client_idx on public.invoices (client_id);

alter table public.invoices enable row level security;

drop policy if exists "Admin can read invoices" on public.invoices;
create policy "Admin can read invoices"
  on public.invoices for select using (auth.role() = 'authenticated');

drop policy if exists "Admin can insert invoices" on public.invoices;
create policy "Admin can insert invoices"
  on public.invoices for insert with check (auth.role() = 'authenticated');

drop policy if exists "Admin can update invoices" on public.invoices;
create policy "Admin can update invoices"
  on public.invoices for update using (auth.role() = 'authenticated');

drop policy if exists "Admin can delete invoices" on public.invoices;
create policy "Admin can delete invoices"
  on public.invoices for delete using (auth.role() = 'authenticated');

-- ── Grace period, read from the settings row the Paramètres page writes ───────
create or replace function public.invoice_grace_days()
returns int
language sql
stable
as $$
  select coalesce((value ->> 'grace_days')::int, 5)
  from public.settings
  where key = 'payment_due'
  limit 1;
$$;

create or replace function public.invoice_due_day()
returns int
language sql
stable
as $$
  select coalesce((value ->> 'day')::int, 5)
  from public.settings
  where key = 'payment_due'
  limit 1;
$$;

-- ── Status is derived, never hand-set ────────────────────────────────────────
create or replace function public.invoice_status(
  p_amount_due numeric,
  p_amount_paid numeric,
  p_due_date date
)
returns text
language sql
immutable
as $$
  select case
    when p_amount_paid >= p_amount_due then 'paye'
    when current_date > p_due_date + public.invoice_grace_days() then 'retard'
    else 'impaye'
  end;
$$;

-- ── Recompute one invoice from the payments in its period ────────────────────
create or replace function public.recompute_invoice(p_client_id uuid, p_period text)
returns void
language plpgsql
as $$
declare
  v_paid numeric;
begin
  select coalesce(sum(amount), 0) into v_paid
  from public.payments
  where client_id = p_client_id
    and to_char(date, 'YYYY-MM') = p_period;

  update public.invoices
  set amount_paid = v_paid,
      status = public.invoice_status(amount_due, v_paid, due_date),
      updated_at = now()
  where client_id = p_client_id and period = p_period;
end;
$$;

-- ── Keep invoices in step with payments ──────────────────────────────────────
create or replace function public.payments_sync_invoice()
returns trigger
language plpgsql
as $$
declare
  v_period text;
  v_client uuid;
  v_fee numeric;
  v_day int;
begin
  v_client := coalesce(new.client_id, old.client_id);
  v_period := to_char(coalesce(new.date, old.date), 'YYYY-MM');

  -- A payment can land on a period with no invoice yet (back-dated entry): create it.
  if not exists (select 1 from public.invoices where client_id = v_client and period = v_period) then
    select coalesce(monthly_fee, 0), coalesce(nullif(payment_day, 0), public.invoice_due_day())
      into v_fee, v_day
    from public.clients where id = v_client;

    insert into public.invoices (client_id, period, amount_due, due_date)
    values (
      v_client,
      v_period,
      coalesce(v_fee, 0),
      (to_date(v_period || '-01', 'YYYY-MM-DD') + (least(coalesce(v_day, 5), 28) - 1) * interval '1 day')::date
    )
    on conflict (client_id, period) do nothing;
  end if;

  perform public.recompute_invoice(v_client, v_period);

  -- An edited payment can move between periods: refresh the one it left, too.
  if tg_op = 'UPDATE' and to_char(old.date, 'YYYY-MM') <> v_period then
    perform public.recompute_invoice(old.client_id, to_char(old.date, 'YYYY-MM'));
  end if;

  return null;
end;
$$;

drop trigger if exists payments_sync_invoice_trg on public.payments;
create trigger payments_sync_invoice_trg
after insert or update or delete on public.payments
for each row execute function public.payments_sync_invoice();

-- ── Issue invoices for a period (idempotent) ─────────────────────────────────
create or replace function public.generate_invoices(p_period text)
returns int
language plpgsql
as $$
declare
  v_count int := 0;
  v_due_day int := public.invoice_due_day();
begin
  insert into public.invoices (client_id, period, amount_due, due_date)
  select
    c.id,
    p_period,
    coalesce(c.monthly_fee, 0),
    (to_date(p_period || '-01', 'YYYY-MM-DD')
      + (least(coalesce(nullif(c.payment_day, 0), v_due_day), 28) - 1) * interval '1 day')::date
  from public.clients c
  where c.created_at < (to_date(p_period || '-01', 'YYYY-MM-DD') + interval '1 month')
  on conflict (client_id, period) do nothing;

  get diagnostics v_count = row_count;

  -- Reconcile against payments already recorded for that period.
  perform public.recompute_invoice(c.id, p_period) from public.clients c;

  return v_count;
end;
$$;

-- ── Backfill: every month from each client's enrolment to today ──────────────
do $$
declare
  v_period text;
begin
  for v_period in
    select to_char(gs, 'YYYY-MM')
    from generate_series(
      coalesce((select date_trunc('month', min(created_at)) from public.clients), date_trunc('month', now())),
      date_trunc('month', now()),
      interval '1 month'
    ) as gs
  loop
    perform public.generate_invoices(v_period);
  end loop;

  -- Periods that only exist because a payment was back-dated before enrolment.
  for v_period in
    select distinct to_char(date, 'YYYY-MM') from public.payments
  loop
    perform public.generate_invoices(v_period);
  end loop;
end;
$$;
