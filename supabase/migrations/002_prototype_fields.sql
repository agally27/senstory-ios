-- Senstory4 — Migration 002
-- Adds child photo support and widens the daily check-in scale to 1–10
-- to match the prototype's wellbeing loggers (Regulation / Sleep / Mood).

-- Child photo (stored as a public URL or Supabase storage URL)
alter table children add column if not exists photo_url text;

-- Widen check-in metrics from 1–5 to 1–10
alter table daily_check_ins drop constraint if exists daily_check_ins_regulation_check;
alter table daily_check_ins drop constraint if exists daily_check_ins_sleep_check;
alter table daily_check_ins drop constraint if exists daily_check_ins_mood_check;

alter table daily_check_ins add constraint daily_check_ins_regulation_check
  check (regulation between 1 and 10);
alter table daily_check_ins add constraint daily_check_ins_sleep_check
  check (sleep between 1 and 10);
alter table daily_check_ins add constraint daily_check_ins_mood_check
  check (mood between 1 and 10);

-- Emotion check-ins — the child-facing "how are you feeling?" picker
create table if not exists emotion_check_ins (
  id            uuid primary key default gen_random_uuid(),
  child_id      uuid not null references children on delete cascade,
  created_by_id uuid not null references user_profiles on delete restrict,
  emotion       text not null,
  date          date not null default current_date,
  created_at    timestamptz not null default now()
);

alter table emotion_check_ins enable row level security;

drop policy if exists "Owner can manage emotion check-ins" on emotion_check_ins;
create policy "Owner can manage emotion check-ins"
  on emotion_check_ins for all
  using (
    exists (
      select 1 from children
      where children.id = emotion_check_ins.child_id
        and children.owner_id = auth.uid()
    )
  );

create index if not exists emotion_check_ins_child_date_idx
  on emotion_check_ins (child_id, date desc);
