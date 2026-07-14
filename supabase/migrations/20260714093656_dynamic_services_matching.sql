-- Add subscribed_services column (may already exist from failed migration)
alter table public.clients
  add column if not exists subscribed_services jsonb;

-- Drop not-null in case it was set from a previous attempt
alter table public.clients
  alter column subscribed_services drop not null;

-- Fill existing nulls
update public.clients set subscribed_services = '[]'::jsonb where subscribed_services is null;

-- Now add the not-null constraint
alter table public.clients
  alter column subscribed_services set not null,
  alter column subscribed_services set default '[]'::jsonb;

-- Migrate data: populate subscribed_services from boolean columns
update public.clients
set subscribed_services = (
  select coalesce(jsonb_agg(svc->>'name'), '[]'::jsonb)
  from jsonb_array_elements(
    coalesce(
      (select value from public.settings where key = 'services'),
      '[]'::jsonb
    )
  ) as svc
  where
    (svc->>'name' = 'Transport scolaire' and clients.transport)
    or (svc->>'name' = 'Cantine' and clients.cantine)
    or (svc->>'name' = 'Garderie' and clients.garderie)
    or (svc->>'name' ilike '%activité%' and clients.activites)
)
where subscribed_services = '[]'::jsonb;

-- Updated recalc function: generic matching via subscribed_services
create or replace function public.recalc_client_debt(p_client_id uuid)
returns void as $$
declare
  v_level_fee   numeric;
  v_services    jsonb;
  v_service_sum numeric := 0;
  v_discount    numeric := 0;
  v_expected    numeric;
  v_paid        numeric;
  v_gross       numeric;
  v_payment_day int;
  v_grace_days  int;
  v_due_date    date;
  v_today       date := current_date;
  v_subs        jsonb;
  v_svc         jsonb;
begin
  -- Level base fee
  select coalesce(l.monthly_fee, 0) into v_level_fee
  from public.clients c
  left join public.levels l on l.name = c.level
  where c.id = p_client_id;

  -- Service prices from settings
  select value into v_services
  from public.settings
  where key = 'services';

  -- Subscribed services for this client
  select subscribed_services into v_subs
  from public.clients
  where id = p_client_id;

  -- Sum prices of subscribed services that are enabled
  if v_services is not null and jsonb_typeof(v_services) = 'array'
     and v_subs is not null and jsonb_typeof(v_subs) = 'array' then
    for v_svc in select * from jsonb_array_elements(v_services)
    loop
      if (v_svc->>'enabled')::boolean
         and exists (
           select 1 from jsonb_array_elements_text(v_subs) as sub
           where sub = v_svc->>'name'
         ) then
        v_service_sum := v_service_sum + coalesce((v_svc->>'price')::numeric, 0);
      end if;
    end loop;
  end if;

  -- Sibling discount percentage from settings
  select coalesce(
    (select (value->>'value')::numeric
     from public.settings
     where key = 'sibling_discount' and (value->>'enabled')::boolean),
    0
  ) into v_discount;

  -- Gross = level fee + service prices
  v_gross := v_level_fee + v_service_sum;
  -- Apply discount
  v_expected := round(v_gross * (1 - v_discount / 100), 2);

  -- Total payments received
  select coalesce(sum(amount), 0) into v_paid
  from public.payments where client_id = p_client_id;

  -- Payment due date (from settings, default day=5, grace=5)
  select coalesce((value->>'day')::int, 5), coalesce((value->>'grace_days')::int, 5)
  into v_payment_day, v_grace_days
  from public.settings where key = 'payment_due';

  v_due_date := make_date(
    extract(year from v_today)::int,
    extract(month from v_today)::int,
    least(v_payment_day, 28)
  ) + v_grace_days;

  -- Update client with computed values
  update public.clients
  set
    monthly_fee = v_expected,
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
