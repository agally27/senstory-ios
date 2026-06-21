-- Senstory4 — Initial schema
-- Run this in the Supabase SQL editor (or via supabase db push).
-- Row-level security is enabled on every table so each parent can only see their own data.

-- =========================================================================
-- Enums
-- =========================================================================

create type observation_type as enum (
  'calm_moment', 'sensory_overwhelm', 'meltdown', 'shutdown', 'anxiety',
  'transition_difficulty', 'demand_avoidance', 'sleep', 'food', 'school',
  'medical', 'toileting', 'social', 'strategy_used', 'story_used', 'custom_note'
);

create type event_outcome as enum ('improved', 'no_change', 'worsened', 'unknown');

create type insight_status as enum ('pending', 'confirmed', 'rejected', 'archived');

-- =========================================================================
-- user_profiles (mirrors auth.users, created via trigger below)
-- =========================================================================

create table user_profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text not null unique,
  name        text not null default '',
  timezone    text not null default 'Europe/London',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table user_profiles enable row level security;

create policy "Users can read their own profile"
  on user_profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on user_profiles for update using (auth.uid() = id);

-- Auto-create profile on sign-up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into user_profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- =========================================================================
-- children
-- =========================================================================

create table children (
  id                   uuid primary key default gen_random_uuid(),
  owner_id             uuid not null references user_profiles on delete cascade,
  name                 text not null,
  date_of_birth        date,
  about_me             text not null default '',
  strengths_interests  text not null default '',
  communication_notes  text not null default '',
  sensory_needs        text not null default '',
  signs_of_distress    text not null default '',
  what_helps           text not null default '',
  what_to_avoid        text not null default '',
  school_care_notes    text not null default '',
  emergency_regulation text not null default '',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table children enable row level security;

create policy "Owners can manage their children"
  on children for all using (auth.uid() = owner_id);

create index children_owner_id_idx on children (owner_id);

-- =========================================================================
-- observation_events
-- =========================================================================

create table observation_events (
  id                 uuid primary key default gen_random_uuid(),
  child_id           uuid not null references children on delete cascade,
  created_by_id      uuid not null references user_profiles on delete restrict,
  type               observation_type not null,
  occurred_at        timestamptz not null,
  duration_minutes   integer,
  location           text,
  intensity          smallint check (intensity between 1 and 5),
  regulation_before  smallint check (regulation_before between 1 and 5),
  regulation_after   smallint check (regulation_after between 1 and 5),
  triggers           text[] not null default '{}',
  sensory_factors    text[] not null default '{}',
  strategies_tried   text[] not null default '{}',
  outcome            event_outcome not null default 'unknown',
  notes              text not null default '',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table observation_events enable row level security;

-- Only the child's owner can read/write events (extend later for care team)
create policy "Owner can manage child events"
  on observation_events for all
  using (
    exists (
      select 1 from children
      where children.id = observation_events.child_id
        and children.owner_id = auth.uid()
    )
  );

create index obs_events_child_occurred_idx on observation_events (child_id, occurred_at desc);
create index obs_events_child_type_idx on observation_events (child_id, type);

-- =========================================================================
-- daily_check_ins
-- =========================================================================

create table daily_check_ins (
  id             uuid primary key default gen_random_uuid(),
  child_id       uuid not null references children on delete cascade,
  created_by_id  uuid not null references user_profiles on delete restrict,
  date           date not null,
  regulation     smallint check (regulation between 1 and 5),
  sleep          smallint check (sleep between 1 and 5),
  mood           smallint check (mood between 1 and 5),
  notes          text not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (child_id, date)
);

alter table daily_check_ins enable row level security;

create policy "Owner can manage check-ins"
  on daily_check_ins for all
  using (
    exists (
      select 1 from children
      where children.id = daily_check_ins.child_id
        and children.owner_id = auth.uid()
    )
  );

create index daily_check_ins_child_date_idx on daily_check_ins (child_id, date desc);

-- =========================================================================
-- insights  (written by Edge Functions, reviewed by parent)
-- =========================================================================

create table insights (
  id               uuid primary key default gen_random_uuid(),
  child_id         uuid not null references children on delete cascade,
  claim            text not null,
  confidence       real not null check (confidence between 0 and 1),
  data_limitations text not null default '',
  suggested_action text not null default '',
  safety_caveat    text not null default '',
  status           insight_status not null default 'pending',
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table insights enable row level security;

create policy "Owner can read and review insights"
  on insights for all
  using (
    exists (
      select 1 from children
      where children.id = insights.child_id
        and children.owner_id = auth.uid()
    )
  );

create index insights_child_status_idx on insights (child_id, status);
