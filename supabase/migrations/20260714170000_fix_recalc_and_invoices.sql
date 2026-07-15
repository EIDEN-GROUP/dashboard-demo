-- ============================================================================
-- Fix recalc_client_debt and generate_invoices to:
--   1. Read per‑child services & frais from child_names (not legacy subscribed_services)
--   2. Apply per‑client remise (not old sibling_discount setting)
--   3. Never overwrite monthly_fee (let the wizard keep the full contractual fee)
--   4. Invoices apply remise when computing amount_due
-- ============================================================================

drop function if exists public.recalc_client_debt(uuid);

create or replace function public.recalc_client_debt(p_client_id uuid)
returns void as $$
declare
  v_child_names  jsonb;
  v_level        text;
  v_subs         jsonb;
  v_remise       numeric;
  v_level_fee    numeric := 0;
  v_service_sum  numeric := 0;
  v_frais_sum    numeric := 0;
  v_expected     numeric;
  v_paid         numeric;
  v_payment_day  int;
  v_grace_days   int;
  v_due_date     date;
  v_today        date := current_date;
  v_services     jsonb;
  v_frais        jsonb;
  v_idx          int;
  v_child        jsonb;
  v_svc          jsonb;
  v_f            jsonb;
  v_lv_fee       numeric;
begin
  -- Read client data
  select child_names, level, subscribed_services, coalesce(remise, 0)
  into v_child_names, v_level, v_subs, v_remise
  from public.clients
  where id = p_client_id;

  -- Read service & frais prices from settings
  select value into v_services from public.settings where key = 'services';
  select value into v_frais   from public.settings where key = 'frais';

  v_level_fee := 0;
  v_service_sum := 0;
  v_frais_sum := 0;

  if v_child_names is not null and jsonb_typeof(v_child_names) = 'array'
     and jsonb_array_length(v_child_names) > 0 then
    -- New‑style per‑child data
    for v_idx in 0 .. jsonb_array_length(v_child_names) - 1 loop
      v_child := v_child_names -> v_idx;

      -- Level fee for this child
      if v_child ? 'level' then
        select coalesce(monthly_fee, 0) into v_lv_fee
        from public.levels where name = v_child->>'level';
        v_level_fee := v_level_fee + coalesce(v_lv_fee, 0);
      end if;

      -- Services for this child
      if v_services is not null and jsonb_typeof(v_services) = 'array' then
        for v_svc in select * from jsonb_array_elements(v_services) loop
          if (v_svc->>'enabled')::boolean
             and exists (
               select 1 from jsonb_array_elements_text(coalesce(v_child->'services', '[]'::jsonb)) s
               where s.value = v_svc->>'name'
             )
          then
            v_service_sum := v_service_sum + coalesce((v_svc->>'price')::numeric, 0);
          end if;
        end loop;
      end if;

      -- Frais for this child
      if v_frais is not null and jsonb_typeof(v_frais) = 'array' then
        for v_f in select * from jsonb_array_elements(v_frais) loop
          if (v_f->>'enabled')::boolean
             and exists (
               select 1 from jsonb_array_elements_text(coalesce(v_child->'frais', '[]'::jsonb)) f
               where f.value = v_f->>'name'
             )
          then
            v_frais_sum := v_frais_sum + coalesce((v_f->>'price')::numeric, 0);
          end if;
        end loop;
      end if;
    end loop;
  else
    -- Legacy fallback: single level + subscribed_services
    select coalesce(monthly_fee, 0) into v_level_fee
    from public.levels where name = v_level;

    if v_services is not null and jsonb_typeof(v_services) = 'array'
       and v_subs is not null and jsonb_typeof(v_subs) = 'array' then
      for v_svc in select * from jsonb_array_elements(v_services) loop
        if (v_svc->>'enabled')::boolean
           and exists (
             select 1 from jsonb_array_elements_text(v_subs) s
             where s.value = v_svc->>'name'
           )
        then
          v_service_sum := v_service_sum + coalesce((v_svc->>'price')::numeric, 0);
        end if;
      end loop;
    end if;
  end if;

  -- Apply per‑client family discount
  v_expected := round((v_level_fee + v_service_sum + v_frais_sum) * (1 - v_remise / 100), 2);

  -- Total payments received
  select coalesce(sum(amount), 0) into v_paid
  from public.payments where client_id = p_client_id;

  -- Payment due date from settings (grace days included)
  select coalesce((value->>'day')::int, 5), coalesce((value->>'grace_days')::int, 5)
  into v_payment_day, v_grace_days
  from public.settings where key = 'payment_due';

  v_due_date := make_date(
    extract(year from v_today)::int,
    extract(month from v_today)::int,
    least(v_payment_day, 28)
  ) + v_grace_days;

  -- Update debt / status — do NOT touch monthly_fee
  update public.clients
  set
    debt = greatest(0, v_expected - v_paid),
    payment_status = case
      when v_paid >= v_expected then 'paye'
      when v_today > v_due_date and v_paid < v_expected then 'retard'
      else 'impaye'
    end,
    overdue = case when v_paid < v_expected and v_today > v_due_date then true else false end
  where id = p_client_id;
end;
$$ language plpgsql security definer;

-- ── Fix generate_invoices to apply remise ────────────────────────────────────

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
    round(coalesce(c.monthly_fee, 0) * (1 - coalesce(c.remise, 0) / 100), 2),
    (to_date(p_period || '-01', 'YYYY-MM-DD')
      + (least(coalesce(nullif(c.payment_day, 0), v_due_day), 28) - 1) * interval '1 day')::date
  from public.clients c
  where c.created_at < (to_date(p_period || '-01', 'YYYY-MM-DD') + interval '1 month')
  on conflict (client_id, period) do nothing;

  get diagnostics v_count = row_count;

  perform public.recompute_invoice(c.id, p_period) from public.clients c;

  return v_count;
end;
$$;

-- ── Fix the payment trigger to use the same remise‑aware amount ──────────────

create or replace function public.payments_sync_invoice()
returns trigger
language plpgsql
as $$
declare
  v_period text;
  v_client uuid;
  v_fee numeric;
  v_remise numeric;
  v_day int;
begin
  v_client := coalesce(new.client_id, old.client_id);
  v_period := to_char(coalesce(new.date, old.date), 'YYYY-MM');

  if not exists (select 1 from public.invoices where client_id = v_client and period = v_period) then
    select coalesce(c.monthly_fee, 0), coalesce(c.remise, 0), coalesce(nullif(c.payment_day, 0), public.invoice_due_day())
      into v_fee, v_remise, v_day
    from public.clients c where id = v_client;

    insert into public.invoices (client_id, period, amount_due, due_date)
    values (
      v_client,
      v_period,
      round(v_fee * (1 - v_remise / 100), 2),
      (to_date(v_period || '-01', 'YYYY-MM-DD') + (least(coalesce(v_day, 5), 28) - 1) * interval '1 day')::date
    )
    on conflict (client_id, period) do nothing;
  end if;

  perform public.recompute_invoice(v_client, v_period);

  if tg_op = 'UPDATE' and to_char(old.date, 'YYYY-MM') <> v_period then
    perform public.recompute_invoice(old.client_id, to_char(old.date, 'YYYY-MM'));
  end if;

  return null;
end;
$$;
