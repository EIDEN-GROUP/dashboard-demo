-- Add salary, leave_start, leave_end columns to employees table
alter table public.employees
  add column if not exists salary numeric(10,2) not null default 0,
  add column if not exists leave_start date,
  add column if not exists leave_end date;
