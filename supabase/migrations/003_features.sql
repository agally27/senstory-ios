-- Senstory4 — Migration 003
-- Adds: quick tags on events, visual symbols library, social stories.

-- Quick tags on observation events (e.g. "off school", "screen time")
alter table observation_events add column if not exists quick_tags text[] not null default '{}';

-- =========================================================================
-- visual_symbols — symbol / emotion library per child
-- =========================================================================
create table if not exists visual_symbols (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid not null references children on delete cascade,
  label      text not null,
  emoji      text not null default '',
  image_url  text,
  category   text not null default 'general',
  created_at timestamptz not null default now()
);

alter table visual_symbols enable row level security;

drop policy if exists "Owner can manage symbols" on visual_symbols;
create policy "Owner can manage symbols"
  on visual_symbols for all
  using (
    exists (select 1 from children
      where children.id = visual_symbols.child_id
        and children.owner_id = auth.uid())
  );

create index if not exists visual_symbols_child_idx on visual_symbols (child_id);

-- =========================================================================
-- stories — social stories (settings + generated/edited pages)
-- =========================================================================
create table if not exists stories (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid not null references children on delete cascade,
  title      text not null,
  goal       text not null default '',
  status     text not null default 'draft',          -- draft | active | archived
  favourite  boolean not null default false,
  style      text not null default 'balanced',        -- text_focused | balanced | image_rich
  display    text not null default 'page',            -- page | scroll
  length     text not null default 'medium',          -- short | medium | long
  perspective text not null default 'first',
  tone       text not null default '',
  language_level text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table stories enable row level security;

drop policy if exists "Owner can manage stories" on stories;
create policy "Owner can manage stories"
  on stories for all
  using (
    exists (select 1 from children
      where children.id = stories.child_id
        and children.owner_id = auth.uid())
  );

create index if not exists stories_child_idx on stories (child_id);

create table if not exists story_pages (
  id        uuid primary key default gen_random_uuid(),
  story_id  uuid not null references stories on delete cascade,
  "order"   int not null,
  heading   text not null default '',
  text      text not null default '',
  image_url text,
  unique (story_id, "order")
);

alter table story_pages enable row level security;

drop policy if exists "Owner can manage story pages" on story_pages;
create policy "Owner can manage story pages"
  on story_pages for all
  using (
    exists (
      select 1 from stories
      join children on children.id = stories.child_id
      where stories.id = story_pages.story_id
        and children.owner_id = auth.uid()
    )
  );
