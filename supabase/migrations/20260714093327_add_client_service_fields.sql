-- Add service subscription columns to clients
alter table public.clients
  add column if not exists transport  boolean not null default false,
  add column if not exists cantine    boolean not null default false,
  add column if not exists garderie   boolean not null default false,
  add column if not exists activites  boolean not null default false,
  add column if not exists fratrie    int not null default 1,
  add column if not exists remise     numeric(5,2) not null default 0;

-- Store services as an array under the "services" key
insert into public.settings (key, value) values
  ('services', '[
    {"name":"Transport scolaire","price":300,"enabled":true},
    {"name":"Cantine","price":250,"enabled":true},
    {"name":"Garderie","price":200,"enabled":true},
    {"name":"Activités extrascolaires","price":150,"enabled":true}
  ]'::jsonb)
on conflict (key) do nothing;

-- Update payment_status check constraint to include "retard"
alter table public.clients
  drop constraint if exists clients_payment_status_check;
alter table public.clients
  add constraint clients_payment_status_check
    check (payment_status in ('impaye','paye','retard'));

-- Updated recalc function that considers calculated monthly fee
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

  if v_services is not null and jsonb_typeof(v_services) = 'array' then
    with client_svc as (
      select unset, svc
      from public.clients c
      cross join lateral jsonb_array_elements(v_services) as svc
      where c.id = p_client_id
        and (
          (svc->>'name' = 'Transport scolaire' and c.transport)
          or (svc->>'name' = 'Cantine' and c.cantine)
          or (svc->>'name' = 'Garderie' and c.garderie)
          or (svc->>'name' = 'Activités extrascolaires' and c.activites)
        )
        and (svc->>'enabled')::boolean
    )
    select coalesce(sum((svc->>'price')::numeric), 0) into v_service_sum
    from client_svc;

    -- Fallback: if the service name doesn't match, try matching by label
    if v_service_sum = 0 then
      select coalesce(sum(
        case
          when c.transport and (svc->>'name') ilike '%transport%' and (svc->>'enabled')::boolean then (svc->>'price')::numeric
          when c.cantine and (svc->>'name') ilike '%cantine%' and (svc->>'enabled')::boolean then (svc->>'price')::numeric
          when c.garderie and (svc->>'name') ilike '%garderie%' and (svc->>'enabled')::boolean then (svc->>'price')::numeric
          when c.activites and (svc->>'name') ilike '%activité%' and (svc->>'enabled')::boolean then (svc->>'price')::numeric
          else 0
        end
      ), 0) into v_service_sum
      from public.clients c
      cross join lateral jsonb_array_elements(v_services) as svc
      where c.id = p_client_id;
    end if;
  end if;

  -- Sibling discount
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

  -- Total payments
  select coalesce(sum(amount), 0) into v_paid
  from public.payments where client_id = p_client_id;

  -- Payment due date
  select coalesce((value->>'day')::int, 5), coalesce((value->>'grace_days')::int, 5)
  into v_payment_day, v_grace_days
  from public.settings where key = 'payment_due';

  v_due_date := make_date(
    extract(year from v_today)::int,
    extract(month from v_today)::int,
    least(v_payment_day, 28)
  ) + v_grace_days;

  -- Update client
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

