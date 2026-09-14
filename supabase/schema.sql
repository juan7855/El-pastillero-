-- ============================================================
--  Y2K STREET HUB — esquema Supabase
--  Pegar TODO esto en: Supabase Dashboard > SQL Editor > New query > Run
--  Es idempotente: se puede correr más de una vez sin romper nada.
-- ============================================================

-- ---------- TASKS ----------
create table if not exists public.tasks (
  id       text primary key,
  user_id  uuid not null references auth.users (id) on delete cascade,
  title    text not null,
  done     boolean not null default false,
  priority text not null default 'mid' check (priority in ('low', 'mid', 'high')),
  tag      text not null default '',
  created  bigint not null,
  due      date
);

-- ---------- EVENTS ----------
create table if not exists public.events (
  id      text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date    date not null,
  -- HH:MM como texto: el tipo `time` de Postgres devolvería "HH:MM:SS"
  time    text not null default '',
  title   text not null,
  tag     text not null default ''
);

-- ---------- NOTES ----------
create table if not exists public.notes (
  id      text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title   text not null default '',
  body    text not null default '',
  color   text not null default 'bone' check (color in ('acid', 'ice', 'blood', 'gold', 'violet', 'bone')),
  pinned  boolean not null default false,
  updated bigint not null
);

-- ---------- SETTINGS (una fila por usuario) ----------
create table if not exists public.settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  handle  text not null default 'operator',
  status  text not null default 'on grind mode',
  accent  text not null default 'acid' check (accent in ('acid', 'ice', 'blood', 'gold', 'violet')),
  clock24 boolean not null default false,
  sfx     boolean not null default true,
  motion  boolean not null default true
);

-- ---------- Índices ----------
create index if not exists tasks_user_id_idx  on public.tasks  (user_id);
create index if not exists events_user_id_idx on public.events (user_id);
create index if not exists notes_user_id_idx  on public.notes  (user_id);

-- ============================================================
--  ROW LEVEL SECURITY
--  Sin esto, cualquiera con la anon key podría leer datos ajenos.
-- ============================================================
alter table public.tasks    enable row level security;
alter table public.events   enable row level security;
alter table public.notes    enable row level security;
alter table public.settings enable row level security;

-- tasks
drop policy if exists "tasks: owner select" on public.tasks;
drop policy if exists "tasks: owner insert" on public.tasks;
drop policy if exists "tasks: owner update" on public.tasks;
drop policy if exists "tasks: owner delete" on public.tasks;
create policy "tasks: owner select" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks: owner insert" on public.tasks for insert with check (auth.uid() = user_id);
create policy "tasks: owner update" on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks: owner delete" on public.tasks for delete using (auth.uid() = user_id);

-- events
drop policy if exists "events: owner select" on public.events;
drop policy if exists "events: owner insert" on public.events;
drop policy if exists "events: owner update" on public.events;
drop policy if exists "events: owner delete" on public.events;
create policy "events: owner select" on public.events for select using (auth.uid() = user_id);
create policy "events: owner insert" on public.events for insert with check (auth.uid() = user_id);
create policy "events: owner update" on public.events for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "events: owner delete" on public.events for delete using (auth.uid() = user_id);

-- notes
drop policy if exists "notes: owner select" on public.notes;
drop policy if exists "notes: owner insert" on public.notes;
drop policy if exists "notes: owner update" on public.notes;
drop policy if exists "notes: owner delete" on public.notes;
create policy "notes: owner select" on public.notes for select using (auth.uid() = user_id);
create policy "notes: owner insert" on public.notes for insert with check (auth.uid() = user_id);
create policy "notes: owner update" on public.notes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes: owner delete" on public.notes for delete using (auth.uid() = user_id);

-- settings
drop policy if exists "settings: owner select" on public.settings;
drop policy if exists "settings: owner insert" on public.settings;
drop policy if exists "settings: owner update" on public.settings;
drop policy if exists "settings: owner delete" on public.settings;
create policy "settings: owner select" on public.settings for select using (auth.uid() = user_id);
create policy "settings: owner insert" on public.settings for insert with check (auth.uid() = user_id);
create policy "settings: owner update" on public.settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "settings: owner delete" on public.settings for delete using (auth.uid() = user_id);
