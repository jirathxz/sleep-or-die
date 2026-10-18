-- ========================================================
-- SleepOrDie Supabase Database Schema & Realtime Setup
-- ========================================================

-- 1. Create table: sleep_profiles (Realtime sync for user stats)
create table if not exists public.sleep_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text,
    name text,
    current_hp integer default 100 check (current_hp >= 0 and current_hp <= 100),
    wake_up_time text default '07:00',
    sleep_target_time text default '23:15',
    shutdown_stacks integer default 0,
    days_survived integer default 0,
    tickets_count integer default 1,
    is_disabled boolean default false,
    last_idle_seconds integer default 0,
    last_sleep_confirmed_at timestamptz,
    discord_user_id text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. Create table: sleep_events (Realtime event log for alerts and shutdown progress)
create table if not exists public.sleep_events (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    event_type text not null, -- 'alert_30m', 'lockdown_15m', 'curfew_breached', 'hp_drain', 'disciplinary_lock', 'shutdown_executed'
    message text,
    payload jsonb default '{}'::jsonb,
    created_at timestamptz default now()
);

-- 3. Enable Row Level Security (RLS)
alter table public.sleep_profiles enable row level security;
alter table public.sleep_events enable row level security;

-- 4. RLS Policies for sleep_profiles
create policy "Users can read own sleep profile"
    on public.sleep_profiles for select
    using (auth.uid() = id);

create policy "Users can update own sleep profile"
    on public.sleep_profiles for update
    using (auth.uid() = id);

create policy "Users can insert own sleep profile"
    on public.sleep_profiles for insert
    with check (auth.uid() = id);

-- 5. RLS Policies for sleep_events
create policy "Users can read own sleep events"
    on public.sleep_events for select
    using (auth.uid() = user_id);

create policy "Users can insert own sleep events"
    on public.sleep_events for insert
    with check (auth.uid() = user_id);

-- 6. Realtime Publication Setup
-- Enable Realtime replication for both tables
alter publication supabase_realtime add table public.sleep_profiles;
alter publication supabase_realtime add table public.sleep_events;

-- Set replica identity to full so update payloads include full records
alter table public.sleep_profiles replica identity full;
alter table public.sleep_events replica identity full;

-- 7. Trigger to automatically provision sleep_profile when user registers via Supabase Auth
create or replace function public.handle_new_sleep_user()
returns trigger as $$
begin
    insert into public.sleep_profiles (
        id,
        email,
        name,
        current_hp,
        wake_up_time,
        sleep_target_time,
        days_survived,
        tickets_count
    ) values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        100,
        '07:00',
        '23:15',
        0,
        1
    )
    on conflict (id) do nothing;
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_sleep on auth.users;
create trigger on_auth_user_created_sleep
    after insert on auth.users
    for each row execute function public.handle_new_sleep_user();
