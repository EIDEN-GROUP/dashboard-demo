-- ============================================================================
-- Rename payment_status 'impaye' → 'en_attente' everywhere
-- ============================================================================

-- ── 1. clients.payment_status ────────────────────────────────────────────────
alter table public.clients
  drop constraint if exists clients_payment_status_check;

update public.clients
  set payment_status = 'en_attente'
  where payment_status = 'impaye';

alter table public.clients
  add constraint clients_payment_status_check
    check (payment_status in ('en_attente', 'paye', 'retard'));

alter table public.clients
  alter column payment_status set default 'en_attente';

-- ── 2. invoices.status ────────────────────────────────────────────────────────
alter table public.invoices
  drop constraint if exists invoices_status_check;

update public.invoices
  set status = 'en_attente'
  where status = 'impaye';

alter table public.invoices
  add constraint invoices_status_check
    check (status in ('en_attente', 'paye', 'retard'));

alter table public.invoices
  alter column status set default 'en_attente';

-- ── 3. recalc_client_debt (currently in 20260714170000) ───────────────────────
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
  select child_names, level, subscribed_services, coalesce(remise, 0)
  into v_child_names, v_level, v_subs, v_remise
  from public.clients
  where id = p_client_id;

  select value into v_services from public.settings where key = 'services';
  select value into v_frais   from public.settings where key = 'frais';

  v_level_fee := 0;
  v_service_sum := 0;
  v_frais_sum := 0;

  if v_child_names is not null and jsonb_typeof(v_child_names) = 'array'
     and jsonb_array_length(v_child_names) > 0 then
    for v_idx in 0 .. jsonb_array_length(v_child_names) - 1 loop
      v_child := v_child_names -> v_idx;

      if v_child ? 'level' then
        select coalesce(monthly_fee, 0) into v_lv_fee
        from public.levels where name = v_child->>'level';
        v_level_fee := v_level_fee + coalesce(v_lv_fee, 0);
      end if;

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

  v_expected := round((v_level_fee + v_service_sum + v_frais_sum) * (1 - v_remise / 100), 2);

  select coalesce(sum(amount), 0) into v_paid
  from public.payments where client_id = p_client_id;

  select coalesce((value->>'day')::int, 5), coalesce((value->>'grace_days')::int, 5)
  into v_payment_day, v_grace_days
  from public.settings where key = 'payment_due';

  v_due_date := make_date(
    extract(year from v_today)::int,
    extract(month from v_today)::int,
    least(v_payment_day, 28)
  ) + v_grace_days;

  update public.clients
  set
    debt = greatest(0, v_expected - v_paid),
    payment_status = case
      when v_paid >= v_expected then 'paye'
      when v_today > v_due_date and v_paid < v_expected then 'retard'
      else 'en_attente'
    end,
    overdue = case when v_paid < v_expected and v_today > v_due_date then true else false end
  where id = p_client_id;
end;
$$ language plpgsql security definer;

-- ── 4. invoice_status helper ──────────────────────────────────────────────────
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
    else 'en_attente'
  end;
$$;
