-- ============================================================================
-- Real‑time support chat between dashboard admins and superadmins
-- ============================================================================

-- ── 1. support_sessions ──────────────────────────────────────────────────────
create table if not exists public.support_sessions (
  id         uuid primary key default gen_random_uuid(),
  center_id  uuid references public.centers(id) on delete set null,
  admin_id   uuid references auth.users(id) on delete set null,
  admin_name text not null default '',
  status     text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_support_sessions_status
  on public.support_sessions(status);
create index if not exists idx_support_sessions_admin
  on public.support_sessions(admin_id);

-- ── 2. support_messages ──────────────────────────────────────────────────────
create table if not exists public.support_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.support_sessions(id) on delete cascade,
  sender_id   uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('admin', 'superadmin')),
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_support_messages_session
  on public.support_messages(session_id);

-- ── 3. Realtime ─────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.support_messages;

-- ── 4. RLS ──────────────────────────────────────────────────────────────────
alter table public.support_sessions enable row level security;
alter table public.support_messages enable row level security;

-- support_sessions policies
create policy "admins read own sessions"
  on public.support_sessions for select
  using (auth.uid() = admin_id);

create policy "superadmins read all sessions"
  on public.support_sessions for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'superadmin'));

create policy "admins insert sessions"
  on public.support_sessions for insert
  with check (auth.uid() = admin_id);

create policy "superadmins update sessions"
  on public.support_sessions for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'superadmin'));

-- support_messages policies
create policy "participants read messages"
  on public.support_messages for select
  using (
    exists (select 1 from public.support_sessions where id = session_id and admin_id = auth.uid())
    or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'superadmin')
  );

create policy "admins insert messages"
  on public.support_messages for insert
  with check (
    sender_role = 'admin'
    and auth.uid() = sender_id
    and exists (select 1 from public.support_sessions where id = session_id and admin_id = auth.uid())
  );

create policy "superadmins insert messages"
  on public.support_messages for insert
  with check (
    sender_role = 'superadmin'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'superadmin')
  );
